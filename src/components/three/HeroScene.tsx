'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingEquation {
  id: string;
  text: string;
  subtext?: string;
  x: number; // percentage
  y: number; // percentage
  size: 'sm' | 'md' | 'lg';
  theme: 'gold' | 'sapphire' | 'emerald' | 'amber';
  delay: number;
  duration: number;
  rotate: number;
}

const equations: FloatingEquation[] = [
  {
    id: 'eq-1',
    text: 'GPA = min(5.00, (Σ GP + ΔGP₄ₜₕ) / 6)',
    subtext: 'Official Composite Formula',
    x: 10,
    y: 18,
    size: 'lg',
    theme: 'gold',
    delay: 0,
    duration: 8,
    rotate: -2,
  },
  {
    id: 'eq-2',
    text: 'ΔGP₄ₜₕ = max(0, GP - 2.00)',
    subtext: '4th Optional Subject Excess',
    x: 68,
    y: 16,
    size: 'lg',
    theme: 'sapphire',
    delay: 1.5,
    duration: 9,
    rotate: 2,
  },
  {
    id: 'eq-3',
    text: 'Theory₇₅ + Practical₂₅ = Total₁₀₀',
    subtext: 'Component Weighting',
    x: 8,
    y: 72,
    size: 'md',
    theme: 'emerald',
    delay: 2,
    duration: 7.5,
    rotate: 3,
  },
  {
    id: 'eq-4',
    text: 'Σᵢ₌₁⁶ GPᵢ = Compulsory Sum',
    subtext: '6 Mandatory Subjects',
    x: 72,
    y: 68,
    size: 'md',
    theme: 'gold',
    delay: 0.8,
    duration: 8.5,
    rotate: -3,
  },
  {
    id: 'eq-5',
    text: '80–100 → A⁺ (GP 5.00)',
    subtext: 'Distinction Band',
    x: 22,
    y: 46,
    size: 'sm',
    theme: 'amber',
    delay: 3,
    duration: 6.5,
    rotate: -1,
  },
  {
    id: 'eq-6',
    text: 'σ = √[ 1/N Σ (xᵢ - μ)² ]',
    subtext: 'Standard Deviation Metric',
    x: 64,
    y: 44,
    size: 'sm',
    theme: 'sapphire',
    delay: 2.2,
    duration: 7,
    rotate: 1,
  },
  {
    id: 'eq-7',
    text: '∀c ∈ Compulsory: Grade(c) ≠ F',
    subtext: 'Pass Constraint Theorem',
    x: 40,
    y: 84,
    size: 'sm',
    theme: 'gold',
    delay: 1.2,
    duration: 9.5,
    rotate: 0,
  },
];

const mathSymbols = [
  { symbol: '∑', x: 5, y: 35, size: 'text-3xl sm:text-4xl', color: 'text-amber-500/35', delay: 0 },
  { symbol: '∫', x: 92, y: 30, size: 'text-4xl sm:text-5xl', color: 'text-blue-600/30', delay: 1 },
  { symbol: 'π', x: 18, y: 88, size: 'text-3xl sm:text-4xl', color: 'text-amber-600/30', delay: 2 },
  { symbol: 'λ', x: 88, y: 82, size: 'text-2xl sm:text-3xl', color: 'text-emerald-600/30', delay: 1.5 },
  { symbol: 'Δ', x: 84, y: 55, size: 'text-3xl sm:text-4xl', color: 'text-amber-500/35', delay: 0.5 },
  { symbol: '√', x: 14, y: 60, size: 'text-3xl sm:text-4xl', color: 'text-blue-500/30', delay: 2.5 },
  { symbol: 'μ', x: 52, y: 12, size: 'text-2xl sm:text-3xl', color: 'text-amber-600/30', delay: 1.8 },
  { symbol: 'Ω', x: 34, y: 22, size: 'text-2xl sm:text-3xl', color: 'text-emerald-500/30', delay: 3 },
  { symbol: '∞', x: 48, y: 92, size: 'text-3xl sm:text-4xl', color: 'text-amber-600/35', delay: 0.7 },
];

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 650;
    };
    window.addEventListener('resize', handleResize);

    // Create pleasant mathematical constellation particles
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.5 + 1.2,
      color: Math.random() > 0.5 ? 'rgba(197, 155, 39, ' : 'rgba(30, 58, 138, ',
      alpha: Math.random() * 0.4 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect nearby particles with delicate golden/sapphire constellation lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(184, 134, 11, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update glowing particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowColor = 'rgba(217, 119, 6, 0.4)';
        ctx.shadowBlur = 6;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden pointer-events-none select-none">
      {/* Background Soft Interactive Constellation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 opacity-80" />

      {/* Floating Mathematical Symbols */}
      {mathSymbols.map((item, idx) => (
        <motion.div
          key={idx}
          className={`absolute font-serif font-bold ${item.size} ${item.color} z-0 select-none`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, 8, -8, 0],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: 7 + idx,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: item.delay,
          }}
        >
          {item.symbol}
        </motion.div>
      ))}

      {/* Pleasant Floating Scientific & Mathematical Formula Cards */}
      {equations.map((eq) => {
        const themeStyles =
          eq.theme === 'gold'
            ? 'bg-white/95 border-amber-300/80 text-amber-950 shadow-amber-500/10'
            : eq.theme === 'sapphire'
            ? 'bg-white/95 border-blue-300/80 text-blue-950 shadow-blue-500/10'
            : eq.theme === 'emerald'
            ? 'bg-white/95 border-emerald-300/80 text-emerald-950 shadow-emerald-500/10'
            : 'bg-white/95 border-orange-300/80 text-orange-950 shadow-orange-500/10';

        const dotColor =
          eq.theme === 'gold'
            ? 'bg-amber-500'
            : eq.theme === 'sapphire'
            ? 'bg-blue-600'
            : eq.theme === 'emerald'
            ? 'bg-emerald-600'
            : 'bg-orange-500';

        return (
          <motion.div
            key={eq.id}
            className={`hidden md:flex absolute flex-col items-start px-3.5 py-2 rounded-xl border backdrop-blur-md shadow-lg transition-transform ${themeStyles} z-10`}
            style={{
              left: `${eq.x}%`,
              top: `${eq.y}%`,
              transform: `rotate(${eq.rotate}deg)`,
            }}
            animate={{
              y: [0, -14, 0],
              x: [0, 6, 0],
              rotate: [eq.rotate, eq.rotate + 3, eq.rotate],
            }}
            transition={{
              duration: eq.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: eq.delay,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
              <span className="font-mono font-bold text-xs sm:text-sm tracking-tight">
                {eq.text}
              </span>
            </div>
            {eq.subtext && (
              <span className="text-[10px] text-muted-foreground font-medium pl-3.5">
                {eq.subtext}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
