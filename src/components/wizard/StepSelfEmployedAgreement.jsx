import React, { useState, useEffect } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { CheckCircle2, Loader2 } from "lucide-react";

const DOCUSEAL_SLUG = "q55FThTXkAsQEG";

export default function StepSelfEmployedAgreement({ profile, onNext, onBack, onSaveAndExit, saving }) {
  const [contractSigned, setContractSigned] = useState(profile.contract_signed || false);

  // Inject DocuSeal script once
  useEffect(() => {
    if (document.querySelector('script[src="https://cdn.docuseal.eu/js/form.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://cdn.docuseal.eu/js/form.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Listen for DocuSeal completion event
  useEffect(() => {
    const handler = () => setContractSigned(true);
    window.addEventListener("docuseal:completed", handler);
    return () => window.removeEventListener("docuseal:completed", handler);
  }, []);

  return (
    <StepCard
      title="Erklärungen & Vereinbarung"
      subtitle="Bitte lies und unterzeichne das Dokument, um das Onboarding abzuschliessen."
      onNext={() => onNext({ contract_signed: true, contract_signed_at: new Date().toISOString() })}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      nextDisabled={!contractSigned}
      nextLabel="Bestätigen & Einreichen"
      saving={saving}
    >
      <InfoAccordion title="Was bedeutet diese Vereinbarung?">
        Als Selbständige arbeitest du auf eigene Rechnung. Dieses Dokument bestätigt deine rechtliche Eigenverantwortung. Du erhältst eine Kopie per E-Mail nach der Unterzeichnung.
      </InfoAccordion>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3">
          <p className="text-sm font-medium text-gray-700">Digitale Signatur via DocuSeal</p>
        </div>
        <div className="bg-white">
          <docuseal-form
            data-src={`https://docuseal.eu/d/${DOCUSEAL_SLUG}`}
            data-email={profile.escort_email || ""}
            style={{ display: "block", minHeight: "400px" }}
          />
        </div>
      </div>

      {contractSigned && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">Dokument erfolgreich unterzeichnet!</p>
        </div>
      )}

      {!contractSigned && (
        <p className="text-xs text-gray-400 text-center">Das Dokument muss unterzeichnet werden, um fortzufahren.</p>
      )}
    </StepCard>
  );
}