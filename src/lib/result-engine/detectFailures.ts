// BottleResult — Detect Failures Module
// Detects compulsory failures and practical component failures

import { SubjectResultOutput } from './types';

export interface FailureDetectionResult {
  hasCompulsoryFailure: boolean;
  failedCompulsorySubjects: string[];
  hasPracticalFailure: boolean;
  practicalFailureSubjects: string[];
  hasAbsence: boolean;
  absentSubjects: string[];
  hasOptionalLow: boolean;
  optionalLowSubjects: string[];
}

/**
 * Detect all failure conditions across a student's subject results.
 */
export function detectFailures(
  subjectResults: SubjectResultOutput[]
): FailureDetectionResult {
  const failedCompulsorySubjects: string[] = [];
  const practicalFailureSubjects: string[] = [];
  const absentSubjects: string[] = [];
  const optionalLowSubjects: string[] = [];

  for (const result of subjectResults) {
    // Check absence
    if (result.isAbsent) {
      absentSubjects.push(result.subjectCode);
    }

    // Check compulsory failure
    if (result.isCompulsory && !result.passed) {
      failedCompulsorySubjects.push(result.subjectCode);
    }

    // Check practical component failure (when the subject has practical but overall failed
    // due to a practical-related reason)
    if (result.hasPractical && !result.passed && !result.isAbsent) {
      const trace = result.trace;
      if (trace.passEvaluation.practicalPassed === false || 
          trace.passEvaluation.theoryPassed === false) {
        practicalFailureSubjects.push(result.subjectCode);
      }
    }

    // Check optional subject with low grade point
    if (result.isOptional && result.gradePoint <= 2.00 && !result.isAbsent) {
      optionalLowSubjects.push(result.subjectCode);
    }
  }

  return {
    hasCompulsoryFailure: failedCompulsorySubjects.length > 0,
    failedCompulsorySubjects,
    hasPracticalFailure: practicalFailureSubjects.length > 0,
    practicalFailureSubjects,
    hasAbsence: absentSubjects.length > 0,
    absentSubjects,
    hasOptionalLow: optionalLowSubjects.length > 0,
    optionalLowSubjects,
  };
}
