

## Fix: Pre-Roll Ads Not Showing + Add Save Button

### Root Cause
The ad placement stored `video_id: "13"` but the Watch page matches against the OPPRIME video UUID (e.g. `a1b2c3d4-...`). The `eq('video_id', id)` query never finds a match, so no ads play.

This happened because the Assign dialog stores `String(v.id)` from the OPPRIME videos list — which should be UUIDs — but the stored value `"13"` suggests either a manual entry or a data mismatch. The fix needs to ensure the video_id stored in `ad_placements` always matches the UUID format used in the `/watch/:id` URL.

### Changes

**1. `src/components/admin/AdsManager.tsx`**
- Rename the "Assign Ad" button to **"Save Placement"** for clarity
- Add a video search/filter input in the assign dialog so admins can easily find videos
- Show the video UUID alongside the title in the dropdown so admins can verify the correct video is selected
- Add a confirmation preview before saving (shows ad name, video name, placement type)

**2. `src/pages/Watch.tsx`**
- Add `console.log` debug output temporarily, or better: add error handling that logs when no ad placements are found for a video
- No structural changes needed — the query logic is correct, the data was just mismatched

**3. `src/components/watch/AdPlayer.tsx`**
- No changes needed — the component works correctly when it receives ad data

### Summary
The core fix is ensuring the `video_id` in `ad_placements` matches the UUID from the OPPRIME videos table. The UI will be updated with a clear "Save" button and better video selection to prevent future mismatches.

