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
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          🤖 Gợi Ý AI
        </h3>
        <button
          onClick={() => setShowHints(!showHints)}
          className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {showHints ? 'Ẩn gợi ý' : 'Hiện gợi ý'}
        </button>
      </div>

      {/* Contextual Hints */}
      {showHints && hints.length > 0 && (
        <div className="mb-4 p-3 bg-blue-900 bg-opacity-50 rounded border border-blue-500">
          <h4 className="text-sm font-medium text-blue-300 mb-2">💡 Gợi ý chiến thuật:</h4>
          <div className="space-y-1">
            {hints.map((hint, index) => (
              <div key={index} className="text-sm text-blue-200">
                {hint}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Level Indicator */}
      <div className="mb-4 p-2 bg-slate-700 rounded">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Độ tin tưởng:</span>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-slate-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  trustLevel >= 70 ? 'bg-green-500' :
                  trustLevel >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${trustLevel}%` }}
              />
            </div>
            <span className={`font-medium ${
              trustLevel >= 70 ? 'text-green-400' :
              trustLevel >= 40 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {trustLevel}%
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
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
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredSuggestions.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <div className="text-4xl mb-2">🤔</div>
            <p>Không có câu hỏi phù hợp.</p>
            <p className="text-sm mt-1">Hãy tìm thêm bằng chứng hoặc thử danh mục khác.</p>
          </div>
        ) : (
          filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`border-l-4 p-3 rounded-r cursor-pointer transition-all hover:shadow-md ${getPriorityColor(suggestion.priority)}`}
              onClick={() => onQuestionSelect(suggestion.text)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                  <span className="text-xs font-medium px-2 py-1 bg-white bg-opacity-20 rounded">
                    {suggestion.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span>Ưu tiên: {suggestion.priority}</span>
                  <span>{getReactionIcon(suggestion.expectedReaction)}</span>
                </div>
              </div>
              
              <p className="text-sm font-medium mb-2 leading-relaxed">
                {suggestion.text}
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-opacity-70">
                  Phản ứng dự kiến: {suggestion.expectedReaction}
                </span>
                {suggestion.requiredEvidence && (
                  <span className="text-opacity-70">
                    Cần: {suggestion.requiredEvidence.join(', ')}
                  </span>
                )}
              </div>

              {/* Follow-up questions preview */}
              {suggestion.followUpQuestions && suggestion.followUpQuestions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white border-opacity-20">
                  <div className="text-xs text-opacity-70 mb-1">Câu hỏi tiếp theo:</div>
                  <div className="text-xs space-y-1">
                    {suggestion.followUpQuestions.slice(0, 2).map((followUp, i) => (
                      <div key={i} className="text-opacity-60">• {followUp}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-3 border-t border-slate-600 text-xs text-slate-400">
        <div className="flex justify-between">
          <span>Tổng câu hỏi: {suggestions.length}</span>
          <span>Bằng chứng: {evidenceFound.length}</span>
          <span>Đã hỏi: {conversationHistory.filter(msg => msg.characterId === character.id).length}</span>
        </div>
      </div>
    </div>
  );
} 