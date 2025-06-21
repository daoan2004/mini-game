import { Evidence } from '../types/game';

export const EVIDENCE_ITEMS: Record<string, Evidence> = {
  wine_glass: {
    id: 'wine_glass',
    name: 'Ly rượu vang với son môi',
    description: 'Một ly rượu vang có vết son môi đỏ, để trên bàn cạnh giường bà Marlene. Son môi có màu đỏ cam đặc trưng.',
    image: '/images/evidence/wine_glass.jpg',
    isRedHerring: false,
    relatedCharacter: 'selena',
    discovered: false
  },
  
  threatening_letter: {
    id: 'threatening_letter',
    name: 'Lá thư đe dọa',
    description: 'Một lá thư viết tay với nội dung đe dọa về việc thay đổi di chúc. Chữ viết có vẻ vội vàng và giận dữ.',
    image: '/images/evidence/letter.jpg',
    isRedHerring: false,
    relatedCharacter: 'arthur',
    discovered: false
  },
  
  broken_necklace: {
    id: 'broken_necklace',
    name: 'Vòng cổ bị đứt',
    description: 'Chiếc vòng cổ ngọc trai của bà Marlene bị đứt, với một số hạt ngọc trai rơi vương vãi trên sàn.',
    image: '/images/evidence/necklace.jpg',
    isRedHerring: false,
    relatedCharacter: 'marcus',
    discovered: false
  },
  
  diary_page: {
    id: 'diary_page',
    name: 'Trang nhật ký',
    description: 'Một trang nhật ký bị xé ra, ghi chép về việc phát hiện bí mật của ai đó trong gia đình.',
    image: '/images/evidence/diary.jpg',
    isRedHerring: false,
    relatedCharacter: 'elise',
    discovered: false
  },
  
  bloody_handkerchief: {
    id: 'bloody_handkerchief',
    name: 'Khăn tay có máu',
    description: 'Chiếc khăn tay trắng có vài giọt máu, được tìm thấy trong phòng tắm. Có thể là từ vết thương nhỏ.',
    image: '/images/evidence/handkerchief.jpg',
    isRedHerring: true, // Bằng chứng giả!
    relatedCharacter: undefined,
    discovered: false
  },
  
  spare_key: {
    id: 'spare_key',
    name: 'Chìa khóa dự phòng',
    description: 'Chìa khóa phòng bà Marlene được tìm thấy trong phòng của người giúp việc. Có vẻ được sử dụng gần đây.',
    image: '/images/evidence/key.jpg',
    isRedHerring: false,
    relatedCharacter: 'elise',
    discovered: false
  },
  
  gambling_receipt: {
    id: 'gambling_receipt',
    name: 'Biên lai cờ bạc',
    description: 'Hóa đơn từ sòng bạc cho thấy khoản nợ lớn. Ngày tháng rất gần với ngày bà Marlene qua đời.',
    image: '/images/evidence/receipt.jpg',
    isRedHerring: false,
    relatedCharacter: 'arthur',
    discovered: false
  },
  
  muddy_shoes: {
    id: 'muddy_shoes',
    name: 'Giày dính bùn',
    description: 'Đôi giày thể thao có vết bùn ướt, để ở cửa sau. Cho thấy ai đó đã ra vườn trong đêm mưa.',
    image: '/images/evidence/shoes.jpg',
    isRedHerring: true, // Bằng chứng giả - chỉ là Marcus lén ra ngoài
    relatedCharacter: 'marcus',
    discovered: false
  }
};

// Evidence rooms mapping - evidence nào ở phòng nào
export const EVIDENCE_LOCATIONS: Record<string, string[]> = {
  living_room: ['wine_glass', 'threatening_letter'],
  marlene_bedroom: ['broken_necklace', 'diary_page'],
  bathroom: ['bloody_handkerchief'],
  elise_room: ['spare_key'],
  arthur_study: ['gambling_receipt'],
  back_door: ['muddy_shoes']
};

// Critical evidence cần thiết để giải được vụ án
export const CRITICAL_EVIDENCE = [
  'wine_glass',      // Selena's lipstick
  'threatening_letter', // Arthur's desperation  
  'spare_key',       // Elise had access
  'diary_page'       // Marlene knew something
];

// Red herrings - bằng chứng giả
export const RED_HERRINGS = [
  'bloody_handkerchief',
  'muddy_shoes'
];

// Get evidence by ID
export function getEvidence(id: string): Evidence | undefined {
  return EVIDENCE_ITEMS[id];
}

// Get all evidence items
export function getAllEvidence(): Evidence[] {
  return Object.values(EVIDENCE_ITEMS);
}

// Get evidence by room
export function getEvidenceInRoom(room: string): Evidence[] {
  const evidenceIds = EVIDENCE_LOCATIONS[room] || [];
  return evidenceIds.map(id => EVIDENCE_ITEMS[id]).filter(Boolean);
}

// Check if evidence is discovered
export function isEvidenceDiscovered(evidenceId: string, discoveredEvidence: string[]): boolean {
  return discoveredEvidence.includes(evidenceId);
}

// Get evidence related to character
export function getEvidenceForCharacter(characterId: string): Evidence[] {
  return getAllEvidence().filter(evidence => evidence.relatedCharacter === characterId);
}

// Check if player has enough evidence to solve
export function canSolveCase(discoveredEvidence: string[]): boolean {
  const criticalFound = CRITICAL_EVIDENCE.filter(id => discoveredEvidence.includes(id));
  return criticalFound.length >= 3; // Need at least 3 critical evidence
}

// Get hint for next evidence to find
export function getNextEvidenceHint(discoveredEvidence: string[], currentRoom: string): string | null {
  const roomEvidence = EVIDENCE_LOCATIONS[currentRoom] || [];
  const undiscoveredInRoom = roomEvidence.filter(id => !discoveredEvidence.includes(id));
  
  if (undiscoveredInRoom.length > 0) {
    const nextEvidence = EVIDENCE_ITEMS[undiscoveredInRoom[0]];
    return `Something seems out of place near the ${nextEvidence.name.toLowerCase()}...`;
  }
  
  return null;
} 