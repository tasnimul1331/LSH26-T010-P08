// BottleResult — Live Analytics Service
// Computes all statistics and charts dynamically from live calculated student results

import { getStudents, getCases, getCheckingItems } from './data-service';

export interface AnalyticsData {
  summary: {
    totalStudents: number;
    passed: number;
    failed: number;
    passRate: number;
    averageGpa: number;
    totalAbsences: number;
    criticalIssues: number;
    totalCheckingItems: number;
  };
  passFailData: { name: string; value: number; color: string }[];
  gpaDistribution: { range: string; count: number; percentage: number }[];
  gradeDistribution: { grade: string; count: number; fill: string }[];
  classComparison: {
    className: string;
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    averageGpa: number;
  }[];
  subjectPerformance: {
    subjectCode: string;
    subjectName: string;
    averageMarks: number;
    passRate: number;
    totalStudents: number;
    aPlusCount: number;
    failCount: number;
    hasPractical: boolean;
  }[];
  optionalDistribution: {
    code: string;
    name: string;
    studentCount: number;
    averageGpa: number;
    contributingCount: number;
  }[];
  practicalVsTheory: {
    subjectCode: string;
    subjectName: string;
    avgTheoryPercentage: number;
    avgPracticalPercentage: number;
  }[];
  absenceBySubject: {
    subjectCode: string;
    subjectName: string;
    absentCount: number;
  }[];
  issuesByType: { type: string; count: number; color: string }[];
  issuesBySeverity: { severity: string; count: number; color: string }[];
  insights: {
    title: string;
    description: string;
    type: 'positive' | 'warning' | 'info';
  }[];
}

export function getAnalyticsData(caseCode?: string): AnalyticsData {
  const students = getStudents(caseCode);
  const checkingItems = getCheckingItems(caseCode ? { caseCode } : undefined);

  const totalStudents = students.length;
  const passed = students.filter((s) => s.passed).length;
  const failed = totalStudents - passed;
  const passRate = totalStudents > 0 ? Number(((passed / totalStudents) * 100).toFixed(1)) : 0;
  const sumGpa = students.reduce((acc, s) => acc + s.gpa, 0);
  const averageGpa = totalStudents > 0 ? Number((sumGpa / totalStudents).toFixed(2)) : 0;

  // 1. Pass/Fail Distribution
  const passFailData = [
    { name: 'Passed', value: passed, color: '#10b981' },
    { name: 'Failed', value: failed, color: '#f43f5e' },
  ];

  // 2. Grade Distribution
  const gradeCounts: Record<string, number> = {
    'A+': 0,
    A: 0,
    'A-': 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };
  students.forEach((s) => {
    const g = s.letter_grade || 'F';
    gradeCounts[g] = (gradeCounts[g] || 0) + 1;
  });

  const gradeColors: Record<string, string> = {
    'A+': '#10b981',
    A: '#06b6d4',
    'A-': '#3b82f6',
    B: '#6366f1',
    C: '#eab308',
    D: '#f97316',
    F: '#f43f5e',
  };

  const gradeDistribution = Object.entries(gradeCounts).map(([grade, count]) => ({
    grade,
    count,
    fill: gradeColors[grade] || '#64748b',
  }));

  // 3. GPA Distribution
  const gpaRanges = [
    { range: '5.00 (A+)', min: 5.0, max: 5.0 },
    { range: '4.00 - 4.99', min: 4.0, max: 4.999 },
    { range: '3.50 - 3.99', min: 3.5, max: 3.999 },
    { range: '3.00 - 3.49', min: 3.0, max: 3.499 },
    { range: '2.00 - 2.99', min: 2.0, max: 2.999 },
    { range: '1.00 - 1.99', min: 1.0, max: 1.999 },
    { range: '0.00 (Fail)', min: 0.0, max: 0.001 },
  ];

  const gpaDistribution = gpaRanges.map((r) => {
    const count = students.filter((s) => s.gpa >= r.min && s.gpa <= r.max).length;
    return {
      range: r.range,
      count,
      percentage: totalStudents > 0 ? Number(((count / totalStudents) * 100).toFixed(1)) : 0,
    };
  });

  // 4. Class Comparison
  const classMap = new Map<string, typeof students>();
  students.forEach((s) => {
    const cls = s.class_name || 'General';
    if (!classMap.has(cls)) classMap.set(cls, []);
    classMap.get(cls)!.push(s);
  });

  const classComparison = Array.from(classMap.entries()).map(([className, clsStudents]) => {
    const total = clsStudents.length;
    const clsPassed = clsStudents.filter((s) => s.passed).length;
    const clsFailed = total - clsPassed;
    const clsPassRate = total > 0 ? Number(((clsPassed / total) * 100).toFixed(1)) : 0;
    const clsSumGpa = clsStudents.reduce((acc, s) => acc + s.gpa, 0);
    const clsAvgGpa = total > 0 ? Number((clsSumGpa / total).toFixed(2)) : 0;

    return {
      className,
      total,
      passed: clsPassed,
      failed: clsFailed,
      passRate: clsPassRate,
      averageGpa: clsAvgGpa,
    };
  });

  // 5. Subject Performance
  const subjectMap = new Map<
    string,
    {
      code: string;
      name: string;
      totalMarks: number;
      passCount: number;
      failCount: number;
      aPlusCount: number;
      totalEnrolled: number;
      hasPractical: boolean;
      totalTheory: number;
      theoryCount: number;
      totalPractical: number;
      practicalCount: number;
      absentCount: number;
    }
  >();

  students.forEach((s) => {
    if (!s.calculated?.subjectResults) return;
    s.calculated.subjectResults.forEach((sr) => {
      if (!subjectMap.has(sr.subjectCode)) {
        subjectMap.set(sr.subjectCode, {
          code: sr.subjectCode,
          name: sr.subjectName,
          totalMarks: 0,
          passCount: 0,
          failCount: 0,
          aPlusCount: 0,
          totalEnrolled: 0,
          hasPractical: sr.hasPractical,
          totalTheory: 0,
          theoryCount: 0,
          totalPractical: 0,
          practicalCount: 0,
          absentCount: 0,
        });
      }
      const data = subjectMap.get(sr.subjectCode)!;
      data.totalEnrolled += 1;
      if (sr.isAbsent) {
        data.absentCount += 1;
        data.failCount += 1;
      } else {
        data.totalMarks += sr.totalMarks;
        if (sr.passed) data.passCount += 1;
        else data.failCount += 1;
        if (sr.gradePoint === 5.0) data.aPlusCount += 1;

        if (sr.hasPractical && sr.theoryMarks !== null && sr.practicalMarks !== null) {
          data.totalTheory += (sr.theoryMarks / 75) * 100;
          data.theoryCount += 1;
          data.totalPractical += (sr.practicalMarks / 25) * 100;
          data.practicalCount += 1;
        }
      }
    });
  });

  const subjectPerformance = Array.from(subjectMap.values()).map((s) => ({
    subjectCode: s.code,
    subjectName: s.name,
    averageMarks: s.totalEnrolled > 0 ? Number((s.totalMarks / s.totalEnrolled).toFixed(1)) : 0,
    passRate:
      s.totalEnrolled > 0 ? Number(((s.passCount / s.totalEnrolled) * 100).toFixed(1)) : 0,
    totalStudents: s.totalEnrolled,
    aPlusCount: s.aPlusCount,
    failCount: s.failCount,
    hasPractical: s.hasPractical,
  }));

  // 6. Optional Subject Distribution
  const optMap = new Map<string, { code: string; name: string; count: number; sumGpa: number; contrib: number }>();
  students.forEach((s) => {
    if (!s.optional_subject_code) return;
    const code = s.optional_subject_code;
    const name = s.optional_subject_name || code;
    if (!optMap.has(code)) {
      optMap.set(code, { code, name, count: 0, sumGpa: 0, contrib: 0 });
    }
    const d = optMap.get(code)!;
    d.count += 1;
    d.sumGpa += s.gpa;
    if (s.calculated?.optionalContribution && s.calculated.optionalContribution > 0) {
      d.contrib += 1;
    }
  });

  const optionalDistribution = Array.from(optMap.values()).map((o) => ({
    code: o.code,
    name: o.name,
    studentCount: o.count,
    averageGpa: o.count > 0 ? Number((o.sumGpa / o.count).toFixed(2)) : 0,
    contributingCount: o.contrib,
  }));

  // 7. Practical vs Theory Performance
  const practicalVsTheory = Array.from(subjectMap.values())
    .filter((s) => s.hasPractical && s.theoryCount > 0)
    .map((s) => ({
      subjectCode: s.code,
      subjectName: s.name,
      avgTheoryPercentage: Number((s.totalTheory / s.theoryCount).toFixed(1)),
      avgPracticalPercentage: Number((s.totalPractical / s.practicalCount).toFixed(1)),
    }));

  // 8. Absence by Subject
  const absenceBySubject = Array.from(subjectMap.values()).map((s) => ({
    subjectCode: s.code,
    subjectName: s.name,
    absentCount: s.absentCount,
  }));
  const totalAbsences = absenceBySubject.reduce((sum, a) => sum + a.absentCount, 0);

  // 9. Issues by Type & Severity
  const typeCounts: Record<string, number> = {};
  const severityCounts: Record<string, number> = {};

  checkingItems.forEach((i) => {
    typeCounts[i.type] = (typeCounts[i.type] || 0) + 1;
    severityCounts[i.severity] = (severityCounts[i.severity] || 0) + 1;
  });

  const typeColorMap: Record<string, string> = {
    COMPULSORY_FAILURE: '#f43f5e',
    PRACTICAL_FAILURE: '#fb923c',
    ABSENT: '#a855f7',
    OPTIONAL_LOW: '#38bdf8',
    DATA_ERROR: '#ef4444',
  };

  const severityColorMap: Record<string, string> = {
    CRITICAL: '#f43f5e',
    HIGH: '#fb923c',
    MEDIUM: '#facc15',
    WARNING: '#38bdf8',
  };

  const issuesByType = Object.entries(typeCounts).map(([type, count]) => ({
    type: type.replace('_', ' '),
    count,
    color: typeColorMap[type] || '#64748b',
  }));

  const issuesBySeverity = Object.entries(severityCounts).map(([severity, count]) => ({
    severity,
    count,
    color: severityColorMap[severity] || '#64748b',
  }));

  // 10. Dynamic Insights Generation
  const insights: AnalyticsData['insights'] = [];

  // Find lowest pass rate subject
  const sortedSubjects = [...subjectPerformance].sort((a, b) => a.passRate - b.passRate);
  if (sortedSubjects.length > 0) {
    const lowest = sortedSubjects[0];
    insights.push({
      title: `Lowest Pass Rate: ${lowest.subjectName}`,
      description: `${lowest.subjectName} (${lowest.subjectCode}) has the lowest pass rate at ${lowest.passRate}% with ${lowest.failCount} failed student(s).`,
      type: lowest.passRate < 70 ? 'warning' : 'info',
    });
  }

  // Find highest A+ subject
  const topAPlus = [...subjectPerformance].sort((a, b) => b.aPlusCount - a.aPlusCount)[0];
  if (topAPlus && topAPlus.aPlusCount > 0) {
    insights.push({
      title: `Highest A+ Distinction: ${topAPlus.subjectName}`,
      description: `${topAPlus.subjectName} produced the highest number of A+ grades with ${topAPlus.aPlusCount} students achieving Grade Point 5.00.`,
      type: 'positive',
    });
  }

  // Practical performance insight
  if (practicalVsTheory.length > 0) {
    const avgPract = practicalVsTheory.reduce((acc, p) => acc + p.avgPracticalPercentage, 0) / practicalVsTheory.length;
    const avgTheory = practicalVsTheory.reduce((acc, p) => acc + p.avgTheoryPercentage, 0) / practicalVsTheory.length;
    const diff = Number((avgPract - avgTheory).toFixed(1));
    insights.push({
      title: 'Practical vs Theory Performance Gap',
      description: `Across science subjects, students scored an average of ${avgPract.toFixed(1)}% in practical components compared to ${avgTheory.toFixed(1)}% in theory (${diff > 0 ? '+' : ''}${diff}% difference).`,
      type: 'info',
    });
  }

  // Optional subject impact insight
  const totalOptionalContrib = optionalDistribution.reduce((acc, o) => acc + o.contributingCount, 0);
  const optionalContribRate = totalStudents > 0 ? ((totalOptionalContrib / totalStudents) * 100).toFixed(1) : '0';
  insights.push({
    title: '4th Subject GPA Contribution Rate',
    description: `${optionalContribRate}% of candidates (${totalOptionalContrib}/${totalStudents}) earned GP > 2.00 in their optional subject, boosting their final composite GPA.`,
    type: 'positive',
  });

  return {
    summary: {
      totalStudents,
      passed,
      failed,
      passRate,
      averageGpa,
      totalAbsences,
      criticalIssues: severityCounts['CRITICAL'] || 0,
      totalCheckingItems: checkingItems.length,
    },
    passFailData,
    gpaDistribution,
    gradeDistribution,
    classComparison,
    subjectPerformance,
    optionalDistribution,
    practicalVsTheory,
    absenceBySubject,
    issuesByType,
    issuesBySeverity,
    insights,
  };
}
