import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import { CheckCircle2, ShieldCheck, Calendar, Briefcase } from "lucide-react";

export default function StepWorkModel({ profile, updateProfile, onNext, onBack, onSaveAndExit, saving, t = {} }) {
  const [selected, setSelected] = useState(profile.work_model || null);

  const models = [
    {
      id: "employee_unlimited",
      label: t.workModel1Label || "Angestellte (unbefristet)",
      icon: ShieldCheck,
      desc: t.workModel1Desc || "Du arbeitest als Angestellte bei gingr. Unbefristeter Vertrag.",
      pros: [t.workModel1Pro1 || "Lohnabrechnung & Sozialversicherung durch gingr", t.workModel1Pro2 || "Klare rechtliche Absicherung", t.workModel1Pro3 || "Für CH / EU / Permit C"],
    },
    {
      id: "employee_90days",
      label: t.workModel2Label || "Angestellte (max. 90 Tage)",
      icon: Calendar,
      desc: t.workModel2Desc || "Kurzfristiges Anstellungsverhältnis, bis 90 Tage pro Jahr.",
      pros: [t.workModel2Pro1 || "Für Permit B/L geeignet", t.workModel2Pro2 || "Flexibel & unkompliziert", t.workModel2Pro3 || "Quellensteuer inklusive"],
    },
    {
      id: "self_employed",
      label: t.workModel3Label || "Selbständig",
      icon: Briefcase,
      desc: t.workModel3Desc || "Du arbeitest auf eigene Rechnung als selbständige Escort.",
      pros: [t.workModel3Pro1 || "Eigenes Unternehmen / UID-Nummer erforderlich", t.workModel3Pro2 || "Mehr Flexibilität", t.workModel3Pro3 || "Eigene Buchhaltung"],
    },
  ];

  const handleSelect = (id) => {
    setSelected(id);
    updateProfile({ work_model: id });
  };

  return (
    <StepCard
      title={t.workModelTitle || "Wähle dein Arbeitsmodell"}
      subtitle={t.workModelSubtitle || "Das bestimmt, welche Verträge und Dokumente du benötigst."}
      onNext={() => onNext({ work_model: selected })}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      nextDisabled={!selected}
      saving={saving}
      t={t}
    >
      <div className="space-y-3">
        {models.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelect(m.id)}
            className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
              selected === m.id
                ? "border-[#FF3CAC] bg-pink-50"
                : "border-gray-200 hover:border-pink-300 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <m.icon className="w-5 h-5 text-[#FF3CAC]" />
              </div>
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