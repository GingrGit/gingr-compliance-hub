import React, { useEffect, useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { saveWorkModelProgress } from "@/lib/gingrOnboardingApi";

function computeEligibility(profile, t) {
  const { citizenship_group, permit_type } = profile;
  const options = [];

  if (citizenship_group === "CH" || citizenship_group === "EU_EFTA" || permit_type === "C") {
    options.push({ id: "employee_unlimited", label: t("step_eligibility.model_unlimited_label"), emoji: "📋", desc: t("step_eligibility.model_unlimited_desc"), available: true });
  }
  if (permit_type === "B" || permit_type === "L" || citizenship_group === "EU_EFTA") {
    options.push({ id: "employee_90days", label: t("step_eligibility.model_90days_label"), emoji: "📅", desc: t("step_eligibility.model_90days_desc"), available: true });
  }
  if (citizenship_group === "CH" || citizenship_group === "EU_EFTA" || permit_type === "C") {
    options.push({ id: "self_employed", label: t("step_eligibility.model_self_employed_label"), emoji: "🏢", desc: t("step_eligibility.model_self_employed_desc"), available: true });
  }
  if (options.length === 0) {
    options.push({ id: "none", label: t("step_eligibility.model_none_label"), emoji: "⚠️", desc: t("step_eligibility.model_none_desc"), available: false });
  }
  return options;
}

export default function StepEligibility({ profile, onNext, onBack, onSaveAndExit, saving }) {
  const { t } = useI18n();
  const options = computeEligibility(profile, t);
  const [selected, setSelected] = useState(profile.work_model || null);
  const [showError, setShowError] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableOptions = options.filter((o) => o.available);
  const hasAvailableOptions = availableOptions.length > 0;

  useEffect(() => {
    setSelected(profile.work_model || null);
  }, [profile.work_model]);

  const handleNext = async () => {
    if (!selected || !availableOptions.find((o) => o.id === selected)) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setSubmitError(null);
    setIsSubmitting(true);
    const saveResult = await saveWorkModelProgress(selected);
    if (saveResult === false) {
      setSubmitError("Saving your eligibility selection failed. Please try again.");
      setIsSubmitting(false);
      return;
    }
    onNext({ work_model: selected }, null, { skipDbSave: true });
    setIsSubmitting(false);
  };

  return (
    <StepCard
      title={t("step_eligibility.title")}
      subtitle={t("step_eligibility.subtitle")}
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving || isSubmitting}
      validationError={submitError || (showError ? t("step_eligibility.error_select") : null)}
    >
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
        <p className="text-sm text-green-700">{t("step_eligibility.verified_notice")}</p>
      </div>

      <div className="space-y-3">
        {!hasAvailableOptions ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">{t("step_eligibility.model_none_desc")}</p>
          </div>
        ) : options.map((opt) => (
          <button
            key={opt.id}
            disabled={!opt.available}
            onClick={() => opt.available && setSelected(opt.id)}
            className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
              !opt.available
                ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                : selected === opt.id
                ? "border-[#FF3CAC] bg-pink-50"
                : "border-gray-200 hover:border-pink-300"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                </div>
              </div>
              {selected === opt.id && <CheckCircle2 className="w-5 h-5 text-[#FF3CAC] flex-shrink-0 mt-1" />}
            </div>
          </button>
        ))}
      </div>

      {profile.permit_status === "uploaded_review_pending" && (
        <div className="flex items-start gap-2 bg-pink-50 border border-pink-100 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-[#FF3CAC] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#6B0064]">
            {t("step_eligibility.permit_pending_notice")}
          </p>
        </div>
      )}
    </StepCard>
  );
}