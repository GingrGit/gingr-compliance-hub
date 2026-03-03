import React from "react";
import { Search, Clock, AlertTriangle, CheckCircle2, FileEdit } from "lucide-react";

const MODEL_LABELS = {
  employee_unlimited: "Unbefristet",
  employee_90days: "90 Tage",
  self_employed: "Selbständig",
};

const STATUS_CONFIG = {
  draft:        { label: "Entwurf",       color: "bg-gray-100 text-gray-500",   dot: "bg-gray-400" },
  submitted:    { label: "Eingereicht",   color: "bg-blue-50 text-blue-600",    dot: "bg-blue-500" },
  needs_action: { label: "Aktion nötig", color: "bg-amber-50 text-amber-600",  dot: "bg-amber-500" },
  approved:     { label: "Genehmigt",     color: "bg-green-50 text-green-700",  dot: "bg-green-500" },
};

const FILTERS = [
  { value: "all",          label: "Alle" },
  { value: "submitted",    label: "Eingereicht" },
  { value: "needs_action", label: "Aktion nötig" },
  { value: "approved",     label: "Genehmigt" },
  { value: "draft",        label: "Entwurf" },
];

export default function ApplicantList({
  profiles, loading, selectedId, onSelect,
  search, onSearch, statusFilter, onStatusFilter,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Name oder E-Mail suchen…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-gray-100 overflow-x-auto scrollbar-none">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onStatusFilter(value)}
            className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors font-medium ${
              statusFilter === value
                ? "bg-purple-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Keine Einträge gefunden</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {profiles.map((p) => {
              const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.draft;
              const name = p.first_name && p.last_name
                ? `${p.first_name} ${p.last_name}`
                : p.escort_email || "Unbekannt";
              const isSelected = selectedId === p.id;

              return (
                <button
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  className={`w-full text-left px-4 py-3.5 transition-all ${
                    isSelected
                      ? "bg-purple-50 border-r-[3px] border-purple-600"
                      : "hover:bg-gray-50 border-r-[3px] border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-semibold truncate ${isSelected ? "text-purple-900" : "text-gray-900"}`}>
                      {name}
                    </p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{p.escort_email || "—"}</p>
                  {p.work_model && (
                    <p className="text-xs text-purple-400 mt-0.5 font-medium">{MODEL_LABELS[p.work_model] || p.work_model}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 bg-gray-50">
        {profiles.length} {profiles.length === 1 ? "Eintrag" : "Einträge"}
      </div>
    </div>
  );
}