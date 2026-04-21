import React, { useState, useRef, useEffect } from "react";
import { fetchCountries, savePersonalDataProgress } from "@/lib/gingrOnboardingApi";
import StepCard from "@/components/wizard/StepCard";
import DocumentUpload from "@/components/wizard/DocumentUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";

function NationalityDropdown({ value, onChange, citizenshipGroup, countries, t }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = countries.find((c) => c.code === value);
  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (citizenshipGroup ? c.group === citizenshipGroup : true)
  );

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm hover:border-rose-300 transition-colors"
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.name : t("step_core_data.dropdown.select_country")}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("step_core_data.dropdown.search_placeholder")}
              className="h-8 text-sm"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">{t("step_core_data.dropdown.no_results")}</p>
            )}
            {filtered.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => { onChange(c); setOpen(false); setSearch(""); }}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-rose-50 transition-colors ${value === c.name ? "bg-rose-50 text-rose-700 font-medium" : "text-gray-800"}`}
              >
                <span>{c.name}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {c.group === "CH" ? "CH" : c.group === "EU_EFTA" ? "EU/EFTA" : t("step_core_data.dropdown.group_third_country")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StepCoreData({ profile, updateProfile, onNext, onBack, onSaveAndExit, saving, profileId }) {
  const { t } = useI18n();
  const [countries, setCountries] = useState([]);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  const isValidPhone = (value) => /^[+]?[-\d\s()]{7,}$/.test(String(value || "").trim());
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identityModified, setIdentityModified] = useState(false);
  const formRef = React.useRef(null);

  const calcAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const age = calcAge(profile.date_of_birth);
  const ageError = profile.date_of_birth && age !== null && age < 18;

  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);


  const validateAndNext = async () => {
    const errors = {};
    if (!profile.first_name?.trim()) errors.first_name = t("step_core_data.error.first_name_required");
    if (!profile.last_name?.trim()) errors.last_name = t("step_core_data.error.last_name_required");
    if (!profile.date_of_birth) errors.date_of_birth = t("step_core_data.error.birth_date_required");
    else if (ageError) errors.date_of_birth = t("step_core_data.error.must_be_adult");
    if (!profile.escort_email?.trim()) errors.escort_email = t("step_core_data.error.email_required");
    else if (!isValidEmail(profile.escort_email)) errors.escort_email = "Please enter a valid email address";
    if (!profile.phone?.trim()) errors.phone = t("step_core_data.error.phone_required");
    else if (!isValidPhone(profile.phone)) errors.phone = "Please enter a valid phone number";
    if (!profile.citizenship_group) errors.citizenship_group = t("step_core_data.error.citizenship_required");
    if (!profile.id_document_url || profile.id_document_status === "rejected") {
      errors.id_document_url = t("step_core_data.error.upload_new_identity_document");
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      setTimeout(() => {
        const el = formRef.current?.querySelector(`[data-field="${firstKey}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      setSubmitError(t("step_core_data.error.complete_marked_fields"));
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    const isSwiss = profile.citizenship_group === "CH";
    const nextData = {
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
      country_code: profile.country_code,
      id_document_url: identityModified ? profile.id_document_url : null,
      permit_type: isSwiss ? "none" : profile.permit_type,
      permit_status: isSwiss ? "not_required" : profile.permit_status,
    };

    const saveResult = await savePersonalDataProgress(nextData);
    if (saveResult === false) {
      setSubmitError(t("step_core_data.error.save_failed"));
      setIsSubmitting(false);
      return;
    }

    if (!saveResult) {
      setSubmitError(t("step_core_data.error.save_failed"));
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onNext(nextData, null, { skipDbSave: true });
  };


  const isSwiss = profile.citizenship_group === "CH";
  const showRejectedIdAsEmpty = profile.id_document_status === "rejected";

  const fe = fieldErrors;

  return (
    <StepCard
      title={t("step_core_data.title")}
      subtitle={t("step_core_data.subtitle")}
      onNext={validateAndNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving || isSubmitting}
      validationError={submitError}
    >
      <div className="space-y-4" ref={formRef}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div data-field="first_name">
            <Label className="text-xs text-gray-600 mb-1">{t("step_core_data.label.first_name").charAt(0).toUpperCase() + t("step_core_data.label.first_name").slice(1)}</Label>
            <Input
              value={profile.first_name || ""}
              onChange={(e) => { updateProfile({ first_name: e.target.value }); setFieldErrors(p => ({...p, first_name: null})); }}
              placeholder="Anna"
              className={fe.first_name ? "border-red-400 focus-visible:ring-red-300" : ""}
            />
            {fe.first_name && <p className="text-xs text-red-500 mt-1">{fe.first_name}</p>}
          </div>
          <div data-field="last_name">
            <Label className="text-xs text-gray-600 mb-1">{t("step_core_data.label.last_name").charAt(0).toUpperCase() + t("step_core_data.label.last_name").slice(1)}</Label>
            <Input
              value={profile.last_name || ""}
              onChange={(e) => { updateProfile({ last_name: e.target.value }); setFieldErrors(p => ({...p, last_name: null})); }}
              placeholder="Muster"
              className={fe.last_name ? "border-red-400 focus-visible:ring-red-300" : ""}
            />
            {fe.last_name && <p className="text-xs text-red-500 mt-1">{fe.last_name}</p>}
          </div>
        </div>

        <div data-field="date_of_birth">
          <Label className="text-xs text-gray-600 mb-1">{t("step_core_data.label.date_of_birth").charAt(0).toUpperCase() + t("step_core_data.label.date_of_birth").slice(1)}</Label>
          <Input
            type="date"
            value={profile.date_of_birth || ""}
            onChange={(e) => { updateProfile({ date_of_birth: e.target.value }); setFieldErrors(p => ({...p, date_of_birth: null})); }}
            className={fe.date_of_birth ? "border-red-400 focus-visible:ring-red-300" : ""}
          />
          {fe.date_of_birth && <p className="text-red-500 text-xs mt-1">{fe.date_of_birth}</p>}
        </div>

        <div data-field="escort_email">
          <Label className="text-xs text-gray-600 mb-1">{t("step_core_data.label.email").charAt(0).toUpperCase() + t("step_core_data.label.email").slice(1)}</Label>
          <Input
            type="email"
            value={profile.escort_email || ""}
            onChange={(e) => { updateProfile({ escort_email: e.target.value }); setFieldErrors(p => ({...p, escort_email: null})); }}
            placeholder="anna@beispiel.ch"
            className={fe.escort_email ? "border-red-400 focus-visible:ring-red-300" : ""}
          />
          {fe.escort_email && <p className="text-xs text-red-500 mt-1">{fe.escort_email}</p>}
        </div>

        <div data-field="phone">
          <Label className="text-xs text-gray-600 mb-1">{t("step_core_data.label.phone").charAt(0).toUpperCase() + t("step_core_data.label.phone").slice(1)}</Label>
          <Input
            type="tel"
            value={profile.phone || ""}
            onChange={(e) => { updateProfile({ phone: e.target.value }); setFieldErrors(p => ({...p, phone: null})); }}
            placeholder="+41 79 123 45 67"
            className={fe.phone ? "border-red-400 focus-visible:ring-red-300" : ""}
          />
          {fe.phone && <p className="text-xs text-red-500 mt-1">{fe.phone}</p>}
        </div>

        <div>
          <Label className="text-xs text-gray-600 mb-1">{t("step_core_data.label.address").charAt(0).toUpperCase() + t("step_core_data.label.address").slice(1)}</Label>
          <Input
            value={profile.address || ""}
            onChange={(e) => updateProfile({ address: e.target.value })}
            placeholder="Musterstrasse 1"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600 mb-1">{t("step_core_data.label.postal_code").charAt(0).toUpperCase() + t("step_core_data.label.postal_code").slice(1)}</Label>
            <Input
              value={profile.postal_code || ""}
              onChange={(e) => updateProfile({ postal_code: e.target.value })}
              placeholder="8001"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 mb-1">{t("step_core_data.label.city").charAt(0).toUpperCase() + t("step_core_data.label.city").slice(1)}</Label>
            <Input
              value={profile.city || ""}
              onChange={(e) => updateProfile({ city: e.target.value })}
              placeholder="Zürich"
            />
          </div>
        </div>

        <div data-field="citizenship_group">
          <Label className="text-xs text-gray-600 mb-1">{t("step_core_data.label.citizenship_group").charAt(0).toUpperCase() + t("step_core_data.label.citizenship_group").slice(1)}</Label>
          {fe.citizenship_group && <p className="text-xs text-red-500 mb-1">{fe.citizenship_group}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
            {[
              { value: "CH", label: t("step_core_data.option.switzerland") },
              { value: "EU_EFTA", label: t("step_core_data.option.eu_efta") },
              { value: "NON_EU", label: t("step_core_data.option.third_countries") },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  updateProfile({
                    citizenship_group: opt.value,
                    nationality: opt.value === "CH" ? "CHE" : "",
                    country_code: opt.value === "CH" ? "CHE" : "",
                  });
                }}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  profile.citizenship_group === opt.value
                    ? "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-rose-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {profile.citizenship_group === "CH" && (
            <p className="text-xs text-gray-500 mt-2">{t("step_core_data.notice.swiss_no_permit_required")}</p>
          )}
          {profile.citizenship_group && profile.citizenship_group !== "CH" && (
            <div className="mt-2">
              <NationalityDropdown
                value={profile.country_code || profile.nationality || ""}
                onChange={(country) => updateProfile({ nationality: country.code, country_code: country.code })}
                citizenshipGroup={profile.citizenship_group}
                countries={countries}
                t={t}
              />
            </div>
          )}
        </div>

        <div data-field="id_document_url">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <p className="text-sm font-medium text-gray-900">
              {isSwiss ? t("step_core_data.label.swiss_id_upload") : t("step_core_data.label.foreign_id_upload")}
            </p>
            {profile.id_document_status === "rejected" && (
              <Badge className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">
                {t("step_core_data.status.rejected")}
              </Badge>
            )}
          </div>
          <DocumentUpload
            label=""
            value={showRejectedIdAsEmpty ? "" : (profile.id_document_url || "")}
            onChange={(url) => {
              setIdentityModified(true);
              updateProfile({ id_document_url: url, id_document_status: url ? null : profile.id_document_status });
              setFieldErrors(p => ({...p, id_document_url: null}));
            }}
            hint={true}
            profileId={profileId}
            documentType="id"
            disableDelete={profile.id_document_status === "approved"}
          />
          {fe.id_document_url && <p className="text-xs text-red-500 mt-1">{fe.id_document_url}</p>}
        </div>


      </div>
    </StepCard>
  );
}