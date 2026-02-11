# Layout & Components (Minimal System)

## Layout rules (global)

- Desktop-first reference: **1440px width**
- Content container: **max-w 1200px**, centered
- Outer padding: `px-6` (mobile), `px-10` (md), `px-16` (lg)
- Top bar: fixed **64px** height, translucent with blur
- Major section spacing: **64px** (`space-y-16`)
- Card grid spacing: **24px** (`gap-6`)
- Card padding: **24–32px** (`p-6` to `p-8`)
- Max columns on desktop: **3**
- Admin pages follow the same rhythm (admin ≠ dense console)

## Shell patterns

### AppShell

Two variants only:

1. **TopBarOnly**: Dashboard, Document Preview
2. **Sidebar + TopBar**: Admin areas, Deals list (optional)

### Top Bar (always 64px)

- Left: wordmark "SuperAgent"
- Center: global search (if page supports search)
- Right: notifications + avatar
- Style: translucent white + blur + subtle bottom border

### Sidebar (Admin / optionally Deals)

- Max 4 nav items:
  - Dashboard
  - Deals
  - Documents
  - Admin (role-gated)
- Sidebar items: icon + label
- Avoid submenus until necessary; if needed, show as simple nested list under Admin.

## Component primitives (reusable)

Use shadcn/ui as base where possible.

### PageShell

Wraps top bar + container + spacing.

- Props: `title?`, `description?`, `actions?` (actions must respect one-dominant-action rule)

### SectionHeader

A single-row header for sections.

- Left: title (required)
- Right: optional small meta (count badge, status text)
- Avoid action-heavy toolbars; put actions above the page or in overflow.

### Card

Standard surface.

- Rounded: `rounded-2xl`
- Background: white
- Shadow: soft
- Hover: subtle elevation (no scale)
- Used for: AI focus, deal cards, integration status, template items

### StatusPill

Small, low-saturation badge for state.

- Draft / Waiting / Completed / Error / Disabled
- Must remain calm (no bright red unless truly blocking)

### EmptyState

Canonical empty state component.

- Icon (optional, subtle)
- Title + one sentence
- ONE primary CTA
- Example: "No templates yet" + "Upload template"

### InlineMessage

Calm inline message for info/warn/error.

- Use when possible instead of dialogs.
- Error copy must be calm and specific.

### Drawer (preferred) / Dialog (rare)

- Use a **drawer** for create/edit flows (Admin).
- Use a **dialog** only for destructive confirmations.

## Form rules (minimal)

- Labels always visible (no placeholder-only labels)
- Helper text below label when needed
- Validation messages appear inline
- If more than ~6 fields: split into steps or progressive disclosure (drawer sections)

## Tables (allowed but constrained)

Tables are allowed only when necessary (Admin list views).
Rules:

- Max ~6 columns visible on desktop
- Avoid horizontal scrolling by default
- Row actions in overflow menu (kebab)
- Prefer "list cards" where possible
