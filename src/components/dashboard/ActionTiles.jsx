/**
 * ActionTiles — one-time or status-driven tiles:
 *  - Vertrag / Unterzeichnung
 *  - Arbeitsberechtigung / Aufenthaltsbewilligung
 *  - Prostituiertenbewilligung
 *  - 90-Tage Tracker
 */
import React, { useState, useRef } from "react";
import {
  FileSignature, CheckCircle2, Clock, AlertTriangle, Globe,
  ShieldCheck, Timer, ExternalLink, Upload, Loader2
} from "lucide-react";
import StatusChip from "./StatusChip";
import DashboardTile from "./DashboardTile";
import NinetyDayTracker from "./NinetyDayTracker";
import { base44 } from "@/api/base44Client";

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
export function ProstitutionPermitTile({ profile, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const cantons = ["ZH", "BE", "GE", "BS", "LU"];
  const mightBeRequired = cantons.includes(profile.canton);

  // Derive status from profile fields
  // We reuse profile.permit_status but scoped to the prostitution permit via a separate field ideally.
  // For now we use profile.prostitution_permit_status (new field) falling back to logic.
  const ppStatus = profile.prostitution_permit_status;
  const derivedStatus = ppStatus === "approved" ? "approved"
    : ppStatus === "submitted" ? "review_pending"
    : mightBeRequired ? "action_required"
    : "not_required";

  const statusLabel = derivedStatus === "approved" ? "Genehmigt"
    : derivedStatus === "review_pending" ? "In Prüfung"
    : derivedStatus === "action_required" ? "Aktion erforderlich"
    : "Nicht erforderlich";

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.OnboardingProfile.update(profile.id, {
      prostitution_permit_url: file_url,
      prostitution_permit_status: "submitted",
    });
    setUploading(false);
    if (onUpdate) onUpdate();
  }

  return (
    <DashboardTile
      icon={ShieldCheck}
      title="Prostituiertenbewilligung"
      subtitle={profile.canton ? `Kanton ${profile.canton} · ${statusLabel}` : "Kanton nicht bekannt"}
      status={<StatusChip status={derivedStatus} />}
      secondaryAction={{ label: "Wann ist das erforderlich?", onClick: () => {} }}
    >
      <p className="text-xs text-gray-500 mb-3">
        Einige Kantone verlangen eine zusätzliche Bewilligung für die Ausübung der Prostitution. Lade sie hier hoch, falls sie für dich gilt.
      </p>

      {/* Status block */}
      {derivedStatus === "approved" && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 mb-3">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-800">Bewilligung genehmigt</p>
            {profile.prostitution_permit_url && (
              <a href={profile.prostitution_permit_url} target="_blank" rel="noreferrer" className="text-[10px] text-green-600 underline">
                Dokument ansehen
              </a>
            )}
          </div>
        </div>
      )}

      {derivedStatus === "review_pending" && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-3">
          <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-800">Dokument eingereicht — wird geprüft</p>
            {profile.prostitution_permit_url && (
              <a href={profile.prostitution_permit_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 underline">
                Hochgeladenes Dokument ansehen
              </a>
            )}
          </div>
        </div>
      )}

      {derivedStatus === "action_required" && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          Im Kanton {profile.canton} ist eine kantonale Bewilligung in der Regel erforderlich. Bitte lade sie hoch.
        </div>
      )}

      {/* Upload area — show when not yet approved */}
      {derivedStatus !== "approved" && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-pink-200 hover:border-[#FF3CAC] text-sm text-gray-500 hover:text-[#FF3CAC] rounded-xl py-3 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Wird hochgeladen…</>
            ) : (
              <><Upload className="w-4 h-4" /> {derivedStatus === "review_pending" ? "Neues Dokument hochladen" : "Bewilligung hochladen (PDF / Bild)"}</>
            )}
          </button>
          {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
        </>
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