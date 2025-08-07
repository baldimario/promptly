import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  required,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-text text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        className={`form-input flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-text focus:outline-0 focus:ring-0 border border-border bg-background h-12 px-4 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        required={required}
        {...props}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};
