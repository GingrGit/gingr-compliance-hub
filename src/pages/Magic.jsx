import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Magic() {
  const { t } = useI18n();
  const [status, setStatus] = useState("loading"); // loading | success | error | expired

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    base44.functions.invoke("verifyMagicLink", { token }).then((res) => {
      const data = res.data;
      if (data?.success && data?.profile_id) {
        // Store profile_id in sessionStorage and redirect to wizard
        sessionStorage.setItem("magic_profile_id", data.profile_id);
        sessionStorage.setItem("magic_phone", data.phone || "");
        setStatus("success");
        setTimeout(() => {
          window.location.href = createPageUrl("OnboardingWizard") + `?profile_id=${data.profile_id}`;
        }, 1500);
      } else if (data?.error === "Token expired") {
        setStatus("expired");
      } else {
        setStatus("error");
      }
    }).catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full text-center">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/73e94775a_GingrLogo4x.png"
          alt="gingr"
          className="h-10 object-contain mx-auto mb-6"
        />

        {status === "loading" && (
          <>
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{t("magic_link.verifying")}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800 mb-2">{t("magic_link.welcome_back")}</h2>
            <p className="text-gray-500 text-sm">{t("magic_link.redirecting")}</p>
          </>
        )}

        {status === "expired" && (
          <>
            <XCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800 mb-2">{t("magic_link.expired_title")}</h2>
            <p className="text-gray-500 text-sm">{t("magic_link.expired_desc")}</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800 mb-2">{t("magic_link.error_title")}</h2>
            <p className="text-gray-500 text-sm">{t("magic_link.error_desc")}</p>
          </>
        )}
      </div>
    </div>
  );
}