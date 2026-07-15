import { directoryItems, jobItems } from '@/lib/mock-data';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type DirectoryRow = {
  id: string;
  name: string;
  kind: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  maps: string | null;
  description: string | null;
  category: string | null;
};

type JobRow = {
  id: string;
  title: string;
  employer: string;
  type: string | null;
  location: string | null;
  summary: string | null;
  category: string | null;
  salary: string | null;
  closing_date: string | null;
  link: string | null;
};

export async function fetchDirectoryEntries() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return directoryItems;

  const { data, error } = await supabase.from('directory_entries').select('*').order('name', { ascending: true });
  if (error || !data?.length) return directoryItems;

  return data.map((row: DirectoryRow) => ({
    id: row.id,
    name: row.name,
    kind: row.kind || 'Business',
    phone: row.phone || '',
    address: row.address || '',
    website: row.website || '',
    maps: row.maps || '',
    description: row.description || '',
    category: row.category || ''
  }));
}

export async function fetchJobListings() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return jobItems;

  const { data, error } = await supabase.from('job_listings').select('*').order('created_at', { ascending: false });
  if (error || !data?.length) return jobItems;

  return data.map((row: JobRow) => ({
    id: row.id,
    title: row.title,
    employer: row.employer,
    type: row.type || 'Full-time',
    location: row.location || '',
    summary: row.summary || '',
    category: row.category || '',
    salary: row.salary || '',
    closingDate: row.closing_date || '',
    link: row.link || '#'
  }));
}

export async function fetchCurrentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
