// BottleResult — Calculate Subject Result Module
// Deterministic subject-level grade point calculation with full trace

import { MarkInput, SubjectResultOutput, SubjectTrace, ResolvedGradingRules } from './types';
import { lookupGradePoint } from './rules';

/**
 * Calculate the result for a single subject.
 * This is the core deterministic calculation — pure function, no side effects.
 * 
 * Rules consumed from ResolvedGradingRules (sourced from DB):
 * - gradeBands: mark → grade point mapping
 * - totalPassMark: minimum total to pass
 * - theoryPassMark: minimum theory to pass (null = not enforced)
 * - practicalPassMark: minimum practical to pass (null = not enforced)
 */
export function calculateSubjectResult(
  mark: MarkInput,
  rules: ResolvedGradingRules
): SubjectResultOutput {
  // Handle absent case
  if (mark.isAbsent) {
    return createAbsentResult(mark, rules);
  }

  // Evaluate pass/fail
  const passEvaluation = evaluatePass(mark, rules);

  // Look up grade point based on total marks
  const { gradePoint, letterGrade, band } = passEvaluation.overallPassed
    ? lookupGradePoint(mark.totalMarks, rules.gradeBands)
    : { gradePoint: 0.00, letterGrade: 'F', band: null };

  // Determine failure reason
  let failureReason: string | null = null;
  let decisionOutcome: 'PASSED' | 'FAILED' = 'PASSED';
  let impact: string | null = null;

  if (!passEvaluation.overallPassed) {
    decisionOutcome = 'FAILED';
    failureReason = buildFailureReason(mark, passEvaluation, rules);
    if (mark.isCompulsory) {
      impact = `This is a compulsory subject. Failing it causes the overall result to fail regardless of other subjects.`;
    }
  }

  const ruleDescription = band
    ? `Marks ${band.min_mark}–${band.max_mark} → Grade Point ${band.grade_point} (${band.letter_grade})`
    : 'Failed — Grade Point 0.00 (F)';

  const trace: SubjectTrace = {
    input: {
      rawValue: mark.rawValue,
      theoryMarks: mark.theoryMarks,
      practicalMarks: mark.practicalMarks,
      totalMarks: mark.totalMarks,
      isAbsent: mark.isAbsent,
      maxMarks: mark.maxMarks,
      theoryMax: mark.theoryMax,
      practicalMax: mark.practicalMax,
    },
    passEvaluation: {
      theoryPassed: passEvaluation.theoryPassed,
      practicalPassed: passEvaluation.practicalPassed,
      totalPassed: passEvaluation.totalPassed,
      overallPassed: passEvaluation.overallPassed,
      theoryPassMark: rules.theoryPassMark,
      practicalPassMark: rules.practicalPassMark,
      totalPassMark: rules.totalPassMark,
    },
    grading: {
      appliedBand: band,
      ruleId: band ? `BAND_${band.min_mark}_${band.max_mark}` : 'FAIL',
      ruleDescription,
      gradePoint,
      letterGrade,
    },
    decision: {
      outcome: decisionOutcome,
      reason: decisionOutcome === 'PASSED'
        ? `${mark.subjectName}: Total ${mark.totalMarks}/${mark.maxMarks} meets pass requirements.`
        : failureReason!,
      impact,
    },
  };

  return {
    subjectCode: mark.subjectCode,
    subjectName: mark.subjectName,
    hasPractical: mark.hasPractical,
    isCompulsory: mark.isCompulsory,
    isOptional: mark.isOptional,
    theoryMarks: mark.theoryMarks,
    practicalMarks: mark.practicalMarks,
    totalMarks: mark.totalMarks,
    isAbsent: false,
    gradePoint,
    letterGrade,
    passed: passEvaluation.overallPassed,
    failureReason,
    trace,
  };
}

interface PassEvaluation {
  theoryPassed: boolean | null;
  practicalPassed: boolean | null;
  totalPassed: boolean;
  overallPassed: boolean;
}

function evaluatePass(mark: MarkInput, rules: ResolvedGradingRules): PassEvaluation {
  let theoryPassed: boolean | null = null;
  let practicalPassed: boolean | null = null;

  // Total pass check
  const totalPassed = mark.totalMarks >= rules.totalPassMark;

  if (mark.hasPractical) {
    // Theory component check (only if threshold is configured)
    if (rules.theoryPassMark !== null && mark.theoryMarks !== null) {
      theoryPassed = mark.theoryMarks >= rules.theoryPassMark;
    }

    // Practical component check (only if threshold is configured)
    if (rules.practicalPassMark !== null && mark.practicalMarks !== null) {
      practicalPassed = mark.practicalMarks >= rules.practicalPassMark;
    }
  }

  // Overall pass: total must pass AND any configured component thresholds must pass
  const componentsFailed =
    (theoryPassed === false) || (practicalPassed === false);

  const overallPassed = totalPassed && !componentsFailed;

  return { theoryPassed, practicalPassed, totalPassed, overallPassed };
}

function buildFailureReason(
  mark: MarkInput,
  evaluation: PassEvaluation,
  rules: ResolvedGradingRules
): string {
  const reasons: string[] = [];

  if (!evaluation.totalPassed) {
    reasons.push(
      `Total marks (${mark.totalMarks}/${mark.maxMarks}) below pass mark (${rules.totalPassMark}).`
    );
  }

  if (evaluation.theoryPassed === false && rules.theoryPassMark !== null) {
    reasons.push(
      `Theory marks (${mark.theoryMarks}/${mark.theoryMax}) below theory pass mark (${rules.theoryPassMark}).`
    );
  }

  if (evaluation.practicalPassed === false && rules.practicalPassMark !== null) {
    reasons.push(
      `Practical marks (${mark.practicalMarks}/${mark.practicalMax}) below practical pass mark (${rules.practicalPassMark}).`
    );
  }

  return reasons.join(' ');
}

function createAbsentResult(mark: MarkInput, rules: ResolvedGradingRules): SubjectResultOutput {
  const impact = mark.isCompulsory
    ? 'This is a compulsory subject. Absence causes the overall result to fail.'
    : null;

  const trace: SubjectTrace = {
    input: {
      rawValue: mark.rawValue,
      theoryMarks: null,
      practicalMarks: null,
      totalMarks: 0,
      isAbsent: true,
      maxMarks: mark.maxMarks,
      theoryMax: mark.theoryMax,
      practicalMax: mark.practicalMax,
    },
    passEvaluation: {
      theoryPassed: null,
      practicalPassed: null,
      totalPassed: false,
      overallPassed: false,
      theoryPassMark: rules.theoryPassMark,
      practicalPassMark: rules.practicalPassMark,
      totalPassMark: rules.totalPassMark,
    },
    grading: {
      appliedBand: null,
      ruleId: 'ABSENT',
      ruleDescription: 'Student absent — Grade Point 0.00 (F)',
      gradePoint: 0.00,
      letterGrade: 'F',
    },
    decision: {
      outcome: 'ABSENT',
      reason: `Student was absent in ${mark.subjectName}.`,
      impact,
    },
  };

  return {
    subjectCode: mark.subjectCode,
    subjectName: mark.subjectName,
    hasPractical: mark.hasPractical,
    isCompulsory: mark.isCompulsory,
    isOptional: mark.isOptional,
    theoryMarks: null,
    practicalMarks: null,
    totalMarks: 0,
    isAbsent: true,
    gradePoint: 0.00,
    letterGrade: 'F',
    passed: false,
    failureReason: `Student was absent in ${mark.subjectName}.`,
    trace,
  };
}
