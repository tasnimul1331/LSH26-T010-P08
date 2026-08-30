'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FloatingEquation {
  id: string;
  text: string;
  subtext?: string;
  x: number; // percentage
  y: number; // percentage
  delay: number;
  duration: number;
}

const equations: FloatingEquation[] = [
  {
    id: 'eq-1',
    text: 'GPA = min(5.00, (Σ GP + ΔGP₄ₜₕ) / 6)',
    subtext: 'Official Composite Formula',
    x: 8,
    y: 18,
    delay: 0,
    duration: 10,
  },
  {
    id: 'eq-2',
    text: 'ΔGP₄ₜₕ = max(0, GP - 2.00)',
    subtext: '4th Optional Subject Excess',
    x: 72,
    y: 16,
    delay: 1.5,
    duration: 11,
  },
  {
    id: 'eq-3',
    text: 'Theory₇₅ + Practical₂₅ = Total₁₀₀',
    subtext: 'Component Weighting',
    x: 6,
    y: 74,
    delay: 2,
    duration: 9.5,
  },
  {
    id: 'eq-4',
    text: 'Σᵢ₌₁⁶ GPᵢ = Compulsory Sum',
    subtext: '6 Mandatory Subjects',
    x: 74,
    y: 70,
    delay: 0.8,
    duration: 10.5,
  },
  {
    id: 'eq-5',
    text: '80–100 → A⁺ (GP 5.00)',
    subtext: 'Distinction Band',
    x: 18,
    y: 48,
    delay: 3,
    duration: 8.5,
  },
  {
    id: 'eq-6',
    text: 'σ = √[ 1/N Σ (xᵢ - μ)² ]',
    subtext: 'Standard Deviation Metric',
    x: 68,
    y: 46,
    delay: 2.2,
    duration: 9,
  },
];

const mathSymbols = [
  { symbol: '∑', x: 5, y: 35, size: 'text-3xl sm:text-4xl', color: 'text-amber-600/15', delay: 0 },
  { symbol: '∫', x: 93, y: 30, size: 'text-4xl sm:text-5xl', color: 'text-blue-600/15', delay: 1 },
  { symbol: 'π', x: 16, y: 88, size: 'text-3xl sm:text-4xl', color: 'text-amber-600/15', delay: 2 },
  { symbol: 'λ', x: 90, y: 84, size: 'text-2xl sm:text-3xl', color: 'text-emerald-600/15', delay: 1.5 },
  { symbol: 'Δ', x: 86, y: 55, size: 'text-3xl sm:text-4xl', color: 'text-amber-600/15', delay: 0.5 },
  { symbol: '√', x: 12, y: 62, size: 'text-3xl sm:text-4xl', color: 'text-blue-500/15', delay: 2.5 },
  { symbol: 'μ', x: 50, y: 12, size: 'text-2xl sm:text-3xl', color: 'text-amber-600/15', delay: 1.8 },
  { symbol: 'Ω', x: 32, y: 22, size: 'text-2xl sm:text-3xl', color: 'text-emerald-500/15', delay: 3 },
  { symbol: '∞', x: 46, y: 92, size: 'text-3xl sm:text-4xl', color: 'text-amber-600/15', delay: 0.7 },
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

    // Create very light, subtle constellation particles
    const particleCount = 35;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? 'rgba(197, 155, 39, ' : 'rgba(30, 58, 138, ',
      alpha: Math.random() * 0.2 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle, faint constellation lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * 0.08;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(184, 134, 11, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw very faint glowing nodes
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
      {/* Background Soft Subtle Constellation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 opacity-70" />

      {/* Floating Mathematical Watermark Symbols (Ultra-faint) */}
      {mathSymbols.map((item, idx) => (
        <motion.div
          key={idx}
          className={`absolute font-serif font-bold ${item.size} ${item.color} z-0 select-none pointer-events-none`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, 6, -6, 0],
            opacity: [0.15, 0.28, 0.15],
          }}
          transition={{
            duration: 9 + idx,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: item.delay,
          }}
        >
          {item.symbol}
        </motion.div>
      ))}

      {/* Extremely Light, Translucent, Delicate Mathematical Badges */}
      {equations.map((eq) => (
        <motion.div
          key={eq.id}
          className="hidden md:flex absolute flex-col items-start px-3 py-1.5 rounded-full border border-amber-600/10 bg-amber-50/20 backdrop-blur-[1px] text-foreground/40 transition-all z-0 pointer-events-none hover:opacity-80"
          style={{
            left: `${eq.x}%`,
            top: `${eq.y}%`,
          }}
          animate={{
            y: [0, -10, 0],
            x: [0, 4, 0],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{
            duration: eq.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: eq.delay,
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
            <span className="font-mono text-[11px] sm:text-xs tracking-tight text-foreground/60 font-medium">
              {eq.text}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
