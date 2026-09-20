# Specification 04 — Human Course Comparison · Design

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 04-course-comparison
**Audience:** Senior engineers, solution architects, accessibility/QA reviewers
**Traceability:** Implements `./requirements.md`; extends `.kiro/specs/02-course-catalogue/design.md`; consistent with `.kiro/steering/*`.

---

## 1. Executive Summary

This design adds a **client-side course comparison** feature: a shared comparison
provider holds a small list of selected course ids/items, a reusable add/remove
control appears on catalogue cards (and, via the shared interface, on the details
page), and a Comparison View renders the selected courses side by side over the
**shared Course model**. It is **frontend-only** — no backend logic, no new
endpoints, no database. Business-ish rules here are limited to UI selection rules
(duplicate prevention, a max of 4); there is no ranking, scoring, or
recommendation.

This is a **Phase 1 (human website)** specification and contains **no** AI-agent
or WebMCP design (see §12 for a conceptual forward-looking note only).

## 2. Architectural Goals

1. **Reuse the Course model; no duplicate data structure** (NFR-401).
2. **Simplest appropriate client state** — a React context/provider, no DB
   (FR-406).
3. **A clean shared interface** other specs consume without coupling to internals
   (FR-416).
4. **Accessible, responsive comparison** across breakpoints (NFR-404, NFR-405).
5. **Guarded seams** — navigation to details (Spec 03) and enquiry (Spec 05).

## 3. Comparison State Architecture (FR-406, FR-407, FR-416)

- A **`ComparisonProvider`** (React context) mounted high in the app shell
  (e.g. in the client layout / a client wrapper) so state is shared across the
  catalogue, details, and comparison view within a session.
- State shape (conceptual): an ordered list of selected course **items** keyed by
  `id`. Storing the full `Course` item (captured at add time) lets the comparison
  view render immediately without a round-trip; ids alone are sufficient if items
  are re-fetched (both are acceptable — see §6).
- Exposed hook **`useComparison()`** returns the documented interface:
  `items`, `add(course)`, `remove(id)`, `has(id)`, `clear()`, `count`, `isFull`,
  and a `max` constant.
- **Duplicate prevention (FR-403):** `add` is a no-op when `has(id)` is true.
- **Limit (FR-404):** `add` is rejected (no-op + surfaced signal) when `count`
  equals `max` (4) and the id is not already present; `isFull` drives UI messaging.
- **Optional session persistence (FR-407):** may hydrate/save ids to
  `sessionStorage` as a progressive enhancement; not required for the MVP.

## 4. Course Identity (FR-405)

- Identity is the shared Course **`id`** everywhere (add/remove/has/duplicate/limit
  and navigation). No new identifier is introduced.

## 5. UI Component Structure

Under `client/src/components/comparison/` (Team B ownership):

- `ComparisonProvider` + `useComparison` — state/context and the shared interface
  (also exported for Spec 03 to consume).
- `AddToCompareButton` — reusable control showing add vs "added" state, disabled
  with an accessible reason when `isFull` and the course is not already selected
  (used by the catalogue card and, via the interface, the details page).
- `ComparisonBar` (optional but recommended) — a compact "Compare (n)" affordance
  showing the current count with a link to the comparison view (FR-408).
- `ComparisonView` — the page body: empty state when `count === 0`, otherwise the
  comparison table/sections plus per-course actions.
- `ComparisonTable` — the aligned attribute-by-attribute comparison (desktop) and
  the responsive stacked variant (mobile).

Catalogue integration: the Spec 02 `CourseCard` gains an `AddToCompareButton`
(rendered through the interface). This is an additive change coordinated in
integration; Spec 04 provides the control and the interface.

## 6. Route & Data (FR-409, FR-415)

- **Route:** a new comparison route, e.g.
  `client/src/app/lifelong-learning/courses/compare/page.tsx`
  (final path confirmed in integration; must not collide with the
  `[courseId]` details route — a static `compare` segment under `courses/` is
  safe, or a top-level `/lifelong-learning/compare`).
- **Data:** the comparison view renders from `items` captured on add. If only ids
  are stored (or to refresh), it may fetch each by id via the existing
  `coursesApi.getById`. Either way, it reuses the shared Course model and the
  existing API — **no** direct data-source access and **no** duplicated catalogue
  querying (NFR-401).

## 7. Comparison Layout & Attributes (FR-410, FR-411)

- Attributes compared (all from the shared model): title, course type, discipline
  (+ category where useful), delivery mode, duration, eligibility, fee (+
  currency), intake, availability/status. Uses Spec 02 label maps and `format.ts`.
- **Desktop:** a comparison **table** — attribute rows × course columns (or
  courses as rows and attributes as columns; choose one and keep header
  associations correct). Differences are easy to scan; **no** ranking/scoring/
  highlighting-as-recommendation (neutral presentation only).
- Each course column/section has a header (title + availability badge) and actions
  (open details, remove, enquire).

## 8. Responsive Behaviour (NFR-405)

- **Desktop/tablet:** side-by-side columns.
- **Mobile:** the comparison table becomes horizontally scrollable within a
  bounded container, and/or collapses into **stacked per-course sections** (each
  course as a card listing the same attributes in the same order) so it is usable
  on small screens. Availability remains text + badge.

## 9. Accessibility (NFR-404)

- Comparison rendered with proper **table semantics** (`table`/`th` with `scope`,
  or an equivalently accessible structure) so screen readers announce
  attribute/course associations; the stacked mobile variant uses headings +
  definition lists.
- `AddToCompareButton` is a real `button` with an accessible label reflecting
  add/added/disabled(full) state; the disabled-at-limit reason is announced.
- Count and add/remove changes announced via an `aria-live` region.
- Keyboard operability and visible focus throughout; availability not colour-only.

## 10. Testing Strategy (maps to §11 tasks; steering: Vitest + Testing Library)

- **Unit (state/interface, Team B):** `useComparison` — add, remove, `has`,
  duplicate no-op (FR-403), limit enforcement at 4 (FR-404), `count`/`isFull`,
  `clear`; deterministic ordering (NFR-406).
- **Component (Team B):** `AddToCompareButton` reflects add/added/disabled states
  and announces at limit; `ComparisonView` renders side-by-side attributes for
  selected courses (FR-410, FR-411), shows the empty state (FR-414), supports open
  details / remove / enquire navigation (FR-412, FR-413) via stubbed router/link
  `href`; accessibility assertions (table semantics/associations, labelled
  controls, aria-live). Where fetching by id is used, the API client is **faked**.
- **Integration (deferred to Spec 06/07):** catalogue add → comparison view →
  details/enquiry across features; not duplicated here.
- **Responsive:** layout assertions where practical + manual breakpoint checks.

## 11. Reuse Summary

| Reused artifact | Source | Usage |
| --------------- | ------ | ----- |
| Course type + label maps | Spec 02 `client/src/lib/courses/types.ts` | Course shape + display labels |
| `format.ts` (fee/duration) | Spec 02 | Display formatting |
| `AvailabilityBadge` | Spec 02 | Availability presentation |
| `coursesApi.getById` (if fetching) | Spec 02 | Refresh/populate items by id |
| `Button`, `Card`, `Container`, `cn` | Spec 01 | Primitives/styling |
| Details route | Spec 02/03 | "Open details" navigation |
| Enquiry entry point | Spec 05 (via Spec 03) | "Enquire" navigation |

## 12. Future Transformation (Phase 2 — forward-looking note only)

The comparison flow is plain UI over the shared Course model. A future, separate
specification could later inform a `compare_courses`-style capability after
inspecting the finished app. **No** agent, WebMCP, MCP, tool, registry, permission,
ranking, scoring, or AI code is designed or created here.

## 13. Architecture Decisions

| ID | Decision | Rationale |
| -- | -------- | --------- |
| AD-401 | Client-side React context provider for comparison state | Simplest appropriate MVP approach; no DB (FR-406) |
| AD-402 | Identity = shared Course `id` | One identity across features; no new key |
| AD-403 | Store items (captured on add); optional id-only + refetch | Instant render without round-trips; still reuses model |
| AD-404 | Max comparison size = 4, duplicate = no-op | Predictable, clearly enforced selection rules |
| AD-405 | Expose `useComparison()` as the shared interface | Lets Spec 03 add without coupling to internals |
| AD-406 | New `compare` route under `lifelong-learning` | Avoids collision with `[courseId]`; matches IA |
| AD-407 | Neutral comparison table (no ranking/scoring) | Human comparison only; no AI/recommendation |
| AD-408 | No Course-model changes | Protect the shared contract across parallel teams |

## 14. Consistency Check

Every FR/NFR in `requirements.md` maps to a design section here and to at least one
task in `tasks.md`. This design extends Spec 02, reuses Spec 01/02 foundations,
introduces no backend changes, and contains no AI-agent/WebMCP design beyond the
conceptual note in §12.
