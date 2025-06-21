'use client';

import { useState, useEffect } from 'react';

export default function APIStatusIndicator() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: 'Kiểm tra kết nối API (test message)' 
        }),
      });

      if (response.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch {
      setApiStatus('offline');
    }
  };

  if (apiStatus === 'checking') return null;
  if (apiStatus === 'online') return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-900/90 border border-red-500 rounded-lg p-4 text-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-red-400 font-medium">🚨 AI Offline</span>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-red-300 hover:text-white text-xs"
          >
            {showHelp ? 'Ẩn' : 'Trợ giúp'}
          </button>
        </div>
        
        <p className="text-red-200 mb-2">
          Nhân vật sẽ chỉ trả lời câu cố định. 
        </p>

        {showHelp && (
          <div className="mt-3 pt-3 border-t border-red-700">
            <p className="text-red-300 text-xs mb-2">
              <strong>Nguyên nhân:</strong> Thiếu Google Gemini API key
            </p>
            <p className="text-red-300 text-xs mb-2">
              <strong>Giải pháp:</strong>
            </p>
            <ol className="text-red-300 text-xs space-y-1 ml-4">
              <li>1. Lấy API key tại: ai.google.dev</li>
              <li>2. Thêm vào Vercel Environment Variables</li>
              <li>3. Redeploy project</li>
            </ol>
            <a 
              href="https://github.com/your-repo/mystery-game/blob/main/DEPLOYMENT_GUIDE.md"
              target="_blank"
              className="inline-block mt-2 text-red-400 hover:text-red-200 text-xs underline"
            >
              📖 Hướng dẫn chi tiết
            </a>
          </div>
        )}

        <button
          onClick={checkAPIStatus}
          className="mt-3 bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
        >
          🔄 Thử lại
        </button>
      </div>
    </div>
  );
} 