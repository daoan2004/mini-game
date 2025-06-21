import { GameState } from '../types/game';

// Character persona prompts
const CHARACTER_PERSONAS = {
  arthur: `
    Bạn là Arthur Gilmore, con trai lớn của Marlene Gilmore đã qua đời. Bạn lạnh lùng, cáu kỉnh và đang gặp khó khăn tài chính. Mẹ bạn từng đe dọa tước quyền thừa kế. Bạn cảm thấy bị nghi ngờ và cố gắng tỏ ra vô tội nhưng mất kiểm soát cảm xúc khi bị thẩm vấn gắt gao. Bạn đang giấu một bí mật lớn nhưng không dễ dàng tiết lộ. Hãy trả lời với giọng điệu hơi phòng thủ và kiêu ngạo. Trả lời bằng tiếng Việt.
  `,
  selena: `
    Bạn là Selena Gilmore, con dâu của Marlene. Bạn thanh lịch, thông minh, nói chuyện nhẹ nhàng nhưng ẩn chứa sự tức giận. Bạn biết chồng ngoại tình và có xung đột với mẹ chồng. Bạn luôn duy trì vẻ ngoài bình tĩnh nhưng dễ nổi giận khi bị dồn vào góc. Hãy trả lời như người có điều gì đó để giấu giếm, với chút mỉa mai tinh tế. Trả lời bằng tiếng Việt.
  `,
  elise: `
    Bạn là Elise, người giúp việc trung thành đã làm việc tại biệt thự Gilmore hơn 20 năm. Bạn yêu quý Marlene như người thân nhưng thường bị coi thường. Bạn thận trọng và có xu hướng tránh né những câu hỏi nhạy cảm. Khi bị hỏi, bạn có thể trở nên xúc động. Hãy trả lời như người biết điều gì đó quan trọng nhưng sợ phải lên tiếng, với lời nói lo lắng và khiêm tốn. Trả lời bằng tiếng Việt.
  `,
  marcus: `
    Bạn là Marcus, cháu trai 17 tuổi của Marlene. Bạn sống nội tâm, ít nói và thường bị người lớn mắng. Bạn đã lén trốn khỏi phòng vào đêm vụ án mạng xảy ra. Bạn cảm thấy bị hiểu lầm. Hãy trả lời như một thiếu niên cố gắng chứng minh vô tội nhưng sợ hãi, với ngôn ngữ phòng thủ và đôi khi bướng bỉnh. Trả lời bằng tiếng Việt.
  `
};

// Generate dynamic prompt based on game state
function generatePrompt(
  characterId: string, 
  userMessage: string, 
  gameState: GameState,
  evidenceShown?: string
): string {
  const persona = CHARACTER_PERSONAS[characterId as keyof typeof CHARACTER_PERSONAS];
  const trustLevel = gameState.npcTrust[characterId] || 50;
  const emotionalState = gameState.npcEmotionalState[characterId] || 'calm';
  
  let contextInfo = '';
  
  // Add trust level context
  if (trustLevel < 30) {
    contextInfo += 'Bạn rất nghi ngờ thám tử và miễn cưỡng chia sẻ thông tin. ';
  } else if (trustLevel > 70) {
    contextInfo += 'Bạn tin tưởng thám tử và sẵn sàng mở lòng hơn. ';
  }
  
  // Add emotional state context
  switch (emotionalState) {
    case 'nervous':
      contextInfo += 'Bạn đang cảm thấy lo lắng và bồn chồn. ';
      break;
    case 'defensive':
      contextInfo += 'Bạn đang cảm thấy phòng thủ và cảnh giác. ';
      break;
    case 'angry':
      contextInfo += 'Bạn đang cảm thấy tức giận và đối đầu. ';
      break;
  }
  
  // Add evidence context
  if (evidenceShown) {
    contextInfo += `Thám tử đang trình bày bằng chứng cho bạn: ${evidenceShown}. Hãy phản ứng phù hợp với bằng chứng này. `;
  }
  
  return `
    ${persona}
    
    BỐI CẢNH: ${contextInfo}
    
    LỊCH SỬ HỘI THOẠI: Bạn đã nói chuyện với thám tử đang điều tra cái chết của Marlene.
    
    TIN NHẮN CỦA THÁM TỬ: "${userMessage}"
    
    HƯỚNG DẪN:
    - Luôn giữ đúng nhân vật
    - Giữ câu trả lời dưới 100 từ
    - Nói chuyện tự nhiên và thân thiện
    - Thể hiện tính cách qua cách nói
    - Phản ứng phù hợp với bằng chứng nếu được trình bày
    - Đừng tiết lộ bí mật quá dễ dàng
    - Mức độ tin cậy của bạn với thám tử là ${trustLevel}/100
    - HÃY TRẢ LỜI BẰNG TIẾNG VIỆT
    
    TRẢ LỜI với vai ${characterId.toUpperCase()}:
  `;
}

// Call AI with error handling and fallbacks
export async function getCharacterResponse(
  characterId: string,
  userMessage: string,
  gameState: GameState,
  evidenceShown?: string
): Promise<{ response: string; error?: string }> {
  try {
    const prompt = generatePrompt(characterId, userMessage, gameState, evidenceShown);
    
    // Call our API route instead of direct Gemini API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.response) {
      throw new Error('Invalid API response');
    }
    
    return { response: data.response };
    
  } catch (error) {
    console.error('AI API Error:', error);
    
    // Fallback responses based on character and context
    const fallbackResponse = getFallbackResponse(characterId, userMessage, gameState);
    return { 
      response: fallbackResponse, 
      error: 'AI tạm thời không khả dụng' 
    };
  }
}

// Fallback responses for when AI fails
function getFallbackResponse(
  characterId: string, 
  userMessage: string, 
  gameState: GameState
): string {
  const trustLevel = gameState.npcTrust[characterId] || 50;
  
  const fallbacks = {
    arthur: [
      "Tôi đã kể cho ông tất cả những gì tôi biết rồi.",
      "Nghe này, tôi không có thời gian cho chuyện này.",
      "Ông có đang buộc tội tôi không?",
    ],
    selena: [
      "Tôi không chắc còn có thể nói gì khác nữa.",
      "Đó là... một câu hỏi thú vị.",
      "Tôi thích giữ riêng tư những vấn đề gia đình.",
    ],
    elise: [
      "Tôi... tôi không biết có nên nói không.",
      "Xin lỗi, tôi chỉ muốn giúp đỡ thôi.",
      "Bà Marlene là một người phụ nữ tốt.",
    ],
    marcus: [
      "Tôi đã nói rồi mà, tôi không làm gì cả.",
      "Sao mọi người đều đổ lỗi cho tôi?",
      "Tôi có thể đi được chưa?",
    ]
  };
  
  const characterFallbacks = fallbacks[characterId as keyof typeof fallbacks] || ["Tôi không biết."];
  
  // Choose fallback based on trust level
  if (trustLevel < 30) {
    return characterFallbacks[0]; // Most defensive
  } else if (trustLevel > 70) {
    return characterFallbacks[characterFallbacks.length - 1]; // Most cooperative
  } else {
    return characterFallbacks[1] || characterFallbacks[0]; // Neutral
  }
}

// Calculate trust change based on player action
export function calculateTrustChange(
  action: string,
  characterId: string,
  evidenceShown?: string
): number {
  // Base trust changes by action type
  const baseTrustChanges = {
    'trust': 10,
    'interrogate': -5,
    'accuse': -20,
    'present_evidence': 0, // Depends on evidence relevance
  };
  
  let change = baseTrustChanges[action as keyof typeof baseTrustChanges] || 0;
  
  // Modify based on evidence relevance
  if (evidenceShown && action === 'present_evidence') {
    // This would need actual evidence-character relationship data
    // For now, just basic logic
    if (evidenceShown.includes(characterId)) {
      change = -10; // Showing relevant evidence decreases trust
    } else {
      change = 5; // Showing irrelevant evidence slightly increases trust
    }
  }
  
  return change;
}

// Validate AI response for inappropriate content
export function validateAIResponse(response: string): boolean {
  // Basic content validation
  const inappropriatePatterns = [
    /\b(fuck|shit|damn)\b/i,
    /sexual|explicit|violence/i,
    // Add more patterns as needed
  ];
  
  return !inappropriatePatterns.some(pattern => pattern.test(response));
} 