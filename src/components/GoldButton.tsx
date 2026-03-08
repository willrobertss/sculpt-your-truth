import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant = 'solid', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-mono uppercase tracking-widest transition-all duration-300',
          variant === 'solid' && 'bg-primary text-primary-foreground hover:bg-gold-light gold-glow',
          variant === 'outline' && 'bg-transparent gold-border text-primary hover:bg-primary hover:text-primary-foreground',
          size === 'sm' && 'text-[10px] px-4 py-2 rounded-sm',
          size === 'md' && 'text-xs px-6 py-3 rounded-sm',
          size === 'lg' && 'text-sm px-8 py-4 rounded-sm',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
GoldButton.displayName = 'GoldButton';

export default GoldButton;
