// MyMemory free translation API — no API key needed
// Docs: https://mymemory.translated.net/doc/spec.php

const cache = new Map<string, string>();

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text.trim() || targetLang === "original") return text;

  const key = `${targetLang}::${text}`;
  if (cache.has(key)) return cache.get(key)!;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${targetLang}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const json = await res.json();
    const translated: string = json?.responseData?.translatedText ?? text;
    cache.set(key, translated);
    return translated;
  } catch {
    return text;
  }
}

export async function translateBatch(
  texts: string[],
  targetLang: string
): Promise<string[]> {
  if (targetLang === "original") return texts;
  return Promise.all(texts.map((t) => translateText(t, targetLang)));
}

export const LANGUAGES = [
  { code: "original", label: "Original",  flag: "🌐" },
  { code: "en",       label: "English",   flag: "🇬🇧" },
  { code: "fr",       label: "Français",  flag: "🇫🇷" },
  { code: "ar",       label: "العربية",   flag: "🇩🇿" },
  { code: "es",       label: "Español",   flag: "🇪🇸" },
  { code: "it",       label: "Italiano",  flag: "🇮🇹" },
  { code: "de",       label: "Deutsch",   flag: "🇩🇪" },
  { code: "zh",       label: "中文",       flag: "🇨🇳" },
  { code: "pt",       label: "Português", flag: "🇵🇹" },
];
