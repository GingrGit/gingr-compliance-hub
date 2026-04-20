/**
 * i18n system — fetches translations from Crowdin distributions.
 * Translations are cached in memory for the session.
 * Usage: const { t, lang, setLang, loading } = useI18n();
 *        t("mode_selector.title")
 */

import { useState, useEffect, createContext, useContext } from "react";

const CROWDIN_BASE = "https://distributions.crowdin.net/7aafb57dc2dca9f73657089cx5x/content";

const SUPPORTED_LANGS = ["de", "en", "fr", "es", "it", "ro", "ru", "pl", "cs", "hu"];
const DEFAULT_LANG = "de";

// In-memory cache: { "de": { "mode_selector.title": "Legal Onboarding", ... }, ... }
const cache = {};

function getStoredLang() {
  try {
    const code = localStorage.getItem("gingr_lang");
    return SUPPORTED_LANGS.includes(code) ? code : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function storeLang(code) {
  try {
    localStorage.setItem("gingr_lang", code);
  } catch {}
}

async function fetchTranslations(lang) {
  if (cache[lang]) return cache[lang];
  const res = await fetch(`${CROWDIN_BASE}/${lang}.json`);
  if (!res.ok) throw new Error(`Failed to load translations for ${lang}`);
  const data = await res.json();
  // Convert array of { identifier, translation } → flat object
  const map = {};
  for (const entry of data) {
    map[entry.identifier] = entry.translation || entry.source_string;
  }
  cache[lang] = map;
  return map;
}

// Context
export const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getStoredLang);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTranslations(lang)
      .then(setTranslations)
      .catch(async () => {
        if (lang === DEFAULT_LANG) {
          setTranslations({});
          return;
        }
        const fallback = await fetchTranslations(DEFAULT_LANG).catch(() => ({}));
        setTranslations(fallback);
      })
      .finally(() => setLoading(false));
  }, [lang]);

  const setLang = (code) => {
    storeLang(code);
    setLangState(code);
  };

  const t = (key, vars) => {
    let str = translations[key];
    if (!str) {
      return key.split(".").pop().replace(/_/g, " ");
    }
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
    }
    return str;
  };

  return (
    <I18nContext.Provider value={{ t, lang, setLang, loading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}