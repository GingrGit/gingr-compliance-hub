import React from "react";
import { User, Users } from "lucide-react";

export default function ModeSelector({ onSelect }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <span className="text-4xl font-bold text-rose-500">gingr</span>
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Legal Onboarding</h1>
        <p className="text-gray-500 mt-2 max-w-sm">
          Wie möchtest du das Onboarding starten?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
        <button
          onClick={() => onSelect("self")}
          className="group bg-white rounded-2xl border-2 border-rose-100 hover:border-rose-400 p-7 text-left shadow-sm hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-100 group-hover:bg-rose-200 flex items-center justify-center mb-4 transition-colors">
            <User className="w-6 h-6 text-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Ich mache es selbst</h3>
          <p className="text-sm text-gray-500">
            Du wirst Schritt für Schritt durch den Prozess geführt — in deinem eigenen Tempo.
          </p>
          <span className="inline-block mt-4 text-sm font-semibold text-rose-500 group-hover:translate-x-1 transition-transform">
            Starten →
          </span>
        </button>

        <button
          onClick={() => onSelect("guided")}
          className="group bg-white rounded-2xl border-2 border-amber-100 hover:border-amber-400 p-7 text-left shadow-sm hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center mb-4 transition-colors">
            <Users className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Mit gingr-Mitarbeiter</h3>
          <p className="text-sm text-gray-500">
            Ein Teammitglied von gingr begleitet dich persönlich durch das Onboarding.
          </p>
          <span className="inline-block mt-4 text-sm font-semibold text-amber-500 group-hover:translate-x-1 transition-transform">
            Starten →
          </span>
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-8 text-center max-w-sm">
        Du kannst den Modus jederzeit wechseln. Alle Daten werden automatisch gespeichert.
      </p>
    </div>
  );
}