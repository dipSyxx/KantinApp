"use client";

import { useState } from "react";

const PREDEFINED_ALLERGENS = [
  { key: "gluten", label: "Gluten" },
  { key: "melk", label: "Melk" },
  { key: "egg", label: "Egg" },
  { key: "nøtter", label: "Nøtter" },
  { key: "fisk", label: "Fisk" },
  { key: "skalldyr", label: "Skalldyr" },
  { key: "soya", label: "Soya" },
  { key: "selleri", label: "Selleri" },
  { key: "sennep", label: "Sennep" },
  { key: "sesam", label: "Sesam" },
  { key: "lupin", label: "Lupin" },
  { key: "bløtdyr", label: "Bløtdyr" },
];

export function AllergenPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (allergens: string[]) => void;
}) {
  const [customInput, setCustomInput] = useState("");

  const predefinedKeys = PREDEFINED_ALLERGENS.map((a) => a.key);
  const customAllergens = value.filter(
    (v) => !predefinedKeys.includes(v.toLowerCase())
  );

  const toggle = (key: string) => {
    const isActive = value.some((v) => v.toLowerCase() === key);
    if (isActive) {
      onChange(value.filter((v) => v.toLowerCase() !== key));
    } else {
      onChange([...value, key]);
    }
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...value, trimmed]);
    }
    setCustomInput("");
  };

  const removeCustom = (allergen: string) => {
    onChange(value.filter((v) => v !== allergen));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        Allergener
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {PREDEFINED_ALLERGENS.map((a) => {
          const isActive = value.some((v) => v.toLowerCase() === a.key);
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => toggle(a.key)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                isActive
                  ? "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200/40 font-semibold"
                  : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      {customAllergens.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {customAllergens.map((a) => (
            <span
              key={a}
              className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200 inline-flex items-center gap-1"
            >
              {a}
              <button
                type="button"
                onClick={() => removeCustom(a)}
                className="hover:text-red-900 font-bold"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm"
          placeholder="Annet allergen..."
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customInput.trim()}
          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
        >
          Legg til
        </button>
      </div>
    </div>
  );
}

export function getAllergenColors() {
  return {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  };
}
