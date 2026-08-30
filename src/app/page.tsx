'use client';

import { useState, useMemo, Suspense, lazy } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { 
  Search, Shield, BarChart3, FileCheck, ChevronRight, 
  GraduationCap, CheckCircle2, XCircle, ArrowRight, Sparkles,
  ClipboardCheck, Eye, Lock, QrCode, Download, Printer,
  ChevronDown, Layers, Award, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCases, getStudentWithDetails } from '@/lib/data-service';

const HeroScene = lazy(() => import('@/components/three/HeroScene'));

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }
};

export default function LandingPage() {
  const [selectedCase, setSelectedCase] = useState<string>('PUB-01');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeResult, setActiveResult] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const router = useRouter();

  const cases = useMemo(() => getCases(), []);

  const handleCheckResult = (caseCodeOverride?: string, studentCodeOverride?: string) => {
    const cCode = (caseCodeOverride || selectedCase || 'PUB-01').toUpperCase();
    const rawStudent = (studentCodeOverride !== undefined ? studentCodeOverride : searchQuery).trim();
    
    if (!rawStudent) {
      setSearchError('Please enter a Student ID (e.g. S001).');
      setActiveResult(null);
      return;
    }

    setSearchError(null);

    // Format student code e.g. "1" -> "S001", "s005" -> "S005", "S001" -> "S001"
    let formattedStudentCode = rawStudent.toUpperCase();
    const numMatch = rawStudent.match(/^s?(\d{1,4})$/i);
    if (numMatch) {
      formattedStudentCode = `S${numMatch[1].padStart(3, '0')}`;
    }

    // Find real student result from existing deterministic data source
    const details = getStudentWithDetails(cCode, formattedStudentCode);
    if (details && details.calculated) {
      setActiveResult(details);
      setSearchQuery(formattedStudentCode);
      setSearchError(null);
    } else {
      setActiveResult(null);
      setSearchError(`Student ID ${formattedStudentCode} was not found in ${cCode}.`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* Luxury Light Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/70 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg gradient-bg-accent flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-foreground">BottleResult</span>
              </div>
            </Link>

            <div className="flex items-center gap-5">
              <Link href="/results" className="text-sm font-medium text-muted-foreground hover:text-amber-800 transition-colors">
                Public Results
              </Link>
              <Link href="/auth/login">
                <Button size="sm" variant="default" className="gradient-bg-primary text-white text-xs px-4 h-9 shadow-sm hover:opacity-90 transition-opacity">
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
        {/* 3D Scientific Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Suspense fallback={<HeroFallback />}>
            <HeroScene />
          </Suspense>
        </div>

        {/* Hero Content */}
        <motion.div 
          className="relative z-10 max-w-4xl mx-auto px-4 text-center py-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow Reveal */}
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="mb-5 px-4 py-1.5 text-xs font-semibold border-amber-600/30 bg-amber-50 text-amber-900 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-700 inline" />
              Problem P08 — School Result Processing & GPA Engine
            </Badge>
          </motion.div>

          {/* Headline Reveal */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-5 text-foreground"
          >
            Every Result Has
            <br />
            <span className="gradient-text">a Reason.</span>
          </motion.h1>

          {/* Supporting Copy Reveal */}
          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-normal leading-relaxed"
          >
            BottleResult transforms raw secondary school marks into mathematically transparent, 
            verifiable, and audit-ready academic transcripts. Every grade point traced. Every decision explained.
          </motion.p>

          {/* Search Panel Reveal */}
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto mb-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/95 p-2 rounded-2xl border border-border/90 luxury-card backdrop-blur-md">
              {/* Publication Selector Dropdown with Down Arrow */}
              <div className="w-full sm:w-auto">
                <Select
                  value={selectedCase}
                  onValueChange={(val) => {
                    if (val) {
                      setSelectedCase(val);
                      if (searchQuery.trim()) {
                        handleCheckResult(val, searchQuery);
                      }
                    }
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[130px] h-12 bg-secondary/60 border-border/80 rounded-xl font-mono text-xs font-bold text-foreground focus:ring-amber-500">
                    <SelectValue placeholder="Cohort" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 bg-white border-border">
                    {cases.map((c) => (
                      <SelectItem key={c.case_code} value={c.case_code} className="font-mono text-xs font-medium cursor-pointer">
                        {c.case_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Student ID Search Input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Student ID (e.g. S001, S005, S032)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (searchError) setSearchError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCheckResult();
                    }
                  }}
                  className="pl-10 h-12 bg-transparent border-0 shadow-none focus-visible:ring-0 text-base placeholder:text-muted-foreground/60 font-medium"
                />
              </div>

              {/* Check Result Action Button */}
              <Button 
                type="button" 
                onClick={() => handleCheckResult()}
                size="lg" 
                className="w-full sm:w-auto h-12 px-7 gradient-bg-accent border-0 text-white font-semibold shadow-md hover:brightness-105 transition-all shrink-0 cursor-pointer"
              >
                Check Result
              </Button>
            </div>
          </motion.div>

          {/* Invalid Search Inline Error */}
          {searchError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl max-w-md mx-auto my-3 flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{searchError}</span>
            </motion.div>
          )}

          {/* Result Preview Card (Appears BELOW the Search Panel) */}
          <AnimatePresence mode="wait">
            {activeResult && activeResult.calculated && (
              <motion.div
                key={`${activeResult.student.case_code}_${activeResult.student.student_code}`}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="text-left w-full max-w-2xl mx-auto my-6"
              >
                <Card className="luxury-card overflow-hidden border-amber-500/40 shadow-xl bg-white">
                  {/* Result Found Indicator Header */}
                  <div className="bg-gradient-to-r from-amber-50/80 via-white to-slate-50 border-b border-border/80 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-300/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Result Found
                      </div>
                      <Badge variant="outline" className="font-mono text-[11px] border-border/80">
                        {activeResult.student.case_code} • {activeResult.student.class_name}
                      </Badge>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-secondary text-foreground border border-border/70">
                        {activeResult.student.student_code}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-5 sm:p-6 space-y-4">
                    {/* Student Identity & Main GPA Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-foreground">
                          {activeResult.student.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Optional (4th) Subject: <strong className="text-foreground">{activeResult.student.optional_subject_name}</strong> ({activeResult.student.optional_subject_code})
                        </p>
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                        <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground">
                          GPA {activeResult.calculated.gpa.toFixed(2)}
                        </div>
                        <Badge
                          className={`text-xs px-2.5 py-0.5 font-semibold border ${
                            activeResult.calculated.passed
                              ? 'border-emerald-500/40 text-emerald-800 bg-emerald-50'
                              : 'border-rose-500/40 text-rose-800 bg-rose-50'
                          }`}
                        >
                          Grade {activeResult.calculated.letterGrade} ({activeResult.calculated.passed ? 'PASSED' : 'FAILED'})
                        </Badge>
                      </div>
                    </div>

                    {/* Failure Alert if Failed */}
                    {!activeResult.calculated.passed && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold block mb-0.5">Failure Reason:</strong>
                          {activeResult.calculated.trace.failureReasons.join(' ')}
                        </div>
                      </div>
                    )}

                    {/* Subject Grade Points Summary */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Subject Grade Points (GP)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {activeResult.calculated.subjectResults.map((sr: any) => (
                          <div
                            key={sr.subjectCode}
                            className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${
                              sr.isOptional
                                ? 'bg-amber-50/60 border-amber-300/80 text-amber-950'
                                : 'bg-secondary/40 border-border/70 text-foreground'
                            }`}
                          >
                            <span className="font-semibold font-sans">{sr.subjectCode}</span>
                            <span className="font-bold">
                              {sr.isAbsent ? 'AB' : sr.gradePoint.toFixed(2)}{' '}
                              <span className="text-[10px] font-normal text-muted-foreground font-sans">({sr.letterGrade})</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Why this result? Summary */}
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border/70 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        Why this result? (Calculation Summary)
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground space-y-0.5">
                        <div>• Compulsory GP Sum: <strong className="text-foreground">{activeResult.calculated.compulsoryGradePointSum.toFixed(2)}</strong></div>
                        <div>• 4th Subject Excess: max(0, {activeResult.calculated.optionalGradePoint.toFixed(2)} - 2.00) = <strong className="text-amber-800">+{activeResult.calculated.optionalContribution.toFixed(2)}</strong></div>
                        <div>• Formula: min(5.00, ({activeResult.calculated.compulsoryGradePointSum.toFixed(2)} + {activeResult.calculated.optionalContribution.toFixed(2)}) / 6) = <strong className="text-foreground">{activeResult.calculated.gpa.toFixed(2)}</strong></div>
                      </div>
                    </div>

                    {/* View Detailed Result Action */}
                    <div className="pt-2 flex items-center justify-between border-t border-border/60">
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Token: {activeResult.result?.verification_token || 'VRF-STAMP-VERIFIED'}
                      </div>

                      <Link href={`/results/${activeResult.student.case_code}/${activeResult.student.student_code}`}>
                        <Button className="gradient-bg-primary text-white text-xs h-9 px-4 gap-1.5 shadow-sm hover:opacity-90 font-semibold cursor-pointer">
                          View Detailed Result →
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 border-t border-border/50 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">
              Result Intelligence, <span className="gradient-text">Not Just Processing</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              From raw marks to published, QR-verified results — every calculation is 100% deterministic and auditable.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="luxury-card h-full hover:border-amber-500/40 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-base mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-14"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">
              Deterministic Academic Pipeline
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              A continuous workflow ensuring institutional accuracy from ingestion to public verification.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="relative text-center p-5 rounded-2xl bg-white border border-border/70 luxury-card"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-full gradient-bg-accent flex items-center justify-center mx-auto mb-3.5 text-white font-bold text-sm shadow-sm">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-sm mb-1.5 text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/70 py-10 px-4 bg-white/80">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg gradient-bg-accent flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight text-foreground">BottleResult</span>
              <span className="text-xs text-muted-foreground">• “Every Result Has a Reason”</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Explainable & Verifiable School Result Intelligence Platform • Problem P08
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroFallback() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-amber-50/20 via-background to-blue-50/20" />
  );
}

const features = [
  {
    icon: FileCheck,
    title: 'Deterministic Engine',
    description: 'Every grade point, composite GPA, and letter grade computed purely by official rules. Zero hallucinations.',
  },
  {
    icon: Eye,
    title: 'Explainable Calculation Trace',
    description: '“Why this result?” — see every input mark, 4th subject excess GP, and explicit failure reasons.',
  },
  {
    icon: Shield,
    title: 'QR Security Verification',
    description: 'Published results include cryptographic verification tokens and printable official vector transcripts.',
  },
  {
    icon: ClipboardCheck,
    title: 'Automated Checking Center',
    description: 'Instant scrutiny of compulsory failures, practical component issues, absences, and low GP.',
  },
  {
    icon: BarChart3,
    title: 'Institutional Analytics',
    description: 'Live pass/fail ratios, grade distributions, subject performance, and practical vs theory gaps.',
  },
  {
    icon: Lock,
    title: 'Immutable Audit Trail',
    description: 'Every mark adjustment, recalculation, and status transition recorded with before/after state diffs.',
  },
];

const steps = [
  {
    title: '1. Structured Ingestion',
    description: 'Upload and validate candidate marks datasets with transactional integrity.',
  },
  {
    title: '2. Deterministic Calculation',
    description: 'Compute GP, 4th subject excess, and composite GPA with mathematical trace.',
  },
  {
    title: '3. Scrutiny & Checking',
    description: 'Automated verification flags potential failures and anomalies for review.',
  },
  {
    title: '4. Verified Publication',
    description: 'Publish transcripts with public QR verification and PDF export capabilities.',
  },
];
