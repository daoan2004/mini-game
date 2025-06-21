'use client';

import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { getEvidenceInRoom } from '../../data/evidence';
import EvidenceCard from './EvidenceCard';

interface SearchAreaProps {
  currentRoom: string;
}

export default function SearchArea({ currentRoom }: SearchAreaProps) {
  const { 
    evidenceFound, 
    addEvidence, 
    showToast, 
    roomSearchState, 
    attemptSearch,
    npcTrust 
  } = useGameStore();
  
  const [isSearching, setIsSearching] = useState(false);
  const roomEvidence = getEvidenceInRoom(currentRoom);
  const undiscoveredEvidence = roomEvidence.filter(evidence => 
    !evidenceFound.includes(evidence.id)
  );
  
  const searchState = roomSearchState[currentRoom];
  const hasSearched = searchState && searchState.attempts > 0;
  const maxAttempts = 3;
  const currentAttempts = searchState?.attempts || 0;
  const canSearch = currentAttempts < maxAttempts;

  // Calculate search success rate based on trust levels and attempts
  const calculateSuccessRate = (): number => {
    const baseRate = 40; // 40% base chance
    const trustBonus = Math.max(...Object.values(npcTrust)) * 0.3; // Max 30% from trust
    const attemptBonus = currentAttempts * 20; // Each attempt increases chance
    return Math.min(90, baseRate + trustBonus + attemptBonus);
  };

  const handleSearch = async () => {
    if (!canSearch || isSearching || undiscoveredEvidence.length === 0) return;
    
    setIsSearching(true);
    
    // Simulate search time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    attemptSearch(currentRoom);
    const successRate = calculateSuccessRate();
    const isSuccess = Math.random() * 100 < successRate;
    
    if (isSuccess && undiscoveredEvidence.length > 0) {
      // Found evidence!
      const foundEvidence = undiscoveredEvidence[0]; // Take first undiscovered
      addEvidence(foundEvidence.id);
      showToast(
        `🔍 Tìm thấy: ${foundEvidence.name}!`, 
        `Điều tra cẩn thận đã mang lại kết quả!`,
        'success'
      );
    } else {
      // Search failed
      const remainingAttempts = maxAttempts - (currentAttempts + 1);
      if (remainingAttempts > 0) {
        showToast(
          `🔍 Chưa tìm thấy gì...`,
          `Còn ${remainingAttempts} lần thử. Hãy xây dựng tin cậy với nhân chứng để tăng hiệu quả tìm kiếm.`,
          'warning'
        );
      } else {
        showToast(
          `🚫 Đã tìm kiếm hết khả năng`,
          `Hãy nói chuyện với nhân chứng để có thêm manh mối, hoặc quay lại sau.`,
          'error'
        );
      }
    }
    
    setIsSearching(false);
  };

  const getSearchHint = (): string => {
    if (undiscoveredEvidence.length === 0) {
      return "Bạn đã tìm được tất cả bằng chứng trong phòng này.";
    }
    
    if (!hasSearched) {
      return "Nhìn quanh phòng một cách cẩn thận. Có thể có bằng chứng ẩn giấu ở đây...";
    }
    
    if (currentAttempts === 1) {
      return "Có vẻ như còn điều gì đó bị bỏ sót. Hãy tìm kiếm kỹ hơn...";
    }
    
    if (currentAttempts === 2) {
      return "Gần tìm ra rồi! Một lần nữa có thể sẽ phát hiện ra manh mối quan trọng.";
    }
    
    return "Bạn đã tìm kiếm rất kỹ. Có lẽ cần thông tin từ nhân chứng để hiểu rõ hơn.";
  };

  // Show discovered evidence
  const discoveredRoomEvidence = roomEvidence.filter(evidence => 
    evidenceFound.includes(evidence.id)
  );

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="text-center space-y-4">
          {/* Search Hint */}
          <p className="text-slate-300 text-sm italic">
            {getSearchHint()}
          </p>
          
          {/* Search Progress */}
          {hasSearched && (
            <div className="space-y-2">
              <div className="flex justify-center items-center space-x-2">
                <span className="text-xs text-slate-500">Lần tìm kiếm:</span>
                <span className="text-sm font-medium text-yellow-400">
                  {currentAttempts}/{maxAttempts}
                </span>
              </div>
              
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentAttempts / maxAttempts) * 100}%` }}
                />
              </div>
              
              <p className="text-xs text-slate-400">
                Tỷ lệ thành công: ~{Math.round(calculateSuccessRate())}%
                <span className="ml-2 text-blue-400">
                  (Tăng bằng cách xây dựng tin cậy với nhân chứng)
                </span>
              </p>
            </div>
          )}
          
          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={!canSearch || isSearching || undiscoveredEvidence.length === 0}
            className={`
              px-6 py-3 rounded-lg font-medium transition-all duration-200
              ${canSearch && undiscoveredEvidence.length > 0 && !isSearching
                ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {isSearching ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Đang tìm kiếm...</span>
              </div>
            ) : !canSearch ? (
              'Đã hết lượt tìm kiếm'
            ) : undiscoveredEvidence.length === 0 ? (
              'Không còn bằng chứng'
            ) : (
              '🔍 Tìm kiếm bằng chứng'
            )}
          </button>
          
          {/* Tips */}
          {!hasSearched && (
            <div className="bg-blue-900/30 border border-blue-500/50 p-3 rounded-lg">
              <p className="text-blue-300 text-xs">
                💡 <strong>Mẹo:</strong> Nói chuyện với nhân chứng để tăng khả năng tìm thấy bằng chứng!
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Discovered Evidence */}
      {discoveredRoomEvidence.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-3 text-green-400">
            ✅ Bằng chứng đã tìm thấy ({discoveredRoomEvidence.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {discoveredRoomEvidence.map((evidence) => (
              <EvidenceCard
                key={evidence.id}
                evidence={evidence}
                isClickable={false}
                showDetails={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 