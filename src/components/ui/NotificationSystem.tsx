'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Types
interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ConfirmDialog {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  danger?: boolean;
}

interface AlertDialog {
  id: string;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextType {
  showToast: (notification: Omit<ToastNotification, 'id'>) => void;
  showConfirm: (dialog: Omit<ConfirmDialog, 'id'>) => Promise<boolean>;
  showAlert: (dialog: Omit<AlertDialog, 'id'>) => Promise<void>;
  removeToast: (id: string) => void;
}

// Context
const NotificationContext = createContext<NotificationContextType | null>(null);

// Hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

// Toast Component
const Toast: React.FC<{ 
  notification: ToastNotification; 
  onRemove: (id: string) => void; 
}> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Show animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto remove
    if (notification.duration !== 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "relative p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm";
    switch (notification.type) {
      case 'success':
        return `${baseStyles} bg-green-900 bg-opacity-90 border-green-500 text-green-100`;
      case 'error':
        return `${baseStyles} bg-red-900 bg-opacity-90 border-red-500 text-red-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-900 bg-opacity-90 border-yellow-500 text-yellow-100`;
      case 'info':
        return `${baseStyles} bg-blue-900 bg-opacity-90 border-blue-500 text-blue-100`;
      default:
        return `${baseStyles} bg-slate-800 bg-opacity-90 border-slate-500 text-slate-100`;
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out mb-3
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'scale-95' : 'scale-100'}
      `}
    >
      <div className={getToastStyles()}>
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0 mt-0.5">{getIcon()}</span>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            {notification.message && (
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            )}
            
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="mt-2 text-xs font-medium underline hover:no-underline opacity-90 hover:opacity-100"
              >
                {notification.action.label}
              </button>
            )}
          </div>

          <button
            onClick={handleRemove}
            className="flex-shrink-0 text-white opacity-70 hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Confirm Dialog Component
const ConfirmDialog: React.FC<{ 
  dialog: ConfirmDialog; 
  onResolve: (result: boolean) => void; 
}> = ({ dialog, onResolve }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleConfirm = () => {
    dialog.onConfirm();
    onResolve(true);
  };

  const handleCancel = () => {
    if (dialog.onCancel) dialog.onCancel();
    onResolve(false);
  };

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center p-4
      transition-all duration-300
      ${isVisible ? 'opacity-100' : 'opacity-0'}
    `}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Dialog */}
      <div className={`
        relative bg-slate-800 rounded-lg shadow-xl border border-slate-600 w-full max-w-md
        transform transition-all duration-300
        ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-xl
              ${dialog.danger ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'}
            `}>
              {dialog.danger ? '⚠️' : '❓'}
            </div>
            <h3 className="text-lg font-semibold text-white">{dialog.title}</h3>
          </div>
          
          <p className="text-slate-300 mb-6 leading-relaxed">{dialog.message}</p>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              {dialog.cancelText || 'Hủy'}
            </button>
            <button
              onClick={handleConfirm}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${dialog.danger 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              {dialog.confirmText || 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Alert Dialog Component
const AlertDialog: React.FC<{ 
  dialog: AlertDialog; 
  onClose: () => void; 
}> = ({ dialog, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    dialog.onClose();
    onClose();
  };

  const getAlertStyles = () => {
    switch (dialog.type) {
      case 'success': return 'bg-green-900 text-green-300';
      case 'error': return 'bg-red-900 text-red-300';
      case 'warning': return 'bg-yellow-900 text-yellow-300';
      default: return 'bg-blue-900 text-blue-300';
    }
  };

  const getAlertIcon = () => {
    switch (dialog.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center p-4
      transition-all duration-300
      ${isVisible ? 'opacity-100' : 'opacity-0'}
    `}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className={`
        relative bg-slate-800 rounded-lg shadow-xl border border-slate-600 w-full max-w-md
        transform transition-all duration-300
        ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${getAlertStyles()}`}>
              {getAlertIcon()}
            </div>
            <h3 className="text-lg font-semibold text-white">{dialog.title}</h3>
          </div>
          
          <p className="text-slate-300 mb-6 leading-relaxed">{dialog.message}</p>
          
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {dialog.buttonText || 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Container
const ToastContainer: React.FC<{ 
  toasts: ToastNotification[]; 
  onRemove: (id: string) => void; 
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      {toasts.map(toast => (
        <Toast key={toast.id} notification={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Provider Component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [confirmDialogs, setConfirmDialogs] = useState<{ dialog: ConfirmDialog; resolve: (result: boolean) => void }[]>([]);
  const [alertDialogs, setAlertDialogs] = useState<{ dialog: AlertDialog; resolve: () => void }[]>([]);

  const showToast = (notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString();
    const newToast: ToastNotification = { ...notification, id };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showConfirm = (dialog: Omit<ConfirmDialog, 'id'>): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = Date.now().toString();
      const newDialog: ConfirmDialog = { ...dialog, id };
      setConfirmDialogs(prev => [...prev, { dialog: newDialog, resolve }]);
    });
  };

  const showAlert = (dialog: Omit<AlertDialog, 'id'>): Promise<void> => {
    return new Promise((resolve) => {
      const id = Date.now().toString();
      const newAlert: AlertDialog = { ...dialog, id };
      setAlertDialogs(prev => [...prev, { dialog: newAlert, resolve }]);
    });
  };

  const resolveConfirm = (id: string, result: boolean) => {
    setConfirmDialogs(prev => {
      const dialog = prev.find(d => d.dialog.id === id);
      if (dialog) {
        dialog.resolve(result);
        return prev.filter(d => d.dialog.id !== id);
      }
      return prev;
    });
  };

  const resolveAlert = (id: string) => {
    setAlertDialogs(prev => {
      const dialog = prev.find(d => d.dialog.id === id);
      if (dialog) {
        dialog.resolve();
        return prev.filter(d => d.dialog.id !== id);
      }
      return prev;
    });
  };

  const contextValue: NotificationContextType = {
    showToast,
    showConfirm,
    showAlert,
    removeToast
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Render toasts */}
      {typeof window !== 'undefined' && createPortal(
        <ToastContainer toasts={toasts} onRemove={removeToast} />,
        document.body
      )}
      
      {/* Render confirm dialogs */}
      {typeof window !== 'undefined' && confirmDialogs.map(({ dialog }) => createPortal(
        <ConfirmDialog 
          key={dialog.id}
          dialog={dialog} 
          onResolve={(result) => resolveConfirm(dialog.id, result)} 
        />,
        document.body
      ))}
      
      {/* Render alert dialogs */}
      {typeof window !== 'undefined' && alertDialogs.map(({ dialog }) => createPortal(
        <AlertDialog 
          key={dialog.id}
          dialog={dialog} 
          onClose={() => resolveAlert(dialog.id)} 
        />,
        document.body
      ))}
    </NotificationContext.Provider>
  );
};

// Utility functions for easy use
export const showSuccessToast = () => {
  // This will be used with the hook
};

export const showErrorToast = () => {
  // This will be used with the hook
};

export const showWarningToast = () => {
  // This will be used with the hook
};

export const showInfoToast = () => {
  // This will be used with the hook
};