# Specification 04 — Human Course Comparison · Requirements

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 04-course-comparison
**Title:** Human Course Comparison
**Status:** Draft for implementation (Phase 1 — human website)
**Builds on:** `.kiro/specs/01-foundation/` (implemented) and
`.kiro/specs/02-course-catalogue/` (implemented)
**Related steering:** `.kiro/steering/product.md`, `architecture.md`, `coding-standards.md`, `security.md`, `testing.md`

---

## 0. Phase note

Phase 1 (human website): Foundation (01), Catalogue (02), Details (03),
**Comparison (04)**, Enquiry (05), then Completion/Integration (06) and Testing &
Quality (07). Phase 2 (Agent-Ready Transformation) is later and separate.

**This specification is a straightforward, human-facing side-by-side comparison
feature.** It introduces **no** AI comparison, recommendations, ranking, scoring,
personalization, agents, WebMCP, MCP, tools, or AI models. A short conceptual
forward-looking note appears in §15.

## 1. Purpose

Allow a human visitor to select multiple courses and view them **side by side** to
review differences, then choose a course to open its details or enquire.
Comparison is a **client-side UI feature** built entirely on the shared Course
model and course data delivered by Specification 02. It adds **no** backend
business logic and **no** persistence.

## 2. Business Context

On a realistic education website, a learner shortlists a few courses and compares
their key attributes (type, delivery, duration, fee, intake, availability) to
decide. This spec implements that everyday human comparison as a simple,
accessible UI over data the catalogue already provides.

## 3. Relationship to RP Reference Experience

Republic Polytechnic is a **functional reference only** for the idea that a learner
compares shortlisted courses. EduAgent Connect uses an **original design and
synthetic data**; it does not scrape RP, use RP data/APIs, or copy RP assets.

## 4. Problem Statement

The catalogue lists courses and the details page shows one course, but a learner
cannot yet place several courses beside each other to compare attributes. There is
no comparison list, no add/remove affordances, no comparison view, and no defined
limit, empty state, or duplicate handling.

## 5. Scope

### 5.1 In Scope

- Add a course to a **comparison list** (from the catalogue card and, optionally,
  the course details page via the shared interface this spec exposes).
- Remove a course from the comparison list.
- A **comparison limit** (maximum number of courses), clearly specified and
  consistently enforced.
- **Duplicate prevention** (a course cannot be added twice).
- Client-side comparison **state** (the simplest appropriate approach; no
  database).
- A **Comparison View** that shows comparable attributes from the shared Course
  model side by side.
- **Empty state** when nothing is selected.
- **Navigation** from the comparison view: open a course's details, remove a
  course, and return to the catalogue; plus a path to enquire.
- Responsive comparison layout (desktop/tablet/mobile) and accessibility baseline.
- A small, documented **shared comparison interface** other specs can consume
  (Spec 03's optional add-to-comparison affordance).
- Component and unit tests for comparison state and the comparison view.

### 5.2 Out of Scope (see §7 / §14)

Course details internals (Specification 03 — this spec only links to details);
enquiry workflow (Specification 05 — this spec only links to the enquiry entry
point); catalogue listing/search/filter/sort/pagination (Specification 02); any
new backend logic or endpoints; database/persistence; user accounts;
authentication; and **all** AI/agent/WebMCP/MCP functionality, including AI
comparison, recommendations, ranking, scoring, or a recommendation engine
(Phase 2).

## 6. User Personas

| ID  | Persona | Need in Spec 04 |
| --- | ------- | --------------- |
| P1  | Prospective Learner (Human) | Shortlist a few courses and compare their attributes side by side. |
| P2  | Working Professional (Human) | Compare fee, duration, delivery mode, intake, and availability to decide. |
| P3  | Developer / Implementer (Team B) | A self-contained client-side comparison feature reusing the Course model, exposing a small interface others consume. |
| P4  | Accessibility / QA Reviewer | Keyboard- and screen-reader-usable comparison, readable across breakpoints. |
| P5  | Solution Architect / Stakeholder | Evidence that comparison reuses the Course model and adds no duplicate data structure or backend logic. |

## 7. User Journey

```
Course Catalogue → Select courses → Add to Comparison → Comparison View
        → Review differences → Choose a course → View Details / Enquire
```

## 8. Functional Requirements

EARS-style where appropriate.

### Add / remove / duplicate / limit
- **FR-401** The system shall allow a user to **add** a course to the comparison
  list from the catalogue (and, via the shared interface, from other human UI
  locations such as course details).
- **FR-402** The system shall allow a user to **remove** a course from the
  comparison list (from the comparison view and from the add/remove control
  wherever it appears).
- **FR-403** The system shall **prevent duplicates**: adding a course already in
  the list shall not create a second entry; the control shall reflect the
  already-added state.
- **FR-404** The system shall enforce a **maximum comparison size** of **4**
  courses. Attempting to add beyond the maximum shall be prevented with a clear,
  accessible message; it shall not silently drop or replace an existing entry.
- **FR-405** Course identity for add/remove/duplicate/limit shall be the shared
  Course **id** (Specification 02).

### State
- **FR-406** Comparison state shall live **client-side** using the simplest
  appropriate approach (a React context/provider holding the selected course
  ids/items); no database or backend persistence shall be introduced.
- **FR-407** Comparison state shall be available across the catalogue, details, and
  comparison view within a browsing session (e.g. via a shared provider mounted in
  the app shell). Optional session persistence (e.g. `sessionStorage`) may be
  included as a progressive enhancement but is not required.
- **FR-408** The number of courses currently in the comparison list shall be
  visible to the user (e.g. a count on a "Compare (n)" affordance).

### Comparison view
- **FR-409** The system shall provide a **Comparison View** that displays the
  selected courses side by side.
- **FR-410** The comparison view shall compare attributes that exist in the shared
  Course model: title, course type, discipline (and category where useful),
  delivery mode, duration, eligibility, fee (with currency), intake, and
  availability/status. It shall **not** invent attributes.
- **FR-411** The comparison view shall present attributes in a consistent,
  aligned structure (a comparison table or equivalent) so differences are easy to
  scan; it shall **not** rank, score, or recommend.
- **FR-412** From the comparison view the user shall be able to **open a course's
  details** (Specification 03 route) and **remove a course**.
- **FR-413** The comparison view shall provide a **return to catalogue**
  affordance and a path to **enquire** about a chosen course (the enquiry entry
  point defined by Specification 05).

### Empty state & retrieval
- **FR-414** When the comparison list is empty, the comparison view shall show a
  clear **empty state** guiding the user to add courses from the catalogue.
- **FR-415** The comparison view shall obtain course data from the shared Course
  model/catalogue data (from state populated on add, and/or by fetching by id via
  the existing course API); it shall **not** access the data source directly and
  shall **not** duplicate the Course model or catalogue querying.

### Shared interface
- **FR-416** The system shall expose a small, documented **comparison interface**
  (e.g. a `useComparison()` hook / comparison context) providing at least: `items`
  (or ids), `add(course)`, `remove(id)`, `has(id)`, `clear()`, `count`, and a
  capacity/`isFull` signal. Specification 03 consumes this interface for its
  optional add-to-comparison affordance; Specification 04 owns it.

## 9. Non-Functional Requirements

- **NFR-401 (No duplicated model/logic)** Comparison shall reuse the shared Course
  model; it shall not create a second course data structure and shall not embed
  catalogue querying (consistent with `.kiro/steering/architecture.md`).
- **NFR-402 (Type safety)** All new code shall compile under TypeScript strict
  mode with zero errors; the shared client Course type is the single source of
  truth.
- **NFR-403 (Consistency)** Reuse Spec 01 UI primitives and Spec 02 styling
  conventions; original, professional design — not an RP clone.
- **NFR-404 (Accessibility, WCAG 2.1 AA-oriented)** Keyboard-operable add/remove
  and navigation with visible focus; the comparison table uses proper table
  semantics (or an equivalent accessible structure) with header associations;
  count and add/remove changes announced via `aria-live`; availability not by
  colour alone; AA contrast. Full conformance requires later manual testing.
- **NFR-405 (Responsive)** On desktop, side-by-side columns; on smaller screens,
  an appropriate responsive pattern (horizontal scrolling of the comparison table
  and/or stacked per-course comparison sections) so it is usable, not a shrunken
  desktop layout.
- **NFR-406 (Determinism)** Given the same set of selected courses, the comparison
  view shall render the same attributes in the same order.
- **NFR-407 (Security)** No secrets in the client; no new endpoints; if data is
  fetched by id it uses the existing sanitised course API (Helmet/CORS from
  Spec 01 apply). No sensitive data is stored.
- **NFR-408 (Testability)** Comparison state and view shall be testable without a
  browser network (substituted API client where fetching is used), per
  `.kiro/steering/testing.md`.

## 10. Acceptance Criteria

Given / When / Then.

- **AC-401 (Add) — FR-401, FR-408**
  *Given* a course in the catalogue, *when* the user adds it to comparison, *then*
  it appears in the comparison list and the visible count increments.

- **AC-402 (Remove) — FR-402, FR-408**
  *Given* a course in the comparison list, *when* the user removes it, *then* it is
  gone and the count decrements.

- **AC-403 (Duplicate) — FR-403**
  *Given* a course already in the list, *when* the user attempts to add it again,
  *then* no duplicate is created and the control shows the added state.

- **AC-404 (Limit) — FR-404**
  *Given* the maximum (4) courses are already selected, *when* the user attempts to
  add another, *then* the add is prevented with a clear, accessible message and the
  existing selection is unchanged.

- **AC-405 (Comparison view) — FR-409, FR-410, FR-411**
  *Given* two or more selected courses, *when* the user opens the comparison view,
  *then* the courses are shown side by side comparing the shared attributes in an
  aligned structure, without ranking or scoring.

- **AC-406 (Open details) — FR-412**
  *Given* the comparison view, *when* the user opens a course's details, *then* the
  app navigates to that course's details route.

- **AC-407 (Navigate/enquire/back) — FR-413**
  *Given* the comparison view, *when* the user chooses to enquire or return to the
  catalogue, *then* the app navigates to the enquiry entry point for the chosen
  course or back to `/lifelong-learning/courses` respectively.

- **AC-408 (Empty) — FR-414**
  *Given* an empty comparison list, *when* the user opens the comparison view,
  *then* a clear empty state guides them to add courses.

- **AC-409 (Shared interface) — FR-416**
  *Given* the comparison interface, *when* another feature calls `add`/`remove`/
  `has`/`count`/`isFull`, *then* it observes consistent state and the same
  duplicate/limit rules.

- **AC-410 (Responsive) — NFR-405**
  *Given* a narrow viewport, *when* the comparison view renders, *then* it remains
  usable via horizontal scroll and/or stacked sections (not a broken/overflowing
  desktop layout).

- **AC-411 (Accessibility) — NFR-404**
  *Given* keyboard-only operation, *when* the user adds/removes/navigates and reads
  the comparison, *then* controls are reachable with visible focus, the comparison
  structure is announced with proper header associations, and count changes are
  announced.

## 11. Shared Contracts (consumed / produced)

**Consumed (from Spec 02 — do not redefine):**
- **Course model** — the shared client Course type (`client/src/lib/courses/types.ts`).
- **Course ID** — the stable `id` used as comparison identity and in navigation.
- **Course catalogue data / API** — used to populate/refresh comparison items
  (e.g. `coursesApi.getById` or the item passed on add); no new querying logic.
- **Details route** — `/lifelong-learning/courses/:courseId` (Spec 02/03) for
  "open details".

**Produced (for other specs):**
- **Comparison interface** — the `useComparison()`/context API (FR-416) consumed by
  Spec 03 (optional add-to-comparison affordance) and used by Spec 04's own
  catalogue/comparison UI. Spec 04 owns this interface and its rules (limit,
  duplicate).
- **Add/remove control** — a reusable "Add to compare / Remove" control that the
  catalogue card and details page can render via the interface.

**Depends on a navigation contract owned elsewhere:**
- **Enquiry entry point** — owned by Spec 05 (documented via Spec 03); Spec 04
  links to it for "Enquire".

> **Course model change policy:** Specification 04 must **not** modify the shared
> Course model. Any genuine need must be raised as an explicit **shared contract
> change** coordinated with Spec 02's owner and dependents (see
> `App/docs/phase-1-integration.md`).

## 12. Development Ownership

- **Recommended owner:** Developer/Team **B** — Course Comparison.
- Team B owns the comparison provider/context, the add/remove control, the
  comparison view page and components, and their tests, plus the comparison
  interface documentation. Team B must **not** modify the Course model, catalogue
  internals, details internals, or enquiry internals.
- The comparison interface (FR-416) is a shared contract; changes to it are
  coordinated with Team A (Spec 03) and finalised in Spec 06.

## 13. Parallel Development

- Spec 04 can proceed **in parallel** with Spec 03 and Spec 05 once the shared
  Course model and catalogue data/API (already delivered by Spec 02) are agreed.
- **Sequential seam:** the comparison **interface signature** (FR-416) should be
  agreed early because Spec 03 consumes it. Until it is agreed, Spec 03 guards its
  optional affordance (per Spec 03 FR-314), so both teams can still progress.
- Navigation to details (Spec 03 route) and to the enquiry entry point (Spec 05)
  are exercised during integration (Spec 06).

## 14. Non-Goals (explicit)

- No details internals (only navigation to details) — Spec 03.
- No enquiry workflow (only a link to its entry point) — Spec 05.
- No catalogue/search/filter/sort/pagination — Spec 02.
- No backend logic/endpoints, no database/persistence, no accounts, no auth.
- **No** AI comparison, AI recommendations, ranking, scoring, personalization,
  recommendation engine, agents, WebMCP, MCP, tools, or AI models (Phase 2).

## 15. Future Agent Transformation Consideration (conceptual only)

> Forward-looking note only. Nothing here is designed or implemented in Spec 04.

The completed human comparison flow could later inform a future
`compare_courses`-style agent capability, determined by a separate Phase 2
specification after inspecting the finished application. **Spec 04 does not design
or build any such tool, ranking, or scoring.**
