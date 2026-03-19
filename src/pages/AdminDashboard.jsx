import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ApplicantList from "@/components/admin/ApplicantList.jsx";
import ApplicantDetail from "@/components/admin/ApplicantDetail.jsx";
import { RefreshCw, X } from "lucide-react";

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const query = statusFilter !== "all" ? { status: statusFilter } : {};
    const data = await base44.entities.OnboardingProfile.filter(query, "-created_date", 200);
    setProfiles(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const selected = profiles.find((p) => p.id === selectedId);

  const filtered = search
    ? profiles.filter((p) => {
        const name = `${p.first_name || ""} ${p.last_name || ""} ${p.escort_email || ""} ${p.phone || ""}`.toLowerCase();
        return name.includes(search.toLowerCase());
      })
    : profiles;

  const counts = {
    submitted: profiles.filter(p => p.status === "submitted").length,
    needs_action: profiles.filter(p => p.status === "needs_action").length,
    approved: profiles.filter(p => p.status === "approved").length,
    draft: profiles.filter(p => p.status === "draft").length,
  };

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

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 57px)" }}>
        {/* List panel — wider when no detail open */}
        <div className={`border-r border-gray-200 bg-white flex flex-col flex-shrink-0 shadow-sm transition-all duration-200 ${selected ? "w-[55%]" : "w-full"}`}>
          <ApplicantList
            profiles={filtered}
            loading={loading}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(prev => prev === id ? null : id)}
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
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
            <ApplicantDetail profile={selected} />
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