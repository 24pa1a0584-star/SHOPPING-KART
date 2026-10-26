import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'coral' | 'outline' | 'ghost' | 'mint';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-xl select-none';

    const variants = {
      primary:
        'bg-[#7444FF] text-white hover:bg-[#6335E6] hover:shadow-glow-violet shadow-sm',
      secondary:
        'bg-[#14152D] text-white hover:bg-[#202244] shadow-sm',
      coral:
        'bg-[#FF6B67] text-white hover:bg-[#E85551] hover:shadow-glow-coral shadow-sm',
      mint:
        'bg-[#25CBB8] text-white hover:bg-[#1EAE9D] hover:shadow-glow-mint shadow-sm',
      outline:
        'border-2 border-[#14152D]/15 text-[#14152D] hover:border-[#7444FF] hover:text-[#7444FF] bg-transparent',
      ghost:
        'text-[#14152D] hover:bg-[#F0EBFF] hover:text-[#7444FF] bg-transparent',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2.5 gap-2 h-11',
      lg: 'text-base px-6 py-3.5 gap-2.5 h-13 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon && <span className="inline-flex">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
