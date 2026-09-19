# Course Catalogue — Capability & API (Specification 02)

The Course Catalogue is the first substantial business capability of the human
website: **course discovery**. It provides a synthetic course dataset, a layered
backend (repository → service → controller → REST API) for searching, filtering,
sorting, and paginating courses, and an accessible, responsive catalogue UI with
navigation to a course details page.

> **Scope note.** This is a **human-facing** capability. It implements the
> Course Catalogue only. AI-agent / WebMCP / MCP functionality is **not**
> implemented and is a **future phase** (a separate specification). See
> "Future extensibility" below. All course data is **synthetic and fictional**;
> there is no Republic Polytechnic (or any) production integration.

## Where it lives

Layering follows Specification 01: **Routes → Controllers → Services →
Repositories → Data**. All catalogue business logic lives in the Course Service.

| Concern | File |
| ------- | ---- |
| Domain model + Zod schema + enums | `server/src/domain/course.ts` |
| Synthetic dataset (27 fictional courses) | `server/src/data/courses.json` |
| Validating loader (fail-fast) | `server/src/data/course-data.ts` |
| Repository (data access) | `server/src/repositories/course-repository.ts` |
| Service (search/filter/sort/paginate/listability) | `server/src/services/course-service.ts` |
| Query validation (Zod) | `server/src/controllers/course-query.schema.ts` |
| Controller (HTTP ↔ service) | `server/src/controllers/course-controller.ts` |
| Routes | `server/src/routes/courses.ts` |
| Catalogue UI | `client/src/app/lifelong-learning/courses/page.tsx` + `client/src/components/courses/*` |
| API client | `client/src/lib/courses/api.ts` |

The frontend never accesses the dataset directly and contains no
search/filter/sort/pagination logic — it derives all results from the API.

## Endpoints

Base path: `/api` (from Specification 01). Both endpoints are **READ**
operations and use the shared response envelope.

### `GET /api/courses`

Returns a paginated, filtered, sorted, optionally keyword-searched list of
publicly listable courses.

**Query parameters** (all optional):

| Param | Type | Notes |
| ----- | ---- | ----- |
| `keyword` | string | Case-insensitive substring search across title, short/long description, discipline, category, skills, and tags. |
| `discipline` | enum (repeatable or CSV) | OR within the field. |
| `category` | string (repeatable or CSV) | OR within the field. |
| `courseType` | enum: `full_time \| part_time \| short_course \| micro_credential` | OR within the field. |
| `level` | enum: `beginner \| intermediate \| advanced \| diploma \| post_diploma` | OR within the field. |
| `deliveryMode` | enum: `on_campus \| online \| blended` | OR within the field. |
| `status` | enum: `published \| draft \| archived` | Defaults to listable (`published`) only. |
| `availability` | enum: `open \| closing_soon \| closed \| waitlist` | OR within the field. |
| `sort` | enum: `relevance \| title \| duration \| fee \| startDate` | Default: `relevance` when a keyword is present, otherwise `title`. |
| `direction` | enum: `asc \| desc` | Per-field default: `relevance` → `desc`; others → `asc`. |
| `page` | integer ≥ 1 | Default `1`. |
| `pageSize` | integer 1–48 | Default `12`; a value above 48 is rejected. |

**Filter semantics:** AND **across** different fields; OR **within** a
multi-valued field; combined with `keyword` via AND.

**Success — 200** (list envelope):

```jsonc
{
  "data": [ /* Course[] */ ],
  "pagination": { "page": 1, "pageSize": 12, "totalItems": 25, "totalPages": 3 }
}
```

- No matches, or `page` beyond the last page → **200** with an empty `data`
  array and correct metadata (not an error).

### `GET /api/courses/:courseId`

Returns a single publicly listable course by id.

**Success — 200** (single envelope):

```jsonc
{ "data": { /* Course */ } }
```

- Unknown id, or a non-listable (`draft`/`archived`) course → **404**.

## Error responses

All errors use the Specification 01 envelope and are sanitised (no internals):

```jsonc
{ "error": { "code": "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL",
             "message": "human-readable",
             "details"?: [ /* field issues for validation */ ] } }
```

- **400 `VALIDATION_ERROR`** — invalid query/path params (unknown enum value,
  non-integer/negative `page`/`pageSize`, `pageSize > 48`, empty `:courseId`).
- **404 `NOT_FOUND`** — unknown or non-listable course id.
- **500 `INTERNAL`** — unexpected error (mapped by the centralised handler).

## Course model (fields)

`id`, `code`, `title`, `shortDescription`, `description`, `discipline`,
`category`, `courseType`, `level`, `durationWeeks`, `deliveryMode`, `intake`,
`startDate` (ISO), `applicationDeadline` (ISO), `fee`, `currency`, `eligibility`,
`entryRequirements[]`, `skills[]`, `status`, `availability`, `tags[]`.

**Status vs availability:** `status` is the offering lifecycle (only `published`
is publicly listable by default); `availability` is whether a learner can act now
(`open`/`closing_soon`/`closed`/`waitlist`) and is an explicit structured field,
never inferred from presentation.

## Synthetic data

`server/src/data/courses.json` contains **27 fictional courses** across twelve
disciplines with a spread of course types, delivery modes, levels, durations,
intakes, and availabilities. 25 are `published`; one `draft` and one `archived`
record exercise the listability rule (they are excluded from the catalogue and
return 404 on direct lookup). Every record is validated against the Course schema
at startup; invalid data fails fast.

## Frontend

- Route: `/lifelong-learning/courses` — heading, intro, search, filters, sort,
  result count, responsive card grid, and pagination.
- Route: `/lifelong-learning/courses/[courseId]` — a **minimal** details page so
  "View Details" navigation works end to end (rich details are a later spec).
- States: loading, success, empty (with reset), and error (with retry),
  announced via `aria-live`.
- Accessibility: labelled controls, keyboard operability, visible focus,
  semantic markup, availability conveyed with text + glyph (not colour alone),
  and pagination as an accessible navigation region.

## Running & testing

From `App/`:

```bash
npm run dev          # client :3000, server :4000
npm run typecheck    # strict TS, both workspaces
npm run lint         # ESLint, both workspaces
npm run test         # Vitest unit/API (server) + component tests (client)
npm run build        # build server then client
```

Manual check: open <http://localhost:3000/lifelong-learning/courses>, then
search, filter, sort, paginate, and open a course's details.

Example API calls:

```bash
curl "http://localhost:4000/api/courses?keyword=cyber&sort=relevance"
curl "http://localhost:4000/api/courses?discipline=Cybersecurity&deliveryMode=online"
curl "http://localhost:4000/api/courses/cyber-essentials-pt"
```

## Future extensibility (future phase — not implemented)

The Course Service is deliberately decoupled from HTTP and React. This is simply
good application design; it also means a **future, separate** specification could
reuse `CourseService.search(...)` / `CourseService.getById(...)` when exposing
selected capabilities as AI-agent / WebMCP tools. **No** agent, WebMCP, MCP,
tool-registry, permission, or AI-model functionality is implemented in this
specification — the **Agent-Ready / WebMCP transformation remains a future
phase.**
