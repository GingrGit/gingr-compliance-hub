import React, { useState, useRef } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import DocumentUpload from "@/components/wizard/DocumentUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StepSelfEmployed({ profile, onNext, onBack, onSaveAndExit, saving, profileId }) {
  const [data, setData] = useState({
    business_name: profile.business_name || "",
    uid_number: profile.uid_number || "",
    business_proof_url: profile.business_proof_url || "",
  });
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const set = (k) => (e) => {
    setData((p) => ({ ...p, [k]: typeof e === "string" ? e : e.target.value }));
    setErrors((p) => ({ ...p, [k]: null }));
  };

  const validate = () => {
    const e = {};
    if (!data.business_name) e.business_name = "Firmenname ist erforderlich";
    if (!data.uid_number) e.uid_number = "UID-Nummer ist erforderlich";
    if (!data.business_proof_url) e.business_proof_url = "Bitte lade einen Nachweis hoch";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setTimeout(() => {
        const firstKey = Object.keys(e)[0];
        const el = formRef.current?.querySelector(`[data-field="${firstKey}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return false;
    }
    return true;
  };

  return (
    <StepCard
      title="Geschäftsdetails (Selbständig)"
      subtitle="Wir benötigen einen Nachweis deiner selbständigen Tätigkeit."
      onNext={() => { if (validate()) onNext(data); }}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving}
    >
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Name des Unternehmens / Einzelfirma *</Label>
          <Input
            value={data.business_name}
            onChange={set("business_name")}
            className={`mt-1 ${errors.business_name ? "border-red-400" : ""}`}
            placeholder="z.B. Maria Müller"
          />
          {errors.business_name && <p className="text-xs text-red-500 mt-1">{errors.business_name}</p>}
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">UID-Nummer *</Label>
          <Input
            value={data.uid_number}
            onChange={set("uid_number")}
            className={`mt-1 ${errors.uid_number ? "border-red-400" : ""}`}
            placeholder="CHE-123.456.789"
          />
          {errors.uid_number && <p className="text-xs text-red-500 mt-1">{errors.uid_number}</p>}
          <p className="text-xs text-gray-400 mt-1">
            Deine UID findest du auf{" "}
            <a href="https://www.uid.admin.ch" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:underline">
              uid.admin.ch
            </a>
          </p>
        </div>

        <DocumentUpload
          label="Nachweis der Selbständigkeit *"
          value={data.business_proof_url}
          onChange={(url) => setData((p) => ({ ...p, business_proof_url: url }))}
          hint="UID-Registerauszug, Handelsregistereintrag oder Bestätigung"
          profileId={profileId}
          documentType="business_proof"
        />
        {errors.business_proof_url && <p className="text-xs text-red-500">{errors.business_proof_url}</p>}
      </div>
    </StepCard>
  );
}