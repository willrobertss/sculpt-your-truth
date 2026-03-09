

## Importing Movies into Your Database

You have a few options depending on where your movie data currently lives:

### Option 1: CSV Upload via the Backend UI (Easiest)
If you have your movies in a spreadsheet (Excel, Google Sheets, CSV):
1. Format your data with columns matching the `films` table: `title`, `synopsis`, `tagline`, `genre` (comma-separated), `release_year`, `duration_minutes`, `poster_url`, `video_url`, `status` (set to "live" to make visible)
2. I can build a **bulk import page** in the Admin panel that lets you upload a CSV file, preview the rows, and insert them all at once

### Option 2: Admin "Add Film" Form (Small Catalog)
If you have fewer than ~50 films, I can enhance the existing Admin panel with a quick-add form where you manually enter each film's details one by one.

### Option 3: Edge Function for External API (If films are on another platform)
If your movies are hosted on another service (like Vimeo, YouTube, or another database/API), I can build an edge function that pulls from that source and writes to your database automatically.

---

### What I'd Recommend

**Option 1 (CSV bulk import)** is the most practical for most catalogs. Here's what I'd build:

1. **Admin Bulk Import page** - a new tab in your Admin dashboard
2. **CSV parser** - client-side parsing with column mapping (match CSV headers to database fields)
3. **Preview & validate** - show a table preview before inserting, flag any missing required fields
4. **Batch insert** - insert all rows into the `films` table with `creator_id` set to the admin's user ID
5. **Status control** - option to import as "draft" or "live"

Your CSV would look something like:
```text
title,synopsis,tagline,genre,release_year,duration_minutes,poster_url,video_url
My Film,"A story about...","The tagline","Drama,Thriller",2024,120,https://...,https://...
```

### Technical Details
- Use a lightweight CSV parser (Papa Parse or built-in) on the frontend
- Batch inserts via the existing Supabase client (chunks of 50 rows to avoid timeouts)
- Admin RLS policies already allow admins to insert/update films, so no database changes needed
- The `creator_id` field is required -- imports would default to the admin's ID or allow specifying a creator

No new database tables or migrations required. Just a new UI component in the Admin panel.

