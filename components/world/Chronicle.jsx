import React from "react";

export default function Chronicle({ characterId }) {
  return (
    <div className="p-4 rounded-lg bg-slate-900/60 border border-purple-800/40 text-sm text-slate-300">
      <p className="text-xs text-slate-500">Chronicle entries will appear here for character ID {characterId || "unknown"}.</p>
    </div>
  );
}
