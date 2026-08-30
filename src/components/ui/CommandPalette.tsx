'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  ClipboardCheck,
  BarChart3,
  Upload,
  Scale,
  FileText,
  Settings,
  Search,
  CheckCircle,
  Eye,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Menu</DialogTitle>
        </DialogHeader>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput placeholder="Type a command or search students, pages, actions..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem
                onSelect={() => runCommand(() => router.push('/admin/dashboard'))}
              >
                <LayoutDashboard className="mr-2 h-4 w-4 text-accent" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/admin/students'))}
              >
                <Users className="mr-2 h-4 w-4 text-accent" />
                <span>Students</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/admin/marks'))}
              >
                <BookOpen className="mr-2 h-4 w-4 text-accent" />
                <span>Marks Management</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/admin/results'))}
              >
                <Award className="mr-2 h-4 w-4 text-accent" />
                <span>Results & Publishing</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/admin/checking'))}
              >
                <ClipboardCheck className="mr-2 h-4 w-4 text-accent" />
                <span>Checking Center</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/admin/analytics'))}
              >
                <BarChart3 className="mr-2 h-4 w-4 text-accent" />
                <span>Analytics & Insights</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/admin/import'))}
              >
                <Upload className="mr-2 h-4 w-4 text-accent" />
                <span>Import Dataset</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/admin/rules'))}
              >
                <Scale className="mr-2 h-4 w-4 text-accent" />
                <span>Grading Rules</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/admin/audit'))}
              >
                <FileText className="mr-2 h-4 w-4 text-accent" />
                <span>Audit Trail</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/admin/settings'))}
              >
                <Settings className="mr-2 h-4 w-4 text-accent" />
                <span>Platform Settings</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Public & Judge Demo">
              <CommandItem
                onSelect={() => runCommand(() => router.push('/demo'))}
              >
                <Eye className="mr-2 h-4 w-4 text-emerald-400" />
                <span>Launch Judge Interactive Demo</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/results'))}
              >
                <Search className="mr-2 h-4 w-4 text-blue-400" />
                <span>Public Result Search</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => router.push('/results/PUB-01/S001'))}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-emerald-400" />
                <span>View Sample Result (S001 — Kamal Begum)</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
