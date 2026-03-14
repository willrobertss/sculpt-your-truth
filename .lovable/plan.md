

## Fix: Stateful Ad Player — Block Main Video Until Ad Completes

### Problem
The current architecture renders both the `AdPlayer` overlay AND the main `<video>` element simultaneously. The main video has `autoPlay={preRollDone}` but the `<video>` tag with `src` set still loads and can start playing underneath the ad overlay. The ad player is just an overlay on top — it doesn't actually prevent the main video from mounting.

### Solution
Restructure Watch.tsx to use a **state machine** approach where the main video is **not mounted at all** until pre-rolls are done. The player area renders **either** the ad video **or** the main video, never both simultaneously.

### Changes

**1. `src/pages/Watch.tsx`** — Conditional rendering instead of overlay
- Track a `playerMode` state: `'pre_roll' | 'playing' | 'mid_roll' | 'post_roll'`
- When `playerMode === 'pre_roll'`: render only AdPlayer (no main `<video>` in DOM at all)
- When `playerMode === 'playing'`: render only the main `<video>` with controls and autoPlay
- When `playerMode === 'mid_roll'`: render AdPlayer overlay on top of paused main video
- When `playerMode === 'post_roll'`: render AdPlayer overlay after main video ends
- On ad fetch: if pre-rolls exist, set `playerMode = 'pre_roll'`; otherwise `playerMode = 'playing'`
- `onAllPreRollsDone` callback sets `playerMode = 'playing'`

**2. `src/components/watch/AdPlayer.tsx`** — Minor adjustments
- Remove the `mainVideoRef` dependency for pre-roll mode (it won't exist yet)
- Accept an `onAdModeChange` callback for mid-roll resume and post-roll completion
- Keep mid-roll `timeupdate` listener logic but only attach when mainVideoRef is available
- Use real video `timeupdate` for countdown instead of `setInterval` (more accurate)

### Key Architectural Change
```
BEFORE: <div relative>
          <AdPlayer overlay z-50 />   ← ad plays on top
          <video main />              ← loads and can autoplay underneath
        </div>

AFTER:  {mode === 'pre_roll' && <AdPlayer />}        ← ONLY ad in DOM
        {mode === 'playing' && <video main />}         ← ONLY main in DOM  
        {mode === 'mid_roll' && <>                     ← both, main paused
          <video main paused />
          <AdPlayer overlay />
        </>}
```

This guarantees the main video cannot start until the ad's `onEnded` event fires and the mode transitions.

