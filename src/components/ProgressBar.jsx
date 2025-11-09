import React from 'react';

export default function ProgressBar({ value, max }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full h-3 bg-orange-100 rounded-full overflow-hidden border border-orange-200">
      <div
        className="h-full bg-gradient-to-r from-orange-400 to-amber-400"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
