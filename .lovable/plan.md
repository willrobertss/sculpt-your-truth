

## Changes

1. **Replace logo asset** — Copy `user-uploads://unnamed-1.jpg` to `src/assets/logo.png` (overwrite), so the transparent red OPPRIME.TV logo replaces the current black-background one. Both Navbar and Hero already import from `src/assets/logo.png`.

2. **Make hero logo ~25% larger** — Change `h-10 md:h-14` to `h-12 md:h-18` on the hero logo (line 63).

3. **Make headline one line** — Reduce font size so "Where Bold Storytellers Find Their Stage" fits on a single line. Change from `text-4xl md:text-6xl lg:text-7xl` to `text-2xl md:text-4xl lg:text-5xl` and use `whitespace-nowrap`. Also fix "Story Tellers" → "Storytellers" (one word). Remove the line break between "Storytellers" and "Find Their Stage" by putting it all in one flow.

4. **Navbar logo slightly larger** — Bump from `h-8` to `h-10` for consistency.

