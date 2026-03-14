

## Plan: Connect Browse Page to OPPRIME Catalog

The homepage already fetches videos from the OPPRIME project correctly. The **Browse page** (`src/pages/Browse.tsx`) is the main gap — it still queries the local `films` table and uses hardcoded mock genres.

### Changes

**1. Update `src/pages/Browse.tsx`**
- Replace `supabase` import with `opprimeClient` and `getThumbnailUrl` from `@/lib/opprime-client`
- Remove the mock `genres` import from `@/lib/mock-data`
- Fetch videos from `opprimeClient.from('videos').select('*')` and genres from `opprimeClient.from('genres').select('*')`
- Map OPPRIME video fields (`id`, `title`, `thumbnail`, `genre_id`, `synopsis`, `url`) to the card display
- Genre filter buttons: fetch real genres, filter videos by matching `genre_id`
- Cards link to `/watch/:id` (already handled) and show thumbnails via `getThumbnailUrl(video.thumbnail)`
- Replace `FilmCard` usage with `VideoHoverCard` (already used on homepage) for consistency, or render a simple poster grid card using the OPPRIME thumbnail URL

**2. No database or backend changes needed** — the OPPRIME client and Watch page are already wired up correctly.

