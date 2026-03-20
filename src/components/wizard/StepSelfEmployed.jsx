import React, { useState, useRef } from "react";
import StepCard from "@/components/wizard/StepCard";
import DocumentUpload from "@/components/wizard/DocumentUpload";
import { CheckCircle2, User, Building2, Plus, X, Link } from "lucide-react";
import { Input } from "@/components/ui/input";

const BUSINESS_TYPES = [
  {
    id: "freelancer",
    title: "Freelancer / Einzelunternehmen",
    Icon: User,
    desc: "Du arbeitest auf eigene Rechnung und unter deinem eigenen Namen oder als Einzelfirma — ohne separate Gesellschaft.",
  },
  {
    id: "company",
    title: "GmbH / AG",
    Icon: Building2,
    desc: "Du arbeitest über eine von dir betriebene, im Handelsregister eingetragene Gesellschaft (GmbH oder AG).",
  },
];

export default function StepSelfEmployed({ profile, onNext, onBack, onSaveAndExit, saving, profileId }) {
  const [businessType, setBusinessType] = useState(profile.business_type || null);
  const [ahvUrl, setAhvUrl] = useState(profile.ahv_confirmation_url || "");
  const [activityUrls, setActivityUrls] = useState(
    profile.activity_proof_urls ? profile.activity_proof_urls : (profile.activity_proof_url ? [profile.activity_proof_url] : [""])
  );
  const [newActivityUrl, setNewActivityUrl] = useState("");
  const [commercialRegisterUrl, setCommercialRegisterUrl] = useState(profile.commercial_register_url || "");
  const [invoiceProofUrl, setInvoiceProofUrl] = useState(profile.invoice_proof_url || "");
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!businessType) e.businessType = "Bitte wähle deine Unternehmensform aus.";

    if (businessType === "freelancer") {
      if (!ahvUrl) e.ahvUrl = "Bitte lade die AHV-Bestätigung hoch.";
      if (!activityProofUrl) e.activityProofUrl = "Bitte lade einen Tätigkeitsnachweis hoch.";
    }
    if (businessType === "company") {
      if (!commercialRegisterUrl) e.commercialRegisterUrl = "Bitte lade den Handelsregisterauszug hoch.";
      if (!invoiceProofUrl) e.invoiceProofUrl = "Bitte lade einen Abrechnungsnachweis hoch.";
    }
    if (businessType && !confirmed) e.confirmed = "Bitte bestätige die Erklärung, um fortzufahren.";

    setErrors(e);
    if (Object.keys(e).length > 0) {
      setTimeout(() => {
        const el = formRef.current?.querySelector("[data-error]");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;
    onNext({
      business_type: businessType,
      ahv_confirmation_url: ahvUrl,
      activity_proof_url: activityProofUrl,
      commercial_register_url: commercialRegisterUrl,
      invoice_proof_url: invoiceProofUrl,
      self_employed_confirmed: confirmed,
    });
  };

  return (
    <StepCard
      title="Deine rechtliche Unternehmensform"
      subtitle="Wähle aus, über welche Struktur du mit gingr zusammenarbeiten möchtest."
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving}
      validationError={Object.keys(errors).length > 0 ? "Bitte fülle alle markierten Felder aus." : null}
    >
      <div className="space-y-5" ref={formRef}>

        {/* Type selection */}
        <div data-error={errors.businessType ? "true" : undefined}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BUSINESS_TYPES.map((bt) => (
              <button
                key={bt.id}
                type="button"
                onClick={() => { setBusinessType(bt.id); setErrors((p) => ({ ...p, businessType: null, confirmed: null })); setConfirmed(false); }}
                className={`text-left rounded-2xl border-2 p-5 transition-all ${
                  businessType === bt.id
                    ? "border-[#FF3CAC] bg-pink-50 shadow-sm"
                    : errors.businessType
                    ? "border-red-300 bg-white hover:border-red-400"
                    : "border-gray-200 bg-white hover:border-[#FF3CAC] hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${businessType === bt.id ? "bg-pink-100" : "bg-gray-100"}`}>
                      <bt.Icon className={`w-5 h-5 ${businessType === bt.id ? "text-[#FF3CAC]" : "text-gray-400"}`} />
                    </div>
                    <p className={`font-semibold text-sm ${businessType === bt.id ? "text-[#6B0064]" : "text-gray-900"}`}>{bt.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{bt.desc}</p>
                  </div>
                  {businessType === bt.id && (
                    <CheckCircle2 className="w-5 h-5 text-[#FF3CAC] flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>
            ))}
          </div>
          {errors.businessType && <p data-error="true" className="text-xs text-red-500 mt-2">{errors.businessType}</p>}
        </div>

        {/* Freelancer path */}
        {businessType === "freelancer" && (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div data-error={errors.ahvUrl ? "true" : undefined}>
              <DocumentUpload
                label="AHV-Bestätigung der Selbständigkeit *"
                value={ahvUrl}
                onChange={(url) => { setAhvUrl(url); setErrors((p) => ({ ...p, ahvUrl: null })); }}
                hint="Offizielle Bestätigung der AHV-Ausgleichskasse"
                profileId={profileId}
                documentType="ahv_confirmation"
              />
              {errors.ahvUrl && <p className="text-xs text-red-500 mt-1">{errors.ahvUrl}</p>}
            </div>

            <div data-error={errors.activityProofUrl ? "true" : undefined}>
              <DocumentUpload
                label="Nachweis selbständiger Markttätigkeit *"
                value={activityProofUrl}
                onChange={(url) => { setActivityProofUrl(url); setErrors((p) => ({ ...p, activityProofUrl: null })); }}
                hint="z.B. Rechnung an Dritte, Website-Screenshot, Profil auf einer anderen Plattform o.ä."
                profileId={profileId}
                documentType="activity_proof"
              />
              {errors.activityProofUrl && <p className="text-xs text-red-500 mt-1">{errors.activityProofUrl}</p>}
            </div>

            {/* Freelancer declaration */}
            <div className={`rounded-xl border p-4 ${errors.confirmed ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`} data-error={errors.confirmed ? "true" : undefined}>
              <p className="text-sm font-semibold text-gray-800 mb-2">Selbstdeklaration</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Ich bestätige hiermit, dass ich auf eigene Rechnung und auf eigenes Risiko tätig bin, selbst entscheide, ob ich Buchungen annehme, meine Arbeit eigenständig organisiere und für meine Steuern sowie meine Sozialversicherungen selbst verantwortlich bin.
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => { setConfirmed(e.target.checked); setErrors((p) => ({ ...p, confirmed: null })); }}
                  className="mt-0.5 accent-[#FF3CAC] w-4 h-4 flex-shrink-0"
                />
                <span className="text-xs font-medium text-gray-700">
                  Ich bestätige diese Selbstdeklaration *
                </span>
              </label>
              {errors.confirmed && <p className="text-xs text-red-500 mt-2">{errors.confirmed}</p>}
            </div>
          </div>
        )}

        {/* Company path */}
        {businessType === "company" && (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div data-error={errors.commercialRegisterUrl ? "true" : undefined}>
              <DocumentUpload
                label="Handelsregisterauszug *"
                value={commercialRegisterUrl}
                onChange={(url) => { setCommercialRegisterUrl(url); setErrors((p) => ({ ...p, commercialRegisterUrl: null })); }}
                hint="Aktueller Auszug aus dem Handelsregister (nicht älter als 12 Monate)"
                profileId={profileId}
                documentType="commercial_register"
              />
              {errors.commercialRegisterUrl && <p className="text-xs text-red-500 mt-1">{errors.commercialRegisterUrl}</p>}
            </div>

            <div data-error={errors.invoiceProofUrl ? "true" : undefined}>
              <DocumentUpload
                label="Nachweis der Abrechnung über die Gesellschaft *"
                value={invoiceProofUrl}
                onChange={(url) => { setInvoiceProofUrl(url); setErrors((p) => ({ ...p, invoiceProofUrl: null })); }}
                hint="z.B. Firmen-Bankkonto-Nachweis, Muster-Rechnung der Gesellschaft o.ä."
                profileId={profileId}
                documentType="invoice_proof"
              />
              {errors.invoiceProofUrl && <p className="text-xs text-red-500 mt-1">{errors.invoiceProofUrl}</p>}
            </div>

            {/* Company declaration */}
            <div className={`rounded-xl border p-4 ${errors.confirmed ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`} data-error={errors.confirmed ? "true" : undefined}>
              <p className="text-sm font-semibold text-gray-800 mb-2">Selbstdeklaration</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Ich bestätige hiermit, dass die Gesellschaft der Vertragspartner von gingr ist, ich berechtigt bin, für die Gesellschaft zu handeln, und die Gesellschaft für sämtliche steuerlichen, versicherungsrechtlichen und sozialversicherungsrechtlichen Verpflichtungen verantwortlich ist.
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => { setConfirmed(e.target.checked); setErrors((p) => ({ ...p, confirmed: null })); }}
                  className="mt-0.5 accent-[#FF3CAC] w-4 h-4 flex-shrink-0"
                />
                <span className="text-xs font-medium text-gray-700">
                  Ich bestätige diese Selbstdeklaration *
                </span>
              </label>
              {errors.confirmed && <p className="text-xs text-red-500 mt-2">{errors.confirmed}</p>}
            </div>
          </div>
        )}
      </div>
    </StepCard>
  );
}