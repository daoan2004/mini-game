'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useGameStore } from '../../stores/gameStore';
import { 
  saveGame, 
  loadGame, 
  getAllSaveSlots, 
  deleteSave, 
  exportSave, 
  importSave,
  hasAutoSave,
  loadAutoSave,
  SaveSlot 
} from '../../utils/saveGame';
import { useNotification } from '../ui/NotificationSystem';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
}

export default function SaveLoadModal({ isOpen, onClose, mode }: SaveLoadModalProps) {
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [activeTab, setActiveTab] = useState<'slots' | 'import-export'>('slots');

  const gameState = useGameStore.getState();
  const { showToast } = useGameStore();
  const { showConfirm } = useNotification();

  useEffect(() => {
    if (isOpen) {
      setSaveSlots(getAllSaveSlots());
      setPlayerName('Thám tử');
    }
  }, [isOpen]);

  const handleSave = async (slotId: string) => {
    if (!playerName.trim()) {
      showToast('⚠️ Lỗi', 'Vui lòng nhập tên người chơi', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      saveGame(slotId, gameState, playerName.trim(), 0);
      setSaveSlots(getAllSaveSlots());
      showToast('✅ Đã lưu', `Game đã được lưu vào Slot ${slotId}`, 'success');
      onClose();
    } catch (error) {
      showToast('❌ Lỗi', error instanceof Error ? error.message : 'Không thể lưu game', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async (slotId: string) => {
    setIsLoading(true);
    try {
      const saveData = loadGame(slotId);
      if (!saveData) {
        showToast('⚠️ Lỗi', 'Không tìm thấy dữ liệu lưu', 'warning');
        return;
      }

      // Load state into game store
      const store = useGameStore.getState();
      Object.assign(store, saveData.gameState);
      
      showToast('✅ Đã tải', `Game đã được tải từ Slot ${slotId}`, 'success');
      onClose();
    } catch (error) {
      showToast('❌ Lỗi', error instanceof Error ? error.message : 'Không thể tải game', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    await showConfirm({
      title: 'Xóa Save Game',
      message: 'Bạn có chắc chắn muốn xóa save này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      danger: true,
      onConfirm: () => {
        deleteSave(slotId);
        setSaveSlots(getAllSaveSlots());
        showToast('🗑️ Đã xóa', `Slot ${slotId} đã được xóa`, 'info');
      }
    });
  };

  const handleExport = (slotId: string) => {
    const data = exportSave(slotId);
    if (data) {
      setExportData(data);
      showToast('📤 Xuất thành công', 'Copy mã để chia sẻ', 'success');
    } else {
      showToast('❌ Lỗi', 'Không thể xuất save', 'error');
    }
  };

  const handleImport = () => {
    if (!importData.trim() || !selectedSlot) {
      showToast('⚠️ Lỗi', 'Vui lòng nhập mã import và chọn slot', 'warning');
      return;
    }

    if (importSave(selectedSlot, importData.trim())) {
      setSaveSlots(getAllSaveSlots());
      setImportData('');
      showToast('📥 Import thành công', `Đã import vào Slot ${selectedSlot}`, 'success');
    } else {
      showToast('❌ Lỗi', 'Mã import không hợp lệ', 'error');
    }
  };

  const handleAutoLoad = () => {
    const autoSave = loadAutoSave();
    if (autoSave) {
      const store = useGameStore.getState();
      Object.assign(store, autoSave.gameState);
      showToast('✅ Đã tải', 'Đã tải từ auto-save', 'success');
      onClose();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={mode === 'save' ? '💾 Lưu Game' : '📂 Tải Game'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Auto-save section */}
        {mode === 'load' && hasAutoSave() && (
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-400">🔄 Tự động lưu</h3>
                <p className="text-sm text-blue-300">Tiếp tục game từ lần chơi gần nhất</p>
              </div>
              <button
                onClick={handleAutoLoad}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Tải Auto-Save
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('slots')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'slots' 
                ? 'bg-slate-600 text-white' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            📁 Save Slots
          </button>
          <button
            onClick={() => setActiveTab('import-export')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'import-export' 
                ? 'bg-slate-600 text-white' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            📤 Import/Export
          </button>
        </div>

        {/* Save Slots Tab */}
        {activeTab === 'slots' && (
          <div className="space-y-4">
            {/* Player Name Input (Save mode only) */}
            {mode === 'save' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tên người chơi:
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nhập tên của bạn..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  maxLength={20}
                />
              </div>
            )}

            {/* Save Slots */}
            <div className="space-y-3">
              {saveSlots.map((slot) => (
                <div 
                  key={slot.id}
                  className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-white">{slot.name}</h3>
                        {slot.lastSaved > 0 && (
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getProgressColor(slot.preview.progress)}`} />
                            <span className="text-xs text-slate-400">{slot.preview.progress}%</span>
                          </div>
                        )}
                      </div>
                      
                      {slot.lastSaved > 0 ? (
                        <div className="mt-1 text-sm text-slate-400">
                          <p>📅 {formatDate(slot.lastSaved)}</p>
                          <p>🔍 {slot.preview.evidenceCount} bằng chứng • 📍 {slot.preview.currentRoom}</p>
                          {slot.preview.suspectedCharacter && (
                            <p>🎯 Nghi ngờ: {slot.preview.suspectedCharacter}</p>
                          )}
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-slate-500">Slot trống</p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {mode === 'save' ? (
                        <button
                          onClick={() => handleSave(slot.id)}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          {isLoading ? '⏳' : '💾'} Lưu
                        </button>
                      ) : (
                        slot.lastSaved > 0 && (
                          <>
                            <button
                              onClick={() => handleLoad(slot.id)}
                              disabled={isLoading}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm"
                            >
                              {isLoading ? '⏳' : '📂'} Tải
                            </button>
                            <button
                              onClick={() => handleExport(slot.id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm"
                              title="Xuất save"
                            >
                              📤
                            </button>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                              title="Xóa save"
                            >
                              🗑️
                            </button>
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import/Export Tab */}
        {activeTab === 'import-export' && (
          <div className="space-y-6">
            {/* Export Section */}
            {exportData && (
              <div>
                <h3 className="font-medium text-slate-300 mb-2">📤 Mã Export:</h3>
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                  <textarea
                    value={exportData}
                    readOnly
                    className="w-full bg-transparent text-sm text-slate-300 resize-none h-20"
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(exportData);
                      showToast('📋 Đã copy', 'Mã đã được copy vào clipboard', 'success');
                    }}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            )}

            {/* Import Section */}
            <div>
              <h3 className="font-medium text-slate-300 mb-2">📥 Import Save:</h3>
              <div className="space-y-3">
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Dán mã import vào đây..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none h-20 resize-none"
                />
                
                <div className="flex space-x-3">
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white flex-1"
                  >
                    <option value="">Chọn slot...</option>
                    {saveSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        Slot {slot.id} {slot.lastSaved > 0 ? '(Có dữ liệu)' : '(Trống)'}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={handleImport}
                    disabled={!importData.trim() || !selectedSlot}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg"
                  >
                    📥 Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
} 