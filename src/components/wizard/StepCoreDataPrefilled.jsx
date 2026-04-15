import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Link2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const ALL_COUNTRIES = [
  { name: "Schweiz", flag: "🇨🇭", group: "CH" },
  { name: "Deutschland", flag: "🇩🇪", group: "EU_EFTA" },
  { name: "Österreich", flag: "🇦🇹", group: "EU_EFTA" },
  { name: "Frankreich", flag: "🇫🇷", group: "EU_EFTA" },
  { name: "Italien", flag: "🇮🇹", group: "EU_EFTA" },
];

function ReadOnlyField({ label, value, icon }) {
  return (
    <div>
      <Label className="text-xs text-gray-500 mb-1">{label}</Label>
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">
        {icon && <span className="text-base leading-none">{icon}</span>}
        <span>{value || "—"}</span>
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto flex-shrink-0" />
      </div>
    </div>
  );
}

const getFlag = (nationality) => {
  const c = ALL_COUNTRIES.find(x => x.name === nationality);
  return c ? c.flag : "🌍";
};

export default function StepCoreDataPrefilled({ profile, updateProfile, onNext, onBack, onSaveAndExit, saving }) {
  const { t } = useI18n();
  const [confirmed, setConfirmed] = useState(false);

  const isSwiss = profile.citizenship_group === "CH";

  const canProceed =
    confirmed &&
    profile.address &&
    profile.postal_code &&
    profile.city;

  const handleNext = () => {
    onNext({
      first_name: profile.first_name,
      last_name: profile.last_name,
      date_of_birth: profile.date_of_birth,
      escort_email: profile.escort_email,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      postal_code: profile.postal_code,
      citizenship_group: profile.citizenship_group,
      nationality: profile.nationality,
      id_document_url: profile.id_document_url || "prefilled",
      permit_type: isSwiss ? "none" : profile.permit_type,
      permit_status: isSwiss ? "not_required" : profile.permit_status,
    });
  };

  const formatDate = (dob) => {
    if (!dob) return "—";
    const d = new Date(dob);
    return d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <StepCard
      title={t("step_core_data_prefilled.title")}
      subtitle={t("step_core_data_prefilled.subtitle")}
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      nextDisabled={!canProceed}
      saving={saving}
    >
      <div className="space-y-5">

        {/* Gingr source banner */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-pink-50 border border-pink-200 rounded-xl">
          <Link2 className="w-4 h-4 text-pink-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-pink-700">{t("step_core_data_prefilled.banner_title")}</p>
            <p className="text-xs text-pink-500">{t("step_core_data_prefilled.banner_desc")}</p>
          </div>
        </div>

        {/* Pre-filled read-only fields */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ReadOnlyField label={t("step_core_data_prefilled.label_first_name")} value={profile.first_name} />
            <ReadOnlyField label={t("step_core_data_prefilled.label_last_name")} value={profile.last_name} />
...
          <ReadOnlyField label={t("step_core_data_prefilled.label_birth_date")} value={formatDate(profile.date_of_birth)} />
          <ReadOnlyField label={t("step_core_data_prefilled.label_email")} value={profile.escort_email} />
          <ReadOnlyField label={t("step_core_data_prefilled.label_phone")} value={profile.phone} />
          <ReadOnlyField
            label={t("step_core_data_prefilled.label_nationality")}
            value={profile.nationality}
            icon={getFlag(profile.nationality)}
          />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">{t("step_core_data_prefilled.divider_text")}</span>
          </div>
        </div>

        {/* Address fields (editable) */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-gray-600 mb-1">{t("step_core_data_prefilled.label_address")}</Label>
            <Input
              value={profile.address || ""}
              onChange={(e) => updateProfile({ address: e.target.value })}
              placeholder={t("step_core_data_prefilled.placeholder_address")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-600 mb-1">{t("step_core_data_prefilled.label_postal_code")}</Label>
              <Input
                value={profile.postal_code || ""}
                onChange={(e) => updateProfile({ postal_code: e.target.value })}
                placeholder={t("step_core_data_prefilled.placeholder_postal_code")}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1">{t("step_core_data_prefilled.label_city")}</Label>
              <Input
                value={profile.city || ""}
                onChange={(e) => updateProfile({ city: e.target.value })}
                placeholder={t("step_core_data_prefilled.placeholder_city")}
              />
            </div>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${confirmed ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}>
          <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${confirmed ? "bg-green-500 border-green-500" : "border-gray-300 bg-white"}`}
            onClick={() => setConfirmed(!confirmed)}
          >
            {confirmed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
          <span className="text-xs text-gray-700 leading-relaxed">
            {t("step_core_data_prefilled.confirmation_text")}
          </span>
        </label>

      </div>
    </StepCard>
  );
}