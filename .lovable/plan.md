

## Connect External OPPRIME Database and Populate Homepage with Real Video Content

### Approach

Create a secondary Supabase client for the external OPPRIME project (the anon key is a publishable key, safe to store in code). Use it to fetch `videos`, `genres`, and `series` on the homepage and a new video watch page.

### Implementation

**1. Create external Supabase client** (`src/lib/opprime-client.ts`)
- `createClient('https://rsngoqmqhfiflgwjggpn.supabase.co', '<anon_key>')`
- Export an S3 base URL constant: `https://opprimetv.s3-accelerate.amazonaws.com/`
- Export helper functions: `getVideoUrl(path)`, `getThumbnailUrl(path)`

**2. Rewrite the homepage** (`src/pages/Index.tsx`)
- Fetch `genres` from external client, render as a horizontal filter bar below the hero
- Fetch `videos` (with `approved = true`), joining or separately fetching `series` for grouping
- Fetch `series` table to get series titles
- Display videos as a grid of thumbnail cards (poster image from S3 + title + year)
- When a `serie_id` is present, group those videos under a series heading section
- Standalone videos (no `serie_id`) shown in the main grid
- Genre filter buttons filter the grid by `genre_id`
- Each card links to `/watch/:id`

**3. Add a Watch page** (`src/pages/Watch.tsx`)
- New route `/watch/:id` in `App.tsx`
- Fetch the single video row by `id` from external client
- Render an HTML5 `<video>` player with the S3 mp4 URL
- Show title, synopsis, year below the player
- If the video belongs to a series, show other episodes from the same `serie_id` as a sidebar/list

**4. Update routing** (`src/App.tsx`)
- Add `<Route path="/watch/:id" element={<Watch />} />`

### Files changed

| File | Change |
|---|---|
| `src/lib/opprime-client.ts` | New — external Supabase client + S3 URL helpers |
| `src/pages/Index.tsx` | Rewrite content sections to fetch from external `videos`/`genres`/`series` |
| `src/pages/Watch.tsx` | New — video player page |
| `src/App.tsx` | Add `/watch/:id` route |

### Notes
- The existing Lovable Cloud client remains untouched for auth, profiles, dashboard, etc.
- The external anon key is a publishable key — safe to embed in client code.
- No database migrations needed — this is read-only access to the external project.

