"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Copy, Pencil, Trash2, AlertTriangle, Upload } from "lucide-react";
import { AllergenPicker } from "./AllergenPicker";
import { TagPicker } from "./TagPicker";
import { DishUsageModal } from "./DishUsageModal";

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

export function DishCard({
  dish,
  viewMode = "grid",
  bulkMode = false,
  isSelected = false,
  onToggleSelect,
}: {
  dish: Dish;
  viewMode?: "grid" | "list";
  bulkMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const res = await fetch(`/api/admin/dishes/${dish.id}/duplicate`, {
        method: "POST",
      });
      if (res.ok) router.refresh();
    } finally {
      setDuplicating(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!confirmDelete) {
      const res = await fetch(`/api/admin/dishes/${dish.id}/usage`);
      if (res.ok) {
        const data = await res.json();
        const activeUsage = data.usage.filter(
          (u: { weekStatus: string }) =>
            u.weekStatus === "PUBLISHED" || u.weekStatus === "DRAFT"
        );
        if (activeUsage.length > 0) {
          setDeleteWarning(
            `Denne retten er brukt i ${activeUsage.length} aktive menyer. Sletting vil fjerne den fra disse menyene.`
          );
        }
      }
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/dishes/${dish.id}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
      setDeleteWarning(null);
    }
  };

  const handleImageDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) return;
      if (file.size > 5 * 1024 * 1024) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("dishId", dish.id);
        const res = await fetch("/api/admin/uploads", {
          method: "POST",
          body: formData,
        });
        if (res.ok) router.refresh();
      } finally {
        setUploading(false);
      }
    },
    [dish.id, router]
  );

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

  if (viewMode === "list") {
    return (
      <>
        <div className={`bg-white rounded-xl shadow-sm border flex items-center gap-3 p-3 transition-all ${
          isSelected ? "border-brand-green ring-1 ring-brand-green/20" : "border-gray-100"
        }`}>
          {bulkMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green/30 shrink-0"
            />
          )}

          <div
            className={`w-12 h-12 rounded-lg shrink-0 overflow-hidden relative ${dragOver ? "ring-2 ring-brand-green" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleImageDrop}
          >
            {uploading ? (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Upload className="w-4 h-4 text-gray-400 animate-pulse" />
              </div>
            ) : dish.imageUrl ? (
              <img src={dish.imageUrl} alt={dish.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-sm font-bold">
                {dish.title.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{dish.title}</p>
            {dish.description && (
              <p className="text-xs text-gray-500 truncate">{dish.description}</p>
            )}
          </div>

          {dish.allergens.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1 shrink-0">
              {dish.allergens.slice(0, 3).map((a) => (
                <span
                  key={a}
                  className="text-[10px] px-1.5 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200"
                >
                  {a}
                </span>
              ))}
              {dish.allergens.length > 3 && (
                <span className="text-[10px] text-gray-400">+{dish.allergens.length - 3}</span>
              )}
            </div>
          )}

          <button
            onClick={() => setShowUsage(true)}
            className="text-xs text-gray-400 hover:text-brand-green transition-colors shrink-0"
          >
            {dish._count.menuItems} menyer
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Rediger"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="Dupliser"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={deleting}
              className={`p-1.5 rounded-lg transition-colors ${
                confirmDelete
                  ? "text-white bg-red-500 hover:bg-red-600"
                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
              }`}
              title={confirmDelete ? "Bekreft sletting" : "Slett"}
            >
              {confirmDelete && deleteWarning ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
            {confirmDelete && (
              <button
                onClick={() => { setConfirmDelete(false); setDeleteWarning(null); }}
                className="text-[10px] text-gray-400 hover:text-gray-600"
              >
                Avbryt
              </button>
            )}
          </div>
        </div>
        {showUsage && (
          <DishUsageModal
            dishId={dish.id}
            dishTitle={dish.title}
            onClose={() => setShowUsage(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all ${
        isSelected ? "border-brand-green ring-1 ring-brand-green/20" : "border-gray-100"
      }`}>
        {bulkMode && (
          <div className="absolute top-2 right-2 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green/30"
            />
          </div>
        )}

        <div
          className={`relative w-full h-36 ${dragOver ? "ring-2 ring-inset ring-brand-green" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleImageDrop}
        >
          {uploading ? (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400 animate-pulse" />
              <span className="ml-2 text-sm text-gray-400">Laster opp...</span>
            </div>
          ) : dragOver ? (
            <div className="w-full h-full bg-brand-green-50 flex items-center justify-center border-2 border-dashed border-brand-green/40">
              <Upload className="w-6 h-6 text-brand-green" />
              <span className="ml-2 text-sm text-brand-green font-medium">Slipp for å laste opp</span>
            </div>
          ) : dish.imageUrl ? (
            <img src={dish.imageUrl} alt={dish.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
              <svg className="h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {bulkMode && (
            <div className="absolute top-2 right-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green/30 shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-base mb-1">{dish.title}</h3>
          {dish.description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
              {dish.description}
            </p>
          )}

          {dish.allergens.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Allergener</p>
              <div className="flex flex-wrap gap-1">
                {dish.allergens.map((a) => (
                  <span
                    key={a}
                    className="text-xs px-1.5 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dish.tags.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {dish.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowUsage(true)}
            className="text-xs text-gray-400 mt-auto pt-2 hover:text-brand-green transition-colors text-left"
          >
            Brukt i {dish._count.menuItems} menyer &rarr;
          </button>

          <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setEditing(true)}
              className="flex-1 inline-flex items-center justify-center gap-1 text-sm font-medium text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Rediger
            </button>
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className="inline-flex items-center justify-center gap-1 text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              title="Dupliser"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {!confirmDelete ? (
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center justify-center gap-1 text-sm font-medium text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                {deleteWarning && (
                  <span className="text-[10px] text-amber-600 max-w-[120px] truncate" title={deleteWarning}>
                    <AlertTriangle className="w-3 h-3 inline" /> Aktiv bruk
                  </span>
                )}
                <button
                  onClick={handleDeleteClick}
                  disabled={deleting}
                  className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting ? "..." : "Bekreft"}
                </button>
                <button
                  onClick={() => { setConfirmDelete(false); setDeleteWarning(null); }}
                  className="text-xs text-gray-500 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors"
                >
                  Avbryt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUsage && (
        <DishUsageModal
          dishId={dish.id}
          dishTitle={dish.title}
          onClose={() => setShowUsage(false)}
        />
      )}
    </>
  );
}

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
  const [allergens, setAllergens] = useState<string[]>(dish.allergens);
  const [tags, setTags] = useState<string[]>(dish.tags);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
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
    setImageMode("upload");
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
      } else {
        finalImageUrl = imageUrl.trim() || null;
      }

      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        allergens,
        tags,
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
                      &times;
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Klikk eller dra bilde hit</p>
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

          <AllergenPicker value={allergens} onChange={setAllergens} />
          <TagPicker value={tags} onChange={setTags} />

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
