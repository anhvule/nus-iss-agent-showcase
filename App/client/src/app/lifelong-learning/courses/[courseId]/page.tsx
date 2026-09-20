import type { Metadata } from 'next';
import { CourseDetails } from '@/components/courses/CourseDetails';

export const metadata: Metadata = {
  title: 'Course details — EduAgent Connect',
  description:
    'Full details for a synthetic continuing-education course: description, key facts, entry requirements, skills, availability, and how to enquire. For demonstration only.',
};

/**
 * Course Details route (FR-301, FR-303, AD-302) at
 * /lifelong-learning/courses/[courseId].
 *
 * Server-component host: it passes the route's `courseId` to the client
 * `CourseDetails` component, which fetches the course through the existing
 * `GET /api/courses/:courseId` endpoint. Because the fetch is keyed on the id,
 * the page is deep-linkable — opening the URL directly renders that course.
 *
 * The Spec 04 comparison interface is intentionally not supplied here; the
 * add-to-comparison affordance is omitted until integration wires it in
 * (FR-314).
 */
export default function CourseDetailsPage({
  params,
}: {
  params: { courseId: string };
}): React.JSX.Element {
  return <CourseDetails courseId={params.courseId} />;
}
