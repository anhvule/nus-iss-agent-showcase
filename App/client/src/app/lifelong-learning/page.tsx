import Link from 'next/link';
import { Card } from '@/components/ui/Card';

/**
 * Lifelong Learning landing page. Introduces the section and links to the Course
 * Catalogue capability added by Specification 02.
 */
export default function LifelongLearningPage(): React.JSX.Element {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Lifelong Learning
        </h1>
        <p className="max-w-2xl text-slate-600">
          Continuing education and professional development for working adults.
          Explore short courses, part-time programmes, and micro-credentials
          across a range of disciplines.
        </p>
      </section>

      <section aria-labelledby="catalogue-heading" className="space-y-4">
        <h2 id="catalogue-heading" className="text-2xl font-semibold text-slate-900">
          Course Catalogue
        </h2>
        <Card className="max-w-xl">
          <p className="text-slate-600">
            Browse, search, filter, and sort the full catalogue of synthetic
            courses, then open any course to view its details.
          </p>
          <div className="mt-4">
            <Link
              href="/lifelong-learning/courses"
              className="inline-flex items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              Browse the Course Catalogue
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
