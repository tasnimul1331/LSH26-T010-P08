// BottleResult — Detect Absence Module
// Handles AB normalization

import { MarkInput } from './types';
import { DatasetMark } from '@/types';

/**
 * Normalize a raw dataset mark value, detecting AB absence.
 * Returns normalized mark input values.
 */
export function normalizeRawMark(
  rawValue: DatasetMark,
  subjectCode: string,
  subjectName: string,
  hasPractical: boolean,
  isCompulsory: boolean,
  isOptional: boolean,
  theoryMax: number,
  practicalMax: number,
  maxMarks: number
): MarkInput {
  // Check for AB (absence)
  if (rawValue === 'AB' || rawValue === 'ab' || rawValue === 'Ab') {
    return {
      subjectCode,
      subjectName,
      hasPractical,
      isCompulsory,
      isOptional,
      theoryMarks: null,
      practicalMarks: null,
      totalMarks: 0,
      isAbsent: true,
      rawValue,
      theoryMax,
      practicalMax,
      maxMarks,
    };
  }

  // Practical subject with theory/practical components
  if (hasPractical && typeof rawValue === 'object' && rawValue !== null && 'theory' in rawValue && 'practical' in rawValue) {
    const theory = rawValue.theory;
    const practical = rawValue.practical;
    return {
      subjectCode,
      subjectName,
      hasPractical,
      isCompulsory,
      isOptional,
      theoryMarks: theory,
      practicalMarks: practical,
      totalMarks: theory + practical,
      isAbsent: false,
      rawValue,
      theoryMax,
      practicalMax,
      maxMarks,
    };
  }

  // Non-practical subject with single numeric mark
  if (typeof rawValue === 'number') {
    return {
      subjectCode,
      subjectName,
      hasPractical,
      isCompulsory,
      isOptional,
      theoryMarks: hasPractical ? null : rawValue,
      practicalMarks: null,
      totalMarks: rawValue,
      isAbsent: false,
      rawValue,
      theoryMax,
      practicalMax,
      maxMarks,
    };
  }

  // Invalid/unrecognized format - treat as data error
  return {
    subjectCode,
    subjectName,
    hasPractical,
    isCompulsory,
    isOptional,
    theoryMarks: null,
    practicalMarks: null,
    totalMarks: 0,
    isAbsent: false,
    rawValue,
    theoryMax,
    practicalMax,
    maxMarks,
  };
}

/**
 * Check if a raw mark value represents absence.
 */
export function isAbsentMark(rawValue: DatasetMark): boolean {
  return rawValue === 'AB' || rawValue === 'ab' || rawValue === 'Ab';
}
