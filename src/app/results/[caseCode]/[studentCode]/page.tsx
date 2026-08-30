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
} from 'lucide-react';
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
        <Card className="max-w-md w-full border-border/60 text-center p-6 space-y-4">
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    await generateStudentResultPDF(student, calculated, verificationUrl);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation (Hidden on print) */}
      <nav className="no-print border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/results" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            <span>Search Results</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="w-3.5 h-3.5" />
              Print Result
            </Button>
            <Button size="sm" onClick={handleDownloadPDF} className="gradient-bg-accent border-0 text-white gap-1.5 text-xs shadow-md">
              <Download className="w-3.5 h-3.5" />
              Download Official PDF
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Result Sheet Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Official Header Banner */}
        <div className="border border-border/60 rounded-xl bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-bg-accent flex items-center justify-center shrink-0">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">BottleResult Academic Transcript</h1>
                <p className="text-xs text-muted-foreground">
                  Secondary School Certificate (SSC) Standard Examination Report
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs py-1">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified Official Record
              </Badge>
            </div>
          </div>

          {/* Candidate Credentials Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Candidate Name</span>
              <p className="text-sm font-bold text-foreground mt-0.5">{student.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Student ID / Roll</span>
              <p className="text-sm font-bold font-mono text-foreground mt-0.5">{student.student_code}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Cohort / Class</span>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {student.case_code} • {student.class_name}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">4th Optional Subject</span>
              <p className="text-sm font-bold text-accent mt-0.5">
                {student.optional_subject_name} ({student.optional_subject_code})
              </p>
            </div>
          </div>
        </div>

        {/* Hero GPA & Pass Banner */}
        <div
          className={`p-6 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md ${
            calculated.passed
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-rose-500/10 border-rose-500/30'
          }`}
        >
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Official Composite Result
            </span>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h2 className="text-3xl font-extrabold font-mono">
                GPA {calculated.gpa.toFixed(2)}
              </h2>
              <Badge
                variant="outline"
                className={`text-sm font-mono font-bold px-2.5 py-0.5 ${
                  calculated.passed
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/20'
                    : 'border-rose-500 text-rose-400 bg-rose-500/20'
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
            <span className="text-xs text-muted-foreground">Final Status</span>
            <div className="text-xl font-bold mt-0.5">
              {calculated.passed ? (
                <span className="text-emerald-400 flex items-center gap-1.5 justify-center sm:justify-end">
                  <CheckCircle2 className="w-5 h-5" /> PASSED
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1.5 justify-center sm:justify-end">
                  <XCircle className="w-5 h-5" /> FAILED
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">Total Marks: {calculated.totalMarks} / 700</span>
          </div>
        </div>

        {/* Failure Explanation Banner if Failed */}
        {!calculated.passed && calculated.trace.failureReasons.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-400">
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

        {/* Subject-Wise Performance Table */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              Subject Performance & Grade Point Breakdown
            </CardTitle>
            <CardDescription>
              Detailed theory, practical, total marks, and earned grade points.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 bg-muted/40">
                    <TableHead className="text-xs">Subject Code</TableHead>
                    <TableHead className="text-xs">Subject Title</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs text-right">Theory (75)</TableHead>
                    <TableHead className="text-xs text-right">Practical (25)</TableHead>
                    <TableHead className="text-xs text-right font-bold">Total (100)</TableHead>
                    <TableHead className="text-xs text-center">Grade Point</TableHead>
                    <TableHead className="text-xs text-center">Letter Grade</TableHead>
                    <TableHead className="text-xs text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subj: any) => (
                    <TableRow key={subj.subject_code} className="border-border/40 hover:bg-muted/30">
                      <TableCell className="font-mono text-xs font-semibold">
                        {subj.subject_code}
                      </TableCell>
                      <TableCell className="text-xs font-medium">{subj.subject_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {subj.is_compulsory ? (
                          <Badge variant="outline" className="text-[10px]">Compulsory</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Optional (4th)</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {subj.is_absent ? (
                          <span className="text-rose-400 font-bold">AB</span>
                        ) : (
                          subj.theory_marks ?? '—'
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {subj.is_absent ? (
                          <span className="text-rose-400 font-bold">AB</span>
                        ) : (
                          subj.practical_marks ?? '—'
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono font-bold text-foreground">
                        {subj.is_absent ? (
                          <span className="text-rose-400 font-bold">AB</span>
                        ) : (
                          subj.total_marks
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-center font-mono font-bold text-accent">
                        {subj.grade_point.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-center font-bold">
                        <span className={subj.passed ? 'text-emerald-400' : 'text-rose-400'}>
                          {subj.letter_grade}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        {subj.passed ? (
                          <span className="text-emerald-400 text-[11px] font-medium">Passed</span>
                        ) : (
                          <span className="text-rose-400 text-[11px] font-medium">Failed</span>
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
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              “Why This Result?” — Transparent Calculation Trace
            </CardTitle>
            <CardDescription>
              Step-by-step mathematical trace of how marks produced the final GPA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion defaultValue={['trace-step-1']} className="w-full">
              <AccordionItem value="trace-step-1" className="border-border/40">
                <AccordionTrigger className="text-xs font-semibold hover:no-underline">
                  Step 1: Compulsory Subjects Grade Point Sum
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-2 font-mono">
                  <p>
                    All 6 compulsory subjects (Bangla, English, Mathematics, Physics, Chemistry, Biology) are calculated independently:
                  </p>
                  <div className="p-3 rounded-lg bg-card border border-border/50 text-foreground space-y-1">
                    {calculated.trace.compulsoryResults.map((cr) => (
                      <div key={cr.subjectCode} className="flex items-center justify-between">
                        <span>{cr.subjectName} ({cr.subjectCode}):</span>
                        <span className="font-bold">GP {cr.gradePoint.toFixed(2)} ({cr.letterGrade})</span>
                      </div>
                    ))}
                    <div className="border-t border-border/50 pt-1 mt-1 flex items-center justify-between font-bold text-accent">
                      <span>Compulsory GP Sum:</span>
                      <span>{calculated.compulsoryGradePointSum.toFixed(2)}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="trace-step-2" className="border-border/40">
                <AccordionTrigger className="text-xs font-semibold hover:no-underline">
                  Step 2: 4th Optional Subject Contribution Formula
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-2 font-mono">
                  <p>
                    By official regulation, the 4th subject ({student.optional_subject_name}) only contributes points in excess of Grade Point 2.00:
                  </p>
                  <div className="p-3 rounded-lg bg-card border border-border/50 text-foreground space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Optional Subject Earned GP:</span>
                      <span className="font-bold">{calculated.optionalGradePoint.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Threshold Base:</span>
                      <span>2.00</span>
                    </div>
                    <div className="flex items-center justify-between text-accent font-bold">
                      <span>Net Contribution: max(0, {calculated.optionalGradePoint.toFixed(2)} - 2.00) =</span>
                      <span>+{calculated.optionalContribution.toFixed(2)}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="trace-step-3" className="border-border/40">
                <AccordionTrigger className="text-xs font-semibold hover:no-underline">
                  Step 3: Final Composite GPA & Letter Grade Mapping
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-2 font-mono">
                  <div className="p-3 rounded-lg bg-card border border-border/50 text-foreground space-y-1">
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
                    <div className="border-t border-border/50 pt-1 mt-1 flex items-center justify-between font-bold text-accent text-sm">
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
        <div className="border border-border/60 rounded-xl bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Verification QR Code"
                className="w-20 h-20 rounded-lg border border-border/80 bg-white p-1 shrink-0"
              />
            )}
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-accent" />
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
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Open Verification Page
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
