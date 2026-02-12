# Frontend — Next.js Application

Next.js 16 / React 19 / TypeScript / Tailwind v4 / Radix UI

## Architecture

```
superagentv2_frontend/
├── app/                        # Next.js App Router (file-based routing)
│   ├── (auth)/                 # Auth routes (sign-in, sign-up)
│   ├── admin/                  # Admin pages (dashboard, designer, users)
│   │   └── layout.tsx          # Role check: must be ADMIN
│   ├── dashboard/              # Agent pages (deals, BBAs, superagent)
│   │   └── layout.tsx          # Auth check: must be logged in + onboarded
│   ├── guest/                  # Guest signing routes (public)
│   ├── onboarding/             # User onboarding flow
│   ├── layout.tsx              # Root layout (providers, fonts, toaster)
│   └── page.tsx                # Landing page with role-based redirect
├── components/
│   ├── ui/                     # Radix UI primitives (button, input, card, etc.)
│   └── superagent/             # Domain components by feature
│       ├── contracts/          # Contract components (barrel export via index.ts)
│       ├── deals/
│       ├── profile/
│       └── shell/              # Layout shells (PageShell, etc.)
├── lib/
│   ├── api/                    # OpenAPI-generated client + AuthProvider + server-client
│   ├── actions/                # Server actions ("use server")
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utilities (cn, logger, parseApiError)
│   ├── constants/              # App constants (US states, roles, template types)
│   ├── providers/              # React context providers (QueryProvider)
│   ├── validations/            # Zod schemas
│   ├── services/
│   ├── plugins/
│   └── types/
├── types/                      # Global TypeScript types
└── public/                     # Static assets
```

## TypeScript / React Conventions

### Naming

- **Component files**: PascalCase — `FormView.tsx`, `ProfileField.tsx`
- **Utility files**: camelCase — `parseApiError.ts`, `logger.ts`
- **Hook files**: camelCase with `use` prefix — `useFormFields.ts`, `useDesigner.ts`
- **Action files**: camelCase — `actions-name.ts`
- **Types/Interfaces**: PascalCase — `TemplateField`, `FormViewProps`
- **Enums**: PascalCase name, string values — `enum UserRole { ADMIN = "admin" }`
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase for config objects
- **Boolean variables**: `is`/`has`/`should` prefix — `isLoading`, `hasError`

### Imports

- **Only absolute imports** via `@/*` path alias — never relative imports
- Ordering: external libs -> internal utils/hooks -> components -> types
- **Barrel exports** for feature folders (e.g., `components/superagent/contracts/index.ts`)

```typescript
// Good
import { Button } from "@/components/ui/button";
import { useFormFields } from "@/components/superagent/contracts";
import { cn } from "@/lib/utils";

// Bad — never use relative imports
import { Button } from "../../../components/ui/button";
```

### Page Patterns

**Server component pages** (default for routing/redirect logic):
```typescript
// app/page.tsx — NO "use client"
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (!userId) return <LandingPage />;

  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string) || "";

  if (role === UserRole.ADMIN) redirect("/admin/dashboard");
  if (role === UserRole.AGENT) redirect("/dashboard");
  redirect("/callback");
}
```

**Client component pages** (for interactive content):
```typescript
"use client";

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListDealsQuery(undefined, undefined, undefined, undefined, undefined, {
    enabled: !!user,
  });

  const deals = useMemo(() => data?.items ?? [], [data?.items]);

  if (isLoading) return <SkeletonGrid />;

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Content */}
      </motion.div>
    </PageShell>
  );
}
```

Rules:
- Server components by default — only add `"use client"` when needed
- Wrap interactive pages with `<Suspense>` boundary
- Extract content into separate component below the default export
- Every query needs `enabled: !!user` or `enabled: !!requiredParam`
- Use `useMemo` for derived data from queries
- Wrap page content in `<PageShell>` component
- Use Framer Motion for entrance animations: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`

### Layout Patterns

**Root layout** (provider nesting order):
```
ClerkProvider → ErrorBoundaryWrapper → QueryProvider → AuthProvider → {children} + Toaster
```

**Protected layouts** (server-side auth gate):
```typescript
// app/dashboard/layout.tsx — Server component
export default async function DashboardLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const onboarded = !!(user?.publicMetadata?.onboarded as boolean);
  if (!onboarded) redirect("/onboarding");

  return <>{children}</>;
}

// app/admin/layout.tsx — Role check
export default async function AdminLayout({ children }) {
  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string) || "";
  if (role !== UserRole.ADMIN) redirect("/dashboard");
  return <>{children}</>;
}
```

Rules:
- No `middleware.ts` — auth checks happen in layouts
- Server-side: `auth()` + `currentUser()` from `@clerk/nextjs/server`
- Client-side: `useUser()` from `@clerk/nextjs` for conditional UI
- Redirect with `redirect()` from `next/navigation`
- Layouts return `<>{children}</>` — child pages provide full structure

### Component Patterns

**UI components** (Radix + CVA):
```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-none text-sm font-medium ...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border bg-background shadow-xs hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Button({ className, variant, size, asChild = false, ...props }:
  React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

**Compound components** (Card pattern):
```typescript
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card" className={cn("bg-card ...", className)} {...props} />;
}
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("...", className)} {...props} />;
}
// Export: Card, CardHeader, CardTitle, CardContent, CardFooter, CardAction
```

Rules:
- `cn()` for class merging — accepts `className` prop last
- `data-slot` attributes on every component for semantic targeting
- `data-variant` and `data-size` for variant identification
- CVA for multi-variant components, plain `cn()` for simple ones
- `asChild` + Radix `Slot` for polymorphic rendering
- Export both component and variants function
- Functional components only (exception: ErrorBoundary class component)
- `export default function` for pages, named exports for reusable components

### Custom Hook Patterns

```typescript
// Query wrapper with error toast
export const useTemplatesByJurisdiction = (jurisdictionCode: string | null, templateType?: TemplateType) => {
  const query = useGetTemplatesQuery(jurisdictionCode?.toUpperCase() || "", templateType, {
    enabled: !!jurisdictionCode,
  });

  useEffect(() => {
    if (query.error) {
      toast.error(`Failed to load templates: ${query.error instanceof Error ? query.error.message : "Unknown error"}`);
    }
  }, [query.error]);

  return query;
};

// Mutation wrapper with optimistic updates
export const useUpdateTemplatePrompt = () => {
  const queryClient = useQueryClient();

  const mutation = useUpdatePromptsMutationWithParameters({
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["Client", "getTemplates"] });
      const previous = queryClient.getQueriesData({ queryKey: ["Client", "getTemplates"] });
      // Optimistic patch
      return { previous };
    },
    onError: (err, _, ctx) => {
      // Rollback
      ctx?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(`Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`);
    },
    onSuccess: () => {
      toast.success("Saved successfully");
    },
  });

  // Wrap to expose simpler API
  return {
    ...mutation,
    mutate: (params: { templateId: string; documentPrompt: string }) => {
      mutation.mutate({ id: params.templateId, body: { documentPrompt: params.documentPrompt } });
    },
  };
};

// Complex hook with typed return
export interface UseDesignerReturn {
  designerRef: React.RefObject<HTMLDivElement | null>;
  templateData: ApiTemplate | undefined;
  isLoadingTemplate: boolean;
  onSaveTemplate: () => void;
}

export function useDesigner(): UseDesignerReturn {
  // refs, state, queries, mutations, handlers
  return { designerRef, templateData, isLoadingTemplate, onSaveTemplate };
}
```

Rules:
- `use` prefix + PascalCase
- Add error toast in `useEffect` watching `query.error`
- Mutations: `onMutate` (cancel + optimistic), `onError` (rollback + toast), `onSuccess` (toast)
- Wrap generated mutations to expose simpler API: `{ ...mutation, mutate: (simpleParams) => ... }`
- Complex hooks: define return type interface, use `useCallback` for handlers
- Zod `.safeParse()` with fallback for URL params

### State Management

- **React Query (TanStack Query v5)** for all server/async state
- **Local `useState`** for UI state and form inputs
- No Redux, no Zustand — keep it simple

Query client config (in `QueryProvider`):
```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,          // 1 minute
      refetchOnWindowFocus: false,    // Calm UX
      retry: 1,
    },
  },
});
```

### API Integration

**Client-side** — `AuthProvider` configures fetch middleware:
- Auto-injects `Authorization: Bearer <token>` from Clerk
- On 401/403: retries once with `getToken({ skipCache: true })`
- Returns `null` until configured (prevents hydration mismatch)

**Server-side** — `getServerClient()` for Server Components:
```typescript
const client = await getServerClient();
const data = await client.getDeals();
```

Regenerate client after backend API changes:
```bash
npm run generate:api
```

### Server Actions

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";

export async function createResource(data: CreateData) {
  const authResult = await auth();
  if (!authResult?.userId) {
    return { success: false, error: "Authentication required" };
  }

  const token = await authResult.getToken();
  const response = await fetch(`${API_URL}/resource`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Network error" }));
    return { success: false, error: errorData.error };
  }

  return { success: true, data: await response.json() };
}
```

Always return `{ success, error?, data? }` — never throw from server actions.

### Form Handling

- **No external form library** — pure React controlled components
- Save on blur, not on submit (inline editing)
- Field-by-field validation via Zod
- Disable field while saving

```typescript
const [localValue, setLocalValue] = useState(value ?? "");

const handleBlur = () => {
  if (localValue !== value) onUpdate(localValue);
};

return (
  <input
    value={localValue}
    onChange={(e) => setLocalValue(e.target.value)}
    onBlur={handleBlur}
    disabled={isUpdating}
  />
);
```

### Validation (Zod)

```typescript
// Schemas with transform and refine
export const jurisdictionCodeSchema = z.string()
  .length(2, "Must be exactly 2 characters")
  .transform((val) => val.toUpperCase())
  .refine((val) => /^[A-Z]{2}$/.test(val), { message: "Must be 2 uppercase letters" });

export const pdfFileSchema = z.instanceof(File)
  .refine((file) => file.type === "application/pdf", { message: "Must be a PDF" })
  .refine((file) => file.size <= 10 * 1024 * 1024, { message: "Max 10MB" });

// Always export both schema and inferred type
export const templateTypeSchema = z.enum(["BBA", "CONTRACT", "ADDENDA", "COUNTEROFFERS"]);
export type TemplateType = z.infer<typeof templateTypeSchema>;

// Composed schemas
export const createTemplateSchema = z.object({
  jurisdictionCode: jurisdictionCodeSchema,
  templateType: templateTypeSchema,
  slug: templateSlugSchema.optional(),
});
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
```

### Error Handling

- **Global ErrorBoundary** at root — class component, shows calm error UI
- **`parseApiError()`** utility: extracts `{ message, description? }` from various API error formats, filters generic messages
- **Sonner toasts** for user-facing errors/success
- Never auto sign-out on errors

```typescript
// In mutations
onError: (err) => {
  const { message, description } = parseApiError(err);
  toast.error(message, description ? { description } : undefined);
},
onSuccess: () => toast.success("Action completed")
```

Toast config (root layout): `position="top-center"`, `richColors`, `closeButton`, white background with subtle shadow.

### Logging

- Custom `logger` utility (`lib/utils/logger.ts`)
- Only logs in `development` — silent in production
- Exception: `.error()` always logs
- Never use `console.log` directly

### Loading States

No loading spinners (per "Calm Intelligence" design). Instead:
```typescript
// Skeleton grid matching real layout
if (isLoading) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-[160px] rounded-none border bg-white animate-pulse" />
      ))}
    </div>
  );
}

// Empty states
if (data.length === 0) {
  return <p className="py-12 text-center text-[14px] text-[#6B7280]">No records found.</p>;
}
```

- `animate-pulse` for skeleton shimmer
- Match skeleton layout to actual content grid
- Calm, minimal empty states

## Styling

### Tailwind v4 + Radix UI

- **Utility-first** — no custom CSS component classes
- `cn()` = `twMerge(clsx(...inputs))` for conditional class merging
- CSS custom properties for colors (oklch color space): `--primary`, `--secondary`, `--accent`, `--muted`, `--destructive`
- `data-slot` attributes for semantic targeting
- `rounded-none` default on most elements
- `shadow-xs`, `shadow-sm` for subtle depth

### Design System: "Calm Intelligence" (see `docs/frontend/00-northstar.md`)

- **One dominant action per screen** — never multiple competing CTAs
- **Generous white space** — max content width 1200px, 96px outer margins, 24px card spacing, 24-32px card padding
- **Vertical flow** — prefer cards, steps, timelines over dense tables/kanban
- **Soft depth** — shadows over borders, rounded corners (14-16px)
- **Calm motion** — fade + small vertical movement (max 8px), cubic-bezier(0.4, 0, 0.2, 1), no bounce, no spinners
- **Calm errors** — error states inform, never alarm
- **Max 3 font sizes per screen**
- **Admin pages follow the same calm rhythm** — admin does not mean dense

### Typography

| Variable | Font | Usage |
|----------|------|-------|
| `--font-geist-sans` | Geist Sans | Default body |
| `--font-geist-mono` | Geist Mono | Code |
| `--font-display` | DM Serif Display | Headlines |
| `--font-body` | IBM Plex Sans (400-700) | Body text |

### Metadata

```typescript
// Only in root layout.tsx
export const metadata: Metadata = {
  title: "SuperAgent — AI-Powered Real Estate Assistant",
  description: "Calm, intelligent workflow interface for real estate professionals",
};
```

No per-page `generateMetadata` used.

## Authentication

- **Clerk** for all auth (`@clerk/nextjs`)
- Server: `auth()` + `currentUser()` from `@clerk/nextjs/server`
- Client: `useUser()`, `useAuth()` from `@clerk/nextjs`
- `AuthProvider` auto-injects JWT on all API calls, retries on 401/403
- User metadata in `publicMetadata`: `role`, `status`, `onboarded`
- Role enum: `UserRole.ADMIN`, `UserRole.AGENT`
- Onboarding check in dashboard layout — redirects to `/onboarding` if not completed

## Key Libraries

| Library                | Purpose                              |
|------------------------|--------------------------------------|
| `@tanstack/react-query`| Server state, caching, mutations    |
| `openapi-fetch` + `openapi-react-query` | Generated typed API client |
| `@radix-ui/*`          | UI primitives (dialog, select, etc.) |
| `class-variance-authority` | Component variants (CVA)         |
| `lucide-react`         | Icons                                |
| `sonner`               | Toast notifications                  |
| `framer-motion`        | Animations (entrance, layout)        |
| `zod`                  | Runtime validation + type inference  |
| `@pdfme/*`             | PDF template designer + generator    |
| `pdf-lib`              | PDF manipulation                     |
| `date-fns`             | Date utilities                       |
| `clsx` + `tailwind-merge` | Class name utilities              |

## Scripts

| Command              | Purpose                                  |
|----------------------|------------------------------------------|
| `npm run dev`        | Start dev server                         |
| `npm run build`      | Production build (standalone output)     |
| `npm run start`      | Start production server                  |
| `npm run lint`       | ESLint (`next lint`)                     |
| `npm run lint:fix`   | ESLint with auto-fix                     |
| `npm run format`     | Prettier (all `ts,tsx,js,jsx,json,css,md`) |
| `npm run format:check` | Prettier check only                    |
| `npm run test`       | Vitest (watch mode)                      |
| `npm run test:run`   | Vitest (single run)                      |
| `npm run test:coverage` | Vitest with coverage                  |
| `npm run generate:api` | Regenerate OpenAPI TypeScript client from backend swagger |

## Testing

- **Vitest** for unit tests
- **Testing Library** for component tests
- Test files mirror source structure
- Run: `npm run test` (watch) or `npm run test:run` (CI)
