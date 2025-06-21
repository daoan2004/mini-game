export interface Room {
  id: string;
  name: string;
  description: string;
  atmosphere: string;
  searchHint: string;
  backgroundImage?: string;
  characters?: string[]; // Characters that can be found in this room
}

export const ROOMS: Record<string, Room> = {
  living_room: {
    id: 'living_room',
    name: 'Phòng Khách',
    description: 'Phòng khách rộng lớn với đồ nội thất cổ điển. Lò sưởi đang cháy, tạo bóng đèn nhảy múa trên tường. Có mùi rượu vang nặng nề trong không khí.',
    atmosphere: 'Ấm áp nhưng căng thẳng. Có vẻ như ai đó vừa rời khỏi đây không lâu.',
    searchHint: 'Kiểm tra bàn cà phê và khu vực quanh ghế sofa...',
    backgroundImage: '/images/rooms/living_room.jpg',
    characters: ['arthur', 'selena']
  },

  marlene_bedroom: {
    id: 'marlene_bedroom',
    name: "Phòng Ngủ Marlene",
    description: 'Phòng ngủ của bà Marlene được trang trí theo phong cách Victorian. Giường lớn ở giữa phòng, xung quanh là những món đồ cổ quý giá. Cửa sổ nhìn ra khu vườn tối đen.',
    atmosphere: 'Lạnh lẽo và u ám. Có cảm giác như thời gian đã dừng lại ở đây.',
    searchHint: 'Tìm kiếm quanh giường và bàn trang điểm...',
    backgroundImage: '/images/rooms/bedroom.jpg',
    characters: []
  },

  bathroom: {
    id: 'bathroom',
    name: 'Phòng Tắm',
    description: 'Phòng tắm sang trọng với bồn tắm đá cẩm thạch. Gương lớn phản chiếu ánh sáng yếu ớt từ đèn trần. Có vài giọt nước còn đọng trên sàn.',
    atmosphere: 'Ẩm ướt và lạnh. Âm thanh nhỏ nhất cũng vang vọng trong không gian này.',
    searchHint: 'Kiểm tra quanh bồn rửa và tủ thuốc...',
    backgroundImage: '/images/rooms/bathroom.jpg',
    characters: []
  },

  elise_room: {
    id: 'elise_room',
    name: "Phòng Elise",
    description: 'Phòng nhỏ giản dị của người giúp việc. Đồ đạc ít oi nhưng được sắp xếp gọn gàng. Có một chiếc bàn nhỏ với nhiều chìa khóa và sổ ghi chép.',
    atmosphere: 'Khiêm tốn và trật tự. Có thể cảm nhận được sự lo lắng trong không khí.',
    searchHint: 'Tìm trong ngăn kéo và dưới gối...',
    backgroundImage: '/images/rooms/elise_room.jpg',
    characters: ['elise']
  },

  arthur_study: {
    id: 'arthur_study',
    name: "Phòng Làm Việc Arthur",
    description: 'Phòng làm việc của Arthur với nhiều sách vở và giấy tờ. Bàn làm việc bừa bộn, có nhiều hóa đơn và thư từ. Mùi thuốc lá nặng nề bao trùm căn phòng.',
    atmosphere: 'Hỗn loạn và căng thẳng. Có vẻ như Arthur đã trải qua những đêm không ngủ ở đây.',
    searchHint: 'Kiểm tra các ngăn kéo bàn làm việc và thùng rác...',
    backgroundImage: '/images/rooms/study.jpg',
    characters: ['arthur']
  },

  back_door: {
    id: 'back_door',
    name: 'Cửa Sau',
    description: 'Lối ra vào phía sau biệt thự. Trời đang mưa to, gió thổi mạnh. Có vài vết chân lấm lem trên sàn gỗ, dẫn từ cửa vào trong nhà.',
    atmosphere: 'Lạnh và ướt át. Âm thanh mưa rơi tạo ra bầu không khí ma quái.',
    searchHint: 'Tìm kiếm quanh khu vực cửa và giá giày...',
    backgroundImage: '/images/rooms/back_door.jpg',
    characters: ['marcus']
  }
};

// Get room by ID
export function getRoom(id: string): Room | undefined {
  return ROOMS[id];
}

// Get all rooms
export function getAllRooms(): Room[] {
  return Object.values(ROOMS);
}

// Get rooms where character can be found
export function getRoomsForCharacter(characterId: string): Room[] {
  return getAllRooms().filter(room => room.characters?.includes(characterId));
}

// Get random room description variation
export function getRandomRoomDescription(roomId: string): string {
  const room = getRoom(roomId);
  if (!room) return 'Bạn thấy mình ở một nơi xa lạ.';
  
  const variations = [
    room.description,
    `${room.description} ${room.atmosphere}`,
    `Khi bước vào ${room.name.toLowerCase()}, bạn nhận ra: ${room.description}`
  ];
  
  return variations[Math.floor(Math.random() * variations.length)];
}

// Get search result text
export function getSearchResultText(roomId: string, foundEvidence: boolean): string {
  const room = getRoom(roomId);
  if (!room) return 'Bạn tìm kiếm khắp nơi nhưng không thấy gì.';
  
  if (foundEvidence) {
    return `Cuộc điều tra cẩn thận ở ${room.name.toLowerCase()} đã phát hiện ra điều quan trọng!`;
  } else {
    return `Bạn tìm kiếm kỹ lưỡng ở ${room.name.toLowerCase()} nhưng không tìm thấy gì hữu ích. ${room.searchHint}`;
  }
} 