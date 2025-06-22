'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Evidence } from '../../types/game';
import Modal from '../ui/Modal';

interface EvidenceLabProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceList: Evidence[];
  onAnalysisComplete: (insights: string[]) => void;
}

interface AnalysisResult {
  toolId: string;
  evidenceId: string;
  finding: string;
  accuracy: number;
}

export default function EvidenceLab({
  isOpen,
  onClose,
  evidenceList,
  onAnalysisComplete
}: EvidenceLabProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [labPoints, setLabPoints] = useState(100);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const labTools = [
    {
      id: 'microscope',
      name: 'Kính hiển vi',
      icon: '🔬',
      description: 'Phân tích chi tiết cấu trúc và vật liệu',
      cost: 15
    },
    {
      id: 'uv_light',
      name: 'Đèn UV',
      icon: '💡',
      description: 'Phát hiện dấu vết ẩn và chất lỏng',
      cost: 10
    },
    {
      id: 'chemical_kit',
      name: 'Bộ hóa chất',
      icon: '🧪',
      description: 'Kiểm tra thành phần hóa học',
      cost: 20
    },
    {
      id: 'fingerprint_scanner',
      name: 'Máy quét vân tay',
      icon: '👆',
      description: 'Phân tích và so sánh dấu vân tay',
      cost: 25
    }
  ];

  const [usedTools, setUsedTools] = useState<string[]>([]);

  const getEvidenceFindings = (evidenceId: string, toolId: string): { finding: string; accuracy: number } => {
    const findings: Record<string, Record<string, { finding: string; accuracy: number }>> = {
      wine_glass: {
        microscope: { finding: 'Phát hiện vi khuẩn và tế bào da người. Vết son môi có thành phần đặc biệt.', accuracy: 85 },
        uv_light: { finding: 'Có dấu vết chất lỏng khô không thể nhìn thấy bằng mắt thường.', accuracy: 70 },
        chemical_kit: { finding: 'Rượu vang bình thường, nhưng có dư lượng thuốc tim digitalis.', accuracy: 95 },
        fingerprint_scanner: { finding: 'Ba bộ dấu vân tay khác nhau: Marlene, Selena và một người chưa xác định.', accuracy: 90 }
      },
      threatening_letter: {
        microscope: { finding: 'Giấy thông thường, mực bút bi xanh. Có dấu hiệu viết vội.', accuracy: 75 },
        uv_light: { finding: 'Không có dấu vết ẩn nào dưới ánh sáng UV.', accuracy: 60 },
        chemical_kit: { finding: 'Mực có thành phần tiêu chuẩn, không có hóa chất đặc biệt.', accuracy: 65 },
        fingerprint_scanner: { finding: 'Chỉ có một bộ dấu vân tay, có vẻ được che giấu cẩn thận.', accuracy: 80 }
      },
      spare_key: {
        microscope: { finding: 'Kim loại có dấu hiệu mài mòn gần đây, đặc biệt ở răng khóa.', accuracy: 90 },
        uv_light: { finding: 'Có dấu vết mồ hôi và dầu tay tươi.', accuracy: 75 },
        chemical_kit: { finding: 'Không có hóa chất lạ, chỉ có dầu bôi trơn thông thường.', accuracy: 70 },
        fingerprint_scanner: { finding: 'Dấu vân tay rõ ràng của một người nữ.', accuracy: 95 }
      }
    };

    return findings[evidenceId]?.[toolId] || { finding: 'Không phát hiện được thông tin đặc biệt.', accuracy: 50 };
  };

  const handleToolUse = (toolId: string) => {
    if (!selectedEvidence) return;
    
    const tool = labTools.find(t => t.id === toolId)!;
    if (labPoints < tool.cost || usedTools.includes(toolId)) return;

    const result = getEvidenceFindings(selectedEvidence.id, toolId);
    
    setLabPoints(labPoints - tool.cost);
    setUsedTools([...usedTools, toolId]);
    setAnalysisResults([...analysisResults, {
      toolId,
      evidenceId: selectedEvidence.id,
      finding: result.finding,
      accuracy: result.accuracy
    }]);
  };

  const completeAnalysis = () => {
    const insights = [];
    const averageAccuracy = analysisResults.length > 0 ? 
      analysisResults.reduce((sum, r) => sum + r.accuracy, 0) / analysisResults.length : 0;

    if (averageAccuracy >= 85) {
      insights.push('🏆 Phân tích lab xuất sắc! Bạn đã thu thập được nhiều thông tin quan trọng.');
    } else if (averageAccuracy >= 70) {
      insights.push('👍 Phân tích lab tốt! Có một số phát hiện hữu ích.');
    } else {
      insights.push('📚 Kết quả phân tích cơ bản. Cần sử dụng nhiều công cụ hơn.');
    }

    // Specific insights based on findings
    const chemicalResults = analysisResults.filter(r => r.toolId === 'chemical_kit');
    if (chemicalResults.some(r => r.finding.includes('digitalis'))) {
      insights.push('⚠️ Phát hiện quan trọng: Có dấu hiệu thuốc tim trong rượu vang!');
    }

    onAnalysisComplete(insights);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔬 Phòng Lab Phân Tích Bằng Chứng">
      <div className="h-[75vh] flex flex-col">
        {!showResults ? (
          <>
            {/* Lab Status */}
            <div className="mb-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Trạng thái Lab</h3>
                <div className="flex items-center gap-4">
                  <span className="text-blue-400">Điểm Lab: <strong>{labPoints}</strong></span>
                  <span className="text-green-400">Phân tích: <strong>{analysisResults.length}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
              {/* Evidence Selection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📋 Chọn Bằng Chứng</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {evidenceList.map((evidence) => (
                    <div
                      key={evidence.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedEvidence?.id === evidence.id
                          ? 'bg-blue-900/30 border-blue-500'
                          : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedEvidence(evidence)}
                    >
                      <div className="flex items-center gap-3">
                        {evidence.image && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={evidence.image}
                              alt={evidence.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm">{evidence.name}</div>
                          <div className="text-xs text-gray-400 line-clamp-2">{evidence.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lab Tools */}
                <h3 className="text-lg font-semibold text-white mb-3 mt-4">🛠️ Công Cụ Lab</h3>
                <div className="space-y-2">
                  {labTools.map((tool) => {
                    const isUsed = usedTools.includes(tool.id);
                    const canUse = selectedEvidence && labPoints >= tool.cost && !isUsed;
                    
                    return (
                      <div
                        key={tool.id}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isUsed
                            ? 'bg-green-900/20 border-green-700 opacity-60'
                            : canUse
                            ? 'bg-gray-800 border-gray-600 hover:border-blue-500 cursor-pointer'
                            : 'bg-gray-900 border-gray-700 opacity-50'
                        }`}
                                                 onClick={() => {
                           if (canUse) {
                             handleToolUse(tool.id);
                           }
                         }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{tool.icon}</span>
                            <div>
                              <div className="font-semibold text-white text-sm">{tool.name}</div>
                              <div className="text-xs text-gray-400">{tool.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-yellow-400 text-sm">-{tool.cost}</div>
                            {isUsed && <div className="text-green-400 text-xs">✅ Đã dùng</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Analysis Results */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📊 Kết Quả Phân Tích</h3>
                <div className="bg-gray-800 rounded-lg p-4 max-h-80 overflow-y-auto">
                  {analysisResults.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">🔬</div>
                      <p className="text-sm">Chọn bằng chứng và công cụ để bắt đầu phân tích</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analysisResults.map((result, index) => (
                        <div key={index} className="bg-gray-700 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-blue-400 text-sm">
                              {labTools.find(t => t.id === result.toolId)?.name}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              result.accuracy >= 85 ? 'bg-green-600' :
                              result.accuracy >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}>
                              {result.accuracy}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-300">{result.finding}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                🚪 Thoát Lab
              </button>
              <button
                onClick={() => setShowResults(true)}
                disabled={analysisResults.length === 0}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                📋 Kết luận phân tích
              </button>
            </div>
          </>
        ) : (
          /* Results Summary */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🧪</div>
              <h3 className="text-xl font-semibold text-white mb-4">Phân Tích Lab Hoàn Thành!</h3>
              
              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <div className="text-gray-300 space-y-2">
                  <div>Tổng phân tích: <span className="font-bold text-blue-400">{analysisResults.length}</span></div>
                  <div>Độ chính xác trung bình: <span className="font-bold text-green-400">
                    {analysisResults.length > 0 ? Math.round(analysisResults.reduce((sum, r) => sum + r.accuracy, 0) / analysisResults.length) : 0}%
                  </span></div>
                  <div>Điểm còn lại: <span className="font-bold text-yellow-400">{labPoints}</span></div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  completeAnalysis();
                  onClose();
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                📄 Xem báo cáo chi tiết
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
} 