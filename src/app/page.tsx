'use client';

import { useState, Suspense, lazy } from 'react';
import Link from 'next/link';
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
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg-accent flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">BottleResult</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/results" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Results
              </Link>
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Admin
              </Link>
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  Explore Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<HeroFallback />}>
            <HeroScene />
          </Suspense>
        </div>

        {/* Hero Content */}
        <motion.div 
          className="relative z-10 max-w-4xl mx-auto px-4 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-accent/30 bg-accent/5">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-accent" />
              P08 — School Result Intelligence Platform
            </Badge>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Every Result Has
            <br />
            <span className="gradient-text">a Reason.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            BottleResult transforms raw school marks into transparent, verifiable, 
            and audit-ready results. Every grade point traced. Every decision explained.
          </motion.p>

          {/* Search Box */}
          <motion.div variants={itemVariants} className="max-w-lg mx-auto mb-8">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/results?q=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Student ID (e.g., S001)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-card/80 backdrop-blur-sm border-border/50"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 gradient-bg-accent border-0 text-white">
                Check Result
              </Button>
            </form>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/admin/dashboard">
              <Button size="lg" variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                Explore Demo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Result Intelligence, <span className="gradient-text">Not Just Processing</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From raw marks to verified, explainable results — every step transparent and auditable.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 group">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                      <feature.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete pipeline from raw marks to published, verified results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="relative text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-12 h-12 rounded-full gradient-bg-accent flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-6 -right-4 w-6 h-6 text-muted-foreground/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Verify?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Search for any published student result by their ID. Every calculation explained, every grade traceable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/results">
                <Button size="lg" className="gradient-bg-accent border-0 text-white gap-2">
                  <Search className="w-4 h-4" />
                  Check Student Result
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button size="lg" variant="outline" className="gap-2">
                  Judge Demo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded gradient-bg-accent flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">BottleResult</span>
              <span className="text-sm text-muted-foreground">— Every Result Has a Reason</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Explainable & Verifiable School Result Intelligence Platform • P08
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroFallback() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-background via-background to-accent/5" />
  );
}

const features = [
  {
    icon: FileCheck,
    title: 'Deterministic Calculation',
    description: 'Every grade point, GPA, and letter grade computed from official rules. No AI, no guesswork.',
  },
  {
    icon: Eye,
    title: 'Explainable Trace',
    description: '"Why this result?" — see every input, rule, and decision for each subject.',
  },
  {
    icon: Shield,
    title: 'Verification & QR',
    description: 'Published results are verifiable via secure QR codes and public verification pages.',
  },
  {
    icon: ClipboardCheck,
    title: 'Checking Center',
    description: 'Automatic detection of compulsory failures, practical issues, absences, and anomalies.',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics',
    description: 'Pass/fail distribution, GPA trends, subject performance — all from real calculated data.',
  },
  {
    icon: Lock,
    title: 'Audit Trail',
    description: 'Every mark change, result correction, and publication logged with full accountability.',
  },
];

const steps = [
  {
    title: 'Import',
    description: 'Upload and validate the structured marks dataset.',
  },
  {
    title: 'Calculate',
    description: 'Deterministic engine computes every result with trace.',
  },
  {
    title: 'Verify',
    description: 'Review checking items and approve for publication.',
  },
  {
    title: 'Publish',
    description: 'Results go live with QR verification and public access.',
  },
];
