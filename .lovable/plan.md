

## Problem

The videos query filters by `.eq('approved', true)` but returns zero results. The external OPPRIME database likely either:
- Has no `approved` column (PostgREST ignores unknown columns in filters, returning empty)
- Has all videos with `approved` set to `false` or `null`

The genres (9 rows) and series (16 rows) load fine, confirming the connection works.

## Fix

Remove the `.eq('approved', true)` filter from the videos query in `src/pages/Index.tsx` so all videos are fetched. If the external database does have an approval workflow, we can re-add the filter later once videos are flagged.

### Change in `src/pages/Index.tsx` (line 58)

```typescript
// Before
opprimeClient.from('videos').select('*').eq('approved', true),

// After
opprimeClient.from('videos').select('*'),
```

Also remove the `approved` field from the `OPVideo` interface since it may not exist in the external schema.

This is a one-line fix. No other files need changes.

