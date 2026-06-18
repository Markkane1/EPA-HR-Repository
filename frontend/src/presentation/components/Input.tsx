import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-white border rounded-xl text-sm transition-all duration-200 outline-none
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${rightIcon ? 'pr-10' : 'pr-4'}
              ${error 
                ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 text-rose-900 placeholder:text-rose-300' 
                : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400'
              }
              py-2.5
              disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />

          {rightIcon && !error && (
            <div className="absolute right-3 text-slate-400">
              {rightIcon}
            </div>
          )}

          {error && (
            <div className="absolute right-3 text-rose-500 pointer-events-none">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>

        {error && <p className="text-xs font-medium text-rose-500 mt-0.5">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
