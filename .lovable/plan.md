

## Plan: Instagram-Style Social Spotlight Sidebar

Transform the plain social sidebar on the Watch page into a vibrant, Instagram-inspired engagement panel with colorful gradients, animated interactions, and a recommendation banner.

### Changes (single file: `src/pages/Watch.tsx`)

**1. Gradient Header Banner**
- Replace the plain like/share bar with a colorful gradient banner (Instagram-style pink-purple-orange gradient)
- Add a bold call-to-action: "Spread the Word" or "Recommend This Film"
- Include a prominent share button styled as a pill with gradient background

**2. Like Button — Instagram Heart Style**
- Large animated heart icon centered above the comments
- Tap triggers a brief scale-up animation (CSS `animate-ping` or keyframe pulse)
- Show like count in bold beneath the heart
- Use a pink/red gradient fill when liked instead of flat red

**3. Comment Cards — Post-Style**
- Each comment rendered as a mini card with subtle background (`bg-white/5`), rounded corners, left accent border (gradient)
- Show user initials avatar circle (colored) + timestamp
- Slightly more padding and spacing for a feed-like feel

**4. Share Section — "Let Your Friends Know" Banner**
- A visually distinct banner below the like button area
- Gradient background (softer, complementary tones)
- Text: "Enjoying this? Let your friends know!" with a share icon
- Clicking copies the trailer/video link (existing logic)

**5. Comment Input — Styled**
- Rounded input with subtle gradient border on focus
- Send button with gradient background instead of ghost variant

### Visual Structure (top to bottom in sidebar)

```text
┌─────────────────────────┐
│  ✦ SPOTLIGHT ✦          │  ← gradient header
│  [♥ 12]  [💬 5]  [↗]   │  ← action row with colored icons
├─────────────────────────┤
│ 🎬 Enjoying this?       │  ← recommendation banner
│ Let your friends know!  │
│ [ Share This Film  ↗ ]  │  ← gradient pill button
├─────────────────────────┤
│ Comments                │
│ ┌─ user comment card ─┐ │
│ │ AB  "Great film..."  │ │  ← avatar initials + text
│ │     Mar 14, 2026     │ │
│ └──────────────────────┘ │
│ ┌─ user comment card ─┐ │
│ └──────────────────────┘ │
├─────────────────────────┤
│ [ Add a comment...  ➤ ] │  ← styled input
└─────────────────────────┘
```

### No new dependencies needed
All styling done with Tailwind utility classes. Gradient colors will use Instagram-inspired tones (`from-pink-500 via-purple-500 to-orange-400`) that complement the existing gold/noir theme without clashing.

