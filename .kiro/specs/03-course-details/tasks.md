# Specification 03 — Human Course Details · Tasks

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 03-course-details
**Owner:** Developer/Team A
**Traceability:** Each task references requirements in `./requirements.md` and design sections in `./design.md`.

Priority: **High** · **Medium** · **Low**. Tasks are independently executable and
verifiable. **No task implements WebMCP, agents, MCP, tools, or AI** (Phase 2).
This specification is **frontend-only**; it introduces no backend changes.

---

## PHASE 0 — Review & Alignment

### TASK-300
Priority: High · Dependency: Spec 02 (implemented)
Description: Review the existing Course model/type, `coursesApi.getById`,
`GET /api/courses/:courseId`, the Spec 02 details route/placeholder
(`CourseDetails`), label maps, `format.ts`, `AvailabilityBadge`, and the Spec 01
primitives. Confirm the shared contracts in requirements §11 and that no
Course-model change is required.
Completion: A short note confirming reused artifacts and that Spec 03 is
frontend-only with no Course-model change. Satisfies FR-302, FR-308, NFR-301.

---

## PHASE 1 — Route & Data

### TASK-301
Priority: High · Dependency: TASK-300
Description: Confirm/finalise the details route
(`app/lifelong-learning/courses/[courseId]/page.tsx`) as the host that renders the
`CourseDetails` client component, passing `courseId`; ensure deep-linking works.
Completion: Navigating from a catalogue card and directly via URL both reach the
page. Satisfies FR-301, FR-303, design §3.

### TASK-302
Priority: High · Dependency: TASK-301
Description: Implement course retrieval in `CourseDetails` using
`coursesApi.getById` with `AbortController` cleanup and a retry reload token;
no direct data-source access, no new business logic.
Completion: The page fetches one course by id and cancels on unmount. Satisfies
FR-302, NFR-301, design §5–§6.

---

## PHASE 2 — Information Presentation

### TASK-303
Priority: High · Dependency: TASK-302
Description: Implement `CourseDetailHeader` (discipline eyebrow, single H1 title,
course code, `AvailabilityBadge`).
Completion: Identity + availability render with exactly one H1. Satisfies FR-304,
FR-309, FR-310, NFR-304.

### TASK-304
Priority: High · Dependency: TASK-302
Description: Implement `CourseOverview` (full description; short description as a
lead where useful).
Completion: Descriptions render. Satisfies FR-305.

### TASK-305
Priority: High · Dependency: TASK-302
Description: Implement `CourseKeyFacts` as a definition list: course type, level,
delivery mode, duration, intake, start date, application deadline, fee (with
currency), eligibility — using Spec 02 label maps and `format.ts`.
Completion: All structured attributes render, formatted. Satisfies FR-306, FR-308.

### TASK-306
Priority: Medium · Dependency: TASK-302
Description: Implement `CourseRequirements`, `CourseSkills`, `CourseTags` rendered
only when their arrays are non-empty; accessible lists/chips.
Completion: List attributes render when present and are omitted cleanly when
absent. Satisfies FR-307, FR-308.

---

## PHASE 3 — Status & Actions

### TASK-307
Priority: High · Dependency: TASK-303
Description: Ensure availability presentation uses the exact Spec 02 model and is
conveyed by text (+ optional glyph), not colour alone; treat any retrievable
course as listable (no client-side listability rule).
Completion: Availability matches Spec 02 semantics and is not colour-only.
Satisfies FR-309, FR-310, FR-311, NFR-304.

### TASK-308
Priority: High · Dependency: TASK-302
Description: Implement `CourseActions`: a primary **Enquire** action that
navigates to the enquiry entry point for this course (carrying the course id per
the Spec 05 navigation contract) and a secondary **Back to catalogue** link.
Completion: Enquire navigates to the enquiry entry point with the course id; Back
returns to `/lifelong-learning/courses`. Satisfies FR-312, FR-313, design §7.

### TASK-309
Priority: Medium · Dependency: TASK-308
Description: Add an optional **Add to comparison** affordance that renders only
when the shared Spec 04 comparison interface is available and delegates entirely to
it; omit cleanly when unavailable. Implement **no** comparison internals here.
Completion: With the Spec 04 interface present the affordance adds via that
interface; without it the affordance is absent and the page still works. Satisfies
FR-314, AC-309.

---

## PHASE 4 — Loading / Error / Not-Found

### TASK-310
Priority: High · Dependency: TASK-302
Description: Implement the loading state (accessible indicator/skeleton) announced
via `aria-live`.
Completion: A loading state shows while fetching and is announced. Satisfies
FR-316, FR-318.

### TASK-311
Priority: High · Dependency: TASK-302
Description: Implement the not-found/unavailable state (on 404) with a path back to
the catalogue, and the sanitised error state with **Retry** (on non-404 failures);
never expose internals.
Completion: 404 → not-found panel; other failures → error + retry that re-requests.
Satisfies FR-315, FR-317, FR-318, NFR-307.

---

## PHASE 5 — Responsive & Accessibility

### TASK-312
Priority: High · Dependency: TASK-303, TASK-305, TASK-308
Description: Apply responsive layout (mobile stack with actions reachable near the
top; tablet/desktop two-column with optional sticky actions) using Spec 02 Tailwind
conventions and `Container`.
Completion: Usable at mobile/tablet/desktop widths (not a shrunken desktop).
Satisfies NFR-305, design §8.

### TASK-313
Priority: High · Dependency: TASK-303–TASK-311
Description: Apply the accessibility baseline: single H1 + ordered headings,
semantic `article`/`dl`/`ul`, keyboard-operable actions with visible focus, correct
link vs button semantics, and announced state changes.
Completion: Keyboard-only operation reaches all actions; heading hierarchy and
announcements verified. Satisfies NFR-304, FR-318.

---

## PHASE 6 — Tests

### TASK-314
Priority: High · Dependency: TASK-303–TASK-311, TASK-232 (test tooling from Spec 02)
Description: Component-test `CourseDetails` with a **faked `coursesApi`**: renders
full info; availability as text; loading→found; not-found on 404; error+retry on
non-404; Enquire navigates with course id; Back link target; add-to-comparison
present/absent per interface availability; accessibility assertions (single H1,
labelled actions, aria-live).
Completion: Deterministic tests cover FR-304–FR-318 and NFR-304. Verifies
AC-301–AC-310.

---

## PHASE 7 — Documentation

### TASK-315
Priority: Medium · Dependency: TASK-308
Description: Document the Course Details page in `App/docs` (route, reused
Course/API, actions and the enquiry navigation contract, the optional comparison
seam, states) and update the Phase 1 integration reference
(`App/docs/phase-1-integration.md`) with the enquiry entry-point contract Spec 03
produces. State that WebMCP/agent is a future phase.
Completion: Docs reflect the implemented page and shared contracts. Satisfies
NFR-202 (docs), requirements §11.

---

## PHASE 8 — Validation

### TASK-316
Priority: High · Dependency: TASK-314
Description: Run `npm run typecheck`, `npm run lint`, and the client tests; resolve
issues. Manually verify the journey Catalogue → Details → (Enquire entry point) and
the loading/error/not-found states across breakpoints; confirm Spec 01/02
regression (health, catalogue) and that no backend changes were made.
Completion: Zero type/lint errors; tests pass; journey and states verified; no
regressions. Satisfies NFR-302, and validates AC-301–AC-310.

---

## Traceability — Requirements → Tasks

| Requirement | Task(s) |
| ----------- | ------- |
| FR-301 | TASK-301 |
| FR-302 | TASK-300, TASK-302 |
| FR-303 | TASK-301 |
| FR-304 | TASK-303 |
| FR-305 | TASK-304 |
| FR-306 | TASK-305 |
| FR-307 | TASK-306 |
| FR-308 | TASK-300, TASK-305, TASK-306 |
| FR-309 | TASK-303, TASK-307 |
| FR-310 | TASK-303, TASK-307 |
| FR-311 | TASK-307 |
| FR-312 | TASK-308 |
| FR-313 | TASK-308 |
| FR-314 | TASK-309 |
| FR-315 | TASK-311 |
| FR-316 | TASK-310 |
| FR-317 | TASK-311 |
| FR-318 | TASK-310, TASK-311, TASK-313 |
| NFR-301 | TASK-300, TASK-302 |
| NFR-302 | TASK-316 |
| NFR-303 | TASK-303–TASK-312 |
| NFR-304 | TASK-303, TASK-307, TASK-313, TASK-314 |
| NFR-305 | TASK-312 |
| NFR-306 | TASK-302 |
| NFR-307 | TASK-311 |
| NFR-308 | TASK-314 |
| NFR-309 | TASK-314 |

---

## Scope guard (explicitly NOT in this specification)

No task implements or designs: WebMCP, MCP, agent tools/registry/permissions,
agent orchestration, AI-model integration, an AI agent, AI recommendations/search,
the enquiry workflow (only its entry point), comparison internals, catalogue
internals, authentication, payments, or a database.
