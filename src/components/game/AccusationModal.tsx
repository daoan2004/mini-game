'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useGameStore } from '../../stores/gameStore';
import { CHARACTERS } from '../../data/characters';
import { 
  makeAccusation, 
  getAvailableSuspects, 
  getInvestigationStatus,
  AccusationResult 
} from '../../utils/gameLogic';

interface AccusationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccusationModal({ isOpen, onClose }: AccusationModalProps) {
  const store = useGameStore();
  const [selectedSuspect, setSelectedSuspect] = useState<string>('');
  const [accusationResult, setAccusationResult] = useState<AccusationResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const availableSuspects = getAvailableSuspects();
  const investigationStatus = getInvestigationStatus(store);

  const handleAccusation = () => {
    if (!selectedSuspect) return;

    const result = makeAccusation(selectedSuspect, store);
    setAccusationResult(result);
    setShowResult(true);

    // Update game state
    if (result.gameEnded) {
      store.setGamePhase('complete');
      store.updateGameFlag('gameComplete', true);
    }
    if (selectedSuspect) {
      store.setAccused(selectedSuspect);
    }
  };

  const handleClose = () => {
    setSelectedSuspect('');
    setAccusationResult(null);
    setShowResult(false);
    onClose();
  };

  if (showResult && accusationResult) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Kết Quả Buộc Tội">
        <div className="space-y-6">
          <div className={`p-4 rounded-lg border-2 ${
            accusationResult.success 
              ? 'bg-green-900/30 border-green-500/50'
              : 'bg-red-900/30 border-red-500/50'
          }`}>
            <div className="whitespace-pre-line text-gray-100">
              {accusationResult.message}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Điểm Bằng Chứng</div>
              <div className={`text-xl font-bold ${
                accusationResult.evidenceScore >= 70 ? 'text-green-400' :
                accusationResult.evidenceScore >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {accusationResult.evidenceScore}%
              </div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="text-sm text-gray-400">Điểm Tin Cậy</div>
              <div className={`text-xl font-bold ${
                accusationResult.trustScore >= 70 ? 'text-green-400' :
                accusationResult.trustScore >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {accusationResult.trustScore}%
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {accusationResult.gameEnded ? (
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Chơi Lại
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Tiếp Tục Điều Tra
              </button>
            )}
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Buộc Tội Nghi Phạm">
      <div className="space-y-6">
        {/* Investigation Status */}
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-amber-400 mb-3">Cuộc Điều Tra Của Bạn</h3>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-sm text-gray-400">Điểm Bằng Chứng</div>
              <div className={`text-lg font-bold ${
                investigationStatus.evidenceScore >= 70 ? 'text-green-400' :
                investigationStatus.evidenceScore >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {investigationStatus.evidenceScore}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Điểm Tin Cậy</div>
              <div className={`text-lg font-bold ${
                investigationStatus.trustScore >= 70 ? 'text-green-400' :
                investigationStatus.trustScore >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {investigationStatus.trustScore}%
              </div>
            </div>
          </div>
          <div className="text-sm text-blue-400">
            Tiến Độ: {investigationStatus.progress}
          </div>
        </div>

        {/* Warning if not ready */}
        {!investigationStatus.canAccuse && (
                    <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-400">
              <span>⚠️</span>
              <span className="font-medium">Cảnh Báo</span>
            </div>
            <p className="text-gray-300 mt-1">
              Bạn không có đủ bằng chứng để buộc tội mạnh mẽ. 
              Hãy cân nhắc thu thập thêm bằng chứng trước.
            </p>
          </div>
        )}

        {/* Suspect Selection */}
        <div>
          <h3 className="text-lg font-semibold text-amber-400 mb-3">Chọn Nghi Phạm</h3>
          <div className="space-y-3">
                         {availableSuspects.map(suspectId => {
               const character = CHARACTERS[suspectId];
               const trustLevel = store.npcTrust[suspectId] || 0;
              
              return (
                <div
                  key={suspectId}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSuspect === suspectId
                      ? 'border-red-500 bg-red-900/30'
                      : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedSuspect(suspectId)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-100">{character.name}</div>
                      <div className="text-sm text-gray-400">{character.role}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Mức Tin Cậy: {trustLevel}%
                      </div>
                    </div>
                    <div className="text-2xl">
                      {selectedSuspect === suspectId ? '🎯' : character.avatar}
                    </div>
                  </div>
                  {selectedSuspect === suspectId && (
                    <div className="mt-3 text-sm text-red-300">
                      Bạn sắp buộc tội {character.name} đã giết Marlene Gilmore.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleAccusation}
            disabled={!selectedSuspect}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              selectedSuspect
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Buộc Tội
          </button>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 text-center">
          ⚠️ Buộc tội sai có thể kết thúc cuộc điều tra vĩnh viễn
        </div>
      </div>
    </Modal>
  );
} 