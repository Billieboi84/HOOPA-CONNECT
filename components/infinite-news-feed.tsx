"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageSquare, Send, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonStack } from '@/components/skeleton-stack';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { subscribeToTableChanges } from '@/lib/supabase/realtime';
import type { NewsItem } from '@/lib/mock-data';

const PAGE_SIZE = 2;

type VoteValue = 'up' | 'down';

type CommentRow = {
  id: string;
  article_id: string;
  user_id: string;
  display_name: string | null;
  body: string;
  created_at: string;
};

type VoteRow = {
  article_id: string;
  user_id: string;
  value: VoteValue;
};

type FeedState = Record<
  string,
  {
    vote: VoteValue | null;
    likes: number;
    dislikes: number;
    comments: CommentRow[];
  }
>;

type ActiveArticle = Omit<NewsItem, 'comments'> & {
  currentVote: VoteValue | null;
  likes: number;
  dislikes: number;
  comments: CommentRow[];
};

function buildInitialState(items: NewsItem[]): FeedState {
  return items.reduce<FeedState>((acc, item) => {
    acc[item.id] = {
      vote: null,
      likes: item.likes,
      dislikes: item.dislikes,
      comments: []
    };
    return acc;
  }, {});
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export function InfiniteNewsFeed({ items }: { items: NewsItem[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [feedState, setFeedState] = useState<FeedState>(() => buildInitialState(items));
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const itemsKey = useMemo(() => items.map((item) => item.id).join(','), [items]);
  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;

  const refreshFeed = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const [{ data: userData }, { data: voteRows }, { data: commentRows }] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from('news_votes')
        .select('article_id,user_id,value')
        .in('article_id', items.map((item) => item.id)),
      supabase
        .from('news_comments')
        .select('id,article_id,user_id,display_name,body,created_at')
        .in('article_id', items.map((item) => item.id))
        .order('created_at', { ascending: false })
    ]);

    const user = userData.user;
    setSessionUserId(user?.id ?? null);
    setSessionName(user?.user_metadata?.full_name ?? user?.email ?? null);

    const nextState = buildInitialState(items);

    items.forEach((item) => {
      const votesForArticle = (voteRows ?? []).filter((row) => row.article_id === item.id);
      const upVotes = votesForArticle.filter((row) => row.value === 'up').length;
      const downVotes = votesForArticle.filter((row) => row.value === 'down').length;
      const myVote = votesForArticle.find((row) => row.user_id === user?.id)?.value ?? null;

      nextState[item.id] = {
        vote: myVote,
        likes: item.likes + upVotes,
        dislikes: item.dislikes + downVotes,
        comments: (commentRows ?? []).filter((row) => row.article_id === item.id)
      };
    });

    setFeedState(nextState);
    setLoading(false);
  }, [items]);

  useEffect(() => {
    refreshFeed();
  }, [refreshFeed, itemsKey]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const votesChannel = subscribeToTableChanges(supabase, 'news_votes', () => refreshFeed());
    const commentsChannel = subscribeToTableChanges(supabase, 'news_comments', () => refreshFeed());

    return () => {
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [refreshFeed, itemsKey]);

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

  const activeArticle = useMemo<ActiveArticle | null>(() => {
    if (!activeId) return null;
    const item = items.find((article) => article.id === activeId);
    if (!item) return null;

    const state = feedState[item.id] ?? buildInitialState([item])[item.id];
    return {
      ...item,
      currentVote: state.vote,
      likes: state.likes,
      dislikes: state.dislikes,
      comments: state.comments
    };
  }, [activeId, feedState, items]);

  async function setVote(articleId: string, value: VoteValue) {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError('Missing Supabase configuration.');
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setError('Sign in to vote.');
      return;
    }

    setError('');
    const { error: voteError } = await supabase.from('news_votes').upsert(
      {
        article_id: articleId,
        user_id: user.id,
        value
      },
      { onConflict: 'article_id,user_id' }
    );

    if (voteError) {
      setError(voteError.message);
      return;
    }

    await refreshFeed();
  }

  async function addComment() {
    if (!activeArticle) return;

    const body = draft.trim();
    if (!body) return;

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError('Missing Supabase configuration.');
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setError('Sign in to comment.');
      return;
    }

    setError('');
    const { error: commentError } = await supabase.from('news_comments').insert({
      article_id: activeArticle.id,
      user_id: user.id,
      display_name: user.user_metadata?.full_name ?? user.email ?? 'Community member',
      body
    });

    if (commentError) {
      setError(commentError.message);
      return;
    }

    setDraft('');
    await refreshFeed();
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="section-grid">
        {visibleItems.map((item, index) => {
          const state = feedState[item.id] || buildInitialState([item])[item.id];

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
                <button
                  type="button"
                  className="block text-left"
                  onClick={() => setActiveId(item.id)}
                >
                  <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                </button>
                <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 px-5 pb-5">
                <Button variant={state.vote === 'up' ? 'default' : 'secondary'} size="sm" onClick={() => setVote(item.id, 'up')}>
                  <ThumbsUp className="h-4 w-4" />
                  {state.likes}
                </Button>
                <Button variant={state.vote === 'down' ? 'default' : 'secondary'} size="sm" onClick={() => setVote(item.id, 'down')}>
                  <ThumbsDown className="h-4 w-4" />
                  {state.dislikes}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setActiveId(item.id)}>
                  <MessageSquare className="h-4 w-4" />
                  {state.comments.length} comments
                </Button>
              </div>
            </motion.article>
          );
        })}
      </div>

      {hasMore ? (
        <div ref={sentinelRef} className="pt-2">
          {loading ? <SkeletonStack /> : null}
        </div>
      ) : null}

      {activeArticle ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            aria-label="Close article"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveId(null)}
          />
          <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-background shadow-glass">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <div className="text-sm font-semibold">{activeArticle.title}</div>
                <div className="text-xs text-muted-foreground">{activeArticle.category}</div>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close article" onClick={() => setActiveId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5 p-5">
                <div className="overflow-hidden rounded-3xl border border-white/10">
                  <img src={activeArticle.image} alt={activeArticle.title} className="h-full w-full object-cover object-[center_20%]" />
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{activeArticle.category}</Badge>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground">
                      {activeArticle.likes} likes
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground">
                      {activeArticle.comments.length} comments
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{activeArticle.body}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant={activeArticle.currentVote === 'up' ? 'default' : 'secondary'} size="sm" onClick={() => setVote(activeArticle.id, 'up')}>
                    <ChevronUp className="h-4 w-4" />
                    Upvote
                  </Button>
                  <Button variant={activeArticle.currentVote === 'down' ? 'default' : 'secondary'} size="sm" onClick={() => setVote(activeArticle.id, 'down')}>
                    <ChevronDown className="h-4 w-4" />
                    Downvote
                  </Button>
                </div>
              </div>

              <div className="border-t border-white/10 bg-white/[0.03] p-5 lg:border-l lg:border-t-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Comments</div>
                    <div className="text-xs text-muted-foreground">
                      {sessionName ? `Signed in as ${sessionName}` : 'Sign in to add a comment'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 max-h-[42vh] space-y-3 overflow-auto pr-1 lg:max-h-[56vh]">
                  {activeArticle.comments.length ? (
                    activeArticle.comments.map((comment) => (
                      <div key={comment.id} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium">{comment.display_name || 'Community member'}</div>
                          <div className="text-xs text-muted-foreground">{formatTimestamp(comment.created_at)}</div>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{comment.body}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.04] px-4 py-6 text-sm text-muted-foreground">
                      Be the first to add a comment.
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={sessionName ? 'Write a comment' : 'Sign in to comment'}
                    disabled={!sessionUserId}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addComment();
                      }
                    }}
                  />
                  <Button onClick={addComment} disabled={!sessionUserId}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
