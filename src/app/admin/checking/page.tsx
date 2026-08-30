'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Check,
  RotateCcw,
  Eye,
  Edit3,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { getCheckingItems, resolveCheckingItem, getCases } from '@/lib/data-service';

export default function CheckingCenterPage() {
  const [selectedCase, setSelectedCase] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [resolvedFilter, setResolvedFilter] = useState<string>('UNRESOLVED');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const cases = useMemo(() => getCases(), []);

  // Raw items from service
  const checkingItems = useMemo(() => {
    return getCheckingItems({
      caseCode: selectedCase === 'ALL' ? undefined : selectedCase,
      type: activeTab === 'ALL' ? undefined : activeTab,
      severity: severityFilter === 'ALL' ? undefined : severityFilter,
      resolved:
        resolvedFilter === 'ALL'
          ? undefined
          : resolvedFilter === 'RESOLVED'
          ? true
          : false,
    });
  }, [selectedCase, activeTab, severityFilter, resolvedFilter, actionNotice]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return checkingItems;
    const q = searchQuery.toLowerCase();
    return checkingItems.filter(
      (i) =>
        i.student_name.toLowerCase().includes(q) ||
        i.student_code.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        (i.subject_name && i.subject_name.toLowerCase().includes(q))
    );
  }, [checkingItems, searchQuery]);

  const handleResolve = (itemId: string) => {
    const res = resolveCheckingItem(itemId, 'Admin Reviewer');
    if (res.success) {
      setActionNotice(`Issue marked as resolved.`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  // Summary counts
  const allUnresolved = useMemo(
    () => getCheckingItems({ resolved: false }),
    [actionNotice]
  );
  const criticalCount = allUnresolved.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = allUnresolved.filter((i) => i.severity === 'HIGH').length;
  const warningCount = allUnresolved.filter((i) => i.severity === 'WARNING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Checking Center & Scrutiny Workspace</h1>
          <p className="text-sm text-muted-foreground">
            Automated scrutiny flagging compulsory failures, practical component issues, absences, and low GP.
          </p>
        </div>

        {/* Badges Summary */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-rose-500/40 text-rose-400 bg-rose-500/10 text-xs py-1">
            {criticalCount} Critical
          </Badge>
          <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-xs py-1">
            {highCount} High Priority
          </Badge>
          <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10 text-xs py-1">
            {warningCount} Warnings
          </Badge>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {actionNotice}
        </div>
      )}

      {/* Tabs Row */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
          <TabsTrigger value="ALL">All Issues</TabsTrigger>
          <TabsTrigger value="COMPULSORY_FAILURE">Compulsory Failures</TabsTrigger>
          <TabsTrigger value="PRACTICAL_FAILURE">Practical Issues</TabsTrigger>
          <TabsTrigger value="ABSENT">Absences</TabsTrigger>
          <TabsTrigger value="OPTIONAL_LOW">Optional Low GP</TabsTrigger>
          <TabsTrigger value="DATA_ERROR">Data Errors</TabsTrigger>
        </TabsList>

        {/* Filter Controls Bar */}
        <Card className="border-border/60 mt-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by student or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card"
                />
              </div>

              <div>
                <Select value={selectedCase} onValueChange={(val) => { if (val) setSelectedCase(val); }}>
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Cohort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Cohorts (25)</SelectItem>
                    {cases.map((c) => (
                      <SelectItem key={c.case_code} value={c.case_code}>
                        {c.case_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={severityFilter} onValueChange={(val) => { if (val) setSeverityFilter(val); }}>
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Severities</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={resolvedFilter} onValueChange={(val) => { if (val) setResolvedFilter(val); }}>
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNRESOLVED">Unresolved Only</SelectItem>
                    <SelectItem value="RESOLVED">Resolved Only</SelectItem>
                    <SelectItem value="ALL">All (History)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues List Table */}
        <Card className="border-border/60 mt-4">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60">
                    <TableHead className="text-xs">Severity</TableHead>
                    <TableHead className="text-xs">Issue Classification</TableHead>
                    <TableHead className="text-xs">Candidate</TableHead>
                    <TableHead className="text-xs">Case / Class</TableHead>
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs">Description & Audit Evidence</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right pr-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                        No checking items match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id} className="border-border/40 hover:bg-muted/30">
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono ${
                              item.severity === 'CRITICAL'
                                ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                                : item.severity === 'HIGH'
                                ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                                : item.severity === 'MEDIUM'
                                ? 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10'
                                : 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                            }`}
                          >
                            {item.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-foreground">
                          {item.type.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-xs text-foreground">{item.student_name}</span>
                          <span className="ml-1 text-muted-foreground font-mono text-[11px]">
                            ({item.student_code})
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <span className="font-mono">{item.case_code}</span> • {item.class_name}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.subject_name ? (
                            <span>
                              {item.subject_name}{' '}
                              <span className="font-mono text-muted-foreground text-[10px]">
                                ({item.subject_code})
                              </span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-md">
                          {item.description}
                        </TableCell>
                        <TableCell>
                          {item.status === 'RESOLVED' || item.resolved ? (
                            <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px]">
                              Resolved
                            </Badge>
                          ) : item.status === 'REVIEWED' ? (
                            <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10 text-[10px]">
                              Reviewed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px]">
                              Open
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status !== 'RESOLVED' && !item.resolved ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-1"
                                onClick={() => handleResolve(item.id)}
                              >
                                <Check className="w-3 h-3" />
                                Resolve
                              </Button>
                            ) : null}
                            <Link href="/admin/marks">
                              <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 hover:text-accent">
                                <Edit3 className="w-3 h-3" />
                                Edit Mark
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
