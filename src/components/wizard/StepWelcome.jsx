import React from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, HeartHandshake } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function StepWelcome({ onNext, mode }) {
  const { t } = useI18n();
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-[#FF3CAC]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          {mode === "guided" ? t("step_welcome.title_guided") : t("step_welcome.title_self")}
        </h1>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          {mode === "guided" ? t("step_welcome.desc_guided") : t("step_welcome.desc_self")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
        {[
          { icon: Clock, titleKey: "step_welcome.stat_duration_title", descKey: "step_welcome.stat_duration_desc" },
          { icon: ShieldCheck, titleKey: "step_welcome.stat_secure_title", descKey: "step_welcome.stat_secure_desc" },
          { icon: HeartHandshake, titleKey: "step_welcome.stat_pause_title", descKey: "step_welcome.stat_pause_desc" },
        ].map(({ icon: Icon, titleKey, descKey }) => (
          <div key={titleKey} className="bg-pink-50 rounded-xl p-4 text-center">
            <Icon className="w-5 h-5 text-[#FF3CAC] mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">{t(titleKey)}</p>
            <p className="text-xs text-gray-500">{t(descKey)}</p>
          </div>
        ))}
      </div>

      <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 mb-8">
        <p className="text-sm font-medium text-[#6B0064] mb-1">{t("step_welcome.checklist_title")}</p>
        <ul className="text-sm text-[#6B0064] space-y-1 list-disc list-inside">
          <li>{t("step_welcome.checklist_id")}</li>
          <li>{t("step_welcome.checklist_permit")}</li>
          <li>{t("step_welcome.checklist_ahv")}</li>
          <li>{t("step_welcome.checklist_iban")}</li>
        </ul>
      </div>

      <Button
        onClick={() => onNext({})}
        className="w-full bg-[#FF3CAC] hover:bg-[#e030a0] text-white rounded-full py-6 text-base font-semibold shadow-md"
      >
        {t("step_welcome.btn_start")}
      </Button>
    </div>
  );
}