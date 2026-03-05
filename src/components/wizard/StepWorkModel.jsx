import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { CheckCircle2 } from "lucide-react";

const models = [
  {
    id: "employee_unlimited",
    label: "Angestellte (unbefristet)",
    emoji: "📋",
    desc: "Du arbeitest als Angestellte bei gingr. Unbefristeter Vertrag.",
    pros: ["Lohnabrechnung & Sozialversicherung durch gingr", "Klare rechtliche Absicherung", "Für CH / EU / Permit C"],
  },
  {
    id: "employee_90days",
    label: "Angestellte (max. 90 Tage)",
    emoji: "📅",
    desc: "Kurzfristiges Anstellungsverhältnis, bis 90 Tage pro Jahr.",
    pros: ["Für Permit B/L geeignet", "Flexibel & unkompliziert", "Quellensteuer inklusive"],
  },
  {
    id: "self_employed",
    label: "Selbständig",
    emoji: "🏢",
    desc: "Du arbeitest auf eigene Rechnung als selbständige Escort.",
    pros: ["Eigenes Unternehmen / UID-Nummer erforderlich", "Mehr Flexibilität", "Eigene Buchhaltung"],
  },
];

export default function StepWorkModel({ profile, onNext, onBack, onSaveAndExit, saving }) {
  const [selected, setSelected] = useState(profile.work_model || null);

  return (
    <StepCard
      title="Wähle dein Arbeitsmodell"
      subtitle="Das bestimmt, welche Verträge und Dokumente du benötigst."
      onNext={() => onNext({ work_model: selected })}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      nextDisabled={!selected}
      saving={saving}
    >
      <InfoAccordion title="Nicht sicher? Hier mehr erfahren">
        <p>Die Wahl des Arbeitsmodells bestimmt deine rechtliche Stellung. Als Angestellte kümmert sich gingr um Steuern und Versicherungen. Als Selbständige bist du für deine eigene Buchhaltung verantwortlich. Du kannst uns jederzeit kontaktieren, wenn du unsicher bist.</p>
      </InfoAccordion>

      <div className="space-y-3">
        {models.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
              selected === m.id
                ? "border-[#FF3CAC] bg-pink-50"
                : "border-gray-200 hover:border-pink-300 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{m.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{m.label}</span>
                  {selected === m.id && <CheckCircle2 className="w-5 h-5 text-[#FF3CAC]" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{m.desc}</p>
                <ul className="mt-2 space-y-1">
                  {m.pros.map((p) => (
                    <li key={p} className="text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3CAC] flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </button>
        ))}
      </div>
    </StepCard>
  );
}