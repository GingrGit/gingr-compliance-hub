import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { CheckCircle2, User, Briefcase, Calendar, ChevronRight, Info, LayoutDashboard, FileText, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

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

export default function StepSummary({ profile, updateProfile, onNext, onBack, onSaveAndExit, onSubmit, saving, profileId }) {
  const [consent, setConsent] = useState(false);
  const [startDate, setStartDate] = useState(profile.employment_start_date || "");
  const [submitted, setSubmitted] = useState(false);

  const handleNext = async () => {
    await onNext({ employment_start_date: startDate });
    if (onSubmit) await onSubmit();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vielen Dank! 🎉</h2>
        <p className="text-gray-600 text-sm mb-1">Wir haben alle deine Angaben erhalten.</p>
        <p className="text-gray-500 text-sm mb-7">
          Unser Team prüft jetzt deine Unterlagen. Sobald alles verifiziert ist, wirst du von uns per <strong>SMS und E-Mail</strong> benachrichtigt.
        </p>
        <div className="bg-pink-50 border border-pink-100 rounded-xl p-5 text-left mb-7 space-y-3">
          <p className="text-xs font-semibold text-[#6B0064] uppercase tracking-wide mb-1">Was jetzt passiert</p>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-3 h-3 text-[#6B0064]" />
            </div>
            <p className="text-sm text-gray-700">Wir prüfen deine eingereichten Dokumente und Angaben.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <LayoutDashboard className="w-3 h-3 text-[#6B0064]" />
            </div>
            <p className="text-sm text-gray-700">In deinem Dashboard siehst du jederzeit den Status deiner Dokumente und die Freigabe.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bell className="w-3 h-3 text-[#6B0064]" />
            </div>
            <p className="text-sm text-gray-700">Du erhältst eine Benachrichtigung per <strong>SMS und E-Mail</strong>, sobald dein Account freigegeben ist.</p>
          </div>
        </div>
        <a href={getDashboardUrl(profile, profileId)}>
          <Button className="w-full bg-[#FF3CAC] hover:bg-[#e030a0] text-white rounded-full py-3 text-base font-semibold shadow-md">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Zu meinem Work Dashboard
          </Button>
        </a>
      </div>
    );
  }

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