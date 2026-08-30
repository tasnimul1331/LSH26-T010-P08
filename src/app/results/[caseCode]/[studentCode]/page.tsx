'use client';

import { use, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  QrCode,
  Printer,
  Download,
  ShieldCheck,
  ChevronDown,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  Info,
  Calendar,
  Layers,
  BarChart3,
  TrendingUp,
  LineChart as LineChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getStudentWithDetails } from '@/lib/data-service';
import { generateVerificationQR } from '@/lib/qr/generateQR';
import { generateStudentResultPDF } from '@/lib/pdf/generateResultPDF';

export default function StudentResultDetailPage({
  params,
}: {
  params: Promise<{ caseCode: string; studentCode: string }>;
}) {
  const resolvedParams = use(params);
  const { caseCode, studentCode } = resolvedParams;

  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const studentDetails = useMemo(
    () => getStudentWithDetails(caseCode, studentCode),
    [caseCode, studentCode]
  );

  const verificationUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const token = studentDetails?.result?.verification_token || 'demo';
    return `${window.location.origin}/verify/${token}`;
  }, [studentDetails]);

  useEffect(() => {
    if (verificationUrl) {
      generateVerificationQR(verificationUrl).then((url) => setQrDataUrl(url));
    }
  }, [verificationUrl]);

  if (!studentDetails || !studentDetails.calculated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-border/60 text-center p-6 space-y-4 luxury-card">
          <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold">Candidate Result Not Found</h2>
          <p className="text-sm text-muted-foreground">
            No published academic result was found for candidate <strong className="text-foreground">{studentCode}</strong> in cohort <strong className="text-foreground">{caseCode}</strong>.
          </p>
          <Link href="/results">
            <Button variant="outline" className="w-full">
              Back to Result Search
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { student, calculated, subjects } = studentDetails;

  // Prepare chart data for performance curves
  const performanceChartData = subjects.map((s: any) => ({
    code: s.subject_code,
    name: s.subject_name,
    marks: s.is_absent ? 0 : s.total_marks,
    theory: s.is_absent ? 0 : (s.theory_marks ?? s.total_marks),
    practical: s.is_absent ? 0 : (s.practical_marks ?? 0),
    gradePoint: s.grade_point,
    letterGrade: s.letter_grade,
    isOptional: !s.is_compulsory,
    passed: s.passed,
    passThreshold: 33,
    distinctionThreshold: 80,
  }));

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    await generateStudentResultPDF(student, calculated, verificationUrl);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation (Hidden on print) */}
      <nav className="no-print border-b border-border/70 glass sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/results" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Search Results</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs border-border/80">
              <Printer className="w-3.5 h-3.5" />
              Print Result
            </Button>
            <Button size="sm" onClick={handleDownloadPDF} className="gradient-bg-accent border-0 text-white gap-1.5 text-xs shadow-md hover:brightness-105 transition-all">
              <Download className="w-3.5 h-3.5" />
              Download Official PDF
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Result Sheet Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Official Header Banner */}
        <div className="border border-border/80 rounded-2xl bg-white p-6 luxury-card shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-bg-accent flex items-center justify-center shrink-0 shadow-sm">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">BottleResult Academic Transcript</h1>
                <p className="text-xs text-muted-foreground">
                  Secondary School Certificate (SSC) Standard Examination Report
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs py-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Verified Official Record
              </Badge>
            </div>
          </div>

          {/* Candidate Credentials Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground font-medium">Candidate Name</span>
              <p className="text-sm font-bold text-foreground mt-0.5">{student.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Student ID / Roll</span>
              <p className="text-sm font-bold font-mono text-foreground mt-0.5">{student.student_code}</p>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Cohort / Class</span>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {student.case_code} • {student.class_name}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">4th Optional Subject</span>
              <p className="text-sm font-bold text-amber-800 mt-0.5">
                {student.optional_subject_name} ({student.optional_subject_code})
              </p>
            </div>
          </div>
        </div>

        {/* Hero GPA & Pass Banner */}
        <div
          className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6 luxury-card shadow-md ${
            calculated.passed
              ? 'bg-emerald-50/50 border-emerald-300'
              : 'bg-rose-50/50 border-rose-300'
          }`}
        >
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Official Composite Result
            </span>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground">
                GPA {calculated.gpa.toFixed(2)}
              </h2>
              <Badge
                variant="outline"
                className={`text-sm font-mono font-bold px-3 py-1 ${
                  calculated.passed
                    ? 'border-emerald-500/50 text-emerald-800 bg-emerald-50'
                    : 'border-rose-500/50 text-rose-800 bg-rose-50'
                }`}
              >
                Grade {calculated.letterGrade}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {calculated.passed
                ? 'Candidate has satisfied all passing criteria across compulsory subjects.'
                : 'Candidate has not met passing requirements in one or more compulsory subjects.'}
            </p>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <span className="text-xs text-muted-foreground font-medium">Final Status</span>
            <div className="text-xl font-bold mt-0.5">
              {calculated.passed ? (
                <span className="text-emerald-700 flex items-center gap-1.5 justify-center sm:justify-end">
                  <CheckCircle2 className="w-5 h-5" /> PASSED
                </span>
              ) : (
                <span className="text-rose-700 flex items-center gap-1.5 justify-center sm:justify-end">
                  <XCircle className="w-5 h-5" /> FAILED
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-muted-foreground">Total Marks: <strong className="text-foreground">{calculated.totalMarks}</strong> / 700</span>
          </div>
        </div>

        {/* Failure Explanation Banner if Failed */}
        {!calculated.passed && calculated.trace.failureReasons.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2 luxury-card">
            <div className="flex items-center gap-2 font-bold text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Reason for Failing Result:
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {calculated.trace.failureReasons.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* NEW: Subject Performance Curve & Mark Distribution Graph */}
        <Card className="luxury-card shadow-md bg-white">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                  Subject Mark Performance Curve & Benchmark Trajectory
                </CardTitle>
                <CardDescription className="text-xs">
                  Smooth trajectory curve of candidate scores across subjects against Pass (33%) and Distinction (80%) benchmarks.
                </CardDescription>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" /> Scored Mark
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> A+ Distinction (80)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Pass Cutoff (33)
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceChartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreCurveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C59B27" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#C59B27" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" vertical={false} />
                  <XAxis
                    dataKey="code"
                    stroke="#6B7280"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E0D8' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#6B7280"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E0D8' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-xl border border-border shadow-lg text-xs space-y-1">
                            <p className="font-bold text-foreground">{data.name} ({data.code})</p>
                            <p className="text-muted-foreground font-mono">
                              Total Marks: <strong className="text-amber-700">{data.marks} / 100</strong>
                            </p>
                            <p className="text-muted-foreground font-mono">
                              Earned GP: <strong className="text-foreground">{data.gradePoint.toFixed(2)} ({data.letterGrade})</strong>
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {data.isOptional ? '4th (Optional Subject)' : 'Compulsory Subject'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={80} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'A+ (80)', position: 'insideTopRight', fill: '#059669', fontSize: 10 }} />
                  <ReferenceLine y={33} stroke="#F43F5E" strokeDasharray="4 4" label={{ value: 'Pass (33)', position: 'insideBottomRight', fill: '#E11D48', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="marks"
                    stroke="#C59B27"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreCurveGradient)"
                    dot={{ r: 4, fill: '#C59B27', stroke: '#FFFFFF', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#1E3A8A', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject-Wise Performance Table */}
        <Card className="luxury-card shadow-md bg-white">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
              <Layers className="w-4 h-4 text-amber-700" />
              Subject Performance & Grade Point Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Detailed theory, practical, total marks, and earned grade points.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 bg-secondary/40">
                    <TableHead className="text-xs font-semibold">Subject Code</TableHead>
                    <TableHead className="text-xs font-semibold">Subject Title</TableHead>
                    <TableHead className="text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Theory (75)</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Practical (25)</TableHead>
                    <TableHead className="text-xs font-semibold text-right font-bold">Total (100)</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Grade Point</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Letter Grade</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subj: any) => (
                    <TableRow key={subj.subject_code} className="border-border/60 hover:bg-muted/20">
                      <TableCell className="font-mono text-xs font-semibold">
                        {subj.subject_code}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{subj.subject_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {subj.is_compulsory ? (
                          <Badge variant="outline" className="text-[10px] border-border/80">Compulsory</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-800 bg-amber-50">Optional (4th)</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {subj.is_absent ? (
                          <span className="text-rose-600 font-bold">AB</span>
                        ) : (
                          subj.theory_marks ?? '—'
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {subj.is_absent ? (
                          <span className="text-rose-600 font-bold">AB</span>
                        ) : (
                          subj.practical_marks ?? '—'
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono font-bold text-foreground">
                        {subj.is_absent ? (
                          <span className="text-rose-600 font-bold">AB</span>
                        ) : (
                          subj.total_marks
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-center font-mono font-bold text-amber-800">
                        {subj.grade_point.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-center font-bold">
                        <span className={subj.passed ? 'text-emerald-700' : 'text-rose-700'}>
                          {subj.letter_grade}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        {subj.passed ? (
                          <span className="text-emerald-700 text-[11px] font-semibold">Passed</span>
                        ) : (
                          <span className="text-rose-700 text-[11px] font-semibold">Failed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Explainable Calculation Trace Accordion */}
        <Card className="luxury-card shadow-md bg-white">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-base flex items-center gap-2 text-foreground font-bold">
              <Sparkles className="w-4 h-4 text-amber-700" />
              “Why This Result?” — Transparent Calculation Trace
            </CardTitle>
            <CardDescription className="text-xs">
              Step-by-step mathematical trace of how marks produced the final GPA.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Accordion defaultValue={['trace-step-1']} className="w-full">
              <AccordionItem value="trace-step-1" className="border-border/60">
                <AccordionTrigger className="text-xs font-semibold hover:no-underline text-foreground">
                  Step 1: Compulsory Subjects Grade Point Sum
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-2 font-mono">
                  <p>
                    All 6 compulsory subjects (Bangla, English, Mathematics, Physics, Chemistry, Biology) are calculated independently:
                  </p>
                  <div className="p-3 rounded-xl bg-secondary/30 border border-border/70 text-foreground space-y-1">
                    {calculated.trace.compulsoryResults.map((cr) => (
                      <div key={cr.subjectCode} className="flex items-center justify-between">
                        <span>{cr.subjectName} ({cr.subjectCode}):</span>
                        <span className="font-bold">GP {cr.gradePoint.toFixed(2)} ({cr.letterGrade})</span>
                      </div>
                    ))}
                    <div className="border-t border-border/60 pt-1 mt-1 flex items-center justify-between font-bold text-amber-800">
                      <span>Compulsory GP Sum:</span>
                      <span>{calculated.compulsoryGradePointSum.toFixed(2)}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="trace-step-2" className="border-border/60">
                <AccordionTrigger className="text-xs font-semibold hover:no-underline text-foreground">
                  Step 2: 4th Optional Subject Contribution Formula
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-2 font-mono">
                  <p>
                    By official regulation, the 4th subject ({student.optional_subject_name}) only contributes points in excess of Grade Point 2.00:
                  </p>
                  <div className="p-3 rounded-xl bg-secondary/30 border border-border/70 text-foreground space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Optional Subject Earned GP:</span>
                      <span className="font-bold">{calculated.optionalGradePoint.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Threshold Base:</span>
                      <span>2.00</span>
                    </div>
                    <div className="flex items-center justify-between text-amber-800 font-bold">
                      <span>Net Contribution: max(0, {calculated.optionalGradePoint.toFixed(2)} - 2.00) =</span>
                      <span>+{calculated.optionalContribution.toFixed(2)}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="trace-step-3" className="border-border/60">
                <AccordionTrigger className="text-xs font-semibold hover:no-underline text-foreground">
                  Step 3: Final Composite GPA & Letter Grade Mapping
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-2 font-mono">
                  <div className="p-3 rounded-xl bg-secondary/30 border border-border/70 text-foreground space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Total Adjusted Grade Points:</span>
                      <span>
                        {calculated.compulsoryGradePointSum.toFixed(2)} + {calculated.optionalContribution.toFixed(2)} = {calculated.totalGradePointSum.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Divisor (Compulsory Subject Count):</span>
                      <span>6</span>
                    </div>
                    <div className="border-t border-border/60 pt-1 mt-1 flex items-center justify-between font-bold text-amber-800 text-sm">
                      <span>Calculated GPA:</span>
                      <span>{calculated.gpa.toFixed(2)} → Letter Grade {calculated.letterGrade}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* QR Verification & Authenticity Block */}
        <div className="border border-border/80 rounded-2xl bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-6 luxury-card shadow-md">
          <div className="flex items-center gap-4">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Verification QR Code"
                className="w-20 h-20 rounded-xl border border-border/80 bg-white p-1.5 shrink-0 shadow-xs"
              />
            )}
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-700" />
                Digital Verification Token
              </span>
              <p className="text-xs font-mono text-muted-foreground">
                Token: <strong className="text-foreground">{studentDetails.result?.verification_token}</strong>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Scan with any mobile device to verify transcript authenticity on the public registry.
              </p>
            </div>
          </div>

          <Link href={`/verify/${studentDetails.result?.verification_token}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Open Verification Page
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
