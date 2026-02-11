# Motion & UI States (Minimal System)

## Motion philosophy

Motion explains state, not decoration.

### Forbidden

- Bounce/spring exaggeration
- Scale-on-hover
- Spinners for AI thinking (use calm text instead)

## Tokens (use everywhere)

- Durations: 120ms (fast), 200ms (normal), 320ms (slow)
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- TranslateY max: 8px
- Stagger: 40ms
- Opacity changes: prefer subtle (avoid dramatic fades)

## Standard interactions (Framer Motion)

### Page load

- Primary section appears first (hero / main panel)
- Secondary sections follow
- Animation: opacity 0→1, y 8→0, stagger 40ms

### Hover

- Elevation/shadow increase only
- Optional subtle border emphasis
- NO scale

### AI suggestion swap

- Old suggestion fades out
- New suggestion fades in with slight slide: y +4 → 0
- Optional word-by-word reveal (simple and subtle; no typewriter effect)

### Step completion (workflows)

- Checkmark fades in
- Next step unlocks by increasing opacity
- Small delay (80ms) between completion and unlock

## Canonical UI states (must exist per page)

### 1) Loading

- Use skeleton blocks, not spinners (except small icon button spinners for non-AI actions)
- Add calm helper text when loading is meaningful ("Loading deal details…")

### 2) Empty

- One sentence explaining what's missing
- ONE primary CTA
- No secondary lists or suggested widgets

### 3) No results (search/filter)

- "No results found"
- Suggest clearing filters
- Optional small "Reset filters" action

### 4) Error

- Inline error panel (calm)
- Message must be specific and actionable
- Retry button optional

### 5) No access

- For role-gated routes
- Calm explanation + link back

## AI-specific states (must be supported)

### Thinking

- Text: "SuperAgent is reviewing…" + animated ellipsis (…)
- NO spinner

### Blocked / Missing info

- Explain what's missing in one sentence
- Offer 1–2 clear options (ask, enter manually), but keep one dominant action.

### Success

- Confirm completion without celebration
- Example: "Sent for signature." + show what happens next.
