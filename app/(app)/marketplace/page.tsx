import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalCard } from '@/components/portal-card';
import { marketplaceItems } from '@/lib/mock-data';

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <section className="glass-panel p-6">
        <Badge variant="accent" className="w-fit">
          Marketplace
        </Badge>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">Browse local listings, offers, and community goods in one place.</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Hoopa Connect keeps the existing Supabase-backed data model and presents it in a faster,
              cleaner marketplace layout.
            </p>
          </div>
          <Button asChild>
            <Link href="/directory">
              View directory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="section-grid">
        {marketplaceItems.map((item) => (
          <PortalCard
            key={item.id}
            eyebrow={item.category}
            title={item.title}
            summary={item.summary}
            footer={item.seller}
          >
            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>{item.location}</span>
              <span className="font-medium text-foreground">{item.price}</span>
            </div>
          </PortalCard>
        ))}
      </section>
    </div>
  );
}
