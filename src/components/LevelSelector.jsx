import React from 'react';
import { Lock, Star } from 'lucide-react';

export default function LevelSelector({ maxLevelUnlocked, currentLevel, onSelect }) {
  const levels = Array.from({ length: 5 }, (_, i) => i);
  return (
    <div className="grid grid-cols-5 gap-3">
      {levels.map((lvl) => {
        const unlocked = lvl <= maxLevelUnlocked;
        const isCurrent = lvl === currentLevel;
        return (
          <button
            key={lvl}
            onClick={() => unlocked && onSelect(lvl)}
            className={`relative flex flex-col items-center justify-center h-16 rounded-xl border transition select-none 
              ${unlocked ? 'bg-white border-orange-200 hover:border-orange-300' : 'bg-orange-100/60 border-orange-100'}`}
            disabled={!unlocked}
            aria-label={`Level ${lvl + 1}${unlocked ? '' : ' locked'}`}
          >
            <div className="text-xs font-semibold text-orange-900">Level</div>
            <div className="text-xl font-extrabold text-orange-700">{lvl + 1}</div>
            {isCurrent && 
              <div className="absolute -top-2 -right-2 bg-yellow-300 text-yellow-900 rounded-full p-1 shadow">
                <Star className="w-4 h-4" />
              </div>
            }
            {!unlocked && <Lock className="w-4 h-4 text-orange-400 absolute top-2 right-2" />}
          </button>
        );
      })}
    </div>
  );
}
