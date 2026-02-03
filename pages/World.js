import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, BookOpen, Menu, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import WorldChat from "../components/world/WorldChat";
import CharacterPanel from "../components/world/CharacterPanel";
import RelationshipDashboard from "../components/world/RelationshipDashboard";
import Chronicle from "../components/world/Chronicle";
import EmotionalIndicator from "../components/world/EmotionalIndicator";

export default function World() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidePanel, setSidePanel] = useState("character");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Get character ID from URL or use first character
      const urlParams = new URLSearchParams(window.location.search);
      const charId = urlParams.get('character');

      let char;
      if (charId) {
        char = await base44.entities.Character.get(charId);
      } else {
        const characters = await base44.entities.Character.filter({
          created_by: currentUser.email
        });

        if (characters.length === 0) {
          navigate(createPageUrl("Character"));
          return;
        }

        char = characters[0];
      }

      setCharacter(char);

      if (char.conversation_id) {
        try {
          const conv = await base44.agents.getConversation(char.conversation_id);
          setConversation(conv);
        } catch (error) {
          console.log("Conversation not found, creating new one");
          const newConv = await createNewConversation(char);
          setConversation(newConv);
        }
      } else {
        const newConv = await createNewConversation(char);
        setConversation(newConv);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async (char) => {
    const conv = await base44.agents.createConversation({
      agent_name: "world_master",
      metadata: {
        name: `${char.name}'s Adventure`,
        character_id: char.id
      }
    });

    await base44.entities.Character.update(char.id, {
      conversation_id: conv.id
    });

    return conv;
  };

  const handleCharacterUpdate = (updates) => {
    setCharacter(prev => {
      // Only update if data actually changed
      if (JSON.stringify(prev) === JSON.stringify(updates)) {
        return prev;
      }
      return updates;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          transition={{ duration: 1, rotate: { duration: 2, repeat: Infinity, ease: "linear" } }}
        >
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6914f651ea37d81907439acd/23e8c3355_ChatGPTImage17nov202500_52_01.png"
            alt="Loading"
            className="w-32 h-32 rounded-full shadow-2xl shadow-purple-500/50"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen text-white flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-purple-800/50 bg-slate-900/70 backdrop-blur-md shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Home"))}
              className="text-purple-200 hover:text-white hover:bg-purple-900/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                {character?.name || "Adventurer"}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-slate-400">
                  {character?.current_location || "Unknown Location"}
                </p>
                {character?.emotional_state && (
                  <div className="hidden sm:block">
                    <EmotionalIndicator emotionalState={character.emotional_state} />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Desktop buttons */}
          <div className="hidden md:flex gap-2">
            <Button
              variant={sidePanel === "character" ? "default" : "outline"}
              size="sm"
              onClick={() => setSidePanel(sidePanel === "character" ? null : "character")}
              className={sidePanel === "character" 
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg" 
                : "border-purple-700/50 text-purple-200 hover:text-white hover:border-purple-600"}
            >
              <User className="w-4 h-4 mr-2" />
              Character
            </Button>
            <Button
              variant={sidePanel === "info" ? "default" : "outline"}
              size="sm"
              onClick={() => setSidePanel(sidePanel === "info" ? null : "info")}
              className={sidePanel === "info"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                : "border-purple-700/50 text-purple-200 hover:text-white hover:border-purple-600"}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Info
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden border-purple-700/50 text-purple-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-purple-800/50 bg-slate-900/90 backdrop-blur-md overflow-hidden"
            >
              <div className="p-4 flex gap-2">
                <Button
                  variant={sidePanel === "character" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSidePanel("character"); setMobileMenuOpen(false); }}
                  className="flex-1"
                >
                  <User className="w-4 h-4 mr-2" />
                  Character
                </Button>
                <Button
                  variant={sidePanel === "info" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSidePanel("info"); setMobileMenuOpen(false); }}
                  className="flex-1"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Info
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 py-6 flex gap-6">
          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 min-w-0"
          >
            {conversation && character && (
              <WorldChat
                conversation={conversation}
                character={character}
                onCharacterUpdate={handleCharacterUpdate}
              />
            )}
          </motion.div>

          {/* Side Panel */}
          <AnimatePresence mode="wait">
            {sidePanel === "character" && (
              <motion.div
                key="character"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="w-80 flex-shrink-0 hidden md:block"
              >
                <CharacterPanel character={character} />
              </motion.div>
            )}

            {sidePanel === "info" && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="w-96 flex-shrink-0 space-y-4 overflow-y-auto hidden md:block"
              >
                <Tabs defaultValue="relationships" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-900/70 backdrop-blur-md border border-purple-800/50">
                    <TabsTrigger value="relationships" className="data-[state=active]:bg-purple-600">
                      Relationships
                    </TabsTrigger>
                    <TabsTrigger value="chronicle" className="data-[state=active]:bg-purple-600">
                      Chronicle
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="relationships" className="mt-4">
                    <RelationshipDashboard character={character} />
                  </TabsContent>
                  <TabsContent value="chronicle" className="mt-4">
                    <Chronicle characterId={character?.id} />
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
