# Cursor Main Prompt (Pinned Template)

Use this template for generating any page. Replace the placeholders.

---

**ROLE**  
You are a senior product designer + frontend engineer implementing a calm, premium SaaS UI.

**GLOBAL DESIGN CONSTITUTION**  
Apply "SuperAgent — Calm Intelligence UI":

- AI-first hierarchy
- one dominant action per screen
- low density + generous whitespace
- calm motion (no bounce, no scale-on-hover)
- no spinners for AI thinking
- avoid kanban and dense tables by default
- admin pages follow the same calm rhythm

**TECH STACK**

- Next.js App Router + TypeScript
- TailwindCSS
- shadcn/ui
- framer-motion
- lucide-react
- Production-quality code; minimal and reusable

**PAGE / FEATURE TO BUILD**
Route: [e.g. /admin/templates]
Primary user goal: [one sentence]
Primary action (ONLY ONE): [e.g. Upload template]

**LAYOUT & IA (MUST FOLLOW)**

- Top bar fixed 64px (translucent + blur + subtle border)
- Content container max-w 1200px centered
- Major section spacing 64px; card gap 24px; card padding 24–32px
- Max 3 columns on desktop
  Sections (in order):

1. [Section name + purpose]
2. [Section name + purpose]
3. [Section name + purpose]
   Do NOT include:

- multiple competing CTAs
- extra widgets/analytics
- dense tables unless explicitly needed

**COMPONENTS (REUSE)**

- PageShell, TopBar, SectionHeader, Card, StatusPill, EmptyState
  Page components:
- [Component A], [Component B], [Component C]

**MOTION & STATES (IMPLEMENT)**
Motion tokens:

- durations 120/200/320ms
- easing cubic-bezier(0.4, 0, 0.2, 1)
- translateY max 8px
  Required behaviors:
- Page load stagger: primary section → secondary sections (stagger 40ms)
- Hover: shadow/elevation only (NO scale)
- Empty state: calm + one CTA
- Loading state: skeleton blocks + calm text
- Error state: calm inline message + optional retry
- AI thinking state: text + animated ellipsis (NO spinner)

**DATA (LOCAL MOCK ONLY)**

- Use types from `lib/api/generated/fetch-client` (see `docs/frontend/04-view-models-contracts.md`)
- Use local mock arrays. No external API calls.

**ACCESSIBILITY**

- Icon buttons have aria-label
- Clickable cards are Link/button with visible focus
- Respect prefers-reduced-motion where possible

**OUTPUT REQUIREMENTS**

- Provide full code for: `app/[route]/page.tsx`
- You may define small components in the same file or under `components/superagent/*`
- Keep the UI minimal, calm, consistent with the system
