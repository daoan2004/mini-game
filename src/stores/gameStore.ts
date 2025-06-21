import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, ConversationMessage, EmotionalState } from '../types/game';

// Toast
interface ToastState {
  isOpen: boolean;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface GameStore extends GameState {
  toast: ToastState;
  // Actions
  addEvidence: (evidenceId: string) => void;
  updateNpcTrust: (characterId: string, change: number) => void;
  updateNpcEmotion: (characterId: string, emotion: EmotionalState) => void;
  addConversation: (message: ConversationMessage) => void;
  setAccused: (characterId: string) => void;
  setGamePhase: (phase: GameState['gamePhase']) => void;
  setCurrentRoom: (room: string) => void;
  updateGameFlag: (flag: keyof GameState['gameFlags'], value: boolean) => void;
  resetGame: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: () => void;
}

const initialGameState: GameState = {
  evidenceFound: [],
  currentRoom: 'living_room',
  gamePhase: 'investigation',
  accused: undefined,
  npcTrust: {
    'arthur': 50,
    'selena': 50,
    'elise': 50,
    'marcus': 50,
  },
  npcEmotionalState: {
    'arthur': 'calm',
    'selena': 'calm',
    'elise': 'nervous',
    'marcus': 'nervous',
  },
  conversationHistory: [],
  gameFlags: {
    foundRealClue: false,
    falseAccusationMade: false,
    maxTurnsReached: false,
    gameComplete: false,
  },
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialGameState,
      toast: {
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
      },

      // Add evidence to player's inventory
      addEvidence: (evidenceId: string) =>
        set((state) => ({
          evidenceFound: [...new Set([...state.evidenceFound, evidenceId])],
        })),

      // Update NPC trust level (0-100)
      updateNpcTrust: (characterId: string, change: number) =>
        set((state) => ({
          npcTrust: {
            ...state.npcTrust,
            [characterId]: Math.max(0, Math.min(100, (state.npcTrust[characterId] || 50) + change)),
          },
        })),

      // Update NPC emotional state
      updateNpcEmotion: (characterId: string, emotion: EmotionalState) =>
        set((state) => ({
          npcEmotionalState: {
            ...state.npcEmotionalState,
            [characterId]: emotion,
          },
        })),

      // Add conversation to history
      addConversation: (message: ConversationMessage) =>
        set((state) => ({
          conversationHistory: [...state.conversationHistory, message],
        })),

      // Set accused character
      setAccused: (characterId: string) =>
        set({ accused: characterId }),

      // Set game phase
      setGamePhase: (phase: GameState['gamePhase']) =>
        set({ gamePhase: phase }),

      // Set current room
      setCurrentRoom: (room: string) =>
        set({ currentRoom: room }),

      // Update game flags
      updateGameFlag: (flag: keyof GameState['gameFlags'], value: boolean) =>
        set((state) => ({
          gameFlags: {
            ...state.gameFlags,
            [flag]: value,
          },
        })),

      // Reset game to initial state
      resetGame: () =>
        set({ 
          ...initialGameState,
          toast: {
            isOpen: false,
            title: '',
            message: '',
            type: 'info'
          }
        }),

      // Toast actions
      showToast: (title: string, message?: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') =>
        set(() => ({
          toast: {
            isOpen: true,
            title,
            message,
            type
          }
        })),

      hideToast: () =>
        set((state) => ({
          toast: {
            ...state.toast,
            isOpen: false
          }
        })),
    }),
    {
      name: 'mystery-game-storage',
      // Only persist important game state, not temporary UI state
      partialize: (state) => ({
        evidenceFound: state.evidenceFound,
        currentRoom: state.currentRoom,
        gamePhase: state.gamePhase,
        accused: state.accused,
        npcTrust: state.npcTrust,
        npcEmotionalState: state.npcEmotionalState,
        conversationHistory: state.conversationHistory,
        gameFlags: state.gameFlags,
      }),
    }
  )
); 