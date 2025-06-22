'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Evidence } from '../../types/game';
import Modal from '../ui/Modal';

interface ImageAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: Evidence;
  onDiscovery: (findings: string[]) => void;
}

interface AnalysisFilter {
  id: string;
  name: string;
  description: string;
  css: string;
  icon: string;
}

interface HotSpot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  description: string;
  finding: string;
  discovered: boolean;
}

export default function ImageAnalysis({
  isOpen,
  onClose,
  evidence,
  onDiscovery
}: ImageAnalysisProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [discoveredHotSpots, setDiscoveredHotSpots] = useState<string[]>([]);
  const [showHotSpots, setShowHotSpots] = useState(false);

  const analysisFilters: AnalysisFilter[] = [
    {
      id: 'normal',
      name: 'Bình thường',
      description: 'Xem ảnh gốc không có filter',
      css: 'filter: none',
      icon: '👁️'
    },
    {
      id: 'contrast',
      name: 'Tăng độ tương phản',
      description: 'Làm nổi bật các chi tiết ẩn',
      css: 'filter: contrast(150%) brightness(110%)',
      icon: '🔆'
    },
    {
      id: 'grayscale',
      name: 'Đen trắng',
      description: 'Phát hiện các chi tiết không thấy được ở màu',
      css: 'filter: grayscale(100%) contrast(120%)',
      icon: '⚫'
    },
    {
      id: 'edge_detection',
      name: 'Phát hiện viền',
      description: 'Làm nổi bật đường viền và hình dạng',
      css: 'filter: contrast(200%) brightness(150%) saturate(0%) invert(20%)',
      icon: '📐'
    },
    {
      id: 'uv_light',
      name: 'Ánh sáng UV',
      description: 'Mô phỏng hiệu ứng ánh sáng tử ngoại',
      css: 'filter: hue-rotate(240deg) saturate(200%) brightness(120%)',
      icon: '💜'
    }
  ];

  const getHotSpots = (evidenceId: string): HotSpot[] => {
    const hotSpots: Record<string, HotSpot[]> = {
      wine_glass: [
        {
          id: 'lipstick_mark',
          x: 45,
          y: 30,
          description: 'Vết son môi trên miệng ly',
          finding: 'Vết son môi màu đỏ cam, có thể xác định được thương hiệu và người sử dụng.',
          discovered: false
        },
        {
          id: 'fingerprints',
          x: 60,
          y: 65,
          description: 'Dấu vân tay trên thân ly',
          finding: 'Có ít nhất 3 bộ dấu vân tay khác nhau, bao gồm của nạn nhân.',
          discovered: false
        },
        {
          id: 'wine_residue',
          x: 35,
          y: 80,
          description: 'Cặn rượu đáy ly',
          finding: 'Cặn rượu có màu sắc bất thường, có thể chứa chất lạ.',
          discovered: false
        }
      ],
      threatening_letter: [
        {
          id: 'handwriting',
          x: 50,
          y: 40,
          description: 'Phong cách chữ viết',
          finding: 'Chữ viết có dấu hiệu run rẩy, có thể do căng thẳng hoặc cố tình giấu giếm.',
          discovered: false
        },
        {
          id: 'paper_quality',
          x: 20,
          y: 20,
          description: 'Chất lượng giấy',
          finding: 'Giấy thường trong nhà, có thể truy xuất nguồn gốc.',
          discovered: false
        },
        {
          id: 'ink_smudge',
          x: 70,
          y: 75,
          description: 'Vết lem mực',
          finding: 'Vết lem cho thấy người viết thuận tay trái hoặc đang vội vàng.',
          discovered: false
        }
      ],
      spare_key: [
        {
          id: 'wear_marks',
          x: 40,
          y: 60,
          description: 'Dấu mài mòn',
          finding: 'Răng khóa có dấu hiệu sử dụng gần đây, kim loại còn sáng bóng.',
          discovered: false
        },
        {
          id: 'key_chain_mark',
          x: 25,
          y: 30,
          description: 'Vết móc chìa khóa',
          finding: 'Có dấu vết cho thấy từng được gắn vào móc khóa khác.',
          discovered: false
        }
      ]
    };

    return hotSpots[evidenceId] || [];
  };

  const [hotSpots] = useState(() => getHotSpots(evidence.id));

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!showHotSpots) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Check if clicked near any hotspot
    const clickedHotSpot = hotSpots.find(hotSpot => {
      const distance = Math.sqrt(
        Math.pow(x - hotSpot.x, 2) + Math.pow(y - hotSpot.y, 2)
      );
      return distance < 8; // 8% tolerance
    });

    if (clickedHotSpot && !discoveredHotSpots.includes(clickedHotSpot.id)) {
      setDiscoveredHotSpots([...discoveredHotSpots, clickedHotSpot.id]);
      
      // Trigger discovery callback
      onDiscovery([clickedHotSpot.finding]);
    }
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setActiveFilter(null);
  };

  const getActiveFilterCSS = () => {
    const filter = analysisFilters.find(f => f.id === activeFilter);
    return filter ? filter.css : 'filter: none';
  };

  if (!isOpen || !evidence.image) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`🔬 Phân Tích Ảnh: ${evidence.name}`}>
      <div className="h-[80vh] flex flex-col">
        {/* Controls */}
        <div className="mb-4 space-y-3">
          {/* Filter Selection */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">🎨 Bộ lọc phân tích</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {analysisFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(activeFilter === filter.id ? null : filter.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeFilter === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title={filter.description}
                >
                  <span className="mr-1">{filter.icon}</span>
                  {filter.name}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom and Analysis Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
              >
                🔍- Zoom Out
              </button>
              <span className="text-white text-sm min-w-[60px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.25))}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
              >
                🔍+ Zoom In
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHotSpots(!showHotSpots)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  showHotSpots
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                🎯 {showHotSpots ? 'Ẩn điểm phân tích' : 'Hiện điểm phân tích'}
              </button>
              <button
                onClick={resetView}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Image Analysis Area */}
        <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative">
          <div
            className="w-full h-full flex items-center justify-center cursor-crosshair relative"
            onClick={handleImageClick}
          >
            <div
              className="transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                ...(() => {
                  const filterCSS = getActiveFilterCSS();
                  return filterCSS.startsWith('filter:') 
                    ? { filter: filterCSS.replace('filter: ', '') }
                    : {};
                })()
              }}
            >
              <Image
                src={evidence.image}
                alt={evidence.name}
                width={400}
                height={400}
                className="max-w-full max-h-full object-contain rounded-lg"
                draggable={false}
              />
            </div>

            {/* Hot Spots */}
            {showHotSpots && hotSpots.map((hotSpot) => (
              <div
                key={hotSpot.id}
                className={`absolute w-6 h-6 border-2 rounded-full transition-all cursor-pointer ${
                  discoveredHotSpots.includes(hotSpot.id)
                    ? 'bg-green-500 border-green-400 animate-ping'
                    : 'bg-red-500 border-red-400 animate-pulse hover:scale-110'
                }`}
                style={{
                  left: `${hotSpot.x}%`,
                  top: `${hotSpot.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={hotSpot.description}
              >
                <div className="w-full h-full bg-white rounded-full opacity-70"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Discoveries Panel */}
        {discoveredHotSpots.length > 0 && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-green-400 mb-2">🔍 Phát hiện mới</h4>
            <div className="space-y-2">
              {discoveredHotSpots.map(hotSpotId => {
                const hotSpot = hotSpots.find(h => h.id === hotSpotId);
                return hotSpot ? (
                  <div key={hotSpotId} className="text-sm text-gray-300 bg-gray-700 p-2 rounded">
                    <strong>{hotSpot.description}:</strong> {hotSpot.finding}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex justify-between">
          <div className="text-sm text-gray-400">
            📊 Đã phát hiện: {discoveredHotSpots.length}/{hotSpots.length} chi tiết
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ✅ Hoàn thành phân tích
          </button>
        </div>
      </div>
    </Modal>
  );
} 