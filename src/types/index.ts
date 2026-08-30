// BottleResult — Core Type Definitions
// All database entities, enums, and shared types

// ============================================================
// Enums
// ============================================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  VIEWER = 'VIEWER',
}

export enum ResultStatus {
  DRAFT = 'DRAFT',
  CALCULATED = 'CALCULATED',
  CHECKING = 'CHECKING',
  VERIFIED = 'VERIFIED',
  PUBLISHED = 'PUBLISHED',
}

export enum CheckingItemType {
  OPTIONAL_LOW = 'OPTIONAL_LOW',
  PRACTICAL_FAILURE = 'PRACTICAL_FAILURE',
  ABSENT = 'ABSENT',
  COMPULSORY_FAILURE = 'COMPULSORY_FAILURE',
  DATA_ERROR = 'DATA_ERROR',
}

export enum CheckingSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  WARNING = 'WARNING',
}

export enum CaseStatus {
  DRAFT = 'DRAFT',
  IMPORTED = 'IMPORTED',
  CALCULATED = 'CALCULATED',
  CHECKING = 'CHECKING',
  VERIFIED = 'VERIFIED',
  PUBLISHED = 'PUBLISHED',
}

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// ============================================================
// Database Entities
// ============================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  case_code: string;
  problem_id: string;
  schema_version: string;
  name: string;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  case_id: string;
  name: string;
  academic_year: string;
  created_at: string;
}

export interface Subject {
  id: string;
  case_id: string;
  code: string;
  name: string;
  has_practical: boolean;
  is_compulsory: boolean;
  max_marks: number;
  theory_max: number | null;
  practical_max: number | null;
  display_order: number;
  created_at: string;
}

export interface Student {
  id: string;
  student_code: string;
  name: string;
  class_id: string;
  case_id: string;
  optional_subject_id: string | null;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

export interface Mark {
  id: string;
  student_id: string;
  subject_id: string;
  theory_marks: number | null;
  practical_marks: number | null;
  is_absent: boolean;
  raw_value: string | null;
  created_at: string;
  updated_at: string;
}

export interface Result {
  id: string;
  student_id: string;
  case_id: string;
  gpa: number;
  letter_grade: string;
  total_marks: number;
  passed: boolean;
  result_status: ResultStatus;
  calculation_version: string;
  calculated_at: string;
  published_at: string | null;
  verification_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubjectResult {
  id: string;
  result_id: string;
  subject_id: string;
  total_marks: number;
  grade_point: number;
  letter_grade: string;
  passed: boolean;
  is_compulsory: boolean;
  is_optional: boolean;
  failure_reason: string | null;
  calculation_details: CalculationDetails;
  created_at: string;
}

export interface CalculationDetails {
  raw_input: string | number | { theory: number; practical: number };
  normalized_input: {
    theory_marks: number | null;
    practical_marks: number | null;
    total: number;
    is_absent: boolean;
  };
  theory_mark: number | null;
  practical_mark: number | null;
  total: number;
  rule_id: string;
  rule_description: string;
  intermediate_calculations: Record<string, unknown>;
  decision_outcome: string;
  failure_reason: string | null;
}

export interface CheckingItem {
  id: string;
  student_id: string;
  result_id: string;
  type: CheckingItemType;
  severity: CheckingSeverity;
  status: 'OPEN' | 'REVIEWED' | 'RESOLVED';
  subject_id: string | null;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface GradingRule {
  id: string;
  case_id: string;
  rule_name: string;
  rule_type: string;
  min_mark: number | null;
  max_mark: number | null;
  grade_point: number | null;
  letter_grade: string | null;
  configuration: GradingRuleConfiguration;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GradingRuleConfiguration {
  theory_pass_mark?: number;
  practical_pass_mark?: number;
  total_pass_mark?: number;
  grade_bands?: GradeBand[];
  optional_contribution_base?: number;
  compulsory_count?: number;
  gpa_cap?: number;
  // Extensible for future rule types
  [key: string]: unknown;
}

export interface GradeBand {
  min_mark: number;
  max_mark: number;
  grade_point: number;
  letter_grade: string;
}

// ============================================================
// Dataset Types (JSON Import)
// ============================================================

export interface DatasetRoot {
  schema_version: string;
  problem_id: string;
  format_note: string;
  cases: DatasetCase[];
}

export interface DatasetCase {
  case_id: string;
  subjects: DatasetSubject[];
  compulsory: string[];
  students: DatasetStudent[];
}

export interface DatasetSubject {
  code: string;
  name: string;
  practical: boolean;
}

export interface DatasetStudent {
  id: string;
  name: string;
  class: string;
  optional: string;
  marks: Record<string, DatasetMark>;
}

export type DatasetMark = number | string | { theory: number; practical: number };

// ============================================================
// Joined/Extended Types for UI
// ============================================================

export interface StudentWithDetails extends Student {
  class_name?: string;
  case_code?: string;
  optional_subject_code?: string;
  optional_subject_name?: string;
  result?: Result;
  marks?: (Mark & { subject?: Subject })[];
}

export interface ResultWithDetails extends Result {
  student?: Student;
  subject_results?: (SubjectResult & { subject?: Subject })[];
  checking_items?: CheckingItem[];
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

export interface DashboardMetrics {
  totalStudents: number;
  passed: number;
  failed: number;
  averageGpa: number;
  absent: number;
  pendingChecks: number;
  published: number;
  draft: number;
  calculated: number;
}

export interface ImportValidationResult {
  valid: boolean;
  errors: ImportError[];
  warnings: ImportWarning[];
  preview: ImportPreview;
}

export interface ImportError {
  type: string;
  message: string;
  path?: string;
  value?: unknown;
}

export interface ImportWarning {
  type: string;
  message: string;
  path?: string;
  value?: unknown;
}

export interface ImportPreview {
  caseCount: number;
  studentCount: number;
  subjectCount: number;
  cases: {
    caseId: string;
    studentCount: number;
    classes: string[];
    subjects: string[];
  }[];
}
