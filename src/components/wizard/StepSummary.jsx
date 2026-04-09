import React, { useState } from "react";
import { createPageUrl } from "@/utils";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { CheckCircle2, User, Briefcase, Calendar, Info } from "lucide-react";

const WORK_MODEL_LABELS = {
  employee_unlimited: "Angestelltenverhältnis (unbefristet)",
  employee_90days: "Angestelltenverhältnis (max. 90 Tage)",
  self_employed: "Selbstständig",
};

const PERMIT_LABELS = {
  none: "Kein Permit",
  B: "Aufenthaltsbewilligung B",
  C: "Niederlassungsbewilligung C",
  L: "Kurzaufenthaltsbewilligung L",
  other: "Anderes",
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

function getDashboardUrl(profile, profileId) {
  const id = profileId || profile?.id;
  if (id) return createPageUrl("WorkModelDashboard") + `?profile_id=${id}`;
  return createPageUrl("WorkModelDashboard");
}

export default function StepSummary({ profile, updateProfile, onNext, onBack, onSaveAndExit, onSubmit, saving }) {
  const [consent, setConsent] = useState(false);
  const [startDate, setStartDate] = useState(profile.employment_start_date || "");

  const handleNext = async () => {
    if (onSubmit) await onSubmit();
    onNext({ employment_start_date: startDate });
  };

  return (
    <StepCard
      title="Zusammenfassung & Antrag"
      subtitle="Bitte überprüfe deine Angaben und bestätige die Konditionen."
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      nextDisabled={!consent || !startDate}
      nextLabel="Antrag einreichen"
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

      {/* Arbeits-Details */}
      <SectionBlock icon={Briefcase} title="Arbeits-Details">
        <DataRow label="Arbeitsmodell" value={WORK_MODEL_LABELS[profile.work_model]} />
        <DataRow label="Quellensteuer" value={profile.source_tax === "yes" ? "Ja" : profile.source_tax === "no" ? "Nein" : profile.source_tax === "unsure" ? "Unsicher" : null} />
        {profile.permit_type && profile.permit_type !== "none" && (
          <DataRow label="Aufenthaltsbewilligung" value={PERMIT_LABELS[profile.permit_type]} />
        )}
        {profile.canton && <DataRow label="Kanton" value={profile.canton} />}
      </SectionBlock>

      {/* Startdatum */}
      <SectionBlock icon={Calendar} title="Beginn des Arbeitsverhältnisses">
        <p className="text-xs text-gray-500 mb-2">Ab wann möchtest du deine Tätigkeit bei gingr.ch beginnen?</p>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
      </SectionBlock>

      {/* Lohnberechnung */}
      <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-4 h-4 text-[#FF3CAC]" />
          <span className="text-sm font-semibold text-[#6B0064]">So wird dein Lohn berechnet</span>
        </div>

        <div className="space-y-2">
          {[
            { step: "1", label: "Einkommen von gingr.ch", text: "Dein Einkommen wird durch den standardisierten Stundensatz von CHF 200 dividiert. Das Resultat sind deine Arbeitsstunden." },
            { step: "2", label: "Zusatzservices", text: "Zusatzleistungen werden arbeitsrechtlich als «Bonus» verbucht und zu deinen Arbeitsstunden addiert." },
            { step: "3", label: "Fahr- & Reisespesen", text: "Spesen werden separat abgerechnet und fliessen nicht in die Lohnberechnung ein." },
            { step: "4", label: "Abzüge", text: "Vom Bruttolohn werden die gesetzlichen Sozialversicherungsbeiträge, die monatliche QUITT-Gebühr von CHF 50 sowie die Gingr Service Fee abgezogen." },
          ].map(({ step, label, text }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#FF3CAC] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step}</div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-600">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <InfoAccordion title="Warum CHF 200 Stundensatz?">
          Der standardisierte Stundensatz von CHF 200 wird verwendet, um dein auf gingr.ch generiertes Einkommen in Arbeitsstunden umzurechnen. Dies ermöglicht eine rechtskonforme Lohnabrechnung, unabhängig von deinen individuellen Preismodellen auf der Plattform.
        </InfoAccordion>
      </div>

      {/* Ergebnis Box */}
      <div className="bg-white border-2 border-pink-200 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500 mb-1">Dein Nettolohn ergibt sich aus:</p>
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-gray-700 font-medium">
          <span className="bg-pink-50 px-2 py-1 rounded-full">Einkommen gingr.ch</span>
          <span className="text-gray-400">+</span>
          <span className="bg-pink-50 px-2 py-1 rounded-full">Zusatzservices</span>
          <span className="text-gray-400">+</span>
          <span className="bg-pink-50 px-2 py-1 rounded-full">Spesen</span>
          <span className="text-gray-400">−</span>
          <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full">Abzüge & Gebühren</span>
          <span className="text-gray-400">=</span>
          <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full font-bold">Nettolohn</span>
        </div>
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
          Ich habe alle Angaben sorgfältig geprüft und bin mit der dargestellten Berechnungsmethode sowie den Konditionen des Arbeitsverhältnisses einverstanden.
        </p>
      </label>
    </StepCard>
  );
}