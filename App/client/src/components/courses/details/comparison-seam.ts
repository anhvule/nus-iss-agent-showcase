import type { Course } from '@/lib/courses/types';

/**
 * Cross-spec seam for the optional "Add to comparison" affordance (FR-314).
 *
 * Specification 04 owns comparison state and rules; Specification 03 only
 * *consumes* them. This type is the structural subset of Spec 04's documented
 * `useComparison()` interface that the details page needs — it deliberately
 * implements **no** comparison internals (no state, no capacity or duplicate
 * rules), so the page delegates every decision to the provided implementation.
 *
 * The seam is passed in as an optional prop rather than read from a context
 * owned here: when Spec 04 is not available the prop is simply absent, the
 * affordance is omitted, and the rest of the page is unaffected (AC-309).
 * Integration (Spec 06) supplies the real `useComparison()` value.
 */
export interface CourseComparisonSeam {
  /** Add a course to the comparison. Duplicate/limit handling belongs to Spec 04. */
  add: (course: Course) => void;
  /** Whether the course is already selected for comparison. */
  has: (courseId: string) => boolean;
  /** Whether the comparison is at capacity. */
  isFull: boolean;
  /** Maximum number of courses the comparison holds (Spec 04 defines the value). */
  max: number;
}
