import { SiteShell } from '@/components/site-shell';
import type { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
