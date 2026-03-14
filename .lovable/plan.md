

## Plan: Poster Enhancements, Aspect Ratio Choice, Watch Page Social Sidebar

### 1. Poster Generator Enhancements (`PosterGenerator.tsx`)

**Aspect ratio selector**: Add a radio group (16:9 landscape / 9:16 portrait) before the generate button. Pass the chosen aspect to the edge function so the prompt instructs the AI accordingly.

**Download button**: After generation, show a "Download Poster" button that triggers a browser download of the image.

**"Use as Film Poster" button**: After generation, show a button that saves the poster URL to the video's `poster_url` column (already happens automatically, but make it explicit with a confirmation toast). The `onGenerated` callback already handles this.

### 2. Edge Function Update (`supabase/functions/generate-poster/index.ts`)

Accept an `aspectRatio` parameter (`"16:9"` or `"9:16"`). Adjust the prompt to specify landscape vs portrait orientation accordingly.

### 3. Homepage Cards Show Posters (`VideoHoverCard.tsx`)

Already uses `poster_url || thumbnail` — no change needed. Cards will automatically show AI posters once generated.

### 4. Watch Page Social Sidebar (`Watch.tsx`)

Redesign the layout so the video player takes ~75% width and a right sidebar takes ~25% on desktop. The sidebar contains:

- **Like button** (heart icon with count, stored in a new `video_likes` table)
- **Comments section** — scrollable list of comments with an input field (new `video_comments` table)
- **Share button** — copies a share link; if the video has a `trailer_url`, shares that URL instead

On mobile, the sidebar collapses below the video.

### 5. Database Migration

```sql
CREATE TABLE public.video_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(video_id, user_id)
);
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can read, authenticated can insert/delete own
CREATE POLICY "Public can view comments" ON public.video_comments FOR SELECT TO public USING (true);
CREATE POLICY "Auth users can insert comments" ON public.video_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.video_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Public can view likes" ON public.video_likes FOR SELECT TO public USING (true);
CREATE POLICY "Auth users can toggle likes" ON public.video_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.video_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Files Changed/Created

| File | Change |
|---|---|
| `src/components/PosterGenerator.tsx` | Add aspect ratio selector, download button, "Use as Poster" button |
| `supabase/functions/generate-poster/index.ts` | Accept `aspectRatio` param, adjust prompt |
| `src/pages/Watch.tsx` | Add social sidebar (likes, comments, share) at 25% width |
| `src/components/admin/VideoApprovalDialog.tsx` | Minor — poster generator already integrated, no changes needed |
| Database migration | Create `video_comments` and `video_likes` tables with RLS |

