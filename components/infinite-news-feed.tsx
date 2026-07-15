"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageSquare, Send, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonStack } from '@/components/skeleton-stack';
import type { NewsItem } from '@/lib/mock-data';

const PAGE_SIZE = 2;
const STORAGE_KEY = 'hoopa-news-interactions-v1';

type InteractionState = Record<
  string,
  {
    vote: 'up' | 'down' | null;
    likes: number;
    dislikes: number;
    comments: string[];
  }
>;

function loadInteractions(items: NewsItem[]): InteractionState {
  const seed: InteractionState = {};
  items.forEach((item) => {
    seed[item.id] = {
      vote: null,
      likes: item.likes,
      dislikes: item.dislikes,
      comments: []
    };
  });

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<InteractionState>;
    return Object.entries(seed).reduce<InteractionState>((acc, [id, value]) => {
      const saved = parsed[id];
      acc[id] = {
        vote: saved?.vote ?? value.vote,
        likes: typeof saved?.likes === 'number' ? saved.likes : value.likes,
        dislikes: typeof saved?.dislikes === 'number' ? saved.dislikes : value.dislikes,
        comments: Array.isArray(saved?.comments) ? saved.comments : value.comments
      };
      return acc;
    }, {});
  } catch {
    return seed;
  }
}

export function InfiniteNewsFeed({ items }: { items: NewsItem[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [interactions, setInteractions] = useState<InteractionState>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;
  const activeItem = visibleItems.find((item) => item.id === activeId) || items.find((item) => item.id === activeId) || null;

  useEffect(() => {
    setInteractions(loadInteractions(items));
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(interactions));
    } catch {
      // Ignore storage failures.
    }
  }, [interactions]);

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

  function updateVote(itemId: string, nextVote: 'up' | 'down') {
    setInteractions((current) => {
      const existing = current[itemId] || { vote: null, likes: 0, dislikes: 0, comments: [] };
      let likes = existing.likes;
      let dislikes = existing.dislikes;
      let vote: 'up' | 'down' | null = existing.vote;

      if (existing.vote === nextVote) {
        if (nextVote === 'up') likes = Math.max(0, likes - 1);
        if (nextVote === 'down') dislikes = Math.max(0, dislikes - 1);
        vote = null;
      } else {
        if (existing.vote === 'up') likes = Math.max(0, likes - 1);
        if (existing.vote === 'down') dislikes = Math.max(0, dislikes - 1);
        if (nextVote === 'up') likes += 1;
        if (nextVote === 'down') dislikes += 1;
        vote = nextVote;
      }

      return {
        ...current,
        [itemId]: {
          ...existing,
          vote,
          likes,
          dislikes
        }
      };
    });
  }

  function openComments(itemId: string) {
    setActiveId(itemId);
    setDraft('');
  }

  function addComment() {
    if (!activeId) return;
    const value = draft.trim();
    if (!value) return;

    setInteractions((current) => {
      const existing = current[activeId] || { vote: null, likes: 0, dislikes: 0, comments: [] };
      return {
        ...current,
        [activeId]: {
          ...existing,
          comments: [value, ...existing.comments]
        }
      };
    });
    setDraft('');
  }

  return (
    <div className="space-y-4">
      <div className="section-grid">
        {visibleItems.map((item, index) => {
          const state = interactions[item.id] || {
            vote: null,
            likes: item.likes,
            dislikes: item.dislikes,
            comments: []
          };

          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -12% 0px' }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              className="glass-panel overflow-hidden"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover object-[center_20%]" />
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                  <Badge>{item.category}</Badge>
                  <span className="text-xs text-muted-foreground">{state.likes - state.dislikes} score</span>
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={state.vote === 'up' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => updateVote(item.id, 'up')}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {state.likes}
                  </Button>
                  <Button
                    variant={state.vote === 'down' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => updateVote(item.id, 'down')}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    {state.dislikes}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openComments(item.id)}>
                    <MessageSquare className="h-4 w-4" />
                    {state.comments.length} comments
                  </Button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {hasMore ? (
        <div ref={sentinelRef} className="pt-2">
          <SkeletonStack />
        </div>
      ) : null}

      {activeItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            aria-label="Close article"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveId(null)}
          />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-background shadow-glass">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <div className="text-sm font-semibold">{activeItem.title}</div>
                <div className="text-xs text-muted-foreground">{activeItem.category}</div>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close article" onClick={() => setActiveId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
              <div className="aspect-[16/12] md:aspect-auto md:min-h-[320px]">
                <img src={activeItem.image} alt={activeItem.title} className="h-full w-full object-cover object-[center_20%]" />
              </div>
              <div className="space-y-4 p-5">
                <p className="text-sm leading-6 text-muted-foreground">{activeItem.body}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={interactions[activeItem.id]?.vote === 'up' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => updateVote(activeItem.id, 'up')}
                  >
                    <ChevronUp className="h-4 w-4" />
                    Upvote
                  </Button>
                  <Button
                    variant={interactions[activeItem.id]?.vote === 'down' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => updateVote(activeItem.id, 'down')}
                  >
                    <ChevronDown className="h-4 w-4" />
                    Downvote
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-medium">Comments</div>
                  <div className="space-y-2">
                    {(interactions[activeItem.id]?.comments || []).length ? (
                      interactions[activeItem.id].comments.map((comment, idx) => (
                        <div key={`${activeItem.id}-${idx}`} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-foreground">
                          {comment}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No comments yet.</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Write a comment"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addComment();
                        }
                      }}
                    />
                    <Button onClick={addComment}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
