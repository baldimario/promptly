import React from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

interface ButtonLinkProps extends Omit<ButtonProps, 'onClick' | 'type'> {
  href: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  fullWidth = false,
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
const variantClasses = {
    primary: 'bg-primary text-background hover:bg-primary-dark focus:ring-primary font-bold',
    secondary: 'bg-secondary text-text hover:bg-secondary-alt focus:ring-secondary font-bold',
    accent: 'bg-[#bada55] text-background hover:bg-[#333333] hover:text-[#bada55] focus:ring-[#bada55] border-white border font-bold'
};
  
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-3',
    lg: 'text-lg px-6 py-3'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const ButtonLink: React.FC<ButtonLinkProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  href,
  fullWidth = false,
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-center';
  
  const variantClasses = {
    primary: 'bg-primary text-background hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-secondary text-text hover:bg-secondary-alt focus:ring-secondary',
    accent: 'bg-[#bada55] text-background hover:bg-[#333333] focus:ring-[#bada55]'
  };
  
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-3',
    lg: 'text-lg px-6 py-3'
  };
  
  const disabledClasses = disabled ? 'opacity-50 pointer-events-none' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClass} ${className}`}
      aria-disabled={disabled}
    >
      {children}
    </Link>
  );
};
