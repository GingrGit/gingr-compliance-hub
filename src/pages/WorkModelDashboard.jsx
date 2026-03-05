import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  Briefcase, Globe, FileText, ScrollText, Shield, CreditCard,
  Receipt, BarChart2, Settings, Timer, CheckCircle2, Loader2,
  AlertTriangle, ExternalLink, Lock
} from "lucide-react";
import StatusChip from "@/components/dashboard/StatusChip";
import DashboardTile from "@/components/dashboard/DashboardTile";
import DocumentList from "@/components/dashboard/DocumentList";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import NinetyDayTracker from "@/components/dashboard/NinetyDayTracker";

const WORK_MODEL_LABELS = {
  employee_unlimited: "Anstellung (unbefristet)",
  employee_90days: "Anstellung (90 Tage)",
  self_employed: "Selbstständig",
};

function getPermitStatus(profile) {
  if (profile.citizenship_group === "CH") return "not_required";
  if (!profile.permit_url) return "action_required";
  return profile.permit_status === "approved" ? "approved"
    : profile.permit_status === "uploaded_review_pending" ? "review_pending"
    : profile.permit_status === "missing" ? "action_required"
    : profile.permit_status === "expired" ? "action_required"
    : "review_pending";
}

function getOverallStatus(profile) {
  if (profile.status === "approved") return "active";
  if (profile.status === "submitted") return "review_pending";
  if (profile.status === "needs_action") return "action_required";
  return "pending";
}

export default function WorkModelDashboard() {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const profileId = params.get("profile_id");
    if (!profileId) { setNotFound(true); setLoading(false); return; }

    Promise.all([
      base44.entities.OnboardingProfile.filter({ id: profileId }),
      base44.entities.EscortDocument.filter({ profile_id: profileId }),
    ]).then(([profiles, docs]) => {
      if (!profiles || profiles.length === 0) { setNotFound(true); }
      else { setProfile(profiles[0]); setDocuments(docs || []); }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF3CAC] animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-[#FF3CAC]" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard nicht gefunden</h1>
        <p className="text-sm text-gray-500 max-w-xs">
          Bitte verwende den Link aus deiner SMS oder E-Mail, um dein Dashboard zu öffnen.
        </p>
        <a href={createPageUrl("MagicLinkLogin")} className="text-sm text-[#FF3CAC] hover:underline">
          Neuen Zugangslink anfordern
        </a>
      </div>
    );
  }

  const isEmployee = profile.work_model === "employee_unlimited" || profile.work_model === "employee_90days";
  const is90Day = profile.work_model === "employee_90days";
  const isSelfEmployed = profile.work_model === "self_employed";
  const overallStatus = getOverallStatus(profile);
  const permitStatus = getPermitStatus(profile);
  const isApproved = profile.status === "approved";

  const payslips = documents.filter(d => d.type === "payslip");
  const statements = documents.filter(d => d.type === "monthly_statement");
  const vatDocs = documents.filter(d => d.type === "vat_statement");
  const contracts = documents.filter(d => d.type === "contract");

  return (
    <div className="min-h-screen bg-[#F0F0F0] pb-16">
      {/* Header */}
      <DashboardHeader profile={profile} overallStatus={overallStatus} isApproved={isApproved} />

      <div className="max-w-2xl mx-auto px-4 space-y-3 mt-6">

        {/* Tile 1 — Work Model */}
        <DashboardTile
          icon={Briefcase}
          title="Work Model"
          subtitle={WORK_MODEL_LABELS[profile.work_model] || "Noch nicht festgelegt"}
          status={<StatusChip status={isApproved ? "active" : profile.status === "submitted" ? "review_pending" : "pending"} />}
          primaryAction={{ label: "Details ansehen", onClick: () => {} }}
        >
          <div className="space-y-2 text-sm">
            <p className="text-gray-500 text-xs">Dies ist dein aktives Setup für Secure Payment und rechtliche Compliance.</p>
            {profile.work_model && (
              <div className="bg-pink-50 border border-pink-100 rounded-xl p-3">
                <p className="font-semibold text-gray-800">{WORK_MODEL_LABELS[profile.work_model]}</p>
                {profile.source_tax === "yes" && (
                  <p className="text-xs text-gray-500 mt-1">Quellensteuer: Ja</p>
                )}
                {profile.canton && (
                  <p className="text-xs text-gray-500">Kanton: {profile.canton}</p>
                )}
              </div>
            )}
          </div>
        </DashboardTile>

        {/* Tile 2 — Work Eligibility */}
        <DashboardTile
          icon={Globe}
          title="Arbeitsberechtigung"
          subtitle={
            profile.citizenship_group === "CH" ? "Schweizer Staatsbürgerschaft"
            : profile.citizenship_group === "EU_EFTA" ? "EU/EFTA-Bürger"
            : profile.citizenship_group === "NON_EU" ? "Drittstaatsangehörige"
            : "Nationalität nicht angegeben"
          }
          status={<StatusChip status={permitStatus === "not_required" ? "approved" : permitStatus} />}
          primaryAction={permitStatus === "action_required" ? { label: "Dokument hochladen", onClick: () => window.location.href = createPageUrl("OnboardingWizard") } : undefined}
          secondaryAction={{ label: "Support kontaktieren", onClick: () => {} }}
        >
          <p className="text-xs text-gray-500">Secure Payment kann nur aktiviert werden, wenn deine Arbeitsberechtigung in der Schweiz bestätigt ist.</p>
          {profile.citizenship_group !== "CH" && (
            <div className="mt-3 bg-gray-50 rounded-xl p-3 text-sm">
              <p className="text-xs text-gray-500">Aufenthaltsbewilligung</p>
              <p className="font-medium text-gray-800 mt-0.5">
                Typ {profile.permit_type || "–"} &nbsp;·&nbsp;
                <StatusChip status={permitStatus} />
              </p>
            </div>
          )}
        </DashboardTile>

        {/* Tile 3 — Documents */}
        <DashboardTile
          icon={FileText}
          title="Dokumente & Verträge"
          subtitle={contracts.length > 0 ? `${contracts.length} Dokument${contracts.length > 1 ? "e" : ""} verfügbar` : "Noch keine Dokumente"}
          status={<StatusChip status={contracts.length > 0 ? "available" : "not_yet_available"} />}
          primaryAction={contracts.length > 0 ? { label: "Letzten Vertrag herunterladen", onClick: () => window.open(contracts[0].file_url, "_blank") } : undefined}
        >
          <p className="text-xs text-gray-500 mb-3">Lade deine unterzeichneten Verträge und alle rechtlichen Dokumente jederzeit herunter.</p>
          <DocumentList documents={contracts} emptyText="Noch kein Vertrag vorhanden — wird nach Genehmigung bereitgestellt." />
        </DashboardTile>

        {/* Tile 4 — Terms */}
        <DashboardTile
          icon={ScrollText}
          title="AGB & Akzeptanzprotokoll"
          subtitle={profile.contract_signed ? `Unterzeichnet am ${profile.contract_signed_at ? new Date(profile.contract_signed_at).toLocaleDateString("de-CH") : "–"}` : "Noch nicht unterzeichnet"}
          status={<StatusChip status={profile.contract_signed ? "up_to_date" : "action_required"} />}
          primaryAction={{ label: "AGB ansehen", onClick: () => {} }}
        >
          <p className="text-xs text-gray-500 mb-3">Zur Transparenz kannst du jederzeit einsehen, was du wann akzeptiert hast.</p>
          {profile.contract_signed && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-green-700 font-medium">Vertrag unterzeichnet</span>
              </div>
              {profile.contract_signed_at && (
                <p className="text-xs text-gray-400 mt-1">{new Date(profile.contract_signed_at).toLocaleString("de-CH")}</p>
              )}
            </div>
          )}
        </DashboardTile>

        {/* Tile 5 — Prostitution Permit */}
        <DashboardTile
          icon={Shield}
          title="Prostituiertenbewilligung"
          subtitle={profile.citizenship_group === "CH" || !profile.canton ? "Status prüfen" : `Kanton ${profile.canton}`}
          status={<StatusChip status={permitStatus === "not_required" && profile.citizenship_group === "CH" ? "not_required" : permitStatus} />}
          unavailable={!profile.canton}
          secondaryAction={{ label: "Wann ist das erforderlich?", onClick: () => {} }}
        >
          <p className="text-xs text-gray-500 mb-3">Einige Kantone erfordern eine zusätzliche Bewilligung. Lade sie hier hoch, falls sie für dich gilt.</p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
            In Kantonen wie Zürich, Bern und Genf kann eine kantonale Bewilligung notwendig sein.
          </div>
        </DashboardTile>

        {/* Tile 6 — Payroll QUITT (Employee only) */}
        {isEmployee && (
          <DashboardTile
            icon={CreditCard}
            title="Lohnabrechnung (QUITT)"
            subtitle="QUITT übernimmt die Lohnverarbeitung"
            status={<StatusChip status={isApproved ? "active" : "pending"} />}
            primaryAction={{ label: "QUITT-Profil öffnen", onClick: () => window.open("https://quitt.ch", "_blank") }}
            secondaryAction={{ label: "Zugangs-E-Mail erneut senden", onClick: () => {} }}
          >
            <p className="text-xs text-gray-500">QUITT verarbeitet deine Löhne und sendet dir monatliche Lohnabrechnungen.</p>
          </DashboardTile>
        )}

        {/* Tile 7 — Payslips (Employee only) */}
        {isEmployee && (
          <DashboardTile
            icon={Receipt}
            title="Lohnabrechnungen"
            subtitle={payslips.length > 0 ? `Letzter: ${payslips[0].period || payslips[0].label}` : "Noch keine Abrechnungen"}
            status={<StatusChip status={payslips.length > 0 ? "available" : "not_yet_available"} />}
            primaryAction={payslips.length > 0 ? { label: "Letzte Abrechnung herunterladen", onClick: () => window.open(payslips[0].file_url, "_blank") } : undefined}
          >
            <p className="text-xs text-gray-500 mb-3">Lohnabrechnungen werden per E-Mail zugestellt und sind hier zum Download verfügbar.</p>
            <DocumentList documents={payslips} emptyText="Noch keine Lohnabrechnungen — erscheinen nach dem ersten Abrechnungsmonat." />
          </DashboardTile>
        )}

        {/* Tile 8 — Statements & VAT (Self-employed only) */}
        {isSelfEmployed && (
          <DashboardTile
            icon={BarChart2}
            title="Monatsabrechnungen & MWST"
            subtitle={statements.length > 0 ? `Letzter: ${statements[0].period || statements[0].label}` : "Noch keine Abrechnungen"}
            status={<StatusChip status={statements.length > 0 ? "available" : "not_yet_available"} />}
            primaryAction={statements.length > 0 ? { label: "Letzte Abrechnung herunterladen", onClick: () => window.open(statements[0].file_url, "_blank") } : undefined}
            secondaryAction={vatDocs.length > 0 ? { label: "MWST-Zusammenfassung herunterladen", onClick: () => window.open(vatDocs[0].file_url, "_blank") } : undefined}
          >
            <p className="text-xs text-gray-500 mb-3">Lade Monatsabrechnungen und MWST-Dokumentation herunter, falls dein Unternehmen MWST-pflichtig ist.</p>
            <DocumentList documents={[...statements, ...vatDocs]} emptyText="Noch keine Abrechnungen — erscheinen nach dem ersten Abrechnungsmonat." />
          </DashboardTile>
        )}

        {/* Tile 9 — 90-day tracker */}
        {is90Day && (
          <DashboardTile
            icon={Timer}
            title="90-Tage Tracker"
            subtitle="Zeitbegrenztes Arbeitsverhältnis"
            status={<StatusChip status="in_progress" />}
            primaryAction={{ label: "Auf unbefristete Anstellung wechseln", onClick: () => {} }}
            secondaryAction={{ label: "Support kontaktieren", onClick: () => {} }}
          >
            <p className="text-xs text-gray-500 mb-3">Dieses Modell ist zeitlich begrenzt. Behalte die verbleibenden Tage im Blick, um Unterbrechungen zu vermeiden.</p>
            <NinetyDayTracker profile={profile} />
          </DashboardTile>
        )}

        {/* Tile 10 — Offboarding */}
        <DashboardTile
          icon={Settings}
          title="Setup ändern oder beenden"
          subtitle="Wechsel oder Kündigung des Work Models"
          status={<StatusChip status="available" />}
          primaryAction={{ label: "Kündigung / Wechsel verwalten", onClick: () => {} }}
          secondaryAction={{ label: "Auf Light Profile downgraden", onClick: () => {} }}
        >
          <p className="text-xs text-gray-500 mb-3">Du kannst dein Setup jederzeit wechseln oder Secure Payment beenden. Änderungen treten gemäss deinem Vertrag / unserer Richtlinie in Kraft.</p>
          <div className="space-y-2">
            {isEmployee && <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2"><ExternalLink className="w-3.5 h-3.5 text-gray-400" /> Beschäftigungsvertrag kündigen</div>}
            {isSelfEmployed && <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2"><ExternalLink className="w-3.5 h-3.5 text-gray-400" /> Zu Anstellung wechseln</div>}
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2"><ExternalLink className="w-3.5 h-3.5 text-gray-400" /> Secure Payment deaktivieren</div>
          </div>
        </DashboardTile>

      </div>
    </div>
  );
}