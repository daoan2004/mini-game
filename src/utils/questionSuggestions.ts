import { Character, ConversationMessage } from '../types/game';

export interface QuestionSuggestion {
  id: string;
  text: string;
  type: 'evidence-based' | 'general' | 'relationship' | 'alibi' | 'motive' | 'pressure';
  priority: number; // 1-5, higher = more important
  requiredEvidence?: string[];
  targetCharacter: string;
  category: string;
  expectedReaction: 'defensive' | 'nervous' | 'cooperative' | 'angry' | 'surprised';
  followUpQuestions?: string[];
}

// Evidence-based question templates
const EVIDENCE_QUESTION_TEMPLATES: Record<string, QuestionSuggestion[]> = {
  wine_glass: [
    {
      id: 'wine_glass_general',
      text: 'Tôi tìm thấy ly rượu vang này trong phòng bà Marlene. Anh/chị có biết gì về nó không?',
      type: 'evidence-based',
      priority: 4,
      requiredEvidence: ['wine_glass'],
      targetCharacter: 'all',
      category: 'Bằng chứng vật lý',
      expectedReaction: 'cooperative',
      followUpQuestions: [
        'Ai thường uống rượu vang trong nhà này?',
        'Bà Marlene có thói quen uống rượu trước khi ngủ không?'
      ]
    },
    {
      id: 'wine_glass_selena',
      text: 'Ly rượu này có vết son môi. Màu son này có giống với màu son chị thường dùng không?',
      type: 'evidence-based',
      priority: 5,
      requiredEvidence: ['wine_glass'],
      targetCharacter: 'selena',
      category: 'Bằng chứng định tội',
      expectedReaction: 'defensive'
    }
  ],

  threatening_letter: [
    {
      id: 'letter_general',
      text: 'Tôi tìm thấy lá thư đe dọa này. Anh/chị có nhận ra chữ viết không?',
      type: 'evidence-based',
      priority: 5,
      requiredEvidence: ['threatening_letter'],
      targetCharacter: 'all',
      category: 'Bằng chứng quan trọng',
      expectedReaction: 'surprised'
    },
    {
      id: 'letter_arthur',
      text: 'Lá thư này viết về vấn đề tài chính. Anh có đang gặp khó khăn về tiền bạc không?',
      type: 'evidence-based',
      priority: 4,
      requiredEvidence: ['threatening_letter'],
      targetCharacter: 'arthur',
      category: 'Động cơ tài chính',
      expectedReaction: 'defensive'
    }
  ],

  spare_key: [
    {
      id: 'key_elise',
      text: 'Chìa khóa dự phòng này được tìm thấy trong phòng chị. Chị có giải thích được không?',
      type: 'evidence-based',
      priority: 5,
      requiredEvidence: ['spare_key'],
      targetCharacter: 'elise',
      category: 'Cơ hội phạm tội',
      expectedReaction: 'nervous'
    }
  ],

  gambling_receipt: [
    {
      id: 'gambling_arthur',
      text: 'Biên lai cờ bạc này cho thấy anh nợ một khoản tiền lớn. Anh có cần tiền gấp không?',
      type: 'evidence-based',
      priority: 5,
      requiredEvidence: ['gambling_receipt'],
      targetCharacter: 'arthur',
      category: 'Động cơ tài chính',
      expectedReaction: 'angry',
      followUpQuestions: [
        'Anh có yêu cầu mẹ cho tiền trả nợ không?',
        'Bà Marlene có biết về việc cờ bạc của anh không?'
      ]
    }
  ]
};

// General questions when no specific evidence
const GENERAL_QUESTIONS: Record<string, QuestionSuggestion[]> = {
  arthur: [
    {
      id: 'arthur_relationship',
      text: 'Mối quan hệ giữa anh và mẹ anh thế nào gần đây?',
      type: 'relationship',
      priority: 3,
      targetCharacter: 'arthur',
      category: 'Mối quan hệ gia đình',
      expectedReaction: 'defensive'
    },
    {
      id: 'arthur_alibi',
      text: 'Anh ở đâu vào khoảng 10 giờ tối hôm qua?',
      type: 'alibi',
      priority: 4,
      targetCharacter: 'arthur',
      category: 'Chứng minh ngoại phạm',
      expectedReaction: 'cooperative'
    }
  ],

  selena: [
    {
      id: 'selena_inheritance',
      text: 'Chị có biết về kế hoạch thay đổi di chúc của bà Marlene không?',
      type: 'motive',
      priority: 4,
      targetCharacter: 'selena',
      category: 'Động cơ thừa kế',
      expectedReaction: 'nervous'
    },
    {
      id: 'selena_marriage',
      text: 'Cuộc hôn nhân của chị và Arthur thế nào?',
      type: 'relationship',
      priority: 3,
      targetCharacter: 'selena',
      category: 'Mối quan hệ gia đình',
      expectedReaction: 'defensive',
      followUpQuestions: [
        'Có vấn đề gì trong hôn nhân không?',
        'Bà Marlene có can thiệp vào cuộc hôn nhân của chị không?'
      ]
    }
  ],

  elise: [
    {
      id: 'elise_loyalty',
      text: 'Chị làm việc ở đây bao lâu rồi? Mối quan hệ với bà Marlene thế nào?',
      type: 'relationship',
      priority: 3,
      targetCharacter: 'elise',
      category: 'Mối quan hệ công việc',
      expectedReaction: 'cooperative'
    },
    {
      id: 'elise_access',
      text: 'Với tư cách người giúp việc, chị có thể tự do ra vào các phòng không?',
      type: 'general',
      priority: 4,
      targetCharacter: 'elise',
      category: 'Cơ hội phạm tội',
      expectedReaction: 'nervous',
      followUpQuestions: [
        'Chị có chìa khóa phòng bà Marlene không?',
        'Ai khác có thể vào phòng bà Marlene?'
      ]
    }
  ],

  marcus: [
    {
      id: 'marcus_behavior',
      text: 'Em có thấy có gì bất thường xảy ra tối qua không?',
      type: 'general',
      priority: 3,
      targetCharacter: 'marcus',
      category: 'Nhân chứng',
      expectedReaction: 'nervous'
    },
    {
      id: 'marcus_whereabouts',
      text: 'Em ở đâu vào tối qua? Có ai chứng kiến không?',
      type: 'alibi',
      priority: 4,
      targetCharacter: 'marcus',
      category: 'Chứng minh ngoại phạm',
      expectedReaction: 'defensive',
      followUpQuestions: [
        'Em có rời khỏi phòng lúc nào không?',
        'Em có nói chuyện với bà ngoại tối qua không?'
      ]
    }
  ]
};

// Pressure questions - use when trust is low or need to push harder
const PRESSURE_QUESTIONS: Record<string, QuestionSuggestion[]> = {
  arthur: [
    {
      id: 'arthur_pressure_money',
      text: 'Anh đang nợ tiền, mẹ anh từ chối giúp, và bây giờ bà ấy chết. Đây không phải trùng hợp đúng không?',
      type: 'pressure',
      priority: 5,
      targetCharacter: 'arthur',
      category: 'Áp lực tâm lý',
      expectedReaction: 'angry',
      followUpQuestions: [
        'Anh có giết mẹ mình vì tiền không?',
        'Anh nghĩ tôi sẽ tin lời biện minh của anh?'
      ]
    }
  ],

  selena: [
    {
      id: 'selena_pressure_wine',
      text: 'Vết son trên ly rượu khớp với son của chị. Chị còn muốn chối cãi nữa không?',
      type: 'pressure',
      priority: 5,
      requiredEvidence: ['wine_glass'],
      targetCharacter: 'selena',
      category: 'Đối chất bằng chứng',
      expectedReaction: 'defensive',
      followUpQuestions: [
        'Chị có uống rượu với bà Marlene tối đó không?',
        'Chị có bỏ gì vào ly rượu không?'
      ]
    }
  ]
};

export class QuestionSuggestionEngine {
  static getSuggestedQuestions(
    character: Character,
    evidenceFound: string[],
    trustLevel: number,
    conversationHistory: ConversationMessage[]
  ): QuestionSuggestion[] {
    const suggestions: QuestionSuggestion[] = [];

    // Add evidence-based questions
    evidenceFound.forEach(evidenceId => {
      const evidenceQuestions = EVIDENCE_QUESTION_TEMPLATES[evidenceId] || [];
      evidenceQuestions.forEach(q => {
        if (q.targetCharacter === character.id || q.targetCharacter === 'all') {
          suggestions.push(q);
        }
      });
    });

    // Add general questions
    const generalQuestions = GENERAL_QUESTIONS[character.id] || [];
    suggestions.push(...generalQuestions);

    // Add pressure questions if trust is low
    if (trustLevel < 30) {
      const pressureQuestions = PRESSURE_QUESTIONS[character.id] || [];
      suggestions.push(...pressureQuestions);
    }

    // Filter out questions already asked
    const askedQuestions = conversationHistory
      .filter(msg => msg.characterId === character.id)
      .map(msg => msg.message.toLowerCase());

    const filteredSuggestions = suggestions.filter(q => {
      const questionLower = q.text.toLowerCase();
      return !askedQuestions.some(asked => 
        asked.includes(questionLower.substring(0, 20)) || 
        questionLower.includes(asked.substring(0, 20))
      );
    });

    // Sort by priority
    return filteredSuggestions.sort((a, b) => b.priority - a.priority);
  }

  static getContextualHints(
    character: Character,
    evidenceFound: string[],
    trustLevel: number
  ): string[] {
    const hints: string[] = [];

    // Character-specific hints
    switch (character.id) {
      case 'arthur':
        if (evidenceFound.includes('gambling_receipt')) {
          hints.push('💡 Arthur có vẻ căng thẳng về tài chính. Hãy khai thác điều này.');
        }
        if (trustLevel < 40) {
          hints.push('⚠️ Arthur đang che giấu điều gì đó. Hãy áp lực hơn.');
        }
        break;

      case 'selena':
        if (evidenceFound.includes('wine_glass')) {
          hints.push('🔍 Ly rượu có thể liên quan đến Selena. Hãy hỏi về vết son.');
        }
        if (evidenceFound.includes('threatening_letter')) {
          hints.push('📝 Lá thư đe dọa có thể tiết lộ động cơ.');
        }
        break;

      case 'elise':
        if (evidenceFound.includes('spare_key')) {
          hints.push('🔑 Elise có chìa khóa dự phòng. Hãy hỏi về việc tiếp cận phòng.');
        }
        if (trustLevel > 70) {
          hints.push('✅ Elise tin tưởng bạn. Có thể hỏi về bí mật gia đình.');
        }
        break;

      case 'marcus':
        if (evidenceFound.length < 2) {
          hints.push('👦 Marcus có thể biết điều gì đó nhưng sợ nói. Hãy tạo niềm tin.');
        }
        break;
    }

    // General investigation hints
    if (evidenceFound.length === 0) {
      hints.push('🔍 Hãy tìm bằng chứng trước khi hỏi để có câu hỏi cụ thể hơn.');
    }

    if (trustLevel < 20) {
      hints.push('❌ Độ tin tưởng quá thấp. Hãy thử cách tiếp cận nhẹ nhàng hơn.');
    }

    return hints;
  }

  static getQuestionStrategy(
    character: Character,
    evidenceFound: string[],
    trustLevel: number
  ): {
    approach: 'gentle' | 'direct' | 'aggressive';
    reasoning: string;
    suggestedOrder: string[];
  } {
    let approach: 'gentle' | 'direct' | 'aggressive' = 'direct';
    let reasoning = '';
    const suggestedOrder: string[] = [];

    // Determine approach based on character and trust
    if (trustLevel < 20) {
      approach = 'gentle';
      reasoning = 'Độ tin tưởng thấp, cần xây dựng rapport trước';
      suggestedOrder.push('relationship', 'general', 'evidence-based');
    } else if (trustLevel > 70) {
      approach = 'direct';
      reasoning = 'Độ tin tưởng cao, có thể hỏi trực tiếp';
      suggestedOrder.push('evidence-based', 'motive', 'pressure');
    } else {
      approach = 'direct';
      reasoning = 'Cân bằng giữa xây dựng tin tưởng và thu thập thông tin';
      suggestedOrder.push('general', 'evidence-based', 'relationship');
    }

    // Adjust based on character personality
    switch (character.id) {
      case 'arthur':
        if (evidenceFound.includes('gambling_receipt') && trustLevel > 50) {
          approach = 'aggressive';
          reasoning = 'Có bằng chứng mạnh về Arthur, có thể áp lực';
        }
        break;
      case 'elise':
        approach = 'gentle';
        reasoning = 'Elise nhút nhát, cần tiếp cận nhẹ nhàng';
        break;
      case 'marcus':
        approach = 'gentle';
        reasoning = 'Marcus còn trẻ, cần tạo an toàn tâm lý';
        break;
    }

    return { approach, reasoning, suggestedOrder };
  }
} 