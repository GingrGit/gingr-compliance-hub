import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import StepCard from "@/components/wizard/StepCard";
import DocumentUpload from "@/components/wizard/DocumentUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const EU_EFTA = [
  "Belgien","Bulgarien","Dänemark","Deutschland","Estland","Finnland","Frankreich",
  "Griechenland","Grossbritannien","Irland","Island","Italien","Kroatien","Lettland",
  "Liechtenstein","Litauen","Luxemburg","Malta","Niederlande","Norwegen","Österreich",
  "Polen","Portugal","Rumänien","Schweden","Slowakei","Slowenien","Spanien",
  "Tschechische Republik","Ungarn","Zypern"
];

const ALL_COUNTRIES = [
  { name: "Schweiz", flag: "🇨🇭", group: "CH" },
  { name: "Belgien", flag: "🇧🇪", group: "EU_EFTA" },
  { name: "Bulgarien", flag: "🇧🇬", group: "EU_EFTA" },
  { name: "Dänemark", flag: "🇩🇰", group: "EU_EFTA" },
  { name: "Deutschland", flag: "🇩🇪", group: "EU_EFTA" },
  { name: "Estland", flag: "🇪🇪", group: "EU_EFTA" },
  { name: "Finnland", flag: "🇫🇮", group: "EU_EFTA" },
  { name: "Frankreich", flag: "🇫🇷", group: "EU_EFTA" },
  { name: "Griechenland", flag: "🇬🇷", group: "EU_EFTA" },
  { name: "Grossbritannien", flag: "🇬🇧", group: "EU_EFTA" },
  { name: "Irland", flag: "🇮🇪", group: "EU_EFTA" },
  { name: "Island", flag: "🇮🇸", group: "EU_EFTA" },
  { name: "Italien", flag: "🇮🇹", group: "EU_EFTA" },
  { name: "Kroatien", flag: "🇭🇷", group: "EU_EFTA" },
  { name: "Lettland", flag: "🇱🇻", group: "EU_EFTA" },
  { name: "Liechtenstein", flag: "🇱🇮", group: "EU_EFTA" },
  { name: "Litauen", flag: "🇱🇹", group: "EU_EFTA" },
  { name: "Luxemburg", flag: "🇱🇺", group: "EU_EFTA" },
  { name: "Malta", flag: "🇲🇹", group: "EU_EFTA" },
  { name: "Niederlande", flag: "🇳🇱", group: "EU_EFTA" },
  { name: "Norwegen", flag: "🇳🇴", group: "EU_EFTA" },
  { name: "Österreich", flag: "🇦🇹", group: "EU_EFTA" },
  { name: "Polen", flag: "🇵🇱", group: "EU_EFTA" },
  { name: "Portugal", flag: "🇵🇹", group: "EU_EFTA" },
  { name: "Rumänien", flag: "🇷🇴", group: "EU_EFTA" },
  { name: "Schweden", flag: "🇸🇪", group: "EU_EFTA" },
  { name: "Slowakei", flag: "🇸🇰", group: "EU_EFTA" },
  { name: "Slowenien", flag: "🇸🇮", group: "EU_EFTA" },
  { name: "Spanien", flag: "🇪🇸", group: "EU_EFTA" },
  { name: "Tschechische Republik", flag: "🇨🇿", group: "EU_EFTA" },
  { name: "Ungarn", flag: "🇭🇺", group: "EU_EFTA" },
  { name: "Zypern", flag: "🇨🇾", group: "EU_EFTA" },
  { name: "Afghanistan", flag: "🇦🇫", group: "NON_EU" },
  { name: "Ägypten", flag: "🇪🇬", group: "NON_EU" },
  { name: "Albanien", flag: "🇦🇱", group: "NON_EU" },
  { name: "Algerien", flag: "🇩🇿", group: "NON_EU" },
  { name: "Argentinien", flag: "🇦🇷", group: "NON_EU" },
  { name: "Äthiopien", flag: "🇪🇹", group: "NON_EU" },
  { name: "Australien", flag: "🇦🇺", group: "NON_EU" },
  { name: "Bangladesch", flag: "🇧🇩", group: "NON_EU" },
  { name: "Bosnien und Herzegowina", flag: "🇧🇦", group: "NON_EU" },
  { name: "Brasilien", flag: "🇧🇷", group: "NON_EU" },
  { name: "Chile", flag: "🇨🇱", group: "NON_EU" },
  { name: "China", flag: "🇨🇳", group: "NON_EU" },
  { name: "Dominikanische Republik", flag: "🇩🇴", group: "NON_EU" },
  { name: "Ecuador", flag: "🇪🇨", group: "NON_EU" },
  { name: "Indien", flag: "🇮🇳", group: "NON_EU" },
  { name: "Indonesien", flag: "🇮🇩", group: "NON_EU" },
  { name: "Iran", flag: "🇮🇷", group: "NON_EU" },
  { name: "Irak", flag: "🇮🇶", group: "NON_EU" },
  { name: "Japan", flag: "🇯🇵", group: "NON_EU" },
  { name: "Jordanien", flag: "🇯🇴", group: "NON_EU" },
  { name: "Kamerun", flag: "🇨🇲", group: "NON_EU" },
  { name: "Kanada", flag: "🇨🇦", group: "NON_EU" },
  { name: "Kasachstan", flag: "🇰🇿", group: "NON_EU" },
  { name: "Kenia", flag: "🇰🇪", group: "NON_EU" },
  { name: "Kolumbien", flag: "🇨🇴", group: "NON_EU" },
  { name: "Kosovo", flag: "🇽🇰", group: "NON_EU" },
  { name: "Kuba", flag: "🇨🇺", group: "NON_EU" },
  { name: "Libanon", flag: "🇱🇧", group: "NON_EU" },
  { name: "Marokko", flag: "🇲🇦", group: "NON_EU" },
  { name: "Mazedonien", flag: "🇲🇰", group: "NON_EU" },
  { name: "Mexiko", flag: "🇲🇽", group: "NON_EU" },
  { name: "Moldau", flag: "🇲🇩", group: "NON_EU" },
  { name: "Montenegro", flag: "🇲🇪", group: "NON_EU" },
  { name: "Myanmar", flag: "🇲🇲", group: "NON_EU" },
  { name: "Nepal", flag: "🇳🇵", group: "NON_EU" },
  { name: "Nigeria", flag: "🇳🇬", group: "NON_EU" },
  { name: "Pakistan", flag: "🇵🇰", group: "NON_EU" },
  { name: "Peru", flag: "🇵🇪", group: "NON_EU" },
  { name: "Philippinen", flag: "🇵🇭", group: "NON_EU" },
  { name: "Russland", flag: "🇷🇺", group: "NON_EU" },
  { name: "Saudi-Arabien", flag: "🇸🇦", group: "NON_EU" },
  { name: "Serbien", flag: "🇷🇸", group: "NON_EU" },
  { name: "Südafrika", flag: "🇿🇦", group: "NON_EU" },
  { name: "Südkorea", flag: "🇰🇷", group: "NON_EU" },
  { name: "Sri Lanka", flag: "🇱🇰", group: "NON_EU" },
  { name: "Syrien", flag: "🇸🇾", group: "NON_EU" },
  { name: "Thailand", flag: "🇹🇭", group: "NON_EU" },
  { name: "Tunesien", flag: "🇹🇳", group: "NON_EU" },
  { name: "Türkei", flag: "🇹🇷", group: "NON_EU" },
  { name: "Ukraine", flag: "🇺🇦", group: "NON_EU" },
  { name: "Ungarn", flag: "🇭🇺", group: "EU_EFTA" },
  { name: "USA", flag: "🇺🇸", group: "NON_EU" },
  { name: "Usbekistan", flag: "🇺🇿", group: "NON_EU" },
  { name: "Venezuela", flag: "🇻🇪", group: "NON_EU" },
  { name: "Vietnam", flag: "🇻🇳", group: "NON_EU" },
  { name: "Weissrussland", flag: "🇧🇾", group: "NON_EU" },
];

function NationalityDropdown({ value, onChange, citizenshipGroup }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = ALL_COUNTRIES.find(c => c.name === value);
  const filtered = ALL_COUNTRIES.filter(c =>
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
          {selected ? `${selected.flag} ${selected.name}` : "Land auswählen…"}
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
                <span className="text-base">{c.flag}</span>
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
          <NationalityDropdown
            value={profile.nationality || ""}
            onChange={(country) => updateProfile({ nationality: country.name, citizenship_group: country.group })}
          />
          {profile.citizenship_group && (
            <p className="text-xs text-gray-400 mt-1">
              {profile.citizenship_group === "CH" && "🇨🇭 Schweizer Bürger/in – kein Aufenthaltsausweis erforderlich"}
              {profile.citizenship_group === "EU_EFTA" && "🇪🇺 EU/EFTA-Bürger/in"}
              {profile.citizenship_group === "NON_EU" && "🌍 Drittstaaten – Aufenthaltsausweis erforderlich"}
            </p>
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