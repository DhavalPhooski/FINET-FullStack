-- Social Intelligence Hub Tables
-- Paste this SQL in Supabase SQL Editor > New Query > Run

-- 1. Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('success', 'question', 'tip', 'discussion')),
  tags TEXT[] DEFAULT '{}',
  upvote_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  created_at TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Community Upvotes Table (tracks who upvoted what)
CREATE TABLE IF NOT EXISTS community_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  created_at TIMESTAMP(3) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  UNIQUE(user_id, post_id)  -- Prevent duplicate upvotes
);

-- 3. Indexes for fast queries
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_community_upvotes_user_id ON community_upvotes(user_id);
CREATE INDEX idx_community_upvotes_post_id ON community_upvotes(post_id);
