// BottleResult — Result Engine Unit Tests
// Tests the deterministic calculation engine with all scenarios

import { describe, it, expect } from 'vitest';
import {
  calculateStudentResult,
  calculateSubjectResult,
  calculateGPA,
  lookupGradePoint,
  lookupLetterGradeForGPA,
  normalizeRawMark,
  detectFailures,
  generateCheckingItems,
  DEFAULT_GRADING_RULES,
} from '@/lib/result-engine';
import type { MarkInput, ResolvedGradingRules, SubjectResultOutput } from '@/lib/result-engine';

const rules: ResolvedGradingRules = { ...DEFAULT_GRADING_RULES, caseId: 'TEST' };

// Helper to create a non-practical mark input
function makeSimpleMark(
  code: string, name: string, total: number,
  isCompulsory = true, isOptional = false
): MarkInput {
  return {
    subjectCode: code, subjectName: name, hasPractical: false,
    isCompulsory, isOptional,
    theoryMarks: total, practicalMarks: null, totalMarks: total,
    isAbsent: false, rawValue: total,
    theoryMax: 100, practicalMax: 0, maxMarks: 100,
  };
}

// Helper to create a practical mark input
function makePracticalMark(
  code: string, name: string, theory: number, practical: number,
  isCompulsory = true, isOptional = false
): MarkInput {
  return {
    subjectCode: code, subjectName: name, hasPractical: true,
    isCompulsory, isOptional,
    theoryMarks: theory, practicalMarks: practical, totalMarks: theory + practical,
    isAbsent: false, rawValue: { theory, practical },
    theoryMax: 75, practicalMax: 25, maxMarks: 100,
  };
}

// Helper to create an absent mark input
function makeAbsentMark(
  code: string, name: string,
  hasPractical: boolean, isCompulsory = true, isOptional = false
): MarkInput {
  return {
    subjectCode: code, subjectName: name, hasPractical,
    isCompulsory, isOptional,
    theoryMarks: null, practicalMarks: null, totalMarks: 0,
    isAbsent: true, rawValue: 'AB',
    theoryMax: hasPractical ? 75 : 100, practicalMax: hasPractical ? 25 : 0,
    maxMarks: 100,
  };
}

// ============================================================
// Grade Point Lookup
// ============================================================

describe('lookupGradePoint', () => {
  it('returns A+ (5.00) for marks 80-100', () => {
    expect(lookupGradePoint(80, rules.gradeBands).gradePoint).toBe(5.00);
    expect(lookupGradePoint(90, rules.gradeBands).gradePoint).toBe(5.00);
    expect(lookupGradePoint(100, rules.gradeBands).gradePoint).toBe(5.00);
    expect(lookupGradePoint(80, rules.gradeBands).letterGrade).toBe('A+');
  });

  it('returns A (4.00) for marks 70-79', () => {
    expect(lookupGradePoint(70, rules.gradeBands).gradePoint).toBe(4.00);
    expect(lookupGradePoint(79, rules.gradeBands).gradePoint).toBe(4.00);
    expect(lookupGradePoint(75, rules.gradeBands).letterGrade).toBe('A');
  });

  it('returns A- (3.50) for marks 60-69', () => {
    expect(lookupGradePoint(60, rules.gradeBands).gradePoint).toBe(3.50);
    expect(lookupGradePoint(69, rules.gradeBands).gradePoint).toBe(3.50);
  });

  it('returns B (3.00) for marks 50-59', () => {
    expect(lookupGradePoint(50, rules.gradeBands).gradePoint).toBe(3.00);
    expect(lookupGradePoint(59, rules.gradeBands).gradePoint).toBe(3.00);
  });

  it('returns C (2.00) for marks 40-49', () => {
    expect(lookupGradePoint(40, rules.gradeBands).gradePoint).toBe(2.00);
    expect(lookupGradePoint(49, rules.gradeBands).gradePoint).toBe(2.00);
  });

  it('returns D (1.00) for marks 33-39', () => {
    expect(lookupGradePoint(33, rules.gradeBands).gradePoint).toBe(1.00);
    expect(lookupGradePoint(39, rules.gradeBands).gradePoint).toBe(1.00);
  });

  it('returns F (0.00) for marks 0-32', () => {
    expect(lookupGradePoint(0, rules.gradeBands).gradePoint).toBe(0.00);
    expect(lookupGradePoint(32, rules.gradeBands).gradePoint).toBe(0.00);
    expect(lookupGradePoint(20, rules.gradeBands).letterGrade).toBe('F');
  });

  it('handles boundary marks correctly', () => {
    expect(lookupGradePoint(33, rules.gradeBands).letterGrade).toBe('D');
    expect(lookupGradePoint(32, rules.gradeBands).letterGrade).toBe('F');
    expect(lookupGradePoint(40, rules.gradeBands).letterGrade).toBe('C');
    expect(lookupGradePoint(39, rules.gradeBands).letterGrade).toBe('D');
    expect(lookupGradePoint(80, rules.gradeBands).letterGrade).toBe('A+');
    expect(lookupGradePoint(79, rules.gradeBands).letterGrade).toBe('A');
  });
});

// ============================================================
// GPA Letter Grade Lookup
// ============================================================

describe('lookupLetterGradeForGPA', () => {
  it('returns correct letter grades for GPA values', () => {
    expect(lookupLetterGradeForGPA(5.00, rules.gpaLetterGradeBands)).toBe('A+');
    expect(lookupLetterGradeForGPA(4.50, rules.gpaLetterGradeBands)).toBe('A');
    expect(lookupLetterGradeForGPA(4.00, rules.gpaLetterGradeBands)).toBe('A');
    expect(lookupLetterGradeForGPA(3.75, rules.gpaLetterGradeBands)).toBe('A-');
    expect(lookupLetterGradeForGPA(3.50, rules.gpaLetterGradeBands)).toBe('A-');
    expect(lookupLetterGradeForGPA(3.00, rules.gpaLetterGradeBands)).toBe('B');
    expect(lookupLetterGradeForGPA(2.50, rules.gpaLetterGradeBands)).toBe('C');
    expect(lookupLetterGradeForGPA(2.00, rules.gpaLetterGradeBands)).toBe('C');
    expect(lookupLetterGradeForGPA(1.50, rules.gpaLetterGradeBands)).toBe('D');
    expect(lookupLetterGradeForGPA(1.00, rules.gpaLetterGradeBands)).toBe('D');
    expect(lookupLetterGradeForGPA(0.50, rules.gpaLetterGradeBands)).toBe('F');
    expect(lookupLetterGradeForGPA(0.00, rules.gpaLetterGradeBands)).toBe('F');
  });
});

// ============================================================
// Raw Mark Normalization
// ============================================================

describe('normalizeRawMark', () => {
  it('normalizes a simple numeric mark', () => {
    const result = normalizeRawMark(75, 'BAN', 'Bangla', false, true, false, 100, 0, 100);
    expect(result.totalMarks).toBe(75);
    expect(result.isAbsent).toBe(false);
    expect(result.hasPractical).toBe(false);
  });

  it('normalizes a practical mark object', () => {
    const result = normalizeRawMark(
      { theory: 52, practical: 19 }, 'PHY', 'Physics', true, true, false, 75, 25, 100
    );
    expect(result.theoryMarks).toBe(52);
    expect(result.practicalMarks).toBe(19);
    expect(result.totalMarks).toBe(71);
    expect(result.isAbsent).toBe(false);
  });

  it('normalizes AB as absent', () => {
    const result = normalizeRawMark('AB', 'BIO', 'Biology', true, true, false, 75, 25, 100);
    expect(result.isAbsent).toBe(true);
    expect(result.totalMarks).toBe(0);
    expect(result.theoryMarks).toBeNull();
    expect(result.practicalMarks).toBeNull();
  });
});

// ============================================================
// Subject Result Calculation
// ============================================================

describe('calculateSubjectResult', () => {
  it('calculates a passing non-practical subject correctly', () => {
    const mark = makeSimpleMark('BAN', 'Bangla', 75);
    const result = calculateSubjectResult(mark, rules);
    expect(result.passed).toBe(true);
    expect(result.gradePoint).toBe(4.00);
    expect(result.letterGrade).toBe('A');
    expect(result.failureReason).toBeNull();
  });

  it('calculates a high-scoring subject (A+)', () => {
    const mark = makeSimpleMark('MAT', 'Mathematics', 95);
    const result = calculateSubjectResult(mark, rules);
    expect(result.gradePoint).toBe(5.00);
    expect(result.letterGrade).toBe('A+');
    expect(result.passed).toBe(true);
  });

  it('calculates a failing subject (below 33)', () => {
    const mark = makeSimpleMark('ENG', 'English', 25);
    const result = calculateSubjectResult(mark, rules);
    expect(result.passed).toBe(false);
    expect(result.gradePoint).toBe(0.00);
    expect(result.letterGrade).toBe('F');
    expect(result.failureReason).toBeTruthy();
  });

  it('calculates boundary mark 33 as passing (D)', () => {
    const mark = makeSimpleMark('BAN', 'Bangla', 33);
    const result = calculateSubjectResult(mark, rules);
    expect(result.passed).toBe(true);
    expect(result.gradePoint).toBe(1.00);
    expect(result.letterGrade).toBe('D');
  });

  it('calculates boundary mark 32 as failing', () => {
    const mark = makeSimpleMark('BAN', 'Bangla', 32);
    const result = calculateSubjectResult(mark, rules);
    expect(result.passed).toBe(false);
    expect(result.gradePoint).toBe(0.00);
  });

  it('calculates a passing practical subject', () => {
    const mark = makePracticalMark('PHY', 'Physics', 52, 19);
    const result = calculateSubjectResult(mark, rules);
    expect(result.totalMarks).toBe(71);
    expect(result.gradePoint).toBe(4.00);
    expect(result.letterGrade).toBe('A');
    expect(result.passed).toBe(true);
  });

  it('calculates a failing practical subject (low total)', () => {
    const mark = makePracticalMark('CHE', 'Chemistry', 20, 5);
    const result = calculateSubjectResult(mark, rules);
    expect(result.totalMarks).toBe(25);
    expect(result.passed).toBe(false);
    expect(result.gradePoint).toBe(0.00);
  });

  it('handles absent subject correctly', () => {
    const mark = makeAbsentMark('BIO', 'Biology', true, true);
    const result = calculateSubjectResult(mark, rules);
    expect(result.isAbsent).toBe(true);
    expect(result.passed).toBe(false);
    expect(result.gradePoint).toBe(0.00);
    expect(result.letterGrade).toBe('F');
    expect(result.trace.decision.outcome).toBe('ABSENT');
  });

  it('generates complete trace for passed subject', () => {
    const mark = makePracticalMark('PHY', 'Physics', 60, 20);
    const result = calculateSubjectResult(mark, rules);
    expect(result.trace).toBeDefined();
    expect(result.trace.input.theoryMarks).toBe(60);
    expect(result.trace.input.practicalMarks).toBe(20);
    expect(result.trace.grading.gradePoint).toBe(5.00);
    expect(result.trace.decision.outcome).toBe('PASSED');
  });

  it('generates trace with failure reason for failed subject', () => {
    const mark = makeSimpleMark('MAT', 'Mathematics', 20, true);
    const result = calculateSubjectResult(mark, rules);
    expect(result.trace.decision.outcome).toBe('FAILED');
    expect(result.trace.decision.reason).toContain('below pass mark');
    expect(result.trace.decision.impact).toContain('compulsory');
  });

  it('handles marks at exact grade boundaries', () => {
    const cases: [number, number, string][] = [
      [0, 0.00, 'F'], [32, 0.00, 'F'], [33, 1.00, 'D'], [39, 1.00, 'D'],
      [40, 2.00, 'C'], [49, 2.00, 'C'], [50, 3.00, 'B'], [59, 3.00, 'B'],
      [60, 3.50, 'A-'], [69, 3.50, 'A-'], [70, 4.00, 'A'], [79, 4.00, 'A'],
      [80, 5.00, 'A+'], [100, 5.00, 'A+'],
    ];
    for (const [marks, expectedGP, expectedGrade] of cases) {
      const mark = makeSimpleMark('TEST', 'Test', marks);
      const result = calculateSubjectResult(mark, rules);
      expect(result.gradePoint).toBe(expectedGP);
      expect(result.letterGrade).toBe(expectedGrade);
    }
  });
});

// ============================================================
// Subject Result with Configurable Theory/Practical Thresholds
// ============================================================

describe('calculateSubjectResult with component thresholds', () => {
  const rulesWithThresholds: ResolvedGradingRules = {
    ...rules,
    theoryPassMark: 23,  // Example configurable threshold
    practicalPassMark: 8, // Example configurable threshold
  };

  it('passes when all components meet thresholds', () => {
    const mark = makePracticalMark('PHY', 'Physics', 40, 15);
    const result = calculateSubjectResult(mark, rulesWithThresholds);
    expect(result.passed).toBe(true);
  });

  it('fails when theory below configured threshold', () => {
    const mark = makePracticalMark('PHY', 'Physics', 20, 20);
    const result = calculateSubjectResult(mark, rulesWithThresholds);
    // Total is 40 (passes total threshold) but theory is 20 < 23
    expect(result.passed).toBe(false);
    expect(result.failureReason).toContain('Theory');
  });

  it('fails when practical below configured threshold', () => {
    const mark = makePracticalMark('PHY', 'Physics', 30, 5);
    const result = calculateSubjectResult(mark, rulesWithThresholds);
    // Total is 35 (passes total) but practical is 5 < 8
    expect(result.passed).toBe(false);
    expect(result.failureReason).toContain('Practical');
  });

  it('does not enforce component thresholds when not configured', () => {
    const mark = makePracticalMark('PHY', 'Physics', 30, 5);
    // Default rules have null thresholds
    const result = calculateSubjectResult(mark, rules);
    // Total is 35 which passes total threshold of 33
    expect(result.passed).toBe(true);
  });
});

// ============================================================
// Failure Detection
// ============================================================

describe('detectFailures', () => {
  it('detects compulsory failure', () => {
    const results: SubjectResultOutput[] = [
      calculateSubjectResult(makeSimpleMark('BAN', 'Bangla', 20, true), rules),
      calculateSubjectResult(makeSimpleMark('ENG', 'English', 60, true), rules),
    ];
    const detection = detectFailures(results);
    expect(detection.hasCompulsoryFailure).toBe(true);
    expect(detection.failedCompulsorySubjects).toContain('BAN');
  });

  it('detects absence', () => {
    const results: SubjectResultOutput[] = [
      calculateSubjectResult(makeAbsentMark('BIO', 'Biology', true, true), rules),
    ];
    const detection = detectFailures(results);
    expect(detection.hasAbsence).toBe(true);
    expect(detection.absentSubjects).toContain('BIO');
  });

  it('detects optional low GP', () => {
    const results: SubjectResultOutput[] = [
      calculateSubjectResult(makeSimpleMark('REL', 'Religion', 45, false, true), rules),
    ];
    const detection = detectFailures(results);
    expect(detection.hasOptionalLow).toBe(true);
  });

  it('reports no issues for all-passing results', () => {
    const results: SubjectResultOutput[] = [
      calculateSubjectResult(makeSimpleMark('BAN', 'Bangla', 75, true), rules),
      calculateSubjectResult(makeSimpleMark('ENG', 'English', 80, true), rules),
    ];
    const detection = detectFailures(results);
    expect(detection.hasCompulsoryFailure).toBe(false);
    expect(detection.hasAbsence).toBe(false);
  });
});

// ============================================================
// GPA Calculation
// ============================================================

describe('calculateGPA', () => {
  it('calculates GPA for all-passing student', () => {
    const results: SubjectResultOutput[] = [
      calculateSubjectResult(makeSimpleMark('BAN', 'Bangla', 75, true), rules),     // 4.00
      calculateSubjectResult(makeSimpleMark('ENG', 'English', 69, true), rules),     // 3.50
      calculateSubjectResult(makeSimpleMark('MAT', 'Mathematics', 84, true), rules), // 5.00
      calculateSubjectResult(makePracticalMark('PHY', 'Physics', 52, 19, true), rules),  // 71 → 4.00
      calculateSubjectResult(makePracticalMark('CHE', 'Chemistry', 54, 19, true), rules), // 73 → 4.00
      calculateSubjectResult(makePracticalMark('BIO', 'Biology', 64, 19, true), rules),  // 83 → 5.00
      calculateSubjectResult(makePracticalMark('AGR', 'Agriculture', 56, 18, false, true), rules), // 74 → 4.00 (optional)
    ];
    const gpa = calculateGPA(results, rules);
    // Compulsory sum: 4.00 + 3.50 + 5.00 + 4.00 + 4.00 + 5.00 = 25.50
    // Optional: GP 4.00, contribution = max(0, 4.00 - 2.00) = 2.00
    // Total: 25.50 + 2.00 = 27.50
    // GPA: 27.50 / 6 = 4.583... → 4.58
    expect(gpa.compulsoryGradePointSum).toBe(25.50);
    expect(gpa.optionalContribution).toBe(2.00);
    expect(gpa.finalGpa).toBe(4.58);
    expect(gpa.passed).toBe(true);
    expect(gpa.finalLetterGrade).toBe('A');
  });

  it('caps GPA at 5.00', () => {
    const results: SubjectResultOutput[] = [
      calculateSubjectResult(makeSimpleMark('BAN', 'Bangla', 100, true), rules),
      calculateSubjectResult(makeSimpleMark('ENG', 'English', 100, true), rules),
      calculateSubjectResult(makeSimpleMark('MAT', 'Mathematics', 100, true), rules),
      calculateSubjectResult(makePracticalMark('PHY', 'Physics', 75, 25, true), rules),
      calculateSubjectResult(makePracticalMark('CHE', 'Chemistry', 75, 25, true), rules),
      calculateSubjectResult(makePracticalMark('BIO', 'Biology', 75, 25, true), rules),
      calculateSubjectResult(makePracticalMark('HMT', 'Higher Math', 75, 25, false, true), rules),
    ];
    const gpa = calculateGPA(results, rules);
    // All 5.00 + optional 5.00 contribution = 3.00, total 33.00, / 6 = 5.50 → capped at 5.00
    expect(gpa.finalGpa).toBe(5.00);
    expect(gpa.finalLetterGrade).toBe('A+');
  });

  it('returns GPA 0.00 when compulsory subject fails', () => {
    const results: SubjectResultOutput[] = [
      calculateSubjectResult(makeSimpleMark('BAN', 'Bangla', 20, true), rules),  // F
      calculateSubjectResult(makeSimpleMark('ENG', 'English', 80, true), rules),
      calculateSubjectResult(makeSimpleMark('MAT', 'Mathematics', 90, true), rules),
      calculateSubjectResult(makePracticalMark('PHY', 'Physics', 60, 20, true), rules),
      calculateSubjectResult(makePracticalMark('CHE', 'Chemistry', 60, 20, true), rules),
      calculateSubjectResult(makePracticalMark('BIO', 'Biology', 60, 20, true), rules),
      calculateSubjectResult(makeSimpleMark('REL', 'Religion', 50, false, true), rules),
    ];
    const gpa = calculateGPA(results, rules);
    expect(gpa.finalGpa).toBe(0.00);
    expect(gpa.passed).toBe(false);
    expect(gpa.finalLetterGrade).toBe('F');
    expect(gpa.failureReasons.length).toBeGreaterThan(0);
  });

  it('handles optional subject with low GP (no contribution)', () => {
    const results: SubjectResultOutput[] = [
      calculateSubjectResult(makeSimpleMark('BAN', 'Bangla', 80, true), rules),
      calculateSubjectResult(makeSimpleMark('ENG', 'English', 80, true), rules),
      calculateSubjectResult(makeSimpleMark('MAT', 'Mathematics', 80, true), rules),
      calculateSubjectResult(makePracticalMark('PHY', 'Physics', 60, 20, true), rules),
      calculateSubjectResult(makePracticalMark('CHE', 'Chemistry', 60, 20, true), rules),
      calculateSubjectResult(makePracticalMark('BIO', 'Biology', 60, 20, true), rules),
      calculateSubjectResult(makeSimpleMark('REL', 'Religion', 40, false, true), rules), // GP 2.00
    ];
    const gpa = calculateGPA(results, rules);
    expect(gpa.optionalContribution).toBe(0); // 2.00 - 2.00 = 0
    // Compulsory: 5+5+5+5+5+5 = 30, / 6 = 5.00
    expect(gpa.finalGpa).toBe(5.00);
  });

  it('handles absent compulsory subject → fail', () => {
    const results: SubjectResultOutput[] = [
      calculateSubjectResult(makeAbsentMark('BIO', 'Biology', true, true), rules),
      calculateSubjectResult(makeSimpleMark('BAN', 'Bangla', 80, true), rules),
      calculateSubjectResult(makeSimpleMark('ENG', 'English', 80, true), rules),
      calculateSubjectResult(makeSimpleMark('MAT', 'Mathematics', 80, true), rules),
      calculateSubjectResult(makePracticalMark('PHY', 'Physics', 60, 20, true), rules),
      calculateSubjectResult(makePracticalMark('CHE', 'Chemistry', 60, 20, true), rules),
      calculateSubjectResult(makeSimpleMark('REL', 'Religion', 60, false, true), rules),
    ];
    const gpa = calculateGPA(results, rules);
    expect(gpa.passed).toBe(false);
    expect(gpa.finalGpa).toBe(0.00);
    expect(gpa.failureReasons).toEqual(
      expect.arrayContaining([expect.stringContaining('Absent')])
    );
  });
});

// ============================================================
// Full Student Result Calculation
// ============================================================

describe('calculateStudentResult', () => {
  it('calculates a complete passing student result', () => {
    const marks: MarkInput[] = [
      makeSimpleMark('BAN', 'Bangla', 75, true),
      makeSimpleMark('ENG', 'English', 69, true),
      makeSimpleMark('MAT', 'Mathematics', 84, true),
      makePracticalMark('PHY', 'Physics', 52, 19, true),
      makePracticalMark('CHE', 'Chemistry', 54, 19, true),
      makePracticalMark('BIO', 'Biology', 64, 19, true),
      makePracticalMark('AGR', 'Agriculture', 56, 18, false, true),
    ];

    const result = calculateStudentResult('S001', 'Test Student', 'Class 9', marks, rules);

    expect(result.passed).toBe(true);
    expect(result.gpa).toBeGreaterThan(0);
    expect(result.letterGrade).not.toBe('F');
    expect(result.subjectResults).toHaveLength(7);
    expect(result.trace.calculationVersion).toBeDefined();
  });

  it('calculates a failing student (compulsory failure)', () => {
    const marks: MarkInput[] = [
      makeSimpleMark('BAN', 'Bangla', 20, true),     // F
      makeSimpleMark('ENG', 'English', 60, true),
      makeSimpleMark('MAT', 'Mathematics', 70, true),
      makePracticalMark('PHY', 'Physics', 40, 15, true),
      makePracticalMark('CHE', 'Chemistry', 40, 15, true),
      makePracticalMark('BIO', 'Biology', 40, 15, true),
      makeSimpleMark('REL', 'Religion', 50, false, true),
    ];

    const result = calculateStudentResult('S002', 'Failing Student', 'Class 9', marks, rules);

    expect(result.passed).toBe(false);
    expect(result.gpa).toBe(0.00);
    expect(result.letterGrade).toBe('F');
    expect(result.hasCompulsoryFailure).toBe(true);
    expect(result.failedCompulsorySubjects).toContain('BAN');
    expect(result.checkingItems.length).toBeGreaterThan(0);
  });

  it('calculates a student with absent compulsory subject', () => {
    const marks: MarkInput[] = [
      makeSimpleMark('BAN', 'Bangla', 80, true),
      makeSimpleMark('ENG', 'English', 80, true),
      makeSimpleMark('MAT', 'Mathematics', 80, true),
      makePracticalMark('PHY', 'Physics', 60, 20, true),
      makePracticalMark('CHE', 'Chemistry', 60, 20, true),
      makeAbsentMark('BIO', 'Biology', true, true),
      makeSimpleMark('REL', 'Religion', 60, false, true),
    ];

    const result = calculateStudentResult('S003', 'Absent Student', 'Class 10', marks, rules);

    expect(result.passed).toBe(false);
    expect(result.hasAbsence).toBe(true);
    expect(result.absentSubjects).toContain('BIO');
    expect(result.gpa).toBe(0.00);
  });

  it('generates checking items for various conditions', () => {
    const marks: MarkInput[] = [
      makeSimpleMark('BAN', 'Bangla', 20, true),     // Compulsory failure
      makeSimpleMark('ENG', 'English', 60, true),
      makeSimpleMark('MAT', 'Mathematics', 70, true),
      makePracticalMark('PHY', 'Physics', 40, 15, true),
      makePracticalMark('CHE', 'Chemistry', 40, 15, true),
      makeAbsentMark('BIO', 'Biology', true, true),   // Absent
      makeSimpleMark('REL', 'Religion', 35, false, true), // Optional low
    ];

    const result = calculateStudentResult('S004', 'Multi-Issue', 'Class 9', marks, rules);

    const types = result.checkingItems.map(ci => ci.type);
    expect(types).toContain('COMPULSORY_FAILURE');
    expect(types).toContain('ABSENT');
    expect(types).toContain('OPTIONAL_LOW');
  });

  it('provides complete trace for every subject', () => {
    const marks: MarkInput[] = [
      makeSimpleMark('BAN', 'Bangla', 75, true),
      makeSimpleMark('ENG', 'English', 69, true),
      makeSimpleMark('MAT', 'Mathematics', 84, true),
      makePracticalMark('PHY', 'Physics', 52, 19, true),
      makePracticalMark('CHE', 'Chemistry', 54, 19, true),
      makePracticalMark('BIO', 'Biology', 64, 19, true),
      makeSimpleMark('REL', 'Religion', 50, false, true),
    ];

    const result = calculateStudentResult('S005', 'Trace Test', 'Class 9', marks, rules);

    for (const sr of result.subjectResults) {
      expect(sr.trace).toBeDefined();
      expect(sr.trace.input).toBeDefined();
      expect(sr.trace.passEvaluation).toBeDefined();
      expect(sr.trace.grading).toBeDefined();
      expect(sr.trace.decision).toBeDefined();
      expect(sr.trace.grading.ruleDescription).toBeTruthy();
    }
  });
});

// ============================================================
// Checking Items Generation
// ============================================================

describe('generateCheckingItems', () => {
  it('generates CRITICAL items for compulsory failures', () => {
    const sr = calculateSubjectResult(makeSimpleMark('BAN', 'Bangla', 20, true), rules);
    const failures = detectFailures([sr]);
    const items = generateCheckingItems([sr], failures, 'S001', 'Test Student');
    expect(items.some(i => i.type === 'COMPULSORY_FAILURE' && i.severity === 'CRITICAL')).toBe(true);
  });

  it('generates WARNING items for optional low GP', () => {
    const sr = calculateSubjectResult(makeSimpleMark('REL', 'Religion', 40, false, true), rules);
    const failures = detectFailures([sr]);
    const items = generateCheckingItems([sr], failures, 'S001', 'Test Student');
    expect(items.some(i => i.type === 'OPTIONAL_LOW' && i.severity === 'WARNING')).toBe(true);
  });
});

// ============================================================
// Dataset Integration Test (S001 from PUB-01)
// ============================================================

describe('Integration: PUB-01 S001', () => {
  it('calculates S001 (Kamal Begum) correctly', () => {
    // S001: BAN=75, ENG=69, MAT=84, PHY={52,19}, CHE={54,19}, BIO={64,19}, AGR={56,18}
    const marks: MarkInput[] = [
      makeSimpleMark('BAN', 'Bangla', 75, true),
      makeSimpleMark('ENG', 'English', 69, true),
      makeSimpleMark('MAT', 'Mathematics', 84, true),
      makePracticalMark('PHY', 'Physics', 52, 19, true),
      makePracticalMark('CHE', 'Chemistry', 54, 19, true),
      makePracticalMark('BIO', 'Biology', 64, 19, true),
      makePracticalMark('AGR', 'Agriculture', 56, 18, false, true),
    ];

    const result = calculateStudentResult('S001', 'Kamal Begum', 'Class 9', marks, rules);

    // BAN: 75 → A (4.00), ENG: 69 → A- (3.50), MAT: 84 → A+ (5.00)
    // PHY: 71 → A (4.00), CHE: 73 → A (4.00), BIO: 83 → A+ (5.00)
    // Compulsory sum: 4+3.5+5+4+4+5 = 25.50
    // AGR: 74 → A (4.00), contribution = max(0, 4.00-2.00) = 2.00
    // Total: 27.50, GPA: 27.50/6 = 4.583... → 4.58

    expect(result.passed).toBe(true);
    expect(result.gpa).toBe(4.58);
    expect(result.letterGrade).toBe('A');
    expect(result.subjectResults).toHaveLength(7);
    expect(result.checkingItems).toHaveLength(0);
  });
});
