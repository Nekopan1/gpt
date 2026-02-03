import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, BookOpen, Users, Globe, ArrowRight, Plus, Swords, Heart, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const chars = await base44.entities.Character.filter({
        created_by: currentUser.email
      });

      setCharacters(chars);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleNewGame = () => {
    navigate(createPageUrl("Character"));
  };

  const handlePlayCharacter = (charId) => {
    navigate(createPageUrl("World") + `?character=${charId}`);
  };

  const handleDeleteCharacter = async (char) => {
    const confirmed = window.confirm(
      `Delete ${char.name} and all progress? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await base44.entities.Character.delete(char.id);
      toast.success("Character deleted");
      setCharacters(prev => prev.filter(c => c.id !== char.id));
    } catch (error) {
      console.error("Error deleting character:", error);
      toast.error("Failed to delete character");
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "Ultra-Realistic NPCs",
      description: "Every character has personality, memories, motivations, and growth",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: Globe,
      title: "Living World",
      description: "Dynamic economy, weather, factions, and consequences that ripple",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: BookOpen,
      title: "Deep Narrative",
      description: "Ethical dilemmas, relationship dynamics, and meaningful choices",
      color: "from-amber-600 to-orange-600"
    },
    {
      icon: Users,
      title: "Social Systems",
      description: "Build reputation, forge alliances, navigate complex relationships",
      color: "from-green-600 to-emerald-600"
    }
  ];

  const stats = [
    { icon: Swords, label: "Combat System", value: "Realistic" },
    { icon: Heart, label: "Relationships", value: "Dynamic" },
    { icon: Zap, label: "Emotions", value: "Evolving" },
    { icon: Crown, label: "Factions", value: "Political" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6914f651ea37d81907439acd/23e8c3355_ChatGPTImage17nov202500_52_01.png"
            alt="Loading"
            className="w-32 h-32 rounded-full animate-pulse shadow-2xl shadow-purple-500/50"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo/Title */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-block mb-8"
            >
              <div className="relative">
                <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent animate-float">
                  APEX v42
                </h1>
                <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-amber-500/30 to-purple-500/30 -z-10" />
              </div>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-2xl md:text-4xl text-purple-200 mb-4 font-light"
            >
              Fantasy World Simulation
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              Enter a living, breathing fantasy world powered by advanced AI. 
              Every NPC remembers, every choice matters, every moment feels real.
            </motion.p>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex justify-center gap-6 mb-12 flex-wrap"
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-purple-700/30">
                  <stat.icon className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-slate-300">{stat.label}:</span>
                  <span className="text-sm font-semibold text-purple-300">{stat.value}</span>
                </div>
              ))}
            </motion.div>

            {characters.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="w-full max-w-2xl"
              >
                <div className="space-y-4 mb-6">
                  {characters.map((char, idx) => (
                    <motion.div
                      key={char.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + idx * 0.1 }}
                    >
                      <Card className="bg-slate-900/70 border-purple-800/50 backdrop-blur-md hover:border-amber-500/50 transition-all group">
                        <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-amber-300 mb-1">{char.name}</h3>
                            <p className="text-sm text-slate-400">{char.current_location || "Unknown Location"}</p>
                            {char.background && (
                              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{char.background}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              onClick={() => handlePlayCharacter(char.id)}
                              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold"
                            >
                              Play
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteCharacter(char)}
                              className="border-red-700/50 text-red-400 hover:bg-red-900/30"
                            >
                              ×
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                <Button
                  size="lg"
                  onClick={handleNewGame}
                  className="w-full border-purple-700/50 text-purple-200 hover:text-white hover:bg-purple-900/30 text-lg px-8 py-6 h-auto backdrop-blur-sm"
                  variant="outline"
                >
                  <Plus className="mr-2 w-5 h-5" />
                  Create New Character
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate(createPageUrl("Character"))}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xl px-12 py-8 h-auto font-bold shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  Begin Your Journey
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="bg-slate-900/70 border-purple-800/50 backdrop-blur-md hover:border-purple-600/70 transition-all duration-300 h-full overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <CardContent className="p-8 relative">
                  <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-slate-300 leading-relaxed text-lg">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-md">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-slate-400 leading-relaxed">
                <span className="text-amber-400 font-semibold text-base">Adults Only (22+)</span> • 
                Consent-forward design • Non-graphic content • 
                All intimate moments handled symbolically with boundaries • 
                <span className="text-purple-300">A mature, immersive experience</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
