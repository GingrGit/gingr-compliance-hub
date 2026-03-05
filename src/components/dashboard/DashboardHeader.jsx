import React from "react";
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

const statusConfig = {
  active: {
    label: "Secure Booking aktiv",
    icon: ShieldCheck,
    bg: "bg-green-500",
    text: "text-green-700",
    badge: "bg-green-100 border-green-200 text-green-700",
  },
  review_pending: {
    label: "Wird geprüft",
    icon: Clock,
    bg: "bg-blue-400",
    text: "text-blue-700",
    badge: "bg-blue-50 border-blue-200 text-blue-700",
  },
  action_required: {
    label: "Aktion erforderlich",
    icon: AlertTriangle,
    bg: "bg-amber-400",
    text: "text-amber-700",
    badge: "bg-amber-50 border-amber-200 text-amber-700",
  },
  pending: {
    label: "Onboarding ausstehend",
    icon: Clock,
    bg: "bg-gray-400",
    text: "text-gray-600",
    badge: "bg-gray-100 border-gray-200 text-gray-600",
  },
};

export default function DashboardHeader({ profile, overallStatus, isApproved }) {
  const config = statusConfig[overallStatus] || statusConfig.pending;
  const StatusIcon = config.icon;

  const firstName = profile.first_name || "";
  const submittedAt = profile.submitted_at ? new Date(profile.submitted_at).toLocaleDateString("de-CH") : null;

  return (
    <div className="bg-white border-b border-pink-100 shadow-sm">
      {/* Top pink accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#FF3CAC] via-pink-400 to-purple-400" />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Logo + brand */}
        <div className="flex items-center justify-between mb-5">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/e355eb65f_GingrLogo4x.png"
            alt="Gingr"
            className="h-7 object-contain"
          />
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${config.badge}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {config.label}
          </span>
        </div>

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {firstName ? `Hallo, ${firstName} 👋` : "Dein Work Dashboard"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isApproved
              ? "Dein Profil ist vollständig verifiziert. Secure Booking ist aktiv."
              : overallStatus === "review_pending"
              ? `Deine Unterlagen wurden${submittedAt ? ` am ${submittedAt}` : ""} eingereicht und werden gerade geprüft.`
              : "Hier findest du alle Informationen zu deinem Work Model und deinen Dokumenten."}
          </p>
        </div>

        {/* Profile completion bar */}
        {!isApproved && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Profil-Vollständigkeit</span>
              <span className="text-xs font-semibold text-[#FF3CAC]">
                {overallStatus === "review_pending" ? "Prüfung läuft" : "In Bearbeitung"}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF3CAC] to-pink-400 rounded-full transition-all duration-500"
                style={{
                  width: overallStatus === "review_pending" ? "85%" : overallStatus === "active" ? "100%" : "60%"
                }}
              />
            </div>
          </div>
        )}

        {/* Approved banner */}
        {isApproved && (
          <div className="mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Secure Booking ist aktiv</p>
              <p className="text-xs text-green-600">Du erscheinst als vollständig ongeboardetes, professionelles Profil.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}