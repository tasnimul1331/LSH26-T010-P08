'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

function ResultsSearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedCase, setSelectedCase] = useState<string>(initialQuery ? 'ALL' : 'PUB-01');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setSelectedCase('ALL');
    }
  }, [initialQuery]);

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
        const matchesCase = s.case_code.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesCase) return false;
      }
      if (selectedClass !== 'ALL' && s.class_name !== selectedClass) return false;
      return true;
    });
  }, [allStudents, searchQuery, selectedClass]);

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="outline" className="px-3 py-1 border-amber-600/30 text-amber-800 bg-amber-50">
          Public Result Verification Portal
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Official Academic Results Search
        </h1>
        <p className="text-sm text-muted-foreground">
          Search published examination records by Student ID or Candidate Name. View transparent calculation traces and QR verified transcripts.
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="luxury-card shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search candidate by name or ID (e.g. S001)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 bg-white border-border/80"
              />
            </div>

            <div className="sm:col-span-3">
              <Select value={selectedCase} onValueChange={(val) => { if (val) setSelectedCase(val); }}>
                <SelectTrigger className="h-11 bg-white border-border/80">
                  <SelectValue placeholder="Cohort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Cohorts (25 Cases)</SelectItem>
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
                <SelectTrigger className="h-11 bg-white border-border/80">
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

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium">
            Showing <span className="font-semibold text-foreground">{filteredStudents.length}</span> published candidate records
          </p>
        </div>

        {filteredStudents.length === 0 ? (
          <Card className="luxury-card text-center py-16">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-700 mx-auto flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">No Published Results Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No matching student found for query &ldquo;{searchQuery}&rdquo;. Try searching for Student Code (e.g. <span className="font-mono font-semibold">S001</span>) or clearing the filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((student) => (
              <Card
                key={student.id}
                className="luxury-card hover:border-amber-500/50 hover:shadow-lg transition-all duration-200 group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border/60">
                          {student.student_code}
                        </span>
                        <Badge variant="outline" className="text-[11px] font-mono border-border/80">
                          {student.case_code} • {student.class_name}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-base text-foreground group-hover:text-amber-700 transition-colors">
                        {student.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Optional (4th): <span className="font-medium text-foreground">{student.optional_subject_name}</span> ({student.optional_subject_code})
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <div
                        className={`text-xl font-bold font-mono ${
                          student.passed ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {student.gpa.toFixed(2)}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          student.passed
                            ? 'border-emerald-500/40 text-emerald-700 bg-emerald-50'
                            : 'border-rose-500/40 text-rose-700 bg-rose-50'
                        }`}
                      >
                        Grade {student.letter_grade} ({student.passed ? 'PASSED' : 'FAILED'})
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <QrCode className="w-3.5 h-3.5 text-amber-700" />
                      <span className="font-mono text-[11px]">{student.verification_token}</span>
                    </div>

                    <Link href={`/results/${student.case_code}/${student.student_code}`}>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 text-xs gap-1.5 gradient-bg-primary text-white hover:opacity-90 shadow-sm"
                      >
                        View Full Result
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicResultsSearchPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/70 glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg-accent flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">BottleResult</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/results" className="text-sm font-medium text-amber-800 hover:text-amber-900 transition-colors">
              Results
            </Link>
            <Link href="/auth/login">
              <Button size="sm" variant="outline" className="text-xs border-border/80">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content with Suspense */}
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center py-24 text-muted-foreground text-sm">
          Loading published results...
        </div>
      }>
        <ResultsSearchContent />
      </Suspense>
    </div>
  );
}
