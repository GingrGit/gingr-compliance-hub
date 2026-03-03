import React from "react";
import { Search } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge.jsx";

const MODEL_LABELS = {
  employee_unlimited: "Angestellt (unbefristet)",
  employee_90days: "Angestellt (90 Tage)",
  self_employed: "Selbständig",
};

export default function ApplicantList({
  profiles, loading, selectedId, onSelect,
  search, onSearch, statusFilter, onStatusFilter,
}) {
  const statuses = ["all", "draft", "submitted", "needs_action", "approved"];

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Suchen…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-1 px-3 py-2 border-b border-gray-100 overflow-x-auto">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => onStatusFilter(s)}
            className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              statusFilter === s
                ? "bg-purple-700 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "Alle" : s === "draft" ? "Entwurf" : s === "submitted" ? "Eingereicht" : s === "needs_action" ? "Aktion nötig" : "Genehmigt"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-400">Laden…</div>
        ) : profiles.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Keine Einträge gefunden</div>
        ) : (
          profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                selectedId === p.id ? "bg-purple-50 border-r-2 border-purple-700" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {p.first_name && p.last_name
                    ? `${p.first_name} ${p.last_name}`
                    : p.escort_email || "Unbekannt"}
                </p>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-xs text-gray-400 truncate">{p.escort_email || "—"}</p>
              {p.work_model && (
                <p className="text-xs text-purple-500 mt-0.5">{MODEL_LABELS[p.work_model] || p.work_model}</p>
              )}
            </button>
          ))
        )}
      </div>
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
        {profiles.length} Einträge
      </div>
    </div>
  );
}