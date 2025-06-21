'use client';

import { Evidence } from '../../types/game';
import { useGameStore } from '../../stores/gameStore';
import Image from 'next/image';

interface EvidenceCardProps {
  evidence: Evidence;
  onClick?: () => void;
  showDetails?: boolean;
  isClickable?: boolean;
}

export default function EvidenceCard({ 
  evidence, 
  onClick, 
  showDetails = false,
  isClickable = true
}: EvidenceCardProps) {
  const { evidenceFound } = useGameStore();
  const isDiscovered = evidenceFound.includes(evidence.id);
  
  // Evidence rarity color based on importance
  const getRarityColor = () => {
    if (evidence.isRedHerring) return 'border-red-500 bg-red-500/10';
    if (['wine_glass', 'threatening_letter', 'spare_key', 'diary_page'].includes(evidence.id)) {
      return 'border-yellow-500 bg-yellow-500/10'; // Critical evidence
    }
    return 'border-blue-500 bg-blue-500/10'; // Normal evidence
  };
  
  const getRarityLabel = () => {
    if (evidence.isRedHerring) return 'Bằng chứng giả';
    if (['wine_glass', 'threatening_letter', 'spare_key', 'diary_page'].includes(evidence.id)) {
      return 'Bằng chứng quan trọng';
    }
    return 'Bằng chứng';
  };

  return (
    <div 
      className={`
        relative bg-slate-800 border-2 rounded-lg p-4 transition-all duration-300
        ${getRarityColor()}
        ${isClickable && !isDiscovered ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}
        ${isDiscovered ? 'opacity-100' : 'opacity-60'}
        ${showDetails ? 'w-full' : 'w-48'}
      `}
      onClick={isClickable && !isDiscovered ? onClick : undefined}
    >
      {/* Rarity Badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <span className={`
          px-2 py-1 text-xs font-bold rounded-full
          ${evidence.isRedHerring ? 'bg-red-500 text-white' : 
            ['wine_glass', 'threatening_letter', 'spare_key', 'diary_page'].includes(evidence.id) ?
            'bg-yellow-500 text-black' : 'bg-blue-500 text-white'}
        `}>
          {evidence.isRedHerring ? '⚠️' : '🔍'}
        </span>
      </div>

      {/* Evidence Image */}
      <div className="w-full h-32 bg-slate-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {evidence.image && isDiscovered ? (
          <Image 
            src={evidence.image} 
            alt={evidence.name}
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl text-slate-500">
            {isDiscovered ? '🔍' : '❓'}
          </div>
        )}
      </div>

      {/* Evidence Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className={`font-semibold text-sm ${isDiscovered ? 'text-white' : 'text-slate-400'}`}>
            {isDiscovered ? evidence.name : 'Bằng chứng chưa khám phá'}
          </h3>
        </div>

        {/* Evidence Type */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Loại:</span>
          <span className={`text-xs font-medium ${
            evidence.isRedHerring ? 'text-red-400' : 'text-green-400'
          }`}>
            {getRarityLabel()}
          </span>
        </div>

        {/* Related Character */}
        {isDiscovered && evidence.relatedCharacter && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Liên quan đến:</span>
            <span className="text-xs font-medium text-blue-400 capitalize">
              {evidence.relatedCharacter}
            </span>
          </div>
        )}

        {/* Description (only if showDetails) */}
        {showDetails && isDiscovered && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-sm text-slate-300 leading-relaxed">
              {evidence.description}
            </p>
          </div>
        )}

        {/* Discovery hint for undiscovered */}
        {!isDiscovered && isClickable && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center italic">
              Nhấn để điều tra...
            </p>
          </div>
        )}
      </div>

      {/* Discovered indicator */}
      {isDiscovered && (
        <div className="absolute top-2 left-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
} 