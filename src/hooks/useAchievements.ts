import { useEffect, useRef } from 'react';
import { GameState } from '../types/game';
import { checkNewAchievements, type Achievement } from '../utils/achievements';

export function useAchievements(
  gameState: GameState,
  onAchievementUnlocked: (achievement: Achievement) => void
) {
  const previousStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    // Don't check on initial load
    if (!previousStateRef.current) {
      previousStateRef.current = gameState;
      return;
    }

    // Check for new achievements
    const newAchievements = checkNewAchievements(gameState, previousStateRef.current);
    
    // Notify about new achievements
    newAchievements.forEach(achievement => {
      console.log(`🏆 Achievement unlocked: ${achievement.name}`);
      onAchievementUnlocked(achievement);
    });

    // Update previous state
    previousStateRef.current = gameState;
  }, [
    gameState.evidenceFound,
    gameState.conversationHistory,
    gameState.npcTrust,
    gameState.currentRoom,
    onAchievementUnlocked
  ]);
} 