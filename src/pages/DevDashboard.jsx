import React, { useState } from "react";
import { DEV_SCENARIOS } from "@/components/dev/devDummyData";

import { Settings, ExternalLink } from "lucide-react";
import StatusChip from "@/components/dashboard/StatusChip";
import DashboardTile from "@/components/dashboard/DashboardTile";
import ProfileCard from "@/components/dashboard/ProfileCard";
import { ContractTile, WorkEligibilityTile, ProstitutionPermitTile, NinetyDayTile } from "@/components/dashboard/ActionTiles";
import { PayrollTile, StatementsTile } from "@/components/dashboard/DocumentTiles";

function DashboardPreview({ profile, documents }) {
  const isEmployee = profile.work_model === "employee_unlimited" || profile.work_model === "employee_90days";
  const is90Day = profile.work_model === "employee_90days";
  const isSelfEmployed = profile.work_model === "self_employed";

  const payslips = documents.filter(d => d.type === "payslip");
  const statements = documents.filter(d => d.type === "monthly_statement");
  const vatDocs = documents.filter(d => d.type === "vat_statement");
  const contracts = documents.filter(d => d.type === "contract");

  return (
    <div className="min-h-screen bg-[#F0F0F0] pb-16">

      {/* ── Profile Header ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-pink-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-5">
          <ProfileCard profile={profile} />
        </div>
      </div>

      {/* ── Tiles ───────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 space-y-3 mt-5">

        {/* ── EINMALIGE AKTIONEN / STATUS ─────────────────────────── */}

        {/* Vertrag unterzeichnen */}
        <ContractTile profile={profile} contracts={contracts} />

        {/* Arbeitsberechtigung */}
        <WorkEligibilityTile profile={profile} />

        {/* Prostituiertenbewilligung */}
        <ProstitutionPermitTile profile={profile} />

        {/* 90-Tage Tracker — nur bei befristetem Modell */}
        {is90Day && <NinetyDayTile profile={profile} />}

        {/* ── LAUFENDE DOKUMENTE ──────────────────────────────────── */}

        {/* Lohnabrechnungen (Angestellte) */}
        {isEmployee && <PayrollTile profile={profile} payslips={payslips} />}

        {/* Monatsabrechnungen & MWST (Selbstständige) */}
        {isSelfEmployed && <StatementsTile statements={statements} vatDocs={vatDocs} />}

        {/* ── SETUP ÄNDERN ────────────────────────────────────────── */}
        <DashboardTile
          icon={Settings}
          title="Setup ändern oder beenden"
          subtitle="Wechsel oder Kündigung des Work Models"
          status={<StatusChip status="available" />}
          primaryAction={{ label: "Kündigung / Wechsel verwalten", onClick: () => {} }}
          secondaryAction={{ label: "Auf Light Profile downgraden", onClick: () => {} }}
        >
          <p className="text-xs text-gray-500 mb-3">
            Du kannst dein Setup jederzeit wechseln oder Secure Payment beenden.
          </p>
          <div className="space-y-2">
            {isEmployee && (
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2">
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                Beschäftigungsvertrag kündigen
              </div>
            )}
            {isSelfEmployed && (
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2">
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                Zu Anstellung wechseln
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2">
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              Secure Payment deaktivieren
            </div>
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

      <DashboardPreview
        key={activeScenario.key}
        profile={activeScenario.profile}
        documents={activeScenario.documents}
      />
    </div>
  );
}