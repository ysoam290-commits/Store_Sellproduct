import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      endIcon: EndIcon,
      type = 'text',
      id,
      name,
      className = '',
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-xl">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={`w-full text-xs sm:text-sm bg-white dark:bg-slate-900 border transition-all duration-150 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
              Icon ? 'pl-10' : ''
            } ${EndIcon ? 'pr-10' : ''} ${
              error
                ? 'border-red-300 dark:border-red-700/60 focus:ring-red-500/20 focus:border-red-500'
                : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
            } ${className}`}
            {...props}
          />

          {EndIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400">
              <EndIcon className="w-4 h-4" />
            </div>
          )}
        </div>

        {error && (
          <p className="text-[11px] font-medium text-red-600 dark:text-red-400 animate-fadeIn">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

