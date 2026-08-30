// BottleResult — Calculate GPA Module
// Deterministic GPA calculation with optional subject contribution

import { SubjectResultOutput, ResolvedGradingRules } from './types';
import { lookupLetterGradeForGPA } from './rules';

export interface GPACalculation {
  compulsoryGradePointSum: number;
  optionalGradePoint: number;
  optionalContribution: number;
  totalGradePointSum: number;
  compulsoryCount: number;
  rawGpa: number;
  cappedGpa: number;
  finalGpa: number;
  finalLetterGrade: string;
  passed: boolean;
  failureReasons: string[];
}

/**
 * Calculate GPA from subject results using the official formula:
 * 
 * 1. Sum grade points of all compulsory subjects
 * 2. For optional subject: if GP > optionalContributionBase (2.00),
 *    add (GP - optionalContributionBase) to sum
 * 3. Divide by compulsory count (6)
 * 4. Cap at gpaCap (5.00)
 * 5. If any compulsory subject fails, final GPA = 0.00, result = F
 */
export function calculateGPA(
  subjectResults: SubjectResultOutput[],
  rules: ResolvedGradingRules
): GPACalculation {
  const compulsoryResults = subjectResults.filter(r => r.isCompulsory);
  const optionalResult = subjectResults.find(r => r.isOptional) ?? null;

  const failureReasons: string[] = [];

  // Check for compulsory failures
  const failedCompulsory = compulsoryResults.filter(r => !r.passed);
  const hasCompulsoryFailure = failedCompulsory.length > 0;

  if (hasCompulsoryFailure) {
    for (const failed of failedCompulsory) {
      if (failed.isAbsent) {
        failureReasons.push(
          `Absent in compulsory subject ${failed.subjectName} — overall result fails.`
        );
      } else {
        failureReasons.push(
          `Failed compulsory subject ${failed.subjectName} (${failed.totalMarks}/${failed.trace.input.maxMarks}) — overall result fails.`
        );
      }
    }
  }

  // Sum compulsory grade points
  const compulsoryGradePointSum = compulsoryResults.reduce(
    (sum, r) => sum + r.gradePoint, 0
  );

  // Optional subject contribution
  const optionalGradePoint = optionalResult?.gradePoint ?? 0;
  const optionalContribution = optionalResult
    ? Math.max(0, optionalGradePoint - rules.optionalContributionBase)
    : 0;

  // Total grade point sum
  const totalGradePointSum = compulsoryGradePointSum + optionalContribution;

  // Raw GPA
  const compulsoryCount = rules.compulsoryCount || compulsoryResults.length || 6;
  const rawGpa = compulsoryCount > 0 ? totalGradePointSum / compulsoryCount : 0;

  // Cap GPA
  const cappedGpa = Math.min(rawGpa, rules.gpaCap);

  // Round to 2 decimal places
  const finalGpa = hasCompulsoryFailure
    ? 0.00
    : Math.round(cappedGpa * 100) / 100;

  // Determine letter grade
  const finalLetterGrade = hasCompulsoryFailure
    ? 'F'
    : lookupLetterGradeForGPA(finalGpa, rules.gpaLetterGradeBands);

  const passed = !hasCompulsoryFailure && finalGpa > 0;

  return {
    compulsoryGradePointSum,
    optionalGradePoint,
    optionalContribution,
    totalGradePointSum,
    compulsoryCount,
    rawGpa,
    cappedGpa,
    finalGpa,
    finalLetterGrade,
    passed,
    failureReasons,
  };
}
