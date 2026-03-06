import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutDashboard, FileText, Bell, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";

function getDashboardUrl(profile) {
  const profileId = profile?.id;
  if (profileId) {
    return createPageUrl("WorkModelDashboard") + `?profile_id=${profileId}`;
  }
  return createPageUrl("WorkModelDashboard");
}

export default function StepCongratulations({ profile, onSubmit, saving, profileId }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    await onSubmit();
    setSubmitted(true);
  };

  if (!submitted) {
    return (
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-[#FF3CAC]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Alles bereit zum Einreichen!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Du hast alle Angaben erfasst. Klicke auf „Jetzt einreichen", um dein Onboarding abzuschliessen.
        </p>
        <Button
          className="bg-[#FF3CAC] hover:bg-[#e030a0] text-white rounded-full px-8 shadow-md"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Wird eingereicht…</> : "Jetzt einreichen"}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-8 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Vielen Dank! 🎉</h2>
      <p className="text-gray-600 text-sm mb-1">
        Wir haben alle deine Angaben erhalten.
      </p>
      <p className="text-gray-500 text-sm mb-7">
        Unser Team prüft jetzt deine Unterlagen. Sobald alles verifiziert ist, wirst du von uns per <strong>SMS und E-Mail</strong> benachrichtigt.
      </p>

      {/* What happens next */}
      <div className="bg-pink-50 border border-pink-100 rounded-xl p-5 text-left mb-7 space-y-3">
        <p className="text-xs font-semibold text-[#6B0064] uppercase tracking-wide mb-1">Was jetzt passiert</p>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText className="w-3 h-3 text-[#6B0064]" />
          </div>
          <p className="text-sm text-gray-700">Wir prüfen deine eingereichten Dokumente und Angaben.</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <LayoutDashboard className="w-3 h-3 text-[#6B0064]" />
          </div>
          <p className="text-sm text-gray-700">In deinem Dashboard siehst du jederzeit den Status deiner Dokumente und die Freigabe.</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Bell className="w-3 h-3 text-[#6B0064]" />
          </div>
          <p className="text-sm text-gray-700">Du erhältst eine Benachrichtigung per <strong>SMS und E-Mail</strong>, sobald dein Account freigegeben ist.</p>
        </div>
      </div>

      <a href={getDashboardUrl(profile)}>
        <Button className="w-full bg-[#FF3CAC] hover:bg-[#e030a0] text-white rounded-full py-3 text-base font-semibold shadow-md">
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Zu meinem Work Dashboard
        </Button>
      </a>
    </div>
  );
}