import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Hero from './components/Hero';
import GameCanvas from './components/GameCanvas';
import LevelSelector from './components/LevelSelector';
import ProgressBar from './components/ProgressBar';
import { RefreshCw, Save, Play } from 'lucide-react';

// Simple persistent progress using localStorage. This satisfies save/load
// requirements on web and translates well to mobile PWAs or wrappers.
const STORAGE_KEY = 'flappy_kids_progress_v1';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { unlocked: 0 };
    const data = JSON.parse(raw);
    return { unlocked: Math.max(0, Math.min(4, data.unlocked || 0)) };
  } catch {
    return { unlocked: 0 };
  }
}

function saveProgress(unlocked) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlocked }));
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(0);
  const [unlocked, setUnlocked] = useState(0);
  const [status, setStatus] = useState('');

  // Load saved progress
  useEffect(() => {
    const p = loadProgress();
    setUnlocked(p.unlocked);
    setLevel(p.unlocked); // continue from last unlocked level
  }, []);

  const onStart = useCallback(() => setStarted(true), []);

  const onGameOver = useCallback(() => {
    setStatus('Oops! Try again.');
    setTimeout(() => setStatus(''), 1500);
  }, []);

  const onLevelComplete = useCallback(() => {
    setStatus('Level complete!');
    const next = Math.min(4, level + 1);
    setUnlocked((u) => {
      const newUnlocked = Math.max(u, next);
      saveProgress(newUnlocked);
      return newUnlocked;
    });
    setTimeout(() => setStatus(''), 1500);
  }, [level]);

  const handleSelectLevel = (idx) => {
    setLevel(idx);
    setStarted(true);
  };

  const resetProgress = () => {
    setUnlocked(0);
    setLevel(0);
    saveProgress(0);
  };

  const progressPct = useMemo(() => ((unlocked + 1) / 5) * 100, [unlocked]);

  return (
    <div className="min-h-screen bg-orange-50 text-orange-900">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-8">
        <Hero onStart={onStart} />

        <section className="grid md:grid-cols-[1fr,420px] gap-6 items-start">
          <div className="p-5 md:p-6 rounded-2xl bg-white border border-orange-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Your Adventure</h2>
                <p className="text-sm text-orange-800/80">Unlock each level by reaching the target score.</p>
              </div>
              <button
                onClick={resetProgress}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 border border-orange-200"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>

            <LevelSelector
              maxLevelUnlocked={unlocked}
              currentLevel={level}
              onSelect={handleSelectLevel}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{Math.round(progressPct)}%</span>
              </div>
              <ProgressBar value={unlocked + 1} max={5} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white border border-orange-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-orange-800/80">Current Level</div>
                  <div className="text-xl font-bold">Level {level + 1}</div>
                </div>
                <button
                  onClick={() => setStarted(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow"
                >
                  <Play className="w-4 h-4" /> Play
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-orange-200 shadow-sm">
              <div className="text-sm text-orange-800/80 mb-2">Save & Resume</div>
              <p className="text-sm mb-3">Your progress saves automatically when you complete a level.</p>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 text-orange-900 border border-orange-200">
                <Save className="w-4 h-4" /> Auto-Save Enabled
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {started ? (
            <div className="space-y-3">
              {status && (
                <div className="px-4 py-2 rounded-lg bg-amber-100 border border-amber-200 text-amber-900 font-medium w-max">
                  {status}
                </div>
              )}
              <GameCanvas
                levelIndex={level}
                onGameOver={onGameOver}
                onLevelComplete={onLevelComplete}
              />
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white border border-orange-200 shadow-sm text-center">
              <p className="mb-3">Tap the button to begin your journey!</p>
              <button
                onClick={onStart}
                className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow"
              >
                Start Game
              </button>
            </div>
          )}
        </section>

        <footer className="pt-4 text-center text-sm text-orange-800/70">
          Built for kids — colorful, simple, and fun. Tap anywhere to flap!
        </footer>
      </div>
    </div>
  );
}
