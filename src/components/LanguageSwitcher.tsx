"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LANGUAGES } from "@/lib/translate";
import { Globe, ChevronDown, X, Check } from "lucide-react";

interface Props {
  value: string;
  onChange: (lang: string) => void;
}

export default function LanguageSwitcher({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const current = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

  function pick(code: string) {
    onChange(code);
    setOpen(false);
  }

  const sheet = (
    <div
      className="fixed inset-0 flex flex-col justify-end sm:items-center sm:justify-center"
      style={{ zIndex: 99999, backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={() => setOpen(false)}
    >
      {/* Sheet — bottom on mobile, centered small popup on desktop */}
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl sm:w-64 w-full pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-8 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="font-semibold text-gray-900 text-sm">Language</p>
          <button onClick={() => setOpen(false)} onTouchEnd={(e) => { e.preventDefault(); setOpen(false); }} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        {/* Options */}
        <div className="py-1 max-h-72 overflow-y-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => pick(lang.code)}
              onTouchEnd={(e) => { e.preventDefault(); pick(lang.code); }}
              className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${
                value === lang.code ? "bg-orange-50" : "hover:bg-gray-50 active:bg-gray-100"
              }`}
            >
              <span className="text-xl leading-none">{lang.flag}</span>
              <span className={`text-sm font-medium ${value === lang.code ? "text-orange-600" : "text-gray-700"}`}>
                {lang.label}
              </span>
              {value === lang.code && (
                <Check size={14} className="ml-auto text-orange-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        onTouchEnd={(e) => { e.preventDefault(); setOpen(true); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-sm font-medium text-white hover:bg-white/25 active:bg-white/30 transition-all"
      >
        <Globe size={14} className="opacity-70" />
        <span className="hidden sm:inline">{current.flag} {current.label}</span>
        <span className="sm:hidden">{current.flag}</span>
        <ChevronDown size={13} className="opacity-60" />
      </button>

      {mounted && open && createPortal(sheet, document.body)}
    </>
  );
}
