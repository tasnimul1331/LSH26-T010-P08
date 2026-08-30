'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  History,
  FileCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { getStudents, getStudentWithDetails, updateMark, getCases } from '@/lib/data-service';

export default function MarksManagementPage() {
  const [selectedCase, setSelectedCase] = useState<string>('PUB-01');
  const [selectedStudentCode, setSelectedStudentCode] = useState<string>('S001');
  const [reason, setReason] = useState<string>('Routine teacher verification adjustment');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [recalcResult, setRecalcResult] = useState<any>(null);

  const cases = useMemo(() => getCases(), []);
  const studentsInCase = useMemo(() => getStudents(selectedCase), [selectedCase]);

  // Current student details
  const studentDetails = useMemo(
    () => getStudentWithDetails(selectedCase, selectedStudentCode),
    [selectedCase, selectedStudentCode, recalcResult]
  );

  // Editable marks state
  const [editableMarks, setEditableMarks] = useState<
    Record<
      string,
      { theory: number | null; practical: number | null; isAbsent: boolean }
    >
  >({});

  // Sync editable marks when student changes
  useMemo(() => {
    if (studentDetails) {
      const initial: typeof editableMarks = {};
      studentDetails.subjects.forEach((s: any) => {
        initial[s.subject_code] = {
          theory: s.theory_marks,
          practical: s.practical_marks,
          isAbsent: s.is_absent,
        };
      });
      setEditableMarks(initial);
      setRecalcResult(null);
    }
  }, [studentDetails?.student.student_code, studentDetails?.student.case_code]);

  const handleMarkChange = (
    subjectCode: string,
    field: 'theory' | 'practical',
    val: string
  ) => {
    const num = val === '' ? null : Math.max(0, Number(val));
    setEditableMarks((prev) => ({
      ...prev,
      [subjectCode]: {
        ...prev[subjectCode],
        [field]: num,
        isAbsent: false,
      },
    }));
  };

  const handleToggleAbsent = (subjectCode: string) => {
    setEditableMarks((prev) => {
      const current = prev[subjectCode];
      const newAbsent = !current.isAbsent;
      return {
        ...prev,
        [subjectCode]: {
          ...current,
          isAbsent: newAbsent,
          theory: newAbsent ? null : current.theory ?? 50,
          practical: newAbsent ? null : current.practical ?? 15,
        },
      };
    });
  };

  const handleSaveCorrection = (subjectCode: string) => {
    if (!reason.trim()) {
      alert('Please provide a reason for the mark change to maintain audit integrity.');
      return;
    }

    const current = editableMarks[subjectCode];
    if (!current) return;

    setIsSaving(true);
    const res = updateMark({
      caseCode: selectedCase,
      studentCode: selectedStudentCode,
      subjectCode,
      theoryMarks: current.theory,
      practicalMarks: current.practical,
      isAbsent: current.isAbsent,
      reason,
      updatedBy: 'Admin (Teacher In-Charge)',
    });

    if (res.success) {
      setRecalcResult(res);
    } else {
      alert(res.error || 'Failed to update mark');
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Marks Management & Recalculation</h1>
          <p className="text-sm text-muted-foreground">
            Adjust candidate marks with live recalculation, deterministic trace generation, and auditable logging.
          </p>
        </div>
      </div>

      {/* Selectors Bar */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Academic Case</Label>
              <Select
                value={selectedCase}
                onValueChange={(val) => {
                  if (val) {
                    setSelectedCase(val);
                    setSelectedStudentCode('S001');
                  }
                }}
              >
                <SelectTrigger className="bg-card mt-1">
                  <SelectValue placeholder="Select Case" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.case_code} value={c.case_code}>
                      {c.case_code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Select Candidate</Label>
              <Select
                value={selectedStudentCode}
                onValueChange={(val) => {
                  if (val) setSelectedStudentCode(val);
                }}
              >
                <SelectTrigger className="bg-card mt-1">
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {studentsInCase.map((s) => (
                    <SelectItem key={s.student_code} value={s.student_code}>
                      {s.student_code} — {s.name} (GPA {s.gpa.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Reason for Correction (Audit Logged)</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Scrutiny board mark adjustment"
                className="bg-card mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Overview & Recalculation Impact Banner */}
      {studentDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidate Card */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{studentDetails.student.name}</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {studentDetails.student.student_code}
                </Badge>
              </CardTitle>
              <CardDescription>
                {studentDetails.student.class_name} • Case: {studentDetails.student.case_code}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-card/60 border border-border/50">
                <div>
                  <span className="text-xs text-muted-foreground">Composite GPA</span>
                  <div className="text-2xl font-bold font-mono text-accent">
                    {studentDetails.calculated?.gpa.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Grade & Result</span>
                  <div>
                    <Badge
                      variant="outline"
                      className={`font-mono text-xs ${
                        studentDetails.calculated?.passed
                          ? 'border-emerald-500/40 text-emerald-400'
                          : 'border-rose-500/40 text-rose-400'
                      }`}
                    >
                      {studentDetails.calculated?.letterGrade} (
                      {studentDetails.calculated?.passed ? 'PASSED' : 'FAILED'})
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Recalculation Flash alert if changed */}
              <AnimatePresence>
                {recalcResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1.5"
                  >
                    <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Deterministic Recalculation Applied!
                    </p>
                    <div className="text-muted-foreground flex items-center justify-between">
                      <span>GPA Shift:</span>
                      <span className="font-mono font-bold text-foreground">
                        {recalcResult.oldGpa?.toFixed(2)} → {recalcResult.newGpa?.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center justify-between">
                      <span>Letter Grade:</span>
                      <span className="font-mono font-bold text-foreground">
                        {recalcResult.oldGrade} → {recalcResult.newGrade}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Marks Editor Table */}
          <Card className="lg:col-span-2 border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Subject Marks Breakdown & Editor</CardTitle>
              <CardDescription>
                Edit marks and click &quot;Save & Recalculate&quot; to apply changes deterministically.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60">
                      <TableHead className="text-xs">Subject</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Theory</TableHead>
                      <TableHead className="text-xs">Practical</TableHead>
                      <TableHead className="text-xs text-center">Absent?</TableHead>
                      <TableHead className="text-xs text-center">GP</TableHead>
                      <TableHead className="text-xs text-right pr-4">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentDetails.subjects.map((subj: any) => {
                      const edit = editableMarks[subj.subject_code] || {
                        theory: subj.theory_marks,
                        practical: subj.practical_marks,
                        isAbsent: subj.is_absent,
                      };

                      return (
                        <TableRow key={subj.subject_code} className="border-border/40 hover:bg-muted/30">
                          <TableCell className="font-medium text-xs">
                            {subj.subject_name}
                            <span className="ml-1 text-muted-foreground font-mono text-[10px]">
                              ({subj.subject_code})
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {subj.is_compulsory ? (
                              <Badge variant="outline" className="text-[10px]">Compulsory</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">Optional (4th)</Badge>
                            )}
                          </TableCell>
                          {/* Theory Input */}
                          <TableCell>
                            {edit.isAbsent ? (
                              <span className="text-xs text-rose-400 font-bold">AB</span>
                            ) : (
                              <Input
                                type="number"
                                min={0}
                                max={subj.theory_max || 100}
                                value={edit.theory ?? ''}
                                onChange={(e) =>
                                  handleMarkChange(subj.subject_code, 'theory', e.target.value)
                                }
                                className="h-8 w-20 text-xs font-mono bg-card"
                              />
                            )}
                          </TableCell>
                          {/* Practical Input */}
                          <TableCell>
                            {subj.has_practical ? (
                              edit.isAbsent ? (
                                <span className="text-xs text-rose-400 font-bold">AB</span>
                              ) : (
                                <Input
                                  type="number"
                                  min={0}
                                  max={subj.practical_max || 25}
                                  value={edit.practical ?? ''}
                                  onChange={(e) =>
                                    handleMarkChange(subj.subject_code, 'practical', e.target.value)
                                  }
                                  className="h-8 w-16 text-xs font-mono bg-card"
                                />
                              )
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          {/* Absent Toggle */}
                          <TableCell className="text-center">
                            <Button
                              variant={edit.isAbsent ? 'destructive' : 'outline'}
                              size="sm"
                              className="h-7 text-[10px] px-2"
                              onClick={() => handleToggleAbsent(subj.subject_code)}
                            >
                              {edit.isAbsent ? 'ABSENT' : 'Present'}
                            </Button>
                          </TableCell>
                          {/* Grade Point */}
                          <TableCell className="text-center font-mono font-bold text-xs">
                            {subj.grade_point.toFixed(2)}
                          </TableCell>
                          {/* Action Button */}
                          <TableCell className="text-right pr-4">
                            <Button
                              size="sm"
                              className="h-7 text-xs gradient-bg-accent border-0 text-white gap-1"
                              disabled={isSaving}
                              onClick={() => handleSaveCorrection(subj.subject_code)}
                            >
                              <Save className="w-3 h-3" />
                              Save & Recalc
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
