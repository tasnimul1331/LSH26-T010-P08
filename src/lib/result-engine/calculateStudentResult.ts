// BottleResult — Calculate Student Result Module
// Orchestrates the full deterministic calculation pipeline

import { MarkInput, StudentResultOutput, ResolvedGradingRules } from './types';
import { calculateSubjectResult } from './calculateSubjectResult';
import { calculateGPA } from './calculateGPA';
import { detectFailures } from './detectFailures';
import { generateCheckingItems } from './generateCheckingItems';
import { validateStudentMarks } from './validateMarks';

const CALCULATION_VERSION = '1.0.0';

/**
 * Calculate the complete result for a single student.
 * 
 * Pipeline:
 * Raw Marks → Validate → Calculate each subject → Detect failures
 * → Calculate GPA → Generate trace → Generate checking items
 * 
 * This is a pure, deterministic function with no side effects.
 * All rules are consumed from the resolved configuration.
 */
export function calculateStudentResult(
  studentCode: string,
  studentName: string,
  className: string,
  marks: MarkInput[],
  rules: ResolvedGradingRules
): StudentResultOutput {
  // Step 1: Validate marks
  const validation = validateStudentMarks(marks, rules);
  if (!validation.valid) {
    // Return a failed result with data errors
    return createDataErrorResult(
      studentCode, studentName, className, marks, rules, validation.errors
    );
  }

  // Step 2: Calculate each subject result
  const subjectResults = marks.map(mark => calculateSubjectResult(mark, rules));

  // Step 3: Detect failures
  const failures = detectFailures(subjectResults);

  // Step 4: Calculate GPA
  const gpaCalc = calculateGPA(subjectResults, rules);

  // Step 5: Generate checking items
  const checkingItems = generateCheckingItems(
    subjectResults, failures, studentCode, studentName
  );

  // Step 6: Build complete result
  const compulsoryResults = subjectResults.filter(r => r.isCompulsory);
  const optionalResult = subjectResults.find(r => r.isOptional) ?? null;

  return {
    studentCode,
    studentName,
    className,
    subjectResults,
    compulsoryGradePointSum: gpaCalc.compulsoryGradePointSum,
    optionalGradePoint: gpaCalc.optionalGradePoint,
    optionalContribution: gpaCalc.optionalContribution,
    totalGradePointSum: gpaCalc.totalGradePointSum,
    gpa: gpaCalc.finalGpa,
    letterGrade: gpaCalc.finalLetterGrade,
    passed: gpaCalc.passed,
    totalMarks: subjectResults.reduce((sum, r) => sum + r.totalMarks, 0),
    hasCompulsoryFailure: failures.hasCompulsoryFailure,
    failedCompulsorySubjects: failures.failedCompulsorySubjects,
    hasAbsence: failures.hasAbsence,
    absentSubjects: failures.absentSubjects,
    trace: {
      compulsoryResults,
      optionalResult,
      compulsoryGradePointSum: gpaCalc.compulsoryGradePointSum,
      optionalGradePoint: gpaCalc.optionalGradePoint,
      optionalContributionBase: rules.optionalContributionBase,
      optionalContribution: gpaCalc.optionalContribution,
      totalGradePointSum: gpaCalc.totalGradePointSum,
      compulsoryCount: gpaCalc.compulsoryCount,
      rawGpa: gpaCalc.rawGpa,
      cappedGpa: gpaCalc.cappedGpa,
      finalGpa: gpaCalc.finalGpa,
      finalLetterGrade: gpaCalc.finalLetterGrade,
      finalPassed: gpaCalc.passed,
      failureReasons: gpaCalc.failureReasons,
      calculationVersion: CALCULATION_VERSION,
    },
    checkingItems,
  };
}

function createDataErrorResult(
  studentCode: string,
  studentName: string,
  className: string,
  marks: MarkInput[],
  rules: ResolvedGradingRules,
  errors: string[]
): StudentResultOutput {
  const subjectResults = marks.map(mark => calculateSubjectResult(mark, rules));

  return {
    studentCode,
    studentName,
    className,
    subjectResults,
    compulsoryGradePointSum: 0,
    optionalGradePoint: 0,
    optionalContribution: 0,
    totalGradePointSum: 0,
    gpa: 0,
    letterGrade: 'F',
    passed: false,
    totalMarks: 0,
    hasCompulsoryFailure: true,
    failedCompulsorySubjects: [],
    hasAbsence: false,
    absentSubjects: [],
    trace: {
      compulsoryResults: [],
      optionalResult: null,
      compulsoryGradePointSum: 0,
      optionalGradePoint: 0,
      optionalContributionBase: rules.optionalContributionBase,
      optionalContribution: 0,
      totalGradePointSum: 0,
      compulsoryCount: rules.compulsoryCount,
      rawGpa: 0,
      cappedGpa: 0,
      finalGpa: 0,
      finalLetterGrade: 'F',
      finalPassed: false,
      failureReasons: [`Data validation errors: ${errors.join('; ')}`],
      calculationVersion: CALCULATION_VERSION,
    },
    checkingItems: errors.map(error => ({
      type: 'DATA_ERROR' as const,
      severity: 'CRITICAL' as const,
      subjectCode: null,
      title: 'Data Validation Error',
      description: error,
      metadata: { error },
    })),
  };
}

/**
 * Calculate results for multiple students.
 */
export function calculateBatchResults(
  students: Array<{
    studentCode: string;
    studentName: string;
    className: string;
    marks: MarkInput[];
  }>,
  rules: ResolvedGradingRules
): StudentResultOutput[] {
  return students.map(student =>
    calculateStudentResult(
      student.studentCode,
      student.studentName,
      student.className,
      student.marks,
      rules
    )
  );
}
