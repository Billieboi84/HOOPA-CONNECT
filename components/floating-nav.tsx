"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navItems } from '@/lib/navigation';

export function FloatingNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto mb-4 flex w-[min(92vw,34rem)] items-center justify-between gap-1 rounded-full border border-white/10 bg-background/75 p-2 shadow-glass backdrop-blur-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] font-medium transition',
              active ? 'bg-white/12 text-foreground' : 'text-muted-foreground hover:bg-white/8 hover:text-foreground'
            )}
          >
            <Icon className={cn('h-4 w-4', active && 'text-primary')} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
