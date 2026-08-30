'use client';

import { useState, Suspense, lazy } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Search, Shield, BarChart3, FileCheck, ChevronRight, 
  GraduationCap, CheckCircle2, ArrowRight, Sparkles,
  ClipboardCheck, Eye, Lock, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const HeroScene = lazy(() => import('@/components/three/HeroScene'));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } }
};

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (queryOverride?: string) => {
    const raw = (queryOverride !== undefined ? queryOverride : searchQuery).trim();
    if (!raw) return;

    // Direct student ID pattern matching (e.g. S001, s001, 001, S032, S076)
    const codeMatch = raw.match(/^s?(\d{1,4})$/i);
    if (codeMatch) {
      const formattedCode = `S${codeMatch[1].padStart(3, '0')}`;
      router.push(`/results/PUB-01/${formattedCode}`);
      return;
    }

    // Direct case + student code matching (e.g. PUB-01/S001, PUB-02 S005)
    const caseStudentMatch = raw.match(/^(PUB-\d{2})[\s\-_/]+(S\d{3})$/i);
    if (caseStudentMatch) {
      const caseCode = caseStudentMatch[1].toUpperCase();
      const studentCode = caseStudentMatch[2].toUpperCase();
      router.push(`/results/${caseCode}/${studentCode}`);
      return;
    }

    // General name or cohort search
    router.push(`/results?q=${encodeURIComponent(raw)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* Luxury Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/70">
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
              <Link href="/results" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-16">
        {/* 3D Crystalline Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Suspense fallback={<HeroFallback />}>
            <HeroScene />
          </Suspense>
        </div>

        {/* Hero Content */}
        <motion.div 
          className="relative z-10 max-w-4xl mx-auto px-4 text-center py-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs font-semibold border-amber-600/30 bg-amber-50 text-amber-900 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-700 inline" />
              Problem P08 — School Result Processing & GPA Engine
            </Badge>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground"
          >
            Every Result Has
            <br />
            <span className="gradient-text">a Reason.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-9 font-normal leading-relaxed"
          >
            BottleResult transforms raw secondary school marks into mathematically transparent, 
            verifiable, and audit-ready academic transcripts. Every grade point traced. Every decision explained.
          </motion.p>

          {/* Interactive Search Box */}
          <motion.div variants={itemVariants} className="max-w-xl mx-auto mb-5">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col sm:flex-row gap-2 bg-white/90 p-2 rounded-2xl border border-border/80 luxury-card backdrop-blur-md"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Student ID (e.g. S001, S002, S032)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-transparent border-0 shadow-none focus-visible:ring-0 text-base placeholder:text-muted-foreground/70"
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="h-12 px-7 gradient-bg-accent border-0 text-white font-semibold shadow-md hover:brightness-105 transition-all"
              >
                Check Result
              </Button>
            </form>
          </motion.div>

          {/* Instant Candidate Chips */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">Quick Test Cases:</span>
            <button
              onClick={() => {
                setSearchQuery('S001');
                handleSearch('S001');
              }}
              className="px-2.5 py-1 rounded-full bg-secondary/80 hover:bg-amber-100 hover:text-amber-900 border border-border/60 transition-colors font-mono cursor-pointer"
            >
              S001 (Kamal Begum - 4.58)
            </button>
            <button
              onClick={() => {
                setSearchQuery('S002');
                handleSearch('S002');
              }}
              className="px-2.5 py-1 rounded-full bg-secondary/80 hover:bg-rose-100 hover:text-rose-900 border border-border/60 transition-colors font-mono cursor-pointer"
            >
              S002 (Compulsory Fail)
            </button>
            <button
              onClick={() => {
                setSearchQuery('S032');
                handleSearch('S032');
              }}
              className="px-2.5 py-1 rounded-full bg-secondary/80 hover:bg-amber-100 hover:text-amber-900 border border-border/60 transition-colors font-mono cursor-pointer"
            >
              S032 (Absent - AB)
            </button>
            <button
              onClick={() => {
                setSearchQuery('S076');
                handleSearch('S076');
              }}
              className="px-2.5 py-1 rounded-full bg-secondary/80 hover:bg-emerald-100 hover:text-emerald-900 border border-border/60 transition-colors font-mono cursor-pointer"
            >
              S076 (A+ 5.00)
            </button>
          </motion.div>
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
