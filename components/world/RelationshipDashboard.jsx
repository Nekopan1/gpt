import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Brain, Users, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RelationshipDashboard({ character }) {
  if (!character?.relationships || character.relationships.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-purple-800/30 backdrop-blur-sm">
        <CardContent className="p-6 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No relationships yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-purple-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-400">
          <Users className="w-5 h-5" />
          Relationships
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {character.relationships.map((rel, idx) => (
          <RelationshipCard key={idx} relationship={rel} />
        ))}
      </CardContent>
    </Card>
  );
}

function RelationshipCard({ relationship }) {
  const {
    npc_name,
    relationship_type = "acquaintance",
    trust = 0,
    affection = 0,
    respect = 0,
    last_interaction,
    history = []
  } = relationship;

  // Calculate overall bond strength
  const bondStrength = (trust + affection + respect) / 3;
  
  return (
    <div className="p-4 rounded-lg bg-slate-800/50 border border-purple-700/20 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-white">{npc_name}</h4>
          <Badge variant="outline" className="mt-1 text-xs border-purple-600/50 text-purple-300">
            {relationship_type}
          </Badge>
        </div>
        <BondIndicator value={bondStrength} />
      </div>

      {/* Relationship Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <MetricBar
          icon={Shield}
          label="Trust"
          value={trust}
          color="blue"
        />
        <MetricBar
          icon={Heart}
          label="Affection"
          value={affection}
          color="pink"
        />
        <MetricBar
          icon={Brain}
          label="Respect"
          value={respect}
          color="purple"
        />
      </div>

      {/* Last Interaction */}
      {last_interaction && (
        <p className="text-xs text-slate-400 italic border-t border-slate-700/50 pt-2">
          "{last_interaction}"
        </p>
      )}

      {/* Recent History */}
      {history && history.length > 0 && (
        <div className="border-t border-slate-700/50 pt-2">
          <p className="text-xs text-slate-500 mb-1">Recent Events:</p>
          <div className="space-y-1">
            {history.slice(-2).map((event, idx) => (
              <div key={idx} className="text-xs text-slate-400 flex items-start gap-1">
                <span className="text-purple-400">•</span>
                <span>{event.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBar({ icon: Icon, label, value, color }) {
  // Convert -1 to 1 scale to 0-100
  const percentage = ((value + 1) / 2) * 100;
  
  const colorClasses = {
    blue: {
      text: "text-blue-400",
      bg: "bg-blue-500"
    },
    pink: {
      text: "text-pink-400",
      bg: "bg-pink-500"
    },
    purple: {
      text: "text-purple-400",
      bg: "bg-purple-500"
    }
  };
  
  const colors = colorClasses[color];
  
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Icon className={cn("w-3 h-3", colors.text)} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all", colors.bg)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-center font-medium" style={{ color: colors.text.replace('text-', '') }}>
        {value > 0.5 ? "High" : value > 0 ? "Good" : value > -0.3 ? "Neutral" : value > -0.6 ? "Low" : "Very Low"}
      </div>
    </div>
  );
}

function BondIndicator({ value }) {
  let label, color, Icon;
  
  if (value > 0.6) {
    label = "Strong Bond";
    color = "text-green-400";
    Icon = TrendingUp;
  } else if (value > 0.2) {
    label = "Positive";
    color = "text-green-300";
    Icon = TrendingUp;
  } else if (value < -0.6) {
    label = "Hostile";
    color = "text-red-500";
    Icon = TrendingDown;
  } else if (value < -0.2) {
    label = "Strained";
    color = "text-red-400";
    Icon = TrendingDown;
  } else {
    label = "Neutral";
    color = "text-slate-400";
    Icon = Shield;
  }
  
  return (
    <div className={cn("flex items-center gap-1 text-xs font-medium", color)}>
      <Icon className="w-4 h-4" />
      {label}
    </div>
  );
}
