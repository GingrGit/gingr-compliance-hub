import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import DocumentUpload from "@/components/wizard/DocumentUpload";
import { AlertCircle } from "lucide-react";

const DEFAULT_PERMIT_TYPES = [
  { value: "B", labelKey: "permitB", descKey: "permitBDesc", label: "Ausweis B", desc: "Aufenthaltsbewilligung" },
  { value: "C", labelKey: "permitC", descKey: "permitCDesc", label: "Ausweis C", desc: "Niederlassungsbewilligung" },
  { value: "L", labelKey: "permitL", descKey: "permitLDesc", label: "Ausweis L", desc: "Kurzaufenthaltsbewilligung" },
  { value: "other", labelKey: "permitOther", descKey: "permitOtherDesc", label: "Anderer", desc: "Anderer Aufenthaltstitel" },
];

export default function StepResidency({ profile, onNext, onBack, onSaveAndExit, saving, profileId, t = {} }) {
  const [permitType, setPermitType] = useState(profile.permit_type || "");
  const [permitUrl, setPermitUrl] = useState(profile.permit_url || "");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!permitType) { setError(t.errorNoPermitType || "Bitte wähle deinen Aufenthaltsausweis aus."); return; }
    if (!permitUrl) { setError(t.errorNoPermitDoc || "Bitte lade deinen Ausweis hoch, um fortzufahren."); return; }
    setError("");
    onNext({
      permit_type: permitType,
      permit_url: permitUrl,
      permit_status: "uploaded_review_pending",
    });
  };

  return (
    <StepCard
      title={t.residencyTitle || "Aufenthaltsbewilligung"}
      subtitle={t.residencySubtitle || "Da du keine Schweizer Bürgerin bist, benötigen wir deinen Aufenthaltsausweis."}
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving}
      t={t}
    >
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">{t.permitLabel || "Art des Ausweises"}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEFAULT_PERMIT_TYPES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPermitType(p.value)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${permitType === p.value ? "border-[#FF3CAC] bg-pink-50" : "border-gray-200 hover:border-pink-300"}`}
            >
              <p className="font-semibold text-sm text-gray-800">{t[p.labelKey] || p.label}</p>
              <p className="text-xs text-gray-500">{t[p.descKey] || p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <DocumentUpload
        label={t.uploadPermitLabel || "Ausweis hochladen"}
        value={permitUrl}
        onChange={setPermitUrl}
        hint={t.uploadPermitHint || "Vorder- und Rückseite sichtbar, Text lesbar, nicht abgelaufen"}
        profileId={profileId}
        documentType="permit"
      />

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-pink-50 border border-pink-100 rounded-xl p-3">
        <p className="text-xs text-[#6B0064]">
          {t.residencyPendingNote || "⏳ Nach dem Upload wird dein Ausweis von unserem Team geprüft. Du kannst in der Zwischenzeit mit dem Onboarding fortfahren."}
        </p>
      </div>
    </StepCard>
  );
}