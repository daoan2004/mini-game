'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getInvestigationStatus, getInvestigationHints } from '../../utils/gameLogic';
import EvidenceLab from './EvidenceLab';
import { getAllEvidence } from '../../data/evidence';

export default function InvestigationPanel() {
  const store = useGameStore();
  const status = getInvestigationStatus(store);
  const hints = getInvestigationHints(store);
  const [showEvidenceLab, setShowEvidenceLab] = useState(false);
  
  const discoveredEvidence = getAllEvidence().filter(e => 
    store.evidenceFound.includes(e.id)
  );

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-amber-400 mb-4">🔍 Tình Trạng Điều Tra</h2>
      
      {/* Progress Bars */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Điểm Bằng Chứng</span>
            <span className={`text-sm font-bold ${
              status.evidenceScore >= 70 ? 'text-green-400' :
              status.evidenceScore >= 40 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {status.evidenceScore}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                status.evidenceScore >= 70 ? 'bg-green-500' :
                status.evidenceScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${status.evidenceScore}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Điểm Tin Cậy</span>
            <span className={`text-sm font-bold ${
              status.trustScore >= 70 ? 'text-green-400' :
              status.trustScore >= 40 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {status.trustScore}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                status.trustScore >= 70 ? 'bg-green-500' :
                status.trustScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${status.trustScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Investigation Progress */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-400">Tiến Độ:</span>
          <span className={`font-semibold ${
            status.progress === 'Điều Tra Chuyên Nghiệp' ? 'text-green-400' :
            status.progress === 'Tiến Triển Tốt' ? 'text-blue-400' :
            status.progress === 'Đang Tiến Bộ' ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {status.progress}
          </span>
        </div>
        
        {/* Ready to Accuse Badge */}
        {status.canAccuse && (
          <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <span>⚖️</span>
              <span className="font-medium">Sẵn Sàng Buộc Tội!</span>
            </div>
            <p className="text-gray-300 text-sm mt-1">
              Bạn đã có đủ bằng chứng để buộc tội.
            </p>
          </div>
        )}
      </div>

      {/* Investigation Hints */}
      <div>
        <h3 className="text-lg font-semibold text-blue-400 mb-3">💡 Gợi Ý Điều Tra</h3>
        <div className="space-y-2">
          {hints.length === 0 ? (
            <p className="text-gray-500 text-sm">Không có gợi ý nào.</p>
          ) : (
            hints.map((hint, index) => (
              <div 
                key={index}
                className="bg-gray-700/50 p-3 rounded-lg text-sm text-gray-300"
              >
                {hint}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Thống Kê Nhanh</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{store.evidenceFound.length}</div>
            <div className="text-gray-500">Bằng Chứng Tìm Được</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{store.conversationHistory.length}</div>
            <div className="text-gray-500">Cuộc Hội Thoại</div>
          </div>
        </div>
      </div>

      {/* Evidence Lab Button */}
      {discoveredEvidence.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <button
            onClick={() => setShowEvidenceLab(true)}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            🔬 Phòng Lab Phân Tích Bằng Chứng
          </button>
        </div>
      )}

      {/* Evidence Lab Modal */}
      {showEvidenceLab && (
        <EvidenceLab
          isOpen={showEvidenceLab}
          onClose={() => setShowEvidenceLab(false)}
          onAnalysisComplete={(evidenceId) => {
            console.log('Lab analysis completed for:', evidenceId);
            // Could trigger achievements or add insights to game state
          }}
        />
      )}
    </div>
  );
} 