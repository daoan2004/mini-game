'use client';

import { Character } from '../../types/game';
import { useGameStore } from '../../stores/gameStore';
import Image from 'next/image';

interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
  showTrustLevel?: boolean;
}

export default function CharacterCard({ 
  character, 
  onClick, 
  showTrustLevel = false 
}: CharacterCardProps) {
  const { npcTrust, npcEmotionalState } = useGameStore();
  
  const trustLevel = npcTrust[character.id] || 50;
  const emotionalState = npcEmotionalState[character.id] || 'calm';
  
  // Trust level color
  const getTrustColor = (trust: number) => {
    if (trust >= 70) return 'text-green-500';
    if (trust >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Emotional state color
  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'calm': return 'text-blue-500';
      case 'nervous': return 'text-yellow-500';
      case 'defensive': return 'text-orange-500';
      case 'angry': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  return (
    <div 
      className={`
        bg-slate-800 border border-slate-700 rounded-lg p-3 md:p-4 
        transition-all duration-200 hover:border-slate-600
        ${onClick ? 'cursor-pointer hover:bg-slate-750' : ''}
      `}
      onClick={onClick}
    >
      {/* Character Avatar */}
      <div className="flex items-start space-x-3 md:space-x-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-700 rounded-full flex items-center justify-center relative overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-200">
          {character.avatar ? (
            <Image 
              src={character.avatar} 
              alt={character.name}
              width={64}
              height={64}
              className="w-full h-full rounded-full object-cover transition-all duration-200 hover:scale-105"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R611ojatSmVV5I3Q="
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          
          {/* Fallback initials - always present but hidden when image loads */}
          <span className={`text-xl md:text-2xl text-slate-300 font-semibold absolute inset-0 flex items-center justify-center ${character.avatar ? 'hidden' : ''}`}>
            {character.name.charAt(0)}
          </span>
          
          {/* Loading indicator */}
          <div className="absolute inset-0 bg-slate-600 rounded-full animate-pulse hidden" id={`loading-${character.id}`}>
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-4 h-4 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          {/* Name and Role */}
          <h3 className="text-base md:text-lg font-semibold text-white">
            {character.name}
          </h3>
          <p className="text-xs md:text-sm text-slate-400">
            {character.role}
          </p>
          
          {/* Trust and Emotion Status */}
          {showTrustLevel && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Tin cậy:</span>
                <span className={`text-xs font-medium ${getTrustColor(trustLevel)}`}>
                  {trustLevel}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Tâm trạng:</span>
                <span className={`text-xs font-medium capitalize ${getEmotionColor(emotionalState)}`}>
                  {emotionalState === 'calm' ? 'bình tĩnh' :
                   emotionalState === 'nervous' ? 'lo lắng' :
                   emotionalState === 'defensive' ? 'phòng thủ' :
                   emotionalState === 'angry' ? 'tức giận' : emotionalState}
                </span>
              </div>
            </div>
          )}
          
          {/* Background */}
          <p className="text-xs md:text-sm text-slate-300 mt-2 line-clamp-2">
            {character.background}
          </p>
        </div>
      </div>
      
      {/* Interactive indicator */}
      {onClick && (
        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            Nhấn để trò chuyện
          </p>
        </div>
      )}
    </div>
  );
} 