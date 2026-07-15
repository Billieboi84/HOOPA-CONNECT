"use client";

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, MessageSquare, Search, Shield, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { FloatingNav } from '@/components/floating-nav';
import { navItems } from '@/lib/navigation';

export function SiteShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_26%)]" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] backdrop-blur-xl">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Hoopa Connect</div>
              <div className="text-xs text-muted-foreground">Community portal</div>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/marketplace">
                <Search className="h-4 w-4" />
                Marketplace
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/directory">
                <Shield className="h-4 w-4" />
                Directory
              </Link>
            </Button>
            <ThemeToggle />
            <Button size="sm" asChild>
              <Link href="/signup">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label="Open navigation" onClick={() => setDrawerOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <FloatingNav />

      <div className="fixed bottom-6 right-6 hidden md:block">
        <Button variant="secondary" className="rounded-full px-5 shadow-glass" asChild>
          <Link href="/login">
            <MessageSquare className="h-4 w-4" />
            Open auth
          </Link>
        </Button>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-[min(88vw,22rem)] border-l border-white/10 bg-background/95 p-4 shadow-glass backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Navigation</div>
              <Button variant="ghost" size="icon" aria-label="Close navigation" onClick={() => setDrawerOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-6 grid gap-3">
              <Button asChild>
                <Link href="/signup" onClick={() => setDrawerOpen(false)}>
                  Get started
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/login" onClick={() => setDrawerOpen(false)}>
                  Sign in
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
