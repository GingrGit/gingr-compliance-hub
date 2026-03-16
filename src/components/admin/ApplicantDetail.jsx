import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import DocumentRow from "@/components/admin/DocumentRow.jsx";
import {
  ChevronDown, ChevronUp,
  User, Briefcase, FileText, Clock, Send, Loader2, ExternalLink, MessageSquare
} from "lucide-react";

const MODEL_LABELS = {
  employee_unlimited: "Angestellt (unbefristet)",
  employee_90days: "Angestellt (90 Tage)",
  self_employed: "Selbständig",
};

const STATUS_CONFIG = {
  draft:        { label: "Entwurf",       bg: "bg-gray-100",   text: "text-gray-600",   border: "border-gray-200" },
  submitted:    { label: "Eingereicht",   bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200" },
  needs_action: { label: "Aktion nötig", bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200" },
  approved:     { label: "Genehmigt",     bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200" },
};

function Field({ label, value }) {
  return (
    <div className="border-b border-gray-50 pb-2 last:border-0">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value || <span className="text-gray-300 italic">—</span>}</p>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {children}
      </div>
    </div>
  );
}

export default function ApplicantDetail({ profile }) {
  const [documents, setDocuments] = useState([]);
  const [docsOpen, setDocsOpen] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);

  useEffect(() => {
    base44.entities.EscortDocument.filter({ profile_id: profile.id }, "-created_date", 50)
      .then(setDocuments)
      .catch(() => {});
  }, [profile.id]);

  const sendDashboardLink = async () => {
    if (!profile.phone) return;
    setSendingLink(true);
    await base44.functions.invoke("sendDashboardLink", {
      profile_id: profile.id,
      phone: profile.phone,
      app_url: window.location.origin,
    });
    setSendingLink(false);
    alert("Dashboard-Link wurde per SMS gesendet!");
  };

  const name = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.escort_email || "Unbekannt";
  const statusCfg = STATUS_CONFIG[profile.status] || STATUS_CONFIG.draft;
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5 pb-16">

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-700" />
        <div className="p-5 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-purple-700 font-bold text-lg">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                <p className="text-sm text-gray-400">{profile.escort_email}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                {statusCfg.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
              {profile.work_model && (
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{MODEL_LABELS[profile.work_model] || profile.work_model}</span>
              )}
              {profile.submitted_at && (
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Eingereicht: {new Date(profile.submitted_at).toLocaleString("de-CH")}</span>
              )}
            </div>
          </div>
        </div>

        {/* Info banner — no editing possible */}
        <div className="px-5 pb-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-xs text-blue-700 flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            Statusänderungen und Datenbearbeitung erfolgen im gingr Admin-Panel.
          </div>
        </div>
      </div>

      {/* Personal Data — read-only */}
      <SectionCard title="Persönliche Daten" icon={User}>
        <Field label="Vorname" value={profile.first_name} />
        <Field label="Nachname" value={profile.last_name} />
        <Field label="Geburtsdatum" value={profile.date_of_birth} />
        <Field label="Telefon" value={profile.phone} />
        <Field label="E-Mail" value={profile.escort_email} />
        <Field label="Staatsangehörigkeit" value={profile.nationality} />
        <Field label="Bürgergruppe" value={profile.citizenship_group} />
        <Field label="Zivilstand" value={profile.marital_status} />
        <div className="sm:col-span-2">
          <Field label="Adresse" value={[profile.address, profile.postal_code, profile.city].filter(Boolean).join(", ")} />
        </div>
      </SectionCard>

      {/* Work Model — read-only */}
      <SectionCard title="Arbeitsmodell & Steuern" icon={Briefcase}>
        <Field label="Arbeitsmodell" value={MODEL_LABELS[profile.work_model] || profile.work_model} />
        <Field label="Kanton" value={profile.canton} />
        <Field label="Gemeinde" value={profile.municipality} />
        <Field label="Quellensteuer" value={profile.source_tax} />
        <Field label="Beschäftigungsbeginn" value={profile.employment_start_date} />
        <Field label="Aufenthaltsbewilligung" value={profile.permit_type} />
        <Field label="Vertrag unterzeichnet" value={profile.contract_signed ? "✓ Ja" : "✗ Nein"} />
        {profile.contract_signed_at && (
          <Field label="Unterzeichnet am" value={new Date(profile.contract_signed_at).toLocaleString("de-CH")} />
        )}
        {profile.work_model === "self_employed" && (
          <>
            <Field label="Firmenname" value={profile.business_name} />
            <Field label="UID-Nummer" value={profile.uid_number} />
          </>
        )}
      </SectionCard>

      {/* Documents — read-only */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Eingereichte Dokumente</h3>
        </div>
        <div className="space-y-1">
          <DocumentRow label="Aufenthaltsbewilligung" url={profile.permit_url} status={profile.permit_status} />
          <DocumentRow label="Ausweisdokument (ID/Pass)" url={profile.id_document_url} status={profile.id_document_url ? "uploaded_review_pending" : null} />
          <DocumentRow label="Nachweis Selbständigkeit" url={profile.business_proof_url} status={profile.business_proof_url ? "uploaded_review_pending" : null} />
          {profile.prostitution_permit_url && (
            <DocumentRow
              label="Prostituiertenbewilligung"
              url={profile.prostitution_permit_url}
              status={profile.prostitution_permit_status === "approved" ? "approved" : "uploaded_review_pending"}
            />
          )}
        </div>
      </div>

      {/* Uploaded documents list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <button onClick={() => setDocsOpen(!docsOpen)} className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Hochgeladene Dokumente</h3>
            {documents.length > 0 && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{documents.length}</span>}
          </div>
          {docsOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {docsOpen && (
          <div className="mt-4 space-y-2">
            {documents.length === 0 && <p className="text-xs text-gray-400">Keine Dokumente vorhanden.</p>}
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.label}</p>
                  <p className="text-xs text-gray-400">{doc.type}{doc.period ? ` · ${doc.period}` : ""}</p>
                </div>
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline">Öffnen</a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Communication — only send link */}
      {profile.phone && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">Kommunikation</p>
          </div>
          <button
            onClick={sendDashboardLink}
            disabled={sendingLink}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-xs font-medium rounded-xl px-4 py-2 transition-colors"
          >
            {sendingLink ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Dashboard-Link per SMS senden
          </button>
        </div>
      )}

    </div>
  );
}