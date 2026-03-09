import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import DocumentRow from "@/components/admin/DocumentRow.jsx";
import {
  CheckCircle2, XCircle, MessageSquare, ChevronDown, ChevronUp,
  User, Briefcase, FileText, Clock, Upload, Send, Loader2, Plus,
  Trash2, ExternalLink, Pencil, X, Check, Globe, Baby
} from "lucide-react";
import { createPageUrl } from "@/utils";

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

function Field({ label, value, editMode, fieldKey, editData, onChange, type = "text", options }) {
  if (!editMode) {
    return (
      <div className="border-b border-gray-50 pb-2 last:border-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 font-medium">{value || <span className="text-gray-300 italic">—</span>}</p>
      </div>
    );
  }
  if (options) {
    return (
      <div className="border-b border-gray-50 pb-2 last:border-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <select
          value={editData[fieldKey] ?? ""}
          onChange={e => onChange(fieldKey, e.target.value)}
          className="w-full text-sm border border-purple-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
        >
          <option value="">— auswählen —</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div className="border-b border-gray-50 pb-2 last:border-0">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <input
        type={type}
        value={editData[fieldKey] ?? ""}
        onChange={e => onChange(fieldKey, e.target.value)}
        className="w-full text-sm border border-purple-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
      />
    </div>
  );
}

function SectionCard({ title, icon: Icon, editMode, onStartEdit, onSaveEdit, onCancelEdit, saving, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
        {onStartEdit && !editMode && (
          <button onClick={onStartEdit} className="flex items-center gap-1 text-xs text-purple-600 hover:underline">
            <Pencil className="w-3 h-3" /> Bearbeiten
          </button>
        )}
        {editMode && (
          <div className="flex gap-2">
            <button onClick={onCancelEdit} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" /> Abbrechen
            </button>
            <button onClick={onSaveEdit} disabled={saving} className="flex items-center gap-1 text-xs text-purple-700 font-semibold hover:underline disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Speichern
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {children}
      </div>
    </div>
  );
}

export default function ApplicantDetail({ profile, onRefresh, onUpdate }) {
  const [notes, setNotes] = useState(profile.notes || "");
  const [saving, setSaving] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docsOpen, setDocsOpen] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ label: "", type: "payslip", period: "", file: null });
  const [sendingLink, setSendingLink] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);
  const [smsText, setSmsText] = useState("");
  const [sendingSms, setSendingSms] = useState(false);

  // Edit states per section
  const [editPersonal, setEditPersonal] = useState(false);
  const [editWork, setEditWork] = useState(false);
  const [editData, setEditData] = useState({});
  const [sectionSaving, setSectionSaving] = useState(false);

  useEffect(() => {
    base44.entities.EscortDocument.filter({ profile_id: profile.id }, "-created_date", 50).then(setDocuments).catch(() => {});
    setNotes(profile.notes || "");
  }, [profile.id]);

  const setField = (key, val) => setEditData(prev => ({ ...prev, [key]: val }));

  function startEditPersonal() {
    setEditData({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      date_of_birth: profile.date_of_birth || "",
      phone: profile.phone || "",
      escort_email: profile.escort_email || "",
      address: profile.address || "",
      postal_code: profile.postal_code || "",
      city: profile.city || "",
      nationality: profile.nationality || "",
      citizenship_group: profile.citizenship_group || "",
      marital_status: profile.marital_status || "",
    });
    setEditPersonal(true);
  }

  function startEditWork() {
    setEditData({
      work_model: profile.work_model || "",
      canton: profile.canton || "",
      municipality: profile.municipality || "",
      source_tax: profile.source_tax || "",
      employment_start_date: profile.employment_start_date || "",
      business_name: profile.business_name || "",
      uid_number: profile.uid_number || "",
      permit_type: profile.permit_type || "",
    });
    setEditWork(true);
  }

  async function saveSection() {
    setSectionSaving(true);
    const updated = await base44.entities.OnboardingProfile.update(profile.id, editData);
    onUpdate(updated);
    setSectionSaving(false);
    setEditPersonal(false);
    setEditWork(false);
    setEditData({});
  }

  function cancelEdit() {
    setEditPersonal(false);
    setEditWork(false);
    setEditData({});
  }

  const updateStatus = async (status) => {
    setSaving(true);
    const updated = await base44.entities.OnboardingProfile.update(profile.id, { status });
    onUpdate(updated);
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

  const uploadDocument = async () => {
    if (!newDoc.file || !newDoc.label) return;
    setUploadingDoc(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: newDoc.file });
    await base44.entities.EscortDocument.create({
      profile_id: profile.id,
      type: newDoc.type,
      label: newDoc.label,
      period: newDoc.period,
      file_url,
      uploaded_by_admin: true,
    });
    const updated = await base44.entities.EscortDocument.filter({ profile_id: profile.id }, "-created_date", 50);
    setDocuments(updated);
    setNewDoc({ label: "", type: "payslip", period: "", file: null });
    setUploadingDoc(false);
  };

  const deleteDocument = async (docId) => {
    await base44.entities.EscortDocument.delete(docId);
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

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

  const sendCustomSms = async () => {
    if (!profile.phone || !smsText.trim()) return;
    setSendingSms(true);
    await base44.functions.invoke("sendMagicLink", {
      _custom_sms: true,
      phone: profile.phone,
      message: smsText,
    });
    setSendingSms(false);
    setSmsText("");
    setSmsOpen(false);
    alert("SMS wurde gesendet!");
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

        {/* Status Actions */}
        <div className="px-5 pb-5 flex flex-wrap gap-2">
          {profile.status === "submitted" && (
            <>
              <button onClick={() => updateStatus("approved")} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50">
                <CheckCircle2 className="w-4 h-4" /> Genehmigen
              </button>
              <button onClick={() => updateStatus("needs_action")} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50">
                <XCircle className="w-4 h-4" /> Aktion anfordern
              </button>
            </>
          )}
          {profile.status === "approved" && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium"><CheckCircle2 className="w-4 h-4" /> Genehmigt</div>
              <button onClick={() => updateStatus("submitted")} disabled={saving} className="text-xs text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Zurücksetzen</button>
            </div>
          )}
          {profile.status === "needs_action" && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-amber-600 text-sm font-medium"><XCircle className="w-4 h-4" /> Aktion erforderlich</div>
              <button onClick={() => updateStatus("submitted")} disabled={saving} className="text-xs text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Zurücksetzen</button>
            </div>
          )}
          {profile.status === "draft" && (
            <button onClick={() => updateStatus("submitted")} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
              Als eingereicht markieren
            </button>
          )}
        </div>
      </div>

      {/* Personal Data — editable */}
      <SectionCard
        title="Persönliche Daten"
        icon={User}
        editMode={editPersonal}
        onStartEdit={startEditPersonal}
        onSaveEdit={saveSection}
        onCancelEdit={cancelEdit}
        saving={sectionSaving}
      >
        <Field label="Vorname" value={profile.first_name} fieldKey="first_name" editMode={editPersonal} editData={editData} onChange={setField} />
        <Field label="Nachname" value={profile.last_name} fieldKey="last_name" editMode={editPersonal} editData={editData} onChange={setField} />
        <Field label="Geburtsdatum" value={profile.date_of_birth} fieldKey="date_of_birth" editMode={editPersonal} editData={editData} onChange={setField} type="date" />
        <Field label="Telefon" value={profile.phone} fieldKey="phone" editMode={editPersonal} editData={editData} onChange={setField} type="tel" />
        <Field label="E-Mail" value={profile.escort_email} fieldKey="escort_email" editMode={editPersonal} editData={editData} onChange={setField} type="email" />
        <Field label="Staatsangehörigkeit" value={profile.nationality} fieldKey="nationality" editMode={editPersonal} editData={editData} onChange={setField} />
        <Field label="Bürgergruppe" value={profile.citizenship_group} fieldKey="citizenship_group" editMode={editPersonal} editData={editData} onChange={setField}
          options={[{ value: "CH", label: "Schweiz" }, { value: "EU_EFTA", label: "EU/EFTA" }, { value: "NON_EU", label: "Nicht-EU" }]}
        />
        <Field label="Zivilstand" value={profile.marital_status} fieldKey="marital_status" editMode={editPersonal} editData={editData} onChange={setField}
          options={[{ value: "single", label: "Ledig" }, { value: "married", label: "Verheiratet" }, { value: "divorced", label: "Geschieden" }, { value: "widowed", label: "Verwitwet" }]}
        />
        <div className="sm:col-span-2">
          <Field label="Adresse" value={profile.address} fieldKey="address" editMode={editPersonal} editData={editData} onChange={setField} />
        </div>
        <Field label="PLZ" value={profile.postal_code} fieldKey="postal_code" editMode={editPersonal} editData={editData} onChange={setField} />
        <Field label="Ort" value={profile.city} fieldKey="city" editMode={editPersonal} editData={editData} onChange={setField} />
      </SectionCard>

      {/* Work Model — editable */}
      <SectionCard
        title="Arbeitsmodell & Steuern"
        icon={Briefcase}
        editMode={editWork}
        onStartEdit={startEditWork}
        onSaveEdit={saveSection}
        onCancelEdit={cancelEdit}
        saving={sectionSaving}
      >
        <Field label="Arbeitsmodell" value={MODEL_LABELS[profile.work_model] || profile.work_model} fieldKey="work_model" editMode={editWork} editData={editData} onChange={setField}
          options={[{ value: "employee_unlimited", label: "Angestellt (unbefristet)" }, { value: "employee_90days", label: "Angestellt (90 Tage)" }, { value: "self_employed", label: "Selbständig" }]}
        />
        <Field label="Kanton" value={profile.canton} fieldKey="canton" editMode={editWork} editData={editData} onChange={setField} />
        <Field label="Gemeinde" value={profile.municipality} fieldKey="municipality" editMode={editWork} editData={editData} onChange={setField} />
        <Field label="Quellensteuer" value={profile.source_tax} fieldKey="source_tax" editMode={editWork} editData={editData} onChange={setField}
          options={[{ value: "yes", label: "Ja" }, { value: "no", label: "Nein" }, { value: "unsure", label: "Unsicher" }]}
        />
        <Field label="Beschäftigungsbeginn" value={profile.employment_start_date} fieldKey="employment_start_date" editMode={editWork} editData={editData} onChange={setField} type="date" />
        <Field label="Aufenthaltsbewilligung" value={profile.permit_type} fieldKey="permit_type" editMode={editWork} editData={editData} onChange={setField}
          options={[{ value: "none", label: "Keine" }, { value: "B", label: "Ausweis B" }, { value: "C", label: "Ausweis C" }, { value: "L", label: "Ausweis L" }, { value: "other", label: "Andere" }]}
        />
        <Field label="Vertrag unterzeichnet" value={profile.contract_signed ? "✓ Ja" : "✗ Nein"} fieldKey="contract_signed" editMode={false} editData={editData} onChange={setField} />
        {profile.contract_signed_at && (
          <Field label="Unterzeichnet am" value={new Date(profile.contract_signed_at).toLocaleString("de-CH")} fieldKey="contract_signed_at" editMode={false} editData={editData} onChange={setField} />
        )}
        {(profile.work_model === "self_employed" || editWork) && (
          <>
            <Field label="Firmenname" value={profile.business_name} fieldKey="business_name" editMode={editWork} editData={editData} onChange={setField} />
            <Field label="UID-Nummer" value={profile.uid_number} fieldKey="uid_number" editMode={editWork} editData={editData} onChange={setField} />
          </>
        )}
      </SectionCard>

      {/* Documents — review */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Eingereichte Dokumente</h3>
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
            label="Ausweisdokument (ID/Pass)"
            url={profile.id_document_url}
            status={profile.id_document_url ? "uploaded_review_pending" : null}
          />
          <DocumentRow
            label="Nachweis Selbständigkeit"
            url={profile.business_proof_url}
            status={profile.business_proof_url ? "uploaded_review_pending" : null}
          />
          {profile.prostitution_permit_url && (
            <DocumentRow
              label="Prostituiertenbewilligung"
              url={profile.prostitution_permit_url}
              status={profile.prostitution_permit_status === "approved" ? "approved" : "uploaded_review_pending"}
              onApprove={() => updateDocStatus("prostitution_permit_status", "approved")}
            />
          )}
        </div>
      </div>

      {/* Document Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <button onClick={() => setDocsOpen(!docsOpen)} className="flex items-center justify-between w-full group">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Dokumente hochladen</h3>
            {documents.length > 0 && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{documents.length}</span>}
          </div>
          {docsOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {docsOpen && (
          <div className="mt-4 space-y-4">
            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.label}</p>
                      <p className="text-xs text-gray-400">{doc.type}{doc.period ? ` · ${doc.period}` : ""}</p>
                    </div>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline">Öffnen</a>
                    <button onClick={() => deleteDocument(doc.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="border border-dashed border-purple-200 rounded-xl p-4 space-y-3 bg-purple-50/30">
              <p className="text-xs font-semibold text-gray-600">Neues Dokument hochladen</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Bezeichnung (z.B. Lohnabrechnung März)"
                  value={newDoc.label}
                  onChange={e => setNewDoc(p => ({ ...p, label: e.target.value }))}
                  className="col-span-2 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <select
                  value={newDoc.type}
                  onChange={e => setNewDoc(p => ({ ...p, type: e.target.value }))}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                >
                  <option value="payslip">Lohnausweis</option>
                  <option value="monthly_statement">Monatsabrechnung</option>
                  <option value="vat_statement">MwSt.-Abrechnung</option>
                  <option value="contract">Vertrag</option>
                  <option value="other">Sonstiges</option>
                </select>
                <input
                  type="text"
                  placeholder="Periode (z.B. 2025-03)"
                  value={newDoc.period}
                  onChange={e => setNewDoc(p => ({ ...p, period: e.target.value }))}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setNewDoc(p => ({ ...p, file: e.target.files[0] }))} className="text-xs text-gray-500 w-full" />
              <button
                onClick={uploadDocument}
                disabled={!newDoc.file || !newDoc.label || uploadingDoc}
                className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white text-xs font-medium rounded-lg px-4 py-2 transition-colors"
              >
                {uploadingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Hochladen & zuweisen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dashboard & Communication */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Dashboard & Kommunikation</p>
        <div className="flex flex-wrap gap-2">
          <a
            href={`${createPageUrl("WorkModelDashboard")}?profile_id=${profile.id}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-medium rounded-xl px-4 py-2 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Dashboard öffnen
          </a>
          {profile.phone && (
            <button
              onClick={sendDashboardLink}
              disabled={sendingLink}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-xs font-medium rounded-xl px-4 py-2 transition-colors"
            >
              {sendingLink ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Dashboard-Link senden
            </button>
          )}
          {profile.phone && (
            <button
              onClick={() => setSmsOpen(!smsOpen)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl px-4 py-2 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" /> SMS senden
            </button>
          )}
        </div>

        {smsOpen && (
          <div className="mt-2 space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50">
            <p className="text-xs text-gray-500">An: <span className="font-medium text-gray-700">{profile.phone}</span></p>
            <textarea
              value={smsText}
              onChange={e => setSmsText(e.target.value)}
              rows={3}
              placeholder="Nachricht eingeben…"
              className="w-full text-sm border border-gray-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none bg-white"
            />
            <button
              onClick={sendCustomSms}
              disabled={!smsText.trim() || sendingSms}
              className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white text-xs font-medium rounded-lg px-4 py-2 transition-colors"
            >
              {sendingSms ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Senden
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <button onClick={() => setNotesOpen(!notesOpen)} className="flex items-center justify-between w-full group">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Interne Notizen</h3>
            {notes && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">✓</span>}
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