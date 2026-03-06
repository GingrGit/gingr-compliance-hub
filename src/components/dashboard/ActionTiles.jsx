/**
 * ActionTiles — one-time or status-driven tiles:
 *  - Vertrag / Unterzeichnung
 *  - Arbeitsberechtigung / Aufenthaltsbewilligung
 *  - Prostituiertenbewilligung
 *  - 90-Tage Tracker
 */
import React from "react";
import {
  FileSignature, CheckCircle2, Clock, AlertTriangle, Globe,
  ShieldCheck, Timer, ExternalLink, Download
} from "lucide-react";
import StatusChip from "./StatusChip";
import DashboardTile from "./DashboardTile";
import NinetyDayTracker from "./NinetyDayTracker";

const CONTRACT_LABELS = {
  employee_unlimited: "Arbeitsvertrag",
  employee_90days: "Arbeitsvertrag (90 Tage)",
  self_employed: "Zusammenarbeitsvereinbarung",
};

function getPermitStatus(profile) {
  if (profile.citizenship_group === "CH") return "not_required";
  if (!profile.permit_url) return "action_required";
  return profile.permit_status === "approved" ? "approved"
    : profile.permit_status === "uploaded_review_pending" ? "review_pending"
    : "action_required";
}

// ── Vertrag / Signatur ────────────────────────────────────────────────────────
export function ContractTile({ profile, contracts }) {
  const label = CONTRACT_LABELS[profile.work_model] || "Vertrag";
  const isSigned = profile.contract_signed;
  const signedAt = profile.contract_signed_at
    ? new Date(profile.contract_signed_at).toLocaleDateString("de-CH")
    : null;
  const startDate = profile.employment_start_date
    ? new Date(profile.employment_start_date).toLocaleDateString("de-CH", { day: "2-digit", month: "long", year: "numeric" })
    : null;
  const latestContract = contracts?.[0];

  return (
    <DashboardTile
      icon={FileSignature}
      title={label}
      subtitle={isSigned ? `Unterzeichnet${signedAt ? ` am ${signedAt}` : ""}` : "Signatur ausstehend"}
      status={<StatusChip status={isSigned ? "up_to_date" : profile.status === "submitted" ? "review_pending" : "action_required"} />}
      primaryAction={latestContract?.file_url ? {
        label: "Vertrag herunterladen",
        onClick: () => window.open(latestContract.file_url, "_blank"),
      } : undefined}
    >
      {isSigned ? (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-800">Digital unterzeichnet</p>
            {signedAt && <p className="text-[10px] text-green-600">Am {signedAt}</p>}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            {profile.status === "submitted"
              ? "Du erhältst den Signierlink per SMS/E-Mail nach der Prüfung."
              : "Noch kein Vertrag — wird nach Freigabe zugestellt."}
          </p>
        </div>
      )}
      {startDate && (
        <p className="text-xs text-gray-400 mt-2">Gültig ab: <span className="font-medium text-gray-600">{startDate}</span></p>
      )}
    </DashboardTile>
  );
}

// ── Arbeitsberechtigung ───────────────────────────────────────────────────────
export function WorkEligibilityTile({ profile }) {
  const permitStatus = getPermitStatus(profile);
  const citizenshipLabel = profile.citizenship_group === "CH" ? "Schweizer Staatsbürgerschaft"
    : profile.citizenship_group === "EU_EFTA" ? "EU/EFTA-Bürgerin"
    : profile.citizenship_group === "NON_EU" ? "Drittstaatsangehörige"
    : "Nicht angegeben";

  if (profile.citizenship_group === "CH") {
    return (
      <DashboardTile
        icon={Globe}
        title="Arbeitsberechtigung"
        subtitle="Schweizer Staatsbürgerschaft"
        status={<StatusChip status="approved" />}
      >
        <p className="text-xs text-gray-500">Keine Aufenthaltsbewilligung erforderlich.</p>
      </DashboardTile>
    );
  }

  return (
    <DashboardTile
      icon={Globe}
      title="Arbeitsberechtigung"
      subtitle={citizenshipLabel}
      status={<StatusChip status={permitStatus} />}
      primaryAction={permitStatus === "action_required" ? {
        label: "Bewilligung hochladen",
        onClick: () => {},
      } : undefined}
      secondaryAction={{ label: "Support kontaktieren", onClick: () => {} }}
    >
      <div className="bg-gray-50 rounded-xl p-3">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Aufenthaltsbewilligung</p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-800">
            {profile.permit_type ? `Typ ${profile.permit_type}` : "Nicht angegeben"}
          </p>
          <StatusChip status={permitStatus} />
        </div>
      </div>
      {permitStatus === "action_required" && (
        <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          Bitte lade deine Aufenthaltsbewilligung hoch, damit wir dein Profil freischalten können.
        </div>
      )}
    </DashboardTile>
  );
}

// ── Prostituiertenbewilligung ─────────────────────────────────────────────────
export function ProstitutionPermitTile({ profile }) {
  const needed = !!profile.canton;
  const cantons = ["ZH", "BE", "GE", "BS", "LU"];
  const mightBeRequired = cantons.includes(profile.canton);

  return (
    <DashboardTile
      icon={ShieldCheck}
      title="Prostituiertenbewilligung"
      subtitle={profile.canton ? `Kanton ${profile.canton}` : "Kanton nicht bekannt"}
      status={<StatusChip status={mightBeRequired ? "action_required" : "not_required"} />}
      unavailable={!needed}
      secondaryAction={{ label: "Wann ist das erforderlich?", onClick: () => {} }}
    >
      <p className="text-xs text-gray-500 mb-2">
        Einige Kantone verlangen eine zusätzliche Bewilligung. Lade sie hier hoch, falls sie für dich gilt.
      </p>
      {mightBeRequired && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          Im Kanton {profile.canton} ist eine kantonale Bewilligung in der Regel erforderlich.
        </div>
      )}
    </DashboardTile>
  );
}

// ── 90-Tage Tracker ───────────────────────────────────────────────────────────
export function NinetyDayTile({ profile }) {
  return (
    <DashboardTile
      icon={Timer}
      title="90-Tage Tracker"
      subtitle="Befristetes Arbeitsverhältnis"
      status={<StatusChip status="in_progress" />}
      primaryAction={{ label: "Auf unbefristete Anstellung wechseln", onClick: () => {} }}
      secondaryAction={{ label: "Support kontaktieren", onClick: () => {} }}
    >
      <p className="text-xs text-gray-500 mb-3">
        Dieses Modell ist zeitlich begrenzt. Behalte die verbleibenden Tage im Blick.
      </p>
      <NinetyDayTracker profile={profile} />
    </DashboardTile>
  );
}