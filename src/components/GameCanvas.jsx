import React, { useEffect, useRef, useState } from 'react';

// A simple Flappy Bird style canvas game designed for mobile responsiveness.
// Levels progressively increase pipe speed and gap difficulty.
// Progress is stored in localStorage so kids can resume later.

const LEVELS = [
  { speed: 2.5, gap: 160, gravity: 0.35, lift: -7.5 },
  { speed: 3.1, gap: 150, gravity: 0.36, lift: -7.8 },
  { speed: 3.6, gap: 140, gravity: 0.38, lift: -8.0 },
  { speed: 4.2, gap: 130, gravity: 0.4, lift: -8.2 },
  { speed: 4.8, gap: 120, gravity: 0.42, lift: -8.4 },
];

function useAnimationFrame(callback) {
  const requestRef = useRef();
  const previousRef = useRef();

  useEffect(() => {
    const animate = (time) => {
      if (previousRef.current !== undefined) {
        const delta = time - previousRef.current;
        callback(delta);
      }
      previousRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [callback]);
}

export default function GameCanvas({ levelIndex, onGameOver, onLevelComplete }) {
  const canvasRef = useRef(null);
  const [isRunning, setIsRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState(false);

  const level = LEVELS[Math.min(levelIndex, LEVELS.length - 1)];

  // Game state
  const bird = useRef({ x: 80, y: 160, vy: 0, r: 16 });
  const pipes = useRef([]);
  const sinceLastPipe = useRef(0);

  // Controls: tap/click/space
  useEffect(() => {
    const flap = () => {
      bird.current.vy = level.lift;
      setFlash(true);
      setTimeout(() => setFlash(false), 80);
    };
    const handleDown = (e) => {
      e.preventDefault();
      if (!isRunning) return;
      flap();
    };
    const handleKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('pointerdown', handleDown, { passive: false });
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isRunning, level.lift]);

  // Reset when level changes
  useEffect(() => {
    bird.current = { x: 80, y: 160, vy: 0, r: 16 };
    pipes.current = [];
    sinceLastPipe.current = 0;
    setScore(0);
    setIsRunning(true);
  }, [levelIndex]);

  const spawnPipe = (h, gap) => {
    const top = Math.random() * (h - gap - 80) + 40; // keep some margins
    pipes.current.push({ x: 0, y: 0, top, gap, passed: false, right: null });
  };

  useAnimationFrame((dt) => {
    const canvas = canvasRef.current;
    if (!canvas || !isRunning) return;
    const ctx = canvas.getContext('2d');

    const dts = Math.min(dt, 32) / 16.6667; // normalize

    const w = canvas.width;
    const h = canvas.height;

    // Physics
    bird.current.vy += level.gravity * dts;
    bird.current.y += bird.current.vy * dts;

    // Spawn pipes every ~ 1.3s adjusted by speed
    const interval = 1200 - levelIndex * 80;
    sinceLastPipe.current += dt;
    if (sinceLastPipe.current > interval) {
      sinceLastPipe.current = 0;
      spawnPipe(h, level.gap);
    }

    // Move pipes and remove off-screen
    for (let i = pipes.current.length - 1; i >= 0; i--) {
      const p = pipes.current[i];
      p.x += level.speed * dts;
      p.right = w - p.x; // for collision calc convenience
      if (p.right < -60) pipes.current.splice(i, 1);
    }

    // Collision and scoring
    for (const p of pipes.current) {
      const pipeW = 60;
      const x = p.right;
      const gapTop = p.top;
      const gapBottom = p.top + p.gap;
      const withinX = bird.current.x + bird.current.r > x && bird.current.x - bird.current.r < x + pipeW;
      const hitTop = withinX && bird.current.y - bird.current.r < gapTop;
      const hitBottom = withinX && bird.current.y + bird.current.r > gapBottom;
      if (!p.passed && x + pipeW < bird.current.x - bird.current.r) {
        p.passed = true;
        setScore((s) => s + 1);
      }
      if (hitTop || hitBottom) {
        setIsRunning(false);
        onGameOver?.();
      }
    }

    // Ground / ceiling
    if (bird.current.y + bird.current.r > h || bird.current.y - bird.current.r < 0) {
      setIsRunning(false);
      onGameOver?.();
    }

    // Win condition: reach score threshold per level
    const target = 10 + levelIndex * 5; // progressively harder
    if (score >= target && isRunning) {
      setIsRunning(false);
      onLevelComplete?.();
    }

    // RENDER
    ctx.clearRect(0, 0, w, h);

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#FFEDD5');
    grad.addColorStop(1, '#FDBA74');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Pipes
    for (const p of pipes.current) {
      const x = p.right;
      const pipeW = 60;
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 4;
      // Top pipe
      ctx.fillRect(x, 0, pipeW, p.top);
      ctx.strokeRect(x, 0, pipeW, p.top);
      // Bottom pipe
      ctx.fillRect(x, p.top + p.gap, pipeW, h - (p.top + p.gap));
      ctx.strokeRect(x, p.top + p.gap, pipeW, h - (p.top + p.gap));
    }

    // Bird (simple circle with face)
    ctx.save();
    ctx.translate(bird.current.x, bird.current.y);
    ctx.fillStyle = flash ? '#fca5a5' : '#fde047';
    ctx.beginPath();
    ctx.arc(0, 0, bird.current.r, 0, Math.PI * 2);
    ctx.fill();
    // Eye
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(6, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    // Beak
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(24, 4);
    ctx.lineTo(16, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // HUD
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 20px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(`Score: ${score}`, 12, 28);
  });

  // Resize canvas to device pixel ratio
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="w-full aspect-[9/16] max-w-[460px] mx-auto rounded-2xl overflow-hidden shadow-xl bg-orange-100 border border-orange-200">
      <canvas ref={canvasRef} className="w-full h-full touch-none" />
    </div>
  );
}
