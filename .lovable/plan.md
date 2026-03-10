

## OPPRIME Admin Panel Rebuild — Plan

This is a significant rebuild of the admin panel with new database tables, branding, layout, and features. Here's the approach:

---

### 1. Database Migration

Create new tables (keeping existing ones intact):

```text
videos       — id, title, synopsis, thumbnail, approved (bool), thumb_approved (bool),
               reviewed (bool), belowAge (bool), serie_id (FK→series), created_at
credits      — id, video_id (FK→videos), serie_id (FK→series), name, role
series       — id, title
genres       — id, name, priority (int)
sub_genres   — id, genre_id (FK→genres), name, priority (int)
```

RLS: Admin-only for all mutations (using existing `has_role` function). Public SELECT on videos where `approved = true`. Admin SELECT on all.

No financial report views yet (placeholder queries against `videos`/`referrals` tables until real payment data exists).

---

### 2. Branding Updates

- Add Oswald + Raleway Google Fonts import to `index.css`
- Update `tailwind.config.ts`: add `font-heading: ['Oswald']` and `font-body: ['Raleway']`
- Update CSS variables: primary color to `#B82025` (red) — `--primary: 356 80% 42%`
- These changes affect the **admin panel only** via scoped classes (existing app pages keep current gold/noir theme)

---

### 3. Admin Layout Rebuild

Replace the current sidebar layout in `Admin.tsx` with:
- **Top navigation bar** with links: Dashboard | Profile | Auth | Financials | Management | Settings
- Route-based tabs (still using internal state, not separate routes, to keep it contained)
- OPPRIME.tv branding in top-left

---

### 4. Dashboard Page (Two Sections)

**Section A — Videos Pending Approval**
- Query: `videos` where `approved = false AND reviewed = false`, limit 10, paginated
- Join `credits` for director name; join `series` if `serie_id` present
- Table: Thumbnail, Title, Director, Status badges, Actions
- "View" button opens a `Dialog` with:
  - Left: thumbnail with overlay approve/reject buttons
  - Right: approval status, title, director, synopsis
  - Bottom: conditional action buttons (Approve Film+Thumb, Approve Film, Reject Film)
- Reject actions open confirmation dialogs with required reason textarea

**Section B — The Pool**
- Date range filter + text search
- Same table layout, filtered query, paginated

**Shared component: `<PaginatedTable>`** — reusable with prev/next, loading skeleton, empty state

---

### 5. Financials Page

Three report sections (collapsible via Accordion):
1. Pool Report — query videos by date range
2. Referral Reward Report — query `referrals` table by date range
3. Income Payment Report — placeholder data

Each section has:
- `<DateRangeFilter>` component (From/To date inputs + Apply)
- Paginated table (10/page)
- Excel export button (using SheetJS/`xlsx` package for client-side .xlsx generation)

---

### 6. Settings — Genres Page

- Fetch all from `genres` table, ordered by `priority`
- Display as list with sub-genre count (from `sub_genres` join)
- **Drag-and-drop reordering** using `@dnd-kit/core` + `@dnd-kit/sortable`
- On drag end: batch update `priority` for affected rows
- "Add Genre" button opens inline form or Dialog
- Sub-menu tabs: Genres | Filmmakers | Types (Filmmakers/Types as placeholders)

---

### 7. Shared Components to Build

| Component | Purpose |
|---|---|
| `PaginatedTable` | Reusable table with pagination, skeleton, empty state |
| `DateRangeFilter` | From/To date inputs + submit |
| `AdminDialog` | shadcn Dialog with Oswald title |
| `StatusBadge` | Approved/Reproved badge with icon |

---

### 8. New Dependencies

- `xlsx` — client-side Excel export
- `@dnd-kit/core` + `@dnd-kit/sortable` — drag-and-drop for genres

---

### 9. Files to Create/Edit

**New files:**
- `src/components/admin/PaginatedTable.tsx`
- `src/components/admin/DateRangeFilter.tsx`
- `src/components/admin/StatusBadge.tsx`
- `src/components/admin/AdminDialog.tsx`
- `src/components/admin/VideoPendingSection.tsx`
- `src/components/admin/VideoPoolSection.tsx`
- `src/components/admin/VideoApprovalDialog.tsx`
- `src/components/admin/FinancialsPanel.tsx`
- `src/components/admin/GenresManager.tsx`

**Edited files:**
- `src/pages/Admin.tsx` — full rebuild with top nav + new tab structure
- `src/index.css` — add Oswald/Raleway fonts
- `tailwind.config.ts` — add font families

**Migration file:** One migration creating `videos`, `credits`, `series`, `genres`, `sub_genres` tables with RLS

---

### What This Does NOT Change

- Existing Films/Shorts/Verticals tables and pages remain intact
- Creator dashboard stays the same
- Public-facing pages unaffected
- Auth system unchanged (reuses existing `useAdminCheck` hook)

