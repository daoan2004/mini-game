'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getAliveCharacters } from '../../data/characters';
import { getAllEvidence } from '../../data/evidence';
import { getAllRooms } from '../../data/rooms';
import Modal from '../ui/Modal';
import { Character, Evidence } from '../../types/game';
import { useNotification } from '../ui/NotificationSystem';

interface DeductionBoardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Room {
  id: string;
  name: string;
  description?: string;
}

interface BoardItem {
  id: string;
  type: 'character' | 'evidence' | 'room' | 'theory';
  position: { x: number; y: number };
  data: Character | Evidence | Room | Theory;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'suspects' | 'found_in' | 'motive' | 'alibi' | 'contradicts' | 'supports';
  note: string;
  strength: number; // 1-5 confidence level
}

interface Theory {
  id: string;
  title: string;
  description: string;
  confidence: number;
  evidence: string[];
  suspects: string[];
}

export default function DeductionBoard({ isOpen, onClose }: DeductionBoardProps) {
  const gameState = useGameStore();
  const boardRef = useRef<HTMLDivElement>(null);
  const { showConfirm } = useNotification();
  
  // Board state
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [theories, setTheories] = useState<Theory[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionType, setConnectionType] = useState<Connection['type']>('supports');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'theories' | 'timeline'>('board');

  // Initialize board with discovered items
  useEffect(() => {
    if (isOpen && boardItems.length === 0) {
      initializeBoard();
    }
  }, [isOpen]);

  const initializeBoard = () => {
    const items: BoardItem[] = [];
    let yOffset = 50;
    const spacing = 200;

    // Add discovered evidence
    const discoveredEvidence = getAllEvidence().filter(e => 
      gameState.evidenceFound.includes(e.id)
    );
    discoveredEvidence.forEach((evidence, index) => {
      items.push({
        id: evidence.id,
        type: 'evidence',
        position: { x: 50 + (index % 4) * spacing, y: yOffset },
        data: evidence
      });
    });

    yOffset += 150;

    // Add characters
    const characters = getAliveCharacters();
    characters.forEach((character, index) => {
      items.push({
        id: character.id,
        type: 'character',
        position: { x: 50 + index * spacing, y: yOffset },
        data: character
      });
    });

    yOffset += 150;

    // Add all rooms (assuming player can access all rooms)
    const rooms = getAllRooms().slice(0, 6);
    rooms.forEach((room, index) => {
      items.push({
        id: room.id,
        type: 'room',
        position: { x: 50 + index * spacing, y: yOffset },
        data: room
      });
    });

    setBoardItems(items);
    loadSavedConnections();
  };

  const loadSavedConnections = () => {
    try {
      const saved = localStorage.getItem('mystery-game-deduction-board');
      if (saved) {
        const data = JSON.parse(saved);
        setConnections(data.connections || []);
        setTheories(data.theories || []);
      }
    } catch (error) {
      console.warn('Failed to load deduction board:', error);
    }
  };

  const saveBoard = () => {
    try {
      const data = {
        connections,
        theories,
        timestamp: Date.now()
      };
      localStorage.setItem('mystery-game-deduction-board', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save deduction board:', error);
    }
  };

  const handleItemDrag = (itemId: string, newPosition: { x: number; y: number }) => {
    setBoardItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, position: newPosition } : item
    ));
  };

  const handleItemClick = (itemId: string) => {
    if (isConnecting) {
      if (selectedItems.includes(itemId)) {
        setSelectedItems(prev => prev.filter(id => id !== itemId));
      } else if (selectedItems.length < 2) {
        setSelectedItems(prev => [...prev, itemId]);
      }
      
      if (selectedItems.length === 1 && !selectedItems.includes(itemId)) {
        // Create connection
        createConnection(selectedItems[0], itemId);
        setSelectedItems([]);
        setIsConnecting(false);
      }
    } else {
      // Single select for details
      setSelectedItems([itemId]);
    }
  };

  const createConnection = (fromId: string, toId: string) => {
    const newConnection: Connection = {
      id: `${fromId}-${toId}-${Date.now()}`,
      from: fromId,
      to: toId,
      type: connectionType,
      note: '',
      strength: 3
    };
    
    setConnections(prev => [...prev, newConnection]);
    saveBoard();
  };

  // Future: updateConnection and deleteConnection functions for editing connections

  const createTheory = () => {
    const newTheory: Theory = {
      id: `theory-${Date.now()}`,
      title: 'Giả thuyết mới',
      description: '',
      confidence: 50,
      evidence: selectedItems.filter(id => 
        boardItems.find(item => item.id === id)?.type === 'evidence'
      ),
      suspects: selectedItems.filter(id => 
        boardItems.find(item => item.id === id)?.type === 'character'
      )
    };
    
    setTheories(prev => [...prev, newTheory]);
    saveBoard();
  };

  const getConnectionPath = (from: BoardItem, to: BoardItem) => {
    const fromCenter = {
      x: from.position.x + 80,
      y: from.position.y + 60
    };
    const toCenter = {
      x: to.position.x + 80,
      y: to.position.y + 60
    };
    
    return `M ${fromCenter.x} ${fromCenter.y} L ${toCenter.x} ${toCenter.y}`;
  };

  const getConnectionColor = (type: Connection['type']) => {
    switch (type) {
      case 'suspects': return '#ef4444'; // red
      case 'found_in': return '#3b82f6'; // blue
      case 'motive': return '#f59e0b'; // amber
      case 'alibi': return '#10b981'; // emerald
      case 'contradicts': return '#ef4444'; // red
      case 'supports': return '#10b981'; // emerald
      default: return '#6b7280'; // gray
    }
  };

  const renderBoardItem = (item: BoardItem) => {
    const isSelected = selectedItems.includes(item.id);
    
    return (
      <div
        key={item.id}
        className={`absolute cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 scale-105' : ''
        }`}
        style={{ left: item.position.x, top: item.position.y }}
        onClick={() => handleItemClick(item.id)}
        draggable
        onDragStart={() => setDraggedItem(item.id)}
        onDragEnd={(e) => {
          if (draggedItem === item.id && boardRef.current) {
            const rect = boardRef.current.getBoundingClientRect();
            const newPosition = {
              x: e.clientX - rect.left - 80,
              y: e.clientY - rect.top - 60
            };
            handleItemDrag(item.id, newPosition);
          }
          setDraggedItem(null);
        }}
      >
        {item.type === 'character' && (
          <div className="w-40 h-24 bg-purple-800/80 border-2 border-purple-500 rounded-lg p-2">
            <div className="text-sm font-semibold text-white">{(item.data as Character).name}</div>
            <div className="text-xs text-purple-200">{(item.data as Character).role}</div>
            <div className="text-xs text-purple-300">
              Trust: {gameState.npcTrust[(item.data as Character).id] || 50}%
            </div>
          </div>
        )}
        
        {item.type === 'evidence' && (
          <div className="w-40 h-24 bg-blue-800/80 border-2 border-blue-500 rounded-lg p-2">
            <div className="text-sm font-semibold text-white">{(item.data as Evidence).name}</div>
            <div className="text-xs text-blue-200">
              {(item.data as Evidence).isRedHerring ? '⚠️ Bằng chứng giả' : '🔍 Bằng chứng'}
            </div>
            {(item.data as Evidence).relatedCharacter && (
              <div className="text-xs text-blue-300">
                → {(item.data as Evidence).relatedCharacter}
              </div>
            )}
          </div>
        )}
        
        {item.type === 'room' && (
          <div className="w-40 h-24 bg-green-800/80 border-2 border-green-500 rounded-lg p-2">
            <div className="text-sm font-semibold text-white">{(item.data as Room).name}</div>
            <div className="text-xs text-green-200">📍 Phòng</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧩 Bảng Suy Luận - Công Cụ Thám Tử">
      <div className="h-[85vh] flex flex-col">
        {/* Welcome Guide for New Users */}
        {boardItems.length === 0 && (
          <div className="mb-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
            <h3 className="font-semibold text-blue-300 mb-2">🎯 Hướng dẫn sử dụng bảng suy luận:</h3>
            <div className="text-sm text-blue-200 space-y-1">
              <p>• Thu thập bằng chứng trong game để items xuất hiện trên bảng</p>
              <p>• Nhấn &ldquo;Tạo kết nối&rdquo; → Chọn loại → Click 2 items để kết nối</p>
              <p>• Sử dụng phân tích AI để tìm manh mối quan trọng</p>
            </div>
          </div>
        )}

        {/* Top Navigation Tabs */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setViewMode('board')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'board' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📋 Bảng suy luận
            </button>
            <button
              onClick={() => setViewMode('theories')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'theories' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              💭 Giả thuyết ({theories.length})
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'timeline' 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ⏰ Timeline
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setIsConnecting(!isConnecting);
                setSelectedItems([]);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all shadow-md ${
                isConnecting 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isConnecting ? '❌ Hủy kết nối' : '🔗 Tạo kết nối'}
            </button>
            
            {selectedItems.length >= 2 && (
              <button
                onClick={createTheory}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all shadow-md animate-pulse"
              >
                💭 Tạo giả thuyết ({selectedItems.length} items)
              </button>
            )}
            
            <button
              onClick={saveBoard}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-all shadow-md"
            >
              💾 Lưu bảng
            </button>
            
            {connections.length > 0 && (
              <button
                onClick={async () => {
                  await showConfirm({
                    title: 'Xóa tất cả kết nối',
                    message: 'Xóa tất cả kết nối? Hành động này không thể hoàn tác.',
                    confirmText: 'Xóa tất cả',
                    cancelText: 'Hủy',
                    danger: true,
                    onConfirm: () => {
                      setConnections([]);
                      saveBoard();
                    }
                  });
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all shadow-md"
              >
                🗑️ Xóa kết nối
              </button>
            )}
          </div>
        </div>

        {/* Connection Type Selector - Enhanced UI */}
        {isConnecting && (
          <div className="mb-4 p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-gray-600">
            <div className="text-center mb-3">
              <h3 className="text-lg font-semibold text-white mb-1">🎯 Chế độ tạo kết nối</h3>
              <p className="text-sm text-gray-300">Chọn loại kết nối, sau đó click 2 items để kết nối chúng</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { 
                  type: 'suspects' as const, 
                  label: '🎯 Nghi ngờ', 
                  desc: 'Nhân vật có thể là hung thủ',
                  color: 'red' 
                },
                { 
                  type: 'found_in' as const, 
                  label: '📍 Tìm thấy tại', 
                  desc: 'Bằng chứng được phát hiện ở đâu',
                  color: 'blue' 
                },
                { 
                  type: 'motive' as const, 
                  label: '💰 Động cơ', 
                  desc: 'Lý do gây án',
                  color: 'yellow' 
                },
                { 
                  type: 'alibi' as const, 
                  label: '✅ Ngoại phạm', 
                  desc: 'Chứng minh vô tội',
                  color: 'green' 
                },
                { 
                  type: 'supports' as const, 
                  label: '✨ Ủng hộ', 
                  desc: 'Hỗ trợ giả thuyết',
                  color: 'emerald' 
                },
                { 
                  type: 'contradicts' as const, 
                  label: '❌ Mâu thuẫn', 
                  desc: 'Bác bỏ giả thuyết',
                  color: 'red' 
                }
              ].map(({ type, label, desc, color }) => (
                <button
                  key={type}
                  onClick={() => setConnectionType(type)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    connectionType === type 
                      ? `bg-${color}-600 border-${color}-400 text-white shadow-lg transform scale-105` 
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs opacity-75 mt-1">{desc}</div>
                </button>
              ))}
            </div>
            
            <div className="mt-3 text-center">
              <div className="text-sm text-gray-400">
                Đã chọn: <span className="font-semibold text-white">
                  {connectionType === 'suspects' && '🎯 Nghi ngờ'}
                  {connectionType === 'found_in' && '📍 Tìm thấy tại'}
                  {connectionType === 'motive' && '💰 Động cơ'}
                  {connectionType === 'alibi' && '✅ Ngoại phạm'}
                  {connectionType === 'supports' && '✨ Ủng hộ'}
                  {connectionType === 'contradicts' && '❌ Mâu thuẫn'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'board' && (
            <div 
              ref={boardRef}
              className="relative w-full h-full bg-gray-900 rounded border overflow-auto"
              style={{ minHeight: '600px', minWidth: '800px' }}
            >
              {/* Grid background */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />
              
              {/* Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connections.map(connection => {
                  const fromItem = boardItems.find(item => item.id === connection.from);
                  const toItem = boardItems.find(item => item.id === connection.to);
                  
                  if (!fromItem || !toItem) return null;
                  
                  return (
                    <g key={connection.id}>
                      <path
                        d={getConnectionPath(fromItem, toItem)}
                        stroke={getConnectionColor(connection.type)}
                        strokeWidth={Math.max(1, connection.strength)}
                        strokeDasharray={connection.type === 'contradicts' ? '5,5' : '0'}
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill={getConnectionColor(connection.type)}
                          />
                        </marker>
                      </defs>
                    </g>
                  );
                })}
              </svg>
              
              {/* Board Items */}
              {boardItems.map(renderBoardItem)}
              
              {/* Enhanced Instructions for Empty Board */}
              {boardItems.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <div className="text-6xl mb-6 animate-bounce">🕵️‍♂️</div>
                    <h3 className="text-xl font-semibold text-white mb-4">Bắt đầu điều tra!</h3>
                    <div className="text-gray-300 space-y-2 mb-6">
                      <p className="text-sm">Bảng suy luận của bạn đang trống.</p>
                      <p className="text-sm">Hãy:</p>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4 text-left space-y-3">
                      <div className="flex items-center text-blue-300">
                        <span className="text-lg mr-3">🔍</span>
                        <span className="text-sm">Tìm kiếm bằng chứng trong các phòng</span>
                      </div>
                      <div className="flex items-center text-purple-300">
                        <span className="text-lg mr-3">💬</span>
                        <span className="text-sm">Nói chuyện với các nhân vật</span>
                      </div>
                      <div className="flex items-center text-yellow-300">
                        <span className="text-lg mr-3">🧩</span>
                        <span className="text-sm">Quay lại bảng suy luận để phân tích</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={onClose}
                      className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      📖 Đóng và tiếp tục điều tra
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {viewMode === 'theories' && (
            <div className="h-full overflow-y-auto space-y-4">
              {theories.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-4xl mb-4">💭</div>
                  <div>Chưa có giả thuyết nào</div>
                  <div className="text-sm mt-2">Chọn bằng chứng và nhân vật để tạo giả thuyết</div>
                </div>
              ) : (
                theories.map(theory => (
                  <div key={theory.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{theory.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Tin cậy:</span>
                        <span className={`font-semibold ${
                          theory.confidence >= 70 ? 'text-green-400' :
                          theory.confidence >= 40 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {theory.confidence}%
                        </span>
                      </div>
                    </div>
                    
                    {theory.description && (
                      <p className="text-gray-300 text-sm mb-3">{theory.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Bằng chứng liên quan:</div>
                        <div className="space-y-1">
                          {theory.evidence.map(evidenceId => {
                            const evidence = getAllEvidence().find(e => e.id === evidenceId);
                            return evidence ? (
                              <div key={evidenceId} className="text-sm text-blue-300">
                                🔍 {evidence.name}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Nghi phạm:</div>
                        <div className="space-y-1">
                          {theory.suspects.map(suspectId => {
                            const character = getAliveCharacters().find(c => c.id === suspectId);
                            return character ? (
                              <div key={suspectId} className="text-sm text-purple-300">
                                👤 {character.name}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {viewMode === 'timeline' && (
            <div className="h-full overflow-y-auto">
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-4">⏰</div>
                <div>Dòng thời gian sự kiện</div>
                <div className="text-sm mt-2">Tính năng này sẽ được thêm vào sau</div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Item Details */}
        {selectedItems.length === 1 && (
          <div className="mt-4 p-3 bg-gray-800 rounded">
            <div className="text-sm text-gray-300">
              Chi tiết: {selectedItems.map(id => {
                const item = boardItems.find(i => i.id === id);
                if (!item) return id;
                const name = item.type === 'character' ? (item.data as Character).name :
                            item.type === 'evidence' ? (item.data as Evidence).name :
                            item.type === 'room' ? (item.data as Room).name :
                            (item.data as Theory).title;
                return `${name} (${item.type})`;
              }).join(', ')}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
} 