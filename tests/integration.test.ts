// BottleResult — Comprehensive Integration & System Test Suite
// Verifies full end-to-end user flows against live calculated P08 dataset

import { describe, it, expect } from 'vitest';
import {
  getDashboardMetrics,
  getCases,
  getStudents,
  getStudentWithDetails,
  getCheckingItems,
  resolveCheckingItem,
  updateMark,
  updatePublishStatus,
  verifyResultByToken,
  getAuditLogs,
  getGradingRules,
  updateGradingRule,
} from '@/lib/data-service';
import { getAnalyticsData } from '@/lib/analytics-service';

describe('System Integration: P08 Dataset Initialization & Metrics', () => {
  it('loads all 25 cases from P08 dataset', () => {
    const cases = getCases();
    expect(cases).toHaveLength(25);
    expect(cases[0].case_code).toBe('PUB-01');
    expect(cases[24].case_code).toBe('PUB-25');
  });

  it('calculates metrics for PUB-01 accurately from live data', () => {
    const metrics = getDashboardMetrics('PUB-01');
    expect(metrics.totalStudents).toBe(80);
    expect(metrics.passed).toBeGreaterThan(0);
    expect(metrics.failed).toBeGreaterThan(0);
    expect(metrics.passed + metrics.failed).toBe(80);
    expect(metrics.averageGpa).toBeGreaterThan(0);
    expect(metrics.averageGpa).toBeLessThanOrEqual(5.0);
    expect(metrics.absent).toBe(2); // 2 AB students in PUB-01
  });

  it('calculates global metrics across all 1,765 students', () => {
    const globalMetrics = getDashboardMetrics();
    expect(globalMetrics.totalStudents).toBe(1765);
    expect(globalMetrics.passed).toBeGreaterThan(1000);
    expect(globalMetrics.absent).toBe(50); // 2 per case * 25 cases
  });
});

describe('System Integration: Student Records & Calculation Trace', () => {
  it('retrieves student details and subject breakdown for S001 (Kamal Begum)', () => {
    const details = getStudentWithDetails('PUB-01', 'S001');
    expect(details).toBeDefined();
    expect(details?.student.name).toBe('Kamal Begum');
    expect(details?.student.student_code).toBe('S001');
    expect(details?.subjects).toHaveLength(7);
    expect(details?.calculated?.passed).toBe(true);
    expect(details?.calculated?.gpa).toBe(4.58);
    expect(details?.calculated?.letterGrade).toBe('A');
  });

  it('correctly handles failing student S002', () => {
    const details = getStudentWithDetails('PUB-01', 'S002');
    expect(details).toBeDefined();
    expect(details?.calculated?.passed).toBe(false);
    expect(details?.calculated?.gpa).toBe(0.00);
    expect(details?.calculated?.letterGrade).toBe('F');
    expect(details?.calculated?.trace.failureReasons.length).toBeGreaterThan(0);
  });

  it('correctly handles absent student S032 (Hasib Khatun)', () => {
    const details = getStudentWithDetails('PUB-01', 'S032');
    expect(details).toBeDefined();
    expect(details?.calculated?.hasAbsence).toBe(true);
    expect(details?.calculated?.absentSubjects).toContain('BIO');
    expect(details?.calculated?.passed).toBe(false);
  });
});

describe('System Integration: Mark Editing, Recalculation & Audit Logging', () => {
  it('updates student mark, triggers immediate recalculation, and writes audit record', () => {
    const studentBefore = getStudentWithDetails('PUB-01', 'S001');
    const oldGpa = studentBefore?.calculated?.gpa;
    const oldAuditCount = getAuditLogs().length;

    // Edit Physics marks for S001
    const res = updateMark({
      caseCode: 'PUB-01',
      studentCode: 'S001',
      subjectCode: 'PHY',
      theoryMarks: 75,
      practicalMarks: 25,
      reason: 'Re-evaluation by scrutiny board',
      updatedBy: 'Chief Examiner',
    });

    expect(res.success).toBe(true);
    expect(res.newGpa).toBeGreaterThanOrEqual(oldGpa!);

    // Verify audit log
    const auditLogs = getAuditLogs();
    expect(auditLogs.length).toBe(oldAuditCount + 1);
    expect(auditLogs[0].action).toBe('MARK_CORRECTION_AND_RECALCULATION');
    expect(auditLogs[0].user_id).toBe('Chief Examiner');
  });
});

describe('System Integration: Checking Center Scrutiny', () => {
  it('lists checking items and resolves an item with audit trail', () => {
    const items = getCheckingItems({ caseCode: 'PUB-01' });
    expect(items.length).toBeGreaterThan(0);

    const targetItem = items[0];
    const initialResolved = targetItem.resolved;

    const resolveRes = resolveCheckingItem(targetItem.id, 'Scrutiny Officer');
    expect(resolveRes.success).toBe(true);
    expect(resolveRes.item?.resolved).toBe(true);

    const latestAudit = getAuditLogs()[0];
    expect(latestAudit.action).toBe('CHECKING_ITEM_RESOLVED');
    expect(latestAudit.user_id).toBe('Scrutiny Officer');
  });
});

describe('System Integration: Result Publication & Token Verification', () => {
  it('updates publish status and verifies result via secure token', () => {
    const student = getStudentWithDetails('PUB-01', 'S001');
    const token = student?.result?.verification_token;
    expect(token).toBeDefined();

    const verification = verifyResultByToken(token!);
    expect(verification).toBeDefined();
    expect(verification?.student_name).toBe('Kamal Begum');
    expect(verification?.verified).toBe(true);
    expect(verification?.gpa).toBeGreaterThan(0);
  });

  it('rejects invalid or non-existent tokens', () => {
    const invalidVerification = verifyResultByToken('NON-EXISTENT-TOKEN-999');
    expect(invalidVerification).toBeNull();
  });
});

describe('System Integration: Analytics Computation', () => {
  it('computes live distribution statistics and dynamic insights', () => {
    const analytics = getAnalyticsData('PUB-01');
    expect(analytics.summary.totalStudents).toBe(80);
    expect(analytics.gradeDistribution.length).toBe(7); // A+, A, A-, B, C, D, F
    expect(analytics.passFailData).toHaveLength(2);
    expect(analytics.practicalVsTheory.length).toBeGreaterThan(0);
    expect(analytics.insights.length).toBeGreaterThan(0);
  });
});

describe('System Integration: Grading Rules Policy', () => {
  it('updates grading rule pass mark and preserves audit log', () => {
    const rules = getGradingRules('PUB-01');
    expect(rules.length).toBeGreaterThan(0);

    const updateRes = updateGradingRule({
      ruleId: rules[0].id,
      totalPassMark: 33,
      theoryPassMark: 25,
      user: 'SuperAdmin',
    });

    expect(updateRes.success).toBe(true);
    expect(updateRes.rule?.configuration.theory_pass_mark).toBe(25);

    const latestAudit = getAuditLogs()[0];
    expect(latestAudit.action).toBe('GRADING_RULE_UPDATED');
  });
});
