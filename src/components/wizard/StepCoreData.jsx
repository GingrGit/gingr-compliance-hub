import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import StepCard from "@/components/wizard/StepCard";
import DocumentUpload from "@/components/wizard/DocumentUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function StepCoreData({ profile, updateProfile, onNext, onBack, onSaveAndExit, saving, profileId }) {
  const [emailWarning, setEmailWarning] = useState(null);
  const [phoneWarning, setPhoneWarning] = useState(null);
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

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

  const checkEmail = async () => {
    const email = profile.escort_email?.trim();
    if (!email) return;
    const results = await base44.entities.OnboardingProfile.filter({ escort_email: email });
    const existing = results.filter((r) => r.id !== profileId);
    if (existing.length > 0) {
      setEmailWarning({ profile_id: existing[0].id, email });
    } else {
      setEmailWarning(null);
    }
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

  const sendMagicLink = async ({ profile_id, email, phone }) => {
    setSendingLink(true);
    await base44.functions.invoke("sendMagicLink", {
      profile_id,
      email: email || undefined,
      phone: phone || undefined,
      app_url: window.location.origin,
    });
    setSendingLink(false);
    setLinkSent(true);
  };

  const isSwiss = profile.citizenship_group === "CH";

  const canProceed =
    profile.first_name &&
    profile.last_name &&
    profile.date_of_birth &&
    profile.escort_email &&
    profile.phone &&
    profile.citizenship_group &&
    profile.id_document_url &&
    !ageError;

  return (
    <StepCard
      title="Deine persönlichen Daten"
      subtitle="Diese Angaben werden für deinen Vertrag und die Lohnabrechnung benötigt."
      onNext={() => onNext({
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
        id_document_url: profile.id_document_url,
        permit_type: isSwiss ? "none" : profile.permit_type,
        permit_status: isSwiss ? "not_required" : profile.permit_status,
      })}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      nextDisabled={!canProceed}
      saving={saving}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600 mb-1">Vorname *</Label>
            <Input
              value={profile.first_name || ""}
              onChange={(e) => updateProfile({ first_name: e.target.value })}
              placeholder="Anna"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 mb-1">Nachname *</Label>
            <Input
              value={profile.last_name || ""}
              onChange={(e) => updateProfile({ last_name: e.target.value })}
              placeholder="Muster"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-600 mb-1">Geburtsdatum *</Label>
          <Input
            type="date"
            value={profile.date_of_birth || ""}
            onChange={(e) => updateProfile({ date_of_birth: e.target.value })}
          />
          {ageError && (
            <p className="text-red-500 text-xs mt-1">Du musst mindestens 18 Jahre alt sein, um dich anzumelden.</p>
          )}
        </div>

        <div>
          <Label className="text-xs text-gray-600 mb-1">E-Mail-Adresse *</Label>
          <Input
            type="email"
            value={profile.escort_email || ""}
            onChange={(e) => { updateProfile({ escort_email: e.target.value }); setEmailWarning(null); setLinkSent(false); }}
            onBlur={checkEmail}
            placeholder="anna@beispiel.ch"
          />
          {emailWarning && !linkSent && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-xs text-yellow-800">
              <p className="font-medium mb-1">Diese E-Mail ist bereits registriert.</p>
              <p className="mb-2">Möchtest du einen Anmelde-Link an diese E-Mail senden?</p>
              <Button size="sm" variant="outline" className="text-yellow-700 border-yellow-400 hover:bg-yellow-100" onClick={() => sendMagicLink({ profile_id: emailWarning.profile_id, email: emailWarning.email })} disabled={sendingLink}>
                {sendingLink ? "Wird gesendet…" : "Login-Link per E-Mail senden"}
              </Button>
            </div>
          )}
          {linkSent && <p className="text-green-600 text-xs mt-1">✓ Login-Link wurde gesendet.</p>}
        </div>

        <div>
          <Label className="text-xs text-gray-600 mb-1">Handynummer *</Label>
          <Input
            type="tel"
            value={profile.phone || ""}
            onChange={(e) => { updateProfile({ phone: e.target.value }); setPhoneWarning(null); setLinkSent(false); }}
            onBlur={checkPhone}
            placeholder="+41 79 123 45 67"
          />
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

        <div>
          <Label className="text-xs text-gray-600 mb-1">Staatsangehörigkeit *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
            {[
              { value: "CH", label: "🇨🇭 Schweiz" },
              { value: "EU_EFTA", label: "🇪🇺 EU / EFTA" },
              { value: "NON_EU", label: "🌍 Drittstaaten" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateProfile({ citizenship_group: opt.value, nationality: opt.value === "CH" ? "Schweiz" : profile.nationality })}
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
          {profile.citizenship_group && profile.citizenship_group !== "CH" && (
            <div className="mt-2">
              <Input
                value={profile.nationality || ""}
                onChange={(e) => updateProfile({ nationality: e.target.value })}
                placeholder="Nationalität (z.B. Deutschland, Türkei…)"
                className="mt-1"
              />
            </div>
          )}
        </div>

        <DocumentUpload
          label={`${isSwiss ? "Schweizer Pass oder Identitätskarte" : "Reisepass oder Personalausweis"} hochladen *`}
          value={profile.id_document_url || ""}
          onChange={(url) => updateProfile({ id_document_url: url })}
          hint={true}
        />
      </div>
    </StepCard>
  );
}