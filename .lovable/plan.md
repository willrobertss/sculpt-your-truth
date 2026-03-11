

## Editable Creator Profile in Dashboard

### What exists now
- `DashboardSettings` is read-only — just displays name, email, and slug with no editing capability.
- The `profiles` table already has all the right columns: `display_name`, `bio`, `avatar_url`, `location`, `website`, `social_links`, `genre_focus`, `slug`.
- The `avatars` storage bucket already exists and is public.
- `CreatorProfile` page already renders avatar, bio, genre focus, social links — but only pulls from what's in the DB (currently empty for most users).
- RLS allows users to update their own profile.

### Plan

**1. Rewrite `DashboardSettings.tsx` into a full editable profile form**

Replace the static display with an editable form containing:
- **Avatar upload**: Circular photo with a pencil/camera overlay. Clicking uploads to `avatars` bucket, saves URL to `avatar_url`.
- **Display Name**: Text input, saves to `display_name`.
- **Bio**: Textarea (e.g. "Award-winning documentary filmmaker..."), saves to `bio`.
- **Location**: Text input (e.g. "Los Angeles, CA"), saves to `location`.
- **Website**: Text input, saves to `website`.
- **Genre Focus**: Multi-select or comma-separated tags input, saves to `genre_focus` array.
- **Slug**: Shown read-only (auto-generated).
- **Email**: Shown read-only.
- **Save button**: Updates the `profiles` row via `supabase.from('profiles').update(...)`.

All fields pre-populated from current `profile` data. Toast on save success.

**2. Add pencil icon to sidebar profile area**

In `DashboardSidebar.tsx`, add a small profile section at the top (below logo) showing the user's avatar + name with a pencil icon that sets `activeTab` to `'settings'`.

**3. Add RLS policy for avatars bucket**

Add a migration with INSERT/UPDATE/SELECT policies on `storage.objects` for `bucket_id = 'avatars'` (same pattern as posters/thumbnails/videos).

**4. Update `CreatorProfile.tsx` to also show shorts and verticals**

Currently only shows films. Add shorts and verticals queries so the public profile is a complete showcase.

### Files to change

| File | Change |
|---|---|
| `src/components/dashboard/DashboardSettings.tsx` | Full rewrite: editable form with avatar upload, bio, location, website, genre focus, save button |
| `src/components/dashboard/DashboardSidebar.tsx` | Add avatar + name + pencil icon section below logo |
| `src/pages/CreatorProfile.tsx` | Also query and display shorts + verticals |
| DB migration | RLS policies for `avatars` bucket (INSERT, SELECT, UPDATE for authenticated) |

