'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {/* Gothic-style spinner */}
      <div className="relative">
        {/* Outer ring */}
        <div className={`
          ${sizeClasses[size]} 
          border-4 border-slate-600 border-t-amber-500 
          rounded-full animate-spin
        `} />
        
        {/* Inner glow effect */}
        <div className={`
          absolute inset-0 ${sizeClasses[size]} 
          border-2 border-transparent border-t-amber-400 
          rounded-full animate-spin opacity-50
        `} style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
      </div>
      
      {/* Loading text */}
      {text && (
        <p className={`
          ${textSizeClasses[size]} 
          text-slate-400 animate-pulse font-medium
        `}>
          {text}
        </p>
      )}
    </div>
  );
} 