import React from "react";

const CONFIG = {
  draft:        { label: "Entwurf",        color: "bg-gray-100 text-gray-500" },
  submitted:    { label: "Eingereicht",    color: "bg-blue-100 text-blue-600" },
  needs_action: { label: "Aktion nötig",  color: "bg-amber-100 text-amber-600" },
  approved:     { label: "Genehmigt",     color: "bg-green-100 text-green-600" },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || { label: status, color: "bg-gray-100 text-gray-500" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}