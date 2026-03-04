import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  Briefcase, Shield, FileText, FileCheck, Receipt,
  Users, Timer, Settings, Loader2, CheckCircle2, Lock,
  ChevronDown, ChevronUp, Download, ExternalLink
} from "lucide-react";

const MODEL_LABELS = {
  employee_unlimited: "Angestellt (unbefristet)",
  employee_90days: "Angestellt (max. 90 Tage)",
  self_employed: "Selbständig",
};

export default function WorkModelDashboard() {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const profileId = urlParams.get("profile_id");

    if (token) {
      base44.functions.invoke("verifyMagicLink", { token })
        .then((res) => {
          const data = res.data;
          if (data?.success && data?.profile) {
            setProfile(data.profile);
            setDocuments(data.documents || []);
          } else {
            setError(data?.error === "Token expired" ? "expired" : "invalid");
          }
        })
        .catch(() => setError("invalid"))
        .finally(() => setLoading(false));
    } else if (profileId) {
      // Dev/admin access
      Promise.all([
        base44.entities.OnboardingProfile.list("-created_date", 200),
        base44.entities.EscortDocument.filter({ profile_id: profileId }, "-created_date", 50),
      ]).then(([profiles, docs]) => {
        const p = (profiles || []).find(x => x.id === profileId);
        if (p) {
          setProfile(p);
          setDocuments(docs || []);
        } else {
          setError("invalid");
        }
      }).catch(() => setError("invalid"))
        .finally(() => setLoading(false));
    } else {
      setError("no_token");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Dashboard wird geladen…</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/bab87dc6b_GingrLogo4x.png" alt="gingr" className="h-8 object-contain mx-auto mb-6" />
          <Lock className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700 mb-2">
            {error === "expired" ? "Link abgelaufen" : "Kein Zugang"}
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            {error === "expired"
              ? "Dieser Link ist abgelaufen. Bitte fordere einen neuen Link an."
              : "Bitte verwende den Link aus deiner E-Mail oder SMS."}
          </p>
          <a href={createPageUrl("MagicLinkLogin")} className="inline-block bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-800 transition-colors">
            Neuen Link anfordern
          </a>
        </div>
      </div>
    );
  }

  const isEmployee = profile.work_model === "employee_unlimited" || profile.work_model === "employee_90days";
  const is90Day = profile.work_model === "employee_90days";
  const isSelfEmployed = profile.work_model === "self_employed";
  const isApproved = profile.status === "approved";
  const isSwiss = profile.citizenship_group === "CH";

  const payslips = documents.filter(d => d.type === "payslip");
  const statements = documents.filter(d => d.type === "monthly_statement" || d.type === "vat_statement");
  const contracts = documents.filter(d => d.type === "contract");

  const employment90DaysRemaining = (() => {
    if (!is90Day || !profile.submitted_at) return null;
    const start = new Date(profile.submitted_at);
    const end = new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000);
    const remaining = Math.max(0, Math.ceil((end - new Date()) / (24 * 60 * 60 * 1000)));
    return { start, end, remaining };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/bab87dc6b_GingrLogo4x.png" alt="gingr" className="h-8 object-contain" />
          <div className="text-right">
            <p className="text-xs text-gray-500">Mein Dashboard</p>
            <p className="text-sm font-semibold text-gray-800">{profile.first_name} {profile.last_name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">

        {/* Status banner */}
        {!isApproved ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <Timer className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Onboarding wird geprüft</p>
              <p className="text-xs text-amber-600 mt-0.5">Bearbeitungszeit: 1–2 Arbeitstage.</p>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Secure Booking aktiv ✨</p>
              <p className="text-xs text-green-600 mt-0.5">Dein Profil ist vollständig verifiziert.</p>
            </div>
          </div>
        )}

        {/* Tile: Work model */}
        <Tile icon={Briefcase} iconBg="bg-purple-100" iconColor="text-purple-600" title="Arbeitsmodell" subtitle={MODEL_LABELS[profile.work_model] || "–"}>
          <Row label="Modell" value={MODEL_LABELS[profile.work_model] || "–"} />
          <Row label="Status" value={profile.status || "–"} />
          {profile.business_name && <Row label="Unternehmen" value={profile.business_name} />}
          {profile.uid_number && <Row label="UID" value={profile.uid_number} />}
        </Tile>

        {/* Tile: Work eligibility */}
        <Tile icon={Shield} iconBg="bg-blue-100" iconColor="text-blue-600" title="Arbeitsberechtigung" subtitle={isSwiss ? "Schweizer Staatsbürger" : `Permit ${profile.permit_type || "–"}`}>
          <Row label="Staatsbürgerschaft" value={profile.citizenship_group || "–"} />
          {!isSwiss && <Row label="Permit-Typ" value={profile.permit_type || "–"} />}
          {!isSwiss && <Row label="Permit-Status" value={profile.permit_status || "–"} />}
          {!isSwiss && profile.permit_url && (
            <a href={profile.permit_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-purple-600 hover:underline mt-1">
              <ExternalLink className="w-3 h-3" /> Permit-Dokument öffnen
            </a>
          )}
        </Tile>

        {/* Tile: Documents / contracts */}
        <Tile icon={FileText} iconBg="bg-violet-100" iconColor="text-violet-600" title="Verträge & Dokumente" subtitle={`${contracts.length} Vertrag${contracts.length !== 1 ? "e" : ""} verfügbar`}>
          {contracts.length === 0
            ? <p className="text-xs text-gray-400">Noch keine Verträge vorhanden.</p>
            : contracts.map(doc => <DocRow key={doc.id} doc={doc} />)
          }
        </Tile>

        {/* Tile: AGB */}
        <Tile icon={FileCheck} iconBg="bg-teal-100" iconColor="text-teal-600" title="AGB & Akzeptanzlog" subtitle={profile.contract_signed_at ? `Akzeptiert am ${new Date(profile.contract_signed_at).toLocaleDateString("de-CH")}` : "Noch nicht akzeptiert"}>
          <Row label="Verträge akzeptiert" value={profile.contract_signed ? "Ja" : "Nein"} />
          {profile.contract_signed_at && <Row label="Datum" value={new Date(profile.contract_signed_at).toLocaleString("de-CH")} />}
          <Row label="Profil-ID" value={profile.id?.substring(0, 8) + "…"} />
        </Tile>

        {/* Tile: Payroll (employees) */}
        <Tile
          icon={Users}
          iconBg={isEmployee ? "bg-green-100" : "bg-gray-100"}
          iconColor={isEmployee ? "text-green-600" : "text-gray-400"}
          title="Lohnabrechnung (QUITT)"
          subtitle={isEmployee ? "QUITT verarbeitet deinen Lohn" : "Nicht verfügbar für Selbständige"}
        >
          <p className="text-xs text-gray-500">{isEmployee ? "QUITT verwaltet deine Gehaltsabrechnung und sendet monatliche Lohnabrechnungen." : "Als Selbständige/r nutze die monatliche Abrechnung unten."}</p>
        </Tile>

        {/* Tile: Payslips (employees) */}
        {isEmployee && (
          <Tile icon={Receipt} iconBg="bg-emerald-100" iconColor="text-emerald-600" title="Lohnausweise" subtitle={payslips.length > 0 ? `${payslips.length} verfügbar` : "Noch nicht verfügbar"}>
            {payslips.length === 0
              ? <p className="text-xs text-gray-400">Lohnausweise werden nach der Lohnverarbeitung hier sichtbar.</p>
              : payslips.map(doc => <DocRow key={doc.id} doc={doc} />)
            }
          </Tile>
        )}

        {/* Tile: Statements (self-employed) */}
        {isSelfEmployed && (
          <Tile icon={Receipt} iconBg="bg-amber-100" iconColor="text-amber-600" title="Monatliche Abrechnungen & MwSt." subtitle={statements.length > 0 ? `${statements.length} verfügbar` : "Noch nicht verfügbar"}>
            {statements.length === 0
              ? <p className="text-xs text-gray-400">Abrechnungen werden vom gingr-Team hochgeladen.</p>
              : statements.map(doc => <DocRow key={doc.id} doc={doc} />)
            }
          </Tile>
        )}

        {/* Tile: 90-day tracker */}
        {is90Day && employment90DaysRemaining && (
          <Tile icon={Timer} iconBg={employment90DaysRemaining.remaining <= 14 ? "bg-orange-100" : "bg-blue-100"} iconColor={employment90DaysRemaining.remaining <= 14 ? "text-orange-600" : "text-blue-600"} title="90-Tage-Tracker" subtitle={`Noch ${employment90DaysRemaining.remaining} Tage`}>
            <Row label="Startdatum" value={employment90DaysRemaining.start.toLocaleDateString("de-CH")} />
            <Row label="Enddatum" value={employment90DaysRemaining.end.toLocaleDateString("de-CH")} />
            <div className="mt-2 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full ${employment90DaysRemaining.remaining <= 14 ? "bg-orange-400" : "bg-blue-400"}`}
                style={{ width: `${((90 - employment90DaysRemaining.remaining) / 90) * 100}%` }}
              />
            </div>
          </Tile>
        )}

        {/* Tile: Settings */}
        <Tile icon={Settings} iconBg="bg-gray-100" iconColor="text-gray-500" title="Arbeitsmodell ändern" subtitle="Kündigung, Wechsel oder Downgrade">
          <p className="text-xs text-gray-500">Für Änderungen an deinem Setup bitte direkt das gingr-Team kontaktieren.</p>
        </Tile>

        <p className="text-center text-xs text-gray-400 pb-8 pt-2">
          gingr Legal Onboarding · Alle Daten sind verschlüsselt und sicher gespeichert.
        </p>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, iconBg, iconColor, title, subtitle, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-50 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-800">{value}</span>
    </div>
  );
}

function DocRow({ doc }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-xs font-medium text-gray-800">{doc.label}</p>
        {doc.period && <p className="text-xs text-gray-400">{doc.period}</p>}
      </div>
      {doc.file_url && (
        <a href={doc.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-purple-600 hover:underline">
          <Download className="w-3.5 h-3.5" /> Download
        </a>
      )}
    </div>
  );
}