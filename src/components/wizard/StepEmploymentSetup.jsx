import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function StepEmploymentSetup({ profile, onNext, onBack, onSaveAndExit, saving }) {
  const { t } = useI18n();
  const [contractSigned, setContractSigned] = useState(profile.contract_signed || false);
  const [payrollConsent, setPayrollConsent] = useState(false);
  const [slug, setSlug] = useState(null);
  const [loadingSlug, setLoadingSlug] = useState(false);
  const [slugError, setSlugError] = useState(null);

  const contractType = profile.work_model === "employee_90days"
    ? t("step_employment_setup.contract_90days_label")
    : t("step_employment_setup.contract_unlimited_label");

  useEffect(() => {
    setLoadingSlug(true);
    base44.functions.invoke("createDocusealSubmission", { profile })
      .then((res) => {
        if (res.data?.slug) {
          setSlug(res.data.slug);
        } else {
          setSlugError(t("step_employment_setup.contract_load_error"));
        }
      })
      .catch(() => setSlugError(t("step_employment_setup.contract_load_error")))
      .finally(() => setLoadingSlug(false));
  }, []);

  useEffect(() => {
    if (document.querySelector('script[src="https://cdn.docuseal.eu/js/form.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://cdn.docuseal.eu/js/form.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const handler = () => setContractSigned(true);
    window.addEventListener("docuseal:completed", handler);
    return () => window.removeEventListener("docuseal:completed", handler);
  }, []);

  return (
    <StepCard
      title={t("step_employment_setup.title")}
      subtitle={t("step_employment_setup.subtitle")}
      onNext={() => onNext({ contract_signed: contractSigned, contract_signed_at: contractSigned ? new Date().toISOString() : null })}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      nextDisabled={!payrollConsent}
      nextLabel={t("step_employment_setup.btn_submit")}
      saving={saving}
    >
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-800 mb-1">📄 {contractType}</p>
        <p className="text-xs text-gray-500">{t("step_employment_setup.contract_desc")}</p>
      </div>

      <InfoAccordion title={t("step_employment_setup.accordion_title")}>
        {t("step_employment_setup.accordion_body")}
      </InfoAccordion>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3">
          <p className="text-sm font-medium text-gray-700">{t("step_employment_setup.docuseal_label")}</p>
        </div>
        <div className="bg-white min-h-[400px] flex items-center justify-center">
          {loadingSlug && (
            <div className="flex flex-col items-center gap-2 text-gray-400 py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm">{t("step_employment_setup.loading_contract")}</p>
            </div>
          )}
          {slugError && (
            <p className="text-sm text-red-500 p-4">{slugError || t("step_employment_setup.error_contract")}</p>
          )}
          {slug && !loadingSlug && (
            <docuseal-form
              data-src={`https://docuseal.eu/d/${slug}`}
              data-email={profile.escort_email || ""}
              style={{ display: "block", width: "100%", minHeight: "400px" }}
            />
          )}
        </div>
      </div>

      {contractSigned && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">{t("step_employment_setup.signed_success")}</p>
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
          {t("step_employment_setup.payroll_consent_label")}
        </p>
      </label>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
        <p className="text-xs text-amber-700">
          {t("step_employment_setup.service_fee_notice")}
        </p>
      </div>
    </StepCard>
  );
}