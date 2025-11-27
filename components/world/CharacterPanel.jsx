import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Coins, TrendingUp, Package, Award, Users } from "lucide-react";
import EmotionalIndicator from "./EmotionalIndicator";

function ReputationBar({ value = 0 }) {
  const normalized = Math.max(-100, Math.min(100, value));
  const percentage = (normalized + 100) / 2;
  return (
    <div className="w-32 h-2 rounded-full bg-slate-800 overflow-hidden border border-purple-800/40">
      <div
        className={`h-full ${normalized >= 0 ? "bg-green-500/80" : "bg-red-500/80"}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export default function CharacterPanel({ character }) {
  if (!character) return null;

  return (
    <Card className="bg-slate-900/50 border-purple-800/30 backdrop-blur-sm h-full overflow-y-auto">
      <CardHeader className="border-b border-purple-800/30">
        <CardTitle className="flex items-center gap-2 text-amber-400">
          <User className="w-5 h-5" />
          {character.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 p-4">
        {/* Emotional State */}
        {character.emotional_state && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              Current Mood
            </h3>
            <EmotionalIndicator 
              emotionalState={character.emotional_state} 
              showDetails={true}
            />
          </div>
        )}

        {/* Location */}
        {character.current_location && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              Location
            </h3>
            <p className="text-sm text-slate-400">{character.current_location}</p>
          </div>
        )}

        {/* Appearance */}
        {character.appearance && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Appearance</h3>
            <p className="text-sm text-slate-400">{character.appearance}</p>
          </div>
        )}

        {/* Background */}
        {character.background && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Background</h3>
            <p className="text-sm text-slate-400">{character.background}</p>
          </div>
        )}

        {/* Currency */}
        {character.currency !== undefined && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-amber-400" />
              Wealth
            </h3>
            <p className="text-amber-400 font-semibold">{character.currency} gold</p>
          </div>
        )}

        {/* Reputation */}
        {character.reputation && Object.keys(character.reputation).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              Reputation
            </h3>
            <div className="space-y-2">
              {Object.entries(character.reputation).map(([faction, value]) => (
                <div key={faction} className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 capitalize">{faction}</span>
                  <ReputationBar value={value} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory */}
        {character.inventory && character.inventory.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
              <Package className="w-4 h-4" />
              Inventory
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {character.inventory.map((item, idx) => (
                <Badge key={idx} variant="outline" className="text-xs border-purple-700/50 text-purple-300">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {character.skills && character.skills.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
              <Award className="w-4 h-4" />
              Skills
            </h3>
            <div className="space-y-2">
              {character.skills.map((skill, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">{skill.name}</span>
                  <Badge className="text-xs bg-purple-600/30 text-purple-300">
                    {skill.level}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relationships Summary */}
        {character.relationships && character.relationships.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              Relationships
            </h3>
            <div className="space-y-1.5">
              {character.relationships.slice(0, 5).map((rel, idx) => (
                <div key={idx} className="text-xs">
                  <span className="text-slate-300">{rel.npc_name}</span>
                  <span className="text-slate-500"> • </span>
                  <span className="text-purple-400">{rel.relationship_type || "acquaintance"}</span>
                </div>
              ))}
              {character.relationships.length > 5 && (
                <p className="text-xs text-slate-500 italic">
                  +{character.relationships.length - 5} more...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Personality */}
        {character.personality && (
          <div className="space-y-3">
            {character.personality.traits && character.personality.traits.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Traits</h3>
                <div className="flex flex-wrap gap-1.5">
                  {character.personality.traits.map((trait, idx) => (
                    <Badge key={idx} className="text-xs bg-blue-600/20 text-blue-300">
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
                    <Badge key={idx} className="text-xs bg-green-600/20 text-green-300">
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
