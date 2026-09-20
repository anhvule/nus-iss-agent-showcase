# Specification 03 — Human Course Details · Design

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 03-course-details
**Audience:** Senior engineers, solution architects, accessibility/QA reviewers
**Traceability:** Implements `./requirements.md`; extends `.kiro/specs/02-course-catalogue/design.md`; consistent with `.kiro/steering/*`.

---

## 1. Executive Summary

This design turns the minimal details placeholder shipped by Specification 02
into a **complete, accessible, responsive Course Details page**. It is a
**frontend-only** change: it reuses the existing Course model, the Course Service
`getById`, and `GET /api/courses/:courseId`. No backend code changes are required.
The page fetches one course through the existing client API boundary, renders its
full information, communicates availability, and offers human actions (enquire,
add-to-comparison [optional], back to catalogue).

This is a **Phase 1 (human website)** specification and contains **no** AI-agent
or WebMCP design (see §12 for a conceptual forward-looking note only).

## 2. Architectural Goals

1. **Reuse, don't duplicate.** One business capability (Course Service via REST);
   the page is presentation only (req FR-302, NFR-301).
2. **Consistency.** Reuse Spec 01 primitives (`Button`, `Card`, `Container`) and
   Spec 02 patterns (availability badge, discriminated-union request state,
   `coursesApi`) (NFR-303).
3. **Accessible & responsive** across breakpoints (NFR-304, NFR-305).
4. **Guarded cross-spec seams.** Enquiry is a navigation target (Spec 05);
   add-to-comparison is an optional interface (Spec 04) — both isolated so the page
   is independently buildable/testable (FR-312, FR-314).

## 3. Route Structure

- Reuses the route established by Specification 02:
  `client/src/app/lifelong-learning/courses/[courseId]/page.tsx`.
- The route (a server component wrapper) reads `params.courseId` and renders the
  client `CourseDetails` component (already the pattern in Spec 02).
- Deep-linking works because the page fetches by id on mount (FR-303).
- Canonical human path: Catalogue card "View Details" → this route (FR-301).

> **Note on the objective's `/courses/:courseId` example.** The requirements use
> `/courses/:courseId` conceptually; the project's established route (Spec 02,
> AD-208) is `/lifelong-learning/courses/:courseId`. This design keeps the
> established route to avoid a breaking change. If a top-level `/courses/:courseId`
> alias is later desired, it is an integration decision for Spec 06, not Spec 03.

## 4. Component Architecture (presentation only; FR-304–FR-308)

Replace the minimal `CourseDetails` body with a richer composition under
`client/src/components/courses/details/` (new subfolder to keep the feature
cohesive and Team A's ownership clear):

- `CourseDetails` (client component, evolves the existing file) — orchestrates the
  fetch and renders one of: loading / found / not-found / error.
- `CourseDetailHeader` — course identity: discipline eyebrow, H1 title, code, and
  the availability badge (reuses the existing `AvailabilityBadge`).
- `CourseOverview` — the full/short description block.
- `CourseKeyFacts` — a definition list of structured attributes (type, level,
  delivery mode, duration, intake, start date, application deadline, fee,
  eligibility).
- `CourseRequirements` — entry requirements list (rendered when present).
- `CourseSkills` / `CourseTags` — skills and tags as accessible lists/chips
  (rendered when present).
- `CourseActions` — the action bar: **Enquire** (primary), **Add to comparison**
  (optional, see §7), **Back to catalogue** (secondary).

All components are presentation-only and take already-fetched `Course` data as
props; only `CourseDetails` performs data access.

## 5. API Interaction & Reuse (FR-302, NFR-301)

- Uses the existing `coursesApi.getById(courseId, signal)` from
  `client/src/lib/courses/api.ts`, which calls `GET /api/courses/:courseId` and
  returns `{ data: Course }`, throwing `CourseApiError` (with `status`) on failure.
- No new API client methods and **no** new backend endpoints or services.
- Reuses the shared client `Course` type and label maps
  (`COURSE_TYPE_LABELS`, `DELIVERY_MODE_LABELS`, `COURSE_LEVEL_LABELS`,
  `AVAILABILITY_LABELS`) and `format.ts` helpers (`formatFee`, `formatDuration`)
  from Spec 02.

## 6. State, Loading, Error & Not-Found (FR-315–FR-318)

Reuse the Spec 02/Spec 01 discriminated-union pattern (already present in the
minimal `CourseDetails`):

```ts
type DetailState =
  | { phase: 'loading' }
  | { phase: 'found'; course: Course }
  | { phase: 'notFound' }
  | { phase: 'error'; message: string };
```

- **loading** — accessible loading indicator/skeleton, announced via `aria-live`.
- **found** — the full details composition (§4).
- **notFound** — clear "course not found / not currently available" panel with a
  "Back to catalogue" link (triggered when `CourseApiError.status === 404`,
  covering both unknown ids and non-listable courses; the listability rule stays
  server-side per FR-311).
- **error** — sanitised message + **Retry** (re-issues the request), never
  exposing internals (FR-317).
- Requests use `AbortController` for cleanup; retry uses a reload token
  (mirroring the catalogue orchestrator).

## 7. Actions & Cross-Spec Seams (FR-312–FR-314)

- **Enquire (primary, FR-312):** a link/button that navigates to the enquiry entry
  point for this course. The concrete enquiry route and how the course id is passed
  (route param and/or query) are **owned by Spec 05**; Spec 03 depends only on that
  documented navigation contract. Until Spec 05 lands, this may point to the
  planned enquiry route (e.g. `/lifelong-learning/courses/:courseId/enquire` or
  `/lifelong-learning/enquiry?courseId=…` as Spec 05 defines); the exact target is
  finalised as a shared contract.
- **Add to comparison (optional, FR-314):** integrates **only** via the shared
  interface Spec 04 exposes (e.g. a `useComparison()` hook / comparison context
  with `add(courseId | course)` and capacity/duplicate awareness). Spec 03 renders
  the affordance **conditionally** on that interface being available and delegates
  entirely to it — no comparison state or rules here. If unavailable, the affordance
  is omitted (page still fully works).
- **Back to catalogue (FR-313):** a link to `/lifelong-learning/courses`.

## 8. Responsive Behaviour (NFR-305)

- Mobile: single-column stack (header → actions → overview → key facts →
  requirements → skills/tags); actions accessible near the top so a learner can
  enquire without scrolling the whole page.
- Tablet/desktop: a two-column layout (main content + a key-facts/actions side
  panel) using the Tailwind grid conventions from Spec 02; the action bar may be
  sticky on wide screens.
- Reuses `Container` for max-width and padding.

## 9. Accessibility (NFR-304, FR-310, FR-318)

- Exactly one **H1** = course title; sub-sections use H2/H3 in order.
- Semantic `article` for the course, `dl` for key facts, `ul` for lists.
- All actions keyboard-operable with visible focus; links vs buttons chosen
  semantically (navigation = link, in-page action = button).
- Availability communicated with text (+ optional glyph), not colour alone.
- Loading/error/not-found announced via `role="status"` / `aria-live` / `role="alert"`.

## 10. Testing Strategy (maps to §11 tasks; steering: Vitest + Testing Library)

- **Component/unit (Team A):** with a **faked `coursesApi`** (the transport seam,
  no network):
  - renders all course information for a found course (FR-304–FR-308);
  - availability rendered as text using the Spec 02 model (FR-309, FR-310);
  - loading state shown then replaced (FR-316);
  - not-found state on 404 (FR-315);
  - error state + retry re-requests on non-404 failure (FR-317);
  - Enquire action navigates to the enquiry entry point with the course id
    (FR-312) — asserted via a stubbed router/link `href`;
  - Back-to-catalogue link target (FR-313);
  - add-to-comparison affordance present and delegates when the Spec 04 interface
    is provided, absent when not (FR-314);
  - accessibility assertions: single H1, labelled actions, focusable controls,
    aria-live present (NFR-304).
- **Integration (deferred to Spec 06 / Spec 07):** real catalogue → details →
  enquiry navigation across features; not duplicated here.
- **Responsive:** verified via layout assertions where practical and manual
  breakpoint checks during validation.

## 11. Reuse Summary

| Reused artifact | Source | Usage |
| --------------- | ------ | ----- |
| Course type + label maps | Spec 02 `client/src/lib/courses/types.ts` | Course shape + display labels |
| `coursesApi.getById` | Spec 02 `client/src/lib/courses/api.ts` | Single-course retrieval |
| `format.ts` (fee/duration) | Spec 02 | Display formatting |
| `AvailabilityBadge` | Spec 02 | Availability presentation |
| `Button`, `Card`, `Container`, `cn` | Spec 01 | Primitives/styling |
| Details route | Spec 02 `app/lifelong-learning/courses/[courseId]/page.tsx` | Page host |
| `GET /api/courses/:courseId`, Course Service `getById` | Spec 02 backend | Data (unchanged) |

## 12. Future Transformation (Phase 2 — forward-looking note only)

The details view is a clean presentation over the existing Course capability. A
future, separate specification could later reuse `CourseService.getById(...)` when
exposing a `get_course_details`-style agent capability. **No** agent, WebMCP, MCP,
tool, registry, permission, or AI-model code is designed or created here.

## 13. Architecture Decisions

| ID | Decision | Rationale |
| -- | -------- | --------- |
| AD-301 | Frontend-only; reuse `getById` + existing endpoint | No duplicated logic; matches Spec 01/02 layering |
| AD-302 | Keep the Spec 02 details route (`/lifelong-learning/courses/:courseId`) | Avoid a breaking route change; alias (if any) is Spec 06 |
| AD-303 | Compose details from small presentation components under `details/` | Cohesive Team A ownership; testable |
| AD-304 | Reuse the discriminated-union request-state pattern | Consistency with catalogue; clear states |
| AD-305 | Enquiry = navigation seam; comparison = optional interface | Parallel development; independent testability |
| AD-306 | Availability via text + badge (Spec 02 model), never colour alone | Accessibility (NFR-304) |
| AD-307 | No Course-model changes | Protect the shared contract across parallel teams |

## 14. Consistency Check

Every FR/NFR in `requirements.md` maps to a design section here and to at least
one task in `tasks.md`. This design extends Spec 02, reuses Spec 01/02 foundations,
introduces no backend changes, and contains no AI-agent/WebMCP design beyond the
conceptual note in §12.
