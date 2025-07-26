import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive' | 'glass' | 'gradient';
  onClick?: () => void;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  onClick,
  hover = false,
  padding = 'md',
}) => {
  const variants = {
    default: 'card',
    elevated: 'card shadow-medium',
    interactive: 'card-hover cursor-pointer',
    glass: 'card-glass',
    gradient: 'bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-200/50 shadow-soft',
  };

  const paddingSizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const Component = onClick || hover ? motion.div : 'div';
  const motionProps = onClick || hover ? {
    whileHover: { 
      y: -4, 
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeOut" } 
    },
    whileTap: { scale: 0.98 },
  } : {};

  return (
    <Component
      className={clsx(
        'transition-all duration-300',
        variants[variant],
        paddingSizes[padding],
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
};

export default Card;