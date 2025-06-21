import { GameState } from '../types/game';
import { CRITICAL_EVIDENCE, RED_HERRINGS, EVIDENCE_ITEMS } from '../data/evidence';
import { CHARACTERS } from '../data/characters';

// The actual murderer and solution
export const SOLUTION = {
  murderer: 'selena', // Selena is the actual killer
  motive: 'inheritance_conflict',
  method: 'poison_in_wine',
  keyEvidence: ['wine_glass', 'threatening_letter', 'spare_key', 'diary_page']
};

export interface AccusationResult {
  success: boolean;
  isCorrect: boolean;
  message: string;
  evidenceScore: number;
  trustScore: number;
  gameEnded: boolean;
  ending: 'victory' | 'failure' | 'partial' | null;
}

// Check if player has enough evidence to make accusations
export function canMakeAccusation(evidenceFound: string[]): boolean {
  const criticalFound = CRITICAL_EVIDENCE.filter(id => evidenceFound.includes(id));
  return criticalFound.length >= 2; // Need at least 2 critical evidence
}

// Calculate evidence score (0-100)
export function calculateEvidenceScore(evidenceFound: string[]): number {
  const totalEvidence = Object.keys(EVIDENCE_ITEMS).length;
  const criticalFound = CRITICAL_EVIDENCE.filter(id => evidenceFound.includes(id));
  const redHerringsFound = RED_HERRINGS.filter(id => evidenceFound.includes(id));
  
  // Base score from evidence percentage
  const baseScore = (evidenceFound.length / totalEvidence) * 60;
  
  // Bonus for critical evidence
  const criticalBonus = (criticalFound.length / CRITICAL_EVIDENCE.length) * 30;
  
  // Penalty for red herrings
  const redHerringPenalty = redHerringsFound.length * 5;
  
  return Math.max(0, Math.min(100, baseScore + criticalBonus - redHerringPenalty));
}

// Calculate trust score with all NPCs
export function calculateTrustScore(npcTrust: Record<string, number>): number {
  const trustValues = Object.values(npcTrust);
  const averageTrust = trustValues.reduce((a, b) => a + b, 0) / trustValues.length;
  return Math.round(averageTrust);
}

// Make an accusation against a character
export function makeAccusation(
  accusedId: string, 
  gameState: GameState
): AccusationResult {
  const evidenceScore = calculateEvidenceScore(gameState.evidenceFound);
  const trustScore = calculateTrustScore(gameState.npcTrust);
  const criticalFound = CRITICAL_EVIDENCE.filter(id => gameState.evidenceFound.includes(id));
  
  const isCorrectAccusation = accusedId === SOLUTION.murderer;
  const hasEnoughEvidence = criticalFound.length >= 3;
  const hasHighTrust = trustScore >= 60;
  
  // Determine result based on multiple factors
  if (isCorrectAccusation && hasEnoughEvidence && hasHighTrust) {
    return {
      success: true,
      isCorrect: true,
      message: getVictoryMessage(accusedId, evidenceScore, trustScore),
      evidenceScore,
      trustScore,
      gameEnded: true,
      ending: 'victory'
    };
  } else if (isCorrectAccusation && hasEnoughEvidence) {
    return {
      success: true,
      isCorrect: true,
      message: getPartialVictoryMessage(accusedId, evidenceScore, trustScore),
      evidenceScore,
      trustScore,
      gameEnded: true,
      ending: 'partial'
    };
  } else if (isCorrectAccusation && !hasEnoughEvidence) {
    return {
      success: false,
      isCorrect: true,
      message: getInsufficientEvidenceMessage(accusedId),
      evidenceScore,
      trustScore,
      gameEnded: false,
      ending: null
    };
  } else {
    return {
      success: false,
      isCorrect: false,
      message: getWrongAccusationMessage(accusedId, evidenceScore),
      evidenceScore,
      trustScore,
      gameEnded: evidenceScore < 30, // Game ends if evidence score too low
      ending: evidenceScore < 30 ? 'failure' : null
    };
  }
}

// Get victory message
function getVictoryMessage(accusedId: string, evidenceScore: number, trustScore: number): string {
  const character = CHARACTERS[accusedId];
  return `
🎉 **VỤ ÁN ĐÃ ĐƯỢC GIẢI QUYẾT!** 🎉

Xuất sắc! Bạn đã thành công xác định **${character.name}** là kẻ giết Marlene Gilmore.

**Cuộc Điều Tra Của Bạn:**
- Điểm Bằng Chứng: ${evidenceScore}%
- Điểm Tin Cậy: ${trustScore}%

**Sự Thật Được Tiết Lộ:**
Selena đã đầu độc rượu vang của Marlene vì tuyệt vọng. Cô biết về khoản nợ cờ bạc của Arthur và sợ gia tài sẽ bị mất. Khi Marlene đe dọa thay đổi di chúc, Selena thấy cơ hội duy nhất đang trôi đi.

Sử dụng chìa khóa dự phòng của Elise, cô đã vào phòng Marlene đêm đó và đầu độc rượu. Vết son trên ly chính là sai lầm chết người - manh mối dẫn thám tử tài ba đến sự thật.

**Tình Trạng Vụ Án: ĐÃ GIẢI QUYẾT** ✅
Bạn thực sự là một thám tử bậc thầy! 🕵️‍♂️
  `;
}

// Get partial victory message
function getPartialVictoryMessage(accusedId: string, evidenceScore: number, trustScore: number): string {
  const character = CHARACTERS[accusedId];
  return `
⚖️ **BUỘC TỘI ĐÚNG - THÀNH CÔNG MỘT PHẦN** ⚖️

Bạn đã xác định chính xác **${character.name}** là kẻ giết người, nhưng vụ án có một số điểm yếu.

**Cuộc Điều Tra Của Bạn:**
- Điểm Bằng Chứng: ${evidenceScore}%
- Điểm Tin Cậy: ${trustScore}%

**Kết Quả:**
Dù bạn tìm đúng nghi phạm, ${trustScore < 60 ? 'sự thiếu tin cậy từ nhân chứng' : 'bằng chứng không đủ'} khiến vụ án khó chứng minh tại tòa. Selena thú tội dưới áp lực, nhưng một luật sư giỏi có thể tìm ra nghi ngờ hợp lý.

**Tình Trạng Vụ Án: GIẢI QUYẾT VỚI NGHI NGỜ** ⚠️
Công việc thám tử tốt, nhưng vẫn còn chỗ cải thiện.
  `;
}

// Get insufficient evidence message
function getInsufficientEvidenceMessage(accusedId: string): string {
  const character = CHARACTERS[accusedId];
  return `
❌ **BẰNG CHỨNG KHÔNG ĐỦ** ❌

Bạn nghi ngờ **${character.name}** là kẻ giết người, và trực giác có thể đúng, nhưng bạn không có đủ bằng chứng để buộc tội chắc chắn.

**Những gì bạn cần:**
- Thêm bằng chứng quan trọng (còn ${CRITICAL_EVIDENCE.length - CRITICAL_EVIDENCE.filter(id => EVIDENCE_ITEMS[id]).length} cái)
- Mức độ tin cậy cao hơn với nhân chứng
- Kết nối mạnh mẽ hơn giữa bằng chứng và nghi phạm

**Hãy tiếp tục điều tra!** Tìm kiếm thêm phòng và xây dựng mối quan hệ tốt hơn với nhân chứng. Sự thật đang trong tầm tay.

**Tình Trạng Vụ Án: ĐANG TIẾN HÀNH** 🔍
  `;
}

// Get wrong accusation message
function getWrongAccusationMessage(accusedId: string, evidenceScore: number): string {
  const character = CHARACTERS[accusedId];
  
  if (evidenceScore < 30) {
    return `
💥 **BUỘC TỘI SAI - VỤ ÁN ĐÓNG** 💥

Cáo buộc của bạn đối với **${character.name}** là sai và đã làm hỏng nghiêm trọng cuộc điều tra.

**Thất Bại Nghiêm Trọng:**
- Điểm Bằng Chứng: ${evidenceScore}% (Quá Thấp!)
- Kẻ giết người thật đã thoát tội
- Danh tiếng thám tử của bạn bị hủy hoại

**Điều gì đã sai:**
Bạn dựa quá nhiều vào bằng chứng giả và không thu thập đủ bằng chứng. ${character.name} có bằng chứng ngoại phạm, và kẻ giết người thật vẫn tự do.

**Tình Trạng Vụ Án: THẤT BẠI** ❌
Vụ án sẽ mãi mãi không được giải quyết.
    `;
  } else {
    return `
❌ **BUỘC TỘI SAI** ❌

Cáo buộc của bạn đối với **${character.name}** là không chính xác.

**Cuộc điều tra tiếp tục:**
- Điểm Bằng Chứng: ${evidenceScore}%
- Bạn vẫn còn cơ hội tìm ra kẻ giết người thật
- Xem lại bằng chứng và cân nhắc lại nghi phạm

**Phản hồi của ${character.name}:**
"Thám tử, tôi hiểu tại sao ông nghi ngờ tôi, nhưng tôi đảm bảo mình vô tội. Xin hãy tiếp tục điều tra - kẻ giết người thật phải được tìm ra."

**Tình Trạng Vụ Án: ĐANG TIẾN HÀNH** 🔍
Đừng bỏ cuộc! Sự thật vẫn ở ngoài kia.
    `;
  }
}

// Get available suspects for accusation
export function getAvailableSuspects(): string[] {
  return Object.keys(CHARACTERS).filter(id => id !== 'marlene'); // Can't accuse the victim
}

// Get investigation status
export function getInvestigationStatus(gameState: GameState): {
  evidenceScore: number;
  trustScore: number;
  canAccuse: boolean;
  progress: string;
} {
  const evidenceScore = calculateEvidenceScore(gameState.evidenceFound);
  const trustScore = calculateTrustScore(gameState.npcTrust);
  const canAccuse = canMakeAccusation(gameState.evidenceFound);
  
  let progress = 'Bắt Đầu';
  if (evidenceScore >= 80) progress = 'Điều Tra Chuyên Nghiệp';
  else if (evidenceScore >= 60) progress = 'Tiến Triển Tốt';
  else if (evidenceScore >= 40) progress = 'Đang Tiến Bộ';
  else if (evidenceScore >= 20) progress = 'Điều Tra Sơ Bộ';
  
  return {
    evidenceScore,
    trustScore,
    canAccuse,
    progress
  };
}

// Get hints for next steps
export function getInvestigationHints(gameState: GameState): string[] {
  const hints: string[] = [];
  const criticalFound = CRITICAL_EVIDENCE.filter(id => gameState.evidenceFound.includes(id));
  const trustScore = calculateTrustScore(gameState.npcTrust);
  
  if (criticalFound.length < 2) {
    hints.push("🔍 Tìm kiếm kỹ lưỡng hơn trong các phòng - bằng chứng quan trọng vẫn còn thiếu");
  }
  
  if (trustScore < 50) {
    hints.push("💬 Xây dựng mối quan hệ tốt hơn với nhân chứng qua đối thoại");
  }
  
  if (gameState.evidenceFound.length < 4) {
    hints.push("📋 Bạn mới chỉ tìm được vài mẩu bằng chứng - hãy tiếp tục tìm kiếm");
  }
  
  if (gameState.conversationHistory.length < 8) {
    hints.push("🗣️ Nói chuyện nhiều hơn với từng nhân vật để hiểu động cơ của họ");
  }
  
  if (RED_HERRINGS.some(id => gameState.evidenceFound.includes(id))) {
    hints.push("⚠️ Hãy cẩn thận - một số bằng chứng có thể đánh lừa");
  }
  
  return hints.length > 0 ? hints : ["🎯 Bạn đã sẵn sàng buộc tội!"];
} 