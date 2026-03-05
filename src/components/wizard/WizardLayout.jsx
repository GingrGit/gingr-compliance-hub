import React from "react";
import { CheckCircle2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WizardLayout({ steps, currentStep, onStepClick, mode, saving, children }) {
  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      {/* Top Header */}
      <div className="bg-white border-b border-pink-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo centered */}
          <div className="flex-1 flex justify-center">
            <div className="flex flex-col items-center">
              <img
                src="https://gingr.ch/wp-content/uploads/2023/03/gingr-logo.png"
                alt="Gingr"
                className="h-8 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span className="text-2xl font-bold text-[#6B0064] hidden">gingr</span>
              <span className="text-xs text-gray-400 font-medium">Legal Onboarding</span>
            </div>
          </div>
          {/* Save indicator right */}
          <div className="w-24 flex justify-end">
            {saving && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Save className="w-3 h-3" /> Speichert…
              </span>
            )}
            {!saving && (
              <span className="text-xs text-gray-300 flex items-center gap-1">
                {mode === "guided" ? "👤 Geführt" : "🧍 Selbst"}
              </span>
            )}
          </div>
        </div>

        {/* Step Progress */}
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {steps.map((step, idx) => {
              const done = idx < currentStep;
              const active = idx === currentStep;
              const clickable = done && onStepClick;
              return (
                <React.Fragment key={step.id}>
                  <div
                    className={`flex items-center gap-1 flex-shrink-0 ${clickable ? "cursor-pointer group" : ""}`}
                    onClick={() => clickable && onStepClick(idx)}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00CC44]" />
                    ) : (
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? "border-[#FF3CAC] bg-[#FF3CAC]" : "border-gray-300"}`}>
                        {active && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    )}
                    <span className={`text-xs font-medium whitespace-nowrap ${active ? "text-[#6B0064]" : done ? "text-[#00AA33]" : "text-gray-300"}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 w-4 flex-shrink-0 ${idx < currentStep ? "bg-[#00CC44]" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Schritt {currentStep + 1} von {steps.length} · Wird automatisch gespeichert
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {children}
          </div>
          <div className="hidden lg:block">
            <GuidancePanel mode={mode} />
          </div>
        </div>
      </div>
    </div>
  );
}

function GuidancePanel({ mode }) {
  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5 sticky top-28">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
          <span className="text-lg">{mode === "guided" ? "👤" : "💡"}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {mode === "guided" ? "Mitarbeiter-Hinweise" : "Hilfe & Infos"}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        {mode === "guided"
          ? "Du begleitest die Escort durch das Onboarding. Alle Eingaben werden automatisch gespeichert. Geh in deinem eigenen Tempo vor."
          : "Alle deine Daten werden sicher gespeichert. Du kannst jederzeit unterbrechen und später weitermachen."}
      </p>
      <div className="mt-4 p-3 bg-pink-50 rounded-xl border border-pink-100">
      <p className="text-xs font-medium text-[#6B0064]">🔒 Datenschutz</p>
      <p className="text-xs text-[#6B0064] opacity-80 mt-1">Deine Angaben sind vertraulich und werden nur für rechtliche Zwecke verwendet.</p>
      </div>
    </div>
  );
}