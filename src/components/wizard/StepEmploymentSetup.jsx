import React, { useState, useEffect, useRef } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DOCUSEAL_SLUG = "TpXUVLRqaSx2Z1";

export default function StepEmploymentSetup({ profile, onNext, onBack, onSaveAndExit, saving }) {
  const [docuslug, setDocuslug] = useState(null);
  const [loadingSlug, setLoadingSlug] = useState(false);
  const [docuError, setDocuError] = useState(null);
  const [contractSigned, setContractSigned] = useState(profile.contract_signed || false);
  const [payrollConsent, setPayrollConsent] = useState(false);
  const formRef = useRef(null);

  const contractType = profile.work_model === "employee_90days" ? "Kurzarbeitsvertrag (max. 90 Tage)" : "Unbefristeter Arbeitsvertrag";

  // Inject DocuSeal script once
  useEffect(() => {
    if (document.querySelector('script[src="https://cdn.docuseal.com/js/form.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://cdn.docuseal.com/js/form.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Listen for DocuSeal completion event
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.status === "completed" || e.type === "docuseal:completed") {
        setContractSigned(true);
      }
    };
    window.addEventListener("docuseal:completed", handler);
    return () => window.removeEventListener("docuseal:completed", handler);
  }, []);

  return (
    <StepCard
      title="Arbeitsvertrag & Einwilligungen"
      subtitle="Bitte lies und unterzeichne deinen Vertrag, um das Onboarding abzuschliessen."
      onNext={() => onNext({ contract_signed: contractSigned, contract_signed_at: new Date().toISOString() })}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      nextDisabled={!contractSigned || !payrollConsent}
      nextLabel="Abschliessen & Einreichen"
      saving={saving}
    >
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-800 mb-1">📄 {contractType}</p>
        <p className="text-xs text-gray-500">Dieser Vertrag regelt deine Tätigkeit als Escort bei gingr.ch</p>
      </div>

      <InfoAccordion title="Was steht im Vertrag?">
        Der Vertrag regelt deine Arbeitsbedingungen, die Lohnzahlung, die Dienstleistungsgebühr von gingr sowie deine Rechte und Pflichten. Du erhältst nach der Unterzeichnung eine Kopie per E-Mail.
      </InfoAccordion>

      {/* DocuSeal Embed */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3">
          <p className="text-sm font-medium text-gray-700">Digitale Signatur via DocuSeal</p>
        </div>
        <div className="bg-white min-h-40" ref={formRef}>
          {!templateId ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div>
                <p className="text-sm text-amber-600 font-medium">⚠️ Kein Template konfiguriert</p>
                <p className="text-xs text-gray-400 mt-1">Bitte DocuSeal Template-ID in der App hinterlegen.</p>
              </div>
            </div>
          ) : loadingSlug ? (
            <div className="flex items-center justify-center p-8 gap-2">
              <Loader2 className="w-5 h-5 text-rose-400 animate-spin" />
              <p className="text-sm text-gray-500">Vertrag wird geladen…</p>
            </div>
          ) : docuError ? (
            <div className="p-6 text-center">
              <p className="text-sm text-red-500">{docuError}</p>
            </div>
          ) : docuslug ? (
            <docuseal-form
              data-src={`https://docuseal.com/s/${docuslug}`}
              style={{ display: "block", minHeight: "400px" }}
              onCompleted={() => setContractSigned(true)}
            />
          ) : null}
        </div>
      </div>

      {contractSigned && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">Vertrag erfolgreich unterzeichnet!</p>
        </div>
      )}

      <label className="flex items-start gap-3 cursor-pointer group">
        <div
          onClick={() => setPayrollConsent(!payrollConsent)}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${payrollConsent ? "bg-rose-500 border-rose-500" : "border-gray-300 group-hover:border-rose-300"}`}
        >
          {payrollConsent && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>
        <p className="text-sm text-gray-700">
          Ich bin einverstanden, dass gingr.ch meine Lohndaten für die Lohnabrechnung und Sozialversicherung verarbeitet.
        </p>
      </label>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
        <p className="text-xs text-amber-700">
          💰 <strong>Dienstleistungsgebühr:</strong> gingr erhebt eine monatliche Servicepauschale. Details findest du in deinem Vertrag.
        </p>
      </div>
    </StepCard>
  );
}