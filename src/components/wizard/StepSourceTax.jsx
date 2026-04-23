import React, { useEffect, useState, useRef } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { saveTaxInfoProgress } from "@/lib/gingrOnboardingApi";

const CANTONS = ["AG","AI","AR","BE","BL","BS","FR","GE","GL","GR","JU","LU","NE","NW","OW","SG","SH","SO","SZ","TG","TI","UR","VD","VS","ZG","ZH"];

export default function StepSourceTax({ profile, onNext, onBack, onSaveAndExit, saving }) {
  const { t } = useI18n();
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [d, setD] = useState({
    canton: profile.canton || "",
    municipality: profile.municipality || "",
    marital_status: profile.marital_status || "",
    partner_in_household: profile.partner_in_household || "",
    partner_income_ch: profile.partner_income_ch || "",
    has_children: profile.has_children || "",
    children_count: profile.children_count || 0,
    children_in_household: profile.children_in_household || "",
    receives_child_allowance: profile.receives_child_allowance || "",
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (v) => setD((p) => ({ ...p, [k]: typeof v === "object" ? v.target.value : v }));

  const formRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!d.canton) e.canton = t("step_source_tax.error_canton");
    if (!d.marital_status) e.marital_status = t("step_source_tax.error_marital_status");
    if (!d.has_children) e.has_children = t("step_source_tax.error_all_fields");
    if (requiresPartnerDetails && !d.partner_in_household) e.partner_in_household = t("step_source_tax.error_all_fields");
    if (requiresPartnerDetails && !d.partner_income_ch) e.partner_income_ch = t("step_source_tax.error_all_fields");
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setTimeout(() => {
        const firstKey = Object.keys(e)[0];
        const el = formRef.current?.querySelector(`[data-field="${firstKey}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return false;
    }
    return true;
  };

  const requiresPartnerDetails = d.marital_status === "married" || d.marital_status === "partnership";
  const showPartner = requiresPartnerDetails;

  useEffect(() => {
    setErrors((prev) => {
      const next = { ...prev };

      if (!requiresPartnerDetails) {
        delete next.partner_in_household;
        delete next.partner_income_ch;
      }

      if (d.has_children !== "yes") {
        delete next.children_in_household;
        delete next.receives_child_allowance;
      }

      return next;
    });
  }, [requiresPartnerDetails, d.has_children]);

  const hasVisibleRequiredErrors = Boolean(
    errors.canton ||
    errors.marital_status ||
    errors.has_children ||
    (requiresPartnerDetails && (errors.partner_in_household || errors.partner_income_ch))
  );

  const handleNext = async () => {
    if (!validate()) return;
    setSubmitError(null);
    setIsSubmitting(true);
    const saveResult = await saveTaxInfoProgress(d);
    if (saveResult === false) {
      setSubmitError("Saving your tax information failed. Please try again.");
      setIsSubmitting(false);
      return;
    }
    onNext(d, null, { skipDbSave: true });
    setIsSubmitting(false);
  };

  return (
    <StepCard
      title={t("step_source_tax.title")}
      subtitle={t("step_source_tax.subtitle")}
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving || isSubmitting}
      validationError={submitError || (hasVisibleRequiredErrors ? t("step_source_tax.error_all_fields") : null)}
    >
      <InfoAccordion title={t("step_source_tax.accordion_title")}>
        {t("step_source_tax.accordion_body")}
      </InfoAccordion>

      <div ref={formRef} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div data-field="canton">
          <Label className="text-sm font-medium text-gray-700">{t("step_source_tax.label_canton")}</Label>
          <select
            value={d.canton}
            onChange={(e) => { set("canton")(e); setErrors(p => ({...p, canton: null})); }}
            className={`mt-1 w-full border rounded-md px-3 py-2 text-sm ${errors.canton ? "border-red-400" : "border-gray-300"}`}
          >
            <option value="">{t("step_source_tax.placeholder_canton")}</option>
            {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.canton && <p className="text-xs text-red-500 mt-1">{errors.canton}</p>}
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">{t("step_source_tax.label_municipality")}</Label>
          <Input value={d.municipality} onChange={set("municipality")} className="mt-1" placeholder={t("step_source_tax.placeholder_municipality")} />
        </div>
      </div>

      <div data-field="marital_status">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">{t("step_source_tax.label_marital_status")}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[["single", t("step_source_tax.marital_single")], ["married", t("step_source_tax.marital_married")], ["partnership", t("step_source_tax.marital_partnership")], ["divorced", t("step_source_tax.marital_divorced")], ["widowed", t("step_source_tax.marital_widowed")], ["unsure", t("step_source_tax.marital_unsure")]].map(([v, l]) => (
            <button key={v} type="button" onClick={() => {
              set("marital_status")(v);
              setErrors(p => ({
                ...p,
                marital_status: null,
                partner_in_household: null,
                partner_income_ch: null,
              }));
            }}
              className={`rounded-lg border p-2 text-xs font-medium transition-all ${d.marital_status === v ? "border-[#FF3CAC] bg-pink-50 text-[#6B0064]" : errors.marital_status ? "border-red-300 text-gray-600" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}>
              {l}
            </button>
          ))}
        </div>
        {errors.marital_status && <p className="text-xs text-red-500 mt-1">{errors.marital_status}</p>}
      </div>

      {showPartner && (
        <div data-field="partner_in_household" className="space-y-3 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm font-medium text-gray-700">{t("step_source_tax.partner_section_title")}</p>
          <div>
            <Label className="text-xs text-gray-600">{t("step_source_tax.label_partner_in_household")}</Label>
            <div className="flex gap-2 mt-1">
              {[["yes", t("step_source_tax.btn_yes")],["no", t("step_source_tax.btn_no")],["unsure", t("step_source_tax.btn_unsure")]].map(([v,l]) => (
                <button key={v} type="button" onClick={() => { set("partner_in_household")(v); setErrors(p => ({ ...p, partner_in_household: null })); }}
                  className={`flex-1 rounded-lg border p-2 text-xs font-medium transition-all ${d.partner_in_household === v ? "border-[#FF3CAC] bg-pink-50 text-[#6B0064]" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-600">{t("step_source_tax.label_partner_income_ch")}</Label>
            <div className="flex gap-2 mt-1">
              {[["yes", t("step_source_tax.btn_yes")],["no", t("step_source_tax.btn_no")],["unsure", t("step_source_tax.btn_unsure")]].map(([v,l]) => (
                <button key={v} type="button" onClick={() => { set("partner_income_ch")(v); setErrors(p => ({ ...p, partner_income_ch: null })); }}
                  className={`flex-1 rounded-lg border p-2 text-xs font-medium transition-all ${d.partner_income_ch === v ? "border-[#FF3CAC] bg-pink-50 text-[#6B0064]" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div data-field="has_children">
          <Label className="text-sm font-medium text-gray-700">{t("step_source_tax.label_has_children")}</Label>
            <div className="flex gap-2 mt-1">
              {[["yes", t("step_source_tax.btn_yes")],["no", t("step_source_tax.btn_no")]].map(([v,l]) => (
              <button key={v} type="button" onClick={() => { set("has_children")(v); setErrors(p => ({ ...p, has_children: null, children_in_household: null, receives_child_allowance: null })); }}
                className={`flex-1 rounded-lg border p-2 text-sm font-medium transition-all ${d.has_children === v ? "border-[#FF3CAC] bg-pink-50 text-[#6B0064]" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {d.has_children === "yes" && (
          <div data-field="children_in_household" className="p-4 bg-gray-50 rounded-xl space-y-3">
            <div>
              <Label className="text-xs text-gray-600">{t("step_source_tax.label_children_count")}</Label>
              <Input type="number" min="0" value={d.children_count} onChange={(e) => setD((p) => ({ ...p, children_count: Math.max(0, parseInt(e.target.value) || 0) }))} className="mt-1 w-24" placeholder="1" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">{t("step_source_tax.label_children_in_household")}</Label>
              <div className="flex gap-2 mt-1">
                {[["yes", t("step_source_tax.btn_yes")],["no", t("step_source_tax.btn_no")]].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => { set("children_in_household")(v); setErrors(p => ({ ...p, children_in_household: null })); }}
                    className={`flex-1 rounded-lg border p-2 text-xs font-medium transition-all ${d.children_in_household === v ? "border-[#FF3CAC] bg-pink-50 text-[#6B0064]" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">{t("step_source_tax.label_receives_child_allowance")}</Label>
              <div className="flex gap-2 mt-1">
                {[["yes", t("step_source_tax.btn_yes")],["no", t("step_source_tax.btn_no")],["unsure", t("step_source_tax.btn_unsure")]].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => { set("receives_child_allowance")(v); setErrors(p => ({ ...p, receives_child_allowance: null })); }}
                    className={`flex-1 rounded-lg border p-2 text-xs font-medium transition-all ${d.receives_child_allowance === v ? "border-[#FF3CAC] bg-pink-50 text-[#6B0064]" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </StepCard>
  );
}