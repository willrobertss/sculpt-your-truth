
## Integrate Film Set Image into Hero Section

### Context
The hero section currently uses a faded grid of film posters as background with a gradient overlay on top. User wants to replace this with the uploaded film set image, faded behind the hero text, with text remaining the primary visual element.

### Approach
1. **Copy Image Asset**: Move `user-uploads://unnamed.jpg` → `src/assets/hero-filmset.jpg` for bundling and React import
2. **Hero Section Changes**:
   - Remove the poster grid background div
   - Replace with the film set image as a background image with `background-size: cover` and `background-position: center`
   - Strengthen the gradient overlay (currently `from-background via-background/80 to-background`) to `from-background via-background/85 to-background` and adjust opacity if needed to ensure text legibility
   - Apply filter blur or opacity to the background image itself (e.g., `opacity-40` on the image layer) so it reads as faded/atmospheric
3. **Text Update**: Change h1 text from "Where Bold Stories Find Their Stage" to "Where Bold Story Tellers Find Their Stage"
4. **Implementation**: Use CSS classes to layer the image with reduced opacity behind the gradient overlay, keeping text (z-10) fully visible and readable

### Result
Hero maintains cinematic feel with filmmaker imagery faded in background, but text is clearly the focal point with strong contrast.
