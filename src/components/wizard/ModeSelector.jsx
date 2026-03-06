import React, { useState, useEffect } from "react";
import { User, Users, ShieldCheck, X, Calendar, FileText, CreditCard, Briefcase, Globe } from "lucide-react";
import { createPageUrl } from "@/utils";

const LANGUAGES = [
  { code: "de", name: "Deutsch", flag: "🇩🇪", tagline: "Wähle deine Sprache für das Legal Onboarding" },
  { code: "ro", name: "Română", flag: "🇷🇴", tagline: "Alege limba pentru onboardingul legal" },
  { code: "en", name: "English", flag: "🇬🇧", tagline: "Choose your language for Legal Onboarding" },
  { code: "fr", name: "Français", flag: "🇫🇷", tagline: "Choisissez votre langue pour l'onboarding légal" },
  { code: "es", name: "Español", flag: "🇪🇸", tagline: "Elige tu idioma para el onboarding legal" },
  { code: "it", name: "Italiano", flag: "🇮🇹", tagline: "Scegli la tua lingua per l'onboarding legale" },
  { code: "ru", name: "Русский", flag: "🇷🇺", tagline: "Выберите язык для правового онбординга" },
  { code: "pl", name: "Polski", flag: "🇵🇱", tagline: "Wybierz język dla onboardingu prawnego" },
  { code: "cs", name: "Čeština", flag: "🇨🇿", tagline: "Vyberte jazyk pro právní onboarding" },
  { code: "hu", name: "Magyar", flag: "🇭🇺", tagline: "Válasszon nyelvet a jogi onboardinghoz" },
];

export default function ModeSelector({ onSelect }) {
  const [showGuidedInfo, setShowGuidedInfo] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [rotatingIdx, setRotatingIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setRotatingIdx(i => (i + 1) % LANGUAGES.length);
        setFade(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex flex-col items-center justify-center px-4 relative">
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-sm border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all text-sm font-medium text-gray-700"
          >
            <span className="text-base">{selectedLang.flag}</span>
            <span className="hidden sm:inline">{selectedLang.name}</span>
            <Globe className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {showLangMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
              <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 min-w-[160px] overflow-hidden">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider px-4 pt-1 pb-2">Sprache wählen</p>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setSelectedLang(lang); setShowLangMenu(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-pink-50 transition-colors ${selectedLang.code === lang.code ? "bg-pink-50 text-[#FF3CAC] font-semibold" : "text-gray-700"}`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {selectedLang.code === lang.code && <span className="ml-auto text-[#FF3CAC]">✓</span>}
                  </button>
                ))}
                <div className="mx-4 mt-2 pt-2 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 text-center pb-1">Mehr Sprachen bald verfügbar</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center mb-10">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/73e94775a_GingrLogo4x.png"
          alt="gingr"
          className="h-12 object-contain mx-auto"
        />
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Legal Onboarding</h1>
        <p className="text-gray-500 mt-2 max-w-sm text-sm">
          Wie möchtest du das Onboarding starten?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        {/* Self mode */}
        <button
          onClick={() => onSelect("self")}
          className="group bg-white rounded-3xl border-2 border-transparent hover:border-[#FF3CAC] p-7 text-left shadow-sm hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-pink-100 group-hover:bg-pink-200 flex items-center justify-center mb-4 transition-colors">
            <User className="w-6 h-6 text-[#FF3CAC]" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Ich mache es selbst</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Du wirst Schritt für Schritt durch den Prozess geführt — in deinem eigenen Tempo.
          </p>
          <span className="inline-block mt-5 bg-[#FF3CAC] hover:bg-[#e030a0] text-white text-sm font-semibold rounded-full px-5 py-2 transition-colors shadow-sm">
            Starten →
          </span>
        </button>

        {/* Guided mode */}
        <button
          onClick={() => setShowGuidedInfo(true)}
          className="group bg-white rounded-3xl border-2 border-transparent hover:border-gray-300 p-7 text-left shadow-sm hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-4 transition-colors">
            <Users className="w-6 h-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Mit gingr-Mitarbeiter</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Ein Teammitglied von gingr begleitet dich persönlich durch das Onboarding.
          </p>
          <span className="inline-block mt-5 bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-full px-5 py-2 transition-colors group-hover:border-gray-400">
            Termin buchen →
          </span>
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-8 text-center max-w-sm">
        Du kannst den Modus jederzeit wechseln. Alle Daten werden automatisch gespeichert.
      </p>

      <a
        href={createPageUrl("AdminDashboard")}
        className="mt-6 flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#FF3CAC] transition-colors"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Admin-Dashboard
      </a>

      {/* Guided Mode Modal */}
      {showGuidedInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-7 relative">
            <button
              onClick={() => setShowGuidedInfo(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#FF3CAC]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Termin buchen</h2>
                <p className="text-sm text-gray-500">Onboarding mit gingr-Begleitung</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-5">
              Bitte halte folgende Dokumente bereit, bevor du deinen Termin buchst:
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-[#FF3CAC]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Ausweis / Pass</p>
                  <p className="text-xs text-gray-500">Reisepass oder Personalausweis (gültig)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4 text-[#FF3CAC]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Aufenthaltsbewilligung</p>
                  <p className="text-xs text-gray-500">Für Nicht-Schweizer: Permit B, C, L oder ähnliches</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4 text-[#FF3CAC]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Selbständige: Gewerbenachweis</p>
                  <p className="text-xs text-gray-500">UID-Nummer und Handelsregisterauszug oder ähnliches</p>
                </div>
              </li>
            </ul>

            <a
              href="https://calendly.com/ps-gingr/gingr-legal-onboarding"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-[#FF3CAC] hover:bg-[#e030a0] text-white font-semibold rounded-full py-3 transition-colors shadow-md"
            >
              Jetzt Termin buchen →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}