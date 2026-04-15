import React, { useEffect, useRef, useState } from "react";
import { FileCheck2, Globe } from "lucide-react";
import { getGingrBaseUrl } from "@/lib/env";
import { useI18n } from "@/lib/i18n";
import { LANGUAGES } from "@/components/language";

export default function AlreadySubmitted() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white border border-pink-100 shadow-sm p-8 text-center relative">
        <div ref={ref} className="absolute right-4 top-4 text-left">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            <span className="text-base leading-none">{current.flag}</span>
            <Globe className="w-3 h-3" />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[140px]">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-pink-50 transition-colors text-left ${l.code === lang ? "text-[#FF3CAC] font-semibold" : "text-gray-700"}`}
                >
                  <span>{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mx-auto mb-5">
          <FileCheck2 className="w-8 h-8 text-[#FF3CAC]" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">{t("already_submitted.title") !== "title" ? t("already_submitted.title") : "Form already submitted"}</h1>
        <p className="text-sm text-gray-500 leading-6 mb-8">
          {t("already_submitted.description") !== "description" ? t("already_submitted.description") : "This onboarding form has already been submitted and can no longer be edited here."}
        </p>

        <a
          href={getGingrBaseUrl()}
          className="w-full inline-flex items-center justify-center bg-[#FF3CAC] hover:bg-[#e0309a] text-white text-sm font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {t("already_submitted.button") !== "button" ? t("already_submitted.button") : "Back to Gingr"}
        </a>
      </div>
    </div>
  );
}