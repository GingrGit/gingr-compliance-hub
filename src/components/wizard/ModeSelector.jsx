import React, { useState } from "react";
import { User, Users, ShieldCheck, X, Calendar, FileText, CreditCard, Briefcase } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function ModeSelector({ onSelect }) {
  const [showGuidedInfo, setShowGuidedInfo] = useState(false);

  return (
    <div className="min-h-screen bg-[#F0F0F0] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/73e94775a_GingrLogo4x.png" alt="gingr" className="h-12 object-contain mx-auto" />
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Legal Onboarding</h1>
        <p className="text-gray-500 mt-2 max-w-sm">
          Wie möchtest du das Onboarding starten?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
        <button
          onClick={() => onSelect("self")}
          className="group bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-500 p-7 text-left shadow-sm hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center mb-4 transition-colors">
            <User className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Ich mache es selbst</h3>
          <p className="text-sm text-gray-500">
            Du wirst Schritt für Schritt durch den Prozess geführt — in deinem eigenen Tempo.
          </p>
          <span className="inline-block mt-4 text-sm font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">
            Starten →
          </span>
        </button>

        <button
          onClick={() => setShowGuidedInfo(true)}
          className="group bg-white rounded-2xl border-2 border-yellow-200 hover:border-yellow-400 p-7 text-left shadow-sm hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-yellow-100 group-hover:bg-yellow-200 flex items-center justify-center mb-4 transition-colors">
            <Users className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Mit gingr-Mitarbeiter</h3>
          <p className="text-sm text-gray-500">
            Ein Teammitglied von gingr begleitet dich persönlich durch das Onboarding.
          </p>
          <span className="inline-block mt-4 text-sm font-semibold text-yellow-600 group-hover:translate-x-1 transition-transform">
            Termin buchen →
          </span>
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-8 text-center max-w-sm">
        Du kannst den Modus jederzeit wechseln. Alle Daten werden automatisch gespeichert.
      </p>

      <a
        href={createPageUrl("AdminDashboard")}
        className="mt-6 flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-600 transition-colors"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Admin-Dashboard
      </a>

      {/* Guided Mode Modal */}
      {showGuidedInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-7 relative">
            <button
              onClick={() => setShowGuidedInfo(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600" />
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
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Ausweis / Pass</p>
                  <p className="text-xs text-gray-500">Reisepass oder Personalausweis (gültig)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Aufenthaltsbewilligung</p>
                  <p className="text-xs text-gray-500">Für Nicht-Schweizer: Permit B, C, L oder ähnliches</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4 text-green-500" />
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
              className="block w-full text-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl py-3 transition-colors"
            >
              Jetzt Termin buchen →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}