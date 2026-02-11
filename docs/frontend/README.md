# SuperAgent Frontend Design System

This directory contains the complete design system documentation for SuperAgent.

## Reading Order

Read these files in order to understand the system:

1. **00-northstar.md** - Core concept, principles, and emotional goals
2. **01-layout-and-components.md** - Layout rules and component primitives
3. **02-motion-and-states.md** - Motion tokens and UI state patterns
4. **03-ia-pages-and-admin.md** - Information architecture and page patterns
5. **04-view-models-contracts.md** - Data contracts and types (generated API client)
6. **05-cursor-main-prompt.md** - Reusable prompt template for generating pages

## Usage with Cursor

When generating new pages with Cursor:

1. Reference the design system by pasting content from **05-cursor-main-prompt.md**
2. Use types from `lib/api/generated/fetch-client` (e.g. `DealListDto`, `IDealListDto`, `DocumentListDto`)
3. Reuse components from `components/superagent/`
4. Follow spacing, motion, and hierarchy rules from the docs

## Key Principles (Quick Reference)

- **One dominant action** per screen
- **AI-first hierarchy** - suggestions before manual controls
- **Functional white space** - 64px sections, 24px card gaps
- **Calm motion** - no bounce, no scale-on-hover, no spinners for AI
- **Vertical rhythm** over horizontal density

## Success Criteria

Every screen should make users feel:

> "I am in control, and the system already did the hard thinking."
