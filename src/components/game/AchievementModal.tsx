'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { getAchievements, getAchievementStats, getRarityColor, getRarityBorderColor, type Achievement } from '../../utils/achievements';

type AchievementStats = ReturnType<typeof getAchievementStats>;
import { useGameStore } from '../../stores/gameStore';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementModal({ isOpen, onClose }: AchievementModalProps) {
  const gameState = useGameStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');

  useEffect(() => {
    if (isOpen) {
      const currentAchievements = getAchievements(gameState);
      const currentStats = getAchievementStats();
      setAchievements(currentAchievements);
      setStats(currentStats);
    }
  }, [isOpen, gameState]);

  const filteredAchievements = achievements.filter(achievement => {
    // Status filter
    if (filter === 'unlocked' && !achievement.isUnlocked) return false;
    if (filter === 'locked' && achievement.isUnlocked) return false;
    
    // Rarity filter
    if (rarityFilter !== 'all' && achievement.rarity !== rarityFilter) return false;
    
    return true;
  });

  const formatUnlockTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🏆 Thành tích">
      <div className="space-y-6">
        {/* Statistics */}
        {stats && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">📊 Thống kê tổng quan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.unlocked}/{stats.total}</div>
                <div className="text-sm text-gray-400">Đã mở khóa</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.percentage}%</div>
                <div className="text-sm text-gray-400">Hoàn thành</div>
              </div>
            </div>
            
            {/* Rarity breakdown */}
            <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
              <div className="text-center">
                <div className="text-gray-400">Thường</div>
                <div className="font-semibold text-gray-300">{stats.byRarity.common.unlocked}/{stats.byRarity.common.total}</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400">Hiếm</div>
                <div className="font-semibold text-blue-300">{stats.byRarity.rare.unlocked}/{stats.byRarity.rare.total}</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400">Sử thi</div>
                <div className="font-semibold text-purple-300">{stats.byRarity.epic.unlocked}/{stats.byRarity.epic.total}</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400">Huyền thoại</div>
                <div className="font-semibold text-yellow-300">{stats.byRarity.legendary.unlocked}/{stats.byRarity.legendary.total}</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filter === 'unlocked' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Đã mở khóa
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filter === 'locked' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Chưa mở khóa
            </button>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => setRarityFilter('all')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                rarityFilter === 'all' ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Tất cả độ hiếm
            </button>
            <button
              onClick={() => setRarityFilter('legendary')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                rarityFilter === 'legendary' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🎯 Huyền thoại
            </button>
            <button
              onClick={() => setRarityFilter('epic')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                rarityFilter === 'epic' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              💝 Sử thi
            </button>
          </div>
        </div>

        {/* Achievements list */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAchievements.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Không có thành tích nào phù hợp với bộ lọc
            </div>
          ) : (
            filteredAchievements.map(achievement => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.isUnlocked 
                    ? `bg-gray-800 ${getRarityBorderColor(achievement.rarity)}` 
                    : 'bg-gray-900 border-gray-600 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-semibold ${achievement.isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                        {achievement.name}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded ${getRarityColor(achievement.rarity)} bg-gray-700`}>
                        {achievement.rarity === 'common' && 'Thường'}
                        {achievement.rarity === 'rare' && 'Hiếm'}
                        {achievement.rarity === 'epic' && 'Sử thi'}
                        {achievement.rarity === 'legendary' && 'Huyền thoại'}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${achievement.isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                      {achievement.description}
                    </p>
                    
                    {/* Progress bar for partially completed achievements */}
                    {achievement.maxProgress && !achievement.isUnlocked && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Tiến độ</span>
                          <span>{achievement.progress || 0}/{achievement.maxProgress}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, ((achievement.progress || 0) / achievement.maxProgress) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Unlock time */}
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <div className="mt-2 text-xs text-green-400">
                        ✅ Mở khóa lúc: {formatUnlockTime(achievement.unlockedAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tips for unlocking achievements */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
          <h4 className="font-semibold text-blue-300 mb-2">💡 Gợi ý mở khóa thành tích:</h4>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• <strong>Nói chuyện nhiều:</strong> Để tăng trust và unlock conversation achievements</li>
            <li>• <strong>Tìm kiếm kỹ lưỡng:</strong> Mỗi phòng có thể có nhiều bằng chứng</li>
            <li>• <strong>Kiên nhẫn với tìm kiếm:</strong> Đôi khi cần thử nhiều lần mới tìm được</li>
            <li>• <strong>Lưu game thường xuyên:</strong> Vừa an toàn vừa unlock achievements</li>
            <li>• <strong>Chơi lại nhiều lần:</strong> Để khám phá tất cả achievements có thể</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
} 