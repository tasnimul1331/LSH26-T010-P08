// BottleResult — Result Engine Barrel Export
export { calculateStudentResult, calculateBatchResults } from './calculateStudentResult';
export { calculateSubjectResult } from './calculateSubjectResult';
export { calculateGPA } from './calculateGPA';
export { validateMark, validateStudentMarks } from './validateMarks';
export { detectFailures } from './detectFailures';
export { normalizeRawMark, isAbsentMark } from './detectAbsence';
export { generateStudentTraceSummary, generateStructuredTrace } from './generateTrace';
export { generateCheckingItems } from './generateCheckingItems';
export { resolveGradingRules, lookupGradePoint, lookupLetterGradeForGPA, createDefaultGradingRuleRecords } from './rules';
export { DEFAULT_GRADE_BANDS, DEFAULT_GRADING_RULES, createDefaultConfiguration } from './types';
export type { 
  MarkInput, SubjectResultOutput, StudentResultOutput, 
  SubjectTrace, StudentTrace, CheckingItemOutput,
  ResolvedGradingRules 
} from './types';
