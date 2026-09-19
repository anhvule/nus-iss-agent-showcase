import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseCard } from './CourseCard';
import type { Course } from '@/lib/courses/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(''),
}));

const course: Course = {
  id: 'sample-course',
  code: 'SMP-1000',
  title: 'Sample Course',
  shortDescription: 'A concise summary.',
  description: 'Full description.',
  discipline: 'Data Analytics',
  category: 'Analytics',
  courseType: 'part_time',
  level: 'intermediate',
  durationWeeks: 12,
  deliveryMode: 'blended',
  intake: 'May 2026',
  startDate: '2026-05-01',
  applicationDeadline: '2026-04-01',
  fee: 2400,
  currency: 'SGD',
  eligibility: 'Open',
  entryRequirements: [],
  skills: [],
  status: 'published',
  availability: 'closing_soon',
  tags: [],
};

describe('CourseCard', () => {
  it('renders key attributes with an accessible heading and details link', () => {
    render(<CourseCard course={course} />);

    expect(screen.getByRole('heading', { name: /sample course/i })).toBeInTheDocument();
    expect(screen.getByText('A concise summary.')).toBeInTheDocument();
    expect(screen.getByText('Part-time')).toBeInTheDocument();
    expect(screen.getByText('Blended')).toBeInTheDocument();
    expect(screen.getByText('12 weeks')).toBeInTheDocument();
    expect(screen.getByText('May 2026')).toBeInTheDocument();
    expect(screen.getByText('SGD 2,400')).toBeInTheDocument();
    // Availability communicated with text, not colour alone.
    expect(screen.getByText(/closing soon/i)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /view details for sample course/i });
    expect(link).toHaveAttribute('href', '/lifelong-learning/courses/sample-course');
  });
});
