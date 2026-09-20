import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Course enquiry entry — EduAgent Connect',
  description:
    'Entry point for course-specific enquiries in EduAgent Connect. Full enquiry workflow lands in a later specification.',
};

/**
 * Spec 03 enquiry entry seam (FR-312).
 *
 * Specification 03 must provide a clear Enquire action that carries course
 * identity. The full enquiry workflow is implemented by Specification 05; until
 * then this route provides a stable, course-scoped entry point.
 */
export default function CourseEnquiryEntryPage({
  params,
}: {
  params: { courseId: string };
}): React.JSX.Element {
  const decodedCourseId = decodeURIComponent(params.courseId);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Course enquiry
      </h1>
      <p className="text-slate-700">
        You started an enquiry for course ID{' '}
        <span className="font-medium text-slate-900">{decodedCourseId}</span>.
      </p>
      <p className="text-slate-700">
        The full enquiry workflow is introduced in Specification 05. For now, this
        entry point confirms course identity handoff from the details page.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/lifelong-learning/courses/${encodeURIComponent(decodedCourseId)}`}
          className="inline-flex items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          Back to course details
        </Link>
        <Link
          href="/lifelong-learning/courses"
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          Back to course catalogue
        </Link>
      </div>
    </main>
  );
}
