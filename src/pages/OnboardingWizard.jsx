import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { validateStoredToken } from "@/lib/env";
import { fetchCountries, fetchLegalOnboardingData, getLastIncompleteStepId, mapLegalOnboardingDataToProfile, submitLegalOnboarding } from "@/lib/gingrOnboardingApi";
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
import AlreadySubmitted from "@/pages/AlreadySubmitted";

import AbandonModal from "@/components/wizard/AbandonModal";
import { useI18n } from "@/lib/i18n";

export default function OnboardingWizard() {
  const { t } = useI18n();
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

  useEffect(() => {
    setProfile((prev) => {
      if (prev.citizenship_group) return prev;
      if (prev.nationality === "CH") return { ...prev, citizenship_group: "CH" };
      if (prev.nationality) return { ...prev, citizenship_group: "NON_EU" };
      return prev;
    });
  }, [profile.nationality, profile.citizenship_group]);
  const [profileId, setProfileId] = useState(null);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    validateStoredToken()
      .then(async () => {
        const [apiData, countries] = await Promise.all([
          fetchLegalOnboardingData(),
          fetchCountries(),
        ]);
        const mappedProfile = mapLegalOnboardingDataToProfile(apiData, countries);

        if (mappedProfile.status && mappedProfile.status !== "draft") {
          window.location.href = "/already-submitted";
          return;
        }

        if (Object.keys(mappedProfile).length > 0) {
          setMode("self");
          setProfile((prev) => {
            const nextProfile = { ...prev, ...mappedProfile };
            const baseSteps = [
              { id: "welcome" },
              { id: "work_model" },
              { id: "core_data" },
            ];
            if (nextProfile.citizenship_group !== "CH") baseSteps.push({ id: "residency" });
            baseSteps.push({ id: "eligibility" });
            if (nextProfile.work_model === "self_employed") {
              baseSteps.push({ id: "self_employed" }, { id: "self_employed_summary" });
            } else if (nextProfile.work_model) {
              baseSteps.push({ id: "earnings" });
              if (nextProfile.source_tax === "yes" || nextProfile.source_tax === "unsure") {
                baseSteps.push({ id: "source_tax" });
              }
              baseSteps.push({ id: "summary" });
            }
            baseSteps.push({ id: "congratulations" });
            const resumeStepId = getLastIncompleteStepId(nextProfile);
            const resumeStepIndex = Math.max(0, baseSteps.findIndex((step) => step.id === resumeStepId));
            return {
              ...nextProfile,
              current_step: resumeStepIndex,
            };
          });
        }
      })
      .finally(() => setCheckingToken(false));
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
    const needsSourceTaxStep = profile.source_tax === "yes" || profile.source_tax === "unsure";
    const steps = [
      { id: "welcome", label: "onboarding.steps.welcome" },
      { id: "work_model", label: "onboarding.steps.work_model" },
      { id: "core_data", label: "onboarding.steps.core_data" },
    ];

    if (!isSwiss) {
      steps.push({ id: "residency", label: "onboarding.steps.residency" });
    }

    steps.push({ id: "eligibility", label: "onboarding.steps.eligibility" });

    if (profile.work_model === "self_employed") {
      steps.push({ id: "self_employed", label: "onboarding.steps.self_employed" });
      steps.push({ id: "self_employed_summary", label: "onboarding.steps.self_employed_summary" });
    } else {
      steps.push({ id: "earnings", label: "onboarding.steps.earnings" });
      if (needsSourceTaxStep) {
        steps.push({ id: "source_tax", label: "onboarding.steps.source_tax" });
      }
      steps.push({ id: "summary", label: "onboarding.steps.summary" });
    }

    steps.push({ id: "congratulations", label: "onboarding.steps.congratulations" });
    return steps;
  };

  const steps = buildSteps();
  const currentStepId = steps[profile.current_step || 0]?.id || steps[0]?.id;
  const currentStep = Math.max(0, steps.findIndex((step) => step.id === currentStepId));

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

  const goNext = async (stepData = {}, afterSaveCallback = null, options = {}) => {
    const nextStepIndex = Math.min(steps.length - 1, currentStep + 1);
    const shouldSkipDbSave = options.skipDbSave || currentStepId === "self_employed";
    const updates = { ...stepData, current_step: nextStepIndex };
    updateProfile(updates);

    let savedId = profileId;
    if (!shouldSkipDbSave) {
      savedId = await saveToDb(updates);
    }
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

  const handleSubmit = async (startDate) => {
    setSaving(true);
    const submitResult = await submitLegalOnboarding(startDate);

    if (submitResult === false) {
      setSaving(false);
      return false;
    }

    const updates = {
      status: "submitted",
      submitted_at: new Date().toISOString(),
      employment_start_date: startDate || profile.employment_start_date,
    };
    updateProfile(updates);

    // Send summary email (fire and forget)
    try {
      const user = await base44.auth.me();
      await base44.integrations.Core.SendEmail({
        to: "team@gingr.ch",
        subject: `Neues Onboarding eingereicht – ${profile.first_name || ""} ${profile.last_name || ""}`,
        body: `Ein neues Onboarding wurde eingereicht.\n\nName: ${profile.first_name} ${profile.last_name}\nEmail: ${profile.escort_email || user?.email}\nArbeitsmodell: ${profile.work_model}\nStatus: submitted\n\nBitte im Dashboard prüfen.`,
      });
    } catch (_) {}
    setSaving(false);
    return true;
  };

  if (checkingToken || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{t("onboarding.loading")}</p>
        </div>
      </div>
    );
  }

  if (!mode) {
    return <ModeSelector onSelect={setMode} />;
  }

  if (mode === "submitted") {
    return <AlreadySubmitted />;
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