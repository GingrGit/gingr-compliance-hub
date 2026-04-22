import React, { useState } from "react";
import { createPageUrl } from "@/utils";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { CheckCircle2, User, Briefcase, Calendar, Info } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const WORK_MODEL_KEYS = {
  employee_unlimited: "step_summary.work_model.employee_unlimited",
  employee_90days: "step_summary.work_model.employee_90days",
  self_employed: "step_summary.work_model.self_employed",
};

const PERMIT_KEYS = {
  none: "step_summary.permit.none",
  B: "step_summary.permit.B",
  C: "step_summary.permit.C",
  L: "step_summary.permit.L",
  other: "step_summary.permit.other",
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
  const { t } = useI18n();
  const [consent, setConsent] = useState(false);
  const [startDate, setStartDate] = useState(profile.employment_start_date || "");
  const [startDateTouched, setStartDateTouched] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const isStartDateMissing = !startDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedStartDate = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const isStartDateInPastOrToday = selectedStartDate ? selectedStartDate <= today : false;

  const handleNext = async () => {
    setStartDateTouched(true);
    setSubmitError(null);
    if (isStartDateMissing || isStartDateInPastOrToday || saving) return;
    const submitResult = onSubmit ? await onSubmit(startDate || undefined) : true;
    if (submitResult === false) {
      setSubmitError(t("step_summary.error.submit_failed"));
      return;
    }
    onNext({ employment_start_date: startDate });
  };

  return (
    <StepCard
      title={t("step_summary.title")}
      subtitle={t("step_summary.subtitle")}
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      nextDisabled={saving || !consent || isStartDateMissing || isStartDateInPastOrToday}
      nextLabel={t("step_summary.submit_button")}
      saving={saving}
    >
      {/* Persönliche Angaben */}
      <SectionBlock icon={User} title={t("step_summary.section.personal_details")}>
        <DataRow label={t("step_summary.label.name")} value={`${profile.first_name || ""} ${profile.last_name || ""}`.trim()} />
        <DataRow label={t("step_summary.label.date_of_birth")} value={profile.date_of_birth} />
        <DataRow label={t("step_summary.label.address")} value={profile.address ? `${profile.address}, ${profile.postal_code || ""} ${profile.city || ""}`.trim() : null} />
        <DataRow label={t("step_summary.label.phone")} value={profile.phone} />
        <DataRow label={t("step_summary.label.nationality")} value={profile.nationality} />
      </SectionBlock>

      {/* Arbeits-Details */}
      <SectionBlock icon={Briefcase} title={t("step_summary.section.work_details")}>
        <DataRow label={t("step_summary.label.work_model")} value={profile.work_model ? t(WORK_MODEL_KEYS[profile.work_model]) : null} />
        <DataRow label={t("step_summary.label.source_tax")} value={profile.source_tax === "yes" ? t("step_earnings.source_tax_yes") : profile.source_tax === "no" ? t("step_earnings.source_tax_no") : profile.source_tax === "unsure" ? t("step_earnings.source_tax_unsure") : null} />
        {profile.permit_type && profile.permit_type !== "none" && (
          <DataRow label={t("step_summary.label.permit_type")} value={t(PERMIT_KEYS[profile.permit_type])} />
        )}
        {profile.canton && <DataRow label={t("step_summary.label.canton")} value={profile.canton} />}
      </SectionBlock>

      {/* Startdatum */}
      <SectionBlock icon={Calendar} title={t("step_summary.section.employment_start") }>
        <p className="text-xs text-gray-500 mb-2">{t("step_summary.start_date_description")}</p>
        <input
          type="date"
          value={startDate}
          min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
          onChange={(e) => setStartDate(e.target.value)}
          onBlur={() => setStartDateTouched(true)}
          className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 ${(startDateTouched && (isStartDateMissing || isStartDateInPastOrToday)) ? "border-red-300" : "border-gray-200"}`}
        />
        {startDateTouched && isStartDateMissing && (
          <p className="text-xs text-red-500 mt-2">{t("step_summary.error.start_date_required")}</p>
        )}
        {startDateTouched && !isStartDateMissing && isStartDateInPastOrToday && (
          <p className="text-xs text-red-500 mt-2">{t("step_summary.error.start_date_future_only")}</p>
        )}
      </SectionBlock>

      {/* Lohnberechnung */}
      <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-4 h-4 text-[#FF3CAC]" />
          <span className="text-sm font-semibold text-[#6B0064]">{t("step_summary.salary_calculation_title")}</span>
        </div>

        <div className="space-y-2">
          {[
            { step: "1", label: t("step_summary.salary_step_1_label"), text: t("step_summary.salary_step_1_text") },
            { step: "2", label: t("step_summary.salary_step_2_label"), text: t("step_summary.salary_step_2_text") },
            { step: "3", label: t("step_summary.salary_step_3_label"), text: t("step_summary.salary_step_3_text") },
            { step: "4", label: t("step_summary.salary_step_4_label"), text: t("step_summary.salary_step_4_text") },
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

        <InfoAccordion title={t("step_summary.salary_info_title")}>
          {t("step_summary.salary_info_text")}
        </InfoAccordion>
      </div>

      {/* Ergebnis Box */}
      <div className="bg-white border-2 border-pink-200 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500 mb-1">{t("step_summary.net_salary.title")}</p>
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-gray-700 font-medium">
          <span className="bg-pink-50 px-2 py-1 rounded-full">{t("step_summary.net_salary.income")}</span>
          <span className="text-gray-400">+</span>
          <span className="bg-pink-50 px-2 py-1 rounded-full">{t("step_summary.net_salary.extra_services")}</span>
          <span className="text-gray-400">+</span>
          <span className="bg-pink-50 px-2 py-1 rounded-full">{t("step_summary.net_salary.expenses")}</span>
          <span className="text-gray-400">−</span>
          <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full">{t("step_summary.net_salary.deductions")}</span>
          <span className="text-gray-400">=</span>
          <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full font-bold">{t("step_summary.net_salary.result")}</span>
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
          {t("step_summary.consent_text")}
        </p>
      </label>

      {submitError && (
        <p className="text-sm text-red-600">{submitError}</p>
      )}
    </StepCard>
  );
}