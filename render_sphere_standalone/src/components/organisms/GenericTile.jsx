import React from 'react';

export default function GenericTile({ title, theme }) {
  return (
    <div className="w-full h-full p-6 rounded-3xl bg-zinc-900/50 border border-zinc-700/50 flex flex-col items-center justify-center text-zinc-500">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm">Coming Soon</p>
    </div>
  );
}
