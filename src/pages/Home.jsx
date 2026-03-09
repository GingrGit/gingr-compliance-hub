import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, FolderLock, Globe } from "lucide-react";
import LogoHeader from "@/components/home/LogoHeader";
import { createPageUrl } from "@/utils";
import { LANGUAGES, TRANSLATIONS, getStoredLanguage, storeLanguage } from "@/components/language";

export default function Home() {
  const [selectedLang, setSelectedLang] = useState(getStoredLanguage);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [rotatingIdx, setRotatingIdx] = useState(0);
  const [fade, setFade] = useState(true);

  const t = TRANSLATIONS[selectedLang.code] || TRANSLATIONS.de;

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setRotatingIdx((i) => (i + 1) % LANGUAGES.length);
        setFade(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleLangSelect = (lang) => {
    setSelectedLang(lang);
    storeLanguage(lang);
    setShowLangMenu(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F0F0]">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <LogoHeader />
        </motion.div>

        {/* Cards */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => window.location.href = createPageUrl("OnboardingWizard")}
            className="group bg-white rounded-3xl border-2 border-transparent hover:border-[#FF3CAC] p-7 text-left shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-pink-100 group-hover:bg-pink-200 flex items-center justify-center mb-4 transition-colors">
              <ShieldCheck className="w-6 h-6 text-[#FF3CAC]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{t.homeOnboardingTitle}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">{t.homeOnboardingDesc}</p>
            <span className="inline-block bg-[#FF3CAC] hover:bg-[#e030a0] text-white text-sm font-semibold rounded-full px-5 py-2 transition-colors shadow-sm">
              {t.homeOnboardingBtn}
            </span>
          </button>

          <button
            onClick={() => window.location.href = createPageUrl("MagicLinkLogin")}
            className="group bg-white rounded-3xl border-2 border-transparent hover:border-gray-300 p-7 text-left shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-4 transition-colors">
              <FolderLock className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{t.homeDocsTitle}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">{t.homeDocsDesc}</p>
            <span className="inline-block bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-full px-5 py-2 transition-colors group-hover:border-gray-400">
              {t.homeDocsBtn}
            </span>
          </button>
        </div>

        {/* Language Selector */}
        <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-xl">
          <div className="h-5 flex items-center justify-center">
            <p
              style={{ transition: "opacity 0.3s ease", opacity: fade ? 1 : 0 }}
              className="text-xs text-gray-400 text-center"
            >
              <span className="mr-1">{LANGUAGES[rotatingIdx].flag}</span>
              {LANGUAGES[rotatingIdx].tagline}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-sm border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all text-sm font-semibold text-gray-700"
            >
              <span className="text-base">{selectedLang.flag}</span>
              <span>{selectedLang.name}</span>
              <Globe className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </button>
            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-12 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 min-w-[200px] overflow-hidden">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-4 pt-1 pb-2">{t.langLabel}</p>
                  <div className="grid grid-cols-2 gap-0">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangSelect(lang)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-pink-50 transition-colors ${selectedLang.code === lang.code ? "bg-pink-50 text-[#FF3CAC] font-semibold" : "text-gray-700"}`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400 flex items-center justify-center gap-3">
        <span>© {new Date().getFullYear()} Gingr</span>
        <span>·</span>
        <a href="mailto:support@gingr.ch" className="hover:text-[#6B0064] transition-colors">
          {t.homeNeedHelp}
        </a>
      </footer>
    </div>
  );
}