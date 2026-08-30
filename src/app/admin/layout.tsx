'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BookOpen, Award, ClipboardCheck,
  BarChart3, Upload, Settings, FileText, GraduationCap,
  ChevronLeft, Menu, Search, LogOut, Scale, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CommandPalette } from '@/components/ui/CommandPalette';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Users, label: 'Students', href: '/admin/students' },
  { icon: BookOpen, label: 'Marks', href: '/admin/marks' },
  { icon: Award, label: 'Results', href: '/admin/results' },
  { icon: ClipboardCheck, label: 'Checking Center', href: '/admin/checking' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Upload, label: 'Import', href: '/admin/import' },
  { icon: Scale, label: 'Rules', href: '/admin/rules' },
  { icon: FileText, label: 'Audit Log', href: '/admin/audit' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg gradient-bg-accent flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-3 font-bold text-sidebar-foreground"
            >
              BottleResult
            </motion.span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-sidebar-foreground/60 hover:text-sidebar-foreground h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-sidebar-primary' : ''}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Link href="/demo">
            <Button variant="outline" size="sm" className="w-full justify-start border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-2">
              <Sparkles className="w-4 h-4" />
              {!collapsed && <span className="text-sm font-medium">Judge Demo</span>}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground gap-2">
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="text-sm">Public Portal</span>}
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center px-4 lg:px-6 gap-4 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger>
              <span className="lg:hidden p-2 rounded-md hover:bg-muted inline-flex items-center justify-center cursor-pointer">
                <Menu className="w-5 h-5" />
              </span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0">
              <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
                <div className="w-8 h-8 rounded-lg gradient-bg-accent flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="ml-3 font-bold text-sidebar-foreground">BottleResult</span>
              </div>
              <ScrollArea className="flex-1 py-4">
                <nav className="px-2 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href}>
                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
                        }`}>
                          <item.icon className="w-4.5 h-4.5" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>
              <div className="p-3 border-t border-sidebar-border">
                <Link href="/demo">
                  <Button variant="outline" size="sm" className="w-full justify-start text-emerald-400 gap-2 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Judge Demo</span>
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          {/* Search / Command Palette Trigger */}
          <button
            onClick={() => setCommandOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search...</span>
            <kbd className="ml-8 text-xs bg-background px-1.5 py-0.5 rounded border">⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/demo">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 cursor-pointer hover:bg-emerald-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Demo Mode
              </Badge>
            </Link>
            <Badge variant="outline" className="text-xs">Admin</Badge>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
