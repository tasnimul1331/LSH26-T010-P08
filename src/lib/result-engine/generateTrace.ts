// BottleResult — Generate Trace Module
// Produces human-readable explanation of the full calculation

import { StudentResultOutput, SubjectResultOutput } from './types';

/**
 * Generate a human-readable trace summary for a student result.
 */
export function generateStudentTraceSummary(result: StudentResultOutput): string {
  const lines: string[] = [];

  lines.push(`=== Result Trace for ${result.studentName} (${result.studentCode}) ===`);
  lines.push(`Class: ${result.className}`);
  lines.push('');

  // Subject results
  lines.push('--- Subject Results ---');
  for (const sr of result.subjectResults) {
    lines.push(generateSubjectTraceLine(sr));
  }

  lines.push('');
  lines.push('--- GPA Calculation ---');
  lines.push(`Compulsory Grade Point Sum: ${result.compulsoryGradePointSum.toFixed(2)}`);

  if (result.trace.optionalResult) {
    lines.push(`Optional Subject (${result.trace.optionalResult.subjectName}): GP ${result.optionalGradePoint.toFixed(2)}`);
    lines.push(`Optional Contribution: max(0, ${result.optionalGradePoint.toFixed(2)} - ${result.trace.optionalContributionBase.toFixed(2)}) = ${result.optionalContribution.toFixed(2)}`);
  }

  lines.push(`Total Grade Point Sum: ${result.totalGradePointSum.toFixed(2)}`);
  lines.push(`Compulsory Count: ${result.trace.compulsoryCount}`);
  lines.push(`Raw GPA: ${result.trace.rawGpa.toFixed(4)}`);
  lines.push(`Final GPA: ${result.gpa.toFixed(2)}`);
  lines.push(`Letter Grade: ${result.letterGrade}`);
  lines.push(`Result: ${result.passed ? 'PASSED' : 'FAILED'}`);

  if (result.trace.failureReasons.length > 0) {
    lines.push('');
    lines.push('--- Failure Reasons ---');
    for (const reason of result.trace.failureReasons) {
      lines.push(`• ${reason}`);
    }
  }

  return lines.join('\n');
}

/**
 * Generate a trace line for a single subject result.
 */
function generateSubjectTraceLine(sr: SubjectResultOutput): string {
  const parts: string[] = [];

  parts.push(`${sr.subjectName} (${sr.subjectCode})`);
  parts.push(sr.isCompulsory ? '[Compulsory]' : '[Optional]');

  if (sr.isAbsent) {
    parts.push('ABSENT — GP: 0.00 (F)');
    return parts.join(' ');
  }

  if (sr.hasPractical) {
    parts.push(`Theory: ${sr.theoryMarks}/${sr.trace.input.theoryMax}`);
    parts.push(`Practical: ${sr.practicalMarks}/${sr.trace.input.practicalMax}`);
  }

  parts.push(`Total: ${sr.totalMarks}/${sr.trace.input.maxMarks}`);
  parts.push(`GP: ${sr.gradePoint.toFixed(2)} (${sr.letterGrade})`);
  parts.push(sr.passed ? '✓ Passed' : '✗ Failed');

  if (sr.failureReason) {
    parts.push(`Reason: ${sr.failureReason}`);
  }

  return parts.join(' | ');
}

/**
 * Generate trace data in a structured format suitable for the UI.
 */
export function generateStructuredTrace(result: StudentResultOutput) {
  return {
    student: {
      code: result.studentCode,
      name: result.studentName,
      class: result.className,
    },
    subjects: result.subjectResults.map(sr => ({
      code: sr.subjectCode,
      name: sr.subjectName,
      type: sr.isCompulsory ? 'compulsory' : 'optional',
      hasPractical: sr.hasPractical,
      isAbsent: sr.isAbsent,
      marks: {
        theory: sr.theoryMarks,
        practical: sr.practicalMarks,
        total: sr.totalMarks,
        theoryMax: sr.trace.input.theoryMax,
        practicalMax: sr.trace.input.practicalMax,
        maxMarks: sr.trace.input.maxMarks,
      },
      passStatus: {
        theoryPassed: sr.trace.passEvaluation.theoryPassed,
        practicalPassed: sr.trace.passEvaluation.practicalPassed,
        totalPassed: sr.trace.passEvaluation.totalPassed,
        overallPassed: sr.passed,
      },
      grading: {
        gradePoint: sr.gradePoint,
        letterGrade: sr.letterGrade,
        rule: sr.trace.grading.ruleDescription,
      },
      decision: sr.trace.decision,
    })),
    gpa: {
      compulsorySum: result.compulsoryGradePointSum,
      optionalGP: result.optionalGradePoint,
      optionalContributionBase: result.trace.optionalContributionBase,
      optionalContribution: result.optionalContribution,
      totalSum: result.totalGradePointSum,
      compulsoryCount: result.trace.compulsoryCount,
      rawGpa: result.trace.rawGpa,
      finalGpa: result.gpa,
      letterGrade: result.letterGrade,
      passed: result.passed,
    },
    failures: result.trace.failureReasons,
    calculationVersion: result.trace.calculationVersion,
  };
}
