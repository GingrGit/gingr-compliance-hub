import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import { CheckCircle2, User, Briefcase, Building2, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const BUSINESS_TYPE_LABELS = {
  freelancer: "Freelancer / Einzelunternehmen",
  company: "GmbH / AG",
};

const INVOICE_PROOF_LABELS = {
  signatory: "Unterschriftsberechtigung",
  bank: "Firmen-Bankkonto",
  invoice: "Rechnung im Firmennamen",
  declaration: "Unterzeichnete Gesellschaftserklärung",
};

function DataRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-800 font-medium text-right">{value}</span>
    </div>
  );
}

function SectionBlock({ icon: Icon, title, children }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-[#FF3CAC]" />
        </div>
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function StepSelfEmployedSummary({ profile, onNext, onBack, onSaveAndExit, onSubmit, saving }) {
  const { t } = useI18n();
  const [consent, setConsent] = useState(false);
  const [startDate, setStartDate] = useState(profile.employment_start_date || "");

  const handleNext = async () => {
    if (onSubmit) await onSubmit();
    onNext({ employment_start_date: startDate });
  };

  const isFreelancer = profile.business_type === "freelancer";

  return (
    <StepCard
      title={t("step_self_employed_summary.title")}
      subtitle={t("step_self_employed_summary.subtitle")}
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      nextDisabled={!consent || !startDate}
      nextLabel={t("step_self_employed_summary.submit_button")}
      saving={saving}
    >
      {/* Persönliche Angaben */}
      <SectionBlock icon={User} title="Persönliche Angaben">
        <DataRow label="Name" value={`${profile.first_name || ""} ${profile.last_name || ""}`.trim()} />
        <DataRow label="Geburtsdatum" value={profile.date_of_birth} />
        <DataRow label="Adresse" value={profile.address ? `${profile.address}, ${profile.postal_code || ""} ${profile.city || ""}`.trim() : null} />
        <DataRow label="Telefon" value={profile.phone} />
        <DataRow label="Nationalität" value={profile.nationality} />
      </SectionBlock>

      {/* Unternehmensangaben */}
      <SectionBlock icon={Building2} title="Unternehmensangaben">
        <DataRow label="Unternehmensform" value={BUSINESS_TYPE_LABELS[profile.business_type]} />
        {profile.business_name && <DataRow label="Firmenname" value={profile.business_name} />}
        {profile.uid_number && <DataRow label="UID-Nummer" value={profile.uid_number} />}
      </SectionBlock>

      {/* Dokumente */}
      <SectionBlock icon={FileText} title="Eingereichte Dokumente">
        {isFreelancer && (
          <>
            <DataRow label="AHV-Bestätigung" value={profile.ahv_confirmation_url ? "✓ Hochgeladen" : null} />
            <DataRow
              label="Nachweis Markttätigkeit"
              value={
                profile.activity_proof_urls?.length > 0
                  ? `${profile.activity_proof_urls.length} URL(s) angegeben`
                  : null
              }
            />
          </>
        )}
        {!isFreelancer && (
          <>
            <DataRow label="Handelsregisterauszug" value={profile.commercial_register_url ? "✓ Hochgeladen" : null} />
            <DataRow
              label="Vertretungsnachweis"
              value={
                profile.invoice_proof_type
                  ? `${INVOICE_PROOF_LABELS[profile.invoice_proof_type]} – ✓ Hochgeladen`
                  : null
              }
            />
          </>
        )}
      </SectionBlock>

      {/* Startdatum */}
      <SectionBlock icon={Briefcase} title="Beginn der Zusammenarbeit">
        <p className="text-xs text-gray-500 mb-2">Ab wann möchtest du deine Tätigkeit bei gingr.ch beginnen?</p>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
      </SectionBlock>

      {/* Hinweis Vertrag */}
      <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 text-sm text-[#6B0064]">
        <p className="font-semibold mb-1">Vertragsunterzeichnung im Nachgang</p>
        <p className="text-xs text-gray-600 leading-relaxed">
          Der Kooperationsvertrag wird dir nach Prüfung deiner Unterlagen separat zugestellt. Du wirst per E-Mail benachrichtigt, sobald alles bereit ist.
        </p>
      </div>

      {/* Einverständnis Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div
          onClick={() => setConsent(!consent)}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${consent ? "bg-[#FF3CAC] border-[#FF3CAC]" : "border-gray-300 group-hover:border-pink-300"}`}
        >
          {consent && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>
        <p className="text-sm text-gray-700">
          Ich habe alle Angaben sorgfältig geprüft und bestätige die Richtigkeit meiner eingereichten Unterlagen.
        </p>
      </label>
    </StepCard>
  );
}