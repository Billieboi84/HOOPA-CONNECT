"use client";

import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PortalCard } from '@/components/portal-card';

export function ProfileClient() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoading(false);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6">
        <Badge variant="accent" className="w-fit">
          Profile
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Your account, listings, and saved activity.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Manage your account session, view saved items, and keep track of your activity in one place.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <PortalCard
          eyebrow="Identity"
          title={loading ? 'Loading session' : email ?? 'Not signed in'}
          summary="Connected to Supabase Auth."
          footer={email ? 'Active session' : 'Guest state'}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="border-white/10 bg-white/[0.06]">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
                <div className="mt-2 text-sm">
                  {loading ? 'Checking session' : email ? 'Authenticated' : 'Ready for login session state'}
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/[0.06]">
              <CardContent className="p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Storage</div>
                <div className="mt-2 text-sm">Profile images and uploads</div>
              </CardContent>
            </Card>
          </div>
        </PortalCard>

        <PortalCard eyebrow="Realtime" title="Live activity stream" summary="Plumb Supabase realtime events into this panel." footer="Realtime">
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.06] p-4 text-sm text-muted-foreground">
            Skeleton loading, live counts, and activity cards fit here.
          </div>
        </PortalCard>
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
