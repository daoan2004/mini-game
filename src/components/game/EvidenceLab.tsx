'use client';

import { useState } from 'react';
import Image from 'next/image';
import Modal from '../ui/Modal';
import { useGameStore } from '../../stores/gameStore';
import { EVIDENCE_ITEMS } from '../../data/evidence';

interface AnalysisResult {
  toolId: string;
  toolName: string;
  toolIcon: string;
  evidenceId: string;
  evidenceName: string;
  finding: string;
  findings: Array<{ type: string; value: string }>;
  accuracy: number;
  timestamp: number;
  notes?: string;
}

interface EvidenceLabProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete?: (evidenceId: string) => void;
}

export default function EvidenceLab({ 
  isOpen, 
  onClose, 
  onAnalysisComplete
}: EvidenceLabProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [labPoints, setLabPoints] = useState(100);

  const evidenceFound = useGameStore(state => state.evidenceFound);

  // Create evidence list from found evidence
  const evidenceList = evidenceFound.map(id => EVIDENCE_ITEMS[id]).filter(Boolean);

  const labTools = [
    { id: 'magnifier', name: 'Kính lúp', icon: '🔍', description: 'Quan sát chi tiết', cost: 0 },
    { id: 'uv_light', name: 'Đèn UV', icon: '💡', description: 'Phát hiện dấu vết ẩn', cost: 15 },
    { id: 'microscope', name: 'Kính hiển vi', icon: '🔬', description: 'Phân tích vi mô', cost: 25 },
    { id: 'chemistry', name: 'Thử nghiệm hóa học', icon: '🧪', description: 'Phân tích thành phần', cost: 30 },
    { id: 'scanner', name: 'Máy quét 3D', icon: '📡', description: 'Tạo mô hình 3D', cost: 40 }
  ];

  const [usedTools, setUsedTools] = useState<string[]>([]);

  // Simple findings generator
  const getEvidenceFindings = (evidenceId: string, toolId: string) => {
    const findings = {
      wine_glass: {
        magnifier: { finding: 'Phát hiện vết son môi màu đỏ và dấu vân tay', accuracy: 75 },
        uv_light: { finding: 'Không có dấu vết chất lỏng dưới ánh sáng UV', accuracy: 85 },
        microscope: { finding: 'Tìm thấy sợi vải nhỏ màu xanh dương', accuracy: 90 },
        chemistry: { finding: 'Phát hiện độc tố cyanide trong rượu', accuracy: 95 },
        scanner: { finding: 'Mô hình 3D cho thấy vết nứt nhỏ ở đáy ly', accuracy: 80 }
      },
      threatening_letter: {
        magnifier: { finding: 'Chữ viết tay có nét run và áp lực mạnh', accuracy: 70 },
        uv_light: { finding: 'Phát hiện dấu vết mực tàng hình', accuracy: 88 },
        microscope: { finding: 'Giấy cao cấp với watermark đặc biệt', accuracy: 92 },
        chemistry: { finding: 'Mực bút có thành phần đặc biệt từ bút Parker', accuracy: 87 },
        scanner: { finding: 'Phân tích độ sâu nét viết cho thấy tâm trạng căng thẳng', accuracy: 82 }
      },
      spare_key: {
        magnifier: { finding: 'Có dấu hiệu mài mòn và trầy xước', accuracy: 65 },
        uv_light: { finding: 'Không có dấu vết đặc biệt dưới UV', accuracy: 75 },
        microscope: { finding: 'Kim loại có độ cứng cao, chất lượng tốt', accuracy: 85 },
        chemistry: { finding: 'Hợp kim thép không gỉ với lớp mạ niken', accuracy: 90 },
        scanner: { finding: 'Khắc laser số serial: MH-2024-001', accuracy: 95 }
      }
    };

    return findings[evidenceId as keyof typeof findings]?.[toolId as keyof typeof findings.wine_glass] || 
           { finding: 'Không tìm thấy thông tin đặc biệt', accuracy: 50 };
  };

  const handleToolUse = (toolId: string) => {
    const tool = labTools.find(t => t.id === toolId);
    if (!tool || !selectedEvidence || labPoints < tool.cost || usedTools.includes(toolId)) return;

    const result = getEvidenceFindings(selectedEvidence, toolId);
    
    setLabPoints(labPoints - tool.cost);
    setUsedTools([...usedTools, toolId]);
    setAnalysisResults([...analysisResults, {
      toolId,
      toolName: tool.name,
      toolIcon: tool.icon,
      evidenceId: selectedEvidence,
      evidenceName: evidenceList.find(e => e.id === selectedEvidence)?.name || '',
      finding: result.finding,
      findings: [{ type: 'Kết quả', value: result.finding }],
      accuracy: result.accuracy,
      timestamp: Date.now(),
      notes: `Sử dụng ${tool.name} với độ chính xác ${result.accuracy}%`
    }]);

    // Notify parent component
    if (onAnalysisComplete) {
      onAnalysisComplete(selectedEvidence);
    }
  };



  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="🧪 Phòng Lab Phân Tích Bằng Chứng"
      size="2xl"
      className="h-[95vh]"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-blue-400 font-bold text-lg">
              💰 Điểm: {labPoints}
            </div>
            <div className="text-slate-400 text-sm">
              Chọn bằng chứng và công cụ để phân tích
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Panel - Evidence & Tools */}
          <div className="w-80 flex flex-col gap-4">
            {/* Evidence Selection */}
            <div className="bg-slate-800 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-white mb-3">🔍 Chọn bằng chứng</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {evidenceList.map((evidence) => (
                  <button
                    key={evidence.id}
                    onClick={() => setSelectedEvidence(evidence.id)}
                    className={`w-full p-2 rounded-lg border text-left transition-all ${
                      selectedEvidence === evidence.id
                        ? 'border-blue-500 bg-blue-900 bg-opacity-50'
                        : 'border-slate-600 bg-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {evidence.image && (
                        <div className="w-8 h-8 bg-slate-600 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={evidence.image}
                            alt={evidence.name}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {evidence.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {evidence.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="bg-slate-800 rounded-lg p-3 flex-1 min-h-0">
              <h3 className="text-sm font-semibold text-white mb-3">🛠️ Công cụ phân tích</h3>
              <div className="space-y-2 overflow-y-auto max-h-full">
                {labTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolUse(tool.id)}
                    disabled={!selectedEvidence || labPoints < tool.cost}
                    className={`w-full p-2 rounded-lg border text-left transition-all ${
                      !selectedEvidence || labPoints < tool.cost
                        ? 'border-slate-700 bg-slate-900 opacity-50 cursor-not-allowed'
                        : 'border-slate-600 bg-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tool.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {tool.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {tool.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-blue-400 font-medium">
                        {tool.cost === 0 ? 'Miễn phí' : `${tool.cost} điểm`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="flex-1 flex flex-col">
            {/* Analysis Results */}
            {analysisResults.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-4 mb-4 flex-1 min-h-0">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  📊 Kết quả phân tích
                  <span className="text-sm text-slate-400">({analysisResults.length})</span>
                </h3>
                <div className="space-y-3 overflow-y-auto max-h-full">
                  {analysisResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        result.accuracy >= 90 ? 'border-green-500 bg-green-900 bg-opacity-20' :
                        result.accuracy >= 70 ? 'border-yellow-500 bg-yellow-900 bg-opacity-20' :
                        'border-red-500 bg-red-900 bg-opacity-20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{result.toolIcon}</span>
                          <div>
                            <h4 className="font-medium text-white text-sm">
                              {result.toolName} - {result.evidenceName}
                            </h4>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-400">
                                {new Date(result.timestamp).toLocaleTimeString()}
                              </span>
                              <span className={`px-2 py-1 rounded ${
                                result.accuracy >= 90 ? 'bg-green-600 text-white' :
                                result.accuracy >= 70 ? 'bg-yellow-600 text-black' :
                                'bg-red-600 text-white'
                              }`}>
                                {result.accuracy}% độ chính xác
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {result.findings.map((finding, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium text-white">{finding.type}:</span>
                            <span className="text-slate-300 ml-2">{finding.value}</span>
                          </div>
                        ))}
                      </div>
                      
                      {result.notes && (
                        <div className="mt-2 p-2 bg-slate-700 rounded text-sm text-slate-300">
                          💡 {result.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {analysisResults.length === 0 && (
              <div className="flex-1 flex items-center justify-center bg-slate-800 rounded-lg">
                <div className="text-center text-slate-400">
                  <div className="text-6xl mb-4">🔬</div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Chưa có kết quả phân tích
                  </h3>
                  <p className="text-sm">
                    Chọn bằng chứng và sử dụng công cụ để bắt đầu phân tích
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
} 