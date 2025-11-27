import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Sparkles, User, FileText, Eye } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Character() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    background: "",
    appearance: "",
    personality: {
      traits: [],
      values: [],
      flaws: []
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Only load character if editing (character ID in URL)
      const urlParams = new URLSearchParams(window.location.search);
      const charId = urlParams.get('character');

      if (charId) {
        const char = await base44.entities.Character.get(charId);
        setCharacter(char);
        setFormData({
          name: char.name || "",
          background: char.background || "",
          appearance: char.appearance || "",
          personality: char.personality || { traits: [], values: [], flaws: [] }
        });
      }
    } catch (error) {
      console.error("Error loading character:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a character name");
      return;
    }

    setSaving(true);
    try {
      if (character) {
        await base44.entities.Character.update(character.id, formData);
        toast.success("Character updated!");
        navigate(createPageUrl("World") + `?character=${character.id}`);
      } else {
        const newChar = await base44.entities.Character.create({
          ...formData,
          currency: 100,
          inventory: ["Traveler's cloak", "Waterskin", "Basic rations"],
          reputation: {
            guild: 0,
            watch: 0,
            merchants: 0,
            nobles: 0
          },
          relationships: [],
          emotional_state: {
            valence: 0,
            arousal: 0,
            dominant_emotion: "calm",
            mood_description: "Ready for adventure"
          }
        });
        setCharacter(newChar);
        toast.success("Character created!");
        navigate(createPageUrl("World") + `?character=${newChar.id}`);
      }
    } catch (error) {
      console.error("Error saving character:", error);
      toast.error("Failed to save character");
    }
    setSaving(false);
  };

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
    <div className="min-h-screen text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Home"))}
            className="mb-6 text-purple-200 hover:text-white hover:bg-purple-900/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-slate-900/70 border-purple-800/50 backdrop-blur-md shadow-2xl">
            <CardHeader className="border-b border-purple-800/30 bg-gradient-to-r from-purple-900/30 to-amber-900/30">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-amber-400" />
                {character ? "Edit Character" : "Create Your Character"}
              </CardTitle>
              <p className="text-slate-300 mt-2">Shape your destiny in the world of APEX v42</p>
            </CardHeader>
            
            <CardContent className="space-y-8 p-8">
              {/* Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="name" className="text-purple-200 flex items-center gap-2 text-lg mb-3">
                  <User className="w-5 h-5" />
                  Character Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your character's name..."
                  className="bg-slate-800/70 border-purple-700/50 text-white text-lg py-6 focus:border-amber-500 transition-colors backdrop-blur-sm"
                />
              </motion.div>

              {/* Appearance */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="appearance" className="text-purple-200 flex items-center gap-2 text-lg mb-3">
                  <Eye className="w-5 h-5" />
                  Appearance
                </Label>
                <Textarea
                  id="appearance"
                  value={formData.appearance}
                  onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                  placeholder="Describe your character's appearance... (e.g., tall, silver hair, piercing blue eyes, scarred warrior)"
                  className="bg-slate-800/70 border-purple-700/50 text-white text-base leading-relaxed h-32 focus:border-amber-500 transition-colors backdrop-blur-sm resize-none"
                />
              </motion.div>

              {/* Background */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="background" className="text-purple-200 flex items-center gap-2 text-lg mb-3">
                  <FileText className="w-5 h-5" />
                  Background Story
                </Label>
                <Textarea
                  id="background"
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  placeholder="Tell us about your character's past, their origins, what drives them... This will shape your opening scene."
                  className="bg-slate-800/70 border-purple-700/50 text-white text-base leading-relaxed h-40 focus:border-amber-500 transition-colors backdrop-blur-sm resize-none"
                />
              </motion.div>

              {/* Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-700/30 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-amber-300 text-lg mb-2">AI-Powered Character Development</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      The World Master will help develop your character's personality, skills, and relationships as you play. 
                      Your choices will shape who they become, and their emotional state will evolve based on experiences.
                      Every NPC will remember your actions, and relationships will grow organically through your interactions.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xl py-8 font-bold shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300 hover:scale-[1.02]"
                >
                  {saving ? (
                    <>
                      <div className="w-6 h-6 border-3 border-slate-950 border-t-transparent rounded-full animate-spin mr-3" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6 mr-3" />
                      {character ? "Save Changes & Continue" : "Create Character & Begin"}
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
