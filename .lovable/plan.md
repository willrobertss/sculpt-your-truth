

## Add Direct Video File Upload to Dashboard

### Problem
The dashboard currently only accepts a **video URL paste** (text input), but the user expects to upload actual video files directly. The "+" buttons on the Submit page just collect metadata — there's no actual file upload anywhere in the flow. The user wants to upload video files to storage for testing purposes.

### Solution
Add direct video file upload to the `videos` storage bucket (which already exists and is public) in each dashboard content tab (Films, Shorts, Verticals). Replace the "paste video URL" text input with a proper file upload button that uploads to the `videos` bucket and saves the resulting public URL.

### Changes

| File | Change |
|---|---|
| `src/components/dashboard/DashboardFilms.tsx` | Replace video URL text input with a file upload button. Upload `.mp4`/`.mov`/`.webm` files to `videos` bucket, save public URL to `video_url` column. Keep poster image upload as-is. |
| `src/components/dashboard/DashboardShorts.tsx` | Same: replace video URL input with file upload to `videos` bucket. |
| `src/components/dashboard/DashboardVerticals.tsx` | Same: replace video URL input with file upload to `videos` bucket. |
| **DB migration** | Add RLS policies on `storage.objects` for the `videos` bucket (INSERT for authenticated, SELECT for public, UPDATE for authenticated) — same pattern as posters/thumbnails. |

### Upload behavior
- Each content card shows an "Upload Video" button when no video is linked
- Clicking opens a file picker accepting `video/*`
- File uploads to `videos/{contentId}/video.{ext}` with upsert
- On success, saves the public URL to the record's `video_url` and shows a toast
- Shows a spinner/progress indicator during upload
- Once uploaded, shows "Video ✓" with a "Replace Video" option

### No external services needed
For testing, videos go directly into the existing `videos` storage bucket. Later this can be swapped for Mux/Beekeeper/etc.

