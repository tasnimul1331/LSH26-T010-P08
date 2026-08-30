'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  Download,
  GraduationCap,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStudents, getCases, getStudentWithDetails } from '@/lib/data-service';
import { generateStudentResultPDF } from '@/lib/pdf/generateResultPDF';

export default function StudentsManagementPage() {
  const [selectedCase, setSelectedCase] = useState<string>('PUB-01');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedOptional, setSelectedOptional] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'gpa' | 'status'>('gpa');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);

  const cases = useMemo(() => getCases(), []);
  const allStudents = useMemo(
    () => getStudents(selectedCase === 'ALL' ? undefined : selectedCase),
    [selectedCase]
  );

  // Filter students
  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesId = s.student_code.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }
      // Class
      if (selectedClass !== 'ALL' && s.class_name !== selectedClass) return false;
      // Status
      if (selectedStatus === 'PASSED' && !s.passed) return false;
      if (selectedStatus === 'FAILED' && s.passed) return false;
      // Optional
      if (selectedOptional !== 'ALL' && s.optional_subject_code !== selectedOptional)
        return false;

      return true;
    });
  }, [allStudents, searchQuery, selectedClass, selectedStatus, selectedOptional]);

  // Sort students
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'gpa') comparison = a.gpa - b.gpa;
      else if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'id') comparison = a.student_code.localeCompare(b.student_code);
      else if (sortBy === 'status') comparison = Number(a.passed) - Number(b.passed);

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [filteredStudents, sortBy, sortOrder]);

  const handleOpenStudentDetail = (caseCode: string, studentCode: string) => {
    const details = getStudentWithDetails(caseCode, studentCode);
    setSelectedStudent(details);
    setDetailModalOpen(true);
  };

  const handleDownloadPDF = async () => {
    if (!selectedStudent || !selectedStudent.calculated) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const verificationUrl = `${origin}/verify/${selectedStudent.result?.verification_token || 'demo'}`;
    await generateStudentResultPDF(selectedStudent.student, selectedStudent.calculated, verificationUrl);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Candidate Records</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, and inspect calculated results, subject marks, and deterministic traces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs py-1 px-2.5">
            Showing <span className="font-bold text-foreground mx-1">{sortedStudents.length}</span> of {allStudents.length} Candidates
          </Badge>
        </div>
      </div>

      {/* Filter Controls Card */}
      <Card className="border-border/60">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Box */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID (e.g. S001) or student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card"
              />
            </div>

            {/* Case Selector */}
            <div>
              <Select value={selectedCase} onValueChange={(val) => { if (val) setSelectedCase(val); }}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Cases (25)</SelectItem>
                  {cases.map((c) => (
                    <SelectItem key={c.case_code} value={c.case_code}>
                      {c.case_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Selector */}
            <div>
              <Select value={selectedClass} onValueChange={(val) => { if (val) setSelectedClass(val); }}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Classes</SelectItem>
                  <SelectItem value="Class 9">Class 9</SelectItem>
                  <SelectItem value="Class 10">Class 10</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Select value={selectedStatus} onValueChange={(val) => { if (val) setSelectedStatus(val); }}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Result Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Results</SelectItem>
                  <SelectItem value="PASSED">Passed Only</SelectItem>
                  <SelectItem value="FAILED">Failed / Absent Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead
                    className="cursor-pointer hover:text-foreground font-semibold"
                    onClick={() => {
                      if (sortBy === 'id') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('id');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Student ID <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-foreground font-semibold"
                    onClick={() => {
                      if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('name');
                        setSortOrder('asc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Candidate Name <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">Case</TableHead>
                  <TableHead className="font-semibold">Class</TableHead>
                  <TableHead className="font-semibold">4th Subject</TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-foreground font-semibold text-right"
                    onClick={() => {
                      if (sortBy === 'gpa') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortBy('gpa');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      GPA <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-center">Grade</TableHead>
                  <TableHead className="font-semibold text-center">Outcome</TableHead>
                  <TableHead className="font-semibold text-center">Issues</TableHead>
                  <TableHead className="font-semibold text-right pr-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                      No candidates match your search and filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedStudents.map((s) => (
                    <TableRow key={`${s.case_code}_${s.student_code}`} className="border-border/40 hover:bg-muted/40">
                      <TableCell className="font-mono font-medium text-foreground">
                        {s.student_code}
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] font-mono">
                          {s.case_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{s.class_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[11px]">
                          {s.optional_subject_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-sm">
                        {s.gpa.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs ${
                            s.letter_grade === 'A+'
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : s.letter_grade === 'F'
                              ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                              : 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                          }`}
                        >
                          {s.letter_grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {s.passed ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] py-0">
                            Passed
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] py-0">
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {s.has_issues ? (
                          <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px]">
                            <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                            {s.issues_count}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs hover:text-accent"
                          onClick={() => handleOpenStudentDetail(s.case_code, s.student_code)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect Trace
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Student Detail & Trace Modal */}
      {selectedStudent && (
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <span>{selectedStudent.student.name}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {selectedStudent.student.student_code}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedStudent.student.class_name} • Academic Case:{' '}
                    <span className="font-medium text-foreground">{selectedStudent.student.case_code}</span> • 4th
                    Subject: <span className="font-medium text-foreground">{selectedStudent.student.optional_subject_name}</span>
                  </DialogDescription>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-accent">
                    GPA {selectedStudent.calculated?.gpa.toFixed(2)}
                  </div>
                  <Badge
                    variant="outline"
                    className={`font-mono text-xs ${
                      selectedStudent.calculated?.passed
                        ? 'border-emerald-500 text-emerald-400'
                        : 'border-rose-500 text-rose-400'
                    }`}
                  >
                    Grade {selectedStudent.calculated?.letterGrade} (
                    {selectedStudent.calculated?.passed ? 'PASSED' : 'FAILED'})
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="subjects" className="mt-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="subjects">Subject Results ({selectedStudent.subjects.length})</TabsTrigger>
                <TabsTrigger value="trace">“Why this Result?” Trace</TabsTrigger>
              </TabsList>

              {/* Subjects Table Tab */}
              <TabsContent value="subjects" className="space-y-4 pt-3">
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="text-xs">Subject</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs text-right">Theory</TableHead>
                        <TableHead className="text-xs text-right">Practical</TableHead>
                        <TableHead className="text-xs text-right font-bold">Total</TableHead>
                        <TableHead className="text-xs text-center">GP</TableHead>
                        <TableHead className="text-xs text-center">Grade</TableHead>
                        <TableHead className="text-xs text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStudent.subjects.map((subj: any) => (
                        <TableRow key={subj.subject_code} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-xs">
                            {subj.subject_name} ({subj.subject_code})
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {subj.is_compulsory ? 'Compulsory' : 'Optional (4th)'}
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">
                            {subj.is_absent ? 'AB' : subj.theory_marks ?? '—'}
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">
                            {subj.is_absent ? 'AB' : subj.practical_marks ?? '—'}
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono font-bold">
                            {subj.is_absent ? 'AB' : subj.total_marks}
                          </TableCell>
                          <TableCell className="text-xs text-center font-mono font-semibold">
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

                {/* Failure or Warning Notes */}
                {selectedStudent.calculated?.trace.failureReasons.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Failure Reason(s):
                    </p>
                    {selectedStudent.calculated.trace.failureReasons.map((r: string, idx: number) => (
                      <p key={idx} className="ml-5 list-disc">
                        • {r}
                      </p>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Trace Tab */}
              <TabsContent value="trace" className="space-y-4 pt-3">
                <div className="p-4 rounded-lg bg-card/60 border border-border/60 space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-muted-foreground font-sans uppercase font-bold text-[10px]">
                      1. Compulsory Subjects Grade Point Sum
                    </span>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      Sum = {selectedStudent.calculated?.compulsoryGradePointSum.toFixed(2)} (from 6 compulsory subjects)
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-sans uppercase font-bold text-[10px]">
                      2. 4th Optional Subject Contribution Formula
                    </span>
                    <p className="mt-1 text-sm text-foreground">
                      Optional GP = {selectedStudent.calculated?.optionalGradePoint.toFixed(2)}
                      <br />
                      Contribution = max(0, {selectedStudent.calculated?.optionalGradePoint.toFixed(2)} - 2.00) ={' '}
                      <span className="text-accent font-bold">
                        +{selectedStudent.calculated?.optionalContribution.toFixed(2)}
                      </span>
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-sans uppercase font-bold text-[10px]">
                      3. Composite Total & GPA Divisor
                    </span>
                    <p className="mt-1 text-sm text-foreground">
                      Total GP = {selectedStudent.calculated?.compulsoryGradePointSum.toFixed(2)} +{' '}
                      {selectedStudent.calculated?.optionalContribution.toFixed(2)} ={' '}
                      <span className="font-bold">{selectedStudent.calculated?.totalGradePointSum.toFixed(2)}</span>
                      <br />
                      GPA = {selectedStudent.calculated?.totalGradePointSum.toFixed(2)} / 6 ={' '}
                      <span className="text-accent font-bold text-base">
                        {selectedStudent.calculated?.gpa.toFixed(2)}
                      </span>
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-sans uppercase font-bold text-[10px]">
                      4. Verification & Audit Trail
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Engine Version: {selectedStudent.calculated?.trace.calculationVersion} • Rule Set: Bangladesh SSC Standard (P08)
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <Link href={`/results/${selectedStudent.student.case_code}/${selectedStudent.student.student_code}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Eye className="w-3.5 h-3.5" />
                  View Public Page
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" className="gap-1.5 text-xs" onClick={handleDownloadPDF}>
                  <Download className="w-3.5 h-3.5" />
                  Download Official Transcript PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
