import React, { useEffect, useState } from "react";
import WorldChat from "../components/WorldChat";

export default function WorldPage({ fetchConversation, fetchCharacter, onCharacterMissing, onSend }) {
  const [conversation, setConversation] = useState(null);
  const [character, setCharacter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [conv, char] = await Promise.all([
          fetchConversation?.(),
          fetchCharacter?.(),
        ]);
        setConversation(conv);
        setCharacter(char);
      } catch (err) {
        setError("Character not found");
        onCharacterMissing?.();
      }
    };

    loadData();
  }, [fetchConversation, fetchCharacter, onCharacterMissing]);

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {conversation && character ? (
        <WorldChat
          conversation={{ ...conversation, messages: conversation.messages || [] }}
          character={character}
          onSend={onSend}
        />
      ) : (
        <div className="text-slate-300">Loading world...</div>
      )}
    </div>
  );
}
