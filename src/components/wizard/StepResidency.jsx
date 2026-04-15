import React, { useEffect, useRef, useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import DocumentUpload from "@/components/wizard/DocumentUpload";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { saveResidencePermitProgress } from "@/lib/gingrOnboardingApi";

export default function StepResidency({ profile, updateProfile, onNext, onBack, onSaveAndExit, saving, profileId }) {
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
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permitModified, setPermitModified] = useState(false);
  const permitTypeRef = useRef(null);
  const permitUploadRef = useRef(null);
  const showRejectedPermitAsEmpty = profile.permit_status === "rejected";

  useEffect(() => {
    setPermitType(profile.permit_type || "");
    setPermitUrl(profile.permit_url || "");
    setErrors({});
    setPermitModified(false);
  }, [profile.permit_type, profile.permit_url]);

  const handleNext = async () => {
    const e = {};
    if (!permitType) e.permitType = t("step_residency.error_permit_type");
    if (!permitUrl || profile.permit_status === "rejected") e.permitUrl = "Please upload a new residence permit";
    setErrors(e);

    if (Object.keys(e).length > 0) {
      setSubmitError(t("step_residency.error_all_fields"));
      setTimeout(() => {
        const firstRef = e.permitType ? permitTypeRef : permitUploadRef;
        firstRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const saveResult = await saveResidencePermitProgress({
      permitFile: permitModified ? permitUrl : null,
      permitType,
    });

    if (saveResult === false || !saveResult) {
      setSubmitError("Saving your residence permit failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
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
      saving={saving || isSubmitting}
      validationError={submitError}
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
      </div>

      <div ref={permitUploadRef}>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <p className="text-sm font-medium text-gray-900">{t("step_residency.label_upload")}</p>
          {profile.permit_status === "rejected" && (
            <Badge className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">
              Rejected
            </Badge>
          )}
        </div>
        <DocumentUpload
          label=""
          value={showRejectedPermitAsEmpty ? "" : permitUrl}
          onChange={(url) => {
            setPermitModified(true);
            setPermitUrl(url);
            setErrors(prev => ({ ...prev, permitUrl: null }));
            if (url) {
              updateProfile({ permit_url: url, permit_status: null });
            }
          }}
          hint={t("step_residency.upload_hint")}
          profileId={profileId}
          documentType="permit"
        />
      </div>

      {(errors.permitType || errors.permitUrl) && (
        <div className="space-y-1">
          {errors.permitType && <p className="text-xs text-red-500">{errors.permitType}</p>}
          {errors.permitUrl && <p className="text-xs text-red-500">{errors.permitUrl}</p>}
        </div>
      )}

      <div className="bg-pink-50 border border-pink-100 rounded-xl p-3">
        <p className="text-xs text-[#6B0064]">
          {t("step_residency.review_notice")}
        </p>
      </div>
    </StepCard>
  );
}