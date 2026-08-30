'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingEquation {
  id: string;
  text: string;
  subtext?: string;
  x: number; // percentage
  y: number; // percentage
  theme: 'gold' | 'sapphire' | 'emerald' | 'amber';
  delay: number;
  duration: number;
}

const equations: FloatingEquation[] = [
  {
    id: 'eq-1',
    text: 'GPA = min(5.00, (Σ GP + ΔGP₄ₜₕ) / 6)',
    subtext: 'Official SSC Composite Formula',
    x: 4,
    y: 14,
    theme: 'gold',
    delay: 0.2,
    duration: 5.2,
  },
  {
    id: 'eq-2',
    text: 'ΔGP₄ₜₕ = max(0, GP - 2.00)',
    subtext: '4th Optional Excess GP',
    x: 74,
    y: 14,
    theme: 'sapphire',
    delay: 0.6,
    duration: 5.8,
  },
  {
    id: 'eq-3',
    text: 'Theory₇₅ + Practical₂₅ = Total₁₀₀',
    subtext: 'Component Weighting Matrix',
    x: 4,
    y: 78,
    theme: 'emerald',
    delay: 1.0,
    duration: 4.8,
  },
  {
    id: 'eq-4',
    text: 'Σᵢ₌₁⁶ GPᵢ = Compulsory Sum',
    subtext: '6 Mandatory Academic Subjects',
    x: 74,
    y: 76,
    theme: 'gold',
    delay: 0.4,
    duration: 5.5,
  },
  {
    id: 'eq-5',
    text: '80–100 → A⁺ (GP 5.00)',
    subtext: 'Academic Distinction Band',
    x: 5,
    y: 46,
    theme: 'amber',
    delay: 1.2,
    duration: 4.6,
  },
  {
    id: 'eq-6',
    text: 'σ = √[ 1/N Σ (xᵢ - μ)² ]',
    subtext: 'Variance & Performance Spread',
    x: 75,
    y: 46,
    theme: 'sapphire',
    delay: 0.8,
    duration: 5.0,
  },
];

const mathSymbols = [
  { symbol: '∑', x: 4, y: 32, size: 'text-3xl sm:text-4xl', color: 'text-amber-600/35', delay: 0 },
  { symbol: '∫', x: 94, y: 28, size: 'text-4xl sm:text-5xl', color: 'text-blue-600/30', delay: 0.5 },
  { symbol: 'π', x: 14, y: 86, size: 'text-3xl sm:text-4xl', color: 'text-amber-600/35', delay: 1.0 },
  { symbol: 'λ', x: 91, y: 82, size: 'text-2xl sm:text-3xl', color: 'text-emerald-600/35', delay: 0.8 },
  { symbol: 'Δ', x: 88, y: 52, size: 'text-3xl sm:text-4xl', color: 'text-amber-600/35', delay: 0.3 },
  { symbol: '√', x: 10, y: 60, size: 'text-3xl sm:text-4xl', color: 'text-blue-500/35', delay: 1.2 },
  { symbol: 'μ', x: 50, y: 10, size: 'text-2xl sm:text-3xl', color: 'text-amber-600/35', delay: 0.9 },
  { symbol: 'Ω', x: 30, y: 20, size: 'text-2xl sm:text-3xl', color: 'text-emerald-500/35', delay: 1.4 },
  { symbol: '∞', x: 48, y: 90, size: 'text-3xl sm:text-4xl', color: 'text-amber-600/35', delay: 0.4 },
];

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
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

    // Lively mathematical constellation particles
    const particleCount = 42;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2.2 + 1.2,
      color: Math.random() > 0.5 ? 'rgba(197, 155, 39, ' : 'rgba(30, 58, 138, ',
      alpha: Math.random() * 0.35 + 0.25,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect nearby particles with luminous constellation lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(184, 134, 11, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw active glowing particles
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
        ctx.shadowColor = 'rgba(217, 119, 6, 0.35)';
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isReady ? 1 : 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative w-full h-full min-h-[600px] overflow-hidden pointer-events-none select-none"
    >
      {/* Background Interactive Constellation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 opacity-85" />

      {/* Floating Mathematical Watermark Symbols */}
      {mathSymbols.map((item, idx) => (
        <motion.div
          key={idx}
          className={`absolute font-serif font-bold ${item.size} ${item.color} z-0 select-none pointer-events-none`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            y: [0, -22, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.25, 0.55, 0.25],
            scale: 1,
          }}
          transition={{
            opacity: { duration: 0.6, delay: item.delay },
            y: { duration: 5.5 + idx * 0.4, repeat: Infinity, ease: 'easeInOut', delay: item.delay },
            rotate: { duration: 5.5 + idx * 0.4, repeat: Infinity, ease: 'easeInOut', delay: item.delay },
          }}
        >
          {item.symbol}
        </motion.div>
      ))}

      {/* Noticeable & Pleasant Floating Mathematical Equation Badges */}
      {equations.map((eq) => {
        const themeStyles =
          eq.theme === 'gold'
            ? 'bg-white/85 border-amber-400/50 text-amber-950 shadow-amber-500/10'
            : eq.theme === 'sapphire'
            ? 'bg-white/85 border-blue-400/50 text-blue-950 shadow-blue-500/10'
            : eq.theme === 'emerald'
            ? 'bg-white/85 border-emerald-400/50 text-emerald-950 shadow-emerald-500/10'
            : 'bg-white/85 border-orange-400/50 text-orange-950 shadow-orange-500/10';

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
            className={`hidden md:flex absolute flex-col items-start px-3.5 py-2 rounded-xl border backdrop-blur-md shadow-md transition-all ${themeStyles} z-0 pointer-events-none`}
            style={{
              left: `${eq.x}%`,
              top: `${eq.y}%`,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              y: [0, -18, 0],
              x: [0, 8, 0],
              opacity: [0.75, 1, 0.75],
            }}
            transition={{
              opacity: { duration: 0.6, delay: eq.delay },
              y: { duration: eq.duration, repeat: Infinity, ease: 'easeInOut', delay: eq.delay },
              x: { duration: eq.duration, repeat: Infinity, ease: 'easeInOut', delay: eq.delay },
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
              <span className="font-mono text-xs sm:text-[13px] font-bold tracking-tight text-foreground/90">
                {eq.text}
              </span>
            </div>
            {eq.subtext && (
              <span className="text-[10px] text-muted-foreground font-medium pl-3.5 mt-0.5">
                {eq.subtext}
              </span>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
