import React, { useState } from "react";
import StepCard from "./StepCard";
import InfoAccordion from "./InfoAccordion";
import { CheckCircle2, ExternalLink } from "lucide-react";

export default function StepEmploymentSetup({ profile, onNext, onBack, onSaveAndExit, saving }) {
  const [agreed, setAgreed] = useState(profile.contract_signed || false);
  const [payrollConsent, setPayrollConsent] = useState(false);

  const contractType = profile.work_model === "employee_90days" ? "Kurzarbeitsvertrag (max. 90 Tage)" : "Unbefristeter Arbeitsvertrag";

  return (
    <StepCard
      title="Arbeitsvertrag & Einwilligungen"
      subtitle="Bitte lies und unterzeichne deinen Vertrag, um das Onboarding abzuschliessen."
      onNext={() => onNext({ contract_signed: agreed, contract_signed_at: new Date().toISOString() })}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      nextDisabled={!agreed || !payrollConsent}
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

      {/* DocuSeal Integration */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Digitale Signatur</p>
          <a
            href="https://www.docuseal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-rose-500 flex items-center gap-1 hover:underline"
          >
            DocuSeal <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="p-4 bg-white min-h-32 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">Vertragsdokument wird geladen…</p>
            <p className="text-xs text-gray-400">
              In der finalen Integration wird hier das DocuSeal-Signiertool eingebettet.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => setAgreed(!agreed)}
            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${agreed ? "bg-rose-500 border-rose-500" : "border-gray-300 group-hover:border-rose-300"}`}
          >
            {agreed && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
          <p className="text-sm text-gray-700">
            Ich habe den Arbeitsvertrag gelesen und stimme den Bedingungen zu. Ich bestätige, dass alle meine Angaben korrekt und wahrheitsgemäss sind.
          </p>
        </label>

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
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
        <p className="text-xs text-amber-700">
          💰 <strong>Dienstleistungsgebühr:</strong> gingr erhebt eine monatliche Servicepauschale. Details findest du in deinem Vertrag.
        </p>
      </div>
    </StepCard>
  );
}