import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  Briefcase, Shield, FileText, FileCheck, CreditCard, Receipt,
  Users, Timer, Settings, Loader2, ArrowRight, CheckCircle2, Lock
} from "lucide-react";
import DashboardTile from "@/components/dashboard/DashboardTile";
import StatusChip from "@/components/dashboard/StatusChip";
import DocumentList from "@/components/dashboard/DocumentList";

const MODEL_LABELS = {
  employee_unlimited: "Angestellt (unbefristet)",
  employee_90days: "Angestellt (max. 90 Tage)",
  self_employed: "Selbständig",
};

export default function WorkModelDashboard() {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get("profile_id");

    if (!profileId) {
      setLoading(false);
      return;
    }

    Promise.all([
      base44.entities.OnboardingProfile.filter({ id: profileId }),
      base44.entities.EscortDocument.filter({ profile_id: profileId }, "-created_date", 50),
    ]).then(([profiles, docs]) => {
      if (profiles && profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        // Show welcome screen if status is not "approved" yet
        if (p.status === "submitted" || p.status === "draft") {
          setShowWelcome(false); // They're in review — show the dashboard with pending states
        }
      }
      setDocuments(docs || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    const urlParams = new URLSearchParams(window.location.search);
    const hasProfileId = urlParams.get("profile_id");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full text-center">
          <Lock className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700 mb-2">
            {hasProfileId ? "Profil nicht gefunden" : "Kein Zugang"}
          </h2>
          <p className="text-gray-400 text-sm">
            {hasProfileId
              ? `Kein Profil mit ID "${hasProfileId}" gefunden.`
              : "Bitte verwende den Link aus deiner SMS um dein Dashboard zu öffnen."}
          </p>
        </div>
      </div>
    );
  }

  const isEmployee = profile.work_model === "employee_unlimited" || profile.work_model === "employee_90days";
  const is90Day = profile.work_model === "employee_90days";
  const isSelfEmployed = profile.work_model === "self_employed";
  const isApproved = profile.status === "approved";
  const isSwiss = profile.citizenship_group === "CH";

  // Derive statuses
  const permitStatus = (() => {
    if (isSwiss) return "not_required";
    if (!profile.permit_url) return "action_required";
    if (profile.permit_status === "approved") return "approved";
    if (profile.permit_status === "uploaded_review_pending") return "review_pending";
    if (profile.permit_status === "expired") return "action_required";
    return "review_pending";
  })();

  const payslips = documents.filter(d => d.type === "payslip");
  const statements = documents.filter(d => d.type === "monthly_statement" || d.type === "vat_statement");
  const contracts = documents.filter(d => d.type === "contract");

  // 90-day tracker
  const employment90DaysRemaining = (() => {
    if (!is90Day || !profile.submitted_at) return null;
    const start = new Date(profile.submitted_at);
    const end = new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const remaining = Math.max(0, Math.ceil((end - now) / (24 * 60 * 60 * 1000)));
    return { start, end, remaining };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/73e94775a_GingrLogo4x.png"
            alt="gingr"
            className="h-8 object-contain"
          />
          <div className="text-right">
            <p className="text-xs text-gray-500">Arbeitsmodell</p>
            <p className="text-sm font-semibold text-gray-800">
              {profile.first_name} {profile.last_name}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {/* Status Banner */}
        {!isApproved && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Timer className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">Onboarding wird geprüft</p>
              <p className="text-xs text-amber-600 mt-0.5">Das gingr-Team prüft deine Unterlagen. Bearbeitungszeit: 1–2 Arbeitstage.</p>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">Secure Booking aktiv ✨</p>
              <p className="text-xs text-green-600 mt-0.5">Dein Profil ist vollständig verifiziert und aktiviert.</p>
            </div>
          </div>
        )}

        {/* Tile 1 — Work model */}
        <DashboardTile
          icon={Briefcase}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          title="Arbeitsmodell"
          subtitle={MODEL_LABELS[profile.work_model] || "–"}
          status={<StatusChip status={isApproved ? "active" : "pending"} />}
          primaryAction={{ label: "Details ansehen", onClick: () => {} }}
        >
          <div className="space-y-2">
            <InfoRow label="Modell" value={MODEL_LABELS[profile.work_model] || "–"} />
            {profile.business_name && <InfoRow label="Unternehmen" value={profile.business_name} />}
            {profile.uid_number && <InfoRow label="UID" value={profile.uid_number} />}
            <p className="text-xs text-gray-500 mt-2">Dies ist dein aktives Setup für Secure Payment und rechtliche Compliance.</p>
          </div>
        </DashboardTile>

        {/* Tile 2 — Work eligibility */}
        <DashboardTile
          icon={Shield}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          title="Arbeitsberechtigung"
          subtitle={isSwiss ? "Schweizer Staatsbürger" : `Permit ${profile.permit_type || "–"}`}
          status={<StatusChip status={permitStatus} />}
          primaryAction={
            !isSwiss && permitStatus !== "approved"
              ? { label: "Dokument hochladen", onClick: () => window.location.href = createPageUrl("OnboardingWizard") + `?profile_id=${profile.id}` }
              : undefined
          }
          secondaryAction={{ label: "Support kontaktieren", onClick: () => {} }}
        >
          <div className="space-y-2">
            <InfoRow label="Staatsbürgerschaft" value={profile.citizenship_group || "–"} />
            <InfoRow label="Permit-Typ" value={isSwiss ? "Nicht erforderlich" : (profile.permit_type || "–")} />
            {!isSwiss && <InfoRow label="Status" value={profile.permit_status || "–"} />}
            <p className="text-xs text-gray-500 mt-2">Secure Payment kann nur aktiviert werden, wenn deine Arbeitsberechtigung bestätigt ist.</p>
          </div>
        </DashboardTile>

        {/* Tile 3 — Documents */}
        <DashboardTile
          icon={FileText}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
          title="Dokumente"
          subtitle={`${contracts.length} Vertrag${contracts.length !== 1 ? "e" : ""} verfügbar`}
          status={<StatusChip status={profile.contract_signed ? "available" : "review_pending"} customLabel={profile.contract_signed ? "Verfügbar" : "Warte auf Unterschrift"} />}
        >
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Lade deine signierten Vereinbarungen und alle rechtlichen Dokumente herunter.</p>
            <DocumentList documents={contracts} emptyText="Noch keine Verträge vorhanden." />
          </div>
        </DashboardTile>

        {/* Tile 4 — Terms & acceptance */}
        <DashboardTile
          icon={FileCheck}
          iconBg="bg-teal-100"
          iconColor="text-teal-600"
          title="AGB & Akzeptanzlog"
          subtitle={profile.contract_signed_at ? `Akzeptiert am ${new Date(profile.contract_signed_at).toLocaleDateString("de-CH")}` : "Noch nicht akzeptiert"}
          status={<StatusChip status={profile.contract_signed ? "up_to_date" : "action_required"} />}
          primaryAction={{ label: "AGB ansehen", onClick: () => {} }}
        >
          <div className="space-y-2">
            {profile.contract_signed_at && (
              <InfoRow label="Akzeptiert am" value={new Date(profile.contract_signed_at).toLocaleString("de-CH")} />
            )}
            <InfoRow label="Profil-ID" value={profile.id?.substring(0, 8) + "…"} />
            <p className="text-xs text-gray-500 mt-2">Zur Transparenz kannst du jederzeit sehen, was du wann akzeptiert hast.</p>
          </div>
        </DashboardTile>

        {/* Tile 5 — Permit (non-CH) */}
        {!isSwiss && (
          <DashboardTile
            icon={CreditCard}
            iconBg="bg-indigo-100"
            iconColor="text-indigo-600"
            title="Aufenthaltsbewilligung"
            subtitle={`Permit ${profile.permit_type || "–"}`}
            status={<StatusChip status={permitStatus} />}
            primaryAction={
              permitStatus !== "approved"
                ? { label: "Dokument hochladen", onClick: () => {} }
                : undefined
            }
            secondaryAction={{ label: "Wann wird das benötigt?", onClick: () => {} }}
          >
            <div className="space-y-2">
              <InfoRow label="Permit-Typ" value={profile.permit_type || "–"} />
              <InfoRow label="Status" value={profile.permit_status || "–"} />
              <p className="text-xs text-gray-500 mt-2">Manche Kantone verlangen einen zusätzlichen Nachweis der Arbeitsberechtigung.</p>
            </div>
          </DashboardTile>
        )}

        {/* Tile 6 — Payroll QUITT (employee only) */}
        <DashboardTile
          icon={Users}
          iconBg={isEmployee ? "bg-green-100" : "bg-gray-100"}
          iconColor={isEmployee ? "text-green-600" : "text-gray-400"}
          title="Lohnabrechnung (QUITT)"
          subtitle={isEmployee ? "QUITT verarbeitet deinen Lohn" : "Nicht verfügbar für Selbständige"}
          status={<StatusChip status={isEmployee ? (isApproved ? "active" : "pending") : "not_available"} />}
          unavailable={!isEmployee}
          primaryAction={isEmployee ? { label: "QUITT-Profil öffnen", onClick: () => {} } : undefined}
          secondaryAction={isEmployee ? { label: "Zugangs-E-Mail erneut senden", onClick: () => {} } : undefined}
        >
          <p className="text-xs text-gray-500">QUITT verwaltet die Gehaltsabrechnung und sendet dir monatliche Lohnabrechnungen.</p>
        </DashboardTile>

        {/* Tile 7 — Monthly payslips (employee only) */}
        {isEmployee && (
          <DashboardTile
            icon={Receipt}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            title="Monatliche Lohnausweise"
            subtitle={payslips.length > 0 ? `${payslips.length} Lohnausweis${payslips.length !== 1 ? "e" : ""} verfügbar` : "Noch nicht verfügbar"}
            status={<StatusChip status={payslips.length > 0 ? "available" : "not_yet_available"} />}
            primaryAction={payslips.length > 0 ? { label: "Letzten Lohnausweis herunterladen", onClick: () => window.open(payslips[0]?.file_url, "_blank") } : undefined}
            secondaryAction={payslips.length > 1 ? { label: "Alle ansehen", onClick: () => {} } : undefined}
          >
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Lohnausweise werden per E-Mail verschickt und sind hier zum Download verfügbar.</p>
              <DocumentList documents={payslips} emptyText="Noch keine Lohnausweise vorhanden. Sie werden vom gingr-Team hochgeladen." />
            </div>
          </DashboardTile>
        )}

        {/* Tile 8 — Monthly statements / VAT (self-employed only) */}
        {isSelfEmployed && (
          <DashboardTile
            icon={Receipt}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            title="Monatliche Abrechnungen & MwSt."
            subtitle={statements.length > 0 ? `${statements.length} Abrechnung${statements.length !== 1 ? "en" : ""} verfügbar` : "Noch nicht verfügbar"}
            status={<StatusChip status={statements.length > 0 ? "available" : "not_yet_available"} />}
            primaryAction={statements.length > 0 ? { label: "Letzte Abrechnung herunterladen", onClick: () => window.open(statements[0]?.file_url, "_blank") } : undefined}
            secondaryAction={statements.length > 0 ? { label: "MwSt.-Zusammenfassung herunterladen", onClick: () => {} } : undefined}
          >
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Monatliche Abrechnungen und MwSt.-Dokumentation wenn dein Betrieb mehrwertsteuerpflichtig ist.</p>
              <DocumentList documents={statements} emptyText="Noch keine Abrechnungen vorhanden. Sie werden vom gingr-Team hochgeladen." />
            </div>
          </DashboardTile>
        )}

        {/* Tile 9 — 90-day tracker */}
        {is90Day && employment90DaysRemaining && (
          <DashboardTile
            icon={Timer}
            iconBg={employment90DaysRemaining.remaining <= 14 ? "bg-orange-100" : "bg-blue-100"}
            iconColor={employment90DaysRemaining.remaining <= 14 ? "text-orange-600" : "text-blue-600"}
            title="90-Tage-Tracker"
            subtitle={`Noch ${employment90DaysRemaining.remaining} Tage verbleibend`}
            status={<StatusChip status={
              employment90DaysRemaining.remaining === 0 ? "action_required" :
              employment90DaysRemaining.remaining <= 14 ? "expires_soon" :
              "in_progress"
            } customLabel={
              employment90DaysRemaining.remaining === 0 ? "Abgelaufen" :
              employment90DaysRemaining.remaining <= 14 ? `Läuft in ${employment90DaysRemaining.remaining} Tagen ab` :
              "Läuft"
            } />}
            primaryAction={{ label: "Auf unbefristete Anstellung wechseln", onClick: () => {} }}
            secondaryAction={{ label: "Support kontaktieren", onClick: () => {} }}
          >
            <div className="space-y-2">
              <InfoRow label="Startdatum" value={employment90DaysRemaining.start.toLocaleDateString("de-CH")} />
              <InfoRow label="Enddatum" value={employment90DaysRemaining.end.toLocaleDateString("de-CH")} />
              <InfoRow label="Verbleibende Tage" value={`${employment90DaysRemaining.remaining} Tage`} />
              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>0</span>
                  <span>90 Tage</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${employment90DaysRemaining.remaining <= 14 ? "bg-orange-400" : "bg-blue-400"}`}
                    style={{ width: `${((90 - employment90DaysRemaining.remaining) / 90) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Dieses Modell ist zeitlich begrenzt. Behalte die verbleibenden Tage im Auge.</p>
            </div>
          </DashboardTile>
        )}

        {/* Tile 10 — Offboarding / change */}
        <DashboardTile
          icon={Settings}
          iconBg="bg-gray-100"
          iconColor="text-gray-500"
          title="Arbeitsmodell ändern oder beenden"
          subtitle="Kündigung, Wechsel oder Downgrade"
          status={<StatusChip status="available" />}
          primaryAction={{ label: "Kündigung / Wechsel verwalten", onClick: () => {} }}
          secondaryAction={{ label: "Auf Light Profile downgraden", onClick: () => {} }}
        >
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Du kannst dein Setup wechseln oder Secure Payment jederzeit deaktivieren. Änderungen treten gemäss deinem Vertrag in Kraft.</p>
            {isEmployee && (
              <button className="text-xs text-red-500 hover:text-red-700 mt-2">Beschäftigungsvertrag kündigen</button>
            )}
            {isSelfEmployed && (
              <button className="text-xs text-blue-500 hover:text-blue-700 mt-2">Zu Angestellten-Modell wechseln</button>
            )}
          </div>
        </DashboardTile>

        <p className="text-center text-xs text-gray-400 pb-6">
          gingr Legal Onboarding · Alle Daten sind verschlüsselt und sicher gespeichert.
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-800">{value}</span>
    </div>
  );
}