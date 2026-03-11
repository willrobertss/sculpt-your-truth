
Goal: fix the broken creator workflow so submitting content takes the user straight into an editor/uploader, each title has an obvious pencil edit action, profile editing actually works, and uploaded videos are visible on the site.

What I found
- The dashboard opens on `overview`, so after submit the user lands on a stats page instead of an upload screen. Your screenshot confirms that.
- Upload controls exist only inside the individual tabs, so they are easy to miss.
- There is no pencil/edit action on creator titles yet.
- The public site still does not actually play uploaded media:
  - `FilmDetail.tsx` has a “Watch Now” button but no player wired to `video_url`
  - `Shorts.tsx` shows thumbnails only and does not even fetch `video_url`
  - `Verticals.tsx` fetches `video_url` but still renders an image instead of a video
- The latest database rows for your content still have `video_url`/`thumbnail_url` empty, and storage has no newly uploaded creator files, so uploads have not completed successfully yet.
- The storage path strategy is inconsistent with the ownership policies. Current code uploads to paths like `filmId/video.mp4`, while the safer policy pattern expects a user-owned folder structure.

Implementation plan

1. Make submit go directly to the uploader
- Update `src/pages/Submit.tsx` so successful submit immediately navigates to the dashboard with context, not just a generic success state.
- Use query params like:
  - `/dashboard?tab=films&edit={id}&focus=video`
  - `/dashboard?tab=shorts&edit={id}&focus=video`
  - `/dashboard?tab=verticals&edit={id}&focus=video`
- Change copy so it clearly says “Create details first, then upload your file.”

2. Let the dashboard open the correct tab and item automatically
- Update `src/pages/Dashboard.tsx` to read `tab`, `edit`, and `focus` from the URL.
- Initialize `activeTab` from the route instead of always defaulting to `overview`.
- Pass `editingId`/`focusField` into the content tab components so the just-created project opens ready for upload.

3. Add a real pencil editor to every creator item
- Add a visible pencil button on every card/row in:
  - `src/components/dashboard/DashboardFilms.tsx`
  - `src/components/dashboard/DashboardShorts.tsx`
  - `src/components/dashboard/DashboardVerticals.tsx`
- Open a shared edit dialog/drawer for each item where the creator can:
  - change title
  - edit synopsis/description
  - update genre
  - edit duration/year where applicable
  - upload/replace poster or thumbnail
  - upload/replace video
- This makes each title clearly editable instead of forcing the user to hunt for actions.

4. Fix upload reliability
- Normalize file paths to be user-owned, e.g.:
  - `videos/{userId}/{contentId}/video.mp4`
  - `posters/{userId}/{filmId}/poster.jpg`
  - `thumbnails/{userId}/{shortOrVerticalId}/thumb.jpg`
  - `avatars/{userId}/avatar.jpg`
- Update upload code in dashboard/profile components to use that structure.
- Add client-side validation and clearer messages for:
  - missing file
  - unsupported type
  - oversized file
  - upload permission failure
- Keep refresh behavior after successful upload so the UI updates immediately.

5. Clean up storage access rules
- Add a migration to align storage policies with the new path structure.
- Replace the current bucket-wide permissive rules with ownership-aware policies based on the first folder being the authenticated user id.
- Apply this consistently for `videos`, `posters`, `thumbnails`, and `avatars`.
- This should remove the current ambiguity and make uploads predictable.

6. Make profile editing dependable and obvious
- Improve `src/components/dashboard/DashboardSettings.tsx` so the form syncs when profile data loads or changes.
- Keep avatar upload, bio, location, website, and genre focus, but make the upload/save flow clearer.
- Add a more obvious edit entry point in both:
  - `src/components/dashboard/DashboardSidebar.tsx`
  - `src/components/dashboard/DashboardMobileHeader.tsx`
- If needed, add a dedicated “Edit Profile” button in the overview area too.

7. Actually show uploaded videos on the platform
- `src/pages/FilmDetail.tsx`
  - replace the dead “Watch Now” button with an actual player or watch modal using `film.video_url`
- `src/pages/Shorts.tsx`
  - fetch `video_url`
  - render a real `<video>` when present
  - fall back to thumbnail only if no video exists
- `src/pages/Verticals.tsx`
  - replace the current image-only display with autoplaying video when `video_url` exists
- Result: once a creator uploads a file, it is visible in the actual product, not just saved in the database.

8. Tighten project linking and creator showcase
- Normalize dashboard/public links so film cards open reliably using the same route key everywhere.
- Keep `CreatorProfile.tsx` as the public creator page, but ensure uploaded avatar/posters/thumbnails surface properly once assets are attached.

Files likely touched
- `src/pages/Submit.tsx`
- `src/pages/Dashboard.tsx`
- `src/components/dashboard/DashboardFilms.tsx`
- `src/components/dashboard/DashboardShorts.tsx`
- `src/components/dashboard/DashboardVerticals.tsx`
- `src/components/dashboard/DashboardSettings.tsx`
- `src/components/dashboard/DashboardSidebar.tsx`
- `src/components/dashboard/DashboardMobileHeader.tsx`
- `src/pages/FilmDetail.tsx`
- `src/pages/Shorts.tsx`
- `src/pages/Verticals.tsx`
- one new reusable dashboard editor component
- one storage-policy migration

Expected outcome
- After submit, the creator lands directly on the correct title editor/uploader.
- Every title has a pencil edit action.
- Profile photo and creator bio become editable in a dependable way.
- Video/poster/thumbnail uploads work consistently.
- Uploaded media is actually playable on the site.
