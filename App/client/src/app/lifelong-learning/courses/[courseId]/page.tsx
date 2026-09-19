import type { Metadata } from 'next';
import { CourseDetails } from '@/components/courses/CourseDetails';

export const metadata: Metadata = {
  title: 'Course details — EduAgent Connect',
  description: 'Details for a synthetic course. For demonstration only.',
};

/**
 * Course details route (FR-217, AD-208) at
 * /lifelong-learning/courses/[courseId].
 *
 * This is a **minimal** placeholder so navigation from a course card works end
 * to end. It fetches the course via `GET /api/courses/:courseId` and shows a
 * not-found state for unknown ids. Rich details content is Specification 03.
 */
export default function CourseDetailsPage({
  params,
}: {
  params: { courseId: string };
}): React.JSX.Element {
  return <CourseDetails courseId={params.courseId} />;
}
