import React from "react";

export default function RelationshipDashboard({ relationships }) {
  return (
    <div className="space-y-3">
      {relationships?.map((relationship) => (
        <div key={relationship.id} className="p-3 rounded bg-slate-800/80 text-white">
          <div className="flex justify-between items-center">
            <span className="font-semibold">{relationship.name}</span>
            {typeof relationship.known_for_days === "number" && (
              <span className="text-xs text-slate-400">Known for {relationship.known_for_days} days</span>
            )}
          </div>
          <div className="text-sm text-slate-300 mt-1">Bond: {relationship.bond_strength || 0}%</div>
          <div className="mt-2 text-sm text-slate-100 space-y-1">
            {relationship.history?.slice(-2).map((event, index) => (
              <div key={index} className="flex items-baseline gap-2">
                <span>{event.event}</span>
                {event.date && (
                  <span className="text-[10px] text-slate-500">(Day {event.date})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
