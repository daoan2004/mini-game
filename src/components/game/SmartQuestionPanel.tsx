'use client';

import React, { useState, useEffect } from 'react';
import { Character } from '../../types/game';
import { QuestionSuggestion, QuestionSuggestionEngine } from '../../utils/questionSuggestions';
import { useGameStore } from '../../stores/gameStore';

interface SmartQuestionPanelProps {
  character: Character;
  onQuestionSelect: (question: string) => void;
  isVisible: boolean;
}

export function SmartQuestionPanel({ character, onQuestionSelect, isVisible }: SmartQuestionPanelProps) {
  const { evidenceFound, npcTrust, conversationHistory } = useGameStore();
  const [suggestions, setSuggestions] = useState<QuestionSuggestion[]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showHints, setShowHints] = useState(true);

  const trustLevel = npcTrust[character.id] || 50;

  // Update suggestions when evidence or character changes
  useEffect(() => {
    const newSuggestions = QuestionSuggestionEngine.getSuggestedQuestions(
      character,
      evidenceFound,
      trustLevel,
      conversationHistory
    );
    setSuggestions(newSuggestions);

    const newHints = QuestionSuggestionEngine.getContextualHints(
      character,
      evidenceFound,
      trustLevel
    );
    setHints(newHints);
  }, [character, evidenceFound, trustLevel, conversationHistory]);

  if (!isVisible) return null;

  // Get unique categories
  const categories = ['all', ...new Set(suggestions.map(s => s.category))];

  // Filter suggestions by category
  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'border-red-500 bg-red-50 text-red-800';
    if (priority >= 4) return 'border-orange-500 bg-orange-50 text-orange-800';
    if (priority >= 3) return 'border-yellow-500 bg-yellow-50 text-yellow-800';
    return 'border-gray-500 bg-gray-50 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'evidence-based': return '🔍';
      case 'relationship': return '👥';
      case 'alibi': return '⏰';
      case 'motive': return '💰';
      case 'pressure': return '⚡';
      default: return '💬';
    }
  };

  const getReactionIcon = (reaction: string) => {
    switch (reaction) {
      case 'defensive': return '🛡️';
      case 'nervous': return '😰';
      case 'cooperative': return '😊';
      case 'angry': return '😠';
      case 'surprised': return '😲';
      default: return '🤔';
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 mb-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          🤖 Gợi Ý AI
        </h3>
        <button
          onClick={() => setShowHints(!showHints)}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {showHints ? 'Ẩn' : 'Hiện'}
        </button>
      </div>

      {/* Contextual Hints */}
      {showHints && hints.length > 0 && (
        <div className="mb-3 p-2 bg-blue-900 bg-opacity-50 rounded border border-blue-500 flex-shrink-0">
          <h4 className="text-xs font-medium text-blue-300 mb-1">💡 Gợi ý:</h4>
          <div className="space-y-1">
            {hints.slice(0, 2).map((hint, index) => (
              <div key={index} className="text-xs text-blue-200">
                {hint}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Level Indicator */}
      <div className="mb-3 p-2 bg-slate-700 rounded flex-shrink-0">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300">Tin tưởng:</span>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-slate-600 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all ${
                  trustLevel >= 70 ? 'bg-green-500' :
                  trustLevel >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${trustLevel}%` }}
              />
            </div>
            <span className={`font-medium text-xs ${
              trustLevel >= 70 ? 'text-green-400' :
              trustLevel >= 40 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {trustLevel}%
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-3 flex-shrink-0">
        <div className="flex flex-wrap gap-1">
          {categories.slice(0, 4).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {category === 'all' ? 'Tất cả' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Question Suggestions */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredSuggestions.length === 0 ? (
          <div className="text-center py-4 text-slate-400">
            <div className="text-2xl mb-1">🤔</div>
            <p className="text-xs">Không có câu hỏi phù hợp.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSuggestions.slice(0, 6).map((suggestion) => (
              <div
                key={suggestion.id}
                className={`border-l-4 p-2 rounded-r cursor-pointer transition-all hover:shadow-md ${getPriorityColor(suggestion.priority)}`}
                onClick={() => onQuestionSelect(suggestion.text)}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{getTypeIcon(suggestion.type)}</span>
                    <span className="text-xs font-medium px-1 py-0.5 bg-white bg-opacity-20 rounded">
                      {suggestion.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-xs">P{suggestion.priority}</span>
                    <span className="text-xs">{getReactionIcon(suggestion.expectedReaction)}</span>
                  </div>
                </div>
                
                <p className="text-xs font-medium mb-1 leading-relaxed">
                  {suggestion.text}
                </p>
                
                <div className="text-xs opacity-70">
                  {suggestion.expectedReaction}
                </div>
              </div>
            ))}
            
            {filteredSuggestions.length > 6 && (
              <div className="text-center text-xs text-slate-400 py-2">
                +{filteredSuggestions.length - 6} câu hỏi khác...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 