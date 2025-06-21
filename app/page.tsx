'use client';

import { useState } from 'react';
import { getAliveCharacters } from '../src/data/characters';
import { getEvidenceInRoom, getAllEvidence } from '../src/data/evidence';
import { getRoom } from '../src/data/rooms';
import CharacterCard from '../src/components/game/CharacterCard';
import EvidenceCard from '../src/components/game/EvidenceCard';
import ConversationModal from '../src/components/game/ConversationModal';
import { AccusationModal } from '../src/components/game/AccusationModal';
import InvestigationPanel from '../src/components/game/InvestigationPanel';
import Toast from '../src/components/ui/Toast';
import { useGameStore } from '../src/stores/gameStore';
import { Character } from '../src/types/game';

export default function Home() {
  const { gamePhase, currentRoom, evidenceFound, addEvidence, toast, showToast, hideToast } = useGameStore();
  const characters = getAliveCharacters();
  const roomEvidence = getEvidenceInRoom(currentRoom);
  const allEvidence = getAllEvidence();
  const currentRoomData = getRoom(currentRoom);
  
  // Conversation modal state
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  // Accusation modal state
  const [isAccusationOpen, setIsAccusationOpen] = useState(false);

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
    setIsConversationOpen(true);
  };

  const handleCloseConversation = () => {
    setIsConversationOpen(false);
    setSelectedCharacter(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">
            🕵️ AI Mystery Game
          </h1>
          <p className="text-slate-400 text-center">
            Bóng ma biệt thự Gilmore
          </p>
          
          {/* Game Status */}
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <div>
              <span className="text-slate-500">Giai Đoạn:</span>
              <span className="ml-2 capitalize text-yellow-400">{gamePhase === 'investigation' ? 'điều tra' : gamePhase === 'accusation' ? 'buộc tội' : 'hoàn thành'}</span>
            </div>
            <div>
              <span className="text-slate-500">Phòng:</span>
              <span className="ml-2 capitalize text-blue-400">{currentRoom}</span>
            </div>
            <div>
              <span className="text-slate-500">Bằng Chứng:</span>
              <span className="ml-2 text-green-400">{evidenceFound.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Story Introduction */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-xl font-semibold mb-4">🎭 Vụ án</h2>
          <p className="text-slate-300 leading-relaxed">
            Đêm giông bão năm 1993, bà Marlene Gilmore (70 tuổi) được phát hiện đã chết 
            trong phòng riêng tại biệt thự cổ nhà Gilmore. Cửa phòng khóa từ bên trong, 
            không có dấu hiệu đột nhập. Trước đó bà vừa tuyên bố sẽ thay đổi di chúc, 
            điều khiến các thành viên gia đình hoang mang.
          </p>
          <p className="text-slate-400 mt-3 text-sm">
            Là thám tử được thuê, bạn phải điều tra và tìm ra sự thật...
          </p>
        </div>

        {/* Investigation Status Panel */}
        <div className="mb-6 md:mb-8">
          <InvestigationPanel />
        </div>

        {/* Characters Section */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">👥 Nghi phạm</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                showTrustLevel={true}
                onClick={() => handleCharacterClick(character)}
              />
            ))}
          </div>
        </div>

        {/* Current Room */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">🏠 {currentRoomData?.name || 'Unknown Room'}</h2>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 md:p-6 mb-3 md:mb-4">
            <p className="text-slate-300 leading-relaxed mb-2">
              {currentRoomData?.description || 'You find yourself in an unfamiliar place.'}
            </p>
            <p className="text-slate-400 text-sm italic">
              {currentRoomData?.atmosphere || ''}
            </p>
          </div>
          
          <h3 className="text-base md:text-lg font-semibold mb-3">🔍 Tìm Kiếm Bằng Chứng</h3>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 md:p-6">
            {roomEvidence.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Không có bằng chứng trong phòng này...
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-4">
                {roomEvidence.map((evidence, index) => (
                  <div 
                    key={evidence.id}
                    className="animate-in fade-in-0 zoom-in-95 duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <EvidenceCard
                      evidence={evidence}
                      isClickable={!evidenceFound.includes(evidence.id)}
                      onClick={() => {
                        if (!evidenceFound.includes(evidence.id)) {
                          addEvidence(evidence.id);
                          showToast(`Tìm thấy: ${evidence.name}!`, `Bằng chứng đã được thêm vào kho.`, 'success');
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Evidence Inventory */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">📋 Kho Bằng Chứng ({evidenceFound.length})</h2>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 md:p-6">
            {evidenceFound.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Chưa tìm được bằng chứng nào...
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {evidenceFound.map((evidenceId) => {
                  const evidence = allEvidence.find(e => e.id === evidenceId);
                  return evidence ? (
                    <EvidenceCard
                      key={evidence.id}
                      evidence={evidence}
                      showDetails={true}
                      isClickable={false}
                    />
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        {/* Room Navigation */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">🏠 Di Chuyển Trong Biệt Thự</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
            {['living_room', 'marlene_bedroom', 'bathroom', 'elise_room', 'arthur_study', 'back_door'].map((room) => (
              <button
                key={room}
                className={`
                  px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition-all text-xs md:text-sm
                  ${currentRoom === room 
                    ? 'bg-blue-600 text-white border-2 border-blue-400' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-2 border-slate-600'
                  }
                `}
                onClick={() => useGameStore.getState().setCurrentRoom(room)}
              >
                {room === 'living_room' ? 'Phòng Khách' :
                 room === 'marlene_bedroom' ? 'Phòng Ngủ Marlene' :
                 room === 'bathroom' ? 'Phòng Tắm' :
                 room === 'elise_room' ? 'Phòng Elise' :
                 room === 'arthur_study' ? 'Phòng Làm Việc Arthur' :
                 room === 'back_door' ? 'Cửa Sau' :
                 room.replace('_', ' ').split(' ').map(word => 
                   word.charAt(0).toUpperCase() + word.slice(1)
                 ).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-x-4">
                      <button 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            onClick={() => setIsAccusationOpen(true)}
          >
            ⚖️ Buộc Tội
          </button>
          <button 
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn reset game?')) {
                useGameStore.getState().resetGame();
              }
            }}
          >
            🔄 Chơi Lại
          </button>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            onClick={() => {
              // TODO: Add test evidence for demo
              const testEvidence = ['wine_glass', 'threatening_letter'];
              testEvidence.forEach(id => addEvidence(id));
            }}
          >
            🧪 Thêm Bằng Chứng Test
          </button>
        </div>
      </main>

      {/* Conversation Modal */}
      {selectedCharacter && (
        <ConversationModal
          isOpen={isConversationOpen}
          onClose={handleCloseConversation}
          character={selectedCharacter}
        />
      )}

      {/* Accusation Modal */}
      <AccusationModal
        isOpen={isAccusationOpen}
        onClose={() => setIsAccusationOpen(false)}
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={hideToast}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
