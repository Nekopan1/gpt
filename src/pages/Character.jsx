import React, { useEffect, useState } from "react";

export default function CharacterPage({ loadCharacter }) {
  const [formData, setFormData] = useState({
    name: "",
    appearance: "",
    background: "",
    personality: { traits: [], values: [], flaws: [] },
  });

  useEffect(() => {
    const character = loadCharacter?.();
    if (character) {
      setFormData({
        name: character.name || "",
        background: character.background || "",
        appearance: character.appearance || "",
        personality: character.personality || { traits: [], values: [], flaws: [] },
      });
    }
  }, [loadCharacter]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // submit logic placeholder
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label htmlFor="name">
        Name
        <input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
          className="border rounded px-3 py-2"
        />
      </label>
      <label htmlFor="appearance">
        Appearance
        <textarea
          id="appearance"
          value={formData.appearance}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              appearance: e.target.value,
            }))
          }
          className="border rounded px-3 py-2"
        />
      </label>
      <label htmlFor="background">
        Background
        <textarea
          id="background"
          value={formData.background}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              background: e.target.value,
            }))
          }
          className="border rounded px-3 py-2"
        />
      </label>
      <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">
        Save
      </button>
    </form>
  );
}
