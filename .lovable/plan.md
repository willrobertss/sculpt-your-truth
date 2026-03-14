

## Plan: Update Video Player Logic

### Changes to `src/pages/Watch.tsx`

**1. Video element updates (lines 158-188)**

Replace the current video/fallback block:

- When `videoUrl` is truthy, render `<video>` with added `crossOrigin="anonymous"` and `preload="metadata"` attributes
- `onError` handler: silently clear `videoUrl` (no toast) so it falls back to Coming Soon
- When `videoUrl` is falsy, show the existing "Coming Soon" placeholder (already styled correctly)
- Remove the `toast.error('This video is currently unavailable')` call

This is a ~3-line edit in one file — add two attributes to `<video>`, remove the toast from `onError`.

