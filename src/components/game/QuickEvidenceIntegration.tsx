'use client';

import React, { useState } from 'react';
import { Character } from '../../types/game';
import { useGameStore } from '../../stores/gameStore';
import { EVIDENCE_ITEMS } from '../../data/evidence';

interface QuickEvidenceIntegrationProps {
  character: Character;
  onQuestionWithEvidence: (question: string, evidenceId: string) => void;
  isVisible: boolean;
}

export function QuickEvidenceIntegration({ 
  character, 
  onQuestionWithEvidence, 
  isVisible 
}: QuickEvidenceIntegrationProps) {
  const { evidenceFound } = useGameStore();
  const [selectedEvidence, setSelectedEvidence] = useState<string>('');

  if (!isVisible || evidenceFound.length === 0) return null;

  // Evidence-specific question templates
  const getEvidenceQuestions = (evidenceId: string): string[] => {
    const templates: Record<string, string[]> = {
      wine_glass: [
        'Ly rượu này có vết son môi. Chị/anh có biết ai đã uống từ ly này không?',
        'Tôi tìm thấy ly rượu này trong phòng bà Marlene. Ai thường uống rượu vang trong nhà?',
        'Có vẻ như có chất lạ trong ly rượu này. Chị/anh có thể giải thích không?'
      ],
      threatening_letter: [
        'Lá thư đe dọa này được viết bằng tay. Chị/anh có nhận ra chữ viết không?',
        'Thư này đề cập đến vấn đề tài chính. Chị/anh có biết ai đang gặp khó khăn về tiền bạc?',
        'Bà Marlene có nhắc đến việc nhận được thư đe dọa không?'
      ],
      spare_key: [
        'Chìa khóa dự phòng này có thể mở phòng bà Marlene. Ai biết về sự tồn tại của nó?',
        'Tôi tìm thấy chìa khóa này ở vị trí đáng ngờ. Chị/anh có thể giải thích không?',
        'Có ai khác ngoài chị/anh có thể tiếp cận chìa khóa này không?'
      ],
      gambling_receipt: [
        'Biên lai cờ bạc này cho thấy khoản nợ lớn. Chị/anh có biết ai đang gặp áp lực tài chính?',
        'Người này nợ 500,000 USD. Điều này có thể tạo động cơ giết người không?',
        'Bà Marlene có biết về vấn đề cờ bạc trong gia đình không?'
      ],
      bloody_handkerchief: [
        'Khăn tay này có vết máu. Chị/anh có thể giải thích vết máu này không?',
        'Tôi tìm thấy khăn tay này gần hiện trường. Nó thuộc về ai?',
        'Vết máu này có thể liên quan đến cái chết của bà Marlene không?'
      ],
      muddy_shoes: [
        'Đôi giày này có bùn đất. Ai đã ra ngoài vào đêm mưa bão?',
        'Vết bùn này cho thấy ai đó đã rời khỏi nhà. Chị/anh có biết ai không?',
        'Tại sao lại có người ra ngoài trong đêm giông bão như vậy?'
      ]
    };

    return templates[evidenceId] || [
      `Về bằng chứng ${EVIDENCE_ITEMS[evidenceId]?.name || evidenceId}, chị/anh có thể cho tôi biết gì?`,
      `Tôi tìm thấy ${EVIDENCE_ITEMS[evidenceId]?.name || evidenceId}. Điều này có ý nghĩa gì?`,
      `${EVIDENCE_ITEMS[evidenceId]?.name || evidenceId} này có liên quan đến chị/anh không?`
    ];
  };

  const handleQuestionSelect = (question: string) => {
    if (selectedEvidence) {
      onQuestionWithEvidence(question, selectedEvidence);
      setSelectedEvidence('');
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-500 rounded-lg p-3 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔍</span>
        <h4 className="text-white font-medium text-sm">Câu Hỏi Với Bằng Chứng</h4>
      </div>

      {/* Evidence Selector */}
      <div className="mb-3">
        <label className="text-sm text-purple-200 mb-2 block">
          Chọn bằng chứng để hỏi:
        </label>
        <select
          value={selectedEvidence}
          onChange={(e) => setSelectedEvidence(e.target.value)}
          className="w-full bg-purple-800 border border-purple-600 rounded px-3 py-2 text-white text-sm"
        >
          <option value="">-- Chọn bằng chứng --</option>
          {evidenceFound.map((evidenceId) => {
            const evidence = EVIDENCE_ITEMS[evidenceId];
            return (
              <option key={evidenceId} value={evidenceId}>
                {evidence ? evidence.name : evidenceId.replace('_', ' ')}
              </option>
            );
          })}
        </select>
      </div>

      {/* Question Templates */}
      {selectedEvidence && (
        <div className="space-y-2">
          <p className="text-sm text-purple-200 mb-2">Câu hỏi gợi ý:</p>
          {getEvidenceQuestions(selectedEvidence).map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuestionSelect(question)}
              className="w-full text-left p-3 bg-purple-800 hover:bg-purple-700 border border-purple-600 rounded text-sm text-white transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className="text-purple-300 mt-1">•</span>
                <span>{question}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {!selectedEvidence && (
        <div className="text-center py-4 text-purple-300 text-sm">
          Chọn bằng chứng để xem câu hỏi gợi ý
        </div>
      )}

      {/* Character-specific tips */}
      <div className="mt-3 pt-3 border-t border-purple-600">
        <p className="text-xs text-purple-200">
          💡 <strong>Mẹo với {character.name}:</strong>{' '}
          {character.id === 'arthur' && 'Hỏi về tài chính và áp lực kinh tế'}
          {character.id === 'selena' && 'Tập trung vào mối quan hệ gia đình và thừa kế'}
          {character.id === 'elise' && 'Khai thác sự trung thành và kiến thức về gia đình'}
          {character.id === 'marcus' && 'Tiếp cận nhẹ nhàng, tạo sự tin tưởng'}
        </p>
      </div>
    </div>
  );
} 