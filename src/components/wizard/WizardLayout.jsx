import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, Save, ShieldCheck, Info, Sparkles, Briefcase, Calendar, Lightbulb, Lock, Home, CircleDollarSign, BarChart2, FileText, Building2, PenLine, Trophy, User, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LANGUAGES } from "@/components/language";

const PHASE_KEYS = [
  "wizard_layout.phase_start",
  "wizard_layout.phase_model",
  "wizard_layout.phase_data",
  "wizard_layout.phase_eligibility",
  "wizard_layout.phase_setup",
  "wizard_layout.phase_finish",
];

const STEP_TO_PHASE = {
  welcome: 0,
  work_model: 1,
  core_data: 2,
  residency: 2,
  eligibility: 3,
  earnings: 4,
  source_tax: 4,
  self_employed: 4,
  summary: 4,
  self_employed_agreement: 4,
  congratulations: 5,
};

function LanguagePicker() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <Globe className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[140px]">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-pink-50 transition-colors text-left ${l.code === lang ? "text-[#FF3CAC] font-semibold" : "text-gray-700"}`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WizardLayout({ steps, currentStep, onStepClick, mode, saving, children, currentStepId, profile }) {
  const { t } = useI18n();
  const currentPhase = STEP_TO_PHASE[currentStepId] ?? 0;
  const FIXED_PHASES = PHASE_KEYS.map(key => ({ label: t(key) }));
  const localizedSteps = steps.map((step) => ({ ...step, label: t(step.label) }));

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      {/* Top Header */}
      <div className="bg-white/90 backdrop-blur-md border border-gray-100 shadow-lg sticky top-0 z-30 sm:sticky sm:top-4 sm:mx-4 sm:rounded-2xl">
        {/* Gradient progress bar at very top */}
        <div className="h-1 bg-gray-100 overflow-hidden sm:rounded-t-2xl">
          <div
            className="h-full bg-gradient-to-r from-[#FF3CAC] to-[#6B0064] transition-all duration-500 ease-out"
            style={{ width: `${((currentPhase + 1) / FIXED_PHASES.length) * 100}%` }}
          />
        </div>

        {/* Logo row */}
        <div className="max-w-5xl mx-auto px-4 pt-4 pb-2 flex flex-col items-center justify-center relative">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/e355eb65f_GingrLogo4x.png"
            alt="Gingr"
            className="h-7 object-contain"
          />
          <span className="text-xs text-gray-400 font-medium mt-1">{t("wizard_layout.legal_onboarding_label")}</span>
          <div className="absolute right-4 top-0 flex items-center gap-2">
            {saving && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Save className="w-3 h-3" /> {t("wizard_layout.saving")}
              </span>
            )}
            <LanguagePicker />
          </div>
        </div>

        {/* Step indicators — Desktop (fixed phases) */}
        <div className="hidden sm:block max-w-5xl mx-auto px-4 pb-3">
          <div className="flex items-start justify-center">
            {FIXED_PHASES.map((phase, idx) => {
              const done = idx < currentPhase;
              const active = idx === currentPhase;
              return (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 px-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      done ? "bg-green-500" : active ? "bg-[#FF3CAC] shadow-sm shadow-pink-300" : "bg-gray-200"
                    }`}>
                      {done
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        : <span className={`text-[10px] font-bold ${active ? "text-white" : "text-gray-400"}`}>{idx + 1}</span>
                      }
                    </div>
                    <span className={`text-[9px] font-medium whitespace-nowrap transition-colors w-16 text-center ${
                      active ? "text-[#FF3CAC]" : done ? "text-green-600" : "text-gray-300"
                    }`}>
                      {phase.label}
                    </span>
                  </div>
                  {idx < FIXED_PHASES.length - 1 && (
                    <div className={`h-px w-8 flex-shrink-0 mt-3 mx-0.5 transition-colors duration-300 ${idx < currentPhase ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step indicators — Mobile compact */}
        <div className="sm:hidden max-w-5xl mx-auto px-4 pb-2.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#6B0064]">{FIXED_PHASES[currentPhase]?.label}</span>
          <span className="text-xs text-gray-400">{t("wizard_layout.phase_counter", { current: currentPhase + 1, total: FIXED_PHASES.length })}</span>
        </div>
      </div>

      {/* Main Content */}

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            {children}
          </div>
          <div className="hidden lg:block">
            <GuidancePanel mode={mode} stepId={currentStepId} profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}



function AccordionItem({ title, children }) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border border-pink-100 rounded-xl overflow-hidden mt-3">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#6B0064] hover:bg-pink-50 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />{title}</span>
        <span aria-label={open ? t("wizard.accordion.close") : t("wizard.accordion.open")}>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-3 pb-3 pt-1 text-xs text-gray-600 leading-relaxed">{children}</div>}
    </div>
  );
}

function getStepContent(stepId, profile, t) {
  const workModel = profile?.work_model;
  const isEmployee = workModel === "employee_unlimited" || workModel === "employee_90days";
  const isSelfEmployed = workModel === "self_employed";
  const is90days = workModel === "employee_90days";

  switch (stepId) {
    case "welcome":
      return {
        icon: Sparkles,
        title: t("wizard.guidance.welcome.title"),
        body: t("wizard.guidance.welcome.body"),
        accordions: []
      };

    case "work_model":
      if (isSelfEmployed) return {
        icon: Briefcase,
        title: t("wizard.guidance.work_model.self_employed.title"),
        body: t("wizard.guidance.work_model.self_employed.body"),
        accordions: [
          { title: t("wizard.guidance.work_model.self_employed.accordion_1.title"), content: t("wizard.guidance.work_model.self_employed.accordion_1.content") },
          { title: t("wizard.guidance.work_model.self_employed.accordion_2.title"), content: t("wizard.guidance.work_model.self_employed.accordion_2.content") },
          { title: t("wizard.guidance.work_model.self_employed.accordion_3.title"), content: t("wizard.guidance.work_model.self_employed.accordion_3.content") },
          { title: t("wizard.guidance.work_model.self_employed.accordion_4.title"), content: t("wizard.guidance.work_model.self_employed.accordion_4.content") },
        ]
      };
      if (isEmployee && is90days) return {
        icon: Calendar,
        title: t("wizard.guidance.work_model.employee_90days.title"),
        body: t("wizard.guidance.work_model.employee_90days.body"),
        accordions: [
          { title: t("wizard.guidance.work_model.employee_90days.accordion_1.title"), content: t("wizard.guidance.work_model.employee_90days.accordion_1.content") },
          { title: t("wizard.guidance.work_model.employee_90days.accordion_2.title"), content: t("wizard.guidance.work_model.employee_90days.accordion_2.content") },
        ]
      };
      if (isEmployee) return {
        icon: ShieldCheck,
        title: t("wizard.guidance.work_model.employee_unlimited.title"),
        body: t("wizard.guidance.work_model.employee_unlimited.body"),
        accordions: [
          { title: t("wizard.guidance.work_model.employee_unlimited.accordion_1.title"), content: t("wizard.guidance.work_model.employee_unlimited.accordion_1.content") },
          { title: t("wizard.guidance.work_model.employee_unlimited.accordion_2.title"), content: t("wizard.guidance.work_model.employee_unlimited.accordion_2.content") },
        ]
      };
      return {
        icon: Lightbulb,
        title: t("wizard.guidance.work_model.default.title"),
        body: t("wizard.guidance.work_model.default.body"),
        accordions: [
          { title: t("wizard.guidance.work_model.default.accordion_1.title"), content: t("wizard.guidance.work_model.default.accordion_1.content") },
        ]
      };

    case "core_data":
      return {
        icon: Lock,
        title: t("wizard.guidance.core_data.title"),
        body: t("wizard.guidance.core_data.body"),
        accordions: [
          { title: t("wizard.guidance.core_data.accordion_1.title"), content: t("wizard.guidance.core_data.accordion_1.content") },
          { title: t("wizard.guidance.core_data.accordion_2.title"), content: t("wizard.guidance.core_data.accordion_2.content") },
        ]
      };

    case "residency":
      return {
        icon: Home,
        title: t("wizard.guidance.residency.title"),
        body: t("wizard.guidance.residency.body"),
        accordions: [
          { title: t("wizard.guidance.residency.accordion_1.title"), content: t("wizard.guidance.residency.accordion_1.content") },
          { title: t("wizard.guidance.residency.accordion_2.title"), content: t("wizard.guidance.residency.accordion_2.content") },
          { title: t("wizard.guidance.residency.accordion_3.title"), content: t("wizard.guidance.residency.accordion_3.content") },
        ]
      };

    case "eligibility":
      return {
        icon: CheckCircle2,
        title: t("wizard.guidance.eligibility.title"),
        body: t("wizard.guidance.eligibility.body"),
        accordions: [
          { title: t("wizard.guidance.eligibility.accordion_1.title"), content: t("wizard.guidance.eligibility.accordion_1.content") },
          { title: t("wizard.guidance.eligibility.accordion_2.title"), content: t("wizard.guidance.eligibility.accordion_2.content") },
        ]
      };

    case "earnings":
      return {
        icon: CircleDollarSign,
        title: t("wizard.guidance.earnings.title"),
        body: t("wizard.guidance.earnings.body"),
        accordions: [
          { title: t("wizard.guidance.earnings.accordion_1.title"), content: t("wizard.guidance.earnings.accordion_1.content") },
          { title: t("wizard.guidance.earnings.accordion_2.title"), content: t("wizard.guidance.earnings.accordion_2.content") },
          { title: t("wizard.guidance.earnings.accordion_3.title"), content: t("wizard.guidance.earnings.accordion_3.content") },
        ]
      };

    case "source_tax":
      return {
        icon: BarChart2,
        title: t("wizard.guidance.source_tax.title"),
        body: t("wizard.guidance.source_tax.body"),
        accordions: [
          { title: t("wizard.guidance.source_tax.accordion_1.title"), content: t("wizard.guidance.source_tax.accordion_1.content") },
          { title: t("wizard.guidance.source_tax.accordion_2.title"), content: t("wizard.guidance.source_tax.accordion_2.content") },
          { title: t("wizard.guidance.source_tax.accordion_3.title"), content: t("wizard.guidance.source_tax.accordion_3.content") },
        ]
      };

    case "employment_setup":
      return {
        icon: PenLine,
        title: is90days ? t("wizard.guidance.employment_setup.title_90days") : t("wizard.guidance.employment_setup.title"),
        body: t("wizard.guidance.employment_setup.body"),
        accordions: [
          { title: t("wizard.guidance.employment_setup.accordion_1.title"), content: t("wizard.guidance.employment_setup.accordion_1.content") },
          { title: t("wizard.guidance.employment_setup.accordion_2.title"), content: t("wizard.guidance.employment_setup.accordion_2.content") },
          { title: t("wizard.guidance.employment_setup.accordion_3.title"), content: t("wizard.guidance.employment_setup.accordion_3.content") },
        ]
      };

    case "self_employed":
      return {
        icon: Building2,
        title: t("wizard.guidance.self_employed.title"),
        body: t("wizard.guidance.self_employed.body"),
        accordions: [
          { title: t("wizard.guidance.self_employed.accordion_1.title"), content: t("wizard.guidance.self_employed.accordion_1.content") },
          { title: t("wizard.guidance.self_employed.accordion_2.title"), content: t("wizard.guidance.self_employed.accordion_2.content") },
          { title: t("wizard.guidance.self_employed.accordion_3.title"), content: t("wizard.guidance.self_employed.accordion_3.content") },
        ]
      };

    case "self_employed_agreement":
      return {
        icon: PenLine,
        title: t("wizard.guidance.self_employed_agreement.title"),
        body: t("wizard.guidance.self_employed_agreement.body"),
        accordions: [
          { title: t("wizard.guidance.self_employed_agreement.accordion_1.title"), content: t("wizard.guidance.self_employed_agreement.accordion_1.content") },
          { title: t("wizard.guidance.self_employed_agreement.accordion_2.title"), content: t("wizard.guidance.self_employed_agreement.accordion_2.content") },
        ]
      };

    case "congratulations":
      return {
        icon: Trophy,
        title: t("wizard.guidance.congratulations.title"),
        body: t("wizard.guidance.congratulations.body"),
        accordions: [
          { title: t("wizard.guidance.congratulations.accordion_1.title"), content: t("wizard.guidance.congratulations.accordion_1.content") },
          { title: t("wizard.guidance.congratulations.accordion_2.title"), content: t("wizard.guidance.congratulations.accordion_2.content") },
        ]
      };

    default:
      return {
        icon: Lightbulb,
        title: t("wizard.guidance.default.title"),
        body: t("wizard.guidance.default.body"),
        accordions: []
      };
  }
}

function GuidancePanel({ mode, stepId, profile }) {
  const { t } = useI18n();
  const content = getStepContent(stepId, profile, t);

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5 sticky top-24">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
          {mode === "guided"
            ? <User className="w-4 h-4 text-[#FF3CAC]" />
            : React.createElement(content.icon, { className: "w-4 h-4 text-[#FF3CAC]" })
          }
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {mode === "guided" ? t("wizard.guided_notes_title") : content.title}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        {mode === "guided"
          ? t("wizard.guided_notes_body")
          : content.body}
      </p>

      {!mode || mode !== "guided" ? (
        content.accordions?.map((acc, i) => (
          <AccordionItem key={i} title={acc.title}>
            {acc.content.split('\n').map((line, j) => <p key={j} className="mb-1">{line}</p>)}
          </AccordionItem>
        ))
      ) : null}

      <div className="mt-4 p-3 bg-pink-50 rounded-xl border border-pink-100">
        <p className="text-xs font-medium text-[#6B0064] flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> {t("wizard.privacy_title")}</p>
        <p className="text-xs text-[#6B0064] opacity-80 mt-1">{t("wizard.privacy_body")}</p>
      </div>
    </div>
  );
}