import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import DocumentUpload from "@/components/wizard/DocumentUpload";
import { AlertCircle } from "lucide-react";

const PERMIT_TYPES = [
  { value: "B", label: "Ausweis B", desc: "Aufenthaltsbewilligung" },
  { value: "C", label: "Ausweis C", desc: "Niederlassungsbewilligung" },
  { value: "L", label: "Ausweis L", desc: "Kurzaufenthaltsbewilligung" },
  { value: "other", label: "Anderer", desc: "Anderer Aufenthaltstitel" },
];

export default function StepResidency({ profile, onNext, onBack, onSaveAndExit, saving }) {
  const [permitType, setPermitType] = useState(profile.permit_type || "");
  const [permitUrl, setPermitUrl] = useState(profile.permit_url || "");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!permitType) { setError("Bitte wähle deinen Aufenthaltsausweis aus."); return; }
    if (!permitUrl) { setError("Bitte lade deinen Ausweis hoch, um fortzufahren."); return; }
    setError("");
    onNext({
      permit_type: permitType,
      permit_url: permitUrl,
      permit_status: "uploaded_review_pending",
    });
  };

  return (
    <StepCard
      title="Aufenthaltsbewilligung"
      subtitle="Da du keine Schweizer Bürgerin bist, benötigen wir deinen Aufenthaltsausweis."
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving}
    >
      <InfoAccordion title="Warum wird das benötigt?">
        Gemäss Schweizer Recht müssen wir den legalen Aufenthalt aller Mitarbeiterinnen prüfen. Deine Dokumente werden vertraulich behandelt.
      </InfoAccordion>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Art des Ausweises</p>
        <div className="grid grid-cols-2 gap-3">
          {PERMIT_TYPES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPermitType(p.value)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${permitType === p.value ? "border-rose-400 bg-rose-50" : "border-gray-200 hover:border-rose-200"}`}
            >
              <p className="font-semibold text-sm text-gray-800">{p.label}</p>
              <p className="text-xs text-gray-500">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <DocumentUpload
        label="Ausweis hochladen"
        value={permitUrl}
        onChange={setPermitUrl}
        hint="Vorder- und Rückseite sichtbar, Text lesbar, nicht abgelaufen"
      />

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
        <p className="text-xs text-amber-700">
          ⏳ Nach dem Upload wird dein Ausweis von unserem Team geprüft. Du kannst in der Zwischenzeit mit dem Onboarding fortfahren.
        </p>
      </div>
    </StepCard>
  );
}