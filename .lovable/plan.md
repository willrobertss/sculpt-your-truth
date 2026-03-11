

## Fix Build Errors & Transfer Content Strategy

### Problem
The build is failing because the `xlsx` package is imported in `FinancialsPanel.tsx` but **not installed** (missing from `package.json`). This is the root cause of all the build errors.

### Fix Plan

**Step 1: Add `xlsx` dependency to `package.json`**
- Add `"xlsx": "^0.18.5"` to the dependencies

That single fix should resolve the build errors.

---

### Transferring Movies from the Original Site

To get your existing movies from the original OPPRIME.tv site into this new database, here's what you need:

**What you have now:**
- A `videos` table (for the admin approval workflow)
- A `films` table (for the public-facing catalog)
- A **Bulk Import** tool already built in the Admin panel (Management tab)

**Steps to transfer your catalog:**

1. **Export your movies from the original site** as a CSV file. You need columns like: `title`, `synopsis`, `genre`, `release_year`, `duration_minutes`, `poster_url`, `video_url`

2. **For video files/posters hosted on your S3 bucket** (`opprimetv.s3-accelerate.amazonaws.com`): Just keep the URLs as-is in the CSV. Set the `VITE_FILE_STORAGE_PATH` environment variable to your S3 base URL so thumbnails display correctly.

3. **Log into the Admin panel → Management tab → Bulk Import** and upload your CSV. Map columns, set status to "live", and import.

4. **For the `videos` table** (admin approval pipeline): If you also want to populate that table, I can extend the Bulk Import tool to support importing into `videos` + `credits` tables as well.

**What you'll need to provide:**
- Access to export data from your original site (CSV, database dump, or API)
- Your S3 bucket URL (for the `VITE_FILE_STORAGE_PATH` env variable)

