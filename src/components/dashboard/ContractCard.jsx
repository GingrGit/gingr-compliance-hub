import React from "react";
import { FileSignature, CheckCircle2, Clock, Calendar } from "lucide-react";

const CONTRACT_CONFIG = {
  employee_unlimited: {
    label: "Arbeitsvertrag",
    description: "Unbefristetes Angestelltenverhältnis",
    color: "from-blue-50 to-indigo-50",
    border: "border-blue-100",
    accent: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  employee_90days: {
    label: "Arbeitsvertrag (90 Tage)",
    description: "Befristetes Angestelltenverhältnis",
    color: "from-orange-50 to-amber-50",
    border: "border-orange-100",
    accent: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
  },
  self_employed: {
    label: "Zusammenarbeitsvereinbarung",
    description: "Selbstständige Tätigkeit über gingr.ch",
    color: "from-purple-50 to-pink-50",
    border: "border-purple-100",
    accent: "text-purple-600",
    badge: "bg-purple-100 text-purple-700",
  },
};

export default function ContractCard({ profile, contracts }) {
  const config = CONTRACT_CONFIG[profile.work_model] || CONTRACT_CONFIG.employee_unlimited;
  const isSigned = profile.contract_signed;
  const signedAt = profile.contract_signed_at ? new Date(profile.contract_signed_at).toLocaleDateString("de-CH") : null;
  const startDate = profile.employment_start_date
    ? new Date(profile.employment_start_date).toLocaleDateString("de-CH", { day: "2-digit", month: "long", year: "numeric" })
    : null;
  const latestContract = contracts?.[0];

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${config.color} border ${config.border} shadow-sm p-5`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
            <FileSignature className={`w-5 h-5 ${config.accent}`} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Vertrag</p>
            <h3 className="text-sm font-bold text-gray-900">{config.label}</h3>
            <p className="text-xs text-gray-500">{config.description}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${isSigned ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {isSigned ? "Unterzeichnet" : "Ausstehend"}
        </span>
      </div>

      {/* Start date */}
      {startDate && (
        <div className="flex items-center gap-2 bg-white/70 rounded-xl px-3 py-2.5 mb-3">
          <Calendar className={`w-4 h-4 ${config.accent} flex-shrink-0`} />
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Gültig ab</p>
            <p className="text-sm font-semibold text-gray-800">{startDate}</p>
          </div>
        </div>
      )}

      {/* Signed status */}
      {isSigned ? (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 mb-3">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-800">Vertrag digital unterzeichnet</p>
            {signedAt && <p className="text-[10px] text-green-600">Am {signedAt}</p>}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-white/60 border border-gray-100 rounded-xl px-3 py-2.5 mb-3">
          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500">
            {profile.status === "submitted"
              ? "Du erhältst den Signierlink per SMS/E-Mail nach der Prüfung."
              : "Noch kein Vertrag – wird nach Freigabe zugestellt."}
          </p>
        </div>
      )}

      {/* Download link */}
      {latestContract?.file_url && (
        <button
          onClick={() => window.open(latestContract.file_url, "_blank")}
          className={`w-full text-xs font-semibold ${config.accent} flex items-center justify-center gap-1.5 bg-white/80 hover:bg-white rounded-xl py-2 transition-colors border border-white`}
        >
          <FileSignature className="w-3.5 h-3.5" />
          Vertrag herunterladen
        </button>
      )}
    </div>
  );
}