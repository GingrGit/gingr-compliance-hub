import React, { useState } from "react";
import { MapPin, Phone, Calendar, Flag, Building2, Hash, Mail, ExternalLink, Pencil, Check, X, Loader2 } from "lucide-react";
import StatusChip from "./StatusChip";
import { base44 } from "@/api/base44Client";

const WORK_MODEL_LABELS = {
  employee_unlimited: "Anstellung (unbefristet)",
  employee_90days: "Anstellung (90 Tage)",
  self_employed: "Selbstständig",
};

const WORK_MODEL_COLORS = {
  employee_unlimited: "bg-blue-100 text-blue-700",
  employee_90days: "bg-orange-100 text-orange-700",
  self_employed: "bg-purple-100 text-purple-700",
};

function getOverallStatus(profile) {
  if (profile.status === "approved") return "active";
  if (profile.status === "submitted") return "review_pending";
  if (profile.status === "needs_action") return "action_required";
  return "pending";
}

function EditableRow({ icon: Icon, label, value, fieldKey, editValues, setEditValues, editing }) {
  const val = editing ? editValues[fieldKey] ?? value ?? "" : value;
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 min-h-[28px]">
      <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      {editing ? (
        <input
          type="text"
          value={val}
          placeholder={label}
          onChange={e => setEditValues(prev => ({ ...prev, [fieldKey]: e.target.value }))}
          className="flex-1 text-sm border-b border-pink-200 focus:border-[#FF3CAC] outline-none bg-transparent py-0.5"
        />
      ) : (
        <span className={val ? "text-gray-700" : "text-gray-300 italic"}>{val || `${label} nicht angegeben`}</span>
      )}
    </div>
  );
}

export default function ProfileCard({ profile, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editValues, setEditValues] = useState({});

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  const fullAddress = [profile.address, profile.postal_code, profile.city].filter(Boolean).join(", ");
  const overallStatus = getOverallStatus(profile);
  const workModelLabel = WORK_MODEL_LABELS[profile.work_model];
  const workModelColor = WORK_MODEL_COLORS[profile.work_model] || "bg-gray-100 text-gray-600";

  function startEdit() {
    setEditValues({
      phone: profile.phone || "",
      escort_email: profile.escort_email || "",
      address: profile.address || "",
      postal_code: profile.postal_code || "",
      city: profile.city || "",
      date_of_birth: profile.date_of_birth || "",
    });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setEditValues({});
  }

  async function saveEdit() {
    setSaving(true);
    if (profile.id && !profile.id.startsWith("dev-")) {
      await base44.entities.OnboardingProfile.update(profile.id, editValues);
      if (onUpdate) onUpdate();
    }
    setSaving(false);
    setEditing(false);
    setEditValues({});
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fff0fb] via-white to-[#fce7fb] border border-pink-100 shadow-sm p-5">
      {/* Decorative blobs */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-[#FF3CAC]/10 to-purple-200/20 pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-pink-100/30 pointer-events-none" />

      {/* Avatar + Name + Status */}
      <div className="flex items-start gap-4 relative">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md flex-shrink-0 bg-gradient-to-br from-[#FF3CAC] to-purple-400">
          <img
            src="https://media.gingr.com/gingrs/1701_276_image.webp"
            alt={profile.first_name}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{fullName || "–"}</h2>
              {workModelLabel && (
                <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 ${workModelColor}`}>
                  {workModelLabel}
                </span>
              )}
            </div>
            <StatusChip status={overallStatus} />
          </div>
        </div>
      </div>

      {/* Divider + Edit toggle */}
      <div className="flex items-center gap-2 my-4 relative">
        <div className="flex-1 border-t border-pink-100" />
        {!editing ? (
          <button onClick={startEdit} className="flex items-center gap-1 text-xs text-[#FF3CAC] hover:underline flex-shrink-0">
            <Pencil className="w-3 h-3" /> Bearbeiten
          </button>
        ) : (
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={cancelEdit} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" /> Abbrechen
            </button>
            <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 text-xs text-[#FF3CAC] font-semibold hover:underline disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Speichern
            </button>
          </div>
        )}
      </div>

      {/* Contact & address info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative">
        <EditableRow icon={Calendar} label="Geburtsdatum" value={profile.date_of_birth} fieldKey="date_of_birth" editValues={editValues} setEditValues={setEditValues} editing={editing} />
        <EditableRow icon={Flag} label="Nationalität" value={profile.nationality} fieldKey="nationality" editValues={editValues} setEditValues={setEditValues} editing={false} />
        <EditableRow icon={Phone} label="Telefonnummer" value={profile.phone} fieldKey="phone" editValues={editValues} setEditValues={setEditValues} editing={editing} />
        <EditableRow icon={Mail} label="E-Mail" value={profile.escort_email} fieldKey="escort_email" editValues={editValues} setEditValues={setEditValues} editing={editing} />
        <div className="sm:col-span-2">
          <EditableRow icon={MapPin} label="Adresse" value={fullAddress || null} fieldKey="address" editValues={editValues} setEditValues={setEditValues} editing={false} />
          {editing && (
            <div className="mt-2 grid grid-cols-3 gap-2 ml-5">
              <input placeholder="Strasse" value={editValues.address ?? ""} onChange={e => setEditValues(p => ({ ...p, address: e.target.value }))} className="col-span-3 text-sm border-b border-pink-200 focus:border-[#FF3CAC] outline-none bg-transparent py-0.5" />
              <input placeholder="PLZ" value={editValues.postal_code ?? ""} onChange={e => setEditValues(p => ({ ...p, postal_code: e.target.value }))} className="text-sm border-b border-pink-200 focus:border-[#FF3CAC] outline-none bg-transparent py-0.5" />
              <input placeholder="Ort" value={editValues.city ?? ""} onChange={e => setEditValues(p => ({ ...p, city: e.target.value }))} className="col-span-2 text-sm border-b border-pink-200 focus:border-[#FF3CAC] outline-none bg-transparent py-0.5" />
            </div>
          )}
        </div>
        {profile.canton && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>Kanton {profile.canton}</span>
          </div>
        )}
        {profile.business_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{profile.business_name}</span>
          </div>
        )}
        {profile.uid_number && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Hash className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{profile.uid_number}</span>
          </div>
        )}
      </div>

      {/* Gingr Profile Link */}
      <a
        href="https://gingr.ch/en/escorts/1701-daniella"
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center gap-2 text-xs text-[#FF3CAC] hover:underline relative"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Gingr.ch Profil ansehen
      </a>
    </div>
  );
}