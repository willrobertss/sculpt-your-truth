

## Diagnosis: Broken Video Playback

**Root cause:** The video record in the external catalog (id=9) has a `url` field value, so the code constructs an S3 URL (`https://opprimetv.s3-accelerate.amazonaws.com/{path}`), but the actual file at that URL is not accessible (likely a 403 forbidden or 404 not found from S3). The HTML5 `<video>` element renders but shows the browser's native "broken media" icon.

**This is NOT a code bug** — the code correctly fetches the record, finds a non-empty `url` value, builds the S3 path, and passes it to the `<video>` tag. The problem is the media file itself isn't reachable on S3 (permissions, missing file, or changed path).

### What we should fix (code-side)

**Graceful error handling on the `<video>` element.** Right now there's no `onError` handler, so the player just shows a broken icon. We should:

1. **Add an `onError` handler** to the `<video>` tag in `Watch.tsx` that:
   - Clears `videoUrl` so it falls back to the "Video unavailable" placeholder
   - Optionally shows a toast: "This video is currently unavailable"

2. **Show the thumbnail as a poster fallback** — already done (`poster={getThumbnailUrl(video.thumbnail)}`), but once the video errors, it stays in the broken state instead of reverting to the poster or placeholder.

### Single file change: `src/pages/Watch.tsx`

- Add a `handleVideoError` callback that sets `videoUrl` to `''`
- Attach it as `onError` on the `<video>` element (line ~161)

This is a ~5-line change. The underlying S3 access issue is an infrastructure concern on the external catalog side — you may want to verify that the video files are uploaded and the bucket policy allows public reads.

