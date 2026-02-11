# Data contracts and types

Types and DTOs come from the **generated API client**. Do not define duplicate view models in the frontend.

**Import from:** `lib/api/generated/fetch-client`

## Main types (from OpenAPI / backend)

| Use case                 | Type                                             | Notes                                     |
| ------------------------ | ------------------------------------------------ | ----------------------------------------- |
| Deal list (API response) | `DealListDto`, `IDealListDto`                    | Deals from `useListDealsQuery` / list API |
| Deal detail              | `DealDetailDto`, `IDealDetailDto`                | Single deal from get deal API             |
| Document list            | `DocumentListDto`, `IDocumentListDto`            | Documents for a deal                      |
| Document detail          | `DocumentDetailDto`, `IDocumentDetailDto`        | Single document                           |
| Suggestions (AI)         | `SuggestionDto`, `ISuggestionDto`                | AI suggestion items                       |
| Activity                 | `ActivityDto`, `IActivityDto`                    | Activity/timeline items                   |
| User profile             | `UserResponseDTO`, `IOnboardingRequestDTO`       | Profile from API / Clerk metadata         |
| Templates                | `TemplateListDto`, `DocumentCreateRequest`, etc. | Admin / document creation                 |

## Deal status

Deal status values (from backend enum): **DRAFT**, **WAITING_SIGNATURE**, **COMPLETED**, **BLOCKED**.  
Use `StatusPill` with `status: string`; it maps these to labels and styles.

## Regenerating the client

After API changes, regenerate the client so `lib/api/generated/` stays in sync with the backend OpenAPI spec.
