import { GameState } from '../types/game';

// Extended GameState with roomSearchState for achievements
interface ExtendedGameState extends GameState {
  roomSearchState?: Record<string, { attempts: number }>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface AchievementCheck {
  (gameState: ExtendedGameState, previousState?: ExtendedGameState): boolean;
}

// Achievement definitions - 10 achievements từ dễ đến khó
export const ACHIEVEMENT_DEFINITIONS: Record<string, Omit<Achievement, 'isUnlocked' | 'unlockedAt' | 'progress'>> = {
  first_evidence: {
    id: 'first_evidence',
    name: 'Thám tử mới',
    description: 'Tìm được bằng chứng đầu tiên trong vụ án',
    icon: '🔍',
    rarity: 'common'
  },
  
  first_conversation: {
    id: 'first_conversation',
    name: 'Cuộc gặp đầu tiên',
    description: 'Nói chuyện với một nhân vật lần đầu',
    icon: '💬',
    rarity: 'common'
  },
  
  evidence_hunter: {
    id: 'evidence_hunter',
    name: 'Thợ săn bằng chứng',
    description: 'Tìm được tất cả 8 bằng chứng trong vụ án',
    icon: '🏆',
    rarity: 'rare',
    maxProgress: 8
  },
  
  conversation_master: {
    id: 'conversation_master',
    name: 'Chuyên gia thẩm vấn',
    description: 'Có 15+ cuộc hội thoại với các nhân vật',
    icon: '🎭',
    rarity: 'rare',
    maxProgress: 15
  },
  
  trust_builder: {
    id: 'trust_builder',
    name: 'Người tin cậy',
    description: 'Đạt 80%+ tin cậy với tất cả nhân vật còn sống',
    icon: '💝',
    rarity: 'epic'
  },
  
  room_explorer: {
    id: 'room_explorer',
    name: 'Nhà thám hiểm',
    description: 'Tìm kiếm trong tất cả 6 phòng của biệt thự',
    icon: '🏠',
    rarity: 'common',
    maxProgress: 6
  },
  
  detective_persistence: {
    id: 'detective_persistence',
    name: 'Kiên trì bất khuất',
    description: 'Thực hiện 20 lần tìm kiếm (kể cả thất bại)',
    icon: '🔄',
    rarity: 'rare',
    maxProgress: 20
  },
  
  smooth_talker: {
    id: 'smooth_talker',
    name: 'Bậc thầy giao tiếp',
    description: 'Không để ai giảm tin cậy xuống dưới 30%',
    icon: '🗣️',
    rarity: 'epic'
  },
  
  save_master: {
    id: 'save_master',
    name: 'Quản lý thời gian',
    description: 'Sử dụng tính năng lưu game 3 lần',
    icon: '💾',
    rarity: 'common',
    maxProgress: 3
  },
  
  perfect_detective: {
    id: 'perfect_detective',
    name: 'Thám tử hoàn hảo',
    description: 'Hoàn thành vụ án với 100% bằng chứng và 70%+ trust với tất cả',
    icon: '🎯',
    rarity: 'legendary'
  },
  
  deduction_master: {
    id: 'deduction_master',
    name: 'Bậc thầy suy luận',
    description: 'Tạo 5+ kết nối trong bảng suy luận',
    icon: '🧠',
    rarity: 'rare',
    maxProgress: 5
  },
  
  theory_builder: {
    id: 'theory_builder',
    name: 'Nhà xây dựng giả thuyết',
    description: 'Tạo ra 3 giả thuyết khác nhau',
    icon: '💭',
    rarity: 'epic',
    maxProgress: 3
  }
};

// Achievement check functions
const ACHIEVEMENT_CHECKS: Record<string, AchievementCheck> = {
  first_evidence: (gameState) => gameState.evidenceFound.length >= 1,
  
  first_conversation: (gameState) => gameState.conversationHistory.length >= 1,
  
  evidence_hunter: (gameState) => gameState.evidenceFound.length >= 8,
  
  conversation_master: (gameState) => gameState.conversationHistory.length >= 15,
  
  trust_builder: (gameState) => {
    const trustValues = Object.values(gameState.npcTrust);
    return trustValues.length >= 4 && trustValues.every(trust => trust >= 80);
  },
  
  room_explorer: (gameState) => {
    // Check if player has searched in all 6 rooms
    const searchState = gameState.roomSearchState || {};
    const roomsSearched = Object.keys(searchState).length;
    return roomsSearched >= 6;
  },
  
  detective_persistence: (gameState) => {
    // Count total search attempts across all rooms
    const searchState = gameState.roomSearchState || {};
    const totalAttempts = Object.values(searchState)
      .reduce((sum: number, room) => sum + (room?.attempts || 0), 0);
    return totalAttempts >= 20;
  },
  
  smooth_talker: (gameState) => {
    const trustValues = Object.values(gameState.npcTrust);
    return trustValues.length >= 4 && trustValues.every(trust => trust >= 30);
  },
  
  save_master: () => {
    // Check localStorage for save count
    try {
      const saveCount = parseInt(localStorage.getItem('mystery-game-save-count') || '0');
      return saveCount >= 3;
    } catch {
      return false;
    }
  },
  
  perfect_detective: (gameState) => {
    const hasAllEvidence = gameState.evidenceFound.length >= 8;
    const trustValues = Object.values(gameState.npcTrust);
    const highTrust = trustValues.length >= 4 && trustValues.every(trust => trust >= 70);
    return hasAllEvidence && highTrust;
  },
  
  deduction_master: () => {
    try {
      const saved = localStorage.getItem('mystery-game-deduction-board');
      if (saved) {
        const data = JSON.parse(saved);
        return (data.connections?.length || 0) >= 5;
      }
    } catch {
      return false;
    }
    return false;
  },
  
  theory_builder: () => {
    try {
      const saved = localStorage.getItem('mystery-game-deduction-board');
      if (saved) {
        const data = JSON.parse(saved);
        return (data.theories?.length || 0) >= 3;
      }
    } catch {
      return false;
    }
    return false;
  }
};

// Get current achievements status
export function getAchievements(gameState: GameState): Achievement[] {
  const savedAchievements = getSavedAchievements();
  
  return Object.values(ACHIEVEMENT_DEFINITIONS).map(definition => {
    const saved = savedAchievements.find(a => a.id === definition.id);
    const checker = ACHIEVEMENT_CHECKS[definition.id];
    const isUnlocked = saved?.isUnlocked || (checker && checker(gameState));
    
    // Calculate progress for achievements with maxProgress
    let progress = saved?.progress || 0;
    if (definition.maxProgress && !isUnlocked) {
      switch (definition.id) {
        case 'evidence_hunter':
          progress = gameState.evidenceFound.length;
          break;
        case 'conversation_master':
          progress = gameState.conversationHistory.length;
          break;
        case 'room_explorer':
          progress = Object.keys((gameState as ExtendedGameState).roomSearchState || {}).length;
          break;
        case 'detective_persistence':
          const searchState = (gameState as ExtendedGameState).roomSearchState || {};
          progress = Object.values(searchState)
            .reduce((sum: number, room) => sum + (room?.attempts || 0), 0);
          break;
        case 'save_master':
          progress = parseInt(localStorage.getItem('mystery-game-save-count') || '0');
          break;
        case 'deduction_master':
          try {
            const saved = localStorage.getItem('mystery-game-deduction-board');
            if (saved) {
              const data = JSON.parse(saved);
              progress = data.connections?.length || 0;
            }
          } catch {
            progress = 0;
          }
          break;
        case 'theory_builder':
          try {
            const saved = localStorage.getItem('mystery-game-deduction-board');
            if (saved) {
              const data = JSON.parse(saved);
              progress = data.theories?.length || 0;
            }
          } catch {
            progress = 0;
          }
          break;
      }
    }
    
    return {
      ...definition,
      isUnlocked,
      unlockedAt: saved?.unlockedAt,
      progress: definition.maxProgress ? Math.min(progress, definition.maxProgress) : undefined
    };
  });
}

// Check for newly unlocked achievements
export function checkNewAchievements(
  currentState: GameState, 
  previousState?: GameState
): Achievement[] {
  const currentAchievements = getAchievements(currentState);
  const previousAchievements = previousState ? getAchievements(previousState) : [];
  
  const newlyUnlocked = currentAchievements.filter(current => {
    const previous = previousAchievements.find(p => p.id === current.id);
    return current.isUnlocked && (!previous || !previous.isUnlocked);
  });
  
  // Save newly unlocked achievements
  if (newlyUnlocked.length > 0) {
    const savedAchievements = getSavedAchievements();
    newlyUnlocked.forEach(achievement => {
      const existingIndex = savedAchievements.findIndex(a => a.id === achievement.id);
      const unlocked = {
        ...achievement,
        isUnlocked: true,
        unlockedAt: Date.now()
      };
      
      if (existingIndex >= 0) {
        savedAchievements[existingIndex] = unlocked;
      } else {
        savedAchievements.push(unlocked);
      }
    });
    
    saveAchievements(savedAchievements);
  }
  
  return newlyUnlocked;
}

// Get saved achievements from localStorage
function getSavedAchievements(): Achievement[] {
  try {
    const saved = localStorage.getItem('mystery-game-achievements');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Save achievements to localStorage
function saveAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem('mystery-game-achievements', JSON.stringify(achievements));
  } catch (error) {
    console.warn('Failed to save achievements:', error);
  }
}

// Get achievement statistics
export function getAchievementStats(): {
  total: number;
  unlocked: number;
  percentage: number;
  byRarity: Record<string, { total: number; unlocked: number }>;
} {
  const savedAchievements = getSavedAchievements();
  const total = Object.keys(ACHIEVEMENT_DEFINITIONS).length;
  const unlocked = savedAchievements.filter(a => a.isUnlocked).length;
  const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
  
  const byRarity: Record<string, { total: number; unlocked: number }> = {
    common: { total: 0, unlocked: 0 },
    rare: { total: 0, unlocked: 0 },
    epic: { total: 0, unlocked: 0 },
    legendary: { total: 0, unlocked: 0 }
  };
  
  Object.values(ACHIEVEMENT_DEFINITIONS).forEach(achievement => {
    byRarity[achievement.rarity].total++;
    const saved = savedAchievements.find(a => a.id === achievement.id);
    if (saved?.isUnlocked) {
      byRarity[achievement.rarity].unlocked++;
    }
  });
  
  return { total, unlocked, percentage, byRarity };
}

// Reset all achievements (for testing)
export function resetAchievements(): void {
  localStorage.removeItem('mystery-game-achievements');
}

// Get rarity color for UI
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return 'text-gray-400';
    case 'rare': return 'text-blue-400';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-yellow-400';
    default: return 'text-gray-400';
  }
}

// Get rarity border color for UI
export function getRarityBorderColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return 'border-gray-500';
    case 'rare': return 'border-blue-500';
    case 'epic': return 'border-purple-500';
    case 'legendary': return 'border-yellow-500';
    default: return 'border-gray-500';
  }
} 