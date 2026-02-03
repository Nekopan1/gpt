import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";

// Memoized input component to prevent re-renders from message updates
const ChatInput = memo(function ChatInput({ onSend, onQuickAction, sending }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!input.trim() || sending) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-purple-800/50 bg-slate-900/70 backdrop-blur-md p-6">
      <div className="flex gap-4">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you do? Speak your mind, take action, or simply observe..."
          disabled={sending}
          className="bg-slate-800/70 border-purple-700/50 text-white resize-none disabled:opacity-50 focus:border-amber-500 transition-all text-base leading-relaxed backdrop-blur-sm"
          rows={3}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-8 font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {sending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Send className="w-6 h-6 mr-2" />
              Send
            </>
          )}
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickAction("Continue")}
            disabled={sending}
            className="border-purple-700/50 text-purple-200 hover:text-white hover:bg-purple-900/50 disabled:opacity-50"
          >
            Continue
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickAction("Observe my surroundings")}
            disabled={sending}
            className="border-purple-700/50 text-purple-200 hover:text-white hover:bg-purple-900/50 disabled:opacity-50"
          >
            Observe
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickAction("Wait and see what happens")}
            disabled={sending}
            className="border-purple-700/50 text-purple-200 hover:text-white hover:bg-purple-900/50 disabled:opacity-50"
          >
            Wait
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Press Enter to send • Shift+Enter for new line
          </p>
          <p className="text-xs text-slate-500">
            {input.length}/1000
          </p>
        </div>
      </div>
    </div>
  );
});

export default function WorldChat({ conversation, character, onCharacterUpdate }) {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const conversationIdRef = useRef(null);
  const initializedRef = useRef(false);
  const unsubscribeRef = useRef(null);
  const sendingRef = useRef(false);
  const lastMessageCountRef = useRef(0);
  const refreshCharacterTimeoutRef = useRef(null);
  const sendingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!conversation?.id) return;

    // Prevent duplicate subscriptions
    if (conversationIdRef.current === conversation.id) return;

    // Cleanup previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Reset state for new conversation
    conversationIdRef.current = conversation.id;
    sendingRef.current = false;
    setSending(false);
    
    // Load initial messages
    const initialMessages = conversation.messages || [];
    setMessages(initialMessages);
    lastMessageCountRef.current = initialMessages.length;

    // Setup subscription
    unsubscribeRef.current = base44.agents.subscribeToConversation(conversation.id, (data) => {
      const newMessages = data.messages || [];
      setMessages(newMessages);
      
      // Check if we should stop the loading state
      if (sendingRef.current) {
        const lastMessage = newMessages[newMessages.length - 1];
        
        // Multiple conditions to detect completion
        const hasNewAssistantMessage = newMessages.length > lastMessageCountRef.current && 
                                       lastMessage?.role === "assistant";
        
        const assistantHasContent = lastMessage?.role === "assistant" && 
                                   (lastMessage?.content?.length > 0 || 
                                    (lastMessage?.tool_calls?.length > 0 && 
                                     lastMessage?.tool_calls.some(tc => tc.status === "completed" || tc.status === "success")));
        
        if (hasNewAssistantMessage || assistantHasContent) {
          // Small delay to ensure streaming is complete
          setTimeout(() => {
            sendingRef.current = false;
            setSending(false);
            
            if (sendingTimeoutRef.current) {
              clearTimeout(sendingTimeoutRef.current);
              sendingTimeoutRef.current = null;
            }
            
            refreshCharacterData();
          }, 500);
        }
      }
      
      lastMessageCountRef.current = newMessages.length;
    });

    // Send initial message if needed
    if (initialMessages.length === 0 && !initializedRef.current) {
      initializedRef.current = true;
      setTimeout(() => sendInitialMessage(), 100);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (refreshCharacterTimeoutRef.current) {
        clearTimeout(refreshCharacterTimeoutRef.current);
        refreshCharacterTimeoutRef.current = null;
      }
      if (sendingTimeoutRef.current) {
        clearTimeout(sendingTimeoutRef.current);
        sendingTimeoutRef.current = null;
      }
    };
  }, [conversation?.id]);

  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages.length]);

  const refreshCharacterData = async () => {
    if (refreshCharacterTimeoutRef.current) {
      clearTimeout(refreshCharacterTimeoutRef.current);
      refreshCharacterTimeoutRef.current = null;
    }

    refreshCharacterTimeoutRef.current = setTimeout(async () => {
      try {
        const updatedChar = await base44.entities.Character.get(character.id);
        if (updatedChar && onCharacterUpdate) {
          onCharacterUpdate(updatedChar);
        }
      } catch (error) {
        console.error("Error refreshing character:", error);
      } finally {
        refreshCharacterTimeoutRef.current = null;
      }
    }, 2000);
  };

  const sendInitialMessage = async () => {
    if (!conversation || !character || sendingRef.current) return;
    
    sendingRef.current = true;
    setSending(true);
    
    const greeting = `I am ${character.name}. ${character.background ? character.background : "I'm ready to begin my adventure."}`;
    
    try {
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: greeting
      });
    } catch (error) {
      console.error("Error sending initial message:", error);
      sendingRef.current = false;
      setSending(false);
    }
  };

  const handleSend = useCallback(async (userMessage) => {
    if (sendingRef.current || !conversation || sending) return;
    
    sendingRef.current = true;
    setSending(true);

    if (sendingTimeoutRef.current) {
      clearTimeout(sendingTimeoutRef.current);
      sendingTimeoutRef.current = null;
    }
    
    sendingTimeoutRef.current = setTimeout(() => {
      sendingRef.current = false;
      setSending(false);
      sendingTimeoutRef.current = null;
    }, 60000);

    try {
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: userMessage
      });
    } catch (error) {
      console.error("Error sending message:", error);
      sendingRef.current = false;
      setSending(false);
      if (sendingTimeoutRef.current) {
        clearTimeout(sendingTimeoutRef.current);
        sendingTimeoutRef.current = null;
      }
    }
  }, [conversation, sending]);

  const quickAction = useCallback(async (action) => {
    if (sendingRef.current || !conversation || sending) return;
    
    sendingRef.current = true;
    setSending(true);

    if (sendingTimeoutRef.current) {
      clearTimeout(sendingTimeoutRef.current);
      sendingTimeoutRef.current = null;
    }
    
    sendingTimeoutRef.current = setTimeout(() => {
      sendingRef.current = false;
      setSending(false);
      sendingTimeoutRef.current = null;
    }, 60000);

    try {
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: action
      });
    } catch (error) {
      console.error("Error sending quick action:", error);
      sendingRef.current = false;
      setSending(false);
      if (sendingTimeoutRef.current) {
        clearTimeout(sendingTimeoutRef.current);
        sendingTimeoutRef.current = null;
      }
    }
  }, [conversation, sending]);

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-2xl border border-purple-800/50 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={`${message.role}-${index}-${message.content?.substring(0, 20)}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {sending && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-800/70 rounded-2xl px-6 py-4 border border-purple-700/30 backdrop-blur-sm flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              <span className="text-sm text-slate-300">The World Master is weaving your story...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Memoized to prevent re-renders */}
      <ChatInput onSend={handleSend} onQuickAction={quickAction} sending={sending} />
    </div>
  );
}
