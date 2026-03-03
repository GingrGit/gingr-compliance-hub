import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ApplicantList from "@/components/admin/ApplicantList";
import ApplicantDetail from "@/components/admin/ApplicantDetail";

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-700 flex items-center justify-center">
            <span className="text-white text-sm font-bold">g</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">gingr Admin</h1>
            <p className="text-xs text-gray-400">Onboarding Dashboard</p>
          </div>
        </div>
        <button
          onClick={load}
          className="text-xs text-gray-500 hover:text-purple-700 border border-gray-200 rounded-lg px-3 py-1.5"
        >
          Aktualisieren
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-65px)]">
        {/* Sidebar: Applicant List */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
          <ApplicantList
            profiles={filtered}
            loading={loading}
            selectedId={selectedId}
            onSelect={setSelectedId}
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
          />
        </div>

        {/* Main: Detail View */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <ApplicantDetail
              profile={selected}
              onRefresh={load}
              onUpdate={(updated) =>
                setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
              }
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-sm">Wähle einen Applicant aus der Liste</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}