'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Evidence } from '../../types/game';
import Modal from '../ui/Modal';

interface EvidenceAnalysisGameProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: Evidence;
  onComplete: (success: boolean, insights: string[]) => void;
}

interface AnalysisTool {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
  unlocked: boolean;
}

interface Finding {
  id: string;
  title: string;
  description: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  tool: string;
  discovered: boolean;
}

interface Challenge {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function EvidenceAnalysisGame({ 
  isOpen, 
  onClose, 
  evidence, 
  onComplete 
}: EvidenceAnalysisGameProps) {
  const [currentPhase, setCurrentPhase] = useState<'analysis' | 'challenges' | 'results'>('analysis');
  const [analysisPoints, setAnalysisPoints] = useState(100);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [discoveredFindings, setDiscoveredFindings] = useState<string[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [challengeAnswers, setChallengeAnswers] = useState<number[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState('normal');

  // Analysis tools available
  const tools: AnalysisTool[] = [
    {
      id: 'magnifier',
      name: 'Kính lúp',
      icon: '🔍',
      description: 'Quan sát chi tiết bề mặt',
      cost: 0,
      unlocked: true
    },
    {
      id: 'uv_light',
      name: 'Đèn UV',
      icon: '💡',
      description: 'Phát hiện dấu vết ẩn',
      cost: 15,
      unlocked: true
    },
    {
      id: 'microscope',
      name: 'Kính hiển vi',
      icon: '🔬',
      description: 'Phân tích cấu trúc vi mô',
      cost: 25,
      unlocked: true
    },
    {
      id: 'chemical_test',
      name: 'Thử nghiệm hóa học',
      icon: '🧪',
      description: 'Xác định thành phần hóa học',
      cost: 30,
      unlocked: true
    },
    {
      id: 'scanner',
      name: 'Máy quét 3D',
      icon: '📱',
      description: 'Tạo mô hình 3D chi tiết',
      cost: 40,
      unlocked: true
    }
  ];

  // Generate findings based on evidence type
  const generateFindings = (evidenceId: string): Finding[] => {
    const findingsMap: Record<string, Finding[]> = {
      wine_glass: [
        {
          id: 'lipstick_trace',
          title: 'Vết son môi',
          description: 'Phát hiện vết son môi màu đỏ đậm trên miệng ly',
          importance: 'high',
          tool: 'magnifier',
          discovered: false
        },
        {
          id: 'fingerprints',
          title: 'Dấu vân tay',
          description: 'Có ít nhất 3 bộ dấu vân tay khác nhau',
          importance: 'critical',
          tool: 'uv_light',
          discovered: false
        },
        {
          id: 'wine_residue',
          title: 'Cặn rượu bất thường',
          description: 'Phát hiện chất lạ trong cặn rượu vang',
          importance: 'critical',
          tool: 'chemical_test',
          discovered: false
        },
        {
          id: 'glass_scratches',
          title: 'Vết xước nhỏ',
          description: 'Có dấu hiệu ly bị va đập nhẹ',
          importance: 'medium',
          tool: 'microscope',
          discovered: false
        }
      ],
      threatening_letter: [
        {
          id: 'handwriting',
          title: 'Nét chữ viết tay',
          description: 'Chữ viết có dấu hiệu run rẩy, thể hiện căng thẳng',
          importance: 'high',
          tool: 'magnifier',
          discovered: false
        },
        {
          id: 'paper_quality',
          title: 'Chất lượng giấy',
          description: 'Giấy cao cấp, có thương hiệu đắt tiền',
          importance: 'medium',
          tool: 'microscope',
          discovered: false
        },
        {
          id: 'ink_analysis',
          title: 'Phân tích mực',
          description: 'Mực bút máy đắt tiền, không phải bút thường',
          importance: 'high',
          tool: 'chemical_test',
          discovered: false
        },
        {
          id: 'hidden_text',
          title: 'Văn bản ẩn',
          description: 'Có dấu vết viết rồi xóa ở mặt sau',
          importance: 'critical',
          tool: 'uv_light',
          discovered: false
        }
      ],
      spare_key: [
        {
          id: 'wear_patterns',
          title: 'Vết mài mòn',
          description: 'Chìa khóa được sử dụng thường xuyên',
          importance: 'medium',
          tool: 'magnifier',
          discovered: false
        },
        {
          id: 'metal_composition',
          title: 'Thành phần kim loại',
          description: 'Hợp kim đặc biệt, không phải chìa khóa thường',
          importance: 'high',
          tool: 'chemical_test',
          discovered: false
        },
        {
          id: 'key_cuts',
          title: 'Rãnh cắt chính xác',
          description: 'Được cắt bởi máy chuyên nghiệp',
          importance: 'high',
          tool: 'scanner',
          discovered: false
        }
      ]
    };

    return findingsMap[evidenceId] || [];
  };

  // Generate challenges based on discovered findings
  const generateChallenges = (discoveredFindings: Finding[]): Challenge[] => {
    const challenges: Challenge[] = [
      {
        id: 'observation',
        question: 'Dựa trên những gì bạn quan sát được, điều gì quan trọng nhất?',
        options: [
          'Tất cả các chi tiết đều quan trọng như nhau',
          'Chỉ những dấu vết rõ ràng mới có giá trị',
          'Cần kết hợp nhiều dấu vết để có kết luận',
          'Một dấu vết quyết định có thể giải quyết vụ án'
        ],
        correctAnswer: 2,
        explanation: 'Thám tử giỏi biết cách kết hợp nhiều manh mối để tạo thành bức tranh toàn cảnh.',
        points: 20,
        difficulty: 'easy'
      }
    ];

    // Add specific challenges based on findings
    if (discoveredFindings.some(f => f.importance === 'critical')) {
      challenges.push({
        id: 'critical_evidence',
        question: 'Bạn đã phát hiện bằng chứng quan trọng. Bước tiếp theo nên làm gì?',
        options: [
          'Ngay lập tức buộc tội nghi phạm',
          'Tìm kiếm thêm bằng chứng để xác nhận',
          'Giữ bí mật và theo dõi nghi phạm',
          'Báo cáo ngay cho cảnh sát'
        ],
        correctAnswer: 1,
        explanation: 'Bằng chứng quan trọng cần được xác minh bằng nhiều nguồn khác nhau.',
        points: 30,
        difficulty: 'medium'
      });
    }

    if (discoveredFindings.length >= 3) {
      challenges.push({
        id: 'pattern_recognition',
        question: 'Với nhiều manh mối đã tìm được, mẫu hình nào xuất hiện?',
        options: [
          'Tội phạm có kế hoạch chi tiết',
          'Đây là tội phạm tình cờ',
          'Có nhiều người liên quan',
          'Hung thủ cố tình để lại dấu vết'
        ],
        correctAnswer: 0,
        explanation: 'Nhiều loại bằng chứng khác nhau cho thấy sự chuẩn bị kỹ lưỡng.',
        points: 40,
        difficulty: 'hard'
      });
    }

    return challenges;
  };

  // Initialize findings when component loads
  useEffect(() => {
    const initialFindings = generateFindings(evidence.id);
    setFindings(initialFindings);
  }, [evidence.id]);

  // Handle tool usage
  const handleToolUse = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool || analysisPoints < tool.cost) return;

    setSelectedTool(toolId);
    setAnalysisPoints(analysisPoints - tool.cost);

    // Find findings that can be discovered with this tool
    const availableFindings = findings.filter(f => 
      f.tool === toolId && !discoveredFindings.includes(f.id)
    );

    if (availableFindings.length > 0) {
      const foundFinding = availableFindings[0];
      setDiscoveredFindings([...discoveredFindings, foundFinding.id]);
      
      // Update findings
      setFindings(findings.map(f => 
        f.id === foundFinding.id ? { ...f, discovered: true } : f
      ));
    }
  };

  // Start challenges phase
  const startChallenges = () => {
    const discoveredFindingObjects = findings.filter(f => f.discovered);
    const generatedChallenges = generateChallenges(discoveredFindingObjects);
    setChallenges(generatedChallenges);
    setCurrentPhase('challenges');
  };

  // Handle challenge answer
  const answerChallenge = (answerIndex: number) => {
    const newAnswers = [...challengeAnswers, answerIndex];
    setChallengeAnswers(newAnswers);

    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1);
    } else {
      // Calculate final score and show results
      calculateFinalScore();
    }
  };

  // Calculate final score
  const calculateFinalScore = () => {
    let score = analysisPoints; // Remaining points bonus
    
    // Points from discovered findings
    findings.forEach(finding => {
      if (finding.discovered) {
        const importancePoints = {
          low: 10,
          medium: 20,
          high: 30,
          critical: 50
        };
        score += importancePoints[finding.importance];
      }
    });

    // Points from correct challenge answers
    challenges.forEach((challenge, index) => {
      if (challengeAnswers[index] === challenge.correctAnswer) {
        score += challenge.points;
      }
    });

    setFinalScore(score);
    setCurrentPhase('results');
    
    // Generate insights for completion
    const insights = generateInsights(score, findings.filter(f => f.discovered));
    onComplete(score >= 200, insights);
  };

  // Generate insights based on performance
  const generateInsights = (score: number, discoveredFindings: Finding[]): string[] => {
    const insights: string[] = [];
    
    if (score >= 300) {
      insights.push('🏆 Thám tử xuất sắc! Kỹ năng phân tích tuyệt vời.');
    } else if (score >= 200) {
      insights.push('🎯 Phân tích tốt! Bạn có tài năng thám tử.');
    } else {
      insights.push('📚 Cần luyện tập thêm kỹ năng quan sát.');
    }

    const criticalFindings = discoveredFindings.filter(f => f.importance === 'critical');
    if (criticalFindings.length > 0) {
      insights.push('💎 Đã phát hiện bằng chứng quan trọng!');
    }

    if (discoveredFindings.length >= findings.length * 0.8) {
      insights.push('🔍 Quan sát toàn diện, không bỏ sót chi tiết.');
    }

    return insights;
  };

  // Get filter CSS class
  const getFilterClass = () => {
    switch (filter) {
      case 'contrast': return 'contrast-150 brightness-110';
      case 'grayscale': return 'grayscale';
      case 'sepia': return 'sepia';
      case 'uv': return 'hue-rotate-180 saturate-200';
      default: return '';
    }
  };

  const renderAnalysisPhase = () => (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="text-center flex-shrink-0">
        <h2 className="text-xl font-bold text-white mb-2">🔬 Phòng Lab Phân Tích</h2>
        <div className="flex justify-center items-center gap-4 text-sm">
          <span className="text-slate-300">Sử dụng các công cụ để phân tích bằng chứng</span>
          <div className="text-blue-400 font-medium bg-blue-900/30 px-3 py-1 rounded-full">
            Điểm: {analysisPoints}
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Panel - Evidence Display */}
        <div className="flex-1 flex flex-col">
          <div className="bg-slate-800 rounded-lg p-4 h-full flex flex-col">
            <div className="relative flex-1">
              <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden">
                <div 
                  className={`transition-all duration-300 ${getFilterClass()}`}
                  style={{ transform: `scale(${zoom})` }}
                >
                  {evidence.image ? (
                    <Image
                      src={evidence.image}
                      alt={evidence.name}
                      width={300}
                      height={300}
                      className="object-contain rounded-lg max-h-full"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-6xl">
                      🔍
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="mt-3 space-y-2">
                {/* Zoom Controls */}
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  >
                    🔍- 
                  </button>
                  <span className="px-2 py-1 bg-slate-700 text-white rounded text-xs min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  >
                    🔍+
                  </button>
                </div>

                {/* Filter Controls */}
                <div className="flex justify-center gap-1 flex-wrap">
                  {[
                    { id: 'normal', name: 'Bình thường', icon: '👁️' },
                    { id: 'contrast', name: 'Tương phản', icon: '🔆' },
                    { id: 'grayscale', name: 'Đen trắng', icon: '⚫' },
                    { id: 'uv', name: 'UV', icon: '💜' }
                  ].map(filterOption => (
                    <button
                      key={filterOption.id}
                      onClick={() => setFilter(filterOption.id)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        filter === filterOption.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {filterOption.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Tools and Findings */}
        <div className="w-80 flex flex-col gap-4">
          {/* Analysis Tools */}
          <div className="bg-slate-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-white mb-3">🛠️ Công cụ phân tích</h3>
            <div className="grid grid-cols-2 gap-2">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => handleToolUse(tool.id)}
                  disabled={analysisPoints < tool.cost || !tool.unlocked}
                  className={`p-2 rounded-lg border transition-all text-xs ${
                    selectedTool === tool.id
                      ? 'border-blue-500 bg-blue-900'
                      : analysisPoints >= tool.cost && tool.unlocked
                      ? 'border-slate-600 bg-slate-700 hover:border-blue-400'
                      : 'border-slate-700 bg-slate-900 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="text-lg mb-1">{tool.icon}</div>
                  <div className="text-white font-medium text-xs">{tool.name}</div>
                  <div className="text-blue-400 text-xs">
                    {tool.cost > 0 ? `${tool.cost}đ` : 'Free'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Findings Display */}
          {discoveredFindings.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-3 flex-1 min-h-0">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                🎯 Phát hiện ({discoveredFindings.length}/{findings.length})
              </h3>
              <div className="space-y-2 overflow-y-auto max-h-full">
                {findings.filter(f => f.discovered).map(finding => (
                  <div
                    key={finding.id}
                    className={`p-2 rounded border-l-4 text-xs ${
                      finding.importance === 'critical' ? 'border-red-500 bg-red-900 bg-opacity-20' :
                      finding.importance === 'high' ? 'border-orange-500 bg-orange-900 bg-opacity-20' :
                      finding.importance === 'medium' ? 'border-yellow-500 bg-yellow-900 bg-opacity-20' :
                      'border-gray-500 bg-gray-900 bg-opacity-20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-white text-xs">{finding.title}</h4>
                      <span className={`text-xs px-1 py-0.5 rounded ${
                        finding.importance === 'critical' ? 'bg-red-600 text-white' :
                        finding.importance === 'high' ? 'bg-orange-600 text-white' :
                        finding.importance === 'medium' ? 'bg-yellow-600 text-black' :
                        'bg-gray-600 text-white'
                      }`}>
                        {finding.importance === 'critical' ? 'Rất quan trọng' :
                         finding.importance === 'high' ? 'Quan trọng' :
                         finding.importance === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">{finding.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Continue Button */}
      <div className="text-center flex-shrink-0">
        <button
          onClick={startChallenges}
          disabled={discoveredFindings.length === 0}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {discoveredFindings.length === 0 
            ? 'Hãy phân tích để tiếp tục' 
            : `Tiếp tục với ${discoveredFindings.length} phát hiện`}
        </button>
      </div>
    </div>
  );

  const renderChallengesPhase = () => {
    if (challenges.length === 0) {
      calculateFinalScore();
      return null;
    }

    const challenge = challenges[currentChallenge];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">🧠 Thử Thách Suy Luận</h2>
          <p className="text-slate-300">Câu hỏi {currentChallenge + 1} / {challenges.length}</p>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentChallenge + 1) / challenges.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Challenge */}
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
              challenge.difficulty === 'hard' ? 'bg-red-600 text-white' :
              challenge.difficulty === 'medium' ? 'bg-yellow-600 text-black' :
              'bg-green-600 text-white'
            }`}>
              {challenge.difficulty === 'hard' ? 'Khó' :
               challenge.difficulty === 'medium' ? 'Trung bình' : 'Dễ'}
            </span>
            <span className="ml-2 text-blue-400 text-sm">+{challenge.points} điểm</span>
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-4">
            {challenge.question}
          </h3>

          <div className="space-y-3">
            {challenge.options.map((option, index) => (
              <button
                key={index}
                onClick={() => answerChallenge(index)}
                className="w-full text-left p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-blue-500 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-white">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderResultsPhase = () => (
    <div className="space-y-6 text-center">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">🎉 Kết Quả Phân Tích</h2>
        <div className="text-4xl font-bold text-blue-400 mb-2">{finalScore} điểm</div>
        <p className="text-slate-300">
          {finalScore >= 300 ? 'Xuất sắc! 🏆' :
           finalScore >= 200 ? 'Tốt lắm! 🎯' :
           finalScore >= 100 ? 'Khá ổn! 👍' : 'Cần cố gắng thêm! 📚'}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Chi tiết điểm số</h3>
        <div className="space-y-3 text-left">
          <div className="flex justify-between">
            <span className="text-slate-300">Điểm phân tích còn lại:</span>
            <span className="text-blue-400">{analysisPoints}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Phát hiện được:</span>
            <span className="text-green-400">{discoveredFindings.length}/{findings.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Câu hỏi đúng:</span>
            <span className="text-yellow-400">
              {challengeAnswers.filter((answer, index) => answer === challenges[index]?.correctAnswer).length}/{challenges.length}
            </span>
          </div>
          <div className="border-t border-slate-600 pt-3 flex justify-between font-bold">
            <span className="text-white">Tổng điểm:</span>
            <span className="text-blue-400">{finalScore}</span>
          </div>
        </div>
      </div>

      {/* Discovered Findings Summary */}
      {discoveredFindings.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Bằng chứng đã phát hiện</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {findings.filter(f => f.discovered).map(finding => (
              <div
                key={finding.id}
                className={`p-3 rounded border-l-4 text-left ${
                  finding.importance === 'critical' ? 'border-red-500 bg-red-900 bg-opacity-20' :
                  finding.importance === 'high' ? 'border-orange-500 bg-orange-900 bg-opacity-20' :
                  finding.importance === 'medium' ? 'border-yellow-500 bg-yellow-900 bg-opacity-20' :
                  'border-gray-500 bg-gray-900 bg-opacity-20'
                }`}
              >
                <div className="font-medium text-white text-sm">{finding.title}</div>
                <div className="text-slate-400 text-xs mt-1">{finding.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          ✅ Hoàn thành
        </button>
      </div>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`🔬 Phân tích: ${evidence.name}`} 
      size="2xl"
      className="h-[95vh]"
    >
      <div className="h-full flex flex-col">
        {currentPhase === 'analysis' && renderAnalysisPhase()}
        {currentPhase === 'challenges' && renderChallengesPhase()}
        {currentPhase === 'results' && renderResultsPhase()}
      </div>
    </Modal>
  );
}