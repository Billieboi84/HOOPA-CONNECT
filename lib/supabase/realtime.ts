import type { SupabaseClient } from '@supabase/supabase-js';

export function subscribeToTableChanges(
  client: SupabaseClient,
  table: string,
  onChange: (payload: unknown) => void
) {
  return client
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      onChange(payload);
    })
    .subscribe();
}
