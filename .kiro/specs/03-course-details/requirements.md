# Specification 03 — Human Course Details · Requirements

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 03-course-details
**Title:** Human Course Details
**Status:** Draft for implementation (Phase 1 — human website)
**Builds on:** `.kiro/specs/01-foundation/` (implemented) and
`.kiro/specs/02-course-catalogue/` (implemented)
**Related steering:** `.kiro/steering/product.md`, `architecture.md`, `coding-standards.md`, `security.md`, `testing.md`

---

## 0. Phase note (why this specification exists)

The project is delivered in **two clearly separated phases**:

- **Phase 1 — Human-facing education website (current focus):** Foundation (01),
  Course Catalogue (02), **Course Details (03)**, Course Comparison (04),
  Course Enquiry (05), then Website Completion/Integration (06) and Testing &
  Quality (07).
- **Phase 2 — Agent-Ready Transformation (later, separate specifications):**
  only after the human website is complete will a future Kiro specification
  analyse the finished application and expose selected capabilities as AI-agent /
  WebMCP capabilities.

**This specification is strictly a normal, human-facing Course Details page.** It
introduces **no** AI-agent, WebMCP, MCP, tool-registry, permission, or
AI-model concepts. A short, conceptual forward-looking note appears in §15.

## 1. Purpose

Specification 02 delivered the Course Catalogue and shipped a **minimal** course
details placeholder route so that "View Details" navigation worked end to end.
Specification 03 replaces that placeholder with a **complete, realistic Course
Details page**: a learner selects a course from the catalogue, lands on a rich
details page, reviews all relevant course information, understands the course's
status/availability, and chooses an available next action (primarily enquiry;
optionally add-to-comparison).

It reuses — and does not duplicate — the Course model, the Course Service
(`getById`), and the `GET /api/courses/:courseId` endpoint delivered by
Specification 02, plus the Specification 01 shell, UI primitives, error/loading
patterns, and client API boundary.

## 2. Business Context

On a realistic education website, after discovering a course a learner opens a
dedicated course page to read the full description, entry requirements, delivery
details, fees, intake, and availability, then decides whether to enquire. This
specification implements that everyday human experience as a clean presentation
layer over the existing Course capability. **No new business logic is required on
the backend** — course retrieval already exists.

## 3. Relationship to RP Reference Experience

Republic Polytechnic (`https://www.rp.edu.sg`) is used **only** as a functional
reference for *what* a course information page contains and *how* a learner moves
from a course page toward enquiry. EduAgent Connect reproduces that functional
shape with an **original design and entirely synthetic data**. This specification
does not scrape RP, use RP APIs/data, or copy RP branding, logos, images, CSS, or
exact content.

## 4. Problem Statement

The catalogue can list and open courses, but the details route is only a minimal
placeholder. There is no complete course information page, no clear presentation
of full course attributes (eligibility, entry requirements, skills, deadlines,
tags), no first-class action path toward enquiry, and no fully specified
loading/error/not-found experience for the details view.

## 5. Scope

### 5.1 In Scope

- A complete Course Details page rendered at the details route established by
  Specification 02 (`/lifelong-learning/courses/:courseId`).
- Presentation of the full Course model: title, code, discipline, category,
  short and full description, course type, level, delivery mode, duration,
  intake, start date, application deadline, fees, eligibility, entry
  requirements, skills, tags, status, and availability.
- Clear status/availability presentation consistent with Specification 02's
  model (status = offering lifecycle; availability = whether a learner can act
  now).
- Human action affordances from the details page:
  - **Enquire** — a clear path toward the enquiry experience (Specification 05).
  - **Add to comparison** — an optional affordance that integrates only through
    the interface Specification 04 defines (present only if/when Spec 04's shared
    interface is available; otherwise omitted without breaking the page).
  - **Back to catalogue** — return navigation.
- Loading, error, and not-found/unavailable states for the details view.
- Responsive layout and accessibility baseline for the details page.
- Component, integration, and accessibility tests for the details page.

### 5.2 Out of Scope (see §7 / §14)

The full enquiry workflow implementation (Specification 05 — this spec only
provides the entry point/affordance); comparison internals (Specification 04 —
this spec only consumes the shared add-to-comparison interface); catalogue
listing/search/filter/sort/pagination (Specification 02); any new backend course
business logic; authentication; payments; database/persistence; external
education-system integration; admin functionality; and **all** AI-agent / WebMCP /
MCP / agent-tool / AI-model functionality (Phase 2).

## 6. User Personas

| ID  | Persona | Need in Spec 03 |
| --- | ------- | --------------- |
| P1  | Prospective Learner (Human) | Read complete, trustworthy information about a course and decide whether to enquire. |
| P2  | Working Professional (Human) | Quickly assess fit: delivery mode, duration, fee, intake, deadline, eligibility, and whether applications are open. |
| P3  | Developer / Implementer (Team A) | A clean presentation layer that reuses the existing Course capability without new backend logic. |
| P4  | Accessibility / QA Reviewer | A keyboard- and screen-reader-usable page with clear status messaging and correct heading hierarchy. |
| P5  | Solution Architect / Stakeholder | Evidence that the details experience reuses one business capability and does not duplicate it. |

## 7. User Journey

```
Course Catalogue → Select Course → Course Details → Review Information
        → Choose available action (Enquire → Spec 05 · Add to Comparison → Spec 04 · Back to Catalogue)
```

## 8. Functional Requirements

EARS-style where appropriate.

### Routing & retrieval
- **FR-301** The system shall render a Course Details page at the details route
  established by Specification 02 (`/lifelong-learning/courses/:courseId`), reached
  from the catalogue's "View Details" affordance.
- **FR-302** The details page shall retrieve its course via the existing
  `GET /api/courses/:courseId` endpoint (Course Service `getById`); it shall
  introduce **no** new course-retrieval business logic and shall not access the
  data source directly.
- **FR-303** The details page shall be **deep-linkable**: navigating directly to a
  valid course URL shall render that course's details.

### Course information
- **FR-304** The details page shall present the course's core identity: title,
  course code, discipline, and category.
- **FR-305** The details page shall present the full course description (and the
  short description where useful as a lead/summary).
- **FR-306** The details page shall present structured attributes: course type,
  level, delivery mode, duration, intake, start date, application deadline, fee
  (with currency), and eligibility.
- **FR-307** The details page shall present list attributes where present: entry
  requirements, skills, and tags.
- **FR-308** The details page shall present only fields that exist in the shared
  Course model (Specification 02); it shall **not** invent new fields.

### Status & availability
- **FR-309** The details page shall clearly communicate the course's
  **availability** (e.g. open, closing soon, closed, waitlist) using the exact
  availability model defined by Specification 02.
- **FR-310** Availability shall be conveyed with text (and optionally an
  icon/badge), never by colour alone.
- **FR-311** Because only publicly listable courses are retrievable (Spec 02's
  `getById` returns non-listable courses as not-found), the page shall treat any
  retrievable course as a real, listable offering and present its availability
  accordingly; it shall **not** re-implement the listability rule client-side.

### Actions
- **FR-312** The details page shall provide a clear **Enquire** action that
  navigates to the enquiry entry point for this course (the enquiry experience is
  implemented by Specification 05); the current course's identity shall be carried
  to that entry point.
- **FR-313** The details page shall provide a **Back to catalogue** navigation
  affordance.
- **FR-314** The details page **may** provide an **Add to comparison** affordance;
  when present it shall integrate solely through the shared comparison interface
  defined by Specification 04 and shall not implement comparison internals. If the
  Spec 04 interface is not yet available, the affordance shall be omitted without
  affecting the rest of the page.

### Invalid course, loading & error states
- **FR-315** When the course id does not exist or refers to a non-listable course
  (API returns 404), the details page shall show a clear **not-found /
  unavailable** state (not a raw error), with a path back to the catalogue.
- **FR-316** While the course request is in flight, the page shall show a
  **loading** state.
- **FR-317** When the request fails for reasons other than not-found (network or
  server error), the page shall show a user-friendly **error** state with a retry
  affordance, and shall never expose internal error details or stack traces.
- **FR-318** All state changes (loading, loaded, not-found, error) shall be
  announced to assistive technology via an appropriate live region.

## 9. Non-Functional Requirements

- **NFR-301 (No duplicated logic)** The details page shall reuse the Course
  Service via the existing API; no course business logic shall live in React or be
  duplicated (consistent with `.kiro/steering/architecture.md`).
- **NFR-302 (Type safety)** All new code shall compile under TypeScript strict
  mode with zero errors; the shared client Course type from Specification 02 is the
  single source of truth for course shape.
- **NFR-303 (Consistency)** The page shall reuse Specification 01 UI primitives
  and the Specification 02 catalogue styling conventions; it shall be a
  professional, modern education-platform page and **not** a visual clone of RP.
- **NFR-304 (Accessibility, WCAG 2.1 AA-oriented)** Semantic landmarks and a
  correct heading hierarchy (a single H1 = course title), keyboard-operable
  actions with visible focus, programmatic labels, `aria-live` status, AA
  contrast, and availability not conveyed by colour alone. Full conformance
  requires later manual assistive-technology testing.
- **NFR-305 (Responsive)** The page shall be usable at mobile (≈320–480 px),
  tablet (≈481–1024 px), and desktop (>1024 px) widths, adapting layout rather than
  shrinking a desktop layout.
- **NFR-306 (Performance)** The page shall render its first meaningful content
  quickly; a single course retrieval over the in-memory dataset responds in well
  under 100 ms locally.
- **NFR-307 (Security)** No secrets in the client; errors sanitised; Helmet/CORS
  from Specification 01 apply to the reused endpoint. This spec adds no new
  endpoints.
- **NFR-308 (Testability)** The presentation shall be testable with a substituted
  API client/transport (no real network), per `.kiro/steering/testing.md`.
- **NFR-309 (Determinism)** Given the same course id, the page shall render the
  same information deterministically.

## 10. Acceptance Criteria

Given / When / Then.

- **AC-301 (Open details) — FR-301, FR-304–FR-307**
  *Given* a valid course id, *when* the learner opens the details page, *then* the
  page displays that course's title, code, discipline, description, structured
  attributes, and list attributes.

- **AC-302 (Deep link) — FR-303**
  *Given* a valid course URL, *when* it is opened directly, *then* the
  corresponding course details render.

- **AC-303 (Availability) — FR-309, FR-310**
  *Given* a course with a given availability, *when* the page renders, *then* the
  availability is shown as text (not colour alone) using the Spec 02 model.

- **AC-304 (Enquire path) — FR-312**
  *Given* the details page for a course, *when* the learner activates "Enquire",
  *then* the app navigates to the enquiry entry point for that course (carrying the
  course identity).

- **AC-305 (Back to catalogue) — FR-313**
  *Given* the details page, *when* the learner activates "Back to catalogue",
  *then* the app navigates to `/lifelong-learning/courses`.

- **AC-306 (Not found) — FR-315**
  *Given* an unknown or non-listable course id, *when* the page loads, *then* a
  clear not-found/unavailable state is shown with a path back to the catalogue
  (not a raw error).

- **AC-307 (Loading) — FR-316, FR-318**
  *Given* an in-flight request, *when* the page is loading, *then* a loading state
  is shown and announced.

- **AC-308 (Error + retry) — FR-317, FR-318**
  *Given* a non-404 failure, *when* the request fails, *then* a sanitised error
  state with a retry affordance is shown; retry re-requests the course.

- **AC-309 (Add to comparison, when available) — FR-314**
  *Given* the shared Spec 04 comparison interface is available, *when* the learner
  activates "Add to comparison" on the details page, *then* the course is added via
  that interface (no comparison logic implemented here). *Given* the interface is
  not available, *then* the affordance is absent and the page still works.

- **AC-310 (Accessibility) — NFR-304**
  *Given* keyboard-only operation, *when* the learner uses the page, *then* all
  actions are reachable and operable with visible focus, there is exactly one H1
  (the course title), and status changes are announced.

## 11. Shared Contracts (consumed / produced)

**Consumed (from Spec 02 — do not redefine):**
- **Course model** — the shared client Course type (`client/src/lib/courses/types.ts`).
- **Course ID** — the stable slug-like `id` used in routes and API calls.
- **Course retrieval API** — `GET /api/courses/:courseId` (envelope `{ data: Course }`,
  404 for unknown/non-listable), consumed via `coursesApi.getById` and the
  Spec 01 client API boundary.
- **Details route** — `/lifelong-learning/courses/:courseId` (established by Spec 02).

**Produced (for other specs):**
- **Enquiry entry point (navigation)** — the "Enquire" affordance and the way the
  current course id is carried to the enquiry experience (consumed by Spec 05).
  The concrete enquiry route/params are owned by Spec 05; Spec 03 documents the
  navigation contract and links to it.

**Depends on an interface owned elsewhere:**
- **Add-to-comparison interface** — owned by Spec 04; Spec 03 consumes it if
  available (§FR-314). Spec 03 must not change the Course model to support it.

> **Course model change policy:** Specification 03 must **not** modify the shared
> Course model. If a genuine need arises, it must be raised as an explicit
> **shared contract change** coordinated with Spec 02's owner and dependent specs
> (see the Phase 1 integration reference in `App/docs/phase-1-integration.md`).

## 12. Development Ownership

- **Recommended owner:** Developer/Team **A** — Course Details.
- Team A works primarily within the details page and its components/tests and
  the details route, plus the docs for this feature. Team A must **not** modify the
  Course model, the catalogue internals (Spec 02), comparison internals (Spec 04),
  or the enquiry internals (Spec 05).
- Integration of the enquiry entry point and the add-to-comparison affordance is
  coordinated with Teams C and B respectively and finalised in Spec 06.

## 13. Parallel Development

- Spec 03 can proceed **in parallel** with Spec 04 and Spec 05 once the shared
  Course model and `GET /api/courses/:courseId` (both already delivered by Spec 02)
  are agreed — which they are.
- The only cross-spec seams are **navigation** (to enquiry) and an **optional
  interface** (add-to-comparison). These are guarded so Spec 03 is fully
  implementable and testable on its own; the seams are exercised during
  integration (Spec 06).

## 14. Non-Goals (explicit)

- No enquiry workflow implementation (only the entry point) — Spec 05.
- No comparison internals (only optional consumption of Spec 04's interface).
- No catalogue/search/filter/sort/pagination — Spec 02.
- No new backend course business logic, no auth, no payments, no database, no
  external integration, no admin.
- **No** WebMCP, MCP, AI agents, agent tools, tool registries, agent permissions,
  agent guardrails, AI recommendations, AI search, or AI-generated content
  (Phase 2).

## 15. Future Agent Transformation Consideration (conceptual only)

> Forward-looking note only. Nothing here is designed or implemented in Spec 03.

Once the human website is complete, a future, separate Kiro specification may
analyse the finished application and expose selected existing capabilities as
structured agent capabilities. The completed human "view course details" flow
could conceptually inform a future `get_course_details`-style capability. **Spec 03
does not design or build any such tool;** the future phase will determine actual
tool boundaries after inspecting the completed application.
