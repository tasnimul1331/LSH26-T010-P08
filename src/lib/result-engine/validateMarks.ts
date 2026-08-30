// BottleResult — Validate Marks Module
// Validates raw mark inputs before calculation

import { MarkInput, ResolvedGradingRules } from './types';

export interface MarkValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a single mark input against the subject configuration and rules.
 */
export function validateMark(
  mark: MarkInput,
  rules: ResolvedGradingRules
): MarkValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Absent marks are valid but flagged
  if (mark.isAbsent) {
    return { valid: true, errors, warnings: ['Student is absent in this subject'] };
  }

  if (mark.hasPractical) {
    // Validate theory marks
    if (mark.theoryMarks === null || mark.theoryMarks === undefined) {
      errors.push(`Theory marks missing for practical subject ${mark.subjectCode}`);
    } else {
      if (mark.theoryMarks < 0) {
        errors.push(`Theory marks cannot be negative for ${mark.subjectCode}`);
      }
      if (mark.theoryMarks > mark.theoryMax) {
        errors.push(`Theory marks (${mark.theoryMarks}) exceed maximum (${mark.theoryMax}) for ${mark.subjectCode}`);
      }
    }

    // Validate practical marks
    if (mark.practicalMarks === null || mark.practicalMarks === undefined) {
      errors.push(`Practical marks missing for practical subject ${mark.subjectCode}`);
    } else {
      if (mark.practicalMarks < 0) {
        errors.push(`Practical marks cannot be negative for ${mark.subjectCode}`);
      }
      if (mark.practicalMarks > mark.practicalMax) {
        errors.push(`Practical marks (${mark.practicalMarks}) exceed maximum (${mark.practicalMax}) for ${mark.subjectCode}`);
      }
    }
  } else {
    // Non-practical subject
    if (mark.totalMarks < 0) {
      errors.push(`Marks cannot be negative for ${mark.subjectCode}`);
    }
    if (mark.totalMarks > mark.maxMarks) {
      errors.push(`Marks (${mark.totalMarks}) exceed maximum (${mark.maxMarks}) for ${mark.subjectCode}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate all marks for a student.
 */
export function validateStudentMarks(
  marks: MarkInput[],
  rules: ResolvedGradingRules
): MarkValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  if (marks.length === 0) {
    return { valid: false, errors: ['No marks provided'], warnings: [] };
  }

  for (const mark of marks) {
    const result = validateMark(mark, rules);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
