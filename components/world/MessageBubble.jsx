import React from "react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`max-w-3xl ${isUser ? "ml-auto text-right" : "mr-auto"}`}>
      <div
        className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
          isUser
            ? "bg-amber-500/20 border-amber-500/40 text-amber-100"
            : "bg-slate-800/70 border-purple-700/30 text-slate-100"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
