import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { base44 } from "@/api/base44Client";

const CITIZENSHIP_GROUPS = [
  { value: "CH", label: "🇨🇭 Schweizerin" },
  { value: "EU_EFTA", label: "🇪🇺 EU / EFTA" },
  { value: "NON_EU", label: "🌍 Drittstaaten (Non-EU)" },
];

export default function StepCoreData({ profile, onNext, onBack, onSaveAndExit, saving }) {
  const [data, setData] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    date_of_birth: profile.date_of_birth || "",
    address: profile.address || "",
    city: profile.city || "",
    postal_code: profile.postal_code || "",
    phone: profile.phone || "",
    citizenship_group: profile.citizenship_group || "",
  });
  const [errors, setErrors] = useState({});

  const required = ["first_name", "last_name", "date_of_birth", "citizenship_group"];

  const validate = () => {
    const e = {};
    required.forEach((k) => { if (!data[k]) e[k] = "Pflichtfeld"; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (k) => (e) => setData((p) => ({ ...p, [k]: e.target.value }));

  return (
    <StepCard
      title="Deine persönlichen Daten"
      subtitle="Diese Angaben werden für deinen Vertrag benötigt."
      onNext={() => { if (validate()) onNext(data); }}
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
        <div>
          <Label className="text-sm font-medium text-gray-700">Telefon</Label>
          <Input value={data.phone} onChange={set("phone")} className="mt-1" placeholder="+41 79 ..." />
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