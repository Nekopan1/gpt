import React, { useEffect, useRef, useState } from "react";

export default function WorldChat({ conversation, character, onSend }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const messages = conversation?.messages || [];

  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend?.(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((message) => (
          <div key={message.id} className="p-2 rounded bg-slate-800/70 text-white">
            <div className="text-sm text-slate-400">{message.author}</div>
            <div>{message.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-2">
        <label className="flex flex-col gap-1 text-white">
          <span className="text-xs text-slate-400 text-right">{input.length}/1000</span>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={1000}
            className="bg-slate-900/60 border-purple-700/50 text-white resize-none rounded p-3"
            placeholder="What do you do next?"
            rows={3}
          />
        </label>
        <div className="text-xs text-slate-500 mt-1">Enter to send, Shift+Enter for new line</div>
        <button onClick={handleSend} className="mt-2 w-full bg-purple-600 text-white py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
