'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  Activity,
  Code,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { getAuditLogs } from '@/lib/data-service';

export default function AuditTrailPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const logs = useMemo(() => getAuditLogs(), []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.entity_type.toLowerCase().includes(q) ||
          log.entity_id.toLowerCase().includes(q) ||
          log.user_id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, actionFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Audit Trail & Accountability Logs</h1>
          <p className="text-sm text-muted-foreground">
            Immutable log of mark adjustments, status updates, rule modifications, and checking resolutions.
          </p>
        </div>

        <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs py-1">
          <Shield className="w-3.5 h-3.5 mr-1" />
          {logs.length} Total Audit Records
        </Badge>
      </div>

      {/* Filter Row */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search audit trail by user, action, or entity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card"
              />
            </div>

            <div>
              <Select value={actionFilter} onValueChange={(val) => { if (val) setActionFilter(val); }}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="MARK_CORRECTION_AND_RECALCULATION">Mark Corrections</SelectItem>
                  <SelectItem value="CHECKING_ITEM_RESOLVED">Issue Resolutions</SelectItem>
                  <SelectItem value="STATUS_CHANGED_TO_PUBLISHED">Publications</SelectItem>
                  <SelectItem value="GRADING_RULE_UPDATED">Rule Changes</SelectItem>
                  <SelectItem value="DATASET_IMPORTED_AND_CALCULATED">Dataset Imports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="text-xs">Action Type</TableHead>
                  <TableHead className="text-xs">Authorized Actor</TableHead>
                  <TableHead className="text-xs">Target Entity</TableHead>
                  <TableHead className="text-xs">State Mutation Diff</TableHead>
                  <TableHead className="text-xs">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No audit events matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-border/40 hover:bg-muted/30">
                      <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-accent" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] border-accent/40 text-accent bg-accent/5"
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          {log.user_id}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {log.entity_type}: <span className="text-foreground">{log.entity_id}</span>
                      </TableCell>
                      <TableCell className="text-xs font-mono max-w-xs">
                        <div className="p-2 rounded bg-card border border-border/40 text-[11px] overflow-x-auto">
                          {log.old_value && (
                            <div className="text-rose-400">
                              - OLD: {JSON.stringify(log.old_value)}
                            </div>
                          )}
                          {log.new_value && (
                            <div className="text-emerald-400">
                              + NEW: {JSON.stringify(log.new_value)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {log.ip_address || '127.0.0.1'}
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
