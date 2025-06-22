'use client';

import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
  className?: string;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  size = 'md',
  showCloseButton = true,
  className = ''
}: ModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm w-full mx-4',
    md: 'max-w-md w-full mx-4',
    lg: 'max-w-2xl w-full mx-4',
    xl: 'max-w-4xl w-full mx-4',
    '2xl': 'max-w-6xl w-full mx-4',
    full: 'w-[95vw] h-[95vh] mx-[2.5vw]'
  };

  const heightClasses = {
    sm: 'max-h-[80vh]',
    md: 'max-h-[85vh]',
    lg: 'max-h-[90vh]',
    xl: 'max-h-[95vh]',
    '2xl': 'max-h-[95vh]',
    full: 'h-[95vh]'
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl
        ${sizeClasses[size]} ${heightClasses[size]}
        animate-in fade-in-0 zoom-in-95 duration-300
        flex flex-col overflow-hidden
        ${className}
      `}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-700 flex-shrink-0">
            <h2 className="text-lg md:text-xl font-semibold text-white truncate mr-4">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1 flex-shrink-0"
                aria-label="Đóng"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M18 6L6 18M6 6l12 12" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
} 