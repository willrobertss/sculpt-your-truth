

# OPPRIME.tv — Cinematic Indie Streaming Platform

## Overview
A film-noir luxury streaming platform for independent films, shorts, and vertical content with a creator submission pipeline. Deep black backgrounds, celluloid gold (#d4af37) accents, editorial typography (Playfair Display + Lora + Courier New), film grain texture overlays.

---

## Phase 1: Foundation & Design System
- Set up Lovable Cloud with Supabase backend
- Import Google Fonts (Playfair Display, Lora)
- Define the film-noir color palette, film grain CSS overlay, scanline textures, custom scrollbar styling
- Create reusable components: FilmCard (2:3 poster), ShortCard (9:16), CreatorCard, GoldButton CTA

## Phase 2: Database & Auth
- **Tables**: `films`, `creators`, `submissions`, `shorts`, `profiles`
- **Auth**: Email/password login for creators via Supabase Auth
- **Storage buckets**: video uploads, poster/thumbnail images
- **RLS policies**: Creators can manage their own content; public can read active films/shorts

## Phase 3: Homepage (`/`)
- **Fixed Navbar**: Logo (OPPRIME in white, .tv in gold), Browse | Shorts | Submit | Sign In — transparent → frosted glass on scroll
- **Cinematic Hero**: Full-viewport with blurred poster grid background, vignette, film grain, editorial headline + email CTA, gold marquee ticker
- **Netflix-style Content Rows**: Horizontal-scroll carousels (New Releases, Short Films, Drama, Documentary) with hover animations
- **Vertical Shorts Preview**: 9:16 thumbnail row with "View All Shorts" link
- **Creator Onboarding Steps**: 5-step visual sequence (Create Account → Upload → Review → Go Live → Grow)
- **Value Props**: 4-column grid
- **Creator Spotlight Row**: Horizontal scroll of featured creator cards
- **FAQ Accordion**: Collapsible Q&A section
- **Bottom CTA + Footer**

## Phase 4: Content Pages
- **`/browse`**: Full content library with genre filters, sort options, grid/list view
- **`/film/:id`**: Film detail page — hero still, metadata, video player, related films row
- **`/shorts`**: Full-screen TikTok-style vertical video rail — swipe/scroll navigation, autoplay muted, tap to unmute

## Phase 5: Creator Flow
- **`/login`**: Auth page with email/password
- **`/submit`**: 5-step form wizard with gold progress bar — Account → Upload (drag-and-drop to Supabase Storage) → Metadata → Rights Agreement → Confirm & Submit (with confetti)
- **`/dashboard`**: Authenticated dark sidebar layout — My Films, My Shorts, Profile editor, Submission Status, stats cards (views, active titles, pending)
- **`/creators/:slug`**: Public creator profile page — headshot, bio, genre focus, social links, their films/shorts grid

## Phase 6: Polish & Responsiveness
- Mobile responsive: single-column grids, touch-scrollable carousels, hamburger menu
- Lazy-loaded images with dark shimmer placeholders
- Staggered card reveal animations on load
- All hover/transition animations with cubic-bezier easing

---

## Notes
- HowToSelfTape.com integration points will be added as code comments for future API connections
- Revenue share and monetization features are placeholder/future scope
- Mock/seed data will be inserted for demo purposes until real content is uploaded

