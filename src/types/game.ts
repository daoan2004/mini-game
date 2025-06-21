// Game State Types
export type GamePhase = 'investigation' | 'accusation' | 'complete';
export type EmotionalState = 'calm' | 'nervous' | 'defensive' | 'angry';

// Character Interface
export interface Character {
  id: string;
  name: string;
  role: string;
  background: string;
  secrets: string[];
  trustLevel: number;
  emotionalState: EmotionalState;
  avatar?: string;
  greeting?: string;
  lowTrustResponse?: string;
  highTrustResponse?: string;
}

// Evidence Interface
export interface Evidence {
  id: string;
  name: string;
  description: string;
  image?: string;
  isRedHerring: boolean;
  relatedCharacter?: string;
  discovered: boolean;
}

// Game State Interface
export interface GameState {
  // Player progress
  evidenceFound: string[];
  currentRoom: string;
  gamePhase: GamePhase;
  accused?: string;
  
  // NPC relationships
  npcTrust: Record<string, number>;
  npcEmotionalState: Record<string, EmotionalState>;
  
  // Conversation history
  conversationHistory: ConversationMessage[];
  
  // Game flags
  gameFlags: {
    foundRealClue: boolean;
    falseAccusationMade: boolean;
    maxTurnsReached: boolean;
    gameComplete: boolean;
  };
}

// Conversation Types
export interface ConversationMessage {
  id: string;
  characterId: string;
  message: string;
  timestamp: number;
  evidenceShown?: string;
  trustChange?: number;
}

// Action Types
export type PlayerAction = 
  | 'interrogate'
  | 'present_evidence'
  | 'accuse'
  | 'trust'
  | 'leave';

export interface ActionResult {
  success: boolean;
  message: string;
  trustChange?: number;
  newEvidence?: string;
  gameStateChange?: Partial<GameState>;
} 