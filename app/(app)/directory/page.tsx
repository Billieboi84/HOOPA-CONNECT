import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PortalCard } from '@/components/portal-card';
import { fetchDirectoryEntries } from '@/lib/portal-data';

export default async function DirectoryPage() {
  const directoryItems = await fetchDirectoryEntries();

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6">
        <Badge variant="accent" className="w-fit">
          Directory
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Trusted local listings for the Hoopa Valley community.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          The directory is backed by the existing `directory_entries` table and presented in a clean,
          responsive card grid.
        </p>
      </section>

      <section className="section-grid">
        {directoryItems.map((item) => (
          <PortalCard key={item.id} eyebrow={item.kind} title={item.name} summary={item.description} footer={item.address}>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-3">
                <div>{item.website.replace('https://', '')}</div>
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 px-3 py-1">{item.category}</span>
                <span className="rounded-full border border-white/10 px-3 py-1">{item.phone}</span>
              </div>
            </div>
          </PortalCard>
        ))}
      </section>
    </div>
  );
}
