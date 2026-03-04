import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ApplicantList from "@/components/admin/ApplicantList.jsx";
import ApplicantDetail from "@/components/admin/ApplicantDetail.jsx";
import { RefreshCw, Users } from "lucide-react";

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.OnboardingProfile.list("-created_date", 100);
    setProfiles(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const selected = profiles.find((p) => p.id === selectedId);

  const filtered = profiles.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const name = `${p.first_name || ""} ${p.last_name || ""} ${p.escort_email || ""}`.toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    submitted: profiles.filter(p => p.status === "submitted").length,
    needs_action: profiles.filter(p => p.status === "needs_action").length,
    approved: profiles.filter(p => p.status === "approved").length,
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

        {/* Stats pills */}
        <div className="hidden md:flex items-center gap-3">
          <StatPill label="Ausstehend" count={counts.submitted} color="bg-blue-50 text-blue-700 border-blue-100" />
          <StatPill label="Aktion nötig" count={counts.needs_action} color="bg-amber-50 text-amber-700 border-amber-100" />
          <StatPill label="Genehmigt" count={counts.approved} color="bg-green-50 text-green-700 border-green-100" />
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
        {/* Sidebar */}
        <aside className="w-72 border-r border-gray-200 bg-white flex flex-col flex-shrink-0 shadow-sm">
          <ApplicantList
            profiles={filtered}
            loading={loading}
            selectedId={selectedId}
            onSelect={setSelectedId}
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            onDelete={async (id) => {
              await base44.entities.OnboardingProfile.delete(id);
              setProfiles((prev) => prev.filter((p) => p.id !== id));
              if (selectedId === id) setSelectedId(null);
            }}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-[#f8f7fa]">
          {selected ? (
            <ApplicantDetail
              profile={selected}
              onRefresh={load}
              onUpdate={(updated) =>
                setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
              }
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">Wähle einen Applicant aus der Liste</p>
              </div>
            </div>
          )}
        </main>
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