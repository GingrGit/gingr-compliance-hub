import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { CheckCircle2, AlertCircle } from "lucide-react";

function computeEligibility(profile) {
  const { citizenship_group, permit_type, permit_status } = profile;
  const options = [];

  if (citizenship_group === "CH" || citizenship_group === "EU_EFTA" || permit_type === "C") {
    options.push({
      id: "employee_unlimited",
      label: "Angestellte (unbefristet)",
      emoji: "📋",
      desc: "Du bist berechtigt für ein unbefristetes Anstellungsverhältnis.",
      available: true,
    });
  }

  if (permit_type === "B" || permit_type === "L" || citizenship_group === "EU_EFTA") {
    options.push({
      id: "employee_90days",
      label: "Angestellte (max. 90 Tage)",
      emoji: "📅",
      desc: "Kurzfristiger Vertrag, ideal für deine Situation.",
      available: true,
    });
  }

  if (citizenship_group === "CH" || citizenship_group === "EU_EFTA" || permit_type === "C") {
    options.push({
      id: "self_employed",
      label: "Selbständig",
      emoji: "🏢",
      desc: "Du kannst auf eigene Rechnung arbeiten. UID-Nachweis erforderlich.",
      available: true,
    });
  }

  if (options.length === 0) {
    options.push({
      id: "none",
      label: "Kein Modell verfügbar",
      emoji: "⚠️",
      desc: "Aufgrund deiner aktuellen Situation ist derzeit kein Arbeitsmodell möglich. Bitte kontaktiere uns.",
      available: false,
    });
  }

  return options;
}

export default function StepEligibility({ profile, onNext, onBack, onSaveAndExit, saving }) {
  const options = computeEligibility(profile);
  const [selected, setSelected] = useState(profile.work_model || null);
  const [showError, setShowError] = useState(false);
  const availableOptions = options.filter((o) => o.available);

  const handleNext = () => {
    if (!selected || !availableOptions.find((o) => o.id === selected)) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onNext({ work_model: selected });
  };

  return (
    <StepCard
      title="Deine Optionen"
      subtitle="Basierend auf deinen Angaben stehen dir folgende Modelle zur Verfügung."
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving}
      validationError={showError ? "Bitte wähle ein verfügbares Modell aus, um fortzufahren." : null}
    >
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
        <p className="text-sm text-green-700">Deine Daten wurden geprüft. Wähle jetzt dein bevorzugtes Modell.</p>
      </div>

      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            disabled={!opt.available}
            onClick={() => opt.available && setSelected(opt.id)}
            className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
              !opt.available
                ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                : selected === opt.id
                ? "border-[#FF3CAC] bg-pink-50"
                : "border-gray-200 hover:border-pink-300"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                </div>
              </div>
              {selected === opt.id && <CheckCircle2 className="w-5 h-5 text-[#FF3CAC] flex-shrink-0 mt-1" />}
            </div>
          </button>
        ))}
      </div>

      {profile.permit_status === "uploaded_review_pending" && (
        <div className="flex items-start gap-2 bg-pink-50 border border-pink-100 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-[#FF3CAC] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#6B0064]">
            Dein Ausweis wird noch geprüft. Du kannst trotzdem weitermachen — die endgültige Aktivierung erfolgt nach der Prüfung.
          </p>
        </div>
      )}
    </StepCard>
  );
}