import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ApplicantList from "@/components/admin/ApplicantList.jsx";
import ApplicantDetail from "@/components/admin/ApplicantDetail.jsx";
import { RefreshCw, Users, CheckCircle2, XCircle, Send, Trash2, X, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.OnboardingProfile.list("-created_date", 200);
    setProfiles(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const selected = profiles.find((p) => p.id === selectedId);

  const filtered = profiles.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const name = `${p.first_name || ""} ${p.last_name || ""} ${p.escort_email || ""} ${p.phone || ""}`.toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    submitted: profiles.filter(p => p.status === "submitted").length,
    needs_action: profiles.filter(p => p.status === "needs_action").length,
    approved: profiles.filter(p => p.status === "approved").length,
    draft: profiles.filter(p => p.status === "draft").length,
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = (ids) => setSelectedIds(ids);

  const clearSelection = () => setSelectedIds([]);

  const bulkUpdateStatus = async (status) => {
    setBulkLoading(true);
    await Promise.all(selectedIds.map(id => base44.entities.OnboardingProfile.update(id, { status })));
    await load();
    clearSelection();
    setBulkLoading(false);
  };

  const bulkSendLinks = async () => {
    setBulkLoading(true);
    const targets = profiles.filter(p => selectedIds.includes(p.id) && p.phone);
    await Promise.all(targets.map(p =>
      base44.functions.invoke("sendDashboardLink", { profile_id: p.id, phone: p.phone, app_url: window.location.origin })
    ));
    clearSelection();
    setBulkLoading(false);
    alert(`Dashboard-Link an ${targets.length} Personen gesendet.`);
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Wirklich ${selectedIds.length} Einträge löschen?`)) return;
    setBulkLoading(true);
    await Promise.all(selectedIds.map(id => base44.entities.OnboardingProfile.delete(id)));
    setProfiles(prev => prev.filter(p => !selectedIds.includes(p.id)));
    if (selectedIds.includes(selectedId)) setSelectedId(null);
    clearSelection();
    setBulkLoading(false);
  };

  const hasSelection = selectedIds.length > 0;

  return (
    <div className="min-h-screen bg-[#f8f7fa] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow">
            <span className="text-white text-base font-bold">g</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">gingr Admin</h1>
            <p className="text-xs text-gray-400">Onboarding Dashboard</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <StatPill label="Eingereicht" count={counts.submitted} color="bg-blue-50 text-blue-700 border-blue-100" />
          <StatPill label="Aktion nötig" count={counts.needs_action} color="bg-amber-50 text-amber-700 border-amber-100" />
          <StatPill label="Genehmigt" count={counts.approved} color="bg-green-50 text-green-700 border-green-100" />
          <StatPill label="Entwurf" count={counts.draft} color="bg-gray-50 text-gray-600 border-gray-200" />
        </div>

        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-purple-300 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Aktualisieren
        </button>
      </header>

      {/* Bulk Action Bar */}
      {hasSelection && (
        <div className="bg-purple-700 text-white px-6 py-2.5 flex items-center gap-3 flex-wrap shadow">
          <span className="text-sm font-semibold">{selectedIds.length} ausgewählt</span>
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <BulkBtn icon={CheckCircle2} label="Genehmigen" onClick={() => bulkUpdateStatus("approved")} loading={bulkLoading} color="bg-green-500 hover:bg-green-600" />
            <BulkBtn icon={XCircle} label="Aktion anfordern" onClick={() => bulkUpdateStatus("needs_action")} loading={bulkLoading} color="bg-amber-500 hover:bg-amber-600" />
            <BulkBtn icon={Send} label="Dashboard-Link senden" onClick={bulkSendLinks} loading={bulkLoading} color="bg-white/20 hover:bg-white/30" />
            <BulkBtn icon={Trash2} label="Löschen" onClick={bulkDelete} loading={bulkLoading} color="bg-red-500 hover:bg-red-600" />
          </div>
          <button onClick={clearSelection} className="ml-auto text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden" style={{ height: `calc(100vh - ${hasSelection ? 105 : 57}px)` }}>
        {/* List panel — wider when no detail open */}
        <div className={`border-r border-gray-200 bg-white flex flex-col flex-shrink-0 shadow-sm transition-all duration-200 ${selected ? "w-[55%]" : "w-full"}`}>
          <ApplicantList
            profiles={filtered}
            loading={loading}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(prev => prev === id ? null : id)}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            onDelete={async (id) => {
              await base44.entities.OnboardingProfile.delete(id);
              setProfiles(prev => prev.filter(p => p.id !== id));
              if (selectedId === id) setSelectedId(null);
              setSelectedIds(prev => prev.filter(i => i !== id));
            }}
          />
        </div>

        {/* Detail panel */}
        {selected && (
          <main className="flex-1 overflow-y-auto bg-[#f8f7fa] relative">
            <button
              onClick={() => setSelectedId(null)}
              className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <ApplicantDetail
              profile={selected}
              onRefresh={load}
              onUpdate={(updated) =>
                setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p))
              }
            />
          </main>
        )}

        {/* Empty state when no selection */}
        {!selected && !loading && filtered.length > 0 && (
          <div className="hidden" />
        )}
      </div>
    </div>
  );
}

function StatPill({ label, count, color }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${color}`}>
      <span className="font-bold">{count}</span>
      <span>{label}</span>
    </div>
  );
}

function BulkBtn({ icon: Icon, label, onClick, loading, color }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${color}`}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}