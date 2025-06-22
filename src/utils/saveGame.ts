import { GameState } from '../types/game';

export interface SaveGameData {
  id: string;
  timestamp: number;
  gameState: GameState;
  playerName?: string;
  caseProgress: number; // % completion
  playTime: number; // in seconds
  version: string;
}

export interface SaveSlot {
  id: string;
  name: string;
  lastSaved: number;
  preview: {
    evidenceCount: number;
    currentRoom: string;
    suspectedCharacter?: string;
    progress: number;
  };
}

const SAVE_KEY_PREFIX = 'mystery-game-save-';
const GAME_VERSION = '1.0.0';
const MAX_SAVE_SLOTS = 3;

// Save game to specific slot
export function saveGame(slotId: string, gameState: GameState, playerName?: string, playTime: number = 0): SaveGameData {
  const saveData: SaveGameData = {
    id: slotId,
    timestamp: Date.now(),
    gameState,
    playerName: playerName || `Thám tử ${slotId}`,
    caseProgress: calculateProgress(gameState),
    playTime,
    version: GAME_VERSION
  };

  try {
    localStorage.setItem(SAVE_KEY_PREFIX + slotId, JSON.stringify(saveData));
    
    // Track save count for achievements (don't count auto-saves)
    if (slotId !== 'auto') {
      const currentCount = parseInt(localStorage.getItem('mystery-game-save-count') || '0');
      localStorage.setItem('mystery-game-save-count', String(currentCount + 1));
    }
    
    console.log(`✅ Game saved to slot ${slotId}`);
    return saveData;
  } catch (error) {
    console.error('❌ Failed to save game:', error);
    throw new Error('Không thể lưu game. Vui lòng thử lại.');
  }
}

// Load game from specific slot
export function loadGame(slotId: string): SaveGameData | null {
  try {
    const savedData = localStorage.getItem(SAVE_KEY_PREFIX + slotId);
    if (!savedData) return null;

    const saveData: SaveGameData = JSON.parse(savedData);
    
    // Version compatibility check
    if (saveData.version !== GAME_VERSION) {
      console.warn(`⚠️ Save version mismatch: ${saveData.version} vs ${GAME_VERSION}`);
      // Could add migration logic here
    }

    console.log(`✅ Game loaded from slot ${slotId}`);
    return saveData;
  } catch (error) {
    console.error('❌ Failed to load game:', error);
    return null;
  }
}

// Get all save slots
export function getAllSaveSlots(): SaveSlot[] {
  const slots: SaveSlot[] = [];

  for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
    const slotId = i.toString();
    const saveData = loadGame(slotId);

    if (saveData) {
      slots.push({
        id: slotId,
        name: saveData.playerName || `Slot ${i}`,
        lastSaved: saveData.timestamp,
        preview: {
          evidenceCount: saveData.gameState.evidenceFound.length,
          currentRoom: saveData.gameState.currentRoom,
          suspectedCharacter: getMostSuspectedCharacter(saveData.gameState),
          progress: saveData.caseProgress
        }
      });
    } else {
      slots.push({
        id: slotId,
        name: `Slot ${i} - Trống`,
        lastSaved: 0,
        preview: {
          evidenceCount: 0,
          currentRoom: 'living_room',
          progress: 0
        }
      });
    }
  }

  return slots;
}

// Delete save slot
export function deleteSave(slotId: string): boolean {
  try {
    localStorage.removeItem(SAVE_KEY_PREFIX + slotId);
    console.log(`✅ Save slot ${slotId} deleted`);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete save:', error);
    return false;
  }
}

// Auto-save to special slot
export function autoSave(gameState: GameState, playTime: number): void {
  try {
    saveGame('auto', gameState, 'Tự động lưu', playTime);
  } catch (error) {
    console.warn('⚠️ Auto-save failed:', error);
    // Don't throw - auto-save failure shouldn't break game
  }
}

// Check if auto-save exists
export function hasAutoSave(): boolean {
  return loadGame('auto') !== null;
}

// Load auto-save
export function loadAutoSave(): SaveGameData | null {
  return loadGame('auto');
}

// Calculate game progress percentage
function calculateProgress(gameState: GameState): number {
  const totalPossibleEvidence = 8; // From evidence.ts
  const totalCharacters = 4; // From characters.ts
  const maxConversations = totalCharacters * 3; // Assume 3 meaningful convos per character

  const evidenceProgress = (gameState.evidenceFound.length / totalPossibleEvidence) * 40; // 40% weight
  const conversationProgress = (gameState.conversationHistory.length / maxConversations) * 30; // 30% weight
  const trustProgress = (Object.values(gameState.npcTrust).reduce((sum, trust) => sum + trust, 0) / (totalCharacters * 100)) * 20; // 20% weight
  const gamePhaseProgress = gameState.gamePhase === 'accusation' ? 5 : 0; // 5% weight for accusation phase

  return Math.min(100, Math.round(evidenceProgress + conversationProgress + trustProgress + gamePhaseProgress));
}

// Get most suspected character based on trust levels
function getMostSuspectedCharacter(gameState: GameState): string | undefined {
  const trustLevels = gameState.npcTrust;
  const lowestTrust = Math.min(...Object.values(trustLevels));
  
  const suspectedCharacter = Object.entries(trustLevels).find(([, trust]) => trust === lowestTrust);
  return suspectedCharacter?.[0];
}

// Export save data (for sharing or backup)
export function exportSave(slotId: string): string | null {
  const saveData = loadGame(slotId);
  if (!saveData) return null;

  try {
    return btoa(JSON.stringify(saveData)); // Base64 encode
  } catch (error) {
    console.error('❌ Failed to export save:', error);
    return null;
  }
}

// Import save data
export function importSave(slotId: string, encodedData: string): boolean {
  try {
    const saveData: SaveGameData = JSON.parse(atob(encodedData)); // Base64 decode
    
    // Validate save data structure
    if (!saveData.gameState || !saveData.timestamp) {
      throw new Error('Invalid save data format');
    }

    // Update ID and timestamp
    saveData.id = slotId;
    saveData.timestamp = Date.now();

    localStorage.setItem(SAVE_KEY_PREFIX + slotId, JSON.stringify(saveData));
    console.log(`✅ Save imported to slot ${slotId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to import save:', error);
    return false;
  }
}

// Clear all saves (for reset)
export function clearAllSaves(): void {
  for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
    deleteSave(i.toString());
  }
  deleteSave('auto');
  console.log('✅ All saves cleared');
} 