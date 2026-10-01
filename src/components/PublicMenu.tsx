"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { translateBatch, LANGUAGES } from "@/lib/translate";
import type { MenuItem, Category } from "@/lib/types";
import { Loader2, Globe, X, Check } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  slug: string;
}

interface Props {
  restaurant: Restaurant;
  categories: Category[];
  items: MenuItem[];
}

interface TranslatedData {
  restaurantName: string;
  restaurantDesc: string;
  categoryNames: Record<string, string>;
  itemNames: Record<string, string>;
  itemDescs: Record<string, string>;
}

function buildOriginal(restaurant: Restaurant, categories: Category[], items: MenuItem[]): TranslatedData {
  const categoryNames: Record<string, string> = {};
  categories.forEach((c) => (categoryNames[c.id] = c.name));
  const itemNames: Record<string, string> = {};
  const itemDescs: Record<string, string> = {};
  items.forEach((i) => { itemNames[i.id] = i.name; itemDescs[i.id] = i.description ?? ""; });
  return { restaurantName: restaurant.name, restaurantDesc: restaurant.description ?? "", categoryNames, itemNames, itemDescs };
}

export default function PublicMenu({ restaurant, categories, items }: Props) {
  const [lang, setLang] = useState("original");
  const [translated, setTranslated] = useState<TranslatedData>(buildOriginal(restaurant, categories, items));
  const [translating, setTranslating] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [langOpen, setLangOpen] = useState(false);

  const applyTranslation = useCallback(async (targetLang: string) => {
    if (targetLang === "original") {
      setTranslated(buildOriginal(restaurant, categories, items));
      return;
    }
    setTranslating(true);
    try {
      const [tRestName, tRestDesc, tCatNames, tItemNames, tItemDescs] = await Promise.all([
        translateBatch([restaurant.name], targetLang).then((r) => r[0]),
        translateBatch([restaurant.description ?? ""], targetLang).then((r) => r[0]),
        translateBatch(categories.map((c) => c.name), targetLang),
        translateBatch(items.map((i) => i.name), targetLang),
        translateBatch(items.map((i) => i.description ?? ""), targetLang),
      ]);
      const categoryNames: Record<string, string> = {};
      categories.forEach((c, i) => (categoryNames[c.id] = tCatNames[i]));
      const itemNames: Record<string, string> = {};
      const itemDescsMap: Record<string, string> = {};
      items.forEach((item, i) => { itemNames[item.id] = tItemNames[i]; itemDescsMap[item.id] = tItemDescs[i]; });
      setTranslated({ restaurantName: tRestName, restaurantDesc: tRestDesc, categoryNames, itemNames, itemDescs: itemDescsMap });
    } catch (e) {
      console.error("Translation error:", e);
    } finally {
      setTranslating(false);
    }
  }, [restaurant, categories, items]);

  useEffect(() => {
    let saved = "original";
    try { saved = localStorage.getItem("menuqr-lang") ?? "original"; } catch {}
    if (saved !== "original") { setLang(saved); applyTranslation(saved); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickLang(code: string) {
    setLang(code);
    setLangOpen(false);
    try { localStorage.setItem("menuqr-lang", code); } catch {}
    applyTranslation(code);
  }

  // Group items
  const grouped: Record<string, MenuItem[]> = {};
  const uncategorized: MenuItem[] = [];
  items.forEach((item) => {
    if (item.category_id) {
      if (!grouped[item.category_id]) grouped[item.category_id] = [];
      grouped[item.category_id].push(item);
    } else uncategorized.push(item);
  });
  const visibleCategories = categories.filter((c) => (grouped[c.id] ?? []).length > 0);
  const isRTL = lang === "ar";
  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div className="min-h-screen bg-[#faf9f6]" dir={isRTL ? "rtl" : "ltr"}>

      {/* Language sheet */}
      {langOpen && (
        <div
          className="fixed inset-0 flex flex-col justify-end"
          style={{ zIndex: 9999, background: "rgba(0,0,0,0.5)" }}
          onClick={() => setLangOpen(false)}
        >
          <div className="bg-white rounded-t-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="font-bold text-gray-900">Language</p>
              <button type="button" onClick={() => setLangOpen(false)} className="p-2 rounded-xl text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="pb-10">
              {LANGUAGES.map((l) => (
                <button
                  type="button"
                  key={l.code}
                  onClick={() => pickLang(l.code)}
                  className={`flex items-center gap-4 w-full px-5 py-4 text-left ${lang === l.code ? "bg-orange-50" : ""}`}
                >
                  <span className="text-2xl">{l.flag}</span>
                  <span className={`text-base font-medium ${lang === l.code ? "text-orange-600" : "text-gray-800"}`}>{l.label}</span>
                  {lang === l.code && <Check size={16} className="ml-auto text-orange-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-2xl mx-auto px-5 pt-10 pb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {restaurant.logo_url ? (
                <Image src={restaurant.logo_url} alt={restaurant.name} width={56} height={56} className="rounded-2xl object-cover w-14 h-14 border-2 border-white/20" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-2xl border-2 border-white/10">🍽️</div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{translated.restaurantName}</h1>
                {restaurant.description && <p className="text-sm text-gray-400 mt-0.5">{translated.restaurantDesc}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLangOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 border border-white/20 text-sm font-medium text-white shrink-0 mt-1"
            >
              {translating ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} className="opacity-70" />}
              <span>{currentLang.flag}</span>
            </button>
          </div>
          <div className="flex gap-4 mt-6 pt-5 border-t border-white/10 text-sm text-gray-400">
            <span><strong className="text-white">{items.length}</strong> items</span>
            {visibleCategories.length > 0 && <span><strong className="text-white">{visibleCategories.length}</strong> categories</span>}
          </div>
        </div>

        {/* Category tabs */}
        {visibleCategories.length > 0 && (
          <div className="overflow-x-auto scrollbar-none border-t border-white/10">
            <div className="max-w-2xl mx-auto px-5 flex gap-1 py-3">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`whitespace-nowrap text-xs px-4 py-2 rounded-full font-semibold transition-all ${activeCategory === "all" ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
              >
                All
              </button>
              {visibleCategories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap text-xs px-4 py-2 rounded-full font-semibold transition-all ${activeCategory === cat.id ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
                >
                  {translated.categoryNames[cat.id] ?? cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Menu body */}
      <div className="max-w-2xl mx-auto px-4 py-7 space-y-10">
        {translating && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-orange-500 bg-orange-50 rounded-2xl border border-orange-100">
            <Loader2 size={15} className="animate-spin" /> Translating…
          </div>
        )}

        {visibleCategories
          .filter((c) => activeCategory === "all" || activeCategory === c.id)
          .map((cat) => (
            <section key={cat.id}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-base font-black text-gray-900 uppercase tracking-widest">
                  {translated.categoryNames[cat.id] ?? cat.name}
                </h2>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">{(grouped[cat.id] ?? []).length}</span>
              </div>
              <div className="space-y-3">
                {(grouped[cat.id] ?? []).map((item) => (
                  <PublicItemCard
                    key={item.id}
                    item={item}
                    name={translated.itemNames[item.id] ?? item.name}
                    description={translated.itemDescs[item.id] ?? item.description ?? ""}
                  />
                ))}
              </div>
            </section>
          ))}

        {uncategorized.length > 0 && activeCategory === "all" && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-base font-black text-gray-900 uppercase tracking-widest">Other</h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="space-y-3">
              {uncategorized.map((item) => (
                <PublicItemCard key={item.id} item={item} name={translated.itemNames[item.id] ?? item.name} description={translated.itemDescs[item.id] ?? item.description ?? ""} />
              ))}
            </div>
          </section>
        )}

        {items.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="font-semibold text-gray-500">Menu coming soon…</p>
          </div>
        )}
      </div>

      <footer className="text-center text-xs text-gray-300 py-10 border-t border-gray-100">
        Powered by <span className="font-semibold text-gray-400">MenuQR</span>
      </footer>
    </div>
  );
}

function PublicItemCard({ item, name, description }: { item: MenuItem; name: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex">
      {item.image_url ? (
        <div className="w-28 h-28 shrink-0 overflow-hidden">
          <Image src={item.image_url} alt={name} width={112} height={112} className="w-full h-full object-cover" loading="eager" />
        </div>
      ) : (
        <div className="w-16 shrink-0 bg-orange-50 flex items-center justify-center text-2xl text-orange-200">🍴</div>
      )}
      <div className="flex-1 px-4 py-3.5 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{name}</h3>
          {description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{description}</p>}
        </div>
        <div className="mt-2">
          <span className="inline-block bg-orange-50 text-orange-600 font-black text-sm px-3 py-1 rounded-xl border border-orange-100">
            {Number(item.price).toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
}
