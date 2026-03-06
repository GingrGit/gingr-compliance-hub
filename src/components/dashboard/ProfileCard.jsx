import React from "react";
import { User, MapPin, Flag, Phone, Calendar, Briefcase } from "lucide-react";

const WORK_MODEL_LABELS = {
  employee_unlimited: "Anstellung (unbefristet)",
  employee_90days: "Anstellung (90 Tage)",
  self_employed: "Selbstständig",
};

function InfoItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-[#FF3CAC]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-pink-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

export default function ProfileCard({ profile }) {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  const fullAddress = [profile.address, profile.postal_code, profile.city].filter(Boolean).join(", ");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fff0fb] via-white to-[#fce7fb] border border-pink-100 shadow-sm p-5">
      {/* Decorative background shape */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-[#FF3CAC]/10 to-purple-200/20 pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-pink-100/30 pointer-events-none" />

      {/* Header row */}
      <div className="flex items-center gap-4 mb-5 relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF3CAC] to-purple-400 flex items-center justify-center shadow-md flex-shrink-0">
          <span className="text-xl font-bold text-white">
            {profile.first_name?.[0] || "?"}{profile.last_name?.[0] || ""}
          </span>
        </div>
        <div>
          <p className="text-[10px] text-pink-400 uppercase tracking-widest font-medium mb-0.5">Profil</p>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{fullName || "–"}</h2>
          <p className="text-xs text-gray-500">{WORK_MODEL_LABELS[profile.work_model] || "Work Model ausstehend"}</p>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
        <InfoItem icon={Calendar} label="Geburtsdatum" value={profile.date_of_birth} />
        <InfoItem icon={Flag} label="Nationalität" value={profile.nationality} />
        <InfoItem icon={MapPin} label="Adresse" value={fullAddress || null} />
        <InfoItem icon={Phone} label="Telefon" value={profile.phone} />
        {profile.canton && <InfoItem icon={Briefcase} label="Kanton" value={profile.canton} />}
        {profile.source_tax && (
          <InfoItem
            icon={User}
            label="Quellensteuer"
            value={profile.source_tax === "yes" ? "Ja" : profile.source_tax === "no" ? "Nein" : "Unsicher"}
          />
        )}
      </div>
    </div>
  );
}