import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import DocumentRow from "@/components/admin/DocumentRow.jsx";
import InfoGrid from "@/components/admin/InfoGrid.jsx";
import { CheckCircle2, XCircle, MessageSquare, ChevronDown, ChevronUp, User, Briefcase, FileText, Clock, Upload, Send, Loader2, Plus, Trash2 } from "lucide-react";

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

export default function ApplicantDetail({ profile, onRefresh, onUpdate }) {
  const [notes, setNotes] = useState(profile.notes || "");
  const [saving, setSaving] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docsOpen, setDocsOpen] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ label: "", type: "payslip", period: "", file: null });
  const [sendingLink, setSendingLink] = useState(false);

  useEffect(() => {
    base44.entities.EscortDocument.filter({ profile_id: profile.id }, "-created_date", 50).then(setDocuments).catch(() => {});
  }, [profile.id]);

  const updateStatus = async (status) => {
    setSaving(true);
    const updated = await base44.entities.OnboardingProfile.update(profile.id, { status });
    onUpdate(updated);
    // When approving, send dashboard link via SMS
    if (status === "approved" && profile.phone) {
      try {
        await base44.functions.invoke("sendDashboardLink", {
          profile_id: profile.id,
          phone: profile.phone,
          app_url: window.location.origin,
        });
      } catch (_) {}
    }
    setSaving(false);
  };

  const updateDocStatus = async (field, value) => {
    setSaving(true);
    const updated = await base44.entities.OnboardingProfile.update(profile.id, { [field]: value });
    onUpdate(updated);
    setSaving(false);
  };

  const saveNotes = async () => {
    setSaving(true);
    const updated = await base44.entities.OnboardingProfile.update(profile.id, { notes });
    onUpdate(updated);
    setSaving(false);
  };

  const name = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.escort_email || "Unbekannt";

  const statusCfg = STATUS_CONFIG[profile.status] || STATUS_CONFIG.draft;
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5 pb-16">

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-700" />
        <div className="p-5 flex items-start gap-4">
          {/* Avatar */}
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
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {MODEL_LABELS[profile.work_model] || profile.work_model}
                </span>
              )}
              {profile.submitted_at && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Eingereicht: {new Date(profile.submitted_at).toLocaleString("de-CH")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 pb-5">
          {profile.status === "submitted" && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => updateStatus("approved")}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" /> Genehmigen
              </button>
              <button
                onClick={() => updateStatus("needs_action")}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Aktion anfordern
              </button>
            </div>
          )}
          {profile.status === "approved" && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Applicant wurde genehmigt
              </div>
              <button
                onClick={() => updateStatus("submitted")}
                disabled={saving}
                className="text-xs text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zurücksetzen
              </button>
            </div>
          )}
          {profile.status === "needs_action" && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                <XCircle className="w-4 h-4" /> Aktion vom Applicant erforderlich
              </div>
              <button
                onClick={() => updateStatus("submitted")}
                disabled={saving}
                className="text-xs text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zurücksetzen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Personal Info */}
      <InfoGrid title="Persönliche Daten" icon={User} items={[
        { label: "Vorname", value: profile.first_name },
        { label: "Nachname", value: profile.last_name },
        { label: "Geburtsdatum", value: profile.date_of_birth },
        { label: "Telefon", value: profile.phone },
        { label: "Adresse", value: profile.address },
        { label: "PLZ / Ort", value: profile.postal_code && profile.city ? `${profile.postal_code} ${profile.city}` : profile.city },
        { label: "Staatsangehörigkeit", value: profile.nationality },
        { label: "Bürgergruppe", value: profile.citizenship_group },
        { label: "Zivilstand", value: profile.marital_status },
      ]} />

      {/* Work Model */}
      <InfoGrid title="Arbeitsmodell & Steuern" icon={Briefcase} items={[
        { label: "Modell", value: MODEL_LABELS[profile.work_model] || profile.work_model },
        { label: "Kanton", value: profile.canton },
        { label: "Gemeinde", value: profile.municipality },
        { label: "Quellensteuer", value: profile.source_tax },
        { label: "Vertrag unterzeichnet", value: profile.contract_signed ? "✓ Ja" : "✗ Nein" },
        { label: "Vertrag unterzeichnet am", value: profile.contract_signed_at ? new Date(profile.contract_signed_at).toLocaleString("de-CH") : null },
      ]} />

      {/* Self-Employed Info */}
      {profile.work_model === "self_employed" && (
        <InfoGrid title="Selbständigkeit" icon={Briefcase} items={[
          { label: "Firmenname", value: profile.business_name },
          { label: "UID-Nummer", value: profile.uid_number },
        ]} />
      )}

      {/* Documents */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Dokumente</h3>
        </div>
        <div className="space-y-1">
          <DocumentRow
            label="Aufenthaltsbewilligung"
            url={profile.permit_url}
            status={profile.permit_status}
            onApprove={() => updateDocStatus("permit_status", "approved")}
            onReject={() => updateDocStatus("permit_status", "missing")}
          />
          <DocumentRow
            label="Nachweis Selbständigkeit"
            url={profile.business_proof_url}
            status={profile.business_proof_url ? "uploaded_review_pending" : null}
          />
          <DocumentRow
            label="Ausweisdokument (ID/Pass)"
            url={profile.id_document_url}
            status={profile.id_document_url ? "uploaded_review_pending" : null}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <button
          onClick={() => setNotesOpen(!notesOpen)}
          className="flex items-center justify-between w-full group"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Interne Notizen</h3>
            {notes && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">✓</span>}
          </div>
          {notesOpen
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />
          }
        </button>
        {notesOpen && (
          <div className="mt-3 space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Notizen für das Team…"
              className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none bg-gray-50"
            />
            <button
              onClick={saveNotes}
              disabled={saving}
              className="text-xs bg-purple-700 hover:bg-purple-800 text-white px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "Speichern…" : "Speichern"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}