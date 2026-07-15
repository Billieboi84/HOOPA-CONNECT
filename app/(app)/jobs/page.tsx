import { BriefcaseBusiness } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PortalCard } from '@/components/portal-card';
import { fetchJobListings } from '@/lib/portal-data';

export default async function JobsPage() {
  const jobItems = await fetchJobListings();

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6">
        <Badge variant="accent" className="w-fit">
          Jobs
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Recruiting, filtered, and mobile-friendly.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          The next branch keeps the existing job_listings schema and upgrades the experience into a React
          workflow with cleaner cards, better spacing, and loading states.
        </p>
      </section>

      <section className="section-grid">
        {jobItems.map((job) => (
          <PortalCard key={job.id} eyebrow={job.type} title={job.title} summary={job.summary} footer={job.employer}>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-3">
                <span>{job.location}</span>
                <BriefcaseBusiness className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 px-3 py-1">{job.category}</span>
                <span className="rounded-full border border-white/10 px-3 py-1">{job.salary}</span>
                <span className="rounded-full border border-white/10 px-3 py-1">{job.closingDate}</span>
              </div>
            </div>
          </PortalCard>
        ))}
      </section>
    </div>
  );
}
