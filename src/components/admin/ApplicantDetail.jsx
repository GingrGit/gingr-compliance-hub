import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import StatusBadge from "@/components/admin/StatusBadge.jsx";
import DocumentRow from "@/components/admin/DocumentRow.jsx";
import InfoGrid from "@/components/admin/InfoGrid.jsx";
import { CheckCircle2, XCircle, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

const MODEL_LABELS = {
  employee_unlimited: "Angestellt (unbefristet)",
  employee_90days: "Angestellt (90 Tage)",
  self_employed: "Selbständig",
};

export default function ApplicantDetail({ profile, onRefresh, onUpdate }) {
  const [notes, setNotes] = useState(profile.notes || "");
  const [saving, setSaving] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const updateStatus = async (status) => {
    setSaving(true);
    const updated = await base44.entities.OnboardingProfile.update(profile.id, { status });
    onUpdate(updated);
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
          <p className="text-sm text-gray-400">{profile.escort_email}</p>
          {profile.submitted_at && (
            <p className="text-xs text-gray-400 mt-1">
              Eingereicht: {new Date(profile.submitted_at).toLocaleString("de-CH")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={profile.status} />
        </div>
      </div>

      {/* Action Buttons */}
      {profile.status === "submitted" && (
        <div className="flex gap-3">
          <button
            onClick={() => updateStatus("approved")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" /> Genehmigen
          </button>
          <button
            onClick={() => updateStatus("needs_action")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <XCircle className="w-4 h-4" /> Aktion anfordern
          </button>
        </div>
      )}
      {(profile.status === "approved" || profile.status === "needs_action") && (
        <div className="flex gap-2">
          <button
            onClick={() => updateStatus("submitted")}
            disabled={saving}
            className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            Zurück zu "Eingereicht"
          </button>
        </div>
      )}

      {/* Personal Info */}
      <InfoGrid title="Persönliche Daten" items={[
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
      <InfoGrid title="Arbeitsmodell" items={[
        { label: "Modell", value: MODEL_LABELS[profile.work_model] || profile.work_model },
        { label: "Kanton", value: profile.canton },
        { label: "Gemeinde", value: profile.municipality },
        { label: "Quellensteuer", value: profile.source_tax },
        { label: "Vertrag unterzeichnet", value: profile.contract_signed ? "Ja" : "Nein" },
        { label: "Vertrag unterzeichnet am", value: profile.contract_signed_at ? new Date(profile.contract_signed_at).toLocaleString("de-CH") : null },
      ]} />

      {/* Self-Employed Info (if applicable) */}
      {profile.work_model === "self_employed" && (
        <InfoGrid title="Selbständigkeit" items={[
          { label: "Firmenname", value: profile.business_name },
          { label: "UID-Nummer", value: profile.uid_number },
        ]} />
      )}

      {/* Documents */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Dokumente</h3>
        <div className="space-y-3">
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
            status={profile.business_proof_url ? "uploaded" : null}
          />
          <DocumentRow
            label="Ausweisdokument (ID/Pass)"
            url={profile.id_document_url}
            status={profile.id_document_url ? "uploaded" : null}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <button
          onClick={() => setNotesOpen(!notesOpen)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Interne Notizen</h3>
          </div>
          {notesOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {notesOpen && (
          <div className="mt-3 space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Notizen für das Team…"
              className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            />
            <button
              onClick={saveNotes}
              disabled={saving}
              className="text-xs bg-purple-700 hover:bg-purple-800 text-white px-4 py-1.5 rounded-lg"
            >
              Speichern
            </button>
          </div>
        )}
      </div>
    </div>
  );
}