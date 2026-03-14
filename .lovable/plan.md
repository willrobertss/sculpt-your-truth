

## Plan: Share Dialog + Video Diagnostics

### 1. Video Playback Issue

The video for "The Psychologist" (ID 9) has a URL path `video-library/1505262991825gz13pv501.mp4` which resolves to `https://opprimetv.s3-accelerate.amazonaws.com/video-library/1505262991825gz13pv501.mp4`. The browser is loading the poster/thumbnail fine (200 OK) but the .mp4 file itself is not loading -- this is an access issue on the S3 bucket side.

**What we can do code-side:**
- Add a `HEAD` request probe before rendering the `<video>` element to verify the .mp4 is reachable. If it fails, show "Video coming soon" with the poster image as a backdrop instead of a blank placeholder.
- Show the thumbnail as a styled poster card (not just a gray box) when the video isn't available, so the page still looks polished.

**What this cannot fix:** If the actual file is missing or restricted on S3, no code change will make it play. You'll need to verify on the S3/storage side that the file exists and the bucket policy allows public reads.

### 2. New Share Dialog (replaces clipboard-only share)

Create a new `ShareDialog` component with:

**Quick Message Templates** (user picks one, can edit):
- "You NEED to watch this 🎬🔥"
- "This just blew my mind, check it out!"  
- "Found your next favorite film 🍿"
- "Okay this is actually incredible..."

**Share Channels** (all in one dialog):
- **Copy Link** -- with the custom message prepended
- **Native Share** -- uses `navigator.share()` when available (mobile)
- **Social buttons**: WhatsApp, X/Twitter, Facebook -- each opens a share URL with the custom message
- **SMS** -- `sms:?body=...` link
- **Email** -- `mailto:?subject=...&body=...` link

**UI**: A Dialog that opens when clicking Share or "Share This Film". Gradient header matching the Spotlight style. Message textarea with template chips above it. Grid of share channel buttons below.

### Files to change

| File | Change |
|------|--------|
| `src/components/ShareDialog.tsx` | **New** -- Dialog with message templates + share channels |
| `src/components/SocialSpotlight.tsx` | Replace `handleShare` clipboard logic with opening the ShareDialog; pass video title + share URL |
| `src/pages/Watch.tsx` | Improve the "Video unavailable" fallback to show the thumbnail as a styled card with "Coming soon" overlay instead of a gray box |

