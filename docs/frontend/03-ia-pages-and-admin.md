# Information Architecture, Pages & Admin Patterns

## Primary navigation (max 4)

1. Dashboard
2. Deals
3. Documents
4. Admin (role-gated)

## MVP pages (core)

### /dashboard

Primary goal: show next best action and current work at a glance  
Primary action: one CTA in hero (e.g., "Review & Send")

Sections:

1. Hero: AI focus card + ambient canvas (decorative)
2. Active deals (3 cards max above fold)
3. Recent activity (read-only, max 5)

### /deals

Primary goal: find and open a deal quickly  
Primary action: "Open deal" is implicit (click a deal card). Avoid extra CTAs.

Sections:

1. Header + search
2. Deal list (cards or lightweight list)
3. Empty state ("No deals yet")

### /deals/[id] (Deal Workspace)

Primary goal: complete the deal workflow with minimal effort  
Primary action: depends on current step (ONE action visible)

Layout:

- Left (sticky): context (address, buyer, seller, MLS)
- Center: steps/timeline (locked/unlocked)
- Right (sticky): AI panel (suggestions + unblock actions)

### /documents/[id]

Primary goal: preview document and decide next step  
Primary action: "Review & Send" or "Request signature" (ONE primary)

Layout:

- Left: decision panel (actions + metadata)
- Right: PDF preview

## Admin (same calm rhythm)

Admin pages must NOT feel like a dense console.

### Admin patterns (preferred)

1. **List → Details Drawer**
   - List page stays simple
   - Create/edit happens in a drawer
2. **Single primary admin action**
   - Example: Templates page primary action is "Upload template"
   - Additional actions live in overflow per item

### Admin tables (if needed)

- Keep columns minimal
- Actions in overflow menu
- Avoid bulk actions unless truly necessary

## Admin MVP pages

### /admin/templates

Primary goal: manage templates and jurisdictions  
Primary action: "Upload template"

Sections:

1. Header + Upload CTA
2. Templates list (card list or small table)
3. Drawer: upload + assign doc type + jurisdiction + status

### /admin/integrations

Primary goal: see whether Resend / DocuSign / Storage are connected  
Primary action: "Connect" (only one primary on screen; other connects are secondary links per card)

Sections:

1. Integration status cards
2. Drawer per integration to configure keys/settings

### /admin/users

Primary goal: manage platform users  
Primary action: "Invite user"

Sections:

1. Users list
2. Drawer: invite/edit roles
3. Inline actions: activate/deactivate (confirm only if destructive)
