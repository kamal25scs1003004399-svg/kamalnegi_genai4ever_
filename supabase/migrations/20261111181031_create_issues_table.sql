/*
# Create issues table for CivicPulse

1. New Tables
- `issues`
  - `id` (uuid, primary key)
  - `title` (text, not null) — short title of the civic issue
  - `category` (text, not null) — one of: roads, garbage, streetlights, water
  - `location` (text, not null) — description of where the issue is
  - `description` (text) — longer description of the issue
  - `urgency` (text, not null, default 'medium') — one of: low, medium, high
  - `status` (text, not null, default 'pending') — one of: pending, in_progress, resolved
  - `image_url` (text) — URL or data URL of attached photo
  - `upvotes` (integer, not null, default 0) — community upvote count
  - `ward` (text, not null, default 'Ward 1') — municipal ward identifier
  - `sla_deadline` (timestamptz, not null) — deadline for resolution (created_at + 48h)
  - `resolved_at` (timestamptz) — when the issue was marked resolved (for response time calc)
  - `created_at` (timestamptz, not null, default now())

2. Security
- Enable RLS on `issues`.
- Grant CRUD to `anon` + `authenticated` — this is a public, no-auth civic reporting app.
- All policies use `USING (true)` / `WITH CHECK (true)` because all issue data is intentionally public/shared.

3. Indexes
- Index on `category` for filtering.
- Index on `status` for filtering.
- Index on `upvotes` for sorting by popularity.
*/

CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('roads', 'garbage', 'streetlights', 'water')),
  location text NOT NULL,
  description text,
  urgency text NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  image_url text,
  upvotes integer NOT NULL DEFAULT 0,
  ward text NOT NULL DEFAULT 'Ward 1',
  sla_deadline timestamptz NOT NULL DEFAULT (now() + interval '48 hours'),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON issues TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_issues" ON issues;
CREATE POLICY "anon_select_issues" ON issues FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_issues" ON issues;
CREATE POLICY "anon_insert_issues" ON issues FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_issues" ON issues;
CREATE POLICY "anon_update_issues" ON issues FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_issues" ON issues;
CREATE POLICY "anon_delete_issues" ON issues FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_upvotes ON issues(upvotes DESC);
