import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-white/10 text-foreground',
      accent: 'bg-primary/20 text-primary-foreground',
      muted: 'bg-muted text-muted-foreground'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
