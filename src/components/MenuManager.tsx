"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Check, Tag, ImagePlus, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import type { Category, MenuItem, Restaurant } from "@/lib/types";
import Image from "next/image";

interface Props {
  restaurant: Restaurant;
  initialCategories: Category[];
  initialItems: MenuItem[];
}

const EMPTY_ITEM = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  available: true,
  image_url: "",
};

export default function MenuManager({ restaurant, initialCategories, initialItems }: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY_ITEM });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  async function handleImageUpload(file: File) {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError("Only JPG, PNG or WebP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setUploading(true);
    setError(null);
    const ext = file.name.split(".").pop();
    const filename = `${restaurant.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(filename, file, { upsert: true });
    if (uploadError) {
      setError("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("menu-images").getPublicUrl(filename);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
  }

  async function addCategory() {
    if (!newCategoryName.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .insert({ restaurant_id: restaurant.id, name: newCategoryName.trim(), sort_order: categories.length })
      .select()
      .single();
    if (!error && data) {
      setCategories([...categories, data]);
      setNewCategoryName("");
      setShowCategoryForm(false);
    }
    setLoading(false);
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category? Items in it will become uncategorized.")) return;
    await supabase.from("categories").delete().eq("id", id);
    setCategories(categories.filter((c) => c.id !== id));
    setItems(items.map((i) => (i.category_id === id ? { ...i, category_id: null } : i)));
    if (activeCategory === id) setActiveCategory("all");
  }

  function openNew() {
    setEditingItem(null);
    setForm({ ...EMPTY_ITEM });
    setError(null);
    setShowItemForm(true);
  }

  function openEdit(item: MenuItem) {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      category_id: item.category_id ?? "",
      available: item.available,
      image_url: item.image_url ?? "",
    });
    setError(null);
    setShowItemForm(true);
  }

  async function saveItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      category_id: form.category_id || null,
      available: form.available,
      image_url: form.image_url.trim() || null,
      restaurant_id: restaurant.id,
    };
    if (isNaN(payload.price) || payload.price < 0) {
      setError("Enter a valid price");
      setLoading(false);
      return;
    }
    if (editingItem) {
      const { data, error } = await supabase
        .from("menu_items")
        .update(payload)
        .eq("id", editingItem.id)
        .select("*, category:categories(id, name)")
        .single();
      if (error) { setError(error.message); setLoading(false); return; }
      setItems(items.map((i) => (i.id === editingItem.id ? data : i)));
    } else {
      const { data, error } = await supabase
        .from("menu_items")
        .insert(payload)
        .select("*, category:categories(id, name)")
        .single();
      if (error) { setError(error.message); setLoading(false); return; }
      setItems([...items, data]);
    }
    setShowItemForm(false);
    setLoading(false);
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    setItems(items.filter((i) => i.id !== id));
  }

  async function toggleAvailable(item: MenuItem) {
    const newVal = !item.available;
    await supabase.from("menu_items").update({ available: newVal }).eq("id", item.id);
    setItems(items.map((i) => (i.id === item.id ? { ...i, available: newVal } : i)));
  }

  const filteredItems =
    activeCategory === "all"
      ? items
      : activeCategory === "uncategorized"
      ? items.filter((i) => !i.category_id)
      : items.filter((i) => i.category_id === activeCategory);

  const tabItems = [
    { id: "all", name: `All (${items.length})` },
    ...categories.map((c) => ({
      id: c.id,
      name: `${c.name} (${items.filter((i) => i.category_id === c.id).length})`,
    })),
    { id: "uncategorized", name: `Other (${items.filter((i) => !i.category_id).length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} items across {categories.length} categories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCategoryForm(true)} className="btn-secondary flex items-center gap-2">
            <Tag size={15} />
            <span className="hidden sm:inline">New category</span>
          </button>
          <button onClick={openNew} className="btn-primary flex items-center gap-2">
            <Plus size={15} />
            Add item
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabItems.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              activeCategory === cat.id
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {filteredItems.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">🍴</div>
          <p className="font-semibold text-gray-700 mb-1">No items yet</p>
          <p className="text-sm text-gray-400 mb-4">Add your first menu item to get started</p>
          <button onClick={openNew} className="btn-primary inline-flex items-center gap-2">
            <Plus size={15} /> Add item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              categoryName={categories.find((c) => c.id === item.category_id)?.name}
              onEdit={() => openEdit(item)}
              onDelete={() => deleteItem(item.id)}
              onToggle={() => toggleAvailable(item)}
            />
          ))}
        </div>
      )}

      {/* Category modal */}
      {showCategoryForm && (
        <Modal title="New category" onClose={() => setShowCategoryForm(false)}>
          <p className="text-sm text-gray-500 mb-4">Group your menu items by section (e.g. Starters, Mains, Desserts)</p>
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              className="input flex-1"
              placeholder="e.g. Starters, Main course…"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
            />
            <button onClick={addCategory} disabled={loading} className="btn-primary">
              Add
            </button>
          </div>
          {categories.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Existing categories</p>
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Item form modal */}
      {showItemForm && (
        <Modal
          title={editingItem ? "Edit item" : "New item"}
          onClose={() => setShowItemForm(false)}
        >
          <form onSubmit={saveItem} className="space-y-4">
            {/* Image upload */}
            <div>
              <label className="label">Photo</label>
              <div
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-150 ${
                  uploading
                    ? "border-orange-300 bg-orange-50"
                    : form.image_url
                    ? "border-gray-200 bg-gray-50"
                    : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleImageUpload(file);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-orange-500 py-4">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm font-medium">Uploading…</span>
                  </div>
                ) : form.image_url ? (
                  <div>
                    <Image
                      src={form.image_url}
                      alt="Preview"
                      width={160}
                      height={120}
                      className="mx-auto rounded-xl object-cover h-32 w-auto"
                    />
                    <p className="text-xs text-gray-400 mt-2">Click to change</p>
                  </div>
                ) : (
                  <div className="py-4 text-gray-400">
                    <ImagePlus size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">Click or drag a photo</p>
                    <p className="text-xs mt-0.5">JPG, PNG, WebP — max 5MB</p>
                  </div>
                )}
              </div>
              {form.image_url && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                  className="text-xs text-red-400 hover:text-red-600 mt-1.5 transition-colors"
                >
                  Remove photo
                </button>
              )}
            </div>

            <div>
              <label className="label">Name *</label>
              <input
                required
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Margherita Pizza"
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description of the dish…"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Price (€) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="input"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="9.90"
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  className="input"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Available toggle */}
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, available: !f.available }))}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 transition-all ${
                form.available
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {form.available ? (
                <ToggleRight size={22} className="text-emerald-500 shrink-0" />
              ) : (
                <ToggleLeft size={22} className="text-gray-400 shrink-0" />
              )}
              <div className="text-left">
                <p className={`text-sm font-semibold ${form.available ? "text-emerald-700" : "text-gray-500"}`}>
                  {form.available ? "Available" : "Unavailable"}
                </p>
                <p className="text-xs text-gray-400">
                  {form.available ? "Visible to customers" : "Hidden from menu"}
                </p>
              </div>
            </button>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-xl">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowItemForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading || uploading} className="btn-primary">
                {loading ? "Saving…" : editingItem ? "Save changes" : "Add item"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function ItemCard({
  item,
  categoryName,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: MenuItem;
  categoryName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-150 hover:shadow-md ${
      item.available ? "border-gray-100" : "border-gray-100 opacity-60"
    }`}>
      <div className="flex gap-0">
        {item.image_url ? (
          <div className="w-24 h-24 shrink-0">
            <Image
              src={item.image_url}
              alt={item.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 shrink-0 bg-gray-100 flex items-center justify-center text-2xl text-gray-300">
            🍽️
          </div>
        )}
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1">
              <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">{item.name}</p>
              <span className="font-bold text-orange-500 text-sm whitespace-nowrap ml-1">
                {Number(item.price).toFixed(2)}€
              </span>
            </div>
            {item.description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
            )}
            {categoryName && (
              <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                {categoryName}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={onToggle}
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
                item.available
                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              <Check size={11} />
              {item.available ? "Available" : "Hidden"}
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl z-10">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
