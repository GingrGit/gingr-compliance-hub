import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Mail, ArrowRight, LayoutDashboard } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

const MODEL_LABELS = {
  employee_unlimited: "Angestellte (unbefristet)",
  employee_90days: "Angestellte (max. 90 Tage)",
  self_employed: "Selbständig",
};

export default function StepCongratulations({ profile, onSubmit, saving }) {
  const [submitted, setSubmitted] = React.useState(false);
  const [sendingSms, setSendingSms] = React.useState(false);

  const handleSubmit = async () => {
    await onSubmit();
    setSubmitted(true);
    // Send dashboard link via SMS after submission
    if (profile.phone) {
      setSendingSms(true);
      try {
        await base44.functions.invoke("sendDashboardLink", {
          profile_id: profile.id,
          phone: profile.phone,
          app_url: window.location.origin,
        });
      } catch (_) {}
      setSendingSms(false);
    }
  };

  if (!submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fast geschafft! 🎉</h2>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Du hast alle Angaben gemacht. Klicke jetzt auf "Einreichen", um dein Onboarding abzuschliessen.
        </p>

        <div className="bg-gray-50 rounded-xl p-5 text-left mb-6 max-w-sm mx-auto space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Zusammenfassung</p>
          <SummaryRow label="Name" value={`${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "–"} />
          <SummaryRow label="Arbeitsmodell" value={MODEL_LABELS[profile.work_model] || "–"} />
          <SummaryRow label="Staatsangehörigkeit" value={profile.citizenship_group || "–"} />
          {profile.canton && <SummaryRow label="Kanton" value={profile.canton} />}
        </div>

        <Button
          onClick={handleSubmit}
          className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-8 py-5 text-base font-semibold"
        >
          Jetzt einreichen <ArrowRight className="w-4 h-4 ml-2 inline" />
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">🌸</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Herzlichen Glückwunsch!</h2>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
        Dein Onboarding wurde erfolgreich eingereicht. Das gingr-Team wird deine Unterlagen prüfen und sich bei dir melden.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-left">
          <Clock className="w-4 h-4 text-amber-500 mb-1" />
          <p className="text-xs font-medium text-amber-700">Bearbeitungszeit</p>
          <p className="text-xs text-amber-600 mt-0.5">In der Regel 1–2 Arbeitstage</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-left">
          <Mail className="w-4 h-4 text-blue-500 mb-1" />
          <p className="text-xs font-medium text-blue-700">Bestätigungsmail</p>
          <p className="text-xs text-blue-600 mt-0.5">Du erhältst eine E-Mail mit allen Details</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-green-700">Status: Eingereicht — wird geprüft</span>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-800">{value}</span>
    </div>
  );
}