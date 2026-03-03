import React from "react";
import { CheckCircle2, Circle, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WizardLayout({ steps, currentStep, mode, onModeChange, saving, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50">
      {/* Top Header */}
      <div className="bg-white border-b border-purple-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-purple-700">gingr</span>
            <span className="text-gray-400">·</span>
            <span className="text-sm text-gray-500 font-medium">Legal Onboarding</span>
          </div>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Save className="w-3 h-3" /> Speichert…
              </span>
            )}
            <Badge
              variant="outline"
              className={`cursor-pointer text-xs ${mode === "guided" ? "bg-yellow-100 border-yellow-400 text-yellow-700" : "bg-purple-100 border-purple-300 text-purple-700"}`}
              onClick={() => onModeChange(mode === "self" ? "guided" : "self")}
            >
              {mode === "guided" ? "👤 Geführter Modus" : "🧍 Selbst-Modus"}
            </Badge>
          </div>
        </div>

        {/* Step Progress */}
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {steps.map((step, idx) => {
              const done = idx < currentStep;
              const active = idx === currentStep;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-rose-400" />
                    ) : (
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? "border-rose-400 bg-rose-400" : "border-gray-300"}`}>
                        {active && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    )}
                    <span className={`text-xs font-medium whitespace-nowrap ${active ? "text-rose-500" : done ? "text-gray-400" : "text-gray-300"}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 w-4 flex-shrink-0 ${idx < currentStep ? "bg-rose-300" : "bg-gray-200"}`} />
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
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-5 sticky top-28">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
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
      <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-xs font-medium text-amber-700">🔒 Datenschutz</p>
        <p className="text-xs text-amber-600 mt-1">Deine Angaben sind vertraulich und werden nur für rechtliche Zwecke verwendet.</p>
      </div>
    </div>
  );
}