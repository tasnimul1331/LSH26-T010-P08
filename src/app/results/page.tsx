'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  QrCode,
  ArrowRight,
  Filter,
  Eye,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getStudents, getCases } from '@/lib/data-service';

export default function PublicResultsSearchPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<string>('PUB-01');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  const cases = useMemo(() => getCases(), []);
  const allStudents = useMemo(() => {
    // Only published results are publicly visible
    return getStudents(selectedCase === 'ALL' ? undefined : selectedCase).filter(
      (s) => s.result_status === 'PUBLISHED'
    );
  }, [selectedCase]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesId = s.student_code.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }
      if (selectedClass !== 'ALL' && s.class_name !== selectedClass) return false;
      return true;
    });
  }, [allStudents, searchQuery, selectedClass]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg-accent flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">BottleResult</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/demo">
              <Button variant="outline" size="sm" className="text-xs border-emerald-500/30 text-emerald-400 gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Judge Demo
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button size="sm" className="text-xs">Admin Portal</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline" className="px-3 py-1 border-accent/40 text-accent bg-accent/5">
            Public Result Verification Portal
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Official Academic Results Search
          </h1>
          <p className="text-sm text-muted-foreground">
            Search published examination records by Student ID or Candidate Name. View transparent calculation traces and QR verified transcripts.
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="border-border/60 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Student Code (e.g. S001) or Full Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 bg-card text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <Select value={selectedCase} onValueChange={(val) => { if (val) setSelectedCase(val); }}>
                  <SelectTrigger className="h-11 bg-card">
                    <SelectValue placeholder="Cohort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Cohorts</SelectItem>
                    {cases.map((c) => (
                      <SelectItem key={c.case_code} value={c.case_code}>
                        {c.case_code} ({c.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3">
                <Select value={selectedClass} onValueChange={(val) => { if (val) setSelectedClass(val); }}>
                  <SelectTrigger className="h-11 bg-card">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Classes</SelectItem>
                    <SelectItem value="Class 9">Class 9</SelectItem>
                    <SelectItem value="Class 10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{filteredStudents.length}</strong> published student results
            </span>
            <span>Deterministic Result Engine v1.0.0</span>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center border border-border/50 rounded-xl bg-card/40 space-y-2">
              <GraduationCap className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-semibold text-foreground">No Published Candidate Results Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No published records match your query. Verify the Student Code (e.g. S001) or select another cohort.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <motion.div
                  key={`${student.case_code}_${student.student_code}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-border/60 hover:border-accent/40 transition-all hover:shadow-md h-full flex flex-col justify-between group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base font-bold group-hover:text-accent transition-colors">
                            {student.name}
                          </CardTitle>
                          <CardDescription className="font-mono text-xs">
                            ID: {student.student_code} • {student.case_code}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs font-bold ${
                            student.passed
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {student.passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-card/80 border border-border/40 text-xs">
                        <div>
                          <span className="text-muted-foreground">Class</span>
                          <p className="font-medium text-foreground">{student.class_name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">4th Subject</span>
                          <p className="font-medium text-foreground">{student.optional_subject_code}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground">GPA</span>
                          <p className="font-mono font-bold text-accent text-sm">
                            {student.gpa.toFixed(2)} ({student.letter_grade})
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/results/${student.case_code}/${student.student_code}`}
                        className="w-full block"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 text-xs group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Result & Trace
                          <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
