# Specification 06 — Human Website Integration & Completion · Design

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 06-human-website-integration
**Audience:** Integration lead, senior engineers, solution architects, accessibility/QA reviewers
**Traceability:** Implements `./requirements.md`; extends `.kiro/specs/01-foundation/design.md` and Specs 02–05; consistent with `.kiro/steering/*` and `App/docs/phase-1-integration.md`.

---

## 1. Executive Summary

This design describes how the independently-specified human capabilities
(Catalogue 02, Details 03, Comparison 04, Enquiry 05) are wired into **one coherent
website** on the Specification 01 shell. It is primarily a **frontend integration**
design: mount shared state in the shell, complete the global shell/navigation,
standardise cross-feature UI/state patterns, wire the cross-feature navigation
seams, and validate the shared contracts. It adds **no** new business logic and
**no** new backend endpoints (Spec 05 owns the only new endpoint).

The layered architecture is preserved end to end:

```
Human User → Human UI → REST API → Business Services → Repositories → Synthetic Data
```

This is a **Phase 1** specification and contains **no** AI-agent or WebMCP design
(see §13 for a conceptual forward-looking note only).

## 2. Design Goals

1. **Coherence without coupling** — features plug into shared shell/state seams;
   the integration layer wires them without editing feature internals (NFR-601,
   §12 of requirements).
2. **One Course contract, one Course ID** across all features (FR-611–FR-613,
   NFR-602).
3. **Consistent shell, navigation, and global UX** (FR-614–FR-622, FR-627–FR-631).
4. **Shared cross-feature state** (comparison) mounted once (FR-623).
5. **Accessible, responsive, non-regressive** integration (NFR-605, NFR-606,
   NFR-610).

## 3. Application Integration Architecture

**Composition layers (client):**

```
RootLayout (Spec 01 shell: <header>/<main>/<footer>, skip link)
  └─ AppProviders            # NEW (Spec 06): mounts cross-feature client providers
       └─ ComparisonProvider # OWNED BY Spec 04; MOUNTED here (FR-623, CQ-4)
       └─ NotificationProvider# NEW (Spec 06): lightweight global status/toasts (FR-621, CQ-5)
            └─ page content (per route)
```

- **`AppProviders`** is an integration-owned client wrapper placed inside the
  Spec 01 layout so every route shares comparison state and the notification
  channel. It contains **no business logic** — only context composition.
- Feature components (catalogue cards, details, comparison view, enquiry form) are
  unchanged internally; they **consume** the mounted providers and the shared shell
  components.

**Backend:** unchanged by Spec 06. The only Phase-1 write endpoint
(`POST /api/enquiries`) is owned by Spec 05. Integration does not add endpoints or
move logic out of services.

## 4. Navigation Architecture (FR-614–FR-619, FR-626)

- **Header + primary navigation (Spec 01):** reused as-is; active top-level section
  already derived from the pathname. Lifelong Learning stays the top-level entry to
  the course journeys.
- **Lifelong-Learning sub-navigation (FR-615, completion):** a small secondary nav
  (or prominent links on the LL landing) exposing **Course Catalogue** and
  **Compare**, shown within the Lifelong-Learning area. Implemented as a shared
  shell component so it is consistent across LL routes.
- **Breadcrumbs (FR-617):** a reusable, accessible `Breadcrumbs` shell component
  (semantic `nav` + ordered list, `aria-current="page"` on the last crumb) used on
  the course routes, e.g.:
  - Catalogue: `Lifelong Learning › Course Catalogue`
  - Details: `Lifelong Learning › Course Catalogue › {Course title}`
  - Enquiry: `Lifelong Learning › Course Catalogue › {Course title} › Enquire`
  - Comparison: `Lifelong Learning › Course Catalogue › Compare`
  Breadcrumb labels for a course derive from the loaded Course (no new data).
- **Client-side navigation & history (FR-618):** all links use the App Router
  (`next/link` / `useRouter`); back/forward behaviour is the browser default. The
  catalogue already reflects its query state in the URL, so returning to it
  restores prior state (FR-624).
- **Deep links (FR-619):** every primary route renders directly (catalogue with
  query params, `/lifelong-learning/courses/:courseId`, the comparison route, the
  enquiry entry route). Pages that read `useSearchParams` remain wrapped in
  `Suspense` (established in Spec 02).
- **Route decisions (FR-626, CQ-2, CQ-3):**
  - **Comparison route:** a **static** segment under the courses area
    (e.g. `/lifelong-learning/courses/compare`). Next.js resolves static segments
    before the dynamic `[courseId]`, but to remove all ambiguity the integration
    may place it at `/lifelong-learning/compare`. Final path confirmed in
    integration (TASK-602/605).
  - **Enquiry entry route (CQ-1):** recommended **nested** route
    `/lifelong-learning/courses/:courseId/enquire` so the course context is explicit
    and breadcrumbs/deep-links are natural. Spec 05 owns/finalises it; consumers
    (03/04) link to the confirmed value (TASK-603).
  - **Top-level `/courses/:courseId` alias:** **not added by default**; if desired,
    an integration-level redirect to the canonical LL route (TASK-609/610).

## 5. Shared UI Architecture (FR-620–FR-622, NFR-604)

- **Primitives (Spec 01):** `Button`, `Card`, `Container`, `cn` remain the single
  source of shared presentation; integration does not fork them.
- **Cross-feature patterns (standardised, documented):** integration publishes a
  short "UI consistency guide" (in docs) describing the agreed patterns already
  used by Specs 02/03/05 so all features stay aligned:
  - **Status/availability:** the Spec 02 `AvailabilityBadge` (text + glyph, never
    colour alone).
  - **Request state:** the discriminated-union `loading | success | empty | error`
    pattern (from Spec 01 `HealthState` / Spec 02 catalogue).
  - **Buttons/forms/cards/layout:** Spec 01 primitives + Spec 02 form-control
    styling; `Container`/`PageContainer` for page layout.
- **Global notifications (FR-621, CQ-5):** a `NotificationProvider` + `useNotify()`
  exposing lightweight, transient status messages rendered in an accessible
  `aria-live="polite"` region (assertive for errors). Features may use it for
  cross-feature feedback (e.g. "Enquiry submitted — reference ENQ-…", "Comparison
  is full (max 4)"). Presentation only; no business logic. Local inline states in
  features remain valid; the provider standardises *global* feedback.
- **Page metadata (FR-622):** consistent `metadata`/titles per route (Next.js
  `metadata` export), e.g. "Course Catalogue — EduAgent Connect", "{Course} —
  EduAgent Connect", "Enquire — EduAgent Connect".

## 6. Cross-Feature State (FR-623, FR-624)

- **Comparison state** is provided once by `ComparisonProvider` (Spec 04) mounted in
  `AppProviders`. The catalogue card's add-to-compare control, the details page's
  optional add-to-compare affordance, the comparison bar/count, and the comparison
  view all read the **same** context, so a course added anywhere is reflected
  everywhere (AC-602, AC-604).
- **Catalogue query state** persists in the URL (Spec 02), so Details/Comparison →
  "Back to catalogue" restores the previous results without new state machinery
  (FR-624).
- **No global data store is introduced** beyond comparison; enquiry state is local
  to the enquiry flow (Spec 05).

## 7. Cross-Feature Course Identity (FR-611–FR-613)

- The shared `Course.id` is the single identity used in: catalogue card links,
  details route param, comparison entries, the enquiry entry route param, and the
  enquiry payload's `courseId`. Integration verifies the same id flows unchanged
  Catalogue → Details → Comparison → Enquiry → confirmation, and that the enquiry is
  associated with exactly that id (AC-609).

## 8. Error, Loading & Empty Strategy (FR-627–FR-631, NFR-605)

- **Global 404 (FR-627):** a Next.js `not-found`/`app/not-found.tsx` page in the
  shell offering a path back into the site (catalogue/home). Consistent styling with
  the rest of the site.
- **Invalid/unavailable course (FR-628):** the details page (Spec 03) and the
  enquiry flow (Spec 05) already map API 404 to a clear not-found/unavailable state;
  the comparison view handles a removed/unavailable course gracefully. Integration
  ensures these use the **same** copy/pattern and offer a path back.
- **API failure / network error (FR-629):** the shared request-state pattern's
  `error` phase with a retry affordance, consistent across features; internals are
  never exposed (reusing Spec 01 sanitised errors on the server side).
- **Empty states (FR-630):** consistent empty presentations for no catalogue results
  (Spec 02) and empty comparison (Spec 04), each with clear next steps
  (adjust filters / add courses).
- **Failed enquiry (FR-631):** the enquiry `error` phase preserves entered data where
  reasonable and offers retry (Spec 05); integration confirms consistency with the
  global error pattern and may surface a global notification.

## 9. Responsive Strategy (NFR-606)

- The shell (`Container`, `PageContainer`) already provides responsive width/padding.
- **Mobile navigation (FR-618, AC-614):** integration provides a usable mobile
  navigation pattern for the primary nav and the LL sub-nav (e.g. a disclosure/menu
  on small screens) as a shared shell component — not a shrunken desktop bar.
- Feature-level responsiveness (catalogue grid, comparison table stacking, forms)
  is owned by Specs 02–05; integration verifies the **journey** is consistent across
  breakpoints and that the shell adapts.

## 10. Accessibility Strategy (NFR-605)

- **Landmarks & headings:** the shell provides `header`/`main`/`footer` and a skip
  link (Spec 01); each page has exactly one H1. Integration verifies heading order
  across the journey and that breadcrumbs use correct semantics.
- **Keyboard & focus:** all nav, breadcrumbs, controls, and journey actions are
  keyboard-operable with visible focus; on client-side route changes, integration
  ensures focus is managed sensibly (e.g. focus moves to the main heading/region)
  so keyboard/screen-reader users are oriented.
- **Announcements:** the notification region is `aria-live`; feature status regions
  (catalogue count, enquiry status) remain announced.
- **Colour independence:** availability and status never rely on colour alone.

## 11. Integration Testing Approach (NFR-609; formal gate = Spec 07)

- **Seam/integration tests (Integration Lead):** each cross-feature navigation
  (FR-601–FR-610) with stubbed router/faked API clients; Course-ID continuity
  (FR-612/FR-613); comparison-state sharing across catalogue/details/comparison
  (FR-623); breadcrumb correctness; global 404; the notification pattern.
- **Consistency tests:** error/empty/loading/not-found render consistently across
  features.
- **Responsive & a11y integration checks:** mobile nav usability, keyboard
  traversal of the journey, focus management on route change, aria-live
  announcements.
- **Non-regression:** Spec 01 health/shell and Spec 02 catalogue behaviours still
  pass; Specs 03–05 still pass their own suites.
- **Boundary with Spec 07:** full end-to-end journeys and exhaustive
  accessibility/responsive audits are **owned/expanded by Spec 07**; Spec 06 keeps
  to seam-level integration to avoid duplicating that suite.
- Tooling reuses the Spec 02 setup (Vitest + Testing Library on the client;
  supertest on the server where relevant). No new runners introduced.

## 12. Reuse Summary

| Reused artifact | Source | Usage in integration |
| --------------- | ------ | -------------------- |
| RootLayout, Header, Navigation, Footer, PageContainer, skip link | Spec 01 | Shell to extend (add providers, sub-nav, breadcrumbs, footer links) |
| `Button`, `Card`, `Container`, `cn` | Spec 01 | Shared primitives for new shell components |
| Course type/ID, `coursesApi`, `AvailabilityBadge`, label maps, `format.ts` | Spec 02 | Course identity, data, consistent presentation |
| Catalogue URL query state | Spec 02 | Context preservation on "back to catalogue" |
| Details page + Enquire/compare affordances | Spec 03 | Wiring targets |
| `useComparison` / comparison view / add-remove control | Spec 04 | Provider mounted in shell; consumed across features |
| Enquiry route/params, form, `POST /api/enquiries` | Spec 05 | Enquiry navigation + confirmation |
| Spec 01 server infra (validate/ApiError/handler/logger/config/security) | Spec 01 | Unchanged; underpins consistent errors |

## 13. Future Transformation (Phase 2 — forward-looking note only)

After Phase 1 is complete, a separate Phase 2 effort will analyse the completed,
integrated human website and expose selected existing capabilities as an
Agent-Ready / WebMCP architecture. **No** agent, WebMCP, MCP, tool, registry,
permission, or AI-model code is designed or created in Spec 06.

## 14. Architecture Decisions

| ID | Decision | Rationale |
| -- | -------- | --------- |
| AD-601 | Add an integration-owned `AppProviders` wrapper in the Spec 01 shell | Mount shared providers once without editing feature internals (FR-623) |
| AD-602 | Mount Spec 04's `ComparisonProvider` in the shell | One shared comparison state across features (FR-623, CQ-4) |
| AD-603 | Add a shell-level `NotificationProvider`/`useNotify` (aria-live) | Consistent, accessible cross-feature feedback (FR-621, CQ-5) |
| AD-604 | Reusable `Breadcrumbs` + LL sub-nav shell components | Orientation and completeness without touching features (FR-615, FR-617) |
| AD-605 | Recommend nested enquiry route `/…/courses/:courseId/enquire` | Explicit course context; natural breadcrumbs/deep links (CQ-1) |
| AD-606 | Comparison route as a static segment; confirm final path in integration | Avoid `[courseId]` collision (CQ-2) |
| AD-607 | No top-level `/courses/:courseId` alias by default | Keep canonical LL routes; alias only if agreed (FR-626, CQ-3) |
| AD-608 | Global `not-found.tsx`; reuse feature error/empty patterns | Consistent, sanitised cross-feature states (FR-627–FR-631) |
| AD-609 | Manage focus on client-side route change | Accessible SPA navigation (NFR-605) |
| AD-610 | No Course-model change; no new endpoints; no business logic in shell | Preserve architecture & shared contract (NFR-601, NFR-602, NFR-608) |

## 15. Consistency Check

Every FR/NFR in `requirements.md` maps to a design section here and to at least one
task in `tasks.md`. This design preserves the Spec 01 layering, reuses Specs 01–05
foundations, changes no feature internals or the Course model, adds no backend
endpoints, and contains no AI-agent/WebMCP design beyond the conceptual note in
§13.
