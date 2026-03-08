

## Testimonials Section with Database Backend

### What we're building
1. A **testimonials section** on the homepage, placed between the hero email/CTA area and the gold marquee bar
2. Four dark cards (matching the reference screenshot style) with avatar, star rating, quote, name, and role
3. A **`testimonials` database table** so admins can add/remove testimonials from the backend
4. Seed it with 4 fake testimonials with AI-generated avatar images and short quotes about OPPRIME.tv
5. Use the existing `has_role` / `user_roles` admin system for RLS on the table

### Database

Create a `testimonials` table:
- `id` (uuid, PK)
- `name` (text, not null) -- e.g. "Marcus Johnson"
- `role` (text, not null) -- e.g. "Actor / Filmmaker"
- `quote` (text, not null) -- the testimonial text
- `avatar_url` (text, nullable) -- URL to avatar image
- `rating` (integer, default 5) -- star rating 1-5
- `is_active` (boolean, default true) -- toggle visibility
- `display_order` (integer, default 0) -- for ordering
- `created_at` (timestamptz, default now())

RLS policies:
- **SELECT**: public (anyone can read active testimonials)
- **INSERT/UPDATE/DELETE**: admin only via `has_role(auth.uid(), 'admin')`

Seed 4 testimonials:
1. "I was an actor for 15 years. OPPRIME.tv gave me the tools to become a filmmaker. I'm finally in the game." -- **Marcus Johnson** / Actor & Filmmaker
2. "Finding distribution as an indie filmmaker is brutal. OPPRIME.tv changed everything for me overnight." -- **Sofia Reyes** / Independent Filmmaker  
3. "I shot my short film on my iPhone, uploaded it, and it was in distribution within days. Unreal." -- **Tyler Washington** / Creator & Director
4. "The simplest platform I've used. Upload, submit, done. My work is finally being seen by a global audience." -- **Priya Sharma** / Documentary Filmmaker

Avatar images will use diverse placeholder portrait URLs from Unsplash.

### Frontend Components

**`TestimonialCard` component** (`src/components/TestimonialCard.tsx`):
- Dark card with gold border (matching site theme), avatar circle on the left, 5 gold stars, italic quote text, name + role below
- Style matches the reference screenshot: dark bg, rounded, compact

**`TestimonialsSection`** in `Index.tsx`:
- Placed right after the hero section, before the gold marquee
- Fetches from `testimonials` table where `is_active = true`, ordered by `display_order`
- Falls back to hardcoded data if fetch fails
- Horizontal row of 4 cards on desktop, scrollable on mobile

### Layout adjustment
- Move the gold marquee bar down so it sits below the new testimonials section
- Keep spacing tight between hero CTA and testimonials

### Files to create/modify
- **New**: `src/components/TestimonialCard.tsx`
- **Modify**: `src/pages/Index.tsx` -- add testimonials section between hero and marquee
- **Migration**: create `testimonials` table + seed data + RLS policies

