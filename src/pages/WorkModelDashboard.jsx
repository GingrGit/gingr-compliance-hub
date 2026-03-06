import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Settings, ExternalLink, Loader2, Lock } from "lucide-react";
import StatusChip from "@/components/dashboard/StatusChip";
import DashboardTile from "@/components/dashboard/DashboardTile";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProfileCard from "@/components/dashboard/ProfileCard";
import { ContractTile, WorkEligibilityTile, ProstitutionPermitTile, NinetyDayTile } from "@/components/dashboard/ActionTiles";
import { PayrollTile, StatementsTile } from "@/components/dashboard/DocumentTiles";

function getOverallStatus(profile) {
  if (profile.status === "approved") return "active";
  if (profile.status === "submitted") return "review_pending";
  if (profile.status === "needs_action") return "action_required";
  return "pending";
}

export default function WorkModelDashboard() {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  function loadData(profileId) {
    base44.entities.OnboardingProfile.filter({ id: profileId }).then(([p]) => {
      if (p) setProfile(p);
    });
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const profileId = params.get("profile_id");
    const token = params.get("token");

    if (!profileId) { setNotFound(true); setLoading(false); return; }

    if (token) {
      base44.functions.invoke("verifyMagicLink", { token }).then((res) => {
        const data = res.data;
        if (data?.success && data?.profile) {
          setProfile(data.profile);
          setDocuments(data.documents || []);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      }).catch(() => { setNotFound(true); setLoading(false); });
      return;
    }

    Promise.all([
      base44.entities.OnboardingProfile.filter({ id: profileId }),
      base44.entities.EscortDocument.filter({ profile_id: profileId }),
    ]).then(([profiles, docs]) => {
      if (!profiles || profiles.length === 0) { setNotFound(true); }
      else { setProfile(profiles[0]); setDocuments(docs || []); }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF3CAC] animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-[#FF3CAC]" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard nicht gefunden</h1>
        <p className="text-sm text-gray-500 max-w-xs">
          Bitte verwende den Link aus deiner SMS oder E-Mail, um dein Dashboard zu öffnen.
        </p>
        <a href={createPageUrl("MagicLinkLogin")} className="text-sm text-[#FF3CAC] hover:underline">
          Neuen Zugangslink anfordern
        </a>
      </div>
    );
  }

  const isEmployee = profile.work_model === "employee_unlimited" || profile.work_model === "employee_90days";
  const is90Day = profile.work_model === "employee_90days";
  const isSelfEmployed = profile.work_model === "self_employed";
  const overallStatus = getOverallStatus(profile);
  const isApproved = profile.status === "approved";

  const payslips = documents.filter(d => d.type === "payslip");
  const statements = documents.filter(d => d.type === "monthly_statement");
  const vatDocs = documents.filter(d => d.type === "vat_statement");
  const contracts = documents.filter(d => d.type === "contract");

  const profileId = new URLSearchParams(window.location.search).get("profile_id");

  return (
    <div className="min-h-screen bg-[#F0F0F0] pb-16">
      <DashboardHeader profile={profile} overallStatus={overallStatus} isApproved={isApproved} />

      <div className="max-w-2xl mx-auto px-4 space-y-3 mt-6">

        <ProfileCard
          profile={profile}
          onUpdate={() => profileId && loadData(profileId)}
        />

        <ContractTile profile={profile} contracts={contracts} />

        <WorkEligibilityTile profile={profile} />

        <ProstitutionPermitTile profile={profile} onUpdate={() => profileId && loadData(profileId)} />

        {is90Day && <NinetyDayTile profile={profile} />}

        {isEmployee && <PayrollTile profile={profile} payslips={payslips} />}

        {isSelfEmployed && <StatementsTile statements={statements} vatDocs={vatDocs} />}

        <DashboardTile
          icon={Settings}
          title="Setup ändern oder beenden"
          subtitle="Wechsel oder Kündigung des Work Models"
          status={<StatusChip status="available" />}
          primaryAction={{ label: "Kündigung / Wechsel verwalten", onClick: () => {} }}
        >
          <p className="text-xs text-gray-500 mb-3">Du kannst dein Setup jederzeit wechseln oder Secure Payment beenden. Änderungen treten gemäss deinem Vertrag in Kraft.</p>
          <div className="space-y-2">
            {isEmployee && <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2"><ExternalLink className="w-3.5 h-3.5 text-gray-400" /> Beschäftigungsvertrag kündigen</div>}
            {isSelfEmployed && <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2"><ExternalLink className="w-3.5 h-3.5 text-gray-400" /> Zu Anstellung wechseln</div>}
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2"><ExternalLink className="w-3.5 h-3.5 text-gray-400" /> Secure Payment deaktivieren</div>
          </div>
        </DashboardTile>

      </div>
    </div>
  );
}