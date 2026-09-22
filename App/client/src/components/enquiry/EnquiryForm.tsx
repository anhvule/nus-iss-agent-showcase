'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Course } from '@/lib/courses/types';
import {
  ENQUIRY_TYPES,
  ENQUIRY_TYPE_LABELS,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  type EnquiryInput,
  type EnquiryType,
} from '@/lib/enquiries/types';
import {
  validateEnquiryDraft,
  type EnquiryDraft,
  type EnquiryErrors,
} from '@/lib/enquiries/validation';
import { EnquiryField } from './EnquiryField';
import { SyntheticDataNotice } from './SyntheticDataNotice';

/**
 * Enquiry form (FR-504, FR-506, FR-507, FR-518, NFR-504).
 *
 * Presentation and UX only. It validates on the client so the learner gets
 * immediate feedback, but that check is advisory — the backend re-validates
 * every submission and remains the trust boundary (SR-501). The associated
 * course is displayed read-only and its id travels with the request, so a
 * learner can never enquire about a course they did not choose (FR-502).
 */

const EMPTY_DRAFT: EnquiryDraft = {
  name: '',
  email: '',
  phone: '',
  enquiryType: 'general',
  message: '',
};

export function EnquiryForm({
  course,
  submitting,
  submitError,
  serverFieldErrors,
  onSubmit,
}: {
  course: Course;
  /** True while a submission is in flight; drives duplicate-submit protection. */
  submitting: boolean;
  /** Sanitised, form-level failure message from the last attempt. */
  submitError?: string;
  /** Field-level issues reported by the server's authoritative validation. */
  serverFieldErrors?: Record<string, string>;
  onSubmit: (input: EnquiryInput) => void;
}): React.JSX.Element {
  const fieldPrefix = useId();
  const [draft, setDraft] = useState<EnquiryDraft>(EMPTY_DRAFT);
  const [clientErrors, setClientErrors] = useState<EnquiryErrors>({});
  // Errors appear only after the first submit attempt, so the form does not
  // scold a learner for fields they have not reached yet.
  const [attempted, setAttempted] = useState(false);

  const errors: EnquiryErrors = attempted
    ? { ...(serverFieldErrors as EnquiryErrors), ...clientErrors }
    : (serverFieldErrors as EnquiryErrors) ?? {};

  const update = (field: keyof EnquiryDraft, value: string): void => {
    const next = { ...draft, [field]: value };
    setDraft(next);
    // Re-validate live once the learner has tried to submit, so a fixed field
    // stops showing an error as soon as it is valid.
    if (attempted) setClientErrors(validateEnquiryDraft(next));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    // Ignore a repeat submit while one is in flight (FR-518).
    if (submitting) return;

    setAttempted(true);
    const found = validateEnquiryDraft(draft);
    setClientErrors(found);
    if (Object.keys(found).length > 0) return;

    const phone = draft.phone.trim();
    onSubmit({
      name: draft.name.trim(),
      email: draft.email.trim(),
      courseId: course.id,
      enquiryType: draft.enquiryType as EnquiryType,
      message: draft.message.trim(),
      // Omitted entirely rather than sent empty: the field is optional and the
      // server treats absence and blank the same way (FR-504).
      ...(phone.length > 0 ? { phone } : {}),
    });
  };

  const id = (field: string): string => `${fieldPrefix}-${field}`;

  return (
    <form
      aria-labelledby="enquiry-form-heading"
      noValidate
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h1
          id="enquiry-form-heading"
          className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          Enquire about this course
        </h1>
        <p className="max-w-prose text-slate-700">
          Send a question about this course and we&apos;ll show you a confirmation with a
          reference number.
        </p>
      </div>

      {/* The course is context, not an input: read-only, and carried by id. */}
      <Card as="section" className="bg-slate-50">
        <h2 className="text-sm font-medium text-slate-600">Your enquiry is about</h2>
        <p className="mt-1 text-lg font-semibold text-slate-900">{course.title}</p>
        <p className="mt-1 text-sm text-slate-600">{course.shortDescription}</p>
        <p className="mt-3 text-sm">
          <Link
            href={`/lifelong-learning/courses/${encodeURIComponent(course.id)}`}
            className="rounded-sm font-medium text-sky-800 underline hover:text-sky-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            View the full course details
          </Link>
        </p>
      </Card>

      <SyntheticDataNotice />

      {submitError && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-900">We couldn&apos;t send your enquiry</p>
          <p className="mt-1 text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <EnquiryField id={id('name')} label="Your name" error={errors.name}>
          {(props) => (
            <input
              {...props}
              name="name"
              type="text"
              autoComplete="name"
              maxLength={NAME_MAX_LENGTH}
              required
              value={draft.name}
              onChange={(event) => update('name', event.target.value)}
            />
          )}
        </EnquiryField>

        <EnquiryField id={id('email')} label="Email address" error={errors.email}>
          {(props) => (
            <input
              {...props}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={draft.email}
              onChange={(event) => update('email', event.target.value)}
            />
          )}
        </EnquiryField>

        <EnquiryField
          id={id('phone')}
          label="Phone number"
          optional
          hint="Include the country code if you are outside Singapore."
          error={errors.phone}
        >
          {(props) => (
            <input
              {...props}
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={PHONE_MAX_LENGTH}
              value={draft.phone}
              onChange={(event) => update('phone', event.target.value)}
            />
          )}
        </EnquiryField>

        <EnquiryField
          id={id('enquiryType')}
          label="What is your enquiry about?"
          error={errors.enquiryType}
        >
          {(props) => (
            <select
              {...props}
              name="enquiryType"
              required
              value={draft.enquiryType}
              onChange={(event) => update('enquiryType', event.target.value)}
            >
              {ENQUIRY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ENQUIRY_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          )}
        </EnquiryField>

        <div className="sm:col-span-2">
          <EnquiryField
            id={id('message')}
            label="Your enquiry"
            hint={`Between ${MESSAGE_MIN_LENGTH} and ${MESSAGE_MAX_LENGTH} characters.`}
            error={errors.message}
          >
            {(props) => (
              <textarea
                {...props}
                name="message"
                rows={6}
                maxLength={MESSAGE_MAX_LENGTH}
                required
                value={draft.message}
                onChange={(event) => update('message', event.target.value)}
              />
            )}
          </EnquiryField>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send enquiry'}
        </Button>
        <Link
          href={`/lifelong-learning/courses/${encodeURIComponent(course.id)}`}
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
