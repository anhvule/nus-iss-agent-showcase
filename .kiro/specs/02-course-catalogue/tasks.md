# Specification 02 — Course Catalogue (Human Website Capability) · Tasks

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 02-course-catalogue
**Traceability:** Each task references requirements in `./requirements.md` and design sections in `./design.md`.

Priority values: **High** · **Medium** · **Low**.
Tasks are small enough to implement and verify independently. There is no single
"build the catalogue" task. **No task here implements WebMCP, agents, MCP, agent
tools, or AI models** — those belong to a future Phase 2 specification.

---

## PHASE 0 — Inspect & Reconcile Cancelled Implementation

### TASK-200
Priority: High
Dependency: Specification 01 Foundation
Description: Inspect the artifacts left by the cancelled implementation and reconcile them against this revised spec. Confirm `App/server/src/domain/course.ts`, `App/server/src/data/courses.json`, `App/server/src/data/course-data.ts`, and `App/server/src/data/README.md` match design §3–§5 and contain no agent/WebMCP concepts. Reuse them as-is; do not recreate or delete.
Expected Outcome: A short reconciliation confirming which files are reused as-is and which pieces remain to be built (repository, service, controller, routes, UI, tests, docs). Satisfies requirements §18, design §16.

---

## PHASE 1 — Course Domain Model

### TASK-201
Priority: High
Dependency: TASK-200
Description: Confirm/finalise the shared, strongly-typed Course model and enum constants (discipline, category, courseType, level, deliveryMode, status, availability) as the single source of truth, per design §3–§4. Reuse the existing `domain/course.ts` if valid.
Expected Outcome: A reusable `Course` type and enum sets are importable by repository, service, API, and client types; status and availability are distinct. Satisfies FR-201.

### TASK-202
Priority: High
Dependency: TASK-201
Description: Confirm/finalise the Course Zod schema and validation rules (non-empty ids/title, positive `durationWeeks`, non-negative `fee`, valid ISO dates, constrained enums, array defaults). Reuse the existing schema if valid.
Expected Outcome: Courses can be validated; invalid records are rejected. Satisfies FR-203.

---

## PHASE 2 — Synthetic Course Data

### TASK-203
Priority: High
Dependency: TASK-202
Description: Confirm/finalise the synthetic dataset of ~20–30 fictional courses across the listed disciplines, with a spread of courseType, deliveryMode, level, durationWeeks, status (incl. a few non-published), availability, and intakes. Original content only; no RP data. Reuse the existing `courses.json` if valid.
Expected Outcome: A validated JSON fixture exists covering the required variety. Satisfies FR-202.

### TASK-204
Priority: Medium
Dependency: TASK-203
Description: Confirm/finalise the data loader that reads the fixture, validates every record against the Course schema at startup, and fails fast on invalid data. Reuse the existing `course-data.ts` if valid.
Expected Outcome: The dataset loads once, validated and cached. Supports FR-203, NFR-201.

---

## PHASE 3 — Course Repository

### TASK-205
Priority: High
Dependency: TASK-204
Description: Implement the `CourseRepository` interface with `findAll()` and `findById(id)` over the validated in-memory dataset. No business rules in the repository.
Expected Outcome: Data access is isolated behind an interface; swappable later. Satisfies FR-204, NFR-208.

---

## PHASE 4 — Course Service

### TASK-206
Priority: High
Dependency: TASK-205
Description: Define the transport-agnostic Service contract (`CourseQuery`, `CourseListResult`) and the `CourseService` interface (`search`, `getById`), per design §6. No Express/React coupling.
Expected Outcome: A UI/HTTP-independent capability contract exists. Satisfies FR-205.

### TASK-207
Priority: High
Dependency: TASK-206
Description: Implement the listability rule (default `status = published`) centrally in the Service.
Expected Outcome: Non-listable courses are excluded consistently. Satisfies FR-261, FR-263.

### TASK-208
Priority: High
Dependency: TASK-206
Description: Implement keyword search (case-insensitive, partial) across title, shortDescription, description, discipline, category, skills, tags; empty keyword = match all.
Expected Outcome: Deterministic keyword search. Satisfies FR-220–FR-224.

### TASK-209
Priority: High
Dependency: TASK-206
Description: Implement filtering with AND across fields and OR within a multi-valued field, combined with keyword via AND.
Expected Outcome: Combinable, predictable filters. Satisfies FR-230–FR-234.

### TASK-210
Priority: High
Dependency: TASK-208
Description: Implement sorting (title, duration, fee, startDate) and a deterministic weighted `relevance` score with stable tiebreakers; default sort = relevance with keyword else title asc.
Expected Outcome: Deterministic, stable ordering. Satisfies FR-240–FR-244.

### TASK-211
Priority: High
Dependency: TASK-209, TASK-210
Description: Implement pagination (defaults, max pageSize 48, totals, page-beyond-range → empty) computed after search/filter/sort.
Expected Outcome: Correct pagination metadata and slicing. Satisfies FR-250–FR-255.

### TASK-212
Priority: High
Dependency: TASK-207
Description: Implement `getById` returning a course or a typed not-found result, honouring listability rules.
Expected Outcome: Single-course retrieval works. Satisfies FR-206, FR-260–FR-262.

---

## PHASE 5 — Course API Controller

### TASK-213
Priority: High
Dependency: TASK-211
Description: Add the Course Controller mapping validated query params to a `CourseQuery`, calling the Service, and returning the list envelope; and a handler returning the single-course envelope or 404. HTTP concerns only.
Expected Outcome: Controller translates HTTP ↔ Service and shapes the consistent envelope. Satisfies FR-207, FR-208, FR-209, FR-254, FR-262.

---

## PHASE 6 — Course API Routes

### TASK-214
Priority: High
Dependency: TASK-213
Description: Register `GET /api/courses` and `GET /api/courses/:courseId` under the Spec 01 `/api` composition, wiring the controller and the `validate` middleware.
Expected Outcome: Both endpoints are reachable and return the standard envelope. Satisfies FR-207, FR-208.

### TASK-215
Priority: Medium
Dependency: TASK-214
Description: Ensure course endpoint requests are logged via the Spec 01 structured logger (method, path, status, duration), no secrets/PII.
Expected Outcome: Course API calls are observable. Satisfies NFR-210.

---

## PHASE 7 — Search (API validation)

### TASK-216
Priority: High
Dependency: TASK-214
Description: Implement Zod validation for the `keyword` param and confirm search results flow through the envelope; invalid types → 400.
Expected Outcome: Keyword search is validated and served. Satisfies FR-220, FR-211.

---

## PHASE 8 — Filtering (API validation)

### TASK-217
Priority: High
Dependency: TASK-214
Description: Implement Zod validation for filter params (discipline, category, courseType, level, deliveryMode, status, availability) as repeatable/CSV enums; unknown enum value → 400.
Expected Outcome: Filters are validated and combinable. Satisfies FR-230, FR-231, FR-235, NFR-206.

---

## PHASE 9 — Sorting (API validation)

### TASK-218
Priority: High
Dependency: TASK-214
Description: Implement Zod validation for `sort` and `direction` params with documented defaults; invalid values → 400.
Expected Outcome: Sorting is validated and applied. Satisfies FR-240, FR-241, FR-243, FR-211.

---

## PHASE 10 — Pagination (API validation & errors)

### TASK-219
Priority: High
Dependency: TASK-214
Description: Implement Zod validation for `page`/`pageSize` (1-based; max 48; positive integers), returning 400 for invalid values; validate `:courseId` shape (→ 400) and ensure not-found → 404, wiring unexpected errors to the Spec 01 centralised handler (→ sanitised 500).
Expected Outcome: All course endpoint failure modes map to consistent sanitised responses. Satisfies FR-210, FR-211, FR-252, FR-253, FR-254, NFR-207, NFR-211.

---

## PHASE 11 — Course Catalogue UI

### TASK-220
Priority: High
Dependency: TASK-214
Description: Create the catalogue route `/lifelong-learning/courses` with page heading and introductory content, wired into the Spec 01 shell/navigation.
Expected Outcome: The catalogue page exists at the canonical route. Satisfies FR-212, AD-208.

### TASK-221
Priority: High
Dependency: TASK-220
Description: Add a `coursesApi` client over the Spec 01 client transport/API boundary to call the Course API with structured params; no business logic in the client, no direct data-source access.
Expected Outcome: Frontend fetches structured results from the API. Satisfies FR-215, FR-216.

### TASK-222
Priority: High
Dependency: TASK-221
Description: Implement `CourseGrid` and `CourseCount` (count in an aria-live region) rendering the fetched page of courses responsively.
Expected Outcome: Results render as an accessible, responsive grid with a live count. Satisfies FR-212, NFR-212, NFR-214.

---

## PHASE 12 — Course Cards

### TASK-223
Priority: High
Dependency: TASK-222
Description: Implement `CourseCard` showing title, discipline, courseType, deliveryMode, duration, next intake, fee, availability/status, and a "View Details" affordance (not overloaded).
Expected Outcome: Learners understand a course from the card. Satisfies FR-213.

---

## PHASE 13 — Search / Filter / Sort Controls

### TASK-224
Priority: High
Dependency: TASK-221
Description: Implement `CourseSearchBar` bound to the `keyword` query param, updating results on submit/change (debounced).
Expected Outcome: Keyword search drives API results. Satisfies FR-215, FR-220.

### TASK-225
Priority: High
Dependency: TASK-221
Description: Implement `CourseFilters` for discipline, category, courseType, level, deliveryMode, availability (and status where relevant), derived from the shared enum constants; multiple selections map to structured params.
Expected Outcome: Filter controls produce structured, combinable query params. Satisfies FR-230–FR-234.

### TASK-226
Priority: High
Dependency: TASK-221
Description: Implement `CourseSortControl` for relevance/title/duration/fee/startDate with direction, mapping to sort params and defaults.
Expected Outcome: Sorting changes result order via the API. Satisfies FR-240–FR-243.

### TASK-227
Priority: High
Dependency: TASK-222
Description: Implement accessible `Pagination` (previous/next, page information, disabled states, current-page indication, aria labels) bound to `page`/`pageSize`.
Expected Outcome: Learners can navigate result pages accessibly. Satisfies FR-250, FR-254, NFR-216.

### TASK-228
Priority: Medium
Dependency: TASK-224, TASK-225, TASK-226, TASK-227
Description: Optionally reflect the structured query (keyword/filters/sort/page) in the URL query string for shareable results.
Expected Outcome: Catalogue state is deep-linkable. Supports FR-215 (progressive enhancement).

---

## PHASE 14 — Loading / Empty / Error States

### TASK-229
Priority: High
Dependency: TASK-222
Description: Implement loading, empty (with reset filters), and error (with retry) states as a discriminated union, announced via aria-live.
Expected Outcome: All catalogue states render clearly and accessibly. Satisfies FR-214, NFR-211, NFR-214.

---

## PHASE 15 — Course Details Navigation

### TASK-230
Priority: High
Dependency: TASK-223, TASK-214
Description: Wire "View Details" to navigate to `/lifelong-learning/courses/[courseId]`, and add a **minimal** details placeholder page that fetches the course via `GET /api/courses/:courseId` and shows a not-found state for unknown ids. Rich details content is Specification 03.
Expected Outcome: Learners can navigate from a card to a working details route. Satisfies FR-217, FR-208, FR-210.

---

## PHASE 16 — Accessibility & Responsive

### TASK-231
Priority: High
Dependency: TASK-222, TASK-224, TASK-225, TASK-226, TASK-227
Description: Apply responsive layout (grid column adaptation; usable filters/search/pagination on small screens, not a shrunken desktop) and the accessibility baseline (labelled controls, keyboard operability, visible focus, semantic markup, aria-live status, AA contrast, availability not by colour alone).
Expected Outcome: Catalogue is usable across breakpoints and meets the accessibility baseline. Satisfies NFR-205, NFR-212–NFR-216.

---

## PHASE 17 — Tests

### TASK-232
Priority: High
Dependency: Specification 01 Foundation
Description: Introduce test tooling (Vitest for unit/frontend, supertest for API) pinned to exact versions, with npm scripts, without adding unnecessary dependencies.
Expected Outcome: A test runner is available for both workspaces. Supports NFR-204.

### TASK-233
Priority: High
Dependency: TASK-205, TASK-232
Description: Unit-test the repository (fixture load/validate; findById hit/miss).
Expected Outcome: Repository behaviour verified. Satisfies NFR-204; verifies FR-204.

### TASK-234
Priority: High
Dependency: TASK-208, TASK-209, TASK-210, TASK-211, TASK-232
Description: Unit-test the service: search (case-insensitive/partial/empty/no-match), filters (single, AND-across, OR-within, combined), sorting (each field + relevance + stable tiebreak), pagination (defaults/boundaries/beyond-range/totals), listability rule.
Expected Outcome: Core business logic verified and deterministic. Verifies FR-220–FR-255, FR-261, NFR-209.

### TASK-235
Priority: High
Dependency: TASK-214, TASK-216, TASK-217, TASK-218, TASK-219, TASK-232
Description: API-test `GET /api/courses` (happy, search, filters, sort, pagination, empty), validation errors → 400, and `GET /api/courses/:courseId` (200/404/400), plus envelope consistency.
Expected Outcome: API contract verified. Verifies FR-207–FR-211, FR-252, FR-253, NFR-207.

### TASK-236
Priority: Medium
Dependency: TASK-222, TASK-224, TASK-225, TASK-226, TASK-227, TASK-229, TASK-230, TASK-232
Description: Frontend-test search, filtering, sorting, pagination, loading/empty/error states, and details navigation, plus basic accessibility assertions (labels, focus, aria-live).
Expected Outcome: Catalogue UI behaviour and states verified. Verifies FR-212–FR-217, NFR-213–NFR-216.

---

## PHASE 18 — Documentation

### TASK-237
Priority: Medium
Dependency: TASK-214
Description: Document the Course capability and API contract (endpoints, params, envelope, errors) in `App/docs`, referencing this spec. State clearly that the Course Catalogue is implemented now, while WebMCP / AI agent / enquiry are future work.
Expected Outcome: The course capability is documented for implementers and stakeholders. Satisfies NFR-202.

### TASK-238
Priority: Low
Dependency: TASK-237
Description: Update the root README to mention the Course Catalogue capability and route, keeping guardrails (synthetic data, no RP integration) visible and not implying WebMCP/agent functionality exists.
Expected Outcome: README reflects the new human capability. Supports Definition of Done.

---

## PHASE 19 — Validation

### TASK-239
Priority: High
Dependency: TASK-233, TASK-234, TASK-235, TASK-236
Description: Run `npm run typecheck` and `npm run lint` for both workspaces and resolve issues.
Expected Outcome: Zero type errors and lint warnings. Satisfies NFR-203.

### TASK-240
Priority: High
Dependency: TASK-239
Description: Boot the app and verify catalogue, search, filters, sort, pagination, states, details navigation, and both API endpoints end to end. (Production build may be run per project preference.)
Expected Outcome: The catalogue works end to end. Verifies AC-201–AC-213.

### TASK-241
Priority: High
Dependency: TASK-240
Description: Verify scope boundaries: no WebMCP/agent/AI/MCP code, no enquiry/auth/database, synthetic data only, no RP integration or copyrighted assets; verify Spec 01 regression (home, navigation, health). Check the Definition of Done checklist.
Expected Outcome: Scope intact; Spec 01 unbroken; Definition of Done satisfied.

---

## Traceability — Requirements → Tasks

| Requirement | Task(s) |
| ----------- | ------- |
| FR-201 | TASK-201 |
| FR-202 | TASK-203 |
| FR-203 | TASK-202, TASK-204 |
| FR-204 | TASK-205, TASK-233 |
| FR-205 | TASK-206 |
| FR-206 | TASK-212 |
| FR-207 | TASK-213, TASK-214 |
| FR-208 | TASK-214, TASK-230 |
| FR-209 | TASK-213 |
| FR-210 | TASK-219, TASK-230 |
| FR-211 | TASK-216, TASK-217, TASK-218, TASK-219 |
| FR-212 | TASK-220, TASK-222 |
| FR-213 | TASK-223 |
| FR-214 | TASK-229 |
| FR-215 | TASK-221, TASK-224, TASK-226, TASK-228 |
| FR-216 | TASK-221 |
| FR-217 | TASK-230 |
| FR-220 | TASK-208, TASK-216, TASK-224 |
| FR-221 | TASK-208 |
| FR-222 | TASK-208 |
| FR-223 | TASK-208, TASK-229 |
| FR-224 | TASK-208, TASK-234 |
| FR-230 | TASK-209, TASK-217, TASK-225 |
| FR-231 | TASK-217, TASK-225 |
| FR-232 | TASK-209, TASK-225 |
| FR-233 | TASK-209 |
| FR-234 | TASK-209 |
| FR-235 | TASK-217 |
| FR-240 | TASK-210, TASK-218, TASK-226 |
| FR-241 | TASK-210, TASK-218, TASK-226 |
| FR-242 | TASK-210 |
| FR-243 | TASK-210, TASK-218, TASK-226 |
| FR-244 | TASK-210 |
| FR-250 | TASK-211, TASK-227 |
| FR-251 | TASK-211 |
| FR-252 | TASK-211, TASK-219 |
| FR-253 | TASK-211, TASK-219 |
| FR-254 | TASK-211, TASK-213, TASK-219, TASK-227 |
| FR-255 | TASK-211 |
| FR-260 | TASK-201, TASK-212 |
| FR-261 | TASK-207 |
| FR-262 | TASK-212, TASK-213 |
| FR-263 | TASK-207 |
| NFR-201 | TASK-204, TASK-240 |
| NFR-202 | TASK-237 |
| NFR-203 | TASK-201, TASK-239 |
| NFR-204 | TASK-232, TASK-233 |
| NFR-205 | TASK-231 |
| NFR-206 | TASK-217 |
| NFR-207 | TASK-219, TASK-235 |
| NFR-208 | TASK-205 |
| NFR-209 | TASK-234 |
| NFR-210 | TASK-215 |
| NFR-211 | TASK-219, TASK-229 |
| NFR-212 | TASK-222, TASK-231 |
| NFR-213 | TASK-231, TASK-236 |
| NFR-214 | TASK-222, TASK-229, TASK-231 |
| NFR-215 | TASK-231 |
| NFR-216 | TASK-227, TASK-231 |

---

## Scope guard (explicitly NOT in this specification)

No task implements or designs: WebMCP, an MCP registry, agent tools, agent
permissions/guardrails, agent orchestration, AI-model integration, an AI agent,
agent-specific APIs or UI, the enquiry/application workflow, authentication, or a
database. These are future work (Phase 2 or later specifications).
