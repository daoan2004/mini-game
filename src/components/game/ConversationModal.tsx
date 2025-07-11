'use client';

import { useState, useEffect, useRef } from 'react';
import { Character } from '../../types/game';
import { getCharacterResponse } from '../../utils/ai';
import { useGameStore } from '../../stores/gameStore';
import { EVIDENCE_ITEMS } from '../../data/evidence';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import Image from 'next/image';
import { SmartQuestionPanel } from './SmartQuestionPanel';
import { QuickEvidenceIntegration } from './QuickEvidenceIntegration';

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
}

interface Message {
  id: string;
  sender: 'player' | 'character';
  text: string;
  timestamp: number;
  evidenceShown?: string;
}

export default function ConversationModal({ 
  isOpen, 
  onClose, 
  character 
}: ConversationModalProps) {
  const { 
    npcTrust, 
    npcEmotionalState, 
    evidenceFound,
    addConversation,
    updateNpcTrust,
    updateNpcEmotion
  } = useGameStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<string>('');
  const [showSmartQuestions, setShowSmartQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const trustLevel = npcTrust[character.id] || 50;
  const emotionalState = npcEmotionalState[character.id] || 'calm';

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getCharacterGreeting(character.id, trustLevel);
      setMessages([{
        id: '1',
        sender: 'character',
        text: greeting,
        timestamp: Date.now()
      }]);
    }
  }, [isOpen, character.id, trustLevel, messages.length]);

  const getCharacterGreeting = (characterId: string, trust: number): string => {
    const greetings = {
      arthur: trust > 60 ? 
        "Thám tử... Tôi đoán ông còn nhiều câu hỏi. Tôi sẽ cố gắng giúp đỡ hết sức." :
        trust < 30 ?
        "Ông muốn gì nữa? Ông chưa làm phiền tôi đủ sao?" :
        "Lại là ông. Lần này có chuyện gì?",
      
      selena: trust > 60 ?
        "Thám tử, xin mời vào. Tôi biết việc này khó khăn, nhưng tôi muốn giúp tìm ra sự thật." :
        trust < 30 ?
        "Tôi đã kể cho ông tất cả những gì tôi biết. Cuộc thẩm vấn này trở nên khá mệt mỏi." :
        "Thám tử. Hôm nay tôi có thể giúp gì cho ông?",
      
      elise: trust > 60 ?
        "Ôi, thám tử! Xin mời ngồi. Tôi... tôi có thể đã nhớ ra điều gì đó." :
        trust < 30 ?
        "Tôi... tôi không biết còn có thể nói gì nữa. Xin đừng bắt tôi nói về chuyện này nữa." :
        "Thám tử, ông muốn biết điều gì?",
      
      marcus: trust > 60 ?
        "Chào thám tử. Tôi biết trước đây tôi có vẻ đáng nghi, nhưng tôi thực sự muốn giúp đỡ." :
        trust < 30 ?
        "Ugh, ông lại đây. Tôi đã nói rồi tôi không làm gì sai cả." :
        "Ồ. Lại là ông. Ông muốn biết gì?"
    };

    return greetings[characterId as keyof typeof greetings] || "Xin chào, thám tử.";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const playerMessage: Message = {
      id: Date.now().toString(),
      sender: 'player',
      text: inputText,
      timestamp: Date.now(),
      evidenceShown: selectedEvidence || undefined
    };

    setMessages(prev => [...prev, playerMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Get AI response
      const gameState = useGameStore.getState();
      const result = await getCharacterResponse(
        character.id,
        inputText,
        gameState,
        selectedEvidence || undefined
      );

      // Add character response
      const characterMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'character',
        text: result.response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, characterMessage]);

      // Add to conversation history
      addConversation({
        id: Date.now().toString(),
        characterId: character.id,
        message: inputText,
        timestamp: Date.now(),
        evidenceShown: selectedEvidence || undefined,
        trustChange: 0
      });

      // Handle trust changes based on conversation
      if (selectedEvidence) {
        // Showing evidence affects trust
        const trustChange = selectedEvidence.includes(character.id) ? -5 : 2;
        updateNpcTrust(character.id, trustChange);
      } else {
        // Normal conversation slightly increases trust
        updateNpcTrust(character.id, 1);
      }

      // Update emotional state based on conversation
      if (inputText.toLowerCase().includes('accuse') || inputText.toLowerCase().includes('guilty')) {
        updateNpcEmotion(character.id, 'defensive');
      } else if (inputText.toLowerCase().includes('trust') || inputText.toLowerCase().includes('help')) {
        updateNpcEmotion(character.id, 'calm');
      }

    } catch (error) {
      console.error('Conversation error:', error);
      
      // Better error handling with helpful messages
      let fallbackText = "Tôi... xin lỗi, tôi quá xúc động để nói chuyện bây giờ.";
      
      // Check if it's an API configuration issue
      if (error instanceof Error) {
        if (error.message.includes('API') || error.message.includes('500')) {
          fallbackText = "⚠️ AI đang bảo trì. Hãy thử nói chuyện với nhân vật khác hoặc reset game.";
        } else if (error.message.includes('429') || error.message.includes('QUOTA')) {
          fallbackText = "⏳ Quá nhiều câu hỏi trong 1 phút. Hãy đợi 30 giây rồi thử lại.";
        }
      }
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'character',
        text: fallbackText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
      setSelectedEvidence('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuestionSelect = (question: string) => {
    setInputText(question);
  };

  const handleQuestionWithEvidence = (question: string, evidenceId: string) => {
    setInputText(question);
    setSelectedEvidence(evidenceId);
  };

  const getTrustColor = (trust: number) => {
    if (trust >= 70) return 'text-green-400';
    if (trust >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'calm': return 'text-blue-400';
      case 'nervous': return 'text-yellow-400';
      case 'defensive': return 'text-orange-400';
      case 'angry': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Hội thoại với ${character.name}`}
      size="2xl"
      className="h-[95vh]"
    >
      <div className="flex flex-col lg:flex-row gap-4 h-full">
                {/* Left Panel - Chat */}
        <div className="flex-1 flex flex-col min-w-0 lg:min-h-0">
          {/* Character Info */}
          <div className="flex items-center space-x-3 bg-slate-700 rounded-lg p-3 mb-3 flex-shrink-0">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-600 rounded-full flex items-center justify-center">
            {character.avatar ? (
              <Image 
                src={character.avatar} 
                alt={character.name}
                width={64}
                height={64}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl text-slate-400">
                {character.name.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-white">{character.name}</h3>
            <p className="text-sm text-slate-400">{character.role}</p>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-xs sm:text-xs">
                Tin cậy: <span className={getTrustColor(trustLevel)}>{trustLevel}%</span>
              </span>
              <span className="text-xs sm:text-xs">
                Tâm trạng: <span className={getEmotionColor(emotionalState)}>
                  {emotionalState === 'calm' ? 'bình tĩnh' :
                   emotionalState === 'nervous' ? 'lo lắng' :
                   emotionalState === 'defensive' ? 'phòng thủ' :
                   emotionalState === 'angry' ? 'tức giận' : emotionalState}
                </span>
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setShowSmartQuestions(!showSmartQuestions)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showSmartQuestions 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
            }`}
          >
            🤖 AI
          </button>
        </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 p-2 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'player' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[85%] md:max-w-[80%] p-2 md:p-3 rounded-lg
                    ${message.sender === 'player' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-100'
                    }
                  `}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.evidenceShown && (
                    <div className="mt-2 pt-2 border-t border-slate-600">
                      <p className="text-xs opacity-75">
                        📋 Đã trình bày bằng chứng: {EVIDENCE_ITEMS[message.evidenceShown]?.name || message.evidenceShown}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-100 p-4 rounded-lg">
                  <LoadingSpinner size="sm" text="Đang suy nghĩ..." />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="flex-shrink-0 space-y-3">
            {/* Evidence Selection */}
            {evidenceFound.length > 0 && (
              <div>
                <label className="text-sm text-slate-400 mb-2 block">
                  Trình bày bằng chứng (tùy chọn):
                </label>
                <select
                  value={selectedEvidence}
                  onChange={(e) => setSelectedEvidence(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">Không có bằng chứng</option>
                  {evidenceFound.map((evidenceId) => {
                    const evidence = EVIDENCE_ITEMS[evidenceId];
                    return (
                      <option key={evidenceId} value={evidenceId}>
                        {evidence ? evidence.name : evidenceId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Đặt câu hỏi hoặc buộc tội..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
        
        {/* Right Panel - AI Suggestions */}
        {showSmartQuestions && (
          <div className="w-full lg:w-80 flex-shrink-0 overflow-y-auto max-h-96 lg:max-h-none">
            <SmartQuestionPanel
              character={character}
              onQuestionSelect={handleQuestionSelect}
              isVisible={true}
            />

            <QuickEvidenceIntegration
              character={character}
              onQuestionWithEvidence={handleQuestionWithEvidence}
              isVisible={true}
            />
          </div>
        )}
      </div>
    </Modal>
  );
} 