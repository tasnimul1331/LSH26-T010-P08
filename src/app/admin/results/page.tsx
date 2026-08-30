'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Globe,
  Lock,
  QrCode,
  ArrowUpRight,
  Send,
  AlertTriangle,
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
import { getStudents, getCases, updatePublishStatus, getCheckingItems } from '@/lib/data-service';

export default function ResultsPublishingPage() {
  const [selectedCase, setSelectedCase] = useState<string>('PUB-01');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const cases = useMemo(() => getCases(), []);
  const allStudents = useMemo(
    () => getStudents(selectedCase === 'ALL' ? undefined : selectedCase),
    [selectedCase, actionMessage]
  );
  const unresolvedIssues = useMemo(
    () =>
      getCheckingItems(
        selectedCase === 'ALL'
          ? { resolved: false }
          : { caseCode: selectedCase, resolved: false }
      ),
    [selectedCase, actionMessage]
  );

  const criticalIssuesCount = unresolvedIssues.filter((i) => i.severity === 'CRITICAL').length;

  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.student_code.toLowerCase().includes(q))
          return false;
      }
      if (statusFilter !== 'ALL' && s.result_status !== statusFilter) return false;
      return true;
    });
  }, [allStudents, searchQuery, statusFilter]);

  const handleBatchPublish = (status: 'PUBLISHED' | 'VERIFIED' | 'DRAFT') => {
    if (status === 'PUBLISHED' && criticalIssuesCount > 0) {
      const confirmOverride = confirm(
        `Warning: There are ${criticalIssuesCount} unresolved critical checking issues in this case. Do you still wish to proceed with official publication?`
      );
      if (!confirmOverride) return;
    }

    const res = updatePublishStatus({
      caseCode: selectedCase === 'ALL' ? undefined : selectedCase,
      status: status as any,
      user: 'Administrator',
    });

    setActionMessage(`Successfully updated ${res.count} results to ${status}`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Results & Publication Portal</h1>
          <p className="text-sm text-muted-foreground">
            Manage verification tokens, publish official transcripts, and control public availability.
          </p>
        </div>

        {/* Batch Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs"
            onClick={() => handleBatchPublish('DRAFT')}
          >
            <Lock className="w-3.5 h-3.5 mr-1" />
            Unpublish
          </Button>

          <Button
            size="sm"
            className="gradient-bg-accent border-0 text-white text-xs gap-1.5 shadow-md"
            onClick={() => handleBatchPublish('PUBLISHED')}
          >
            <Globe className="w-3.5 h-3.5" />
            Publish All Results
          </Button>
        </div>
      </div>

      {/* Publication Status Banner */}
      {actionMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {actionMessage}
        </div>
      )}

      {/* Critical Issues Warning Banner if any */}
      {criticalIssuesCount > 0 && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>{criticalIssuesCount} Critical Checking Issue(s)</strong> detected in this cohort (compulsory failures/absences). Review in Checking Center before publishing.
            </span>
          </div>
          <Link href="/admin/checking">
            <Button variant="outline" size="sm" className="h-7 text-xs border-amber-500/40 text-amber-300">
              Review Issues
            </Button>
          </Link>
        </div>
      )}

      {/* Filter Row */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search candidate by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card"
              />
            </div>

            <div>
              <Select value={selectedCase} onValueChange={(val) => { if (val) setSelectedCase(val); }}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Academic Case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Cohorts</SelectItem>
                  {cases.map((c) => (
                    <SelectItem key={c.case_code} value={c.case_code}>
                      {c.case_code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={statusFilter} onValueChange={(val) => { if (val) setStatusFilter(val); }}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="CALCULATED">Calculated</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="text-xs">Student ID</TableHead>
                  <TableHead className="text-xs">Candidate Name</TableHead>
                  <TableHead className="text-xs">Case</TableHead>
                  <TableHead className="text-xs">Class</TableHead>
                  <TableHead className="text-xs text-right">Total Marks</TableHead>
                  <TableHead className="text-xs text-right">GPA</TableHead>
                  <TableHead className="text-xs text-center">Grade</TableHead>
                  <TableHead className="text-xs text-center">Lifecycle Status</TableHead>
                  <TableHead className="text-xs">Verification Token</TableHead>
                  <TableHead className="text-xs text-right pr-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                      No result records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((s) => (
                    <TableRow key={`${s.case_code}_${s.student_code}`} className="border-border/40 hover:bg-muted/30">
                      <TableCell className="font-mono font-medium text-xs text-foreground">
                        {s.student_code}
                      </TableCell>
                      <TableCell className="font-medium text-xs">{s.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {s.case_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.class_name}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{s.total_marks}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-bold text-accent">
                        {s.gpa.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center font-bold text-xs">
                        <span className={s.passed ? 'text-emerald-400' : 'text-rose-400'}>
                          {s.letter_grade}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            s.result_status === 'PUBLISHED'
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                          }`}
                        >
                          {s.result_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {s.verification_token ? (
                          <span className="flex items-center gap-1">
                            <QrCode className="w-3 h-3 text-accent" />
                            {s.verification_token}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <Link href={`/results/${s.case_code}/${s.student_code}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 hover:text-accent">
                            <Globe className="w-3 h-3" />
                            Public View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
