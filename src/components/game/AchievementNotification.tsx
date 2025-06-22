'use client';

import { useState, useEffect } from 'react';
import { Achievement, getRarityColor, getRarityBorderColor } from '../../utils/achievements';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      setIsLeaving(false);
      
      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [achievement]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!achievement || !isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div 
        className={`
          ${getRarityBorderColor(achievement.rarity)} border-2 bg-gray-800 rounded-lg p-4 shadow-2xl
          transform transition-all duration-300 ease-out
          ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
          animate-bounce-in
        `}
        style={{
          animation: isLeaving ? 'slideOut 0.3s ease-in' : 'slideIn 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="text-sm font-semibold text-green-400">
              THÀNH TÍCH MỚI!
            </span>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Achievement Content */}
        <div className="flex items-center gap-3">
          <div className="text-3xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-white">
                {achievement.name}
              </h4>
              <span className={`text-xs px-2 py-1 rounded ${getRarityColor(achievement.rarity)} bg-gray-700 font-medium`}>
                {achievement.rarity === 'common' && 'Thường'}
                {achievement.rarity === 'rare' && 'Hiếm'}
                {achievement.rarity === 'epic' && 'Sử thi'}
                {achievement.rarity === 'legendary' && 'Huyền thoại'}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              {achievement.description}
            </p>
          </div>
        </div>

        {/* Special effects for rare achievements */}
        {(achievement.rarity === 'epic' || achievement.rarity === 'legendary') && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
          </div>
        )}

        {/* Celebration particles for legendary */}
        {achievement.rarity === 'legendary' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes confetti {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .animate-confetti {
          animation: confetti 2s ease-out infinite;
        }
      `}</style>
    </div>
  );
} 