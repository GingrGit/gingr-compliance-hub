import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutDashboard, FileText, Bell, PenLine } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getGingrBaseUrl } from "@/lib/env";

export default function StepCongratulations({ profile, profileId }) {
  const { t } = useI18n();
  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-8 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("step_congratulations.title")}</h2>
      <p className="text-gray-600 text-sm mb-1">{t("step_congratulations.desc1")}</p>
      <p className="text-gray-500 text-sm mb-7">{t("step_congratulations.desc2")}</p>

      <div className="bg-pink-50 border border-pink-100 rounded-xl p-5 text-left mb-7 space-y-4">
        <p className="text-xs font-semibold text-[#6B0064] uppercase tracking-wide">{t("step_congratulations.next_steps_title")}</p>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText className="w-3 h-3 text-[#6B0064]" />
          </div>
          <p className="text-sm text-gray-700">{t("step_congratulations.step_review")}</p>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <PenLine className="w-3 h-3 text-[#6B0064]" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              {profile?.work_model === "self_employed"
                ? t("step_congratulations.step_contract_self_employed")
                : t("step_congratulations.step_contract_employee")
              }
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <LayoutDashboard className="w-3 h-3 text-[#6B0064]" />
          </div>
          <p className="text-sm text-gray-700">{t("step_congratulations.step_dashboard")}</p>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Bell className="w-3 h-3 text-[#6B0064]" />
          </div>
          <p className="text-sm text-gray-700">{t("step_congratulations.step_activation")}</p>
        </div>
      </div>

      <a href={getGingrBaseUrl()}>
        <Button className="w-full bg-[#FF3CAC] hover:bg-[#e030a0] text-white rounded-full py-3 text-base font-semibold shadow-md">
          <LayoutDashboard className="w-4 h-4 mr-2" />
          {t("step_congratulations.btn_back_to_gingr")}
        </Button>
      </a>
    </div>
  );
}