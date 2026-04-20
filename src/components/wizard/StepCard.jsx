import React from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";

export default function StepCard({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  onSaveAndExit,
  nextLabel,
  nextDisabled = false,
  saving = false,
  hideBack = false,
  validationError = null,
}) {
  const { t } = useI18n();
  const [isProcessingNext, setIsProcessingNext] = React.useState(false);
  const resolvedNextLabel = nextLabel ?? t("step_card.btn_next");

  const handleNextClick = async () => {
    if (saving || nextDisabled || isProcessingNext) return;
    setIsProcessingNext(true);
    try {
      await onNext?.();
    } finally {
      setIsProcessingNext(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-500 mt-1 text-sm leading-relaxed">{subtitle}</p>}
      </div>

      <div className="space-y-5">{children}</div>

      {validationError && (
        <div className="mt-5 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 animate-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{validationError}</p>
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {!hideBack ? (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={onBack} className="rounded-full px-3 sm:px-5 text-gray-700 border-gray-300 bg-white hover:bg-gray-50 flex-shrink-0">
                  <ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline ml-1">{t("step_card.btn_back")}</span>
                </Button>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{t("step_card.auto_save_notice")}</p>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{t("step_card.auto_save_notice")}</p>
            )}
          </div>
          <Button
            onClick={handleNextClick}
            disabled={saving || nextDisabled || isProcessingNext}
            className="bg-[#FF3CAC] hover:bg-[#e030a0] text-white rounded-full px-5 sm:px-8 font-semibold shadow-md flex-shrink-0 text-sm"
          >
            {(saving || isProcessingNext) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {resolvedNextLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}