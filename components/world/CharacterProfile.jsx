import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EmotionalIndicator from "@/components/world/EmotionalIndicator";
import { EmotionalBadge } from "@/components/world/EmotionalIndicator";

export default function CharacterProfile({ character }) {
  if (!character) {
    return (
      <Card className="bg-slate-900/50 border-purple-800/30 backdrop-blur-sm">
        <CardContent className="p-6 text-center text-slate-400">
          No character data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-purple-800/30 backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="text-amber-400 text-2xl">{character.name}</CardTitle>
        <div className="flex flex-wrap items-center gap-3 text-slate-300 text-sm">
          {character.current_location && (
            <Badge variant="outline" className="border-slate-700 text-slate-200">
              Location: {character.current_location}
            </Badge>
          )}
          {character.conversation_id && (
            <Badge variant="outline" className="border-slate-700 text-slate-200">
              Conversation: {character.conversation_id}
            </Badge>
          )}
          {character.emotional_state && <EmotionalBadge emotionalState={character.emotional_state} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {(character.background || character.appearance) && (
          <div className="grid md:grid-cols-2 gap-4">
            {character.background && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-1">Background</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{character.background}</p>
              </div>
            )}
            {character.appearance && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-1">Appearance</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{character.appearance}</p>
              </div>
            )}
          </div>
        )}

        {/* Core stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-purple-700/20">
            <p className="text-xs text-slate-400">Currency</p>
            <p className="text-lg font-semibold text-amber-300">{character.currency ?? 0} gold</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-purple-700/20">
            <p className="text-xs text-slate-400">Inventory Items</p>
            <p className="text-lg font-semibold text-blue-200">{character.inventory?.length || 0}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-purple-700/20">
            <p className="text-xs text-slate-400">Known Skills</p>
            <p className="text-lg font-semibold text-green-200">{character.skills?.length || 0}</p>
          </div>
        </div>

        {/* Emotional State */}
        {character.emotional_state && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Emotional State</h3>
            <EmotionalIndicator emotionalState={character.emotional_state} showDetails />
          </div>
        )}

        {/* Reputation */}
        {character.reputation && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">Reputation</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(character.reputation).map(([faction, score]) => (
                <div key={faction} className="p-3 rounded-lg bg-slate-800/50 border border-purple-700/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300 capitalize">{faction}</span>
                    <span className="text-xs text-slate-500">{score > 0 ? "Positive" : score < 0 ? "Negative" : "Neutral"}</span>
                  </div>
                  <ReputationBar value={score} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {character.skills && character.skills.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {character.skills.map((skill, idx) => (
                <Badge key={idx} className="bg-purple-600/30 text-purple-200 text-xs">
                  {skill.name || skill}
                  {skill.level && <span className="ml-1 text-amber-300">({skill.level})</span>}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Inventory */}
        {character.inventory && character.inventory.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Inventory</h3>
            <div className="flex flex-wrap gap-2">
              {character.inventory.map((item, idx) => (
                <Badge key={idx} variant="outline" className="text-xs border-slate-600 text-slate-200">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Personality */}
        {character.personality && (
          <div className="grid md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-800/40 border border-purple-700/20">
            {character.personality.traits && character.personality.traits.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Traits</h3>
                <div className="flex flex-wrap gap-1.5">
                  {character.personality.traits.map((trait, idx) => (
                    <Badge key={idx} className="text-xs bg-amber-600/20 text-amber-200">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {character.personality.values && character.personality.values.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Values</h3>
                <div className="flex flex-wrap gap-1.5">
                  {character.personality.values.map((value, idx) => (
                    <Badge key={idx} className="text-xs bg-green-600/20 text-green-200">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {character.personality.flaws && character.personality.flaws.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Flaws</h3>
                <div className="flex flex-wrap gap-1.5">
                  {character.personality.flaws.map((flaw, idx) => (
                    <Badge key={idx} className="text-xs bg-red-600/20 text-red-300">
                      {flaw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReputationBar({ value }) {
  const percentage = Math.min(Math.max((value + 50) * 2, 0), 100);
  const color = value > 20 ? "bg-green-500" : value > 0 ? "bg-blue-500" : value > -20 ? "bg-yellow-500" : "bg-red-500";
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{value}</span>
    </div>
  );
}
