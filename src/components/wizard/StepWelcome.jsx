import React from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, HeartHandshake } from "lucide-react";

export default function StepWelcome({ onNext, mode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-[#F49FFC]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          {mode === "guided" ? "Willkommen zum geführten Onboarding" : "Willkommen bei gingr"}
        </h1>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          {mode === "guided"
            ? "Du begleitest jetzt eine Escort durch das legale Onboarding. Folge den Schritten gemeinsam."
            : "Wir führen dich Schritt für Schritt durch alles, was du brauchst, um legal in der Schweiz zu arbeiten."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Clock, title: "~15 Minuten", desc: "Durchschnittliche Dauer" },
          { icon: ShieldCheck, title: "100% sicher", desc: "Verschlüsselte Daten" },
          { icon: HeartHandshake, title: "Jederzeit pausieren", desc: "Autosave aktiv" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-pink-50 rounded-xl p-4 text-center">
            <Icon className="w-5 h-5 text-[#F49FFC] mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
        <p className="text-sm font-medium text-yellow-700 mb-1">Was du bereit haben solltest:</p>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Ausweis / Pass</li>
          <li>Aufenthaltsbewilligung (falls nicht Schweizerin)</li>
          <li>Angaben zu deiner Steuersituation (optional)</li>
        </ul>
      </div>

      <Button
        onClick={() => onNext({})}
        className="w-full bg-[#F49FFC] hover:bg-[#e080f0] text-white rounded-xl py-6 text-base font-semibold"
      >
        Jetzt starten →
      </Button>
    </div>
  );
}