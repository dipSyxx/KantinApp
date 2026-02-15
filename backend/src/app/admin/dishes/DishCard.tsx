"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Dish = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  allergens: string[];
  tags: string[];
  _count: { menuItems: number };
};

type ImageMode = "upload" | "url";

export function DishCard({ dish }: { dish: Dish }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  if (editing) {
    return (
      <EditDishForm
        dish={dish}
        onCancel={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          router.refresh();
        }}
      />
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/dishes/${dish.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {dish.imageUrl ? (
        <img
          src={dish.imageUrl}
          alt={dish.title}
          className="w-full h-36 object-cover"
        />
      ) : (
        <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
          <svg className="h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base mb-1">{dish.title}</h3>
        {dish.description && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {dish.description}
          </p>
        )}

        {/* Allergens */}
        {dish.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {dish.allergens.map((a) => (
              <span
                key={a}
                className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full border border-red-200"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {dish.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {dish.tags.map((t) => (
              <span
                key={t}
                className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-400 mt-auto pt-2">
          Brukt i {dish._count.menuItems} menyer
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => setEditing(true)}
            className="flex-1 text-sm font-medium text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Rediger
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex-1 text-sm font-medium text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Slett
            </button>
          ) : (
            <div className="flex-1 flex gap-1">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? "..." : "Bekreft"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-500 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors"
              >
                Avbryt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Inline Edit Form ────────────────────────────────────

function EditDishForm({
  dish,
  onCancel,
  onSaved,
}: {
  dish: Dish;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(dish.title);
  const [description, setDescription] = useState(dish.description ?? "");
  const [imageMode, setImageMode] = useState<ImageMode>(
    dish.imageUrl ? "url" : "upload"
  );
  const [imageUrl, setImageUrl] = useState(dish.imageUrl ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [allergens, setAllergens] = useState(dish.allergens.join(", "));
  const [tags, setTags] = useState(dish.tags.join(", "));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Ugyldig filtype. Bruk JPEG, PNG, WebP eller GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Filen er for stor. Maks 5 MB.");
      return;
    }

    setError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError("");

    try {
      // Upload new image if selected
      let finalImageUrl: string | null | undefined = undefined;

      if (imageMode === "upload") {
        if (imageFile) {
          setUploading(true);
          const formData = new FormData();
          formData.append("file", imageFile);
          formData.append("dishId", dish.id);

          const uploadRes = await fetch("/api/admin/uploads", {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            const data = await uploadRes.json();
            throw new Error(data.error ?? "Opplasting feilet");
          }

          const uploadData = await uploadRes.json();
          finalImageUrl = uploadData.url;
          setUploading(false);
        }
        // If no new file, don't change imageUrl
      } else {
        // URL mode
        finalImageUrl = imageUrl.trim() || null;
      }

      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        allergens: allergens.split(",").map((s) => s.trim()).filter(Boolean),
        tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      };

      if (finalImageUrl !== undefined) {
        body.imageUrl = finalImageUrl;
      }

      const res = await fetch(`/api/admin/dishes/${dish.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Feil ved oppdatering");
        return;
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nettverksfeil");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-emerald-200 overflow-hidden">
      <div className="p-4">
        <h3 className="font-bold text-base mb-3 text-emerald-700">
          Rediger rett
        </h3>
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
            />
          </div>

          {/* Image tabs */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Bilde
            </label>
            <div className="flex border-b border-gray-200 mb-3">
              <button
                type="button"
                onClick={() => setImageMode("upload")}
                className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                  imageMode === "upload"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Last opp
              </button>
              <button
                type="button"
                onClick={() => setImageMode("url")}
                className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                  imageMode === "url"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                URL
              </button>
            </div>

            {imageMode === "upload" ? (
              <div>
                {/* Current image */}
                {!imageFile && dish.imageUrl && (
                  <div className="mb-2">
                    <img
                      src={dish.imageUrl}
                      alt="Nåværende"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <p className="text-xs text-gray-400 mt-1">Nåværende bilde</p>
                  </div>
                )}
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Nytt bilde"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
                  >
                    <p className="text-xs text-gray-500">Klikk for å velge nytt bilde</p>
                    <p className="text-xs text-gray-400">JPEG, PNG, WebP, GIF (maks 5 MB)</p>
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
                Allergener
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
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="popular, vegan"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={loading || uploading || !title.trim()}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? "Laster opp..." : loading ? "Lagrer..." : "Lagre endringer"}
            </button>
            <button
              onClick={onCancel}
              className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
            >
              Avbryt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
