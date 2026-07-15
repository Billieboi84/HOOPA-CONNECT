import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type PortalCardProps = {
  title: string;
  summary: string;
  eyebrow: string;
  footer: string;
  className?: string;
  children?: ReactNode;
};

export function PortalCard({ title, summary, eyebrow, footer, className, children }: PortalCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Badge variant="accent">{eyebrow}</Badge>
          <span className="text-xs text-muted-foreground">{footer}</span>
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary}</p>
        {children ? <div className="mt-4">{children}</div> : null}
      </CardContent>
    </Card>
  );
}
