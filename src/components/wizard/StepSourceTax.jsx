import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CANTONS = ["AG","AI","AR","BE","BL","BS","FR","GE","GL","GR","JU","LU","NE","NW","OW","SG","SH","SO","SZ","TG","TI","UR","VD","VS","ZG","ZH"];

export default function StepSourceTax({ profile, onNext, onBack, onSaveAndExit, saving }) {
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

  const validate = () => {
    const e = {};
    if (!d.canton) e.canton = "Pflichtfeld";
    if (!d.marital_status) e.marital_status = "Pflichtfeld";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showPartner = d.marital_status === "married" || d.marital_status === "partnership";

  return (
    <StepCard
      title="Quellensteuer-Angaben"
      subtitle="Diese Angaben sind für die korrekte Berechnung deiner Quellensteuer erforderlich."
      onNext={() => { if (validate()) onNext(d); }}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving}
    >
      <InfoAccordion title="Was ist Quellensteuer?">
        Bei der Quellensteuer wird die Einkommenssteuer direkt vom Lohn abgezogen. Dies gilt für Personen ohne Niederlassungsbewilligung C. Der Kanton berechnet den genauen Satz.
      </InfoAccordion>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Kanton *</Label>
          <select
            value={d.canton}
            onChange={set("canton")}
            className={`mt-1 w-full border rounded-md px-3 py-2 text-sm ${errors.canton ? "border-red-400" : "border-gray-300"}`}
          >
            <option value="">Kanton wählen</option>
            {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.canton && <p className="text-xs text-red-500 mt-1">{errors.canton}</p>}
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Gemeinde (optional)</Label>
          <Input value={d.municipality} onChange={set("municipality")} className="mt-1" placeholder="Zürich" />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Zivilstand *</Label>
        <div className="grid grid-cols-3 gap-2">
          {[["single", "Ledig"], ["married", "Verheiratet"], ["partnership", "Eingetr. Partnerschaft"], ["divorced", "Geschieden"], ["widowed", "Verwitwet"], ["unsure", "Nicht sicher"]].map(([v, l]) => (
            <button key={v} type="button" onClick={() => set("marital_status")(v)}
              className={`rounded-lg border p-2 text-xs font-medium transition-all ${d.marital_status === v ? "border-rose-400 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600"}`}>
              {l}
            </button>
          ))}
        </div>
        {errors.marital_status && <p className="text-xs text-red-500 mt-1">{errors.marital_status}</p>}
      </div>

      {showPartner && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm font-medium text-gray-700">Partnerin / Partner</p>
          <div>
            <Label className="text-xs text-gray-600">Lebt Partner im selben Haushalt?</Label>
            <div className="flex gap-2 mt-1">
              {[["yes","Ja"],["no","Nein"],["unsure","Nicht sicher"]].map(([v,l]) => (
                <button key={v} type="button" onClick={() => set("partner_in_household")(v)}
                  className={`flex-1 rounded-lg border p-2 text-xs font-medium transition-all ${d.partner_in_household === v ? "border-rose-400 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-600">Verdient Partner in der Schweiz?</Label>
            <div className="flex gap-2 mt-1">
              {[["yes","Ja"],["no","Nein"],["unsure","Nicht sicher"]].map(([v,l]) => (
                <button key={v} type="button" onClick={() => set("partner_income_ch")(v)}
                  className={`flex-1 rounded-lg border p-2 text-xs font-medium transition-all ${d.partner_income_ch === v ? "border-rose-400 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium text-gray-700">Hast du Kinder?</Label>
          <div className="flex gap-2 mt-1">
            {[["yes","Ja"],["no","Nein"]].map(([v,l]) => (
              <button key={v} type="button" onClick={() => set("has_children")(v)}
                className={`flex-1 rounded-lg border p-2 text-sm font-medium transition-all ${d.has_children === v ? "border-rose-400 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {d.has_children === "yes" && (
          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
            <div>
              <Label className="text-xs text-gray-600">Anzahl Kinder</Label>
              <Input type="number" value={d.children_count} onChange={set("children_count")} className="mt-1 w-24" placeholder="1" />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Kinder im selben Haushalt?</Label>
              <div className="flex gap-2 mt-1">
                {[["yes","Ja"],["no","Nein"]].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => set("children_in_household")(v)}
                    className={`flex-1 rounded-lg border p-2 text-xs font-medium transition-all ${d.children_in_household === v ? "border-rose-400 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Erhältst du Kinderzulagen?</Label>
              <div className="flex gap-2 mt-1">
                {[["yes","Ja"],["no","Nein"],["unsure","Nicht sicher"]].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => set("receives_child_allowance")(v)}
                    className={`flex-1 rounded-lg border p-2 text-xs font-medium transition-all ${d.receives_child_allowance === v ? "border-rose-400 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </StepCard>
  );
}