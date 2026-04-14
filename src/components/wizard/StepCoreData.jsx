import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { fetchCountries, savePersonalDataProgress } from "@/lib/gingrOnboardingApi";
import StepCard from "@/components/wizard/StepCard";
import DocumentUpload from "@/components/wizard/DocumentUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

function NationalityDropdown({ value, onChange, citizenshipGroup, countries }) {
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
          {selected ? selected.name : "Land auswählen…"}
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
              placeholder="Suchen…"
              className="h-8 text-sm"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Keine Ergebnisse</p>
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
                  {c.group === "CH" ? "CH" : c.group === "EU_EFTA" ? "EU/EFTA" : "Drittstaat"}
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
  const [countries, setCountries] = useState([]);
  const [phoneWarning, setPhoneWarning] = useState(null);
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
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
    if (!profile.first_name?.trim()) errors.first_name = "Vorname ist erforderlich";
    if (!profile.last_name?.trim()) errors.last_name = "Nachname ist erforderlich";
    if (!profile.date_of_birth) errors.date_of_birth = "Geburtsdatum ist erforderlich";
    else if (ageError) errors.date_of_birth = "Du musst mindestens 18 Jahre alt sein";
    if (!profile.escort_email?.trim()) errors.escort_email = "E-Mail-Adresse ist erforderlich";
    if (!profile.phone?.trim()) errors.phone = "Handynummer ist erforderlich";
    if (!profile.citizenship_group) errors.citizenship_group = "Bitte wähle deine Staatsangehörigkeit";
    if (!profile.id_document_url) errors.id_document_url = "Bitte lade dein Ausweisdokument hoch";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      setTimeout(() => {
        const el = formRef.current?.querySelector(`[data-field="${firstKey}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      setSubmitError("Bitte fülle alle markierten Felder aus.");
      return;
    }

    setSubmitError(null);
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
      id_document_url: profile.id_document_url,
      permit_type: isSwiss ? "none" : profile.permit_type,
      permit_status: isSwiss ? "not_required" : profile.permit_status,
    };

    await savePersonalDataProgress(nextData);
    onNext(nextData, null, { skipDbSave: true });
  };

  const checkPhone = async () => {
    const phone = profile.phone?.trim();
    if (!phone) return;
    const results = await base44.entities.OnboardingProfile.filter({ phone });
    const existing = results.filter((r) => r.id !== profileId);
    if (existing.length > 0) {
      setPhoneWarning({ profile_id: existing[0].id, phone });
    } else {
      setPhoneWarning(null);
    }
  };

  const sendMagicLink = async ({ profile_id, phone }) => {
    setSendingLink(true);
    await base44.functions.invoke("sendMagicLink", {
      profile_id,
      phone: phone || undefined,
      app_url: window.location.origin,
    });
    setSendingLink(false);
    setLinkSent(true);
  };

  const isSwiss = profile.citizenship_group === "CH";

  const fe = fieldErrors;

  return (
    <StepCard
      title="Deine persönlichen Daten"
      subtitle="Diese Angaben werden für deinen Vertrag und die Lohnabrechnung benötigt."
      onNext={validateAndNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving}
      validationError={submitError}
    >
      <div className="space-y-4" ref={formRef}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div data-field="first_name">
            <Label className="text-xs text-gray-600 mb-1">Vorname *</Label>
            <Input
              value={profile.first_name || ""}
              onChange={(e) => { updateProfile({ first_name: e.target.value }); setFieldErrors(p => ({...p, first_name: null})); }}
              placeholder="Anna"
              className={fe.first_name ? "border-red-400 focus-visible:ring-red-300" : ""}
            />
            {fe.first_name && <p className="text-xs text-red-500 mt-1">{fe.first_name}</p>}
          </div>
          <div data-field="last_name">
            <Label className="text-xs text-gray-600 mb-1">Nachname *</Label>
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
          <Label className="text-xs text-gray-600 mb-1">Geburtsdatum *</Label>
          <Input
            type="date"
            value={profile.date_of_birth || ""}
            onChange={(e) => { updateProfile({ date_of_birth: e.target.value }); setFieldErrors(p => ({...p, date_of_birth: null})); }}
            className={fe.date_of_birth ? "border-red-400 focus-visible:ring-red-300" : ""}
          />
          {fe.date_of_birth && <p className="text-red-500 text-xs mt-1">{fe.date_of_birth}</p>}
        </div>

        <div data-field="escort_email">
          <Label className="text-xs text-gray-600 mb-1">E-Mail-Adresse *</Label>
          <Input
            type="email"
            value={profile.escort_email || ""}
            onChange={(e) => { updateProfile({ escort_email: e.target.value }); setLinkSent(false); setFieldErrors(p => ({...p, escort_email: null})); }}
            placeholder="anna@beispiel.ch"
            className={fe.escort_email ? "border-red-400 focus-visible:ring-red-300" : ""}
          />
          {fe.escort_email && <p className="text-xs text-red-500 mt-1">{fe.escort_email}</p>}
        </div>

        <div data-field="phone">
          <Label className="text-xs text-gray-600 mb-1">Handynummer *</Label>
          <Input
            type="tel"
            value={profile.phone || ""}
            onChange={(e) => { updateProfile({ phone: e.target.value }); setPhoneWarning(null); setLinkSent(false); setFieldErrors(p => ({...p, phone: null})); }}
            onBlur={checkPhone}
            placeholder="+41 79 123 45 67"
            className={fe.phone ? "border-red-400 focus-visible:ring-red-300" : ""}
          />
          {fe.phone && <p className="text-xs text-red-500 mt-1">{fe.phone}</p>}
          {phoneWarning && !linkSent && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-xs text-yellow-800">
              <p className="font-medium mb-1">Diese Telefonnummer ist bereits registriert.</p>
              <p className="mb-2">Möchtest du einen Anmelde-Link per SMS senden?</p>
              <Button size="sm" variant="outline" className="text-yellow-700 border-yellow-400 hover:bg-yellow-100" onClick={() => sendMagicLink({ profile_id: phoneWarning.profile_id, phone: phoneWarning.phone })} disabled={sendingLink}>
                {sendingLink ? "Wird gesendet…" : "Login-Link per SMS senden"}
              </Button>
            </div>
          )}
        </div>

        <div>
          <Label className="text-xs text-gray-600 mb-1">Adresse</Label>
          <Input
            value={profile.address || ""}
            onChange={(e) => updateProfile({ address: e.target.value })}
            placeholder="Musterstrasse 1"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600 mb-1">PLZ</Label>
            <Input
              value={profile.postal_code || ""}
              onChange={(e) => updateProfile({ postal_code: e.target.value })}
              placeholder="8001"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 mb-1">Ort</Label>
            <Input
              value={profile.city || ""}
              onChange={(e) => updateProfile({ city: e.target.value })}
              placeholder="Zürich"
            />
          </div>
        </div>

        <div data-field="citizenship_group">
          <Label className="text-xs text-gray-600 mb-1">Staatsangehörigkeit *</Label>
          {fe.citizenship_group && <p className="text-xs text-red-500 mb-1">{fe.citizenship_group}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
            {[
              { value: "CH", label: "🇨🇭 Schweiz" },
              { value: "EU_EFTA", label: "🇪🇺 EU / EFTA" },
              { value: "NON_EU", label: "🌍 Drittstaaten" },
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
            <p className="text-xs text-gray-500 mt-2">🇨🇭 Schweizer Bürger/in – kein Aufenthaltsausweis erforderlich</p>
          )}
          {profile.citizenship_group && profile.citizenship_group !== "CH" && (
            <div className="mt-2">
              <NationalityDropdown
                value={profile.country_code || profile.nationality || ""}
                onChange={(country) => updateProfile({ nationality: country.code, country_code: country.code })}
                citizenshipGroup={profile.citizenship_group}
                countries={countries}
              />
            </div>
          )}
        </div>

        <div data-field="id_document_url">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <p className="text-sm font-medium text-gray-900">
              {isSwiss ? "Schweizer Pass oder Identitätskarte" : "Reisepass oder Personalausweis"} hochladen *
            </p>
            {profile.id_document_status === "rejected" && (
              <Badge className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-100">
                Rejected
              </Badge>
            )}
          </div>
          <DocumentUpload
            label=""
            value={profile.id_document_url || ""}
            onChange={(url) => { updateProfile({ id_document_url: url, id_document_status: url ? undefined : profile.id_document_status }); setFieldErrors(p => ({...p, id_document_url: null})); }}
            hint={true}
            profileId={profileId}
            documentType="id"
          />
          {fe.id_document_url && <p className="text-xs text-red-500 mt-1">{fe.id_document_url}</p>}
        </div>

        <div className="pt-2 border-t border-gray-100 text-center">
          <a
            href="?prefill=true"
            className="text-xs text-pink-400 hover:text-pink-600 underline underline-offset-2"
          >
            🔗 Demo: Version mit Gingr-Daten anzeigen
          </a>
        </div>
      </div>
    </StepCard>
  );
}