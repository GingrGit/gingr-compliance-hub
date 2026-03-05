import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function computeDefaultSourceTax(profile) {
  const { citizenship_group, permit_type, work_model } = profile;
  if (citizenship_group === "CH" || permit_type === "C") return "no";
  if (permit_type === "B" || permit_type === "L" || work_model === "employee_90days") return "yes";
  return "unsure";
}

export default function StepEarnings({ profile, onNext, onBack, onSaveAndExit, saving }) {
  const defaultST = computeDefaultSourceTax(profile);
  const [hourlyRate, setHourlyRate] = useState(profile.hourly_rate || "");
  const [hoursPerMonth, setHoursPerMonth] = useState(profile.hours_per_month || "");
  const [sourceTax, setSourceTax] = useState(profile.source_tax || defaultST);

  const estimated = hourlyRate && hoursPerMonth ? (parseFloat(hourlyRate) * parseFloat(hoursPerMonth)).toFixed(0) : null;

  return (
    <StepCard
      title="Verdienstschätzung"
      subtitle="Diese Angaben helfen uns, deine Lohnabrechnung korrekt zu erstellen."
      onNext={() => onNext({ hourly_rate: hourlyRate, hours_per_month: hoursPerMonth, source_tax: sourceTax })}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving}
    >
      <InfoAccordion title="Warum diese Angaben?">
        Wir verwenden diese Informationen nur zur Berechnung deines Lohns und der Sozialversicherungsbeiträge. Sie sind unverbindlich und können später angepasst werden.
      </InfoAccordion>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Stundensatz (CHF)</Label>
          <Input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="mt-1"
            placeholder="z.B. 150"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Stunden pro Monat (Schätzung)</Label>
          <Input
            type="number"
            value={hoursPerMonth}
            onChange={(e) => setHoursPerMonth(e.target.value)}
            className="mt-1"
            placeholder="z.B. 20"
          />
        </div>
      </div>

      {estimated && (
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">Geschätzter Monatsverdienst</p>
          <p className="text-3xl font-bold text-[#FF3CAC] mt-1">CHF {parseInt(estimated).toLocaleString("de-CH")}</p>
          <p className="text-xs text-gray-400 mt-1">Brutto, vor Abzügen</p>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Quellensteuer</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { v: "yes", l: "Ja", d: "Quellensteuer wird abgezogen" },
            { v: "no", l: "Nein", d: "Keine Quellensteuer" },
            { v: "unsure", l: "Nicht sicher", d: "Wir helfen dir weiter" },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setSourceTax(opt.v)}
              className={`rounded-xl border-2 p-3 text-sm text-center transition-all ${sourceTax === opt.v ? "border-[#FF3CAC] bg-pink-50 text-[#6B0064]" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}
            >
              <p className="font-semibold">{opt.l}</p>
              <p className="text-xs mt-0.5 text-gray-500">{opt.d}</p>
            </button>
          ))}
        </div>
        {defaultST !== sourceTax && (
          <p className="text-xs text-[#6B0064] opacity-70 mt-2">
            💡 Aufgrund deiner Situation würden wir "{defaultST === "yes" ? "Ja" : defaultST === "no" ? "Nein" : "Nicht sicher"}" empfehlen — du kannst aber selbst wählen.
          </p>
        )}
      </div>
    </StepCard>
  );
}