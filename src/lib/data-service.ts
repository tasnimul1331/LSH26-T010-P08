// BottleResult — Unified Data Service & Persistence Layer
// Sourced from P08 official dataset with deterministic engine calculation.
// Seamlessly interfaces with Supabase when available and provides in-memory stateful persistence.

import rawDataset from '../../P08_school_results_public.json';
import {
  calculateStudentResult,
  normalizeRawMark,
  resolveGradingRules,
  DEFAULT_GRADING_RULES,
} from './result-engine';
import type {
  StudentResultOutput,
  ResolvedGradingRules,
  MarkInput,
  CheckingItemOutput,
} from './result-engine/types';
import type {
  Case,
  Class,
  Subject,
  Student,
  Mark,
  Result,
  SubjectResult,
  CheckingItem,
  AuditLog,
  GradingRule,
  DashboardMetrics,
  DatasetRoot,
  ResultStatus,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

// In-Memory Data Store (Initialized from P08 dataset)
interface MemoryStore {
  cases: Case[];
  classes: Class[];
  subjects: Subject[];
  students: Student[];
  marks: Mark[];
  results: Result[];
  subjectResults: SubjectResult[];
  checkingItems: CheckingItem[];
  auditLogs: AuditLog[];
  gradingRules: GradingRule[];
  calculatedStudentsMap: Map<string, StudentResultOutput>;
  rulesMap: Map<string, ResolvedGradingRules>;
  initialized: boolean;
}

const store: MemoryStore = {
  cases: [],
  classes: [],
  subjects: [],
  students: [],
  marks: [],
  results: [],
  subjectResults: [],
  checkingItems: [],
  auditLogs: [],
  gradingRules: [],
  calculatedStudentsMap: new Map(),
  rulesMap: new Map(),
  initialized: false,
};

/**
 * Initialize store from official P08 JSON dataset
 */
export function initializeStore() {
  if (store.initialized) return;

  const dataset = rawDataset as unknown as DatasetRoot;

  for (const c of dataset.cases) {
    const caseId = `case-${c.case_id}`;
    
    // 1. Create Case
    const caseRecord: Case = {
      id: caseId,
      case_code: c.case_id,
      problem_id: dataset.problem_id || 'P08',
      schema_version: dataset.schema_version || '2.1',
      name: `SSC Exam Cohort — ${c.case_id}`,
      status: 'PUBLISHED' as any, // Initial dataset is published for public lookup
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.cases.push(caseRecord);

    // 2. Create Classes
    const classNames = [...new Set(c.students.map((s) => s.class))];
    const classMap = new Map<string, string>();
    for (const clsName of classNames) {
      const classId = `class-${c.case_id}-${clsName.replace(/\s+/g, '-').toLowerCase()}`;
      classMap.set(clsName, classId);
      store.classes.push({
        id: classId,
        case_id: caseId,
        name: clsName,
        academic_year: '2024',
        created_at: new Date().toISOString(),
      });
    }

    // 3. Create Subjects
    const subjectMap = new Map<string, Subject>();
    c.subjects.forEach((subj, idx) => {
      const isCompulsory = c.compulsory.includes(subj.code);
      const subjectId = `subj-${c.case_id}-${subj.code}`;
      const subjectRecord: Subject = {
        id: subjectId,
        case_id: caseId,
        code: subj.code,
        name: subj.name,
        has_practical: subj.practical,
        is_compulsory: isCompulsory,
        max_marks: 100,
        theory_max: subj.practical ? 75 : 100,
        practical_max: subj.practical ? 25 : 0,
        display_order: idx + 1,
        created_at: new Date().toISOString(),
      };
      store.subjects.push(subjectRecord);
      subjectMap.set(subj.code, subjectRecord);
    });

    // 4. Create Grading Rules for this case
    const rulesRecord: GradingRule = {
      id: `rule-${c.case_id}-base`,
      case_id: caseId,
      rule_name: `Bangladesh SSC Rules (${c.case_id})`,
      rule_type: 'GRADE_BANDS',
      min_mark: null,
      max_mark: null,
      grade_point: null,
      letter_grade: null,
      configuration: {
        grade_bands: DEFAULT_GRADING_RULES.gradeBands,
        total_pass_mark: 33,
        theory_pass_mark: undefined, // Configurable, requires official confirmation
        practical_pass_mark: undefined, // Configurable, requires official confirmation
        optional_contribution_base: 2.0,
        compulsory_count: 6,
        gpa_cap: 5.0,
      },
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.gradingRules.push(rulesRecord);

    const resolvedRules = resolveGradingRules(caseId, [rulesRecord]);
    store.rulesMap.set(c.case_id, resolvedRules);

    // 5. Create Students, Marks, and Run Result Engine
    for (const student of c.students) {
      const studentId = `student-${c.case_id}-${student.id}`;
      const classId = classMap.get(student.class) || '';
      const optSubject = subjectMap.get(student.optional);

      const studentRecord: Student = {
        id: studentId,
        student_code: student.id,
        name: student.name,
        class_id: classId,
        case_id: caseId,
        optional_subject_id: optSubject ? optSubject.id : null,
        status: 'ACTIVE' as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.students.push(studentRecord);

      // Prepare marks input for engine
      const markInputs: MarkInput[] = [];
      for (const [subjCode, rawVal] of Object.entries(student.marks)) {
        const subj = subjectMap.get(subjCode);
        if (!subj) continue;

        const isCompulsory = c.compulsory.includes(subjCode);
        const isOptional = student.optional === subjCode;

        const norm = normalizeRawMark(
          rawVal,
          subj.code,
          subj.name,
          subj.has_practical,
          isCompulsory,
          isOptional,
          subj.theory_max || 100,
          subj.practical_max || 0,
          subj.max_marks
        );
        markInputs.push(norm);

        // Store Mark record
        const markRecord: Mark = {
          id: `mark-${studentId}-${subj.id}`,
          student_id: studentId,
          subject_id: subj.id,
          theory_marks: norm.theoryMarks,
          practical_marks: norm.practicalMarks,
          is_absent: norm.isAbsent,
          raw_value: typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        store.marks.push(markRecord);
      }

      // DETERMINISTIC ENGINE CALCULATION
      const studentResult = calculateStudentResult(
        student.id,
        student.name,
        student.class,
        markInputs,
        resolvedRules
      );

      const studentKey = `${c.case_id}_${student.id}`;
      store.calculatedStudentsMap.set(studentKey, studentResult);

      const verificationToken = `VRF-${c.case_id}-${student.id}-${Math.abs(
        (studentResult.gpa * 1000 + studentResult.totalMarks) % 99999
      )
        .toString()
        .padStart(5, '0')}`;

      // Store Result record
      const resultId = `result-${studentId}`;
      const resultRecord: Result = {
        id: resultId,
        student_id: studentId,
        case_id: caseId,
        gpa: studentResult.gpa,
        letter_grade: studentResult.letterGrade,
        total_marks: studentResult.totalMarks,
        passed: studentResult.passed,
        result_status: 'PUBLISHED' as any,
        calculation_version: studentResult.trace.calculationVersion,
        calculated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        verification_token: verificationToken,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.results.push(resultRecord);

      // Store SubjectResult records
      for (const sr of studentResult.subjectResults) {
        const subj = subjectMap.get(sr.subjectCode);
        if (!subj) continue;

        const subjectResultRecord: SubjectResult = {
          id: `sr-${resultId}-${subj.id}`,
          result_id: resultId,
          subject_id: subj.id,
          total_marks: sr.totalMarks,
          grade_point: sr.gradePoint,
          letter_grade: sr.letterGrade,
          passed: sr.passed,
          is_compulsory: sr.isCompulsory,
          is_optional: sr.isOptional,
          failure_reason: sr.failureReason,
          calculation_details: {
            raw_input: sr.trace.input.rawValue as any,
            normalized_input: {
              theory_marks: sr.trace.input.theoryMarks,
              practical_marks: sr.trace.input.practicalMarks,
              total: sr.trace.input.totalMarks,
              is_absent: sr.trace.input.isAbsent,
            },
            theory_mark: sr.trace.input.theoryMarks,
            practical_mark: sr.trace.input.practicalMarks,
            total: sr.trace.input.totalMarks,
            rule_id: sr.trace.grading.ruleId,
            rule_description: sr.trace.grading.ruleDescription,
            intermediate_calculations: {},
            decision_outcome: sr.trace.decision.outcome,
            failure_reason: sr.failureReason,
          },
          created_at: new Date().toISOString(),
        };
        store.subjectResults.push(subjectResultRecord);
      }

      // Store Checking Items
      for (const item of studentResult.checkingItems) {
        const subj = item.subjectCode ? subjectMap.get(item.subjectCode) : null;
        store.checkingItems.push({
          id: uuidv4(),
          student_id: studentId,
          result_id: resultId,
          type: item.type as any,
          severity: item.severity as any,
          subject_id: subj ? subj.id : null,
          title: item.title,
          description: item.description,
          metadata: item.metadata,
          status: 'OPEN',
          resolved: false,
          resolved_by: null,
          resolved_at: null,
          resolution_notes: null,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  // Add Initial Seed Audit Log
  store.auditLogs.push({
    id: uuidv4(),
    user_id: 'system',
    action: 'DATASET_IMPORTED_AND_CALCULATED',
    entity_type: 'DATASET',
    entity_id: 'P08_school_results_public.json',
    old_value: null,
    new_value: {
      cases_count: store.cases.length,
      students_count: store.students.length,
      status: 'CALCULATED_AND_PUBLISHED',
      rule_set: 'Bangladesh SSC Standard (P08)',
    },
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString(),
  });

  store.initialized = true;
}

// Ensure store is ready on load
initializeStore();

// ============================================================
// DATA ACCESS & QUERY API
// ============================================================

export function getCases(): Case[] {
  initializeStore();
  return store.cases;
}

export function getCaseByCode(caseCode: string): Case | undefined {
  initializeStore();
  return store.cases.find((c) => c.case_code === caseCode);
}

export function getSubjects(caseId?: string): Subject[] {
  initializeStore();
  return caseId ? store.subjects.filter((s) => s.case_id === caseId) : store.subjects;
}

export function getClasses(caseId?: string): Class[] {
  initializeStore();
  return caseId ? store.classes.filter((c) => c.case_id === caseId) : store.classes;
}

export function getStudents(caseCode?: string) {
  initializeStore();
  let students = store.students;
  if (caseCode) {
    const c = store.cases.find((x) => x.case_code === caseCode);
    if (c) {
      students = students.filter((s) => s.case_id === c.id);
    }
  }

  return students.map((s) => {
    const c = store.cases.find((x) => x.id === s.case_id);
    const cls = store.classes.find((x) => x.id === s.class_id);
    const opt = store.subjects.find((x) => x.id === s.optional_subject_id);
    const result = store.results.find((r) => r.student_id === s.id);
    const studentKey = `${c?.case_code}_${s.student_code}`;
    const calculated = store.calculatedStudentsMap.get(studentKey);
    const issues = store.checkingItems.filter((i) => i.student_id === s.id && !i.resolved);

    return {
      ...s,
      case_code: c?.case_code || '',
      class_name: cls?.name || '',
      optional_subject_code: opt?.code || '',
      optional_subject_name: opt?.name || '',
      gpa: result?.gpa ?? 0,
      letter_grade: result?.letter_grade ?? 'F',
      passed: result?.passed ?? false,
      result_status: result?.result_status ?? 'DRAFT',
      total_marks: result?.total_marks ?? 0,
      verification_token: result?.verification_token ?? null,
      issues_count: issues.length,
      has_issues: issues.length > 0,
      calculated,
    };
  });
}

export function getStudentWithDetails(caseCode: string, studentCode: string) {
  initializeStore();
  const normalizedCase = (caseCode || '').toUpperCase();
  const normalizedStudent = (studentCode || '').toUpperCase();

  const c = store.cases.find((x) => x.case_code.toUpperCase() === normalizedCase);
  if (!c) return null;

  const student = store.students.find(
    (s) => s.case_id === c.id && s.student_code.toUpperCase() === normalizedStudent
  );
  if (!student) return null;

  const cls = store.classes.find((x) => x.id === student.class_id);
  const opt = store.subjects.find((x) => x.id === student.optional_subject_id);
  const result = store.results.find((r) => r.student_id === student.id);
  const subjectRes = store.subjectResults.filter((sr) => sr.result_id === result?.id);
  const marks = store.marks.filter((m) => m.student_id === student.id);
  const issues = store.checkingItems.filter((i) => i.student_id === student.id);
  const studentKey = `${c.case_code}_${student.student_code}`;
  const calculated = store.calculatedStudentsMap.get(studentKey);

  const enrichedSubjects = subjectRes.map((sr) => {
    const subj = store.subjects.find((s) => s.id === sr.subject_id);
    const mark = marks.find((m) => m.subject_id === sr.subject_id);
    return {
      ...sr,
      subject_code: subj?.code || '',
      subject_name: subj?.name || '',
      has_practical: subj?.has_practical || false,
      theory_marks: mark?.theory_marks ?? null,
      practical_marks: mark?.practical_marks ?? null,
      is_absent: mark?.is_absent ?? false,
      theory_max: subj?.theory_max || 100,
      practical_max: subj?.practical_max || 0,
      max_marks: subj?.max_marks || 100,
    };
  });

  return {
    student: {
      ...student,
      case_code: caseCode,
      class_name: cls?.name || '',
      optional_subject_code: opt?.code || '',
      optional_subject_name: opt?.name || '',
    },
    result,
    calculated,
    subjects: enrichedSubjects,
    checkingItems: issues,
  };
}

export function getDashboardMetrics(caseCode?: string): DashboardMetrics {
  initializeStore();
  let students = store.students;
  let results = store.results;
  let checkingItems = store.checkingItems;

  if (caseCode) {
    const c = store.cases.find((x) => x.case_code === caseCode);
    if (c) {
      students = students.filter((s) => s.case_id === c.id);
      results = results.filter((r) => r.case_id === c.id);
      const studentIds = new Set(students.map((s) => s.id));
      checkingItems = checkingItems.filter((i) => studentIds.has(i.student_id));
    }
  }

  const totalStudents = students.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const sumGpa = results.reduce((sum, r) => sum + Number(r.gpa), 0);
  const averageGpa = totalStudents > 0 ? Number((sumGpa / totalStudents).toFixed(2)) : 0;

  // Count absent students
  const absentStudentIds = new Set(
    store.marks.filter((m) => m.is_absent).map((m) => m.student_id)
  );
  const absentCount = students.filter((s) => absentStudentIds.has(s.id)).length;

  const pendingChecks = checkingItems.filter((i) => !i.resolved).length;
  const published = results.filter((r) => r.result_status === 'PUBLISHED').length;
  const draft = results.filter((r) => r.result_status === 'DRAFT').length;
  const calculated = results.filter((r) => r.result_status === 'CALCULATED').length;

  return {
    totalStudents,
    passed,
    failed,
    averageGpa,
    absent: absentCount,
    pendingChecks,
    published,
    draft,
    calculated,
  };
}

export function getCheckingItems(filters?: {
  type?: string;
  severity?: string;
  resolved?: boolean;
  caseCode?: string;
}) {
  initializeStore();
  let items = store.checkingItems;

  if (filters?.type && filters.type !== 'ALL') {
    items = items.filter((i) => i.type === filters.type);
  }
  if (filters?.severity && filters.severity !== 'ALL') {
    items = items.filter((i) => i.severity === filters.severity);
  }
  if (filters?.resolved !== undefined) {
    items = items.filter((i) => i.resolved === filters.resolved);
  }

  return items.map((item) => {
    const student = store.students.find((s) => s.id === item.student_id);
    const c = student ? store.cases.find((x) => x.id === student.case_id) : null;
    const cls = student ? store.classes.find((x) => x.id === student.class_id) : null;
    const subj = item.subject_id ? store.subjects.find((s) => s.id === item.subject_id) : null;

    return {
      ...item,
      student_code: student?.student_code || '',
      student_name: student?.name || '',
      class_name: cls?.name || '',
      case_code: c?.case_code || '',
      subject_code: subj?.code || null,
      subject_name: subj?.name || null,
    };
  });
}

export function updateCheckingItemStatus(
  itemId: string,
  status: 'OPEN' | 'REVIEWED' | 'RESOLVED',
  resolvedBy = 'Admin User',
  notes?: string
) {
  initializeStore();
  const item = store.checkingItems.find((i) => i.id === itemId);
  if (!item) return { success: false, error: 'Checking item not found' };

  const oldStatus = item.status || (item.resolved ? 'RESOLVED' : 'OPEN');
  item.status = status;
  item.resolved = status === 'RESOLVED';
  item.resolved_by = status !== 'OPEN' ? resolvedBy : null;
  item.resolved_at = status !== 'OPEN' ? new Date().toISOString() : null;
  if (notes !== undefined) item.resolution_notes = notes;

  // Audit log
  store.auditLogs.push({
    id: uuidv4(),
    user_id: resolvedBy,
    action: `CHECKING_ITEM_${status}`,
    entity_type: 'CHECKING_ITEM',
    entity_id: itemId,
    old_value: { status: oldStatus, resolved: item.resolved },
    new_value: { status, resolved: item.resolved, item_title: item.title, severity: item.severity, notes },
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString(),
  });

  return { success: true, item };
}

export function resolveCheckingItem(itemId: string, resolvedBy = 'Admin User', notes?: string) {
  return updateCheckingItemStatus(itemId, 'RESOLVED', resolvedBy, notes);
}

export function updateMark(params: {
  caseCode: string;
  studentCode: string;
  subjectCode: string;
  theoryMarks?: number | null;
  practicalMarks?: number | null;
  isAbsent?: boolean;
  reason: string;
  updatedBy?: string;
}) {
  initializeStore();
  const c = store.cases.find((x) => x.case_code === params.caseCode);
  if (!c) return { success: false, error: 'Case not found' };

  const student = store.students.find(
    (s) => s.case_id === c.id && s.student_code === params.studentCode
  );
  if (!student) return { success: false, error: 'Student not found' };

  const subj = store.subjects.find(
    (s) => s.case_id === c.id && s.code === params.subjectCode
  );
  if (!subj) return { success: false, error: 'Subject not found' };

  const mark = store.marks.find(
    (m) => m.student_id === student.id && m.subject_id === subj.id
  );
  if (!mark) return { success: false, error: 'Mark record not found' };

  const oldResult = store.results.find((r) => r.student_id === student.id);
  const oldMarkValues = {
    theory_marks: mark.theory_marks,
    practical_marks: mark.practical_marks,
    is_absent: mark.is_absent,
    gpa: oldResult?.gpa,
    letter_grade: oldResult?.letter_grade,
    passed: oldResult?.passed,
  };

  // Update mark values
  if (params.isAbsent !== undefined) mark.is_absent = params.isAbsent;
  if (params.theoryMarks !== undefined) mark.theory_marks = params.theoryMarks;
  if (params.practicalMarks !== undefined) mark.practical_marks = params.practicalMarks;
  mark.updated_at = new Date().toISOString();

  // RECALCULATE STUDENT RESULT IMMEDIATELY
  const studentMarks = store.marks.filter((m) => m.student_id === student.id);
  const cls = store.classes.find((x) => x.id === student.class_id);
  const rules = store.rulesMap.get(params.caseCode) || DEFAULT_GRADING_RULES;

  const markInputs: MarkInput[] = studentMarks.map((m) => {
    const s = store.subjects.find((x) => x.id === m.subject_id)!;
    const isCompulsory = s.is_compulsory;
    const isOptional = student.optional_subject_id === s.id;

    let rawVal: any = m.raw_value;
    if (m.is_absent) rawVal = 'AB';
    else if (s.has_practical) rawVal = { theory: m.theory_marks || 0, practical: m.practical_marks || 0 };
    else rawVal = m.theory_marks ?? 0;

    return normalizeRawMark(
      rawVal,
      s.code,
      s.name,
      s.has_practical,
      isCompulsory,
      isOptional,
      s.theory_max || 100,
      s.practical_max || 0,
      s.max_marks
    );
  });

  const updatedResult = calculateStudentResult(
    student.student_code,
    student.name,
    cls?.name || 'Class',
    markInputs,
    rules
  );

  const studentKey = `${params.caseCode}_${params.studentCode}`;
  store.calculatedStudentsMap.set(studentKey, updatedResult);

  // Update Result record
  if (oldResult) {
    oldResult.gpa = updatedResult.gpa;
    oldResult.letter_grade = updatedResult.letterGrade;
    oldResult.total_marks = updatedResult.totalMarks;
    oldResult.passed = updatedResult.passed;
    oldResult.calculated_at = new Date().toISOString();
    oldResult.updated_at = new Date().toISOString();
  }

  // Update SubjectResult records
  for (const sr of updatedResult.subjectResults) {
    const s = store.subjects.find((x) => x.case_id === c.id && x.code === sr.subjectCode);
    if (!s) continue;
    const existingSR = store.subjectResults.find(
      (x) => x.result_id === oldResult?.id && x.subject_id === s.id
    );
    if (existingSR) {
      existingSR.total_marks = sr.totalMarks;
      existingSR.grade_point = sr.gradePoint;
      existingSR.letter_grade = sr.letterGrade;
      existingSR.passed = sr.passed;
      existingSR.failure_reason = sr.failureReason;
      existingSR.calculation_details = {
        raw_input: sr.trace.input.rawValue as any,
        normalized_input: {
          theory_marks: sr.trace.input.theoryMarks,
          practical_marks: sr.trace.input.practicalMarks,
          total: sr.trace.input.totalMarks,
          is_absent: sr.trace.input.isAbsent,
        },
        theory_mark: sr.trace.input.theoryMarks,
        practical_mark: sr.trace.input.practicalMarks,
        total: sr.trace.input.totalMarks,
        rule_id: sr.trace.grading.ruleId,
        rule_description: sr.trace.grading.ruleDescription,
        intermediate_calculations: {},
        decision_outcome: sr.trace.decision.outcome,
        failure_reason: sr.failureReason,
      };
    }
  }

  // Regenerate checking items for this student
  store.checkingItems = store.checkingItems.filter((i) => i.student_id !== student.id);
  for (const item of updatedResult.checkingItems) {
    const s = item.subjectCode
      ? store.subjects.find((x) => x.case_id === c.id && x.code === item.subjectCode)
      : null;
    store.checkingItems.push({
      id: uuidv4(),
      student_id: student.id,
      result_id: oldResult?.id || '',
      type: item.type as any,
      severity: item.severity as any,
      subject_id: s ? s.id : null,
      title: item.title,
      description: item.description,
      metadata: item.metadata,
      status: 'OPEN',
      resolved: false,
      resolved_by: null,
      resolved_at: null,
      resolution_notes: null,
      created_at: new Date().toISOString(),
    });
  }

  // Audit Log Entry
  store.auditLogs.push({
    id: uuidv4(),
    user_id: params.updatedBy || 'Teacher/Admin',
    action: 'MARK_CORRECTION_AND_RECALCULATION',
    entity_type: 'STUDENT_MARK',
    entity_id: `${params.caseCode}_${params.studentCode}_${params.subjectCode}`,
    old_value: oldMarkValues,
    new_value: {
      theory_marks: mark.theory_marks,
      practical_marks: mark.practical_marks,
      is_absent: mark.is_absent,
      reason: params.reason,
      new_gpa: updatedResult.gpa,
      new_letter_grade: updatedResult.letterGrade,
      new_passed: updatedResult.passed,
    },
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString(),
  });

  return {
    success: true,
    updatedResult,
    oldGpa: oldMarkValues.gpa,
    newGpa: updatedResult.gpa,
    oldGrade: oldMarkValues.letter_grade,
    newGrade: updatedResult.letterGrade,
  };
}

export function updatePublishStatus(params: {
  caseCode?: string;
  studentCode?: string;
  status: ResultStatus;
  user?: string;
}) {
  initializeStore();
  let affectedResults = store.results;

  if (params.caseCode) {
    const c = store.cases.find((x) => x.case_code === params.caseCode);
    if (c) {
      affectedResults = affectedResults.filter((r) => r.case_id === c.id);
      c.status = params.status as any;
    }
  }

  if (params.studentCode && params.caseCode) {
    const c = store.cases.find((x) => x.case_code === params.caseCode);
    const student = store.students.find(
      (s) => s.case_id === c?.id && s.student_code === params.studentCode
    );
    if (student) {
      affectedResults = affectedResults.filter((r) => r.student_id === student.id);
    }
  }

  for (const r of affectedResults) {
    r.result_status = params.status;
    if (params.status === 'PUBLISHED') {
      r.published_at = new Date().toISOString();
    }
    r.updated_at = new Date().toISOString();
  }

  store.auditLogs.push({
    id: uuidv4(),
    user_id: params.user || 'Admin',
    action: `STATUS_CHANGED_TO_${params.status}`,
    entity_type: 'RESULTS_BATCH',
    entity_id: params.caseCode || 'ALL',
    old_value: null,
    new_value: { status: params.status, count: affectedResults.length },
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString(),
  });

  return { success: true, count: affectedResults.length };
}

export function verifyResultByToken(token: string) {
  initializeStore();
  const result = store.results.find((r) => r.verification_token === token);
  if (!result) return null;

  const student = store.students.find((s) => s.id === result.student_id);
  if (!student) return null;

  const c = store.cases.find((x) => x.id === student.case_id);
  const cls = store.classes.find((x) => x.id === student.class_id);

  return {
    verified: result.result_status === 'PUBLISHED',
    token: result.verification_token,
    student_code: student.student_code,
    student_name: student.name,
    class_name: cls?.name || '',
    case_code: c?.case_code || '',
    gpa: result.gpa,
    letter_grade: result.letter_grade,
    passed: result.passed,
    published_at: result.published_at,
    calculation_version: result.calculation_version,
  };
}

export function getAuditLogs(): AuditLog[] {
  initializeStore();
  return [...store.auditLogs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getGradingRules(caseCode?: string): GradingRule[] {
  initializeStore();
  if (caseCode) {
    const c = store.cases.find((x) => x.case_code === caseCode);
    return store.gradingRules.filter((r) => r.case_id === c?.id);
  }
  return store.gradingRules;
}

export function updateGradingRule(params: {
  ruleId: string;
  theoryPassMark?: number;
  practicalPassMark?: number;
  totalPassMark?: number;
  user?: string;
}) {
  initializeStore();
  const rule = store.gradingRules.find((r) => r.id === params.ruleId);
  if (!rule) return { success: false, error: 'Rule not found' };

  const oldConfig = { ...rule.configuration };
  if (params.theoryPassMark !== undefined) rule.configuration.theory_pass_mark = params.theoryPassMark;
  if (params.practicalPassMark !== undefined) rule.configuration.practical_pass_mark = params.practicalPassMark;
  if (params.totalPassMark !== undefined) rule.configuration.total_pass_mark = params.totalPassMark;
  rule.updated_at = new Date().toISOString();

  // Audit log
  store.auditLogs.push({
    id: uuidv4(),
    user_id: params.user || 'Admin',
    action: 'GRADING_RULE_UPDATED',
    entity_type: 'GRADING_RULE',
    entity_id: params.ruleId,
    old_value: oldConfig,
    new_value: rule.configuration,
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString(),
  });

  return { success: true, rule };
}

export function getRawDataset(): any {
  return rawDataset;
}
