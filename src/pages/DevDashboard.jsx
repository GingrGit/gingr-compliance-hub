import React, { useState } from "react";
import { DEV_SCENARIOS } from "@/components/dev/devDummyData";

// Dashboard rendering — same logic as WorkModelDashboard but fed with local data
import {
  Briefcase, Globe, FileText, ScrollText, Shield, CreditCard,
  Receipt, BarChart2, Settings, Timer, CheckCircle2,
  AlertTriangle, ExternalLink, Lock
} from "lucide-react";
import StatusChip from "@/components/dashboard/StatusChip";
import DashboardTile from "@/components/dashboard/DashboardTile";
import DocumentList from "@/components/dashboard/DocumentList";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import NinetyDayTracker from "@/components/dashboard/NinetyDayTracker";
import ProfileCard from "@/components/dashboard/ProfileCard";
import ContractCard from "@/components/dashboard/ContractCard";

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

function DashboardPreview({ profile, documents }) {
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
      <DashboardHeader profile={profile} overallStatus={overallStatus} isApproved={isApproved} />

      <div className="max-w-2xl mx-auto px-4 space-y-3 mt-6">

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
                {profile.source_tax === "yes" && <p className="text-xs text-gray-500 mt-1">Quellensteuer: Ja</p>}
                {profile.canton && <p className="text-xs text-gray-500">Kanton: {profile.canton}</p>}
              </div>
            )}
          </div>
        </DashboardTile>

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

        <DashboardTile
          icon={FileText}
          title="Dokumente & Verträge"
          subtitle={contracts.length > 0 ? `${contracts.length} Dokument${contracts.length > 1 ? "e" : ""} verfügbar` : "Noch keine Dokumente"}
          status={<StatusChip status={contracts.length > 0 ? "available" : "not_yet_available"} />}
        >
          <p className="text-xs text-gray-500 mb-3">Lade deine unterzeichneten Verträge und alle rechtlichen Dokumente jederzeit herunter.</p>
          <DocumentList documents={contracts} emptyText="Noch kein Vertrag vorhanden — wird nach Genehmigung bereitgestellt." />
        </DashboardTile>

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

        {isEmployee && (
          <DashboardTile
            icon={Receipt}
            title="Lohnabrechnungen"
            subtitle={payslips.length > 0 ? `${payslips.length} Abrechnung${payslips.length > 1 ? "en" : ""} verfügbar` : "Noch keine Abrechnungen"}
            status={<StatusChip status={payslips.length > 0 ? "available" : "not_yet_available"} />}
            defaultExpanded={payslips.length > 0}
          >
            <p className="text-xs text-gray-500 mb-3">Lohnabrechnungen werden per E-Mail zugestellt und sind hier zum Download verfügbar.</p>
            <DocumentList documents={payslips} emptyText="Noch keine Lohnabrechnungen — erscheinen nach dem ersten Abrechnungsmonat." />
          </DashboardTile>
        )}

        {isSelfEmployed && (
          <DashboardTile
            icon={BarChart2}
            title="Monatsabrechnungen & MWST"
            subtitle={statements.length + vatDocs.length > 0 ? `${statements.length + vatDocs.length} Dokument${statements.length + vatDocs.length > 1 ? "e" : ""} verfügbar` : "Noch keine Abrechnungen"}
            status={<StatusChip status={statements.length + vatDocs.length > 0 ? "available" : "not_yet_available"} />}
            defaultExpanded={statements.length + vatDocs.length > 0}
          >
            <p className="text-xs text-gray-500 mb-3">Lade Monatsabrechnungen und MWST-Dokumentation herunter, falls dein Unternehmen MWST-pflichtig ist.</p>
            {statements.length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-600 mb-1.5">Monatsabrechnungen</p>
                <DocumentList documents={statements} emptyText="" />
              </>
            )}
            {vatDocs.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 mb-1.5">MWST-Abrechnungen</p>
                <DocumentList documents={vatDocs} emptyText="" />
              </div>
            )}
            {statements.length === 0 && vatDocs.length === 0 && (
              <DocumentList documents={[]} emptyText="Noch keine Abrechnungen — erscheinen nach dem ersten Abrechnungsmonat." />
            )}
          </DashboardTile>
        )}

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

        <DashboardTile
          icon={Settings}
          title="Setup ändern oder beenden"
          subtitle="Wechsel oder Kündigung des Work Models"
          status={<StatusChip status="available" />}
          primaryAction={{ label: "Kündigung / Wechsel verwalten", onClick: () => {} }}
          secondaryAction={{ label: "Auf Light Profile downgraden", onClick: () => {} }}
        >
          <p className="text-xs text-gray-500 mb-3">Du kannst dein Setup jederzeit wechseln oder Secure Payment beenden.</p>
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

export default function DevDashboard() {
  const [activeScenario, setActiveScenario] = useState(DEV_SCENARIOS[0]);

  return (
    <div>
      {/* DEV TOOLBAR */}
      <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest mr-1">🛠 Dev Preview</span>
          <div className="flex gap-2 flex-wrap">
            {DEV_SCENARIOS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveScenario(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeScenario.key === s.key
                    ? "bg-[#FF3CAC] text-white shadow"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-gray-500 hidden sm:block">Nur für Entwicklung</span>
        </div>
      </div>

      {/* DASHBOARD PREVIEW */}
      <DashboardPreview
        key={activeScenario.key}
        profile={activeScenario.profile}
        documents={activeScenario.documents}
      />
    </div>
  );
}