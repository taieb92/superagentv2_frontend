# Frontend Reference

Complete inventory of the Next.js 16 frontend.

---

## Routes

### Layouts

| Layout | Type | Auth |
|--------|------|------|
| Root (`app/layout.tsx`) | Server | ClerkProvider → ErrorBoundary → QueryProvider → AuthProvider |
| `(auth)` group | — | No auth (public) |
| `dashboard/layout.tsx` | Server | Requires userId + onboarded check |
| `admin/layout.tsx` | Server | Requires ADMIN role |
| `guest/layout.tsx` | Server | No auth (token-based) |

### All Pages

| Route | Type | Description |
|-------|------|-------------|
| `/` | Server | Landing page or role-based redirect |
| `/sign-in/[[...sign-in]]` | Server | Clerk sign-in |
| `/sign-up/[[...sign-up]]` | Client | Clerk sign-up (invite-only) |
| `/callback` | Client | Post-auth redirect dispatcher |
| `/onboarding` | Client | Agent profile setup |
| `/unauthorized` | Client | Access denied page |
| `/dashboard` | Client | Agent dashboard — stats, recent deals, voice CTA |
| `/dashboard/profile` | Client | Agent profile editor (save-on-blur) |
| `/dashboard/deals` | Client | Deal listing with filters/search/sort |
| `/dashboard/deals/[id]` | Client | Deal detail — tabs: Contract, Addenda, Counters, Guests |
| `/dashboard/deals/[id]/counteroffers/[counterId]` | Client | Counter offer detail |
| `/dashboard/bbas` | Client | BBA listing with filters |
| `/dashboard/bbas/[id]` | Client | BBA document editor |
| `/dashboard/superagent` | Client | Voice session launcher + recent sessions |
| `/dashboard/superagent/[id]` | Client | Active voice session (transcript, extraction, PDF preview) |
| `/dashboard/superagent/send-email/[docId]` | Client | Send document via email |
| `/dashboard/superagent/send-for-signature/[docId]` | Client | DocuSign send wizard |
| `/admin/dashboard` | Server | Admin stats + quick nav |
| `/admin/users` | Server | User management (invite, ban, delete) |
| `/admin/signed-contracts` | Server | All signed documents |
| `/admin/designer` | Client | Jurisdiction picker |
| `/admin/designer/[state]` | Client | Template list for jurisdiction |
| `/admin/designer/studio` | Client | pdfme template editor |
| `/guest/[token]` | Client | Guest workspace — contract view, addenda, counters |
| `/guest/[token]/counteroffers/[id]` | Client | Guest counter offer detail |

---

## Components by Domain

### Voice Session
| Component | Description |
|-----------|-------------|
| `VoiceAgentUI` | Main voice session orchestrator — LiveKit connection, view toggles |
| `CallControls` | Call control buttons (end, finalize) |
| `TranscriptFeed` | Live transcript from agent + user |
| `ExtractionsFields` | Real-time extracted field display |
| `RealTimePdfPreview` | PDF preview updating during call |
| `VoiceSessionToggle` | Toggle between transcript/fields/preview views |
| `FieldNavigator` | Navigate unfilled required fields during call |
| `RecentVoiceSessions` | Dashboard widget showing recent calls |
| `FieldPopover` | Field detail popover during extraction |

### Deal / Contract
| Component | Description |
|-----------|-------------|
| `ContractHeader` | Sticky header — address, status, buyer, missing fields count |
| `ContractTabContent` | Wraps `DocumentEditor` for the contract tab |
| `DocumentEditor` | Main editor — loads pdfme template, supports PDF View + Form View |
| `PdfmeEditor` | pdfme Viewer integration for PDF rendering |
| `FormView` / `FormViewFields` | Inline-editable form fields by page |
| `DocumentNavigator` | Page navigation for multi-page documents |
| `FiltersBar` | Status/search/sort filters for deal listing |
| `DealCard` | Card component for deal grid |
| `ChecklistPanel` | Rules/suggestions panel (mock data only) |
| `SendReviewModal` | Email review send modal |
| `SignedContractsTable` | Admin view of all signed documents |

### BBA
| Component | Description |
|-----------|-------------|
| `BbaHeader` | BBA detail page header |
| `BbaDocumentPreview` | BBA document editor (same as DocumentEditor) |
| `BbaFiltersBar` | BBA list filters |
| `BbaCard` | Card component for BBA grid |

### Counter Offers
| Component | Description |
|-----------|-------------|
| `CountersTabContent` | Counter offer list in deal detail |
| `CounterCard` | Individual counter offer display |
| `CounterOfferCreateModal` | Create via voice or PDF upload |
| `CounterPdfUploader` | PDF upload component for counters |
| `CounterSelectModal` | Counter template selection |

### Addenda
| Component | Description |
|-----------|-------------|
| `AddendaTabContent` | Addenda list in deal detail |
| `AddendumCard` | Individual addendum display |
| `AddendumEditor` | Addendum editor component |
| `AddendumSelectModal` | Template selection for new addendum |
| `AddendumFromFieldsCard` | Display addenda extracted from contract fields |

### Guest Workspace
| Component | Description |
|-----------|-------------|
| `GuestWorkspace` | Main guest layout — tabs for contract, addenda, counters |
| `GuestsTabContent` | Guest link management in deal detail |
| `GuestInviteModal` | Create guest link modal |
| `GuestAddendaTabContent` | Guest view of addenda |
| `AddendumViewer` | Read-only addendum display for guests |

### Admin
| Component | Description |
|-----------|-------------|
| `JurisdictionsTable` | Jurisdiction list with create dialog |
| `JurisdictionTemplateCard` | Template card in jurisdiction config |
| `UsersTableClient` | User + invitation list |
| `InviteUserDialog` | Invite user modal |
| `UserActionsMenu` | Per-user action dropdown |
| `DashboardStats` / `DashboardCharts` | Admin dashboard widgets |

### Shell / Layout
| Component | Description |
|-----------|-------------|
| `AdminShell` / `AdminSidebar` / `AdminTopBar` | Admin layout shell |
| `AgentSidebar` / `TopBar` | Agent layout shell |
| `PageShell` | Page wrapper with consistent spacing |
| `MobileSidebar` / `MobileBottomNav` | Mobile navigation |
| `SectionHeader` | Reusable section heading |
| `StatusPill` | Status badge component |
| `EmptyState` | Empty state placeholder |
| `Pagination` | Pagination component (exists but not wired to most pages) |

### Landing Page
`Header`, `Hero`, `ProblemSection`, `SolutionSection`, `FeaturesSection`, `DifferenceSection`, `WhoItsForSection`, `SecuritySection`, `SocialProofSection`, `CTASection`, `Footer`, `VoiceWaveform`

---

## Custom Hooks

### API Hooks (`lib/hooks/`)

| Hook | Description |
|------|-------------|
| `useExtractions` | Two-phase polling: resolve callId → documentId, then poll extraction fields |
| `useLivekitConnection` | Fetch LiveKit room token, manage connection state |
| `useTemplatesByJurisdiction` | List templates for a jurisdiction |
| `useTemplate` | Find-or-create template by jurisdiction + type + slug |
| `useTemplateById` | Fetch template version by ID |
| `useUpdateTemplatePrompt` | Mutation with optimistic update for prompts |
| `useUpdateTemplateSlug` | Mutation with optimistic update for slug |
| `useUpdateTemplateLayout` | Save pdfme layout JSON |
| `useCreateTemplate` | Create template (optimistic cache patch) |
| `useDeleteTemplate` | Delete template |
| `useDesigner` | pdfme Designer lifecycle — load, init, save |
| `useCounterOffers` | List counter offers for a deal |
| `useCounterOffer` | Fetch single counter offer |
| `useCreateCounterOffer` | Create counter offer |
| `useUploadCounterOfferPdf` | Custom FormData upload for counter PDFs |
| `useGuestLinks` | List guest links for a deal |
| `useCreateGuestLink` | Create guest link |
| `useRevokeGuestLink` | Revoke guest link |
| `useValidateGuestToken` | Validate guest access token |
| `useListGuestCounterOffers` | List counter offers (guest view) |
| `useGetGuestCounterOffer` | Get counter offer (guest view) |
| `useGetGuestContractView` | Get contract view (guest) |
| `useCreateGuestCounterOffer` | Create counter offer as guest |
| `useUploadGuestCounterOfferPdf` | Upload counter PDF as guest (custom fetch with X-Guest-Token) |

### Component Hooks

| Hook | Location | Description |
|------|----------|-------------|
| `useContractUpdater` | `contracts/` | Field update logic — handles radio groups, checkboxes, text |
| `useFormFields` | `contracts/` | Process template schemas into grouped fields by page |
| `useFieldNavigator` | `contracts/` | Cursor navigation through unfilled required fields |
| `useUnfilledFields` | `contracts/` | Compute unfilled required fields list |
| `useDealData` | `deals/` | Derive display data from deal DTO |
| `useFilteredDocuments` | `deals/` | Filter documents into addenda and counters arrays |

---

## Server Actions (`lib/actions/`)

### Documents (`documents.ts`)
- `createDocument(data)` — POST /documents
- `sendDocumentEmail(documentId, emailData)` — POST /documents/{id}/send-email
- `sendDocumentForSignature(documentId, signatureData)` — POST /documents/{id}/send-for-signature
- `getDocument(documentId)` — GET /documents/{id}
- `deleteAdminDocument(documentId)` — DELETE /admin/documents/{id}

### Document Review (`document-review.ts`)
- `sendDocumentReview(email, title, data)` — POST /documents/send-review

### Users (`users.ts`)
- `inviteUser(email, role)` — Clerk invitation
- `bulkInviteUser(users[])` — Bulk Clerk invitations
- `updateUserRole(userId, role)` — Update Clerk metadata
- `toggleUserStatus(userId, isBanned)` — Ban/unban via Clerk
- `deleteUser(userId)` — Delete from Clerk
- `revokeInvitation(invitationId)` — Revoke Clerk invitation

### Profile (`profile.ts`)
- `updateProfile(data)` — Update Clerk publicMetadata
- `getCurrentProfile()` — Read Clerk publicMetadata

---

## API Client

### Generated Files
- `lib/api/generated/schema.d.ts` — OpenAPI type definitions
- `lib/api/generated/fetch-client.ts` — NSwag `Client` class + all DTO classes
- `lib/api/generated/fetch-client/Query.ts` — ~80+ auto-generated React Query hooks
- `lib/api/generated/fetch-client/helpers.ts` — Client factory, base URL, fetch factory

### Auth Pattern

**Client-side** (`AuthProvider`): wraps fetch with Clerk JWT token, retries once on 401/403 with fresh token.

**Server-side** (`getServerClient`): creates `Client` with `auth().getToken()`, uses `cache: "no-store"`.

**Server actions**: manual `fetch()` with `auth().getToken()` — do not use generated Client.

### Regeneration
```bash
cd superagentv2_frontend && npm run generate:api
```
Requires backend running at `localhost:8080`.

---

## State Management

- **TanStack Query v5** for all server state (queries + mutations)
- **Local `useState`** for UI state (forms, modals, tabs)
- **No global state library** (no Redux, Zustand, or Context for app state)

### Query Config
```
staleTime: 60_000 (1 minute)
refetchOnWindowFocus: false
retry: 1
```

### Key Patterns
- Auto-generated keys: `["Client", "<methodName>", ...params]`
- Custom keys: `["extractions", callId, phase, documentId]`
- Mutations invalidate related list queries
- Template mutations use optimistic updates with rollback
- Extraction hook clears cache on callId change

---

## Key Libraries

| Library | Purpose |
|---------|---------|
| `@clerk/nextjs` | Auth (JWT, user metadata, invitations) |
| `@tanstack/react-query` v5 | Server state management |
| `@pdfme/*` (ui, generator, common, schemas, converter, manipulator) | PDF template design + rendering |
| `@livekit/components-react` + `livekit-client` | WebRTC voice calls |
| `@radix-ui/*` | Accessible UI primitives |
| `framer-motion` | Animations |
| `lucide-react` | Icons |
| `sonner` + `react-toastify` | Toast notifications (both coexist) |
| `zod` | Validation |
| `date-fns` | Date formatting |
| `signature_pad` | Signature capture (custom pdfme plugin) |
| `class-variance-authority` | Component variants (CVA) |
| `pdf-lib` | Low-level PDF manipulation |

### Custom pdfme Plugins (`lib/plugins/`)
- `customSignature` — signature field using `signature_pad`
- `customRadioGroup` — radio group field
- `getPlugins()` — returns 6 plugin types (Text, Checkbox, RadioGroup, Date, DateTime, Signature) with metadata fields (description, agent_mapping, mls_alternative, bba_mapping, purchase_contract_mapping)
