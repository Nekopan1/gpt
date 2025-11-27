import React from "react";
import { cn } from "@/lib/utils";
import { Smile, Frown, Angry, Zap, Heart, Shield, AlertTriangle } from "lucide-react";

// Maps valence/arousal to emotion and visual representation
const getEmotionData = (valence = 0, arousal = 0) => {
  // High valence + high arousal = excited/joyful
  if (valence > 0.3 && arousal > 0.3) {
    return {
      emotion: "Excited",
      icon: Zap,
      color: "text-amber-400",
      bgColor: "bg-amber-400/20",
      description: "energetic and positive"
    };
  }
  
  // High valence + low arousal = content/peaceful
  if (valence > 0.3 && arousal <= 0.3) {
    return {
      emotion: "Content",
      icon: Smile,
      color: "text-green-400",
      bgColor: "bg-green-400/20",
      description: "calm and happy"
    };
  }
  
  // Low valence + high arousal = angry/terrified
  if (valence < -0.3 && arousal > 0.3) {
    return {
      emotion: arousal > 0.6 ? "Furious" : "Angry",
      icon: Angry,
      color: "text-red-500",
      bgColor: "bg-red-500/20",
      description: "agitated and negative"
    };
  }
  
  // Low valence + low arousal = sad/depressed
  if (valence < -0.3 && arousal <= 0.3) {
    return {
      emotion: "Sad",
      icon: Frown,
      color: "text-blue-400",
      bgColor: "bg-blue-400/20",
      description: "low energy and negative"
    };
  }
  
  // Near zero = neutral/calm
  return {
    emotion: "Neutral",
    icon: Smile,
    color: "text-slate-400",
    bgColor: "bg-slate-400/20",
    description: "balanced state"
  };
};

// Mini inline emotion indicator
export function EmotionalBadge({ emotionalState }) {
  if (!emotionalState) return null;
  
  const { valence = 0, arousal = 0, dominant_emotion } = emotionalState;
  const emotionData = getEmotionData(valence, arousal);
  const Icon = emotionData.icon;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      emotionData.bgColor,
      emotionData.color
    )}>
      <Icon className="w-3 h-3" />
      {dominant_emotion || emotionData.emotion}
    </span>
  );
}

// Detailed emotion display with valence/arousal visualization
export default function EmotionalIndicator({ emotionalState, showDetails = false }) {
  if (!emotionalState) return null;
  
  const { valence = 0, arousal = 0, dominant_emotion, mood_description } = emotionalState;
  const emotionData = getEmotionData(valence, arousal);
  const Icon = emotionData.icon;
  
  // Convert -1 to 1 scale to 0-100 for display
  const valencePercent = ((valence + 1) / 2) * 100;
  const arousalPercent = ((arousal + 1) / 2) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={cn(
          "p-2 rounded-lg",
          emotionData.bgColor
        )}>
          <Icon className={cn("w-5 h-5", emotionData.color)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("font-semibold", emotionData.color)}>
              {dominant_emotion || emotionData.emotion}
            </span>
            {showDetails && (
              <span className="text-xs text-slate-400">
                ({emotionData.description})
              </span>
            )}
          </div>
          {mood_description && (
            <p className="text-sm text-slate-300 mt-0.5">{mood_description}</p>
          )}
        </div>
      </div>
      
      {showDetails && (
        <div className="space-y-1.5 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Mood</span>
              <span className={valence > 0 ? "text-green-400" : "text-red-400"}>
                {valence > 0 ? "Positive" : valence < 0 ? "Negative" : "Neutral"}
              </span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all",
                  valence > 0 ? "bg-green-500" : "bg-red-500"
                )}
                style={{ width: `${valencePercent}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Energy</span>
              <span className={arousal > 0.3 ? "text-amber-400" : "text-blue-400"}>
                {arousal > 0.3 ? "High" : "Low"}
              </span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${arousalPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Relationship status indicator
export function RelationshipIndicator({ relationship }) {
  if (!relationship) return null;
  
  const { trust = 0, affection = 0, respect = 0 } = relationship;
  
  // Determine overall relationship quality
  const avgScore = (trust + affection + respect) / 3;
  
  let status = "Neutral";
  let color = "text-slate-400";
  let Icon = Shield;
  
  if (avgScore > 0.6) {
    status = "Close Ally";
    color = "text-green-400";
    Icon = Heart;
  } else if (avgScore > 0.3) {
    status = "Friend";
    color = "text-green-300";
    Icon = Smile;
  } else if (avgScore < -0.6) {
    status = "Enemy";
    color = "text-red-500";
    Icon = Angry;
  } else if (avgScore < -0.3) {
    status = "Hostile";
    color = "text-red-400";
    Icon = AlertTriangle;
  }
  
  return (
    <div className="flex items-center gap-2">
      <Icon className={cn("w-4 h-4", color)} />
      <span className={cn("font-medium text-sm", color)}>{status}</span>
    </div>
  );
}
