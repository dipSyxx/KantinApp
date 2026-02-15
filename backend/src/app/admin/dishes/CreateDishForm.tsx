"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateDishForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [allergens, setAllergens] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    if (!title.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          allergens: allergens
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          tags: tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Feil ved opprettelse");
        return;
      }

      // Reset
      setTitle("");
      setDescription("");
      setImageUrl("");
      setAllergens("");
      setTags("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Nettverksfeil");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div className="mb-8">
        <button
          onClick={() => setOpen(true)}
          className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          + Ny rett
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-lg font-bold mb-4">Ny rett</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Navn *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="f.eks. Pizza Margherita"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Beskrivelse
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            rows={2}
            placeholder="Kort beskrivelse av retten..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Bilde-URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Allergener (komma-separert)
            </label>
            <input
              type="text"
              value={allergens}
              onChange={(e) => setAllergens(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="gluten, melk, egg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Tags (komma-separert)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="popular, vegan, spicy"
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleCreate}
            disabled={loading || !title.trim()}
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Oppretter..." : "Opprett rett"}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
          >
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
}
