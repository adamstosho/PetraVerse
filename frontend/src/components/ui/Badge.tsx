import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: 'full' | 'lg' | 'xl';
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  rounded = 'full',
  className 
}) => {
  const baseClasses = 'inline-flex items-center font-semibold transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    primary: 'bg-primary-100 text-primary-700 border border-primary-200',
    secondary: 'bg-accent-100 text-accent-700 border border-accent-200',
    success: 'bg-success-100 text-success-700 border border-success-200',
    warning: 'bg-warning-100 text-warning-700 border border-warning-200',
    danger: 'bg-error-100 text-error-700 border border-error-200',
    info: 'bg-primary-100 text-primary-700 border border-primary-200',
    neutral: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    accent: 'bg-accent-100 text-accent-700 border border-accent-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm',
    xl: 'px-5 py-2 text-base'
  };

  const roundedClasses = {
    full: 'rounded-full',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        roundedClasses[rounded],
        className
      )}
    >
      {children}
    </span>
  );
};

export { Badge }; 