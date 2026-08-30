'use client';

import { useState, useMemo } from 'react';
import {
  Scale,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { getGradingRules, updateGradingRule, getCases } from '@/lib/data-service';
import { DEFAULT_GRADE_BANDS } from '@/lib/result-engine';

export default function GradingRulesPage() {
  const [selectedCase, setSelectedCase] = useState<string>('PUB-01');
  const [totalPassMark, setTotalPassMark] = useState<number>(33);
  const [theoryPassMark, setTheoryPassMark] = useState<string>('');
  const [practicalPassMark, setPracticalPassMark] = useState<string>('');
  const [optionalBase, setOptionalBase] = useState<number>(2.0);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const cases = useMemo(() => getCases(), []);
  const activeRules = useMemo(() => getGradingRules(selectedCase), [selectedCase]);

  const handleSaveRule = () => {
    const rule = activeRules[0];
    if (!rule) return;

    updateGradingRule({
      ruleId: rule.id,
      totalPassMark,
      theoryPassMark: theoryPassMark === '' ? undefined : Number(theoryPassMark),
      practicalPassMark: practicalPassMark === '' ? undefined : Number(practicalPassMark),
      user: 'Super Administrator',
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Authoritative Grading Rules & Policy</h1>
          <p className="text-sm text-muted-foreground">
            Configure marks-to-grade bands, component pass thresholds, and 4th subject formula weights.
          </p>
        </div>

        <div className="w-52">
          <Select value={selectedCase} onValueChange={(val) => { if (val) setSelectedCase(val); }}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Cohort" />
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
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Grading rules successfully saved & audit logged.
        </div>
      )}

      {/* Critical Policy Note */}
      <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/30 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Info className="w-4 h-4 text-accent" />
          Data-Driven Rule Authority
        </div>
        <p>
          The deterministic calculation engine does not invent grading policy. All grade point conversions and GPA formulas are consumed dynamically from this rule configuration for cohort <strong className="text-foreground">{selectedCase}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pass Thresholds Card */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Subject Pass Thresholds</CardTitle>
            <CardDescription>Minimum marks required to pass individual subjects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Subject Total Pass Mark (out of 100)</Label>
              <Input
                type="number"
                value={totalPassMark}
                onChange={(e) => setTotalPassMark(Number(e.target.value))}
                className="mt-1 font-mono bg-card"
              />
              <span className="text-[11px] text-muted-foreground">Standard SSC baseline is 33 marks.</span>
            </div>

            <div>
              <Label className="text-xs">Theory Component Pass Mark (out of 75)</Label>
              <Input
                type="number"
                placeholder="Not enforced (Leave blank)"
                value={theoryPassMark}
                onChange={(e) => setTheoryPassMark(e.target.value)}
                className="mt-1 font-mono bg-card"
              />
              <span className="text-[11px] text-muted-foreground">Optional component threshold.</span>
            </div>

            <div>
              <Label className="text-xs">Practical Component Pass Mark (out of 25)</Label>
              <Input
                type="number"
                placeholder="Not enforced (Leave blank)"
                value={practicalPassMark}
                onChange={(e) => setPracticalPassMark(e.target.value)}
                className="mt-1 font-mono bg-card"
              />
              <span className="text-[11px] text-muted-foreground">Optional component threshold.</span>
            </div>

            <div>
              <Label className="text-xs">4th Subject Contribution Base GP</Label>
              <Input
                type="number"
                step={0.1}
                value={optionalBase}
                onChange={(e) => setOptionalBase(Number(e.target.value))}
                className="mt-1 font-mono bg-card"
              />
              <span className="text-[11px] text-muted-foreground">Points above this are added: max(0, GP - Base).</span>
            </div>

            <Button onClick={handleSaveRule} className="w-full gradient-bg-accent border-0 text-white gap-2 mt-2">
              <Save className="w-4 h-4" />
              Save Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Grade Bands Table */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Bangladesh SSC Standard Grade Scale</span>
              <Badge variant="outline" className="border-accent/40 text-accent">Active Rule Set</Badge>
            </CardTitle>
            <CardDescription>Mark range mapping to Grade Points (GP) and Letter Grades.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="text-xs">Marks Range</TableHead>
                  <TableHead className="text-xs text-center">Letter Grade</TableHead>
                  <TableHead className="text-xs text-center">Grade Point</TableHead>
                  <TableHead className="text-xs">Classification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEFAULT_GRADE_BANDS.map((band) => (
                  <TableRow key={band.letter_grade} className="border-border/40 hover:bg-muted/30">
                    <TableCell className="font-mono text-xs font-medium">
                      {band.min_mark} – {band.max_mark}
                    </TableCell>
                    <TableCell className="text-center font-bold font-mono text-xs">
                      <span
                        className={
                          band.letter_grade === 'A+'
                            ? 'text-emerald-400'
                            : band.letter_grade === 'F'
                            ? 'text-rose-400'
                            : 'text-foreground'
                        }
                      >
                        {band.letter_grade}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-xs text-accent">
                      {band.grade_point.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {band.grade_point === 5.0
                        ? 'Outstanding / Distinction'
                        : band.grade_point >= 4.0
                        ? 'Excellent'
                        : band.grade_point >= 3.5
                        ? 'Very Good'
                        : band.grade_point >= 3.0
                        ? 'Good'
                        : band.grade_point >= 2.0
                        ? 'Satisfactory'
                        : band.grade_point >= 1.0
                        ? 'Pass'
                        : 'Fail (Compulsory consequence)'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
