"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type ImageMode = "upload" | "url";

export function CreateDishForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageMode, setImageMode] = useState<ImageMode>("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [allergens, setAllergens] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Ugyldig filtype. Bruk JPEG, PNG, WebP eller GIF.");
      return;
    }

    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Filen er for stor. Maks 5 MB.");
      return;
    }

    setError("");
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (): Promise<string | undefined> => {
    if (imageMode === "url") {
      return imageUrl.trim() || undefined;
    }

    if (!imageFile) return undefined;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Opplasting feilet");
      }

      const data = await res.json();
      return data.url;
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Upload image first if needed
      const finalImageUrl = await uploadImage();

      const res = await fetch("/api/admin/dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          imageUrl: finalImageUrl,
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
      setImageFile(null);
      setImagePreview(null);
      setAllergens("");
      setTags("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nettverksfeil");
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

        {/* Image: tab selector */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Bilde
          </label>
          <div className="flex border-b border-gray-200 mb-3">
            <button
              type="button"
              onClick={() => setImageMode("upload")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                imageMode === "upload"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Last opp bilde
            </button>
            <button
              type="button"
              onClick={() => setImageMode("url")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                imageMode === "url"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Bilde-URL
            </button>
          </div>

          {imageMode === "upload" ? (
            <div>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Forhåndsvisning"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
                >
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500">
                    Klikk for å velge bilde
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPEG, PNG, WebP eller GIF (maks 5 MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="https://..."
            />
          )}
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
            disabled={loading || uploading || !title.trim()}
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? "Laster opp bilde..." : loading ? "Oppretter..." : "Opprett rett"}
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
