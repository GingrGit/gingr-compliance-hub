import React from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, HeartHandshake } from "lucide-react";

export default function StepWelcome({ onNext, mode, t = {} }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-[#FF3CAC]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          {mode === "guided" ? (t.welcomeTitleGuided || "Willkommen zum geführten Onboarding") : (t.welcomeTitle || "Willkommen bei gingr")}
        </h1>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          {mode === "guided"
            ? (t.welcomeDescGuided || "Du begleitest jetzt eine Escort durch das legale Onboarding. Folge den Schritten gemeinsam.")
            : (t.welcomeDesc || "Wir führen dich Schritt für Schritt durch alles, was du brauchst, um legal in der Schweiz zu arbeiten.")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
        {[
          { icon: Clock, title: t.welcomeStat1Title || "~15 Minuten", desc: t.welcomeStat1Desc || "Durchschnittliche Dauer" },
          { icon: ShieldCheck, title: t.welcomeStat2Title || "100% sicher", desc: t.welcomeStat2Desc || "Verschlüsselte Daten" },
          { icon: HeartHandshake, title: t.welcomeStat3Title || "Jederzeit pausieren", desc: t.welcomeStat3Desc || "Autosave aktiv" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-pink-50 rounded-xl p-4 text-center">
            <Icon className="w-5 h-5 text-[#FF3CAC] mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 mb-8">
        <p className="text-sm font-medium text-[#6B0064] mb-1">{t.welcomeChecklist || "Was du bereit haben solltest:"}</p>
        <ul className="text-sm text-[#6B0064] space-y-1 list-disc list-inside">
          <li>{t.welcomeItem1 || "Identitätskarte oder Pass"}</li>
          <li>{t.welcomeItem2 || "Aufenthaltsbewilligung (falls nicht Schweizer*in)"}</li>
          <li>{t.welcomeItem3 || "AHV Bestätigung oder Handelsregisterauszug (falls du Selbstständig tätig bist)"}</li>
          <li>{t.welcomeItem4 || "Deine Bankverbindung / IBAN"}</li>
        </ul>
      </div>

      <Button
        onClick={() => onNext({})}
        className="w-full bg-[#FF3CAC] hover:bg-[#e030a0] text-white rounded-full py-6 text-base font-semibold shadow-md"
      >
        {t.welcomeStart || "Jetzt starten →"}
      </Button>
    </div>
  );
}