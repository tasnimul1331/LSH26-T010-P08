'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  GraduationCap,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  QrCode,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { verifyResultByToken } from '@/lib/data-service';

export default function VerificationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const { token } = resolvedParams;

  const verifiedRecord = useMemo(() => verifyResultByToken(token), [token]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-bg-accent flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">BottleResult</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            Official Public Transcript Verification Registry
          </p>
        </div>

        {/* Verification Card */}
        {verifiedRecord ? (
          <Card className="border-border/60 shadow-xl overflow-hidden">
            {/* Verification Seal Banner */}
            <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-4 text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-emerald-400">Authentic Academic Result Verified</h2>
              <p className="text-xs text-emerald-300/80">
                This record matches official institutional examination records.
              </p>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Token Display */}
              <div className="p-3 rounded-lg bg-card border border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-accent" />
                  Verification Token:
                </span>
                <span className="font-mono font-bold text-foreground">{verifiedRecord.token}</span>
              </div>

              {/* Candidate Info */}
              <div className="space-y-3 text-xs border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Candidate Full Name:</span>
                  <span className="font-bold text-foreground text-sm">{verifiedRecord.student_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Student ID / Code:</span>
                  <span className="font-mono font-bold text-foreground">{verifiedRecord.student_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Academic Cohort / Case:</span>
                  <span className="font-medium text-foreground">{verifiedRecord.case_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Enrolled Class:</span>
                  <span className="font-medium text-foreground">{verifiedRecord.class_name}</span>
                </div>
              </div>

              {/* Result Summary */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/60">
                <div>
                  <span className="text-xs text-muted-foreground">Verified GPA</span>
                  <div className="text-3xl font-extrabold font-mono text-accent">
                    {verifiedRecord.gpa.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Final Grade & Result</span>
                  <div className="mt-1">
                    <Badge
                      className={`font-mono text-xs ${
                        verifiedRecord.passed
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}
                    >
                      Grade {verifiedRecord.letter_grade} ({verifiedRecord.passed ? 'PASSED' : 'FAILED'})
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Timestamp & Engine Version */}
              <div className="space-y-1 text-[11px] text-muted-foreground text-center">
                <p>Publication Date: {verifiedRecord.published_at ? new Date(verifiedRecord.published_at).toLocaleDateString() : 'Official Examination Session'}</p>
                <p>Engine Spec: BottleResult Deterministic Engine {verifiedRecord.calculation_version}</p>
              </div>

              <Link
                href={`/results/${verifiedRecord.case_code}/${verifiedRecord.student_code}`}
                className="w-full block"
              >
                <Button className="w-full gradient-bg-accent border-0 text-white gap-2 text-xs">
                  Inspect Complete Subject Breakdown & Trace
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-rose-500/40 bg-rose-500/5 text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Invalid Verification Token</h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              The verification token <strong className="text-foreground font-mono">{token}</strong> is invalid or the corresponding result has not been officially published.
            </p>
            <Link href="/results">
              <Button variant="outline" size="sm" className="text-xs">
                Return to Result Search
              </Button>
            </Link>
          </Card>
        )}

        <div className="text-center text-xs text-muted-foreground">
          BottleResult Intelligence Platform • Problem P08
        </div>
      </div>
    </div>
  );
}
