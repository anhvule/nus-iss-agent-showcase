# Specification 02 — Course Catalogue (Human Website Capability) · Design

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 02-course-catalogue
**Audience:** Senior engineers, solution architects, accessibility/QA reviewers
**Traceability:** Implements `./requirements.md`; extends `.kiro/specs/01-foundation/design.md`; consistent with `.kiro/steering/*`.

---

## 1. Executive Summary

This design implements **course discovery** for the human website. It follows the
layered backend established in Specification 01 — **Routes → Controllers →
Services → Repositories → Synthetic Data** — placing all catalogue business logic
(search, filtering, sorting, pagination, status/availability) inside a single
**Course Service**. The frontend consumes the capability through a REST API and
renders an original, accessible, responsive catalogue at
`/lifelong-learning/courses`, with navigation to a course details route.

This is a **Phase 1 (human website)** specification. It contains no AI-agent or
WebMCP design. A short forward-looking note (§17) records that a future, separate
specification will analyse the finished website and expose selected capabilities
as agent tools — but none of that is designed or built here. The Course Service is
decoupled from React and HTTP purely because that is good application design (and
makes future reuse easy), not because any agent abstraction is introduced now.

## 2. Architectural Goals

1. **Clean layer separation.** Business logic in the Course Service; data access in
   the Repository; HTTP concerns in the Controller; presentation in React
   components (FR-205, FR-216, NFR-202).
2. **Structured, consistent API.** A single response envelope and Zod-validated
   inputs, reusing the Spec 01 error/validation foundation (FR-209, NFR-206,
   NFR-207).
3. **Determinism.** Identical inputs yield identical results and ordering
   (FR-224, FR-244, NFR-209).
4. **One rule for listability.** Status/availability logic lives in the Service
   (FR-263).
5. **Replaceable data source.** The Repository interface hides the synthetic JSON
   (NFR-208).
6. **Accessible, responsive UI** across mobile/tablet/desktop (NFR-205,
   NFR-212–216).

## 3. Course Domain Model

The Course model is the shared source of truth (defined once; the server owns the
authoritative Zod schema; the client uses derived/compatible types). Conceptual
TypeScript:

```ts
type CourseStatus = 'published' | 'draft' | 'archived';
type CourseAvailability = 'open' | 'closing_soon' | 'closed' | 'waitlist';
type CourseType = 'full_time' | 'part_time' | 'short_course' | 'micro_credential';
type DeliveryMode = 'on_campus' | 'online' | 'blended';
type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'diploma' | 'post_diploma';

interface Course {
  id: string;                 // stable slug-like id, e.g. "cyber-essentials-pt"
  code: string;               // synthetic course code, e.g. "CYB-1001"
  title: string;
  shortDescription: string;   // one-line summary for cards
  description: string;        // full paragraph(s); rich rendering is Spec 03
  discipline: string;         // enumerated set (e.g. "Cybersecurity")
  category: string;           // finer grouping (e.g. "Security Operations")
  courseType: CourseType;
  level: CourseLevel;
  durationWeeks: number;      // numeric for deterministic sorting
  deliveryMode: DeliveryMode;
  intake: string;             // human label, e.g. "Apr 2026"
  startDate: string;          // ISO 8601 date, sortable
  applicationDeadline: string;// ISO 8601 date
  fee: number;                // numeric, in `currency`
  currency: string;           // e.g. "SGD"
  eligibility: string;        // short text
  entryRequirements: string[];
  skills: string[];           // searchable
  tags: string[];             // searchable
  status: CourseStatus;       // lifecycle of the offering
  availability: CourseAvailability; // whether a learner can act now
}
```

**Status vs availability (FR-260):**
- `status` = the **offering's lifecycle** (is it a real, published catalogue
  entry?). Only `published` courses are publicly listable by default (FR-261).
- `availability` = whether a learner can **currently act** on a published course.
  It is an explicit structured field displayed on cards, never inferred from
  presentation (FR-262).

**Validation rules (FR-203):** enforced via a Zod schema — non-empty
`id`/`code`/`title`; `durationWeeks` positive integer; `fee` non-negative;
`startDate`/`applicationDeadline` valid ISO dates; enum fields constrained; arrays
default to empty. Invalid records fail fast at load time.

> This model already exists from the cancelled implementation
> (`App/server/src/domain/course.ts`) and is reused as-is (see §16).

## 4. Data Model & Synthetic Data

- **Course types** live in a shared location (server owns the authoritative Zod
  schema; the client uses derived types), keeping a single source of truth
  (NFR-203).
- Enumerations (`discipline`, `category`, `courseType`, `level`, `deliveryMode`,
  `status`, `availability`) are `const` arrays so filter validation and UI
  controls derive from the same lists (no drift).
- A JSON fixture of **~20–30 fictional courses** (`App/server/src/data/courses.json`)
  is loaded and validated at startup. It spans disciplines (AI, Data Analytics,
  Cybersecurity, Cloud Computing, Software Development, DevOps, Digital
  Transformation, Business, Engineering, Design, Healthcare, Hospitality) with a
  spread of `courseType`, `deliveryMode`, `level`, `durationWeeks`, `status` (incl.
  a few non-`published`), `availability`, and intakes.
- Titles/descriptions are **original and fictional**; none copied from RP.

> The dataset and loader already exist from the cancelled implementation
> (`courses.json`, `course-data.ts`) and are reused as-is (see §16).

## 5. Repository Design

```ts
interface CourseRepository {
  findAll(): Promise<Course[]>;         // all records (unfiltered)
  findById(id: string): Promise<Course | null>;
}
```

- The repository is the **only** component that knows the data source. It uses the
  validated in-memory dataset loaded by `course-data.ts`.
- It contains **no business rules** (no search/filter/sort/availability logic).
- Because it is an interface, tests inject an in-memory fake and a future database
  implementation can replace it without touching the Service (NFR-204, NFR-208).

## 6. Service Design

The **Course Service** owns catalogue business logic. It is transport-agnostic (no
Express, no React) — standard clean design that keeps logic out of controllers and
components.

```ts
interface CourseQuery {
  keyword?: string;
  filters?: {
    discipline?: string[];
    category?: string[];
    courseType?: CourseType[];
    level?: CourseLevel[];
    deliveryMode?: DeliveryMode[];
    status?: CourseStatus[];
    availability?: CourseAvailability[];
  };
  sort?: { field: 'relevance' | 'title' | 'duration' | 'fee' | 'startDate';
           direction: 'asc' | 'desc' };
  page: number;      // 1-based
  pageSize: number;  // max 48
}

interface CourseListResult {
  data: Course[];
  pagination: { page: number; pageSize: number; totalItems: number; totalPages: number };
}

interface CourseService {
  search(query: CourseQuery): Promise<CourseListResult>;
  getById(id: string): Promise<Course | null>;
}
```

**Pipeline inside `search` (deterministic order):**
1. **Listability** — restrict to publicly listable records (default `status ==
   'published'`) (FR-261, FR-263).
2. **Keyword** — case-insensitive substring match across title, shortDescription,
   description, discipline, category, skills, tags (FR-220–FR-222).
3. **Filters** — AND across fields, OR within a multi-valued field (FR-232,
   FR-233).
4. **Sort** — apply requested sort; `relevance` uses the deterministic score
   (§12); stable tiebreak by `title` then `id` (FR-240–FR-244).
5. **Paginate** — compute totals, slice by `page`/`pageSize` (FR-250–FR-255).

## 7. Controller Design

- The Course Controller handles **HTTP concerns only**: parse and Zod-validate
  query/path params, map to a `CourseQuery`, call the Service, and shape the
  response envelope. No business logic (coding-standards §Structure).
- On validation failure → 400; missing course → 404; unexpected → the Spec 01
  centralised handler → sanitised 500.

## 8. Routes

- `GET /api/courses` and `GET /api/courses/:courseId`, registered under the Spec 01
  `/api` composition, using the existing `validate` middleware and `ApiError`
  taxonomy from `App/server/src/http/`.

## 9. API Design

### Response envelope (consistent; FR-209, NFR-207)

```jsonc
// success (list)
{ "data": [ /* Course[] */ ],
  "pagination": { "page": 1, "pageSize": 12, "totalItems": 26, "totalPages": 3 } }

// success (single)
{ "data": { /* Course */ } }

// error (reuses Spec 01 shape)
{ "error": { "code": "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL",
             "message": "human-readable, sanitised",
             "details"?: [ /* field issues for validation */ ] } }
```

### `GET /api/courses`

Query parameters (all optional unless noted):

| Param | Type | Notes |
| ----- | ---- | ----- |
| `keyword` | string | case-insensitive substring search |
| `discipline` | string (repeatable / CSV) | OR within field |
| `category` | string (repeatable / CSV) | OR within field |
| `courseType` | enum (repeatable / CSV) | OR within field |
| `level` | enum (repeatable / CSV) | OR within field |
| `deliveryMode` | enum (repeatable / CSV) | OR within field |
| `status` | enum (repeatable / CSV) | defaults to listable only |
| `availability` | enum (repeatable / CSV) | OR within field |
| `sort` | enum: `relevance\|title\|duration\|fee\|startDate` | default `relevance` if keyword else `title` |
| `direction` | enum: `asc\|desc` | per-field default (§12) |
| `page` | integer ≥ 1 | default 1 |
| `pageSize` | integer 1–48 | default 12 |

- **Validation:** Zod schema; unknown enum values, non-integer/negative
  page(size), or `pageSize > 48` → **400** with `details` (FR-211, FR-235, FR-252,
  FR-253).
- **Success:** **200** with list envelope + pagination (FR-207, FR-254).
- **No matches / page beyond range:** **200** with empty `data` and correct
  metadata (FR-223, FR-255).

### `GET /api/courses/:courseId`

| Part | Type | Notes |
| ---- | ---- | ----- |
| `courseId` (path) | string | validated shape (non-empty) |

- **Success:** **200** single-course envelope (FR-208).
- **Not found:** **404** `NOT_FOUND` (FR-210).
- **Invalid id shape:** **400** validation error (FR-211).

## 10. Search Design

- Build a lowercase "search haystack" per course from the searchable fields, then
  test `haystack.includes(keyword.toLowerCase())` (FR-221).
- Empty/omitted keyword ⇒ no keyword constraint (FR-222); no matches ⇒ empty
  result with valid pagination (FR-223). Deterministic; no external search
  dependency (FR-224).

## 11. Filtering Design

- **AND across fields**: a course must satisfy every provided filter field
  (FR-232). **OR within a field**: a course matches if its value is among the
  provided values (FR-233). Filters combine with keyword via AND (FR-234). Unknown
  enum values ⇒ 400 (FR-235).

## 12. Sorting Design

| Sort field | Default direction | Behaviour |
| ---------- | ----------------- | --------- |
| `relevance` | `desc` | deterministic keyword score; meaningful only with a keyword |
| `title` | `asc` | locale-stable string compare |
| `duration` | `asc` | numeric `durationWeeks` |
| `fee` | `asc` | numeric `fee` |
| `startDate` | `asc` | ISO date compare |

- **Relevance score (FR-242):** weighted field matches (e.g. title=3, skills=2,
  tags=2, discipline/category=1, description/shortDescription=1), summed per
  course; ties broken by `title` asc then `id` asc. Deterministic; no ML.
- No keyword ⇒ default `title asc` (FR-243). Every sort applies the stable
  tiebreak (FR-244).

## 13. Pagination Design

- Compute after search/filter/sort. `totalItems = filtered.length`;
  `totalPages = max(1, ceil(totalItems / pageSize))`; slice
  `[(page-1)*pageSize, page*pageSize)`.
- Defaults page=1, pageSize=12; max pageSize=48; invalid ⇒ 400; page beyond range
  ⇒ empty `data` with correct metadata (FR-250–FR-255).

## 14. Frontend Architecture

- **Routes (App Router):**
  - `/lifelong-learning/courses` — the catalogue
    (`client/src/app/lifelong-learning/courses/page.tsx`).
  - `/lifelong-learning/courses/[courseId]` — a **minimal** course details
    placeholder page so "View Details" navigation works end to end (FR-217). Rich
    details content is Specification 03.
- **Composition (presentation only; FR-216):**
  - `CoursesPage` (client component) — orchestrates query state and data fetching.
  - `CourseSearchBar`, `CourseFilters`, `CourseSortControl` — inputs that map 1:1
    to API query params.
  - `CourseCount` — result count in an `aria-live` region.
  - `CourseGrid` → `CourseCard` — card shows title, discipline, courseType,
    deliveryMode, duration, next intake, fee, availability/status + "View Details"
    (FR-213). Not overloaded.
  - `Pagination` — accessible navigation region (NFR-216).
  - `CatalogueStates` — loading / empty / error (with retry) (FR-214).
- **Data access:** a small `coursesApi` client built on the Spec 01 client
  transport/API boundary calls the Course API. The UI contains **no**
  search/filter/sort/pagination logic and never touches the data source directly
  (FR-215, FR-216).
- **Design system:** reuses the Spec 01 UI primitives (Button, Card, Container) and
  Tailwind theme. Modern, clean, professional education-platform styling — **not**
  a visual clone of RP.

## 15. State Management, Error/Loading/Empty States, Accessibility, Responsive

- **State (§design):** local React state (`useState`/`useReducer`) holds the
  structured query (keyword, filters, sort, page, pageSize) and a discriminated-union
  request state (`loading | success | empty | error`) — the `HealthState` pattern
  from Spec 01. No global state library (avoid unnecessary dependencies).
- **Loading:** skeleton/placeholder with a status announced via `aria-live`.
- **Empty:** clear "no courses match" message with a reset-filters action (FR-214,
  FR-223).
- **Error:** sanitised message + retry; never expose internals (FR-214, NFR-211).
- **Accessibility (NFR-213–216):** semantic landmarks, labelled search form,
  keyboard-operable controls with visible focus, `aria-live` result count/state,
  availability shown with text/badge + icon (not colour alone), AA contrast, and
  pagination as an accessible nav with `aria-current`.
- **Responsive (NFR-212):** grid adapts column count across mobile/tablet/desktop;
  filters, search, and pagination remain usable on small screens (not a shrunken
  desktop layout — e.g. filters may collapse into a disclosure on mobile).
- **URL sync (optional):** query state may be reflected in the URL query string for
  shareable/deep-linkable results (progressive enhancement).

## 16. Reconciliation with the Cancelled Implementation

The cancelled attempt created **backend artifacts only**; the catalogue UI was
never created. These files exist and are **reused as-is** because they are plain,
human-website-focused, and contain no agent/WebMCP concepts:

| File | Role | Disposition |
| ---- | ---- | ----------- |
| `App/server/src/domain/course.ts` | Course model, enums, Zod schema | Reuse (matches §3–§4) |
| `App/server/src/data/courses.json` | ~27 synthetic fictional courses | Reuse (matches §4) |
| `App/server/src/data/course-data.ts` | validating loader (fail-fast) | Reuse (matches §4–§5) |
| `App/server/src/data/README.md` | dataset note | Reuse |

Still **to be implemented:** Course Repository, Course Service (search/filter/sort/
pagination/listability + `getById`), Course Controller, routes, and the entire
catalogue + details-navigation UI, plus tests and documentation.

Nothing in the cancelled work must be removed for this revised specification.

## 17. Future Transformation (Phase 2 — forward-looking note only)

Once the human website is complete, a **future, separate Kiro specification** will
analyse the finished application, inventory its existing capabilities, and expose
selected ones as structured AI-agent / WebMCP capabilities (discovery →
capability inventory → agent tools → WebMCP adapter/registry → permissions/guardrails
→ AI agent integration → demonstration).

Specification 02's only contribution to that future is **normal good design**: the
Course Service is decoupled from React and HTTP, so it can be reused rather than
rewritten. **No** `agent/`, `webmcp/`, `mcp/`, `tools/`, tool schemas, registries,
permissions, or AI-model code is designed or created in Specification 02. How
existing capabilities are exposed is a decision for the Phase 2 specification.

## 18. Testing Strategy

Aligned with `.kiro/steering/testing.md`. Introduce test tooling here (first real
logic): Vitest (unit + frontend), supertest (API), pinned to exact versions.

- **Unit — Repository:** loads/validates fixture; `findById` hit/miss.
- **Unit — Service:** search (case-insensitive/partial/empty/no-match); filters
  (single, AND-across, OR-within, keyword+filter); sorting (each field, relevance,
  stable tiebreak); pagination (defaults/boundaries/beyond-range/totals);
  listability rule.
- **API:** `GET /api/courses` (happy, search, filters, sort, pagination, empty);
  validation errors → 400; `GET /api/courses/:courseId` (200/404/400); envelope
  consistency.
- **Frontend:** catalogue renders; search/filter/sort/pagination update results;
  loading/empty/error states; details navigation; basic accessibility (labels,
  focus, aria-live).

Determinism is a first-class test concern (NFR-209).

## 19. Security Considerations

- Zod validation at the controller boundary; sanitised 400/404/500 responses;
  Helmet + CORS from Spec 01 apply (NFR-206, NFR-211). Backend remains the trust
  boundary. No secrets/PII; synthetic data only; structured logs without sensitive
  data (NFR-210). Consistent with `.kiro/steering/security.md`.

## 20. Performance Considerations

- In-memory dataset (~20–30) with O(n) search/filter and O(n log n) sort is far
  below any latency concern (NFR-201). The loader caches the validated fixture; no
  per-request file I/O. No grid virtualisation needed at this scale.

## 21. Architecture Decisions

| ID | Decision | Rationale |
| -- | -------- | --------- |
| AD-201 | Business logic only in the Course Service | Single source of truth; matches Spec 01 layering; keeps controllers/components thin |
| AD-202 | Transport-agnostic Service contract (`CourseQuery`/`CourseListResult`) | Clean decoupling from HTTP/React; easy to test |
| AD-203 | Structured, explicit course fields in responses | Unambiguous UI rendering; no presentation-only inference |
| AD-204 | AND-across-fields / OR-within-field filtering | Predictable, expressive querying |
| AD-205 | Deterministic relevance (weighted fields + stable tiebreak) | Reproducible; no ML dependency |
| AD-206 | Status vs availability modelled separately | Clear listability vs actionability semantics |
| AD-207 | Repository interface over JSON fixture | Swappable data source (DB later) without touching Service |
| AD-208 | Route `/lifelong-learning/courses` (+ `/[courseId]` placeholder) | Matches the human journey; enables details navigation now |
| AD-209 | Consistent envelope + Zod boundary (reuse Spec 01) | API consistency + safety; no duplication |
| AD-210 | Rich details & comparison deferred to Spec 03 | Keeps Spec 02 focused on discovery + navigation |
| AD-211 | Reuse cancelled backend artifacts (model/data/loader) | Correct, human-focused, no rework needed |
| AD-212 | No agent/WebMCP abstractions in Spec 02 | Phase-2 concern; build normal capability first |

## 22. Specification Dependencies

- **Depends on Spec 01:** layered backend, Express app + centralised error handler,
  `http/validate` + `ApiError`, Zod-validated config, Helmet/CORS, Pino logging,
  client shell/navigation, UI primitives, client transport/API boundary,
  README/docs foundation.
- **Enables Spec 03 (Course Details & Comparison):** reuses `getById`, the Course
  model, structured attributes, and the details route placeholder.
- **Enables Spec 04 (Enquiry Workflow):** enquiries reference a discovered course.
- **Phase 2 (future, separate):** may later reuse the Course Service when exposing
  capabilities as agent tools — not designed here.

---

**Consistency check:** Every functional and non-functional requirement in
`requirements.md` maps to a design section here and to at least one task in
`tasks.md`. This design does not contradict Specification 01; it realises the
layering and reuses the foundations Spec 01 established. It contains no AI-agent or
WebMCP design beyond the clearly-separated forward-looking note in §17.
