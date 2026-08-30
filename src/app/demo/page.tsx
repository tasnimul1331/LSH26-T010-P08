'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Eye,
  Edit3,
  QrCode,
  FileText,
  TrendingUp,
  ShieldCheck,
  GraduationCap,
  Scale,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStudentWithDetails, getDashboardMetrics } from '@/lib/data-service';

export default function JudgeDemoPage() {
  const [demoStep, setDemoStep] = useState<number>(1);

  // Load real examples from P08 dataset
  const strongStudent = getStudentWithDetails('PUB-01', 'S001'); // Kamal Begum (Passed, GPA 4.58)
  const failingStudent = getStudentWithDetails('PUB-01', 'S002'); // Lamia Islam (Low marks, Failed)
  const absentStudent = getStudentWithDetails('PUB-01', 'S032'); // Hasib Khatun (BIO = AB)
  const metrics = getDashboardMetrics('PUB-01');

  const demoSteps = [
    {
      id: 1,
      title: 'Platform Vision & Live Metrics',
      tag: 'Step 1/6 — Architecture',
      description: 'BottleResult transforms unstructured marks into explainable, deterministic results.',
    },
    {
      id: 2,
      title: 'Strong Candidate Analysis (S001 — Kamal Begum)',
      tag: 'Step 2/6 — High Performer',
      description: 'Inspect full 7-subject breakdown, practical marks, and 4th subject formula contribution.',
    },
    {
      id: 3,
      title: 'Compulsory Failure Consequence (S002)',
      tag: 'Step 3/6 — Failure Trace',
      description: 'Observe how a failing compulsory mark halts overall result while preserving full explainability.',
    },
    {
      id: 4,
      title: 'Absence Handling (S032 — Hasib Khatun)',
      tag: 'Step 4/6 — Absence Flagging',
      description: 'Demonstrating how "AB" marks are normalized into flags rather than numeric zeros.',
    },
    {
      id: 5,
      title: 'Checking Center & Scrutiny Workflow',
      tag: 'Step 5/6 — Scrutiny',
      description: 'Automated detection of practical failures, absences, and low GP issues.',
    },
    {
      id: 6,
      title: 'Public Verification & Official PDF Transcript',
      tag: 'Step 6/6 — Verification',
      description: 'Public lookup with cryptographic verification token and downloadable PDF transcripts.',
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-bg-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Judge & Evaluator Interactive Tour</h1>
              <p className="text-xs text-muted-foreground">
                Live curated demonstration through real P08 dataset cohort records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm" className="text-xs">
                Exit to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Step Indicator Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {demoSteps.map((s) => (
            <button
              key={s.id}
              onClick={() => setDemoStep(s.id)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                demoStep === s.id
                  ? 'border-accent bg-accent/10 text-accent font-bold shadow-sm'
                  : demoStep > s.id
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-medium'
                  : 'border-border/50 text-muted-foreground hover:bg-muted/30'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider">{s.tag}</div>
              <div className="text-xs truncate font-medium mt-0.5">{s.title.split('(')[0]}</div>
            </button>
          ))}
        </div>

        {/* STEP CONTENT CONTAINER */}
        <AnimatePresence mode="wait">
          {/* STEP 1: DASHBOARD METRICS */}
          {demoStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Core Differentiator: Deterministic Calculation</CardTitle>
                  <CardDescription>
                    All 1,765 candidates across 25 cohorts are processed purely from official Bangladesh SSC rules. No AI is used for grading or marks.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-card border border-border/50 text-center">
                      <span className="text-xs text-muted-foreground">Total Cohort Size</span>
                      <div className="text-3xl font-bold text-foreground mt-1">1,765</div>
                      <Badge variant="secondary" className="mt-2 text-[10px]">25 Cases</Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border/50 text-center">
                      <span className="text-xs text-muted-foreground">PUB-01 Candidates</span>
                      <div className="text-3xl font-bold text-blue-400 mt-1">{metrics.totalStudents}</div>
                      <Badge variant="secondary" className="mt-2 text-[10px]">Class 9 & 10</Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border/50 text-center">
                      <span className="text-xs text-muted-foreground">PUB-01 Passed</span>
                      <div className="text-3xl font-bold text-emerald-400 mt-1">{metrics.passed}</div>
                      <Badge variant="secondary" className="mt-2 text-[10px] bg-emerald-500/10 text-emerald-400">
                        {((metrics.passed / metrics.totalStudents) * 100).toFixed(1)}% Pass Rate
                      </Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border/50 text-center">
                      <span className="text-xs text-muted-foreground">Mean GPA</span>
                      <div className="text-3xl font-bold text-accent mt-1">{metrics.averageGpa.toFixed(2)}</div>
                      <Badge variant="secondary" className="mt-2 text-[10px]">Out of 5.00</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: STRONG STUDENT S001 */}
          {demoStep === 2 && strongStudent && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Card className="border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {strongStudent.student.name} ({strongStudent.student.student_code})
                      </CardTitle>
                      <CardDescription>
                        Case PUB-01 • {strongStudent.student.class_name} • 4th Subject: {strongStudent.student.optional_subject_name}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono text-emerald-400">
                        GPA {strongStudent.calculated?.gpa.toFixed(2)}
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Grade {strongStudent.calculated?.letterGrade} (PASSED)
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Trace Summary Box */}
                  <div className="p-4 rounded-lg bg-card/80 border border-border/60 font-mono text-xs space-y-2">
                    <p className="text-muted-foreground font-sans font-bold text-[11px] uppercase">
                      Formula Breakdown:
                    </p>
                    <p>
                      1. Compulsory GP Sum = 4.00 (BAN) + 3.50 (ENG) + 5.00 (MAT) + 4.00 (PHY) + 4.00 (CHE) + 5.00 (BIO) ={' '}
                      <strong className="text-foreground">{strongStudent.calculated?.compulsoryGradePointSum.toFixed(2)}</strong>
                    </p>
                    <p>
                      2. Optional GP = 4.00 (AGR) → Contribution = max(0, 4.00 - 2.00) ={' '}
                      <strong className="text-accent">+{strongStudent.calculated?.optionalContribution.toFixed(2)}</strong>
                    </p>
                    <p>
                      3. Composite GPA = ({strongStudent.calculated?.compulsoryGradePointSum.toFixed(2)} +{' '}
                      {strongStudent.calculated?.optionalContribution.toFixed(2)}) / 6 ={' '}
                      <strong className="text-emerald-400 text-sm">
                        {strongStudent.calculated?.gpa.toFixed(2)} ({strongStudent.calculated?.letterGrade})
                      </strong>
                    </p>
                  </div>

                  {/* Subject table */}
                  <div className="border border-border/50 rounded-lg overflow-hidden text-xs">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-2 text-left">Subject</th>
                          <th className="p-2 text-right">Theory</th>
                          <th className="p-2 text-right">Practical</th>
                          <th className="p-2 text-right font-bold">Total</th>
                          <th className="p-2 text-center">GP</th>
                          <th className="p-2 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {strongStudent.subjects.map((subj: any) => (
                          <tr key={subj.subject_code} className="border-b border-border/30">
                            <td className="p-2 font-medium">{subj.subject_name} ({subj.subject_code})</td>
                            <td className="p-2 text-right font-mono">{subj.theory_marks ?? '—'}</td>
                            <td className="p-2 text-right font-mono">{subj.practical_marks ?? '—'}</td>
                            <td className="p-2 text-right font-mono font-bold">{subj.total_marks}</td>
                            <td className="p-2 text-center font-mono font-bold text-accent">{subj.grade_point.toFixed(2)}</td>
                            <td className="p-2 text-center font-bold text-emerald-400">{subj.letter_grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: COMPULSORY FAILURE S002 */}
          {demoStep === 3 && failingStudent && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Card className="border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-rose-400">
                        {failingStudent.student.name} ({failingStudent.student.student_code})
                      </CardTitle>
                      <CardDescription>
                        Case PUB-01 • Demonstrates Compulsory Failure Consequence
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono text-rose-400">
                        GPA {failingStudent.calculated?.gpa.toFixed(2)}
                      </div>
                      <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                        Grade {failingStudent.calculated?.letterGrade} (FAILED)
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      Deterministic Consequence Trace:
                    </p>
                    <p>
                      Candidate obtained marks below the pass threshold in compulsory subjects. By official Bangladesh SSC rules, a failure in any compulsory subject overrides all other marks, yielding a final GPA of 0.00 (Grade F).
                    </p>
                  </div>

                  <div className="border border-border/50 rounded-lg overflow-hidden text-xs">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-2 text-left">Subject</th>
                          <th className="p-2 text-right">Theory</th>
                          <th className="p-2 text-right">Practical</th>
                          <th className="p-2 text-right font-bold">Total</th>
                          <th className="p-2 text-center">GP</th>
                          <th className="p-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {failingStudent.subjects.map((subj: any) => (
                          <tr key={subj.subject_code} className="border-b border-border/30">
                            <td className="p-2 font-medium">{subj.subject_name}</td>
                            <td className="p-2 text-right font-mono">{subj.theory_marks ?? '—'}</td>
                            <td className="p-2 text-right font-mono">{subj.practical_marks ?? '—'}</td>
                            <td className="p-2 text-right font-mono font-bold">{subj.total_marks}</td>
                            <td className="p-2 text-center font-mono">{subj.grade_point.toFixed(2)}</td>
                            <td className="p-2 text-center font-bold">
                              <span className={subj.passed ? 'text-emerald-400' : 'text-rose-400'}>
                                {subj.passed ? 'Passed' : 'Failed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 4: ABSENCE CASE S032 */}
          {demoStep === 4 && absentStudent && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Card className="border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {absentStudent.student.name} ({absentStudent.student.student_code})
                      </CardTitle>
                      <CardDescription>
                        Case PUB-01 • Demonstrates "AB" Normalized State Handling
                      </CardDescription>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      Absent in Biology (BIO)
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                    <strong>Rule Principle:</strong> Absence is normalized into a distinct state flag rather than converted into numeric zeros. Because Biology is a compulsory subject, candidate absence causes the overall result to fail.
                  </div>

                  <div className="border border-border/50 rounded-lg overflow-hidden text-xs">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-2 text-left">Subject</th>
                          <th className="p-2 text-right">Theory</th>
                          <th className="p-2 text-right">Practical</th>
                          <th className="p-2 text-right font-bold">Total</th>
                          <th className="p-2 text-center">GP</th>
                          <th className="p-2 text-center">State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {absentStudent.subjects.map((subj: any) => (
                          <tr key={subj.subject_code} className="border-b border-border/30">
                            <td className="p-2 font-medium">{subj.subject_name} ({subj.subject_code})</td>
                            <td className="p-2 text-right font-mono">{subj.is_absent ? 'AB' : subj.theory_marks ?? '—'}</td>
                            <td className="p-2 text-right font-mono">{subj.is_absent ? 'AB' : subj.practical_marks ?? '—'}</td>
                            <td className="p-2 text-right font-mono font-bold">{subj.is_absent ? 'AB' : subj.total_marks}</td>
                            <td className="p-2 text-center font-mono">{subj.grade_point.toFixed(2)}</td>
                            <td className="p-2 text-center font-bold">
                              {subj.is_absent ? (
                                <Badge variant="outline" className="border-rose-500 text-rose-400 text-[10px]">
                                  ABSENT (AB)
                                </Badge>
                              ) : (
                                <span className="text-emerald-400">Present</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 5: CHECKING CENTER */}
          {demoStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Checking Center & Scrutiny Workflow</CardTitle>
                  <CardDescription>
                    Automated categorization into Compulsory Failures, Practical Failures, Absences, and Optional Low GP.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs">
                      <span className="font-bold text-rose-400">CRITICAL ISSUES</span>
                      <p className="text-muted-foreground mt-1">Blocks publication unless explicitly confirmed.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
                      <span className="font-bold text-amber-400">HIGH PRIORITY</span>
                      <p className="text-muted-foreground mt-1">Practical component threshold discrepancies.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs">
                      <span className="font-bold text-blue-400">WARNINGS</span>
                      <p className="text-muted-foreground mt-1">Optional subject GP below 2.00 (no contribution).</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link href="/admin/checking">
                      <Button size="sm" className="gradient-bg-accent border-0 text-white gap-2">
                        Open Full Checking Center
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 6: VERIFICATION & PDF */}
          {demoStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Public Verification & Official Transcript</CardTitle>
                  <CardDescription>
                    Explore the public student result lookup and digital QR verification.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-card/60 border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Try Sample Student Public Result Page</p>
                        <p className="text-xs text-muted-foreground">
                          Kamal Begum (S001) • Case PUB-01 • GPA 4.58 (A)
                        </p>
                      </div>
                    </div>

                    <Link href="/results/PUB-01/S001">
                      <Button className="gradient-bg-accent border-0 text-white gap-2">
                        <Eye className="w-4 h-4" />
                        View Live Public Result
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Next/Prev Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            disabled={demoStep === 1}
            onClick={() => setDemoStep((prev) => Math.max(1, prev - 1))}
            className="gap-1 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous Step
          </Button>

          <span className="text-xs text-muted-foreground font-mono">
            {demoStep} of {demoSteps.length}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={demoStep === demoSteps.length}
            onClick={() => setDemoStep((prev) => Math.min(demoSteps.length, prev + 1))}
            className="gap-1 text-xs"
          >
            Next Step
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
