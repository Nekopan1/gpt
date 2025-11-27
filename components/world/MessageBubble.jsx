import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  const imageUrl = React.useMemo(() => {
    if (!message.tool_calls || !Array.isArray(message.tool_calls)) return null;
    
    const generateImageCall = message.tool_calls.find(
      tc => tc.name === "Core.GenerateImage" && tc.status === "completed"
    );
    
    if (generateImageCall?.results) {
      try {
        const results = typeof generateImageCall.results === 'string' 
          ? JSON.parse(generateImageCall.results) 
          : generateImageCall.results;
        return results?.url || null;
      } catch {
        return null;
      }
    }
    return null;
  }, [message.tool_calls]);

  return (
    <div className={cn("flex gap-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <motion.div 
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/50"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>
      )}
      
      <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end") }>
        {message.content && (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className={cn(
              "rounded-2xl px-6 py-4 shadow-xl",
              isUser 
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/30" 
                : "bg-slate-800/90 text-white border border-purple-700/50 backdrop-blur-md shadow-purple-500/20"
            )}
          >
            {isUser ? (
              <p className="text-base leading-relaxed font-medium">{message.content}</p>
            ) : (
              <ReactMarkdown 
                className="text-base prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  p: ({ children }) => <p className="my-3 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="text-amber-400 font-bold">{children}</strong>,
                  em: ({ children }) => <em className="text-purple-300 font-medium">{children}</em>,
                  ul: ({ children }) => <ul className="my-3 ml-5 list-disc space-y-2 marker:text-purple-400">{children}</ul>,
                  ol: ({ children }) => <ol className="my-3 ml-5 list-decimal space-y-2 marker:text-purple-400">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-500 pl-4 my-3 italic text-slate-300 bg-purple-900/20 py-2 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  code: ({ inline, children }) => 
                    inline ? (
                      <code className="px-2 py-1 rounded bg-slate-900 text-amber-400 text-sm font-mono border border-purple-700/30">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-slate-900 text-amber-400 text-sm font-mono p-4 rounded-lg my-3 overflow-x-auto border border-purple-700/30">
                        {children}
                      </code>
                    ),
                  h1: ({ children }) => <h1 className="text-2xl font-bold text-amber-300 mt-4 mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold text-amber-300 mt-3 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-bold text-purple-300 mt-3 mb-2">{children}</h3>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </motion.div>
        )}

        {/* Display generated image */}
        {!isUser && imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-4 rounded-2xl overflow-hidden border-2 border-purple-700/50 bg-slate-800/50 shadow-2xl shadow-purple-500/30"
          >
            <img 
              src={imageUrl} 
              alt="Scene illustration" 
              className="w-full h-auto"
              loading="lazy"
            />
          </motion.div>
        )}
      </div>
      
      {isUser && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-700/50"
        >
          <div className="text-white text-lg font-bold">
            {message.content?.[0]?.toUpperCase() || "U"}
          </div>
        </motion.div>
      )}
    </div>
  );
}
