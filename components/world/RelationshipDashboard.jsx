import React from "react";

export default function RelationshipDashboard({ character }) {
  if (!character) return null;
  return (
    <div className="p-4 rounded-lg bg-slate-900/60 border border-purple-800/40">
      <h3 className="text-sm font-semibold text-slate-200 mb-2">Relationships</h3>
      {character.relationships && character.relationships.length > 0 ? (
        <ul className="space-y-2 text-sm text-slate-300">
          {character.relationships.map((rel, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{rel.npc_name}</span>
              <span className="text-purple-300">{rel.relationship_type || "acquaintance"}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500">No relationships yet.</p>
      )}
    </div>
  );
}
