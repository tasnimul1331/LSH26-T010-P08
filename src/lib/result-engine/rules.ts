// BottleResult — Grading Rules Module
// Types, interfaces, helpers, and rule resolution
// The authoritative rule values come from the grading_rules DB table.
// This module provides the structure and helper functions.

import { GradeBand, GradingRule, GradingRuleConfiguration } from '@/types';
import { ResolvedGradingRules, DEFAULT_GRADE_BANDS, DEFAULT_GRADING_RULES } from './types';

/**
 * Resolve grading rules from database records into a unified configuration.
 * This is the ONLY function that should be used to get active rules.
 */
export function resolveGradingRules(
  caseId: string,
  dbRules: GradingRule[]
): ResolvedGradingRules {
  if (!dbRules || dbRules.length === 0) {
    return { ...DEFAULT_GRADING_RULES, caseId, source: 'FALLBACK' };
  }

  // Find the active grade_bands rule
  const gradeBandsRule = dbRules.find(
    r => r.rule_type === 'GRADE_BANDS' && r.active
  );

  // Find the active pass_thresholds rule
  const passRule = dbRules.find(
    r => r.rule_type === 'PASS_THRESHOLDS' && r.active
  );

  // Find the active gpa_config rule
  const gpaRule = dbRules.find(
    r => r.rule_type === 'GPA_CONFIG' && r.active
  );

  const gradeBands = gradeBandsRule?.configuration?.grade_bands ?? DEFAULT_GRADE_BANDS;
  const config = passRule?.configuration ?? {};
  const gpaConfig = gpaRule?.configuration ?? {};

  return {
    caseId,
    ruleVersion: gradeBandsRule?.updated_at ?? '1.0.0',
    gradeBands: gradeBands as GradeBand[],
    totalPassMark: (config.total_pass_mark as number) ?? 33,
    theoryPassMark: (config.theory_pass_mark as number) ?? null,
    practicalPassMark: (config.practical_pass_mark as number) ?? null,
    optionalContributionBase: (gpaConfig.optional_contribution_base as number) ?? 2.00,
    compulsoryCount: (gpaConfig.compulsory_count as number) ?? 6,
    gpaCap: (gpaConfig.gpa_cap as number) ?? 5.00,
    gpaLetterGradeBands: (gpaConfig.grade_bands as GradeBand[]) ?? gradeBands as GradeBand[],
    source: 'DATABASE',
  };
}

/**
 * Look up grade point for a given total mark using the resolved grade bands.
 */
export function lookupGradePoint(
  totalMarks: number,
  gradeBands: GradeBand[]
): { gradePoint: number; letterGrade: string; band: GradeBand | null } {
  // Sort bands descending by min_mark for correct lookup
  const sorted = [...gradeBands].sort((a, b) => b.min_mark - a.min_mark);

  for (const band of sorted) {
    if (totalMarks >= band.min_mark && totalMarks <= band.max_mark) {
      return {
        gradePoint: band.grade_point,
        letterGrade: band.letter_grade,
        band,
      };
    }
  }

  // If no band matches (shouldn't happen with proper config), return F
  return {
    gradePoint: 0.00,
    letterGrade: 'F',
    band: null,
  };
}

/**
 * Look up letter grade for a GPA value.
 */
export function lookupLetterGradeForGPA(
  gpa: number,
  gradeBands: GradeBand[]
): string {
  // GPA uses the same scale conceptually:
  // 5.00 = A+, 4.00-4.99 = A, 3.50-3.99 = A-, etc.
  if (gpa >= 5.00) return 'A+';
  if (gpa >= 4.00) return 'A';
  if (gpa >= 3.50) return 'A-';
  if (gpa >= 3.00) return 'B';
  if (gpa >= 2.00) return 'C';
  if (gpa >= 1.00) return 'D';
  return 'F';
}

/**
 * Validate that a rule configuration has the minimum required fields.
 */
export function validateRuleConfiguration(
  config: GradingRuleConfiguration
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.grade_bands) {
    if (!Array.isArray(config.grade_bands) || config.grade_bands.length === 0) {
      errors.push('grade_bands must be a non-empty array');
    } else {
      for (const band of config.grade_bands) {
        if (typeof band.min_mark !== 'number' || typeof band.max_mark !== 'number') {
          errors.push('Each grade band must have numeric min_mark and max_mark');
        }
        if (typeof band.grade_point !== 'number') {
          errors.push('Each grade band must have a numeric grade_point');
        }
        if (typeof band.letter_grade !== 'string') {
          errors.push('Each grade band must have a string letter_grade');
        }
      }
    }
  }

  if (config.total_pass_mark !== undefined && typeof config.total_pass_mark !== 'number') {
    errors.push('total_pass_mark must be a number');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Create the default set of grading rules for database seeding.
 */
export function createDefaultGradingRuleRecords(caseId: string): Partial<GradingRule>[] {
  return [
    {
      case_id: caseId,
      rule_name: 'Bangladesh SSC Grade Bands',
      rule_type: 'GRADE_BANDS',
      active: true,
      configuration: {
        grade_bands: DEFAULT_GRADE_BANDS,
      },
    },
    {
      case_id: caseId,
      rule_name: 'Pass Thresholds',
      rule_type: 'PASS_THRESHOLDS',
      active: true,
      configuration: {
        total_pass_mark: 33,
        // theory_pass_mark and practical_pass_mark intentionally omitted.
        // They must be configured through the admin Rules page if the
        // official P08 specification requires separate component thresholds.
      },
    },
    {
      case_id: caseId,
      rule_name: 'GPA Configuration',
      rule_type: 'GPA_CONFIG',
      active: true,
      configuration: {
        optional_contribution_base: 2.00,
        compulsory_count: 6,
        gpa_cap: 5.00,
      },
    },
  ];
}
