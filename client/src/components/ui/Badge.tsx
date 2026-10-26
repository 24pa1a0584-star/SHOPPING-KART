import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'violet' | 'coral' | 'lime' | 'mint' | 'navy' | 'outline' | 'gray';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'violet',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    violet: 'bg-[#F0EBFF] text-[#7444FF] border border-[#7444FF]/20',
    coral: 'bg-[#FFEBEA] text-[#FF6B67] border border-[#FF6B67]/25',
    lime: 'bg-[#C7F464]/30 text-[#436307] border border-[#C7F464]',
    mint: 'bg-[#E3FAF7] text-[#148376] border border-[#25CBB8]/30',
    navy: 'bg-[#14152D] text-white',
    gray: 'bg-gray-100 text-gray-700 border border-gray-200',
    outline: 'border border-gray-300 text-gray-700 bg-transparent',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold tracking-wider uppercase rounded-md',
    md: 'text-xs px-2.5 py-1 font-medium rounded-lg',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 leading-none select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
