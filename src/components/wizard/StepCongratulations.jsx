import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutDashboard, FileText, MessageCircle } from "lucide-react";

export default function StepCongratulations({ profile, onSubmit, saving }) {
  const [submitted, setSubmitted] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const handleSubmit = async () => {
    await onSubmit();
    setSubmitted(true);
  };

  const handleSendDashboardLink = async () => {
    setSendingLink(true);
    await base44.functions.invoke("sendMagicLink", {
      profile_id: profile.id,
      email: profile.escort_email || undefined,
      phone: profile.phone || undefined,
      app_url: window.location.origin,
    });
    setSendingLink(false);
    setLinkSent(true);
  };

  if (!submitted) {
    return (
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-[#FF3CAC]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Alles bereit!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Bitte überprüfe deine Angaben und reiche das Onboarding ein. Nach der Einreichung prüfen wir deine Daten und melden uns bei dir.
        </p>
        <Button
          className="bg-[#FF3CAC] hover:bg-[#e030a0] text-white rounded-full px-8 shadow-md"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Wird eingereicht…" : "Jetzt einreichen"}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Vielen Dank!</h2>
      <p className="text-gray-500 text-sm mb-6">
        Dein Onboarding wurde erfolgreich eingereicht. Wir prüfen deine Angaben und melden uns bald bei dir.
      </p>

      {/* Dashboard Teaser */}
      <div className="bg-pink-50 border border-pink-100 rounded-xl p-5 text-left mb-6">
        <p className="text-sm font-semibold text-[#6B0064] mb-3 flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" /> Dein persönliches Dashboard
        </p>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-[#FF3CAC] mt-0.5 flex-shrink-0" />
            <span>Sieh den aktuellen Status deines Onboardings jederzeit ein.</span>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-[#FF3CAC] mt-0.5 flex-shrink-0" />
            <span>Alle deine Dokumente (Lohnabrechnungen, Verträge, MwSt.-Abrechnungen) an einem Ort.</span>
          </div>
          <div className="flex items-start gap-2">
            <MessageCircle className="w-3.5 h-3.5 text-[#FF3CAC] mt-0.5 flex-shrink-0" />
            <span>Nachrichten und Benachrichtigungen von gingr direkt in deinem Dashboard.</span>
          </div>
        </div>
      </div>

      {linkSent ? (
        <p className="text-green-600 text-sm font-medium">✓ Dashboard-Link wurde gesendet!</p>
      ) : (
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          onClick={handleSendDashboardLink}
          disabled={sendingLink}
        >
          {sendingLink ? "Wird gesendet…" : "Dashboard-Link per SMS / E-Mail erhalten"}
        </Button>
      )}
    </div>
  );
}