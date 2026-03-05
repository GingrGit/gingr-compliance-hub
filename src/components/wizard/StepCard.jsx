import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, LogOut, Loader2 } from "lucide-react";

export default function StepCard({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  onSaveAndExit,
  nextLabel = "Weiter",
  nextDisabled = false,
  saving = false,
  hideBack = false,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-500 mt-1 text-sm leading-relaxed">{subtitle}</p>}
      </div>

      <div className="space-y-5">{children}</div>

      <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
        <div className="flex gap-2">
          {!hideBack && (
            <Button variant="outline" size="sm" onClick={onBack} className="rounded-full px-5 text-gray-700 border-gray-300 bg-white hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4 mr-1" /> Zurück
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onSaveAndExit} className="text-gray-400 text-xs rounded-full">
            <LogOut className="w-3 h-3 mr-1" /> Speichern & beenden
          </Button>
        </div>
        <Button
          onClick={onNext}
          disabled={nextDisabled || saving}
          className="bg-[#FF3CAC] hover:bg-[#e030a0] text-white rounded-full px-8 font-semibold shadow-md"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}