import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import InfoAccordion from "@/components/wizard/InfoAccordion";
import { CheckCircle2 } from "lucide-react";

const declarations = [
  "Ich bestätige, dass ich tatsächlich selbständig erwerbstätig bin und für meine eigene Steuer- und Sozialversicherungspflicht verantwortlich bin.",
  "Ich bestätige, dass ich eine gültige Betriebshaftpflichtversicherung besitze oder bereit bin, eine abzuschliessen.",
  "Ich bestätige, dass alle gemachten Angaben korrekt und vollständig sind.",
  "Ich stimme der Zusammenarbeitsvereinbarung mit gingr.ch zu.",
];

export default function StepSelfEmployedAgreement({ profile, onNext, onBack, onSaveAndExit, saving }) {
  const [checked, setChecked] = useState({});
  const allChecked = declarations.every((_, i) => checked[i]);

  const toggle = (i) => setChecked((p) => ({ ...p, [i]: !p[i] }));

  return (
    <StepCard
      title="Erklärungen & Vereinbarung"
      subtitle="Bitte bestätige die folgenden Punkte, um das Onboarding abzuschliessen."
      onNext={() => onNext({ contract_signed: true, contract_signed_at: new Date().toISOString() })}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      nextDisabled={!allChecked}
      nextLabel="Bestätigen & Einreichen"
      saving={saving}
    >
      <InfoAccordion title="Was bedeutet diese Vereinbarung?">
        Als Selbständige arbeitest du auf eigene Rechnung. Diese Erklärungen bestätigen deine rechtliche Eigenverantwortung. Du erhältst eine Kopie per E-Mail.
      </InfoAccordion>

      <div className="space-y-3">
        {declarations.map((dec, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => toggle(i)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked[i] ? "bg-rose-500 border-rose-500" : "border-gray-300 group-hover:border-rose-300"}`}
            >
              {checked[i] && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{dec}</p>
          </label>
        ))}
      </div>

      {!allChecked && (
        <p className="text-xs text-gray-400 text-center">Alle Punkte müssen bestätigt werden, um fortzufahren.</p>
      )}
    </StepCard>
  );
}