/**
 * Client-side course types.
 *
 * These are compatible with the server's authoritative Course model (server owns
 * the Zod schema; the client uses derived, structurally-compatible types). They
 * are plain data shapes for rendering — no business logic lives here (FR-216).
 */

export const DISCIPLINES = [
  'Artificial Intelligence',
  'Data Analytics',
  'Cybersecurity',
  'Cloud Computing',
  'Software Development',
  'DevOps',
  'Digital Transformation',
  'Business',
  'Engineering',
  'Design',
  'Healthcare',
  'Hospitality',
] as const;

export const COURSE_TYPES = [
  'full_time',
  'part_time',
  'short_course',
  'micro_credential',
] as const;

export const DELIVERY_MODES = ['on_campus', 'online', 'blended'] as const;

export const COURSE_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'diploma',
  'post_diploma',
] as const;

export const COURSE_STATUSES = ['published', 'draft', 'archived'] as const;

export const COURSE_AVAILABILITIES = [
  'open',
  'closing_soon',
  'closed',
  'waitlist',
] as const;

export type Discipline = (typeof DISCIPLINES)[number];
export type CourseType = (typeof COURSE_TYPES)[number];
export type DeliveryMode = (typeof DELIVERY_MODES)[number];
export type CourseLevel = (typeof COURSE_LEVELS)[number];
export type CourseStatus = (typeof COURSE_STATUSES)[number];
export type CourseAvailability = (typeof COURSE_AVAILABILITIES)[number];

export interface Course {
  id: string;
  code: string;
  title: string;
  shortDescription: string;
  description: string;
  discipline: Discipline;
  category: string;
  courseType: CourseType;
  level: CourseLevel;
  durationWeeks: number;
  deliveryMode: DeliveryMode;
  intake: string;
  startDate: string;
  applicationDeadline: string;
  fee: number;
  currency: string;
  eligibility: string;
  entryRequirements: string[];
  skills: string[];
  status: CourseStatus;
  availability: CourseAvailability;
  tags: string[];
}

export type CourseSortField =
  | 'relevance'
  | 'title'
  | 'duration'
  | 'fee'
  | 'startDate';
export type SortDirection = 'asc' | 'desc';

/** Structured query the catalogue UI sends to the API (maps 1:1 to params). */
export interface CourseQueryParams {
  keyword?: string;
  discipline?: string[];
  category?: string[];
  courseType?: CourseType[];
  level?: CourseLevel[];
  deliveryMode?: DeliveryMode[];
  availability?: CourseAvailability[];
  sort?: CourseSortField;
  direction?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface CourseListResponse {
  data: Course[];
  pagination: PaginationMeta;
}

export interface CourseResponse {
  data: Course;
}

/** Human-readable labels for enum values, for display in controls and cards. */
export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  short_course: 'Short course',
  micro_credential: 'Micro-credential',
};

export const DELIVERY_MODE_LABELS: Record<DeliveryMode, string> = {
  on_campus: 'On campus',
  online: 'Online',
  blended: 'Blended',
};

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  diploma: 'Diploma',
  post_diploma: 'Post-diploma',
};

export const AVAILABILITY_LABELS: Record<CourseAvailability, string> = {
  open: 'Open for applications',
  closing_soon: 'Closing soon',
  closed: 'Closed',
  waitlist: 'Waitlist',
};

export const SORT_LABELS: Record<CourseSortField, string> = {
  relevance: 'Relevance',
  title: 'Title',
  duration: 'Duration',
  fee: 'Fee',
  startDate: 'Start date',
};
