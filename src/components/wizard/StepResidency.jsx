import React, { useEffect, useRef, useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import DocumentUpload from "@/components/wizard/DocumentUpload";
import { useI18n } from "@/lib/i18n";
import { saveResidencePermitProgress } from "@/lib/gingrOnboardingApi";

export default function StepResidency({ profile, onNext, onBack, onSaveAndExit, saving, profileId }) {
  const { t } = useI18n();
  const PERMIT_TYPES = [
    { value: "B", label: t("step_residency.permit_b_label"), desc: t("step_residency.permit_b_desc") },
    { value: "C", label: t("step_residency.permit_c_label"), desc: t("step_residency.permit_c_desc") },
    { value: "L", label: t("step_residency.permit_l_label"), desc: t("step_residency.permit_l_desc") },
    { value: "other", label: t("step_residency.permit_other_label"), desc: t("step_residency.permit_other_desc") },
  ];
  const [permitType, setPermitType] = useState(profile.permit_type || "");
  const [permitUrl, setPermitUrl] = useState(profile.permit_url || "");
  const [errors, setErrors] = useState({});
  const permitTypeRef = useRef(null);
  const permitUploadRef = useRef(null);

  useEffect(() => {
    setPermitType(profile.permit_type || "");
    setPermitUrl(profile.permit_url || "");
    setErrors({});
  }, [profile.permit_type, profile.permit_url]);

  const handleNext = async () => {
    const e = {};
    if (!permitType) e.permitType = t("step_residency.error_permit_type");
    if (!permitUrl) e.permitUrl = t("step_residency.error_upload");
    setErrors(e);

    if (Object.keys(e).length > 0) {
      setTimeout(() => {
        const firstRef = e.permitType ? permitTypeRef : permitUploadRef;
        firstRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    await saveResidencePermitProgress({
      permitFile: permitUrl,
      permitType,
    });

    onNext({
      permit_type: permitType,
      permit_url: permitUrl,
      permit_status: "uploaded_review_pending",
    }, null, { skipDbSave: true });
  };

  return (
    <StepCard
      title={t("step_residency.title")}
      subtitle={t("step_residency.subtitle")}
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving}
      validationError={Object.keys(errors).length > 0 ? t("step_residency.error_all_fields") : null}
    >
      <div ref={permitTypeRef}>
        <p className="text-sm font-medium text-gray-700 mb-3">{t("step_residency.label_permit_type")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PERMIT_TYPES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => { setPermitType(p.value); setErrors(prev => ({ ...prev, permitType: null })); }}
              className={`rounded-xl border-2 p-3 text-left transition-all ${permitType === p.value ? "border-[#FF3CAC] bg-pink-50" : errors.permitType ? "border-red-300 hover:border-red-400" : "border-gray-200 hover:border-pink-300"}`}
            >
              <p className="font-semibold text-sm text-gray-800">{p.label}</p>
              <p className="text-xs text-gray-500">{p.desc}</p>
            </button>
          ))}
        </div>
        {errors.permitType && <p className="text-xs text-red-500 mt-2">{errors.permitType}</p>}
      </div>

      <div ref={permitUploadRef}>
        <DocumentUpload
          label={t("step_residency.label_upload")}
          value={permitUrl}
          onChange={(url) => { setPermitUrl(url); setErrors(prev => ({ ...prev, permitUrl: null })); }}
          hint={t("step_residency.upload_hint")}
          profileId={profileId}
          documentType="permit"
        />
        {errors.permitUrl && <p className="text-xs text-red-500 mt-1">{errors.permitUrl}</p>}
      </div>

      <div className="bg-pink-50 border border-pink-100 rounded-xl p-3">
        <p className="text-xs text-[#6B0064]">
          {t("step_residency.review_notice")}
        </p>
      </div>
    </StepCard>
  );
}