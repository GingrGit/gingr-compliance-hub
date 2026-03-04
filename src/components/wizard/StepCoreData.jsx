import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { base44 } from "@/api/base44Client";
import { Loader2, Mail, MessageSquare } from "lucide-react";

const CITIZENSHIP_GROUPS = [
  { value: "CH", label: "🇨🇭 Schweizerin" },
  { value: "EU_EFTA", label: "🇪🇺 EU / EFTA" },
  { value: "NON_EU", label: "🌍 Drittstaaten (Non-EU)" },
];

function calcAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function StepCoreData({ profile, profileId, onNext, onBack, onSaveAndExit, saving }) {
  const [data, setData] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    date_of_birth: profile.date_of_birth || "",
    address: profile.address || "",
    city: profile.city || "",
    postal_code: profile.postal_code || "",
    phone: profile.phone || "",
    escort_email: profile.escort_email || "",
    citizenship_group: profile.citizenship_group || "",
  });
  const [errors, setErrors] = useState({});

  // Duplicate profile warnings
  const [emailDuplicate, setEmailDuplicate] = useState(null); // null | {profile_id, name}
  const [phoneDuplicate, setPhoneDuplicate] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState({ email: false, phone: false });
  const [sendingLink, setSendingLink] = useState({ email: false, phone: false });

  const required = ["first_name", "last_name", "date_of_birth", "citizenship_group"];

  const validate = () => {
    const e = {};
    required.forEach((k) => { if (!data[k]) e[k] = "Pflichtfeld"; });

    // Age check
    if (data.date_of_birth) {
      const age = calcAge(data.date_of_birth);
      if (age < 18) e.date_of_birth = "Du musst mindestens 18 Jahre alt sein.";
    }

    if (!data.phone) e.phone = "Pflichtfeld";
    if (!data.escort_email) e.escort_email = "Pflichtfeld";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.escort_email)) e.escort_email = "Ungültige E-Mail-Adresse";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (k) => (e) => setData((p) => ({ ...p, [k]: e.target.value }));

  const checkEmailDuplicate = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setCheckingEmail(true);
    try {
      const results = await base44.entities.OnboardingProfile.filter({ escort_email: email });
      const existing = (results || []).find(p => p.id !== profileId);
      if (existing) {
        setEmailDuplicate({ profile_id: existing.id, name: `${existing.first_name || ""} ${existing.last_name || ""}`.trim() || email });
      } else {
        setEmailDuplicate(null);
      }
    } catch (_) {}
    setCheckingEmail(false);
  };

  const checkPhoneDuplicate = async (phone) => {
    if (!phone || phone.length < 8) return;
    setCheckingPhone(true);
    try {
      const results = await base44.entities.OnboardingProfile.filter({ phone });
      const existing = (results || []).find(p => p.id !== profileId);
      if (existing) {
        setPhoneDuplicate({ profile_id: existing.id, name: `${existing.first_name || ""} ${existing.last_name || ""}`.trim() || phone, email: existing.escort_email, phone: existing.phone });
      } else {
        setPhoneDuplicate(null);
      }
    } catch (_) {}
    setCheckingPhone(false);
  };

  const sendMagicLinkForDuplicate = async (type) => {
    const dup = type === "email" ? emailDuplicate : phoneDuplicate;
    if (!dup) return;
    setSendingLink(s => ({ ...s, [type]: true }));
    try {
      await base44.functions.invoke("sendMagicLink", {
        profile_id: dup.profile_id,
        phone: type === "phone" ? phoneDuplicate.phone : null,
        email: type === "email" ? data.escort_email : null,
        app_url: window.location.origin,
      });
      setMagicLinkSent(s => ({ ...s, [type]: true }));
    } catch (_) {}
    setSendingLink(s => ({ ...s, [type]: false }));
  };

  const handleNext = async () => {
    if (!validate()) return;
    await onNext(data, async (savedProfileId) => {
      if (savedProfileId) {
        try {
          await base44.functions.invoke("sendMagicLink", {
            profile_id: savedProfileId,
            phone: data.phone || null,
            email: data.escort_email || null,
            app_url: window.location.origin,
          });
        } catch (_) {}
      }
    });
  };

  return (
    <StepCard
      title="Deine persönlichen Daten"
      subtitle="Diese Angaben werden für deinen Vertrag benötigt."
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving}
    >
      <InfoAccordion title="Warum brauchen wir das?">
        Diese Angaben werden ausschließlich für die Erstellung deines Arbeitsvertrags und die rechtlich vorgeschriebene Identifikation verwendet.
      </InfoAccordion>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Vorname *</Label>
          <Input value={data.first_name} onChange={set("first_name")} className={`mt-1 ${errors.first_name ? "border-red-400" : ""}`} placeholder="Vorname" />
          {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Nachname *</Label>
          <Input value={data.last_name} onChange={set("last_name")} className={`mt-1 ${errors.last_name ? "border-red-400" : ""}`} placeholder="Nachname" />
          {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Geburtsdatum *</Label>
          <Input type="date" value={data.date_of_birth} onChange={set("date_of_birth")} className={`mt-1 ${errors.date_of_birth ? "border-red-400" : ""}`} />
          {errors.date_of_birth && <p className="text-xs text-red-500 mt-1">{errors.date_of_birth}</p>}
        </div>

        {/* Phone with duplicate check */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Telefon *</Label>
          <div className="relative mt-1">
            <Input
              value={data.phone}
              onChange={set("phone")}
              onBlur={() => checkPhoneDuplicate(data.phone)}
              className={errors.phone ? "border-red-400" : ""}
              placeholder="+41 79 ..."
            />
            {checkingPhone && <Loader2 className="w-3 h-3 animate-spin absolute right-3 top-3 text-gray-400" />}
          </div>
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          {phoneDuplicate && !errors.phone && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Diese Nummer ist bereits registriert</p>
              <p className="text-xs text-amber-700 mb-2">Profil: <strong>{phoneDuplicate.name}</strong>. Möchtest du einen Login-Link erhalten?</p>
              {magicLinkSent.phone ? (
                <p className="text-xs text-green-600 font-medium">✓ Link wurde per SMS gesendet</p>
              ) : (
                <Button size="sm" variant="outline" className="text-xs h-7 border-amber-300 text-amber-700" onClick={() => sendMagicLinkForDuplicate("phone")} disabled={sendingLink.phone}>
                  {sendingLink.phone ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <MessageSquare className="w-3 h-3 mr-1" />}
                  Login-Link per SMS senden
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Email with duplicate check */}
        <div className="sm:col-span-2">
          <Label className="text-sm font-medium text-gray-700">E-Mail *</Label>
          <div className="relative mt-1">
            <Input
              type="email"
              value={data.escort_email}
              onChange={set("escort_email")}
              onBlur={() => checkEmailDuplicate(data.escort_email)}
              className={errors.escort_email ? "border-red-400" : ""}
              placeholder="deine@email.com"
            />
            {checkingEmail && <Loader2 className="w-3 h-3 animate-spin absolute right-3 top-3 text-gray-400" />}
          </div>
          {errors.escort_email && <p className="text-xs text-red-500 mt-1">{errors.escort_email}</p>}
          {emailDuplicate && !errors.escort_email && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Diese E-Mail ist bereits registriert</p>
              <p className="text-xs text-amber-700 mb-2">Profil: <strong>{emailDuplicate.name}</strong>. Möchtest du einen Login-Link erhalten?</p>
              {magicLinkSent.email ? (
                <p className="text-xs text-green-600 font-medium">✓ Link wurde per E-Mail gesendet</p>
              ) : (
                <Button size="sm" variant="outline" className="text-xs h-7 border-amber-300 text-amber-700" onClick={() => sendMagicLinkForDuplicate("email")} disabled={sendingLink.email}>
                  {sendingLink.email ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Mail className="w-3 h-3 mr-1" />}
                  Login-Link per E-Mail senden
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label className="text-sm font-medium text-gray-700">Adresse</Label>
          <Input value={data.address} onChange={set("address")} className="mt-1" placeholder="Strasse und Hausnummer" />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">PLZ</Label>
          <Input value={data.postal_code} onChange={set("postal_code")} className="mt-1" placeholder="8001" />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Ort</Label>
          <Input value={data.city} onChange={set("city")} className="mt-1" placeholder="Zürich" />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Staatsangehörigkeit / Aufenthaltsstatus *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CITIZENSHIP_GROUPS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setData((p) => ({ ...p, citizenship_group: g.value }))}
              className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${data.citizenship_group === g.value ? "border-rose-400 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600 hover:border-rose-200"}`}
            >
              {g.label}
            </button>
          ))}
        </div>
        {errors.citizenship_group && <p className="text-xs text-red-500 mt-1">{errors.citizenship_group}</p>}
      </div>
    </StepCard>
  );
}