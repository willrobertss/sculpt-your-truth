

## Plan: Ad Management System for Admin

### Overview
Create an ad management system that lets admins upload commercials and assign them to play before, during, or after videos. The Watch page player will be updated to play ads at the configured placement.

### Database Changes

**New `ads` table:**
- `id` (uuid, PK)
- `title` (text) — ad name for admin reference
- `video_url` (text) — path in storage bucket or full URL
- `duration_seconds` (integer)
- `is_active` (boolean, default true)
- `created_at`, `updated_at` (timestamps)

**New `ad_placements` table:**
- `id` (uuid, PK)
- `ad_id` (uuid, FK → ads)
- `video_id` (text) — the content video ID (text to match OPPRIME IDs)
- `placement` (enum: `pre_roll`, `mid_roll`, `post_roll`)
- `trigger_at_seconds` (integer, nullable) — for mid-roll, when to insert the ad
- `created_at` (timestamp)

**New enum:** `ad_placement_type` (`pre_roll`, `mid_roll`, `post_roll`)

**New storage bucket:** `ads` (public) for uploading commercial files.

**RLS:** Admin-only CRUD on both tables; public SELECT so the player can fetch ads.

### Admin UI Changes

**Add "Ads" tab to Admin page** (`src/pages/Admin.tsx`):
- New nav item `{ id: 'ads', label: 'Ads' }`
- New component `src/components/admin/AdsManager.tsx`

**AdsManager component:**
1. **Ad Library section** — table of all uploaded ads with title, duration, active toggle, delete button, and an "Upload New Ad" dialog with file upload to the `ads` storage bucket + title/duration fields.
2. **Ad Placements section** — table showing which ads are assigned to which videos. An "Assign Ad" dialog lets admin:
   - Select an ad from the library
   - Enter a video ID (or search/select from OPPRIME videos)
   - Choose placement: Pre-roll / Mid-roll / Post-roll
   - For mid-roll, specify the timestamp (seconds into the video)

### Watch Page Player Changes

**Update `src/pages/Watch.tsx`:**
- On load, fetch ad placements for the current video ID from `ad_placements` joined with `ads` (where `is_active = true`)
- Implement a simple ad player state machine:
  - **Pre-roll**: Before main video plays, show the ad video with a "Skip in X seconds" countdown overlay. On ad end, start main content.
  - **Mid-roll**: Listen to `timeupdate` on the main video. When current time reaches `trigger_at_seconds`, pause main video, play ad, then resume.
  - **Post-roll**: On main video `ended` event, play the ad.
- During ad playback: hide main controls, show "Ad · X seconds remaining" overlay, optionally a "Skip Ad" button after a few seconds.

### Files to Create/Edit
- **Create**: `src/components/admin/AdsManager.tsx` — full ad library + placement management UI
- **Edit**: `src/pages/Admin.tsx` — add "Ads" nav tab and render `AdsManager`
- **Edit**: `src/pages/Watch.tsx` — add ad fetching and playback logic with pre/mid/post-roll support
- **Migration**: Create `ad_placement_type` enum, `ads` table, `ad_placements` table, `ads` storage bucket, and RLS policies

