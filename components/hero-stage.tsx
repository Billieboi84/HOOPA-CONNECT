"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const metrics = [
  { label: 'Mobile-first', value: 'Fast scanning' },
  { label: 'Dark mode', value: 'Default experience' },
  { label: 'Realtime', value: 'Supabase-ready' }
];

export function HeroStage() {
  return (
    <section className="glass-panel overflow-hidden">
      <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
        <div className="space-y-5">
          <Badge variant="accent" className="w-fit gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Community portal
          </Badge>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-5xl"
          >
            Hoopa Connect connects the people of the Hoopa Valley with local news, jobs, marketplace listings, and trusted community resources.
          </motion.h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Built with a modern React stack and Supabase-backed authentication, storage, and realtime data.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/marketplace">
                Open portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/signup">Create account</Link>
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="space-y-3 rounded-[1.75rem] border border-white/10 bg-black/15 p-4 backdrop-blur-xl"
        >
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-medium">{metric.label}</div>
              <div className="mt-1 text-sm text-muted-foreground">{metric.value}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
