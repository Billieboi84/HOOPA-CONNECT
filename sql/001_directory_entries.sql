-- Create directory_entries table for local businesses & tribal entities
CREATE TABLE IF NOT EXISTS directory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'Business',  -- 'Business' or 'Tribal Entity'
  phone TEXT,
  address TEXT,
  website TEXT,
  maps TEXT,  -- Google Maps URL
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  description TEXT,
  category TEXT,  -- e.g. 'Health', 'Education', 'Government', 'Retail', 'Services'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE directory_entries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read directory entries (public)
CREATE POLICY "Anyone can view directory entries"
  ON directory_entries
  FOR SELECT
  USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert directory entries"
  ON directory_entries
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update directory entries"
  ON directory_entries
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete directory entries"
  ON directory_entries
  FOR DELETE
  USING (auth.role() = 'authenticated');