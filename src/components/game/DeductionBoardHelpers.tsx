'use client';

import { useState } from 'react';

interface ConnectionTipsProps {
  isVisible: boolean;
}

export function ConnectionTips({ isVisible }: ConnectionTipsProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-blue-300 mb-3">💡 Gợi ý tạo kết nối:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-200">
        <div>
          <strong>🎯 Nghi ngờ:</strong>
          <ul className="list-disc list-inside ml-2">
            <li>Nhân vật → Bằng chứng có động cơ</li>
            <li>Nhân vật → Phòng có mối liên hệ</li>
          </ul>
        </div>
        
        <div>
          <strong>📍 Tìm thấy tại:</strong>
          <ul className="list-disc list-inside ml-2">
            <li>Bằng chứng → Phòng được phát hiện</li>
            <li>Bằng chứng → Nhân vật sở hữu</li>
          </ul>
        </div>
        
        <div>
          <strong>💰 Động cơ:</strong>
          <ul className="list-disc list-inside ml-2">
            <li>Nhân vật → Bằng chứng thể hiện lý do</li>
            <li>Nhân vật → Tài sản, di sản</li>
          </ul>
        </div>
        
        <div>
          <strong>✅ Bằng chứng ngoại phạm:</strong>
          <ul className="list-disc list-inside ml-2">
            <li>Nhân vật → Bằng chứng chứng minh vô tội</li>
            <li>Nhân vật → Phòng có mặt khi án mạng</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

interface DeductionInsightsProps {
  connections: Array<{
    id: string;
    from: string;
    to: string;
    type: string;
  }>;
  evidenceCount: number;
}

export function DeductionInsights({ connections, evidenceCount }: DeductionInsightsProps) {
  const suspectConnections = connections.filter(c => c.type === 'suspects');
  const motiveConnections = connections.filter(c => c.type === 'motive');
  const alibiConnections = connections.filter(c => c.type === 'alibi');
  
  const insights = [];
  
  if (suspectConnections.length === 0 && evidenceCount > 2) {
    insights.push({
      type: 'warning',
      text: '⚠️ Chưa có nghi phạm chính. Hãy kết nối nhân vật với bằng chứng!',
      action: 'Tạo kết nối "Nghi ngờ"'
    });
  }
  
  if (motiveConnections.length === 0 && suspectConnections.length > 0) {
    insights.push({
      type: 'tip',
      text: '💡 Đã có nghi phạm nhưng chưa rõ động cơ. Tìm lý do họ muốn giết bà Marlene.',
      action: 'Tạo kết nối "Động cơ"'
    });
  }
  
  if (alibiConnections.length === 0 && suspectConnections.length > 1) {
    insights.push({
      type: 'tip',
      text: '🔍 Nhiều nghi phạm! Hãy tìm bằng chứng ngoại phạm để loại trừ những người vô tội.',
      action: 'Tạo kết nối "Bằng chứng ngoại phạm"'
    });
  }
  
  if (connections.length >= 5) {
    insights.push({
      type: 'success',
      text: '🎉 Bảng suy luận phong phú! Bạn đang tiến gần đến sự thật.',
      action: 'Tiếp tục phân tích'
    });
  }
  
  const strongestSuspect = suspectConnections.reduce((acc, conn) => {
    const count = connections.filter(c => c.from === conn.from && c.type !== 'alibi').length;
    return count > acc.count ? { suspect: conn.from, count } : acc;
  }, { suspect: '', count: 0 });
  
  if (strongestSuspect.count >= 2) {
    insights.push({
      type: 'analysis',
      text: `🎯 ${strongestSuspect.suspect} có nhiều bằng chứng liên quan nhất (${strongestSuspect.count} kết nối).`,
      action: 'Cân nhắc buộc tội'
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      text: '🧩 Hãy tạo thêm kết nối để phân tích sâu hơn.',
      action: 'Khám phá thêm bằng chứng'
    });
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-300">🔍 Phân tích suy luận:</h4>
      {insights.map((insight, index) => (
        <div 
          key={index}
          className={`p-3 rounded-lg border ${
            insight.type === 'warning' ? 'bg-red-900/20 border-red-500/30 text-red-200' :
            insight.type === 'tip' ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-200' :
            insight.type === 'success' ? 'bg-green-900/20 border-green-500/30 text-green-200' :
            insight.type === 'analysis' ? 'bg-purple-900/20 border-purple-500/30 text-purple-200' :
            'bg-gray-800/50 border-gray-600 text-gray-300'
          }`}
        >
          <div className="text-sm">{insight.text}</div>
          <div className="text-xs opacity-75 mt-1">→ {insight.action}</div>
        </div>
      ))}
    </div>
  );
}

interface QuickActionsProps {
  onCreateTheory: () => void;
  onSaveBoard: () => void;
  onClearBoard: () => void;
  selectedItemsCount: number;
  connectionsCount: number;
}

export function QuickActions({ 
  onCreateTheory, 
  onSaveBoard, 
  onClearBoard, 
  selectedItemsCount,
  connectionsCount 
}: QuickActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex gap-2 flex-wrap">
      {selectedItemsCount >= 2 && (
        <button
          onClick={onCreateTheory}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
        >
          💭 Tạo giả thuyết từ items đã chọn
        </button>
      )}
      
      <button
        onClick={onSaveBoard}
        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
      >
        💾 Lưu bảng suy luận
      </button>
      
      {connectionsCount > 0 && (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
        >
          🗑️ Xóa tất cả kết nối
        </button>
      )}
      
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
            <h3 className="font-semibold mb-4">Xác nhận xóa</h3>
            <p className="text-gray-300 mb-4">
              Bạn có chắc chắn muốn xóa tất cả {connectionsCount} kết nối?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClearBoard();
                  setShowConfirm(false);
                }}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Xóa tất cả
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function getConnectionTypeLabel(type: string): string {
  switch (type) {
    case 'suspects': return '🎯 Nghi ngờ';
    case 'found_in': return '📍 Tìm thấy tại';
    case 'motive': return '💰 Động cơ';
    case 'alibi': return '✅ Bằng chứng ngoại phạm';
    case 'supports': return '✨ Ủng hộ';
    case 'contradicts': return '❌ Mâu thuẫn';
    default: return type;
  }
}

export function getItemTypeIcon(type: string): string {
  switch (type) {
    case 'character': return '👤';
    case 'evidence': return '🔍';
    case 'room': return '🏠';
    case 'theory': return '💭';
    default: return '❓';
  }
} 