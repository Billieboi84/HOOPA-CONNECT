-- Persist vote and comment activity for news stories
CREATE TABLE IF NOT EXISTS news_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value TEXT NOT NULL CHECK (value IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (article_id, user_id)
);

CREATE TABLE IF NOT EXISTS news_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_votes_article_id ON news_votes(article_id);
CREATE INDEX IF NOT EXISTS idx_news_comments_article_id ON news_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_news_comments_created_at ON news_comments(created_at DESC);

ALTER TABLE news_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view news votes"
  ON news_votes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert news votes"
  ON news_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own news votes"
  ON news_votes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own news votes"
  ON news_votes
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view news comments"
  ON news_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert news comments"
  ON news_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own news comments"
  ON news_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own news comments"
  ON news_comments
  FOR DELETE
  USING (auth.uid() = user_id);
