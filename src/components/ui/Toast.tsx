'use client';

import { useEffect } from 'react';

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export default function Toast({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', 
  duration = 3000 
}: ToastProps) {
  
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const typeStyles = {
    success: 'bg-green-600 border-green-500 text-green-100',
    error: 'bg-red-600 border-red-500 text-red-100',
    warning: 'bg-yellow-600 border-yellow-500 text-yellow-100',
    info: 'bg-blue-600 border-blue-500 text-blue-100'
  };

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: '📋'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className={`
        ${typeStyles[type]}
        border-l-4 rounded-lg shadow-2xl p-4 max-w-sm
        backdrop-blur-sm bg-opacity-95
      `}>
        <div className="flex items-start space-x-3">
          <span className="text-lg flex-shrink-0 mt-0.5">
            {iconMap[type]}
          </span>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">
              {title}
            </h4>
            
            {message && (
              <p className="text-xs mt-1 opacity-90">
                {message}
              </p>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path 
                d="M18 6L6 18M6 6l12 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 