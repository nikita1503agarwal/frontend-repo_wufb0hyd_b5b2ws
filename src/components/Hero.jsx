import React from 'react';
import Spline from '@splinetool/react-spline';
import { Trophy } from 'lucide-react';

export default function Hero({ onStart }) {
  return (
    <section className="relative w-full overflow-hidden bg-orange-200/30 rounded-2xl shadow-inner">
      <div className="grid md:grid-cols-2 h-[420px]">
        <div className="p-6 md:p-10 flex flex-col justify-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 w-max">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-semibold">Flappy Fun for Kids</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-orange-900">
            Tap, Fly, and Unlock Levels!
          </h1>
          <p className="text-orange-800/80 leading-relaxed">
            A colorful, kid-friendly flying game with simple tap controls. Beat each level
            to unlock the next and save your progress automatically.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onStart}
              className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-semibold shadow-lg shadow-orange-600/30 transition"
            >
              Start Playing
            </button>
          </div>
        </div>
        <div className="relative">
          <Spline
            scene="https://prod.spline.design/rwKT-aWtlkdY-8UV/scene.splinecode"
            style={{ width: '100%', height: '100%' }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-orange-200/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
