import React, { useState, useRef } from "react";
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

export default function StepResidency({ profile, onNext, onBack, onSaveAndExit, saving, profileId }) {
  const [permitType, setPermitType] = useState(profile.permit_type || "");
  const [permitUrl, setPermitUrl] = useState(profile.permit_url || "");
  const [errors, setErrors] = useState({});
  const permitTypeRef = useRef(null);
  const permitUploadRef = useRef(null);

  const handleNext = () => {
    const e = {};
    if (!permitType) e.permitType = "Bitte wähle deinen Aufenthaltsausweis aus.";
    if (!permitUrl) e.permitUrl = "Bitte lade deinen Ausweis hoch, um fortzufahren.";
    setErrors(e);

    if (Object.keys(e).length > 0) {
      setTimeout(() => {
        const firstRef = e.permitType ? permitTypeRef : permitUploadRef;
        firstRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

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
      validationError={Object.keys(errors).length > 0 ? "Bitte fülle alle markierten Felder aus." : null}
    >
      <div ref={permitTypeRef}>
        <p className="text-sm font-medium text-gray-700 mb-3">Art des Ausweises *</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PERMIT_TYPES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => { setPermitType(p.value); setErrors(prev => ({...prev, permitType: null})); }}
              className={`rounded-xl border-2 p-3 text-left transition-all ${permitType === p.value ? "border-[#FF3CAC] bg-pink-50" : errors.permitType ? "border-red-300 hover:border-red-400" : "border-gray-200 hover:border-pink-300"}`}
            >
              <p className="font-semibold text-sm text-gray-800">{p.label}</p>
              <p className="text-xs text-gray-500">{p.desc}</p>
            </button>
          ))}
        </div>
        {errors.permitType && <p className="text-xs text-red-500 mt-2">{errors.permitType}</p>}
      </div>

      <div ref={permitUploadRef}>
        <DocumentUpload
          label="Ausweis hochladen *"
          value={permitUrl}
          onChange={(url) => { setPermitUrl(url); setErrors(prev => ({...prev, permitUrl: null})); }}
          hint="Vorder- und Rückseite sichtbar, Text lesbar, nicht abgelaufen"
          profileId={profileId}
          documentType="permit"
        />
        {errors.permitUrl && <p className="text-xs text-red-500 mt-1">{errors.permitUrl}</p>}
      </div>

      <div className="bg-pink-50 border border-pink-100 rounded-xl p-3">
        <p className="text-xs text-[#6B0064]">
          ⏳ Nach dem Upload wird dein Ausweis von unserem Team geprüft. Du kannst in der Zwischenzeit mit dem Onboarding fortfahren.
        </p>
      </div>
    </StepCard>
  );
}