// BottleResult — Generate Checking Items Module
// Auto-generates checking items for flagged conditions

import { SubjectResultOutput, CheckingItemOutput } from './types';
import { FailureDetectionResult } from './detectFailures';

/**
 * Generate checking items from subject results and failure detection.
 */
export function generateCheckingItems(
  subjectResults: SubjectResultOutput[],
  failures: FailureDetectionResult,
  studentCode: string,
  studentName: string
): CheckingItemOutput[] {
  const items: CheckingItemOutput[] = [];

  // Compulsory failures — CRITICAL
  for (const subjectCode of failures.failedCompulsorySubjects) {
    const sr = subjectResults.find(r => r.subjectCode === subjectCode);
    if (!sr) continue;

    if (sr.isAbsent) {
      items.push({
        type: 'ABSENT',
        severity: 'CRITICAL',
        subjectCode,
        title: `Absent in compulsory subject: ${sr.subjectName}`,
        description: `${studentName} (${studentCode}) was absent in ${sr.subjectName}. This is a compulsory subject — the overall result fails.`,
        metadata: {
          studentCode,
          studentName,
          subjectCode,
          subjectName: sr.subjectName,
          isCompulsory: true,
        },
      });
    } else {
      items.push({
        type: 'COMPULSORY_FAILURE',
        severity: 'CRITICAL',
        subjectCode,
        title: `Failed compulsory subject: ${sr.subjectName}`,
        description: `${studentName} (${studentCode}) scored ${sr.totalMarks}/${sr.trace.input.maxMarks} in ${sr.subjectName}. ${sr.failureReason || 'Below pass mark.'} This causes the overall result to fail.`,
        metadata: {
          studentCode,
          studentName,
          subjectCode,
          subjectName: sr.subjectName,
          totalMarks: sr.totalMarks,
          maxMarks: sr.trace.input.maxMarks,
          failureReason: sr.failureReason,
        },
      });
    }
  }

  // Practical failures — HIGH
  for (const subjectCode of failures.practicalFailureSubjects) {
    // Skip if already reported as compulsory failure
    if (failures.failedCompulsorySubjects.includes(subjectCode)) continue;
    
    const sr = subjectResults.find(r => r.subjectCode === subjectCode);
    if (!sr) continue;

    items.push({
      type: 'PRACTICAL_FAILURE',
      severity: 'HIGH',
      subjectCode,
      title: `Practical component issue: ${sr.subjectName}`,
      description: `${studentName} (${studentCode}) has a practical component issue in ${sr.subjectName}. Theory: ${sr.theoryMarks}/${sr.trace.input.theoryMax}, Practical: ${sr.practicalMarks}/${sr.trace.input.practicalMax}. ${sr.failureReason || ''}`,
      metadata: {
        studentCode,
        studentName,
        subjectCode,
        subjectName: sr.subjectName,
        theoryMarks: sr.theoryMarks,
        practicalMarks: sr.practicalMarks,
        theoryMax: sr.trace.input.theoryMax,
        practicalMax: sr.trace.input.practicalMax,
      },
    });
  }

  // Absences (non-compulsory) — HIGH
  for (const subjectCode of failures.absentSubjects) {
    // Skip if already reported as compulsory failure
    if (failures.failedCompulsorySubjects.includes(subjectCode)) continue;

    const sr = subjectResults.find(r => r.subjectCode === subjectCode);
    if (!sr) continue;

    items.push({
      type: 'ABSENT',
      severity: sr.isCompulsory ? 'CRITICAL' : 'HIGH',
      subjectCode,
      title: `Absent in ${sr.isCompulsory ? 'compulsory' : 'optional'} subject: ${sr.subjectName}`,
      description: `${studentName} (${studentCode}) was absent in ${sr.subjectName}.`,
      metadata: {
        studentCode,
        studentName,
        subjectCode,
        subjectName: sr.subjectName,
        isCompulsory: sr.isCompulsory,
      },
    });
  }

  // Optional subject with low GP — WARNING
  for (const subjectCode of failures.optionalLowSubjects) {
    const sr = subjectResults.find(r => r.subjectCode === subjectCode);
    if (!sr) continue;

    items.push({
      type: 'OPTIONAL_LOW',
      severity: 'WARNING',
      subjectCode,
      title: `Optional subject low GP: ${sr.subjectName}`,
      description: `${studentName} (${studentCode}) scored GP ${sr.gradePoint.toFixed(2)} in optional subject ${sr.subjectName}. No additional contribution to GPA (requires GP > 2.00).`,
      metadata: {
        studentCode,
        studentName,
        subjectCode,
        subjectName: sr.subjectName,
        gradePoint: sr.gradePoint,
        totalMarks: sr.totalMarks,
      },
    });
  }

  return items;
}
