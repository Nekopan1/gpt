import React from "react";

export default function EmotionalIndicator({ emotionalState, showDetails = false }) {
  if (!emotionalState) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-purple-200">
      <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
      <span>{emotionalState.dominant_emotion || "neutral"}</span>
      {showDetails && (
        <span className="text-slate-400">
          ({emotionalState.mood_description || "stable"})
        </span>
      )}
    </div>
  );
}
