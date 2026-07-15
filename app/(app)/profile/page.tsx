import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PortalCard } from '@/components/portal-card';
import { fetchCurrentUser } from '@/lib/portal-data';

export default async function ProfilePage() {
  const user = await fetchCurrentUser();

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6">
        <Badge variant="accent" className="w-fit">
          Profile
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Account and activity surface for Supabase auth.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          This branch keeps the auth system and prepares a React UI for account management, listings, and
          saved items.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <PortalCard
          eyebrow="Identity"
          title={user?.email ?? 'Signed-in user'}
          summary="Connect Supabase Auth here."
          footer={user ? 'Active session' : 'Guest state'}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
                <div className="mt-2 text-sm">{user ? 'Authenticated' : 'Ready for login session state'}</div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Storage</div>
                <div className="mt-2 text-sm">Profile images and uploads</div>
              </CardContent>
            </Card>
          </div>
        </PortalCard>

        <PortalCard eyebrow="Realtime" title="Live activity stream" summary="Plumb Supabase realtime events into this panel." footer="Realtime">
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
            Skeleton loading, live counts, and activity cards fit here.
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
