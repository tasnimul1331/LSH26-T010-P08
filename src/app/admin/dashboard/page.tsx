'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ClipboardList,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDashboardMetrics, getCases, getCheckingItems } from '@/lib/data-service';

export default function AdminDashboardPage() {
  const [selectedCase, setSelectedCase] = useState<string>('PUB-01');
  const [metrics, setMetrics] = useState(getDashboardMetrics('PUB-01'));
  const [cases, setCases] = useState(getCases());
  const [recentIssues, setRecentIssues] = useState(getCheckingItems({ caseCode: 'PUB-01', resolved: false }).slice(0, 5));

  useEffect(() => {
    setMetrics(getDashboardMetrics(selectedCase === 'ALL' ? undefined : selectedCase));
    setRecentIssues(
      getCheckingItems(
        selectedCase === 'ALL'
          ? { resolved: false }
          : { caseCode: selectedCase, resolved: false }
      ).slice(0, 5)
    );
  }, [selectedCase]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Intelligence Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Real-time deterministic result metrics, checking pipeline, and cohort overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-48">
            <Select value={selectedCase} onValueChange={(val) => { if (val) setSelectedCase(val); }}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Select Case" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Cases (1,765 Students)</SelectItem>
                {cases.map((c) => (
                  <SelectItem key={c.case_code} value={c.case_code}>
                    {c.case_code} ({c.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Link href="/demo">
            <Button className="gradient-bg-accent border-0 text-white gap-2 shadow-md">
              <Sparkles className="w-4 h-4" />
              Judge Demo
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-border/60 hover:border-accent/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{metrics.totalStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-emerald-400 font-medium">100% Deterministic</span> — from P08 Dataset
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/60 hover:border-emerald-500/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Passed Candidates</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{metrics.passed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pass Rate:{' '}
                <span className="font-semibold text-foreground">
                  {metrics.totalStudents > 0 ? ((metrics.passed / metrics.totalStudents) * 100).toFixed(1) : 0}%
                </span>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-border/60 hover:border-rose-500/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed / Absent</CardTitle>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <XCircle className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-rose-400">{metrics.failed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Includes <span className="font-semibold text-amber-400">{metrics.absent}</span> Absent Cases
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/60 hover:border-accent/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cohort Average GPA</CardTitle>
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Award className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-accent">{metrics.averageGpa.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Scale: <span className="font-semibold text-foreground">5.00 Max</span> (Bangladesh SSC)
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Second Row: Workflow Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification & Publish Lifecycle */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Result Lifecycle & Workflow Status</CardTitle>
                <CardDescription>
                  Current case: <span className="font-medium text-foreground">{selectedCase}</span>
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Audited & Verifiable
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Steps Visual */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                <span className="text-xs text-muted-foreground">1. IMPORTED</span>
                <p className="text-sm font-bold text-foreground mt-1">25 Cases</p>
                <Badge variant="secondary" className="mt-2 text-[10px]">Validated</Badge>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                <span className="text-xs text-muted-foreground">2. CALCULATED</span>
                <p className="text-sm font-bold text-foreground mt-1">{metrics.totalStudents} Results</p>
                <Badge variant="secondary" className="mt-2 text-[10px] bg-blue-500/10 text-blue-400">Deterministic</Badge>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                <span className="text-xs text-muted-foreground">3. CHECKING</span>
                <p className="text-sm font-bold text-foreground mt-1">{metrics.pendingChecks} Flagged</p>
                <Badge variant="secondary" className="mt-2 text-[10px] bg-amber-500/10 text-amber-400">Review</Badge>
              </div>
              <div className="p-3 rounded-lg bg-card border border-emerald-500/30 bg-emerald-500/5 text-center">
                <span className="text-xs text-emerald-400">4. PUBLISHED</span>
                <p className="text-sm font-bold text-emerald-400 mt-1">{metrics.published} Ready</p>
                <Badge className="mt-2 text-[10px] bg-emerald-500 text-slate-950">Live & QR</Badge>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/admin/students">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Users className="w-4 h-4" />
                  Manage Students
                </Button>
              </Link>
              <Link href="/admin/checking">
                <Button variant="outline" size="sm" className="gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                  <AlertTriangle className="w-4 h-4" />
                  Checking Center ({metrics.pendingChecks})
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Full Analytics
                </Button>
              </Link>
              <Link href="/results">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <Eye className="w-4 h-4" />
                  Public Result Lookup
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Flagged Checking Items */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Priority Issues</CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </div>
            <Link href="/admin/checking">
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentIssues.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No unresolved checking issues found for this case.
              </div>
            ) : (
              recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3 rounded-lg bg-card/60 border border-border/40 hover:border-border transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        issue.severity === 'CRITICAL'
                          ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                          : issue.severity === 'HIGH'
                          ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                          : 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                      }`}
                    >
                      {issue.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {issue.student_code} ({issue.case_code})
                    </span>
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-1">{issue.title}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
