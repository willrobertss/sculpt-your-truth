

## Netflix-Style Homepage Redesign + AI Poster Generator

This is a large feature set with four main components. Here is the plan broken into phases.

---

### 1. Netflix-Style Horizontal Row Layout

Replace the current grid layout with horizontally scrolling content rows, each with a category heading (genre-based rows, series rows, "Recently Added", etc.).

**Files:** `src/pages/Index.tsx`, new `src/components/ContentRow.tsx` (already exists but will be rewritten)

- Group videos into rows by genre (one row per genre that has videos)
- Series get their own row
- Each row scrolls horizontally with left/right arrow buttons
- Cards use landscape aspect ratio (16:9) like Netflix tiles

### 2. Netflix Hover Card with Expand

When hovering a video card, it scales up and shows action buttons (Play, Add to List, Like/Dislike) plus a down-arrow that expands a detail panel with synopsis, year, genre tags.

**Files:** New `src/components/VideoHoverCard.tsx`

- On hover: card scales ~1.3x, shows a mini overlay with buttons
- Down-arrow button expands a dropdown panel below the card showing synopsis, year, country, genre
- Play button navigates to `/watch/:id`

### 3. AI Poster Generator (Admin + Creator)

Add a "Generate Poster" button in both the admin VideoApprovalDialog and the creator ContentEditDialog. It uses Lovable AI (Nano Banana image model) to generate a stylized movie poster from the existing thumbnail frame.

**Database migration:** Add `poster_url` column to the internal `videos` table (it currently only has `thumbnail`).

**Files:** New `src/components/PosterGenerator.tsx`, updated `VideoApprovalDialog.tsx`, updated `ContentEditDialog.tsx`

- User clicks "Generate Poster" which sends the current thumbnail to the AI image model with a prompt like "Create a cinematic movie poster for [title]: [synopsis]"
- Generated image is uploaded to storage and saved as `poster_url`
- Homepage cards prefer `poster_url` over raw `thumbnail` when available

**Backend:** New edge function `supabase/functions/generate-poster/index.ts` that calls Lovable AI gateway with the image generation model, returns base64, uploads to storage.

### 4. Hero Billboard with Video Preview

Replace the static hero image with a featured-film billboard that auto-plays a short muted clip, showing the film title, synopsis snippet, and Play/More Info buttons (like Netflix).

**Database migration:** Add `featured` boolean and `preview_clip_url` columns to the internal `videos` table.

**Files:** New `src/components/HeroBillboard.tsx`, updated `src/pages/Index.tsx`

- Admin marks a video as "featured" in the admin panel
- Homepage picks one featured video and plays `preview_clip_url` as a muted background loop
- Overlay shows title, synopsis, Play and More Info buttons
- Falls back to the existing static hero if no featured video exists

---

### Database Changes (Internal Lovable Cloud)

```sql
ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS poster_url text,
  ADD COLUMN IF NOT EXISTS preview_clip_url text,
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
```

### Implementation Order

1. Database migration (add columns)
2. Netflix horizontal rows + hover card (homepage visual overhaul)
3. Hero billboard component
4. AI poster generator edge function + UI in admin and creator dialogs
5. Wire poster_url into homepage cards

### Files Changed/Created

| File | Change |
|---|---|
| `src/pages/Index.tsx` | Replace grid with horizontal rows + hero billboard |
| `src/components/VideoHoverCard.tsx` | New — Netflix-style hover card with expand |
| `src/components/HeroBillboard.tsx` | New — auto-playing featured video hero |
| `src/components/PosterGenerator.tsx` | New — AI poster generation UI component |
| `src/components/admin/VideoApprovalDialog.tsx` | Add poster generator + featured toggle |
| `src/components/dashboard/ContentEditDialog.tsx` | Add poster generator for creators |
| `supabase/functions/generate-poster/index.ts` | New — edge function for AI image generation |

