// BottleResult — Zod Schema Validation for JSON Dataset Import
import { z } from 'zod';

// Practical mark shape
const practicalMarkSchema = z.object({
  theory: z.number().min(0).max(75),
  practical: z.number().min(0).max(25),
});

// A mark can be: number (0-100), "AB", or practical object
const markSchema = z.union([
  z.number().min(0).max(100),
  z.literal('AB'),
  z.literal('ab'),
  z.literal('Ab'),
  practicalMarkSchema,
]);

const studentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  class: z.string().min(1),
  optional: z.string().min(1),
  marks: z.record(z.string(), markSchema),
});

const subjectSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  practical: z.boolean(),
});

const caseSchema = z.object({
  case_id: z.string().min(1),
  subjects: z.array(subjectSchema).min(1),
  compulsory: z.array(z.string()).min(1),
  students: z.array(studentSchema).min(1),
});

export const datasetSchema = z.object({
  schema_version: z.string(),
  problem_id: z.string(),
  format_note: z.string().optional(),
  cases: z.array(caseSchema).min(1),
});

export type ValidatedDataset = z.infer<typeof datasetSchema>;
export type ValidatedCase = z.infer<typeof caseSchema>;
export type ValidatedStudent = z.infer<typeof studentSchema>;
export type ValidatedSubject = z.infer<typeof subjectSchema>;
