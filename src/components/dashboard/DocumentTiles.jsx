/**
 * DocumentTiles — recurring document tiles:
 *  - Lohnabrechnungen (Employee)
 *  - Monatsabrechnungen & MWST (Self-employed, merged)
 *  - QUITT Lohnverarbeitung (Employee)
 */
import React from "react";
import { Receipt, BarChart2, CreditCard } from "lucide-react";
import StatusChip from "./StatusChip";
import DashboardTile from "./DashboardTile";
import DocumentList from "./DocumentList";

// ── QUITT + Lohnabrechnungen (Employee) ───────────────────────────────────────
export function PayrollTile({ profile, payslips }) {
  const isApproved = profile.status === "approved";

  return (
    <DashboardTile
      icon={Receipt}
      title="Lohnabrechnungen"
      subtitle={
        payslips.length > 0
          ? `${payslips.length} Abrechnung${payslips.length > 1 ? "en" : ""} verfügbar`
          : "Noch keine Abrechnungen"
      }
      status={<StatusChip status={payslips.length > 0 ? "available" : "not_yet_available"} />}
      defaultExpanded={payslips.length > 0}
      primaryAction={isApproved ? {
        label: "QUITT-Profil öffnen",
        onClick: () => window.open("https://quitt.ch", "_blank"),
      } : undefined}
    >
      <p className="text-xs text-gray-500 mb-3">
        QUITT verarbeitet deine Löhne. Abrechnungen werden hier monatlich bereitgestellt.
      </p>
      <DocumentList
        documents={payslips}
        emptyText="Noch keine Lohnabrechnungen — erscheinen nach dem ersten Abrechnungsmonat."
      />
    </DashboardTile>
  );
}

// ── Monatsabrechnungen & MWST (Self-employed) — zusammengeführt ───────────────
export function StatementsTile({ statements, vatDocs }) {
  const total = statements.length + vatDocs.length;

  return (
    <DashboardTile
      icon={BarChart2}
      title="Abrechnungen & MWST"
      subtitle={total > 0 ? `${total} Dokument${total > 1 ? "e" : ""} verfügbar` : "Noch keine Abrechnungen"}
      status={<StatusChip status={total > 0 ? "available" : "not_yet_available"} />}
      defaultExpanded={total > 0}
    >
      <p className="text-xs text-gray-500 mb-3">
        Monatsabrechnungen und MWST-Dokumentation für dein Unternehmen.
      </p>

      {statements.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Monatsabrechnungen</p>
          <DocumentList documents={statements} emptyText="" />
        </>
      )}

      {vatDocs.length > 0 && (
        <div className={statements.length > 0 ? "mt-4" : ""}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">MWST-Abrechnungen</p>
          <DocumentList documents={vatDocs} emptyText="" />
        </div>
      )}

      {total === 0 && (
        <DocumentList documents={[]} emptyText="Noch keine Abrechnungen — erscheinen nach dem ersten Abrechnungsmonat." />
      )}
    </DashboardTile>
  );
}