import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { CheckCircle2, ShieldCheck, Calendar, Briefcase } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function StepWorkModel({ profile, updateProfile, onNext, onBack, onSaveAndExit, saving }) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(profile.work_model || null);

  const models = [
    {
      id: "employee_unlimited",
      label: t("step_work_model.model_unlimited_label"),
      icon: ShieldCheck,
      desc: t("step_work_model.model_unlimited_desc"),
      pros: [t("step_work_model.model_unlimited_pro1"), t("step_work_model.model_unlimited_pro2"), t("step_work_model.model_unlimited_pro3")],
    },
    {
      id: "employee_90days",
      label: t("step_work_model.model_90days_label"),
      icon: Calendar,
      desc: t("step_work_model.model_90days_desc"),
      pros: [t("step_work_model.model_90days_pro1"), t("step_work_model.model_90days_pro2"), t("step_work_model.model_90days_pro3")],
    },
    {
      id: "self_employed",
      label: t("step_work_model.model_self_employed_label"),
      icon: Briefcase,
      desc: t("step_work_model.model_self_employed_desc"),
      pros: [t("step_work_model.model_self_employed_pro1"), t("step_work_model.model_self_employed_pro2"), t("step_work_model.model_self_employed_pro3")],
    },
  ];

  const handleSelect = (id) => {
    setSelected(id);
    updateProfile({ work_model: id });
  };

  const [showError, setShowError] = useState(false);

  const handleNext = () => {
    if (!selected) { setShowError(true); return; }
    setShowError(false);
    onNext({ work_model: selected });
  };

  return (
    <StepCard
      title={t("step_work_model.title")}
      subtitle={t("step_work_model.subtitle")}
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving}
      validationError={showError ? t("step_work_model.error_select") : null}
    >
      <div className="space-y-3">
        {models.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelect(m.id)}
            className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
              selected === m.id
                ? "border-[#FF3CAC] bg-pink-50"
                : "border-gray-200 hover:border-pink-300 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <m.icon className="w-5 h-5 text-[#FF3CAC]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{m.label}</span>
                  {selected === m.id && <CheckCircle2 className="w-5 h-5 text-[#FF3CAC]" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{m.desc}</p>
                <ul className="mt-2 space-y-1">
                  {m.pros.map((p) => (
                    <li key={p} className="text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3CAC] flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </button>
        ))}
      </div>
    </StepCard>
  );
}