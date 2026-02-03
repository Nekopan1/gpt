import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Clock, MapPin, Users, Swords, TrendingUp, Heart, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const eventTypeIcons = {
  combat: Swords,
  political: TrendingUp,
  economic: TrendingUp,
  social: Heart,
  discovery: ScrollText,
  tragedy: AlertTriangle,
  triumph: Heart,
  betrayal: AlertTriangle
};

const eventTypeColors = {
  combat: "text-red-400 bg-red-400/20",
  political: "text-purple-400 bg-purple-400/20",
  economic: "text-amber-400 bg-amber-400/20",
  social: "text-blue-400 bg-blue-400/20",
  discovery: "text-green-400 bg-green-400/20",
  tragedy: "text-slate-400 bg-slate-400/20",
  triumph: "text-yellow-400 bg-yellow-400/20",
  betrayal: "text-red-500 bg-red-500/20"
};

export default function Chronicle({ characterId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const allEvents = await base44.entities.Event.list("-day_number", 50);
      setEvents(allEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    }
    setLoading(false);
  };

  const filteredEvents = filter === "all" 
    ? events 
    : events.filter(e => e.event_type === filter);

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-purple-800/30 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse text-slate-400">Loading chronicle...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-purple-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-400">
          <ScrollText className="w-5 h-5" />
          World Chronicle
        </CardTitle>
        <div className="flex gap-2 flex-wrap mt-3">
          <FilterButton 
            active={filter === "all"} 
            onClick={() => setFilter("all")}
          >
            All
          </FilterButton>
          {["combat", "political", "social", "discovery", "tragedy", "triumph"].map(type => (
            <FilterButton
              key={type}
              active={filter === type}
              onClick={() => setFilter(type)}
            >
              {type}
            </FilterButton>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <p className="text-center text-slate-400 py-8">
            No events recorded yet. Your story begins now...
          </p>
        ) : (
          filteredEvents.map((event, idx) => (
            <EventCard key={event.id || idx} event={event} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function EventCard({ event }) {
  const {
    title,
    description,
    event_type = "social",
    participants = [],
    location,
    day_number,
    emotional_impact,
    consequences = [],
    secrecy_level = 0
  } = event;

  const Icon = eventTypeIcons[event_type] || ScrollText;
  const colorClass = eventTypeColors[event_type] || "text-slate-400 bg-slate-400/20";

  return (
    <div className="p-4 rounded-lg bg-slate-800/50 border border-purple-700/20 space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn("p-2 rounded-lg", colorClass)}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-sm text-slate-300 mt-1">{description}</p>
          </div>
        </div>
        {day_number && (
          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 flex-shrink-0">
            Day {day_number}
          </Badge>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
        {location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location}
          </div>
        )}
        {participants.length > 0 && (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {participants.slice(0, 3).join(", ")}
            {participants.length > 3 && ` +${participants.length - 3} more`}
          </div>
        )}
        {secrecy_level > 0.5 && (
          <Badge variant="outline" className="text-xs border-purple-600/50 text-purple-400">
            Secret
          </Badge>
        )}
      </div>

      {/* Emotional Impact */}
      {emotional_impact && emotional_impact.overall_mood && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Impact:</span>
          <Badge className={cn(
            "text-xs",
            emotional_impact.overall_mood === "triumph" && "bg-green-500/20 text-green-400",
            emotional_impact.overall_mood === "tragedy" && "bg-red-500/20 text-red-400",
            emotional_impact.overall_mood === "fear" && "bg-orange-500/20 text-orange-400",
            emotional_impact.overall_mood === "joy" && "bg-yellow-500/20 text-yellow-400"
          )}>
            {emotional_impact.overall_mood}
          </Badge>
        </div>
      )}

      {/* Consequences */}
      {consequences.length > 0 && (
        <div className="border-t border-slate-700/50 pt-2 space-y-1">
          {consequences.slice(0, 2).map((consequence, idx) => (
            <div key={idx} className="text-xs text-slate-400 flex items-start gap-1">
              <span className="text-purple-400">→</span>
              <span>{consequence.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-lg text-xs font-medium transition-all",
        active
          ? "bg-purple-600 text-white"
          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
