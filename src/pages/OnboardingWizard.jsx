import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { validateStoredToken } from "@/lib/env";
import WizardLayout from "@/components/wizard/WizardLayout";
import ModeSelector from "@/components/wizard/ModeSelector";
import StepWelcome from "@/components/wizard/StepWelcome";
import StepWorkModel from "@/components/wizard/StepWorkModel";
import StepCoreData from "@/components/wizard/StepCoreData";
import StepResidency from "@/components/wizard/StepResidency";
import StepEligibility from "@/components/wizard/StepEligibility";
import StepEarnings from "@/components/wizard/StepEarnings";
import StepSourceTax from "@/components/wizard/StepSourceTax";
import StepSummary from "@/components/wizard/StepSummary";
import StepSelfEmployed from "@/components/wizard/StepSelfEmployed";
import StepSelfEmployedSummary from "@/components/wizard/StepSelfEmployedSummary";
import StepCongratulations from "@/components/wizard/StepCongratulations";
import StepCoreDataPrefilled from "@/components/wizard/StepCoreDataPrefilled";

import AbandonModal from "@/components/wizard/AbandonModal";

export default function OnboardingWizard() {
  const urlParams = new URLSearchParams(window.location.search);
  const prefillMode = urlParams.get("prefill") === "true";

  const PREFILL_DEMO_DATA = prefillMode ? {
    first_name: "Anna",
    last_name: "Müller",
    date_of_birth: "1995-06-15",
    escort_email: "anna.mueller@example.com",
    phone: "+41 79 123 45 67",
    nationality: "Deutschland",
    citizenship_group: "EU_EFTA",
  } : {};

  const [mode, setMode] = useState(prefillMode ? "self" : null); // "self" | "guided"
  const [profile, setProfile] = useState({
    status: "draft",
    current_step: prefillMode ? 2 : 0,
    work_model: prefillMode ? "employee_unlimited" : null,
    citizenship_group: prefillMode ? "EU_EFTA" : null,
    permit_type: "none",
    permit_status: "not_required",
    source_tax: null,
    ...PREFILL_DEMO_DATA,
  });
  const [profileId, setProfileId] = useState(null);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    validateStoredToken().finally(() => setCheckingToken(false));
  }, []);

  // Load profile from magic link if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const magicProfileId = urlParams.get("profile_id");
    if (magicProfileId && !profileId) {
      setLoadingProfile(true);
      base44.entities.OnboardingProfile.filter({ id: magicProfileId }).then((results) => {
        if (results && results.length > 0) {
          const p = results[0];
          setProfile(p);
          setProfileId(p.id);
          setMode(p.mode || "self");
        }
        setLoadingProfile(false);
      }).catch(() => setLoadingProfile(false));
    }
  }, []);

  const isSwiss = profile.citizenship_group === "CH";
  const isSelfEmployed = profile.work_model === "self_employed";

  // Build dynamic steps based on path
  const buildSteps = () => {
    const committedStep = profile.current_step || 0;
    const steps = [
      { id: "welcome", label: "Willkommen" },
      { id: "work_model", label: "Arbeitsmodell" },
      { id: "core_data", label: "Deine Daten" },
    ];
    if (!isSwiss) steps.push({ id: "residency", label: "Aufenthalt" });
    steps.push({ id: "eligibility", label: "Berechtigung" });
    // Only expand model-specific steps after work_model step is committed (step > 1)
    if (committedStep > 1) {
      if (isSelfEmployed) {
        steps.push({ id: "self_employed", label: "Geschäft" });
        steps.push({ id: "self_employed_summary", label: "Abschluss" });
      } else if (profile.work_model) {
        steps.push({ id: "earnings", label: "Verdienst" });
        if (profile.source_tax === "yes" || profile.source_tax === "unsure") {
          steps.push({ id: "source_tax", label: "Quellensteuer" });
        }
        steps.push({ id: "summary", label: "Abschluss" });
      }
    }
    steps.push({ id: "congratulations", label: "Fertig" });
    return steps;
  };

  const steps = buildSteps();
  const currentStep = profile.current_step || 0;
  const currentStepId = steps[currentStep]?.id;

  const updateProfile = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const saveToDb = async (data) => {
    setSaving(true);
    const payload = { ...profile, ...data, current_step: profile.current_step };
    let savedId = profileId;
    if (profileId) {
      await base44.entities.OnboardingProfile.update(profileId, payload);
    } else {
      const created = await base44.entities.OnboardingProfile.create(payload);
      savedId = created.id;
      setProfileId(created.id);
    }
    setSaving(false);
    return savedId;
  };

  const goNext = async (stepData = {}, afterSaveCallback = null) => {
    const updates = { ...stepData, current_step: currentStep + 1 };
    updateProfile(updates);
    const savedId = await saveToDb(updates);
    if (afterSaveCallback) {
      await afterSaveCallback(savedId || profileId);
    }
  };

  const goBack = () => {
    updateProfile({ current_step: Math.max(0, currentStep - 1) });
  };

  const goToStep = (idx) => {
    if (idx >= 0 && idx < currentStep) {
      updateProfile({ current_step: idx });
    }
  };

  const handleSaveAndExit = async () => {
    await saveToDb({});
    setShowAbandonModal(true);
  };

  const handleSubmit = async () => {
    const updates = { status: "submitted", submitted_at: new Date().toISOString() };
    updateProfile(updates);
    await saveToDb(updates);

    // Send summary email (fire and forget)
    try {
      const user = await base44.auth.me();
      await base44.integrations.Core.SendEmail({
        to: "team@gingr.ch",
        subject: `Neues Onboarding eingereicht – ${profile.first_name || ""} ${profile.last_name || ""}`,
        body: `Ein neues Onboarding wurde eingereicht.\n\nName: ${profile.first_name} ${profile.last_name}\nEmail: ${profile.escort_email || user?.email}\nArbeitsmodell: ${profile.work_model}\nStatus: submitted\n\nBitte im Dashboard prüfen.`,
      });
    } catch (_) {}
  };

  if (checkingToken || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Daten werden geladen…</p>
        </div>
      </div>
    );
  }

  if (!mode) {
    return <ModeSelector onSelect={setMode} />;
  }

  const stepProps = {
    profile,
    updateProfile,
    onNext: goNext,
    onBack: goBack,
    onSaveAndExit: handleSaveAndExit,
    onSubmit: handleSubmit,
    saving,
    mode,
  };

  const renderStep = () => {
    switch (currentStepId) {
      case "welcome": return <StepWelcome {...stepProps} />;
      case "work_model": return <StepWorkModel {...stepProps} />;
      case "core_data": return prefillMode
        ? <StepCoreDataPrefilled {...stepProps} />
        : <StepCoreData {...stepProps} profileId={profileId} />;
      case "residency": return <StepResidency {...stepProps} profileId={profileId} />;
      case "eligibility": return <StepEligibility {...stepProps} />;
      case "earnings": return <StepEarnings {...stepProps} />;
      case "source_tax": return <StepSourceTax {...stepProps} />;
      case "summary": return <StepSummary {...stepProps} profileId={profileId} />;
      case "self_employed": return <StepSelfEmployed {...stepProps} profileId={profileId} />;
      case "self_employed_summary": return <StepSelfEmployedSummary {...stepProps} profileId={profileId} />;
      case "congratulations": return <StepCongratulations {...stepProps} profileId={profileId} />;
      default: return <StepWelcome {...stepProps} />;
    }
  };

  return (
    <>
      <WizardLayout
        steps={steps}
        currentStep={currentStep}
        onStepClick={goToStep}
        mode={mode}
        onModeChange={setMode}
        saving={saving}
        currentStepId={currentStepId}
        profile={profile}
      >
        {renderStep()}
      </WizardLayout>
      {showAbandonModal && (
        <AbandonModal
          onContinue={() => setShowAbandonModal(false)}
          onExit={() => window.location.href = "/"}
        />
      )}
    </>
  );
}