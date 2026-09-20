# Specification 04 — Human Course Comparison · Tasks

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 04-course-comparison
**Owner:** Developer/Team B
**Traceability:** Each task references requirements in `./requirements.md` and design sections in `./design.md`.

Priority: **High** · **Medium** · **Low**. Tasks are independently executable and
verifiable. **No task implements WebMCP, agents, MCP, tools, AI comparison,
ranking, scoring, or recommendations** (Phase 2). This specification is
**frontend-only**; it introduces no backend changes.

---

## PHASE 0 — Review & Alignment

### TASK-400
Priority: High · Dependency: Spec 02 (implemented)
Description: Review the shared Course model/type, label maps, `format.ts`,
`AvailabilityBadge`, `coursesApi`, the catalogue `CourseCard`, and Spec 01
primitives/shell. Confirm the shared contracts (requirements §11) and that no
Course-model change is required.
Completion: A short note confirming reused artifacts and that Spec 04 is
frontend-only, reuses the Course model, and adds no second data structure.
Satisfies FR-405, FR-415, NFR-401.

---

## PHASE 1 — Comparison State & Shared Interface

### TASK-401
Priority: High · Dependency: TASK-400
Description: Define and implement `ComparisonProvider` + `useComparison()` exposing
`items`, `add(course)`, `remove(id)`, `has(id)`, `clear()`, `count`, `isFull`, and
a `max` constant; mount the provider in the app shell so state is shared across
routes.
Completion: State is available across catalogue/details/comparison in a session.
Satisfies FR-406, FR-407, FR-408, FR-416, design §3.

### TASK-402
Priority: High · Dependency: TASK-401
Description: Implement **add-to-comparison** in the interface (identity = Course
`id`).
Completion: Adding a course places it in `items` and updates `count`. Satisfies
FR-401, FR-405. Verifies AC-401.

### TASK-403
Priority: High · Dependency: TASK-401
Description: Implement **remove-from-comparison** in the interface.
Completion: Removing a course updates `items`/`count`. Satisfies FR-402. Verifies
AC-402.

### TASK-404
Priority: High · Dependency: TASK-402
Description: Implement **duplicate prevention** (`add` is a no-op when `has(id)`).
Completion: Re-adding an existing course creates no duplicate. Satisfies FR-403.
Verifies AC-403.

### TASK-405
Priority: High · Dependency: TASK-402
Description: Implement the **comparison limit** (max 4): reject adds beyond the max
with an accessible message; expose `isFull`; never drop/replace existing entries.
Completion: The 5th add is prevented with a clear message; selection unchanged.
Satisfies FR-404. Verifies AC-404.

---

## PHASE 2 — Controls & Catalogue Integration

### TASK-406
Priority: High · Dependency: TASK-401
Description: Implement `AddToCompareButton` reflecting add/added/disabled(full)
states with accessible labels; wire it to `useComparison()`. Provide it for the
catalogue `CourseCard` (additive integration) and export it for Spec 03's optional
affordance.
Completion: The control adds/removes and reflects state; disabled-at-limit reason
is announced. Satisfies FR-401, FR-402, FR-403, FR-404, FR-416, NFR-404.

### TASK-407
Priority: Medium · Dependency: TASK-401
Description: Implement a `ComparisonBar`/"Compare (n)" affordance showing the
current count with a link to the comparison view.
Completion: The count is visible and links to the comparison view. Satisfies
FR-408.

---

## PHASE 3 — Comparison View

### TASK-408
Priority: High · Dependency: TASK-401
Description: Create the comparison route (e.g.
`app/lifelong-learning/courses/compare/page.tsx`) hosting `ComparisonView`;
ensure it does not collide with the `[courseId]` details route.
Completion: The comparison route renders. Satisfies FR-409, design §6.

### TASK-409
Priority: High · Dependency: TASK-408
Description: Implement `ComparisonView` + `ComparisonTable` rendering selected
courses side by side over the shared attributes (title, type, discipline/category,
delivery mode, duration, eligibility, fee+currency, intake, availability/status)
in an aligned structure; neutral presentation (no ranking/scoring). Populate from
`items`, refetching by id via `coursesApi.getById` only if needed.
Completion: Two+ selected courses compare side by side using only shared-model
attributes. Satisfies FR-410, FR-411, FR-415, NFR-406. Verifies AC-405.

### TASK-410
Priority: High · Dependency: TASK-409
Description: Implement per-course actions in the comparison view: **open details**
(Spec 03 route), **remove**, **enquire** (Spec 05 entry point), and a **return to
catalogue** affordance.
Completion: Each action navigates/updates correctly. Satisfies FR-412, FR-413.
Verifies AC-406, AC-407.

### TASK-411
Priority: High · Dependency: TASK-408
Description: Implement the **empty state** when `count === 0`, guiding the user to
add courses from the catalogue.
Completion: An empty comparison shows the empty state. Satisfies FR-414. Verifies
AC-408.

---

## PHASE 4 — Responsive & Accessibility

### TASK-412
Priority: High · Dependency: TASK-409
Description: Implement responsive comparison: side-by-side on desktop/tablet;
horizontal scroll within a bounded container and/or stacked per-course sections on
mobile.
Completion: Usable at mobile/tablet/desktop (not a broken/overflowing desktop
layout). Satisfies NFR-405. Verifies AC-410.

### TASK-413
Priority: High · Dependency: TASK-406, TASK-409
Description: Apply the accessibility baseline: table semantics with header
associations (and accessible stacked variant), keyboard-operable controls with
visible focus, `aria-live` for count/add/remove, availability not colour-only.
Completion: Keyboard-only operation works; associations and announcements verified.
Satisfies NFR-404. Verifies AC-411.

---

## PHASE 5 — Tests

### TASK-414
Priority: High · Dependency: TASK-402–TASK-405, TASK-232 (test tooling from Spec 02)
Description: Unit-test `useComparison`: add, remove, `has`, duplicate no-op, limit
at 4, `count`/`isFull`, `clear`, deterministic order.
Completion: State/interface rules verified. Verifies FR-401–FR-406, FR-416,
NFR-406.

### TASK-415
Priority: High · Dependency: TASK-406, TASK-409, TASK-410, TASK-411, TASK-414
Description: Component-test `AddToCompareButton` (add/added/disabled+announce) and
`ComparisonView` (side-by-side attributes, empty state, open-details/remove/enquire
navigation via stubbed router/link, accessibility). Fake the API client where
fetching by id is used.
Completion: Comparison UI and states verified. Verifies AC-401–AC-411 (UI parts),
NFR-404.

---

## PHASE 6 — Documentation

### TASK-416
Priority: Medium · Dependency: TASK-401, TASK-409
Description: Document the comparison feature and the **shared comparison
interface** (`useComparison()` signature, limit, duplicate rule) in `App/docs`, and
update `App/docs/phase-1-integration.md` to record the interface Spec 04 produces
(consumed by Spec 03) and the comparison route. State WebMCP/agent is a future
phase.
Completion: Docs reflect the feature and the shared interface. Satisfies
requirements §11.

---

## PHASE 7 — Validation

### TASK-417
Priority: High · Dependency: TASK-414, TASK-415
Description: Run `npm run typecheck`, `npm run lint`, and the client tests; resolve
issues. Manually verify: add/remove/duplicate/limit, comparison view side-by-side,
empty state, open details / enquire / back navigation, and responsive/a11y behaviour;
confirm Spec 01/02 regression (health, catalogue) and no backend changes.
Completion: Zero type/lint errors; tests pass; journeys verified; no regressions.
Satisfies NFR-402; validates AC-401–AC-411.

---

## Traceability — Requirements → Tasks

| Requirement | Task(s) |
| ----------- | ------- |
| FR-401 | TASK-402, TASK-406 |
| FR-402 | TASK-403, TASK-406 |
| FR-403 | TASK-404, TASK-406 |
| FR-404 | TASK-405, TASK-406 |
| FR-405 | TASK-400, TASK-402 |
| FR-406 | TASK-401 |
| FR-407 | TASK-401 |
| FR-408 | TASK-401, TASK-406, TASK-407 |
| FR-409 | TASK-408, TASK-409 |
| FR-410 | TASK-409 |
| FR-411 | TASK-409 |
| FR-412 | TASK-410 |
| FR-413 | TASK-410 |
| FR-414 | TASK-411 |
| FR-415 | TASK-400, TASK-409 |
| FR-416 | TASK-401, TASK-406, TASK-416 |
| NFR-401 | TASK-400, TASK-409 |
| NFR-402 | TASK-417 |
| NFR-403 | TASK-406–TASK-412 |
| NFR-404 | TASK-406, TASK-413, TASK-415 |
| NFR-405 | TASK-412 |
| NFR-406 | TASK-409, TASK-414 |
| NFR-407 | TASK-409 |
| NFR-408 | TASK-414, TASK-415 |

---

## Scope guard (explicitly NOT in this specification)

No task implements or designs: WebMCP, MCP, agent tools/registry/permissions,
agent orchestration, AI-model integration, an AI agent, AI comparison,
recommendations, ranking, scoring, a recommendation engine, personalization,
details internals, enquiry internals, catalogue internals, authentication,
accounts, or a database.
