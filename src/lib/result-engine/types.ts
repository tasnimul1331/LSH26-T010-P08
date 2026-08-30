// BottleResult — Result Engine Type Definitions
// Types specific to the deterministic calculation engine

import { GradeBand, GradingRuleConfiguration } from '@/types';

// ============================================================
// Engine Input Types
// ============================================================

export interface MarkInput {
  subjectCode: string;
  subjectName: string;
  hasPractical: boolean;
  isCompulsory: boolean;
  isOptional: boolean;
  theoryMarks: number | null;
  practicalMarks: number | null;
  totalMarks: number;
  isAbsent: boolean;
  rawValue: string | number | { theory: number; practical: number } | null;
  theoryMax: number;
  practicalMax: number;
  maxMarks: number;
}

// ============================================================
// Engine Output Types
// ============================================================

export interface SubjectResultOutput {
  subjectCode: string;
  subjectName: string;
  hasPractical: boolean;
  isCompulsory: boolean;
  isOptional: boolean;
  theoryMarks: number | null;
  practicalMarks: number | null;
  totalMarks: number;
  isAbsent: boolean;
  gradePoint: number;
  letterGrade: string;
  passed: boolean;
  failureReason: string | null;
  trace: SubjectTrace;
}

export interface SubjectTrace {
  input: {
    rawValue: string | number | { theory: number; practical: number } | null;
    theoryMarks: number | null;
    practicalMarks: number | null;
    totalMarks: number;
    isAbsent: boolean;
    maxMarks: number;
    theoryMax: number;
    practicalMax: number;
  };
  passEvaluation: {
    theoryPassed: boolean | null;
    practicalPassed: boolean | null;
    totalPassed: boolean;
    overallPassed: boolean;
    theoryPassMark: number | null;
    practicalPassMark: number | null;
    totalPassMark: number;
  };
  grading: {
    appliedBand: GradeBand | null;
    ruleId: string;
    ruleDescription: string;
    gradePoint: number;
    letterGrade: string;
  };
  decision: {
    outcome: 'PASSED' | 'FAILED' | 'ABSENT';
    reason: string;
    impact: string | null;
  };
}

export interface StudentResultOutput {
  studentCode: string;
  studentName: string;
  className: string;
  subjectResults: SubjectResultOutput[];
  compulsoryGradePointSum: number;
  optionalGradePoint: number;
  optionalContribution: number;
  totalGradePointSum: number;
  gpa: number;
  letterGrade: string;
  passed: boolean;
  totalMarks: number;
  hasCompulsoryFailure: boolean;
  failedCompulsorySubjects: string[];
  hasAbsence: boolean;
  absentSubjects: string[];
  trace: StudentTrace;
  checkingItems: CheckingItemOutput[];
}

export interface StudentTrace {
  compulsoryResults: SubjectResultOutput[];
  optionalResult: SubjectResultOutput | null;
  compulsoryGradePointSum: number;
  optionalGradePoint: number;
  optionalContributionBase: number;
  optionalContribution: number;
  totalGradePointSum: number;
  compulsoryCount: number;
  rawGpa: number;
  cappedGpa: number;
  finalGpa: number;
  finalLetterGrade: string;
  finalPassed: boolean;
  failureReasons: string[];
  calculationVersion: string;
}

export interface CheckingItemOutput {
  type: 'OPTIONAL_LOW' | 'PRACTICAL_FAILURE' | 'ABSENT' | 'COMPULSORY_FAILURE' | 'DATA_ERROR';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'WARNING';
  subjectCode: string | null;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
}

// ============================================================
// Resolved Rule Configuration
// ============================================================

export interface ResolvedGradingRules {
  caseId: string;
  ruleVersion: string;
  gradeBands: GradeBand[];
  totalPassMark: number;
  theoryPassMark: number | null;  // null = not separately enforced
  practicalPassMark: number | null;  // null = not separately enforced
  optionalContributionBase: number;
  compulsoryCount: number;
  gpaCap: number;
  gpaLetterGradeBands: GradeBand[];
  source: 'DATABASE' | 'FALLBACK';
}

// ============================================================
// Default/Fallback Configuration
// ============================================================

/**
 * Default Bangladesh SSC grading configuration.
 * 
 * IMPORTANT: These are fallback values used for testing and when
 * database rules are unavailable. The authoritative source is the
 * grading_rules table in the database.
 * 
 * Practical pass thresholds (theory_pass_mark, practical_pass_mark)
 * are set to null by default, meaning only total mark threshold is
 * evaluated. These MUST be configured through the Rules admin page
 * if the official P08 specification requires separate component thresholds.
 */
export const DEFAULT_GRADE_BANDS: GradeBand[] = [
  { min_mark: 80, max_mark: 100, grade_point: 5.00, letter_grade: 'A+' },
  { min_mark: 70, max_mark: 79,  grade_point: 4.00, letter_grade: 'A' },
  { min_mark: 60, max_mark: 69,  grade_point: 3.50, letter_grade: 'A-' },
  { min_mark: 50, max_mark: 59,  grade_point: 3.00, letter_grade: 'B' },
  { min_mark: 40, max_mark: 49,  grade_point: 2.00, letter_grade: 'C' },
  { min_mark: 33, max_mark: 39,  grade_point: 1.00, letter_grade: 'D' },
  { min_mark: 0,  max_mark: 32,  grade_point: 0.00, letter_grade: 'F' },
];

export const DEFAULT_GRADING_RULES: ResolvedGradingRules = {
  caseId: '',
  ruleVersion: '1.0.0',
  gradeBands: DEFAULT_GRADE_BANDS,
  totalPassMark: 33,
  theoryPassMark: null,     // NOT enforced by default — requires official config
  practicalPassMark: null,  // NOT enforced by default — requires official config
  optionalContributionBase: 2.00,
  compulsoryCount: 6,
  gpaCap: 5.00,
  gpaLetterGradeBands: DEFAULT_GRADE_BANDS, // Same bands for final GPA → letter grade
  source: 'FALLBACK',
};

export function createDefaultConfiguration(): GradingRuleConfiguration {
  return {
    theory_pass_mark: undefined,     // Requires official configuration
    practical_pass_mark: undefined,  // Requires official configuration
    total_pass_mark: 33,
    grade_bands: DEFAULT_GRADE_BANDS,
    optional_contribution_base: 2.00,
    compulsory_count: 6,
    gpa_cap: 5.00,
  };
}
