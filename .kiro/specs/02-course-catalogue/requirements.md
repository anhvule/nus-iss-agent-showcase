# Specification 02 — Course Catalogue (Human Website Capability) · Requirements

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 02-course-catalogue
**Status:** Draft for implementation (revised — human-first)
**Builds on:** `.kiro/specs/01-foundation/` (approved, implemented)
**Related steering:** `.kiro/steering/product.md`, `architecture.md`, `coding-standards.md`, `security.md`, `testing.md`

---

## 0. Revision note (why this specification changed)

The project is delivered in **two clearly separated phases**:

- **Phase 1 — Human-facing education website (current focus).** Build a complete,
  realistic education website for normal human users: catalogue, search,
  filtering, sorting, course details, comparison, and enquiry.
- **Phase 2 — Agent-Ready Transformation (later, separate specification).** Only
  **after** the human website is complete, a future Kiro specification will
  analyse the finished application, discover its existing capabilities, and expose
  selected ones as structured AI-agent / WebMCP capabilities.

This document was previously framed as an "agent-ready" specification. It has been
**revised to describe a normal human-facing Course Catalogue only.** All AI-agent,
WebMCP, tool-schema, registry, permission, and agent-orchestration concerns have
been removed from scope and consolidated into a single, clearly-separated
**Future Transformation** note (§16). Nothing in Phase 2 is designed or built
here.

The guiding principle is: **build good normal application capabilities first;
transform them later.**

## 1. Purpose

Specification 02 delivers the **Course Catalogue** — the first substantial
business capability of the human website: **course discovery**. It provides
synthetic course data, a course domain model, the backend layering
(repository → service → controller → REST API) for searching, filtering, sorting,
and paginating courses, and the frontend catalogue experience (listing, search,
filters, sort, pagination, with loading/empty/error states) plus navigation to a
course details page.

It builds directly on the Specification 01 foundation (Express app, Zod
validation boundary, structured errors, Pino logging, Helmet/CORS, the Next.js
App Router shell, UI primitives, and the client transport/API boundary) and does
not duplicate any of it.

## 2. Business Context

On a traditional education website, a learner discovers courses by navigating to
the courses area, searching, applying filters, scanning results, and opening a
course to read details. This specification implements that everyday human
experience as a clean, well-structured application capability.

Course discovery is implemented as a normal backend **Course Service** with a
stable REST API. The frontend catalogue consumes that API. Business logic lives
in the service layer (not in React components, not in the data file), following
the architecture established by Specification 01. This clean separation is simply
good application design; it also happens to make the capability straightforward to
reuse later (see §16), but no future-agent abstractions are introduced now.

## 3. Relationship to RP Reference Experience

Republic Polytechnic (`https://www.rp.edu.sg`) is used **only** as a functional
and information-architecture reference — it illustrates that an education platform
offers course discovery, search, filtering, course information, and onward
enquiry/application journeys within a lifelong-learning area.

EduAgent Connect reproduces the *functional shape* of that experience with an
**original design and entirely synthetic data**. This specification does not
scrape RP, connect to RP, use RP APIs or production data, or copy RP source code,
branding, logos, images, CSS, or exact content. Course titles, descriptions, and
all attributes are fictional.

## 4. Problem Statement

The Specification 01 foundation established the website shell and a placeholder
"Lifelong Learning" section, but there is no way for a learner to actually
discover courses. There is no course data, no catalogue page, and no API to serve
courses.

Specification 02 solves this by implementing course discovery end to end: a
validated synthetic dataset, a repository and service that own data access and
business rules, a REST API, and an accessible, responsive catalogue UI that lets a
learner search, filter, sort, page through results, and open a course's details.

## 5. Scope

### 5.1 In Scope

- Course domain model and validation rules.
- A dataset of ~20–30 synthetic courses.
- Course repository (data access over synthetic data).
- Course service (business rules: search, filter, sort, paginate, status/availability).
- Course controller + REST API: `GET /api/courses`, `GET /api/courses/:courseId`.
- Query-parameter validation and structured error responses (Zod), reusing the
  Specification 01 validation and error-handling foundation.
- Frontend catalogue page at `/lifelong-learning/courses`: heading, intro,
  search input, filter controls, sort control, course count, course grid,
  pagination, and loading/empty/error states.
- Course card component showing key attributes with a "View Details" affordance.
- Navigation from a course card to a course details **route** (a minimal details
  placeholder page is created so navigation works end to end; rich details content
  is Specification 03).
- Responsive layout and accessibility baseline for the catalogue.
- Unit tests (repository, service, search, filter, sort, pagination), API tests
  (both endpoints, validation, errors), and frontend tests (catalogue states).

### 5.2 Out of Scope (see §17)

Rich course details page content and course comparison (Specification 03); enquiry
/ application / register-interest workflow (Specification 04); authentication;
database/persistence; any RP integration; and **all** AI-agent / WebMCP / MCP /
agent-tool / AI-model functionality (Phase 2, a future specification — see §16).

## 6. User Personas

| ID  | Persona | Need in Spec 02 |
| --- | ------- | --------------- |
| P1  | Prospective Learner (Human) | Quickly discover relevant courses via search/filter/sort, understand each course from a card, page through results, and open a course's details. |
| P2  | Working Professional (Human) | Find part-time/short courses in a discipline of interest and assess suitability (delivery mode, duration, fee, intake, availability). |
| P3  | Developer / Implementer | A clean repository → service → controller → API implementation to extend in Specifications 03/04. |
| P4  | Accessibility / QA Reviewer | A keyboard- and screen-reader-usable catalogue with clear status messaging. |
| P5  | Solution Architect / Stakeholder | Evidence of a well-structured, realistic website capability with clean layer separation. |

## 7. User Journey

**Human journey (this spec):**

```
Learner → Lifelong Learning → Course Catalogue → Search / Filter / Sort
        → paged results → selects a Course → Course Details (rich content in Spec 03)
```

## 8. Functional Requirements

EARS-style where appropriate.

### Domain & Data
- **FR-201** The system shall define a strongly-typed Course domain model with the
  fields enumerated in design §3, including a clear distinction between course
  **status** and course **availability**.
- **FR-202** The system shall provide a synthetic dataset of approximately 20–30
  fictional courses spanning multiple disciplines, course types, delivery modes,
  levels, durations, statuses, and intakes.
- **FR-203** The system shall validate every course record against the domain
  schema so that malformed data cannot enter the catalogue.

### Repository & Service
- **FR-204** The system shall provide a Course Repository that exposes data-access
  operations (retrieve all, retrieve by id) without embedding business rules.
- **FR-205** The system shall provide a Course Service that owns all catalogue
  business logic (search, filter, sort, pagination, status/availability) and is
  callable independently of HTTP and of React components.
- **FR-206** When given a course id, the Course Service shall return the matching
  course or a well-typed "not found" result.

### Listing & Detail API
- **FR-207** The system shall expose `GET /api/courses` returning a paginated,
  filtered, sorted, optionally keyword-searched list of courses.
- **FR-208** The system shall expose `GET /api/courses/:courseId` returning a
  single course by id.
- **FR-209** The listing and detail endpoints shall return a **consistent API
  response envelope** (design §9) for both success and error.
- **FR-210** When `GET /api/courses/:courseId` is called with an id that does not
  exist, the system shall respond with HTTP 404 and a structured error payload.
- **FR-211** When any endpoint receives invalid query/path parameters, the system
  shall respond with HTTP 400 and a structured validation-error payload, without
  leaking internals.

### Frontend
- **FR-212** The system shall provide a Course Catalogue page at
  `/lifelong-learning/courses` containing a heading, introductory content, search
  input, filter controls, sort control, course count, a responsive course
  grid/list, and pagination controls.
- **FR-213** The catalogue shall render each course as a card showing: title,
  discipline, course type, delivery mode, duration, next intake, fee, and
  availability/status, plus a "View Details" affordance — without overloading the
  card.
- **FR-214** While a request is in flight, the catalogue shall show a **loading
  state**; when no courses match, it shall show an **empty state**; when the
  request fails, it shall show an **error state** with a retry affordance.
- **FR-215** When the learner changes search, filters, sort, or page, the
  catalogue shall reflect the updated, server-computed results.
- **FR-216** The catalogue UI shall contain no business logic and shall not access
  the synthetic data source directly; it shall derive all results from the Course
  API.
- **FR-217** When the learner activates "View Details" on a course, the system
  shall navigate to that course's details route (`/lifelong-learning/courses/:courseId`).

## 9. Course Search Requirements

- **FR-220** The system shall support keyword search across: `title`,
  `shortDescription`, `description`, `discipline`, `category`, `skills`, and
  `tags`.
- **FR-221** Keyword search shall be **case-insensitive** and shall use **partial
  (substring) matching** on the searchable fields.
- **FR-222** When the keyword is empty or omitted, the system shall treat search
  as "match all" (no keyword constraint applied).
- **FR-223** When no course matches the keyword (in combination with any filters),
  the system shall return an empty result set with valid pagination metadata (not
  an error).
- **FR-224** Search behaviour shall be **deterministic**: identical inputs always
  produce identical results and ordering.

> MVP constraint: search is a straightforward substring match. No search engine,
> stemming, fuzzy matching, or ranking service is introduced.

## 10. Course Filtering Requirements

- **FR-230** The system shall support filtering by: `discipline`, `category`,
  `courseType`, `level`, `deliveryMode`, `status`, and `availability`.
- **FR-231** Filters shall be expressible as query parameters, e.g.
  `GET /api/courses?discipline=Cybersecurity`.
- **FR-232** When multiple different filters are provided, the system shall combine
  them with **AND** semantics (a course must satisfy all provided filters).
- **FR-233** When a single filter parameter provides multiple values (e.g.
  repeated or comma-separated), the system shall combine those values with **OR**
  semantics within that field (a course matches if it satisfies any provided
  value).
- **FR-234** Filters shall combine with keyword search using AND semantics
  (results satisfy the keyword **and** all filters).
- **FR-235** When a filter value is not a recognised enum member, the system shall
  respond with an HTTP 400 validation error.

## 11. Course Sorting Requirements

- **FR-240** The system shall support sorting by: `relevance` (default when a
  keyword is present), `title`, `duration`, `fee`, and `startDate`.
- **FR-241** The system shall support sort direction `asc`/`desc` where meaningful,
  with documented defaults per field (design §12).
- **FR-242** `relevance` shall be a **simple, deterministic** score: a course
  ranks higher when the keyword matches higher-weight fields (e.g. title/skills)
  than lower-weight fields (e.g. description), with a stable tiebreaker (`title`
  ascending, then `id`). No probabilistic or ML ranking is used.
- **FR-243** When no keyword is present, the default sort shall be `title`
  ascending (since `relevance` has no keyword to score against).
- **FR-244** Sorting shall be deterministic and stable for identical inputs.

## 12. Pagination Requirements

- **FR-250** The system shall paginate listing results using `page` (1-based) and
  `pageSize`.
- **FR-251** The system shall apply defaults `page = 1` and `pageSize = 12` when
  the parameters are omitted.
- **FR-252** The system shall enforce a **maximum `pageSize` of 48**; requests
  above the maximum shall be rejected with an HTTP 400 validation error.
- **FR-253** The system shall reject non-positive or non-integer `page`/`pageSize`
  values with an HTTP 400 validation error.
- **FR-254** The listing response shall include pagination metadata: `page`,
  `pageSize`, `totalItems`, and `totalPages`.
- **FR-255** When `page` exceeds `totalPages`, the system shall return an empty
  `data` array with correct metadata (not an error).

## 13. Course Status & Availability Requirements

- **FR-260** The system shall model course **status** (lifecycle of the offering,
  e.g. `published`, `draft`, `archived`) separately from **availability** (whether
  learners can currently act on it, e.g. `open`, `closing_soon`, `closed`,
  `waitlist`).
- **FR-261** The catalogue shall by default surface only courses whose status makes
  them publicly listable (e.g. `published`).
- **FR-262** The system shall expose `availability` as an explicit, structured
  field in API responses so the UI never infers it from presentation.
- **FR-263** Status and availability rules shall be enforced in the Course Service
  (not in the UI), giving one consistent source of truth for listability.

## 14. Non-Functional Requirements

- **NFR-201 (Performance)** Listing queries over the synthetic dataset shall
  respond in well under 100 ms locally; the catalogue page shall render its first
  meaningful content quickly.
- **NFR-202 (Maintainability)** Code shall follow `.kiro/steering/coding-standards.md`
  (layer separation, naming, no business logic in the UI).
- **NFR-203 (Type Safety)** All new code shall compile under TypeScript strict
  mode with zero errors; shared course types shall be a single source of truth.
- **NFR-204 (Testability)** The Course Service and Repository shall be unit-testable
  without HTTP or a browser (substitutable data source).
- **NFR-205 (Accessibility)** The catalogue shall meet a WCAG 2.1 AA-oriented
  baseline (see §Accessibility requirements). Full conformance requires later
  manual assistive-technology testing.
- **NFR-206 (Security)** All external input shall be Zod-validated at the boundary;
  errors shall be sanitised; Helmet/CORS from Spec 01 shall apply; no secrets or
  PII in logs.
- **NFR-207 (API Consistency)** All endpoints shall use the consistent response
  envelope and error shape established in Spec 01.
- **NFR-208 (Replaceable data source)** The repository interface shall allow the
  synthetic JSON source to be replaced later (e.g. by a database) without changing
  the Service contract.
- **NFR-209 (Deterministic behaviour)** Given identical inputs, search, filter,
  sort, and pagination shall always yield identical outputs and ordering.
- **NFR-210 (Observability)** Requests to course endpoints shall be logged with the
  Spec 01 structured logger (method, path, status, duration), without secrets/PII.
- **NFR-211 (Error handling)** All failure modes (invalid input, not found,
  unexpected) shall map to consistent, sanitised HTTP responses.

### Frontend responsive requirements
- **NFR-212** The catalogue shall be usable at mobile (≈320–480 px), tablet
  (≈481–1024 px), and desktop (>1024 px) widths, with the course grid adapting
  column count to viewport, and with filters, search, and pagination remaining
  usable on small screens (not merely a shrunken desktop layout).

### Accessibility requirements
- **NFR-213** All interactive controls (search, filters, sort, pagination, card
  actions) shall be keyboard operable with visible focus states.
- **NFR-214** Form controls shall have programmatic labels; the course grid shall
  use semantic markup; result-count and state changes shall be announced via an
  `aria-live` region.
- **NFR-215** Colour contrast shall meet AA; information (e.g. availability) shall
  not be conveyed by colour alone.
- **NFR-216** Pagination shall be an accessible navigation region with clear
  current-page indication.

## 15. Acceptance Criteria

Given / When / Then.

- **AC-201 (Catalogue) — FR-212, FR-214**
  *Given* the learner visits `/lifelong-learning/courses`, *when* the page loads,
  *then* listable courses are displayed (or an empty state if none), with a course
  count and pagination.

- **AC-202 (Search) — FR-220–FR-224**
  *Given* courses exist, *when* the learner searches for "cybersecurity", *then*
  only courses matching that keyword (case-insensitive, partial) are returned,
  deterministically.

- **AC-203 (Filtering) — FR-230–FR-232**
  *Given* multiple courses exist, *when* the learner selects a discipline filter,
  *then* only courses in that discipline are displayed.

- **AC-204 (Combined filters) — FR-232, FR-234**
  *Given* multiple filters are selected, *when* they are applied, *then* results
  satisfy **all** applicable filters (and the keyword, if any).

- **AC-205 (Pagination) — FR-250–FR-254**
  *Given* more courses exist than the page size, *when* the learner moves to page
  2, *then* the next result set is displayed with correct metadata.

- **AC-206 (No results) — FR-223, FR-214**
  *Given* no course matches, *when* the search/filter is applied, *then* an
  appropriate empty state is shown (not an error).

- **AC-207 (Invalid API input) — FR-211, FR-252, FR-253**
  *Given* an invalid `pageSize` (e.g. 0 or 9999), *when* `GET /api/courses` is
  called, *then* the API returns HTTP 400 with a structured validation error.

- **AC-208 (Course lookup) — FR-208**
  *Given* a valid course id, *when* `GET /api/courses/:courseId` is called, *then*
  the correct course is returned in the standard envelope.

- **AC-209 (Missing course) — FR-210**
  *Given* an unknown course id, *when* the API is called, *then* HTTP 404 with a
  structured error is returned.

- **AC-210 (Sorting) — FR-240–FR-244**
  *Given* results, *when* the learner sorts by `fee` ascending, *then* courses are
  ordered by fee ascending, deterministically and stably.

- **AC-211 (Status listability) — FR-261, FR-263**
  *Given* the status/availability rules, *when* results are produced, *then* only
  publicly listable courses appear, per the Course Service rule.

- **AC-212 (Details navigation) — FR-217**
  *Given* a course card, *when* the learner activates "View Details", *then* the
  app navigates to that course's details route.

- **AC-213 (Accessibility) — NFR-213–NFR-216**
  *Given* keyboard-only operation, *when* the learner uses search, filters, sort,
  and pagination, *then* all controls are reachable and operable with visible focus
  and announced state changes.

## 16. Future Transformation (Phase 2 — not in scope)

> This section is a **forward-looking note only**. Nothing here is designed or
> implemented in Specification 02.

Once the human website is complete (through the enquiry experience), a **future,
separate Kiro specification** will analyse the finished application, inventory its
existing capabilities, and expose selected ones as structured AI-agent / WebMCP
capabilities. That future work will conceptually:

```
Existing Human Website
   → Kiro analyses the existing application
   → discovers existing capabilities
   → creates a capability inventory
   → defines structured agent tools
   → adds a WebMCP adapter/registry
   → adds permissions and guardrails
   → integrates an AI agent
   → demonstrates agent interaction
```

The only thing Specification 02 does to support this is **normal good design**:
keeping business logic in the Course Service (decoupled from React and from HTTP)
so it can later be reused rather than rewritten. Specification 02 introduces **no**
`agent/`, `webmcp/`, `mcp/`, `tools/`, tool schemas, registries, permissions, or
AI-model code. Those decisions belong to the Phase 2 specification, which will
determine how existing capabilities are exposed.

## 17. Out of Scope

- **Rich course details page content** and **course comparison** → Specification 03
  (this spec provides `GET /api/courses/:courseId`, a "View Details" affordance,
  and a minimal details placeholder route so navigation works).
- **Enquiry / application / register-interest workflow** → Specification 04.
- **Authentication, authorization, database/persistence** → later specifications
  if ever required.
- **All AI-agent, WebMCP, MCP, agent-tool, agent-permission, agent-orchestration,
  and AI-model functionality** → Phase 2 (a future specification; see §16).
- **Any Republic Polytechnic integration, scraping, API use, production data,
  assets, or branding.**

## 18. Reconciliation with the Cancelled Implementation

An earlier attempt to implement this specification was **cancelled**. It created
backend artifacts only; no catalogue UI was created. The following files exist and
are **human-website-focused, contain no agent/WebMCP concepts, and are reusable**:

- `App/server/src/domain/course.ts` — Course model, enum constants, and Zod schema.
  Reusable as-is (matches design §3–§4).
- `App/server/src/data/courses.json` — ~27 synthetic fictional courses (25
  publishable + a draft and an archived record to exercise the listability rule).
  Reusable as-is.
- `App/server/src/data/course-data.ts` — validating loader that fails fast on
  invalid data. Reusable as-is.
- `App/server/src/data/README.md` — updated note describing the dataset. Reusable.

No cancelled artifact introduces agent/WebMCP/MCP/AI concepts, so none needs to be
removed for this revised specification. The implementing engineer should **verify
these against this revised spec and reuse them** rather than recreating them. All
other course capability pieces (repository, service, controller, routes, and the
entire catalogue UI) remain **to be implemented**.
