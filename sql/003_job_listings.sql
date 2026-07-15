-- Create job_listings table for local & tribal job opportunities
CREATE TABLE IF NOT EXISTS job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  employer TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Full-time',  -- Full-time, Part-time, Seasonal, Contract, Internship
  location TEXT NOT NULL DEFAULT 'Hoopa, CA',
  link TEXT,  -- Online application URL
  download TEXT,  -- PDF application form URL
  summary TEXT,
  category TEXT,  -- e.g. 'Healthcare', 'Education', 'Administration', 'Public Works', 'Services'
  salary TEXT,  -- e.g. '$15-$20/hr' or '$40,000-$55,000/yr'
  closing_date TEXT,  -- e.g. '2026-08-15' or 'Open until filled'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read job listings (public)
CREATE POLICY "Anyone can view job listings"
  ON job_listings
  FOR SELECT
  USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert job listings"
  ON job_listings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update job listings"
  ON job_listings
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete job listings"
  ON job_listings
  FOR DELETE
  USING (auth.role() = 'authenticated');