import Link from 'next/link';
import { ArrowRight, Newspaper, Pin, TrendingUp, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PortalCard } from '@/components/portal-card';
import { HeroStage } from '@/components/hero-stage';
import { ChairmanSection } from '@/components/chairman-section';
import { InfiniteNewsFeed } from '@/components/infinite-news-feed';
import { directoryItems, jobItems, newsItems } from '@/lib/mock-data';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <HeroStage />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'News', value: 'Local updates', icon: Newspaper },
          { title: 'Directory', value: `${directoryItems.length} trusted listings`, icon: Pin },
          { title: 'Jobs', value: `${jobItems.length} open roles`, icon: TrendingUp },
          { title: 'Community', value: 'Built for Hoopa Valley', icon: UsersRound }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <PortalCard
              key={item.title}
              eyebrow={item.title}
              title={item.value}
              summary="Designed for quick scanning on small screens and dense review on desktop."
              footer="Overview"
            >
              <Icon className="h-5 w-5 text-primary" />
            </PortalCard>
          );
        })}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <Badge variant="accent">Community feed</Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Recent updates and announcements</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/marketplace">
              View marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <InfiniteNewsFeed items={newsItems} />
      </section>

      <ChairmanSection />
    </div>
  );
}
