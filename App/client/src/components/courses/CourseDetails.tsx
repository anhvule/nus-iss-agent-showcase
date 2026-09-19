'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesApi, CourseApiError } from '@/lib/courses/api';
import type { Course } from '@/lib/courses/types';
import {
  COURSE_LEVEL_LABELS,
  COURSE_TYPE_LABELS,
  DELIVERY_MODE_LABELS,
} from '@/lib/courses/types';
import { formatFee, formatDuration } from '@/lib/courses/format';
import { AvailabilityBadge } from './AvailabilityBadge';
import { Card } from '@/components/ui/Card';

/**
 * Minimal course details view (FR-217). Fetches a single course and shows a
 * not-found state for unknown/unlistable ids. Deliberately minimal — the rich
 * details experience is Specification 03. Presentation only.
 */

type DetailState =
  | { phase: 'loading' }
  | { phase: 'found'; course: Course }
  | { phase: 'notFound' }
  | { phase: 'error'; message: string };

export function CourseDetails({ courseId }: { courseId: string }): React.JSX.Element {
  const [state, setState] = useState<DetailState>({ phase: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ phase: 'loading' });

    coursesApi
      .getById(courseId, controller.signal)
      .then((course) => setState({ phase: 'found', course }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof CourseApiError && error.status === 404) {
          setState({ phase: 'notFound' });
          return;
        }
        setState({
          phase: 'error',
          message:
            error instanceof CourseApiError
              ? error.message
              : 'Something went wrong. Please try again.',
        });
      });

    return () => controller.abort();
  }, [courseId]);

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb">
        <Link
          href="/lifelong-learning/courses"
          className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-sky-800 hover:text-sky-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          <span aria-hidden="true">‹</span> Back to Course Catalogue
        </Link>
      </nav>

      {state.phase === 'loading' && (
        <p aria-live="polite" className="text-slate-600">
          Loading course…
        </p>
      )}

      {state.phase === 'notFound' && (
        <div role="status" className="rounded-lg border border-dashed border-slate-300 bg-white p-8">
          <h1 className="text-2xl font-bold text-slate-900">Course not found</h1>
          <p className="mt-1 text-slate-600">
            We couldn&apos;t find a course with that identifier. It may have been
            removed or is not currently listed.
          </p>
        </div>
      )}

      {state.phase === 'error' && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-8">
          <h1 className="text-2xl font-bold text-red-900">Unable to load course</h1>
          <p className="mt-1 text-red-800">{state.message}</p>
        </div>
      )}

      {state.phase === 'found' && (
        <article className="space-y-5">
          <header className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium uppercase tracking-wide text-sky-700">
                {state.course.discipline}
              </p>
              <AvailabilityBadge availability={state.course.availability} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {state.course.title}
            </h1>
            <p className="text-sm text-slate-500">Course code: {state.course.code}</p>
          </header>

          <p className="max-w-2xl text-slate-700">{state.course.description}</p>

          <Card as="section" className="max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-900">At a glance</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Course type</dt>
                <dd className="text-slate-800">
                  {COURSE_TYPE_LABELS[state.course.courseType]}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Level</dt>
                <dd className="text-slate-800">
                  {COURSE_LEVEL_LABELS[state.course.level]}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Delivery mode</dt>
                <dd className="text-slate-800">
                  {DELIVERY_MODE_LABELS[state.course.deliveryMode]}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Duration</dt>
                <dd className="text-slate-800">
                  {formatDuration(state.course.durationWeeks)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Next intake</dt>
                <dd className="text-slate-800">{state.course.intake}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Fee</dt>
                <dd className="text-slate-800">
                  {formatFee(state.course.fee, state.course.currency)}
                </dd>
              </div>
            </dl>
          </Card>

          <p className="text-sm text-slate-400">
            This is a minimal details view. Richer course content and comparison
            are added by a later specification.
          </p>
        </article>
      )}
    </div>
  );
}
