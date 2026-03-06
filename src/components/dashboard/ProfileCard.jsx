import React from "react";
import { MapPin, Phone, Calendar, Flag, Building2, Hash, Mail, ExternalLink } from "lucide-react";
import StatusChip from "./StatusChip";

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

function InfoRow({ icon: Icon, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      <span>{value}</span>
    </div>
  );
}

function getOverallStatus(profile) {
  if (profile.status === "approved") return "active";
  if (profile.status === "submitted") return "review_pending";
  if (profile.status === "needs_action") return "action_required";
  return "pending";
}

export default function ProfileCard({ profile }) {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
  const fullAddress = [profile.address, profile.postal_code, profile.city].filter(Boolean).join(", ");
  const overallStatus = getOverallStatus(profile);
  const workModelLabel = WORK_MODEL_LABELS[profile.work_model];
  const workModelColor = WORK_MODEL_COLORS[profile.work_model] || "bg-gray-100 text-gray-600";

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

      {/* Divider */}
      <div className="border-t border-pink-100 my-4 relative" />

      {/* Contact & address info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative">
        <InfoRow icon={Calendar} value={profile.date_of_birth} />
        <InfoRow icon={Flag} value={profile.nationality} />
        <InfoRow icon={Phone} value={profile.phone} />
        <InfoRow icon={Mail} value={profile.escort_email} />
        <InfoRow icon={MapPin} value={fullAddress || null} />
        {profile.canton && <InfoRow icon={MapPin} value={`Kanton ${profile.canton}`} />}
        {profile.business_name && <InfoRow icon={Building2} value={profile.business_name} />}
        {profile.uid_number && <InfoRow icon={Hash} value={profile.uid_number} />}
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