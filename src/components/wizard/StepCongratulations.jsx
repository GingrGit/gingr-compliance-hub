import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Mail, ArrowRight, LayoutDashboard, Loader2, FileText, Shield, Receipt } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

const MODEL_LABELS = {
  employee_unlimited: "Angestellte (unbefristet)",
  employee_90days: "Angestellte (max. 90 Tage)",
  self_employed: "Selbständig",
};

export default function StepCongratulations({ profile, onSubmit, saving }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetDashboardLink = async () => {
    setSendingLink(true);
    try {
      await base44.functions.invoke("sendMagicLink", {
        profile_id: profile.id,
        phone: profile.phone || null,
        email: profile.escort_email || null,
        app_url: window.location.origin,
      });
      setMagicLinkSent(true);
    } catch (_) {}
    setSendingLink(false);
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
          disabled={submitting}
          className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-8 py-5 text-base font-semibold"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
          Jetzt einreichen <ArrowRight className="w-4 h-4 ml-2 inline" />
        </Button>
      </div>
    );
  }

  // Thank you screen
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🌸</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Herzlichen Glückwunsch!</h2>
        <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
          Dein Onboarding wurde erfolgreich eingereicht. Das gingr-Team prüft deine Unterlagen in der Regel innerhalb von <strong>1–2 Arbeitstagen</strong>.
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-6">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span className="text-sm font-medium text-green-700">Status: Eingereicht — wird geprüft</span>
      </div>

      {/* Dashboard teaser */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <LayoutDashboard className="w-5 h-5 text-purple-600" />
          <p className="text-sm font-bold text-purple-800">Dein persönliches Dashboard</p>
        </div>
        <p className="text-xs text-purple-700 mb-4 leading-relaxed">
          Nach der Genehmigung hast du Zugang zu deinem persönlichen Work Model Dashboard. Dort findest du:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          <FeatureChip icon={FileText} label="Lohnausweise & Verträge" />
          <FeatureChip icon={Shield} label="Dein Arbeitsstatus & Permit" />
          <FeatureChip icon={Receipt} label="Monatliche Abrechnungen" />
        </div>
        {magicLinkSent ? (
          <div className="bg-white border border-purple-100 rounded-xl p-3 text-center">
            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-xs font-medium text-green-700">
              Dashboard-Link wurde {profile.phone ? "per SMS & " : ""}per E-Mail gesendet!
            </p>
          </div>
        ) : (
          <Button
            onClick={handleGetDashboardLink}
            disabled={sendingLink}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl"
          >
            {sendingLink ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LayoutDashboard className="w-4 h-4 mr-2" />}
            Dashboard-Link jetzt erhalten
          </Button>
        )}
      </div>

      {/* Info tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
          <Clock className="w-4 h-4 text-amber-500 mb-1" />
          <p className="text-xs font-medium text-amber-700">Bearbeitungszeit</p>
          <p className="text-xs text-amber-600 mt-0.5">In der Regel 1–2 Arbeitstage</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <Mail className="w-4 h-4 text-blue-500 mb-1" />
          <p className="text-xs font-medium text-blue-700">Bestätigungsmail</p>
          <p className="text-xs text-blue-600 mt-0.5">Du erhältst eine E-Mail mit allen Details</p>
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

function FeatureChip({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-purple-100 rounded-lg px-2.5 py-2">
      <Icon className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
      <span className="text-xs text-purple-700 font-medium">{label}</span>
    </div>
  );
}