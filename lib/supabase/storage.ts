import type { SupabaseClient } from '@supabase/supabase-js';

export function getPublicStorageUrl(bucket: string, path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return '';

  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export async function uploadStorageFile(
  client: SupabaseClient,
  bucket: string,
  path: string,
  file: File
) {
  const { data, error } = await client.storage.from(bucket).upload(path, file, {
    upsert: true
  });

  return { data, error };
}
