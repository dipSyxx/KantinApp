"use client";

import { useState } from "react";

const PREDEFINED_TAGS = [
  "populær",
  "vegan",
  "vegetar",
  "spicy",
  "glutenfri",
  "sunn",
  "klassiker",
];

export function TagPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [customInput, setCustomInput] = useState("");

  const customTags = value.filter(
    (v) => !PREDEFINED_TAGS.includes(v.toLowerCase())
  );

  const toggle = (tag: string) => {
    const isActive = value.some((v) => v.toLowerCase() === tag);
    if (isActive) {
      onChange(value.filter((v) => v.toLowerCase() !== tag));
    } else {
      onChange([...value, tag]);
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

  const removeCustom = (tag: string) => {
    onChange(value.filter((v) => v !== tag));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        Tags
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {PREDEFINED_TAGS.map((tag) => {
          const isActive = value.some((v) => v.toLowerCase() === tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all capitalize ${
                isActive
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200 ring-1 ring-emerald-300/30 font-semibold"
                  : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {customTags.map((t) => (
            <span
              key={t}
              className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1"
            >
              {t}
              <button
                type="button"
                onClick={() => removeCustom(t)}
                className="hover:text-emerald-900 font-bold"
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
          placeholder="Annen tag..."
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
