

## Admin Panel + Full Database Integration

This is a large build. Here is the scope broken into two major parts:

---

### Part 1: Admin Dashboard (`/admin`)

A new protected route accessible only to users with the `admin` role. It will have a sidebar layout matching the site's dark/gold aesthetic with sections for:

**1. Submissions Management**
- Table of all submissions (across all creators) with status, title, creator name, submitted date
- Ability to change status (pending → in_review → approved → rejected → live)
- Admin notes field per submission
- When approved, automatically set the film/short status to `live`

**2. Films Management**
- Table of all films (not just the admin's own) with title, creator, status, views, genre
- Edit film details inline or in a modal (title, synopsis, genre, featured toggle, status)
- Delete films
- Toggle "featured" flag

**3. Shorts Management**
- Same as films but for the shorts table

**4. Testimonials Management**
- List all testimonials with drag-to-reorder (or order buttons)
- Add/edit/delete testimonials
- Toggle is_active

**5. Users & Creators**
- List all profiles with display name, email (from profile), role, created date
- View/edit creator profiles
- Assign/remove roles

**6. Basic Analytics Overview**
- Total films, shorts, submissions count
- Pending submissions count
- Total view counts

---

### Part 2: Connect Public Pages to Real Database

Replace mock data usage across the site:

- **Browse page**: Query `films` table where `status = 'live'` instead of `mockFilms`
- **Shorts page**: Query `shorts` table where `status = 'live'` instead of `mockShorts`
- **Film Detail page**: Query single film by ID/slug from DB
- **Creator Profile page**: Query `profiles` table by slug, and their films/shorts from DB
- **Homepage content rows**: Query featured/recent films and shorts from DB
- **Creator Spotlight**: Query profiles that have published content

---

### Database Changes Required

**RLS policy additions** (to support admin reads across all tables):
- Add SELECT policy on `films` for admins: `has_role(auth.uid(), 'admin')`
- Add SELECT policy on `shorts` for admins: `has_role(auth.uid(), 'admin')`  
- Add SELECT/UPDATE policy on `submissions` for admins
- Add SELECT/UPDATE policy on `profiles` for admins
- Add INSERT/DELETE policy on `user_roles` for admins

**No new tables needed** -- the existing schema covers everything.

---

### New Files
- `src/pages/Admin.tsx` -- main admin layout with sidebar tabs
- `src/components/admin/SubmissionsTable.tsx`
- `src/components/admin/FilmsTable.tsx`
- `src/components/admin/ShortsTable.tsx`
- `src/components/admin/TestimonialsManager.tsx`
- `src/components/admin/UsersTable.tsx`
- `src/components/admin/AdminOverview.tsx`

### Modified Files
- `src/App.tsx` -- add `/admin` route
- `src/pages/Browse.tsx` -- replace mock data with DB queries
- `src/pages/Shorts.tsx` -- replace mock data with DB queries
- `src/pages/FilmDetail.tsx` -- replace mock data with DB query
- `src/pages/CreatorProfile.tsx` -- replace mock data with DB queries
- `src/pages/Index.tsx` -- replace mock content rows with DB queries
- `src/pages/Dashboard.tsx` -- fetch real stats from DB

---

### Implementation Order
1. Database migration for new RLS policies
2. Build Admin page with all management sections
3. Connect Browse, Shorts, FilmDetail, CreatorProfile, Index to real DB
4. Update Dashboard to show real stats

This is a significant build -- I recommend we tackle it in stages, starting with the admin panel and RLS policies, then connecting the public pages in a follow-up.

