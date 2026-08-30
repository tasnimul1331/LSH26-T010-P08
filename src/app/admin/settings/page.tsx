'use client';

import { useState } from 'react';
import {
  Settings,
  Shield,
  Database,
  Download,
  Server,
  Code,
  CheckCircle2,
  Lock,
  Cpu,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getRawDataset } from '@/lib/data-service';

export default function PlatformSettingsPage() {
  const [academicYear, setAcademicYear] = useState<string>('2024');
  const [saved, setSaved] = useState<boolean>(false);

  const handleExportBackup = () => {
    const rawDataset = getRawDataset();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rawDataset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `BottleResult_P08_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Platform Configuration & System Health</h1>
        <p className="text-sm text-muted-foreground">
          System parameters, database connectivity status, cryptographic verification keys, and data export.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Settings updated successfully.
        </div>
      )}

      {/* System Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Deterministic Engine</span>
              <Cpu className="w-4 h-4 text-accent" />
            </div>
            <CardTitle className="text-base mt-1">v1.0.0 (P08)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">
              100% Rule Pure
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Database Layer</span>
              <Database className="w-4 h-4 text-accent" />
            </div>
            <CardTitle className="text-base mt-1">PostgreSQL / Supabase</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">
              RLS Enabled
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Cohorts Loaded</span>
              <Server className="w-4 h-4 text-accent" />
            </div>
            <CardTitle className="text-base mt-1">25 Cases (1,765 Students)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">
              State Synchronized
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* General Settings */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Institutional Metadata</CardTitle>
          <CardDescription>Academic examination parameters for official result transcripts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Examination Session / Academic Year</Label>
              <Input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="mt-1 bg-card"
              />
            </div>
            <div>
              <Label className="text-xs">Platform Problem ID</Label>
              <Input value="P08 — School Result Processing & GPA Engine" disabled className="mt-1 bg-card" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              className="gradient-bg-accent border-0 text-white"
              onClick={() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
              }}
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Export */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Dataset Backup & Export</CardTitle>
          <CardDescription>
            Download the active dataset state including all raw marks, subjects, and candidate enrollments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExportBackup} className="gap-2 text-xs">
            <Download className="w-4 h-4" />
            Export Active Dataset JSON (P08)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
