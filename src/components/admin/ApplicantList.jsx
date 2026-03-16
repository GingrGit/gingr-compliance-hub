import React, { useState } from "react";
import { Search, ChevronDown, ChevronUp, ChevronsUpDown, Filter, X } from "lucide-react";

const MODEL_LABELS = {
  employee_unlimited: "Unbefristet",
  employee_90days: "90 Tage",
  self_employed: "Selbständig",
};

const CITIZENSHIP_LABELS = {
  CH: "Schweiz",
  EU_EFTA: "EU/EFTA",
  NON_EU: "Nicht-EU",
};

const STATUS_CONFIG = {
  draft:        { label: "Entwurf",       color: "bg-gray-100 text-gray-500" },
  submitted:    { label: "Eingereicht",   color: "bg-blue-50 text-blue-600" },
  needs_action: { label: "Aktion nötig", color: "bg-amber-50 text-amber-600" },
  approved:     { label: "Genehmigt",     color: "bg-green-50 text-green-700" },
};

const STATUS_FILTERS = [
  { value: "all",          label: "Alle" },
  { value: "submitted",    label: "Eingereicht" },
  { value: "needs_action", label: "Aktion nötig" },
  { value: "approved",     label: "Genehmigt" },
  { value: "draft",        label: "Entwurf" },
];

function ColHeader({ label, sortKey, sortBy, sortDir, onSort }) {
  const active = sortBy === sortKey;
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-gray-800 select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {active
          ? sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          : <ChevronsUpDown className="w-3 h-3 opacity-30" />}
      </div>
    </th>
  );
}

export default function ApplicantList({
  profiles, loading, selectedId, onSelect,
  search, onSearch, statusFilter, onStatusFilter,
}) {
  const [modelFilter, setModelFilter] = useState("all");
  const [citizenFilter, setCitizenFilter] = useState("all");
  const [sortBy, setSortBy] = useState("submitted_at");
  const [sortDir, setSortDir] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortDir("asc"); }
  };

  const activeFilterCount = [
    modelFilter !== "all",
    citizenFilter !== "all",
  ].filter(Boolean).length;

  let display = profiles.filter(p => {
    if (modelFilter !== "all" && p.work_model !== modelFilter) return false;
    if (citizenFilter !== "all" && p.citizenship_group !== citizenFilter) return false;
    return true;
  });

  display = [...display].sort((a, b) => {
    let va = a[sortBy] || "";
    let vb = b[sortBy] || "";
    if (sortBy === "submitted_at" || sortBy === "updated_date") {
      va = va ? new Date(va).getTime() : 0;
      vb = vb ? new Date(vb).getTime() : 0;
    }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search + Filter bar */}
      <div className="p-3 border-b border-gray-100 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Name, E-Mail, Telefon suchen…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-colors ${showFilters || activeFilterCount > 0 ? "bg-purple-700 text-white border-purple-700" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
          >
            <Filter className="w-3.5 h-3.5" />
            {activeFilterCount > 0 ? `Filter (${activeFilterCount})` : "Filter"}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 pt-1">
            <select
              value={modelFilter}
              onChange={e => setModelFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="all">Alle Modelle</option>
              <option value="employee_unlimited">Unbefristet</option>
              <option value="employee_90days">90 Tage</option>
              <option value="self_employed">Selbständig</option>
            </select>
            <select
              value={citizenFilter}
              onChange={e => setCitizenFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="all">Alle Nationalitäten</option>
              <option value="CH">Schweiz</option>
              <option value="EU_EFTA">EU/EFTA</option>
              <option value="NON_EU">Nicht-EU</option>
            </select>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setModelFilter("all"); setCitizenFilter("all"); }}
                className="text-xs text-red-500 flex items-center gap-1 hover:underline"
              >
                <X className="w-3 h-3" /> Zurücksetzen
              </button>
            )}
          </div>
        )}

        {/* Status tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onStatusFilter(value)}
              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-colors font-medium ${
                statusFilter === value ? "bg-[#6B0064] text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : display.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">Keine Einträge gefunden</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-100">
              <tr>
                <ColHeader label="Name" sortKey="first_name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <ColHeader label="Modell" sortKey="work_model" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <ColHeader label="Herkunft" sortKey="citizenship_group" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <ColHeader label="Status" sortKey="status" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <ColHeader label="Eingereicht" sortKey="submitted_at" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {display.map((p) => {
                const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.draft;
                const name = p.first_name && p.last_name
                  ? `${p.first_name} ${p.last_name}`
                  : p.escort_email || "Unbekannt";
                const isSelected = selectedId === p.id;

                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelect(p.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-purple-50 border-l-2 border-purple-500"
                        : "hover:bg-gray-50 border-l-2 border-transparent"
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <p className={`font-semibold truncate max-w-[160px] ${isSelected ? "text-purple-700" : "text-gray-900"}`}>{name}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">{p.escort_email || "—"}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-600">{MODEL_LABELS[p.work_model] || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-600">{CITIZENSHIP_LABELS[p.citizenship_group] || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-400">
                        {p.submitted_at ? new Date(p.submitted_at).toLocaleDateString("de-CH") : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 bg-gray-50">
        <span>{display.length} {display.length === 1 ? "Eintrag" : "Einträge"}</span>
      </div>
    </div>
  );
}