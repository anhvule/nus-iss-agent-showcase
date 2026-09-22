import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { coursesApi } from '@/lib/courses/api';
import { enquiriesApi, EnquiryApiError } from '@/lib/enquiries/api';
import { CourseEnquiry } from '@/components/enquiry/CourseEnquiry';

/**
 * Client ↔ API integration test (Spec 05, TASK-520).
 *
 * Nothing is faked: the real Express application runs in-process on an
 * ephemeral port, the real `coursesApi`/`enquiriesApi` clients call it over
 * HTTP, and the real form renders the result. That makes this the only test
 * that would catch a request/response contract drift between the two
 * workspaces. Cross-feature navigation stays with Spec 06/07.
 */

let server: Server;
let courseId: string;
let courseTitle: string;
const originalBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

beforeAll(async () => {
  // Silence request logging before the config module is first evaluated, so the
  // suite's output stays pristine.
  process.env.LOG_LEVEL = 'silent';
  const { createApp } = await import('../../../../server/src/app');

  server = createServer(createApp());
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  process.env.NEXT_PUBLIC_API_BASE_URL = `http://127.0.0.1:${port}`;

  // Use a course the running catalogue actually serves, rather than a fixture
  // that could drift from the synthetic dataset.
  const listed = await coursesApi.list({ pageSize: 1 });
  const first = listed.data[0];
  if (first === undefined) throw new Error('The catalogue returned no courses');
  courseId = first.id;
  courseTitle = first.title;
});

afterAll(async () => {
  if (originalBaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  } else {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalBaseUrl;
  }
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

describe('enquiry flow against the real API (AC-503)', () => {
  it('submits the form and confirms with a reference issued by the server', async () => {
    const user = userEvent.setup();
    render(<CourseEnquiry courseId={courseId} />);
    await screen.findByRole('form', { name: /enquire about this course/i });

    await user.type(screen.getByLabelText(/your name/i), 'Alex Tan');
    await user.type(screen.getByLabelText(/email/i), 'alex.tan@example.com');
    await user.selectOptions(
      screen.getByLabelText(/what is your enquiry about/i),
      'fees_funding',
    );
    await user.type(
      screen.getByLabelText('Your enquiry'),
      'Is subsidised funding available for this course?',
    );
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    const confirmation = await screen.findByRole('region', { name: /enquiry received/i });
    expect(confirmation).toHaveTextContent(/ENQ-\d{4}-\d{6}/);
    expect(confirmation).toHaveTextContent(courseTitle);
  });

  it('shows the unavailable-course state for a course the API does not serve (AC-505)', async () => {
    render(<CourseEnquiry courseId="no-such-course" />);

    expect(
      await screen.findByRole('heading', { name: /course is not available/i }),
    ).toBeInTheDocument();
  });
});

describe('server validation is authoritative (AC-504)', () => {
  it('rejects an invalid payload sent straight to the API, bypassing the form', async () => {
    await expect(
      enquiriesApi.submit({
        name: '',
        email: 'not-an-email',
        courseId,
        enquiryType: 'general',
        message: 'too short',
      }),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
  });

  it('reports which fields the server rejected', async () => {
    const error = await enquiriesApi
      .submit({
        name: '',
        email: 'not-an-email',
        courseId,
        enquiryType: 'general',
        message: 'too short',
      })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(EnquiryApiError);
    expect(Object.keys((error as EnquiryApiError).fieldErrors ?? {}).sort()).toEqual([
      'email',
      'message',
      'name',
    ]);
  });

  it('rejects an enquiry for an unknown course with a sanitised 404', async () => {
    await expect(
      enquiriesApi.submit({
        name: 'Alex Tan',
        email: 'alex.tan@example.com',
        courseId: 'no-such-course',
        enquiryType: 'general',
        message: 'Is this course still running next intake?',
      }),
    ).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: 'The selected course is not available for enquiries.',
    });
  });
});
