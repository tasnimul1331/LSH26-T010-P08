// BottleResult — Business Validation for Dataset Import
import type { ValidatedDataset, ValidatedCase, ValidatedStudent } from './schema';
import type { ImportError, ImportWarning } from '@/types';

/**
 * Perform business rule validation on a structurally valid dataset.
 */
export function validateBusiness(dataset: ValidatedDataset): {
  errors: ImportError[];
  warnings: ImportWarning[];
} {
  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];

  for (const caseData of dataset.cases) {
    validateCase(caseData, errors, warnings);
  }

  // Check for duplicate case IDs across the dataset
  const caseIds = dataset.cases.map(c => c.case_id);
  const duplicateCases = caseIds.filter((id, i) => caseIds.indexOf(id) !== i);
  if (duplicateCases.length > 0) {
    errors.push({
      type: 'DUPLICATE_CASE',
      message: `Duplicate case IDs found: ${[...new Set(duplicateCases)].join(', ')}`,
    });
  }

  return { errors, warnings };
}

function validateCase(
  caseData: ValidatedCase,
  errors: ImportError[],
  warnings: ImportWarning[]
) {
  const subjectCodes = caseData.subjects.map(s => s.code);
  const compulsoryCodes = caseData.compulsory;
  const optionalCodes = subjectCodes.filter(c => !compulsoryCodes.includes(c));

  // Verify all compulsory subjects exist
  for (const code of compulsoryCodes) {
    if (!subjectCodes.includes(code)) {
      errors.push({
        type: 'MISSING_COMPULSORY_SUBJECT',
        message: `Case ${caseData.case_id}: Compulsory subject ${code} not found in subjects list`,
        path: `cases.${caseData.case_id}.compulsory`,
      });
    }
  }

  // Check for duplicate student IDs within the case
  const studentIds = caseData.students.map(s => s.id);
  const duplicateStudents = studentIds.filter((id, i) => studentIds.indexOf(id) !== i);
  if (duplicateStudents.length > 0) {
    errors.push({
      type: 'DUPLICATE_STUDENT',
      message: `Case ${caseData.case_id}: Duplicate student IDs: ${[...new Set(duplicateStudents)].join(', ')}`,
      path: `cases.${caseData.case_id}.students`,
    });
  }

  // Validate each student
  for (const student of caseData.students) {
    validateStudent(student, caseData, subjectCodes, compulsoryCodes, optionalCodes, errors, warnings);
  }

  // Check minimum student count
  if (caseData.students.length < 60) {
    warnings.push({
      type: 'LOW_STUDENT_COUNT',
      message: `Case ${caseData.case_id}: Only ${caseData.students.length} students (expected at least 60)`,
    });
  }
}

function validateStudent(
  student: ValidatedStudent,
  caseData: ValidatedCase,
  subjectCodes: string[],
  compulsoryCodes: string[],
  optionalCodes: string[],
  errors: ImportError[],
  warnings: ImportWarning[]
) {
  const caseId = caseData.case_id;

  // Validate optional subject exists
  if (!subjectCodes.includes(student.optional)) {
    errors.push({
      type: 'INVALID_OPTIONAL_SUBJECT',
      message: `Case ${caseId}, Student ${student.id}: Optional subject "${student.optional}" not found in subjects`,
      path: `cases.${caseId}.students.${student.id}.optional`,
    });
  }

  // Validate optional subject is not compulsory
  if (compulsoryCodes.includes(student.optional)) {
    errors.push({
      type: 'OPTIONAL_IS_COMPULSORY',
      message: `Case ${caseId}, Student ${student.id}: Optional subject "${student.optional}" is listed as compulsory`,
      path: `cases.${caseId}.students.${student.id}.optional`,
    });
  }

  // Validate mark count (should have marks for all compulsory + optional)
  const expectedSubjects = [...compulsoryCodes, student.optional];
  const markKeys = Object.keys(student.marks);

  for (const code of expectedSubjects) {
    if (!markKeys.includes(code)) {
      errors.push({
        type: 'MISSING_MARK',
        message: `Case ${caseId}, Student ${student.id}: Missing mark for subject ${code}`,
        path: `cases.${caseId}.students.${student.id}.marks.${code}`,
      });
    }
  }

  // Check for unexpected marks
  for (const code of markKeys) {
    if (!expectedSubjects.includes(code)) {
      warnings.push({
        type: 'EXTRA_MARK',
        message: `Case ${caseId}, Student ${student.id}: Unexpected mark for subject ${code}`,
        path: `cases.${caseId}.students.${student.id}.marks.${code}`,
      });
    }
  }

  // Validate mark types match subject configuration
  for (const [code, mark] of Object.entries(student.marks)) {
    const subject = caseData.subjects.find(s => s.code === code);
    if (!subject) continue;

    if (mark === 'AB' || mark === 'ab' || mark === 'Ab') continue; // AB is valid for any subject

    if (subject.practical) {
      if (typeof mark === 'number') {
        warnings.push({
          type: 'MARK_FORMAT_MISMATCH',
          message: `Case ${caseId}, Student ${student.id}: Subject ${code} is practical but received a plain number`,
          path: `cases.${caseId}.students.${student.id}.marks.${code}`,
          value: mark,
        });
      }
    } else {
      if (typeof mark === 'object' && mark !== null) {
        errors.push({
          type: 'MARK_FORMAT_MISMATCH',
          message: `Case ${caseId}, Student ${student.id}: Subject ${code} is non-practical but received theory/practical object`,
          path: `cases.${caseId}.students.${student.id}.marks.${code}`,
          value: mark,
        });
      }
    }
  }
}
