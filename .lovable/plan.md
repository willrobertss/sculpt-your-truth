

## Fix: Hover Card Gets Clipped by Scroll Container

The problem is that `ContentRow`'s scroll container uses `overflow-x-auto`, which also clips content vertically. When a card scales up 1.3x and expands its detail panel, it overflows the container bounds and gets cut off.

### Changes

**`src/components/ContentRow.tsx`**
- Add `overflow-y-visible` to the scroll container so vertical overflow (the expanded hover card) is not clipped
- Add extra bottom padding to give room for the expanded cards

**`src/components/VideoHoverCard.tsx`**
- Change `transformOrigin` from `center bottom` to `center center` so the card expands more evenly (won't push as far down)
- Ensure the outer wrapper has enough z-index when hovered to float above sibling rows

### Specific CSS fix

The key fix is on the scroll container in `ContentRow.tsx` line 47:
```
// Before
className="flex gap-2 overflow-x-auto hide-scrollbar px-6 pb-4"

// After  
className="flex gap-2 overflow-x-auto overflow-y-visible hide-scrollbar px-6 pb-12"
```

And on the `ContentRow` section wrapper (line 20), remove `overflow: hidden` behavior by ensuring the section itself allows overflow:
```
// Before
className="py-4 group/row"

// After
className="py-4 group/row relative z-0"
```

On `VideoHoverCard.tsx`, the hovered card needs a higher z-index and the outer div needs `overflow-visible`:
- Line 41: Add `z-0` when not hovered, `z-50` when hovered to the outer wrapper
- Line 48-49: The inner card already has `z-30` on hover, but the parent constrains it

This is a CSS-only fix across two files.

