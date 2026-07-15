"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { PortalCard } from '@/components/portal-card';
import { Badge } from '@/components/ui/badge';
import { SkeletonStack } from '@/components/skeleton-stack';
import type { NewsItem } from '@/lib/mock-data';

const PAGE_SIZE = 2;

export function InfiniteNewsFeed({ items }: { items: NewsItem[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + PAGE_SIZE, items.length));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, items.length, visibleCount]);

  return (
    <div className="space-y-4">
      <div className="section-grid">
        {visibleItems.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -12% 0px' }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            className="glass-panel overflow-hidden"
          >
            <div className="aspect-[16/10] overflow-hidden">
              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <Badge>{item.category}</Badge>
                <span className="text-xs text-muted-foreground">{item.likes} likes</span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Engage
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {item.comments} comments
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {hasMore ? (
        <div ref={sentinelRef} className="pt-2">
          <SkeletonStack />
        </div>
      ) : null}
    </div>
  );
}
