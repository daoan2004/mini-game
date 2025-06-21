import { Character } from '../types/game';

export const CHARACTERS: Record<string, Character> = {
  arthur: {
    id: 'arthur',
    name: 'Arthur Gilmore',
    role: 'Con trai lớn',
    background: 'Người đàn ông trung niên, lạnh lùng và cáu kỉnh. Đang gặp khó khăn tài chính nghiêm trọng.',
    secrets: [
      'Đang nợ khoản tiền lớn do cờ bạc',
      'Từng bị mẹ đe dọa tước quyền thừa kế',
      'Có mối quan hệ với người cho vay nặng lãi'
    ],
    trustLevel: 50,
    emotionalState: 'calm',
    avatar: '/images/arthur.jpg',
    greeting: 'Thám tử... Tôi đoán ông đến đây về việc của mẹ tôi. Thật là khủng khiếp.',
    lowTrustResponse: 'Tôi không hiểu tại sao phải nói với ông. Ông rõ ràng là nghi ngờ tôi.',
    highTrustResponse: 'Tôi tin ông đang làm mọi thứ để tìm ra sự thật. Tôi yêu mẹ dù chúng tôi có... bất đồng về tài chính.'
  },
  
  selena: {
    id: 'selena',
    name: 'Selena Gilmore',
    role: 'Con dâu',
    background: 'Người phụ nữ thanh lịch, thông minh. Luôn giữ vẻ ngoài điềm đạm nhưng ẩn chứa phẫn nộ.',
    secrets: [
      'Biết chồng ngoại tình từ lâu',
      'Đã chuẩn bị đơn ly hôn',
      'Có mâu thuẫn sâu sắc với mẹ chồng về quyền thừa kế'
    ],
    trustLevel: 50,
    emotionalState: 'calm',
    avatar: '/images/selena.jpg',
    greeting: 'Thám tử, tôi hy vọng ông sẽ tìm ra sự thật. Gia đình này đã trải qua quá nhiều đau khổ.',
    lowTrustResponse: 'Tôi cảm thấy ông không tin tôi. Đó không phải cách để giải quyết vụ việc này.',
    highTrustResponse: 'Tôi biết ông hiểu tôi. Có những điều... phức tạp trong gia đình này mà ông cần biết.'
  },
  
  elise: {
    id: 'elise',
    name: 'Elise',
    role: 'Người giúp việc',
    background: 'Người giúp việc trung thành đã làm việc hơn 20 năm. Yêu quý bà Marlene như người thân.',
    secrets: [
      'Có chìa khóa dự phòng phòng bà Marlene',
      'Đã thấy bà chủ rơi vật gì đó đêm qua',
      'Biết nhiều bí mật gia đình nhưng không dám nói'
    ],
    trustLevel: 50,
    emotionalState: 'nervous',
    avatar: '/images/elise.jpg',
    greeting: 'Thám tử ạ... Tôi vẫn không thể tin bà chủ đã ra đi. Bà ấy là người tốt với tôi.',
    lowTrustResponse: 'Tôi... tôi không biết có nên nói gì không. Ông có thể không hiểu.',
    highTrustResponse: 'Ông có vẻ tốt bụng. Tôi có thể kể cho ông nghe về những gì tôi biết, nhưng ông hứa sẽ bảo vệ tôi chứ?'
  },
  
  marcus: {
    id: 'marcus',
    name: 'Marcus',
    role: 'Cháu trai 17 tuổi',
    background: 'Thiếu niên nội tâm, ít nói. Thường bị người lớn mắng do tính cách nổi loạn.',
    secrets: [
      'Đã lén trốn khỏi phòng vào đêm xảy ra án mạng',
      'Có thể là người cuối cùng gặp bà Marlene',
      'Đang giấu điều gì đó quan trọng'
    ],
    trustLevel: 50,
    emotionalState: 'nervous',
    avatar: '/images/marcus.jpg',
    greeting: 'Ông là thám tử à? Tôi không biết gì về việc bà ngoại chết đâu...',
    lowTrustResponse: 'Sao ông cứ nhìn tôi thế? Tôi chỉ là đứa trẻ thôi mà.',
    highTrustResponse: 'Được rồi... có lẽ tôi nên kể cho ông nghe. Nhưng ông đừng nói với ai nhé?'
  },
  
  marlene: {
    id: 'marlene',
    name: 'Marlene Gilmore',
    role: 'Nạn nhân (70 tuổi)',
    background: 'Người đứng đầu dòng họ Gilmore. Cứng rắn, truyền thống, có cái nhìn sắc bén về gia đình.',
    secrets: [
      'Định thay đổi di chúc trước khi chết',
      'Biết về việc Arthur nợ nần',
      'Phát hiện ra bí mật của Selena'
    ],
    trustLevel: 50,
    emotionalState: 'calm',
    avatar: '/images/marlene.jpg',
    greeting: '',
    lowTrustResponse: '',
    highTrustResponse: ''
  }
};

// Character relationship matrix
export const CHARACTER_RELATIONSHIPS = {
  arthur: {
    selena: 'spouse', // Vợ chồng
    marlene: 'mother', // Mẹ con
    marcus: 'uncle', // Chú cháu
    elise: 'employer' // Chủ tớ
  },
  selena: {
    arthur: 'spouse',
    marlene: 'mother_in_law', // Nàng dâu
    marcus: 'aunt', // Dì cháu
    elise: 'employer'
  },
  elise: {
    marlene: 'employer', // Chủ tớ trung thành
    arthur: 'employer',
    selena: 'employer',
    marcus: 'employer'
  },
  marcus: {
    marlene: 'grandmother', // Bà cháu
    arthur: 'uncle',
    selena: 'aunt',
    elise: 'family_friend'
  }
};

// Get character by ID
export function getCharacter(id: string): Character | undefined {
  return CHARACTERS[id];
}

// Get all characters except marlene (she's dead)
export function getAliveCharacters(): Character[] {
  return Object.values(CHARACTERS).filter(char => char.id !== 'marlene');
}

// Get character relationship
export function getRelationship(char1: string, char2: string): string | undefined {
  const relationships = CHARACTER_RELATIONSHIPS[char1 as keyof typeof CHARACTER_RELATIONSHIPS];
  if (!relationships) return undefined;
  return relationships[char2 as keyof typeof relationships];
} 