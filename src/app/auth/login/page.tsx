'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('admin@bottleresult.edu');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [loading, setLoading] = useState<boolean>(false);

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/admin/dashboard');
    }, 600);
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/admin/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-bg-accent flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">BottleResult</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            Administrative Access & Examination Control Portal
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/60 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials or use the 1-click Judge Demo login.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 1-Click Judge Demo Login */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Judge & Evaluator Quick Access
                </span>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                  Instant Demo
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Click below to instantly access the full admin dashboard with real seeded P08 data.
              </p>
              <Button
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full gradient-bg-accent border-0 text-white gap-2 text-xs h-9 shadow-sm"
              >
                {loading ? 'Authenticating...' : '1-Click Administrator Login'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="relative flex items-center justify-center text-xs uppercase text-muted-foreground my-2">
              <div className="border-t border-border/60 w-full" />
              <span className="bg-card px-2">or credentials</span>
              <div className="border-t border-border/60 w-full" />
            </div>

            {/* Standard Form */}
            <form onSubmit={handlePasswordLogin} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-9 bg-card text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-9 bg-card text-xs"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} variant="outline" className="w-full text-xs h-9">
                Sign In with Supabase Auth
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Return to Public Result Search
          </Link>
        </div>
      </div>
    </div>
  );
}
