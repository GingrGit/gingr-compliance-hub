import React from "react";
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Timer } from "lucide-react";
import { differenceInDays, parseISO, addDays, format } from "date-fns";
import { de } from "date-fns/locale";

const statusConfig = {
  active: {
    label: "Secure Booking aktiv",
    icon: ShieldCheck,
    badge: "bg-green-100 border-green-200 text-green-700",
  },
  review_pending: {
    label: "Wird geprüft",
    icon: Clock,
    badge: "bg-blue-50 border-blue-200 text-blue-700",
  },
  action_required: {
    label: "Aktion erforderlich",
    icon: AlertTriangle,
    badge: "bg-amber-50 border-amber-200 text-amber-700",
  },
  pending: {
    label: "Onboarding ausstehend",
    icon: Clock,
    badge: "bg-gray-100 border-gray-200 text-gray-600",
  },
};

function ContractTimer({ profile }) {
  const startDate = profile.submitted_at ? parseISO(profile.submitted_at) : null;
  if (!startDate) return null;

  const endDate = addDays(startDate, 90);
  const today = new Date();
  const daysRemaining = Math.max(0, differenceInDays(endDate, today));
  const daysPassed = Math.min(90, differenceInDays(today, startDate));
  const progress = Math.round((daysPassed / 90) * 100);

  const isExpiringSoon = daysRemaining <= 14 && daysRemaining > 0;
  const isEnded = daysRemaining === 0;

  const barColor = isEnded
    ? "bg-red-500"
    : isExpiringSoon
    ? "bg-orange-400"
    : "bg-gradient-to-r from-[#FF3CAC] to-pink-400";

  const timerColor = isEnded
    ? "text-red-600"
    : isExpiringSoon
    ? "text-orange-600"
    : "text-[#FF3CAC]";

  return (
    <div className={`mt-4 rounded-2xl border p-4 ${isEnded ? "bg-red-50 border-red-200" : isExpiringSoon ? "bg-orange-50 border-orange-200" : "bg-pink-50 border-pink-100"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className={`w-4 h-4 ${timerColor}`} />
          <span className="text-sm font-semibold text-gray-800">90-Tage Vertrag</span>
        </div>
        <span className={`text-2xl font-bold tabular-nums ${timerColor}`}>
          {isEnded ? "Abgelaufen" : `${daysRemaining}d`}
        </span>
      </div>

      <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-3">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Start: {format(startDate, "dd. MMM yyyy", { locale: de })}</span>
        <span>Ende: {format(endDate, "dd. MMM yyyy", { locale: de })}</span>
      </div>

      {isExpiringSoon && !isEnded && (
        <p className="mt-2 text-xs text-orange-700 font-medium">
          ⏳ Dein Vertrag läuft bald ab — bitte kontaktiere Gingr für einen Wechsel.
        </p>
      )}
      {isEnded && (
        <p className="mt-2 text-xs text-red-700 font-medium">
          ⚠️ Die 90-Tage-Periode ist abgelaufen. Bitte kontaktiere den Support.
        </p>
      )}
    </div>
  );
}

export default function DashboardHeader({ profile, overallStatus, isApproved }) {
  const config = statusConfig[overallStatus] || statusConfig.pending;
  const StatusIcon = config.icon;
  const firstName = profile.first_name || "";
  const is90Day = profile.work_model === "employee_90days";
  const submittedAt = profile.submitted_at ? new Date(profile.submitted_at).toLocaleDateString("de-CH") : null;

  return (
    <div className="bg-white border-b border-pink-100 shadow-sm">
      <div className="h-1 bg-gradient-to-r from-[#FF3CAC] via-pink-400 to-purple-400" />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Logo + status badge */}
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

        {/* 90-day timer — prominent in header */}
        {is90Day && <ContractTimer profile={profile} />}

        {/* Profile completion bar (non-approved, non-90-day) */}
        {!isApproved && !is90Day && (
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
                style={{ width: overallStatus === "review_pending" ? "85%" : "60%" }}
              />
            </div>
          </div>
        )}

        {/* Approved banner */}
        {isApproved && !is90Day && (
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