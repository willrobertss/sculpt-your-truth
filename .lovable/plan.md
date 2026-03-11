

## Revamp Submission Flow: Submit Details → Go Live → Upload from Dashboard

### Problem
The current submit flow collects details and publishes, but there's no actual file upload step. The user expects: fill in details → content goes live → then upload video/poster from the dashboard.

### New Flow

1. **Submit page** (as-is but cleaner): Account → Content Type → Details → Rights → Publish
   - On publish: creates the record with `status: 'live'`, no video yet
   - Success screen says "You're live! Now upload your video and poster from your dashboard."
   - Redirects to dashboard

2. **Dashboard film/short/vertical cards** get upload buttons:
   - Each card shows an "Upload Video" button and "Upload Poster/Thumbnail" button when those fields are empty
   - Video upload goes to the `videos` storage bucket
   - Poster/thumbnail upload goes to `posters` or `thumbnails` bucket
   - After upload, updates the record's `video_url` / `poster_url` / `thumbnail_url`

### Files to change

| File | Change |
|---|---|
| `src/pages/Submit.tsx` | Update success screen to direct user to dashboard for uploads. Remove the old "Upload" step label confusion — rename step 2 to "Type" since it's really content type selection. |
| `src/components/dashboard/DashboardFilms.tsx` | Add poster upload + video URL input for each film card. Upload poster to `posters` bucket, save URL to `poster_url`. Add video URL text input for `video_url` (external hosting per strategy). |
| `src/components/dashboard/DashboardShorts.tsx` | Same pattern: thumbnail upload to `thumbnails` bucket, video URL input. |
| `src/components/dashboard/DashboardVerticals.tsx` | Same pattern: thumbnail upload, video URL input. |

### Upload approach
- **Posters/Thumbnails**: Direct file upload to existing storage buckets (`posters`, `thumbnails`) using `supabase.storage.from('bucket').upload()`, then save the public URL to the record.
- **Videos**: Text input for external video URL (per the video storage strategy — use external hosting like Mux/Cloudflare Stream). Save URL to `video_url` field.

### No database changes needed
All columns (`poster_url`, `video_url`, `thumbnail_url`) already exist on the tables. Storage buckets (`posters`, `thumbnails`, `videos`) already exist and are public.

