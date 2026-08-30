'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  Sparkles,
  AlertTriangle,
  BookOpen,
  PieChart as PieIcon,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAnalyticsData } from '@/lib/analytics-service';
import { getCases } from '@/lib/data-service';

export default function AnalyticsPage() {
  const [selectedCase, setSelectedCase] = useState<string>('PUB-01');
  const cases = useMemo(() => getCases(), []);

  const analytics = useMemo(
    () => getAnalyticsData(selectedCase === 'ALL' ? undefined : selectedCase),
    [selectedCase]
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Academic Analytics & Insights</h1>
          <p className="text-sm text-muted-foreground">
            Live, deterministic performance analytics across grade bands, subjects, practicals, and cohorts.
          </p>
        </div>

        <div className="w-56">
          <Select value={selectedCase} onValueChange={(val) => { if (val) setSelectedCase(val); }}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Select Cohort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Cohorts (1,765 Students)</SelectItem>
              {cases.map((c) => (
                <SelectItem key={c.case_code} value={c.case_code}>
                  {c.case_code} ({c.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dynamic Data-Driven Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics.insights.map((insight, idx) => (
          <Card
            key={idx}
            className={`border-border/60 ${
              insight.type === 'warning'
                ? 'bg-amber-500/5 border-amber-500/30'
                : insight.type === 'positive'
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : 'bg-card/60'
            }`}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                {insight.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-accent shrink-0" />
                )}
                <CardTitle className="text-xs font-bold leading-snug">{insight.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1: Grade Distribution & Pass/Fail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Letter Grade Distribution */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              Letter Grade Distribution (A+ to F)
            </CardTitle>
            <CardDescription>Frequency of composite letter grades across candidates.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="grade" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" name="Candidates" radius={[4, 4, 0, 0]}>
                  {analytics.gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pass/Fail Pie Chart */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-accent" />
              Pass / Fail Ratio
            </CardTitle>
            <CardDescription>Overall outcome proportion.</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={analytics.passFailData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {analytics.passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 text-xs mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Passed: {analytics.summary.passed} ({analytics.summary.passRate}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span>Failed: {analytics.summary.failed}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: GPA Distribution & Subject Averages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Distribution */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              GPA Range Distribution
            </CardTitle>
            <CardDescription>Number of students by discrete GPA bands (0.00 to 5.00).</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.gpaDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="range" type="category" stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#3b9ca5" radius={[0, 4, 4, 0]} name="Candidates" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Average Marks */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              Subject Average Performance
            </CardTitle>
            <CardDescription>Mean marks (out of 100) per subject across cohort.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.subjectPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="subjectCode" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="averageMarks" fill="#4f6fad" radius={[4, 4, 0, 0]} name="Avg Mark" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3: Practical vs Theory & Class Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Practical vs Theory */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              Practical vs Theory Score Comparison (%)
            </CardTitle>
            <CardDescription>Normalized percentage achieved in theory (75 max) vs practical (25 max).</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.practicalVsTheory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="subjectCode" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="avgTheoryPercentage" fill="#6366f1" name="Theory %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgPracticalPercentage" fill="#10b981" name="Practical %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Class-by-Class Comparison */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-accent" />
              Class Comparison (Class 9 vs Class 10)
            </CardTitle>
            <CardDescription>Comparative cohort pass rate and average GPA.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.classComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="className" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="passRate" fill="#06b6d4" name="Pass Rate (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="averageGpa" fill="#f59e0b" name="Avg GPA (x20 scale)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
