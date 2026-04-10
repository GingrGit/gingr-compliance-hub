import React, { useState } from "react";
import StepCard from "@/components/wizard/StepCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { saveEarningsProgress } from "@/lib/gingrOnboardingApi";

const SOCIAL_RATE = 0.1098;   // 10.98% employee social + pension
const PLATFORM_RATE = 0.15;   // 15% platform + employer costs
const SOURCE_TAX_RATE = 0.10; // 10% estimate
const QUITT_FEE = 50;         // CHF 50/month

function computeDefaultSourceTax(profile) {
  const { citizenship_group, permit_type, work_model } = profile;
  if (citizenship_group === "CH" || permit_type === "C") return "no";
  if (permit_type === "B" || permit_type === "L" || work_model === "employee_90days") return "yes";
  return "unsure";
}

function calcEarnings(hourlyRate, hoursPerMonth, sourceTax) {
  const rate = parseFloat(hourlyRate) || 0;
  const hours = parseFloat(hoursPerMonth) || 0;

  const social = rate * SOCIAL_RATE;
  const platform = rate * PLATFORM_RATE;
  const subtotal = rate - social - platform;
  const stAmount = (sourceTax === "yes" || sourceTax === "unsure") ? subtotal * SOURCE_TAX_RATE : 0;
  const netHourly = subtotal - stAmount;
  const netMonthly = netHourly * hours - (hours > 0 ? QUITT_FEE : 0);

  return { rate, hours, social, platform, subtotal, stAmount, netHourly, netMonthly };
}

function fmt(n) {
  return n.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StepEarnings({ profile, onNext, onBack, onSaveAndExit, saving }) {
  const { t } = useI18n();
  const defaultST = computeDefaultSourceTax(profile);
  const normalizedSourceTax = typeof profile.source_tax === "string"
    ? profile.source_tax.toLowerCase()
    : profile.source_tax;
  const [hourlyRate, setHourlyRate] = useState(profile.hourly_rate || "");
  const [hoursPerMonth, setHoursPerMonth] = useState(profile.hours_per_month || "");
  const [sourceTax, setSourceTax] = useState(normalizedSourceTax || defaultST);
  const [expanded, setExpanded] = useState(false);

  const hasRate = parseFloat(hourlyRate) > 0;
  const c = calcEarnings(hourlyRate, hoursPerMonth, sourceTax);
  const applySourceTax = sourceTax === "yes" || sourceTax === "unsure";

  const handleNext = async () => {
    await saveEarningsProgress({ hourlyRate, hoursPerMonth, sourceTax });
    onNext({ hourly_rate: hourlyRate, hours_per_month: hoursPerMonth, source_tax: sourceTax });
  };

  return (
    <StepCard
      title={t("step_earnings.title")}
      subtitle={t("step_earnings.subtitle")}
      onNext={handleNext}
      onBack={onBack}
      onSaveAndExit={onSaveAndExit}
      saving={saving}
    >
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">{t("step_earnings.label_hourly_rate")}</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">CHF</span>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="pl-12"
              placeholder={t("step_earnings.placeholder_rate")}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{t("step_earnings.hint_rate")}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">{t("step_earnings.label_hours_per_month")}</Label>
          <div className="relative mt-1">
            <Input
              type="number"
              value={hoursPerMonth}
              onChange={(e) => setHoursPerMonth(e.target.value)}
              placeholder={t("step_earnings.placeholder_hours")}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{t("step_earnings.hint_hours")}</p>
        </div>
      </div>

      {/* Source Tax toggle */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">{t("step_earnings.source_tax_label")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { v: "yes", l: t("step_earnings.source_tax_yes"), d: t("step_earnings.source_tax_yes_sub") },
            { v: "no", l: t("step_earnings.source_tax_no"), d: t("step_earnings.source_tax_no_sub") },
            { v: "unsure", l: t("step_earnings.source_tax_unsure"), d: t("step_earnings.source_tax_unsure_sub") },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setSourceTax(opt.v)}
              className={`rounded-xl border-2 p-3 text-sm text-center transition-all ${sourceTax === opt.v ? "border-[#FF3CAC] bg-pink-50 text-[#6B0064]" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}
            >
              <p className="font-semibold">{opt.l}</p>
              <p className="text-xs mt-0.5 text-gray-500">{opt.d}</p>
            </button>
          ))}
        </div>
        {defaultST !== sourceTax && (
          <p className="text-xs text-[#6B0064] opacity-70 mt-2">
            💡 Aufgrund deiner Situation empfehlen wir: „{defaultST === "yes" ? "Ja" : defaultST === "no" ? "Nein" : "Nicht sicher"}"
          </p>
        )}
      </div>

      {/* Results */}
      {hasRate && (
        <div className="rounded-2xl border border-pink-200 overflow-hidden">
          {/* Summary always visible */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t("step_earnings.net_hourly_label")}</p>
                <p className="text-3xl font-bold text-[#6B0064]">CHF {fmt(c.netHourly)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t("step_earnings.net_hourly_sub")}</p>
              </div>
              {c.hours > 0 && (
                <div className="text-center sm:text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t("step_earnings.net_monthly_label")}</p>
                  <p className="text-3xl font-bold text-[#FF3CAC]">CHF {fmt(c.netMonthly)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t("step_earnings.net_monthly_sub")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Expandable breakdown */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border-t border-pink-100 text-sm font-medium text-[#6B0064] hover:bg-pink-50 transition-colors"
          >
            <span>{t("step_earnings.breakdown_toggle")}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="bg-white border-t border-pink-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-2 text-xs text-gray-500 font-semibold">Posten</th>
                    <th className="text-right px-4 py-2 text-xs text-gray-500 font-semibold">Betrag (CHF)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-gray-800">Kundenpreis (pro Stunde)</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{fmt(c.rate)}</td>
                  </tr>
                  <tr className="text-gray-600">
                    <td className="px-4 py-2.5">Arbeitnehmer Sozial- & Pensionsbeiträge (10.98%)</td>
                    <td className="px-4 py-2.5 text-right text-red-600">−{fmt(c.social)}</td>
                  </tr>
                  <tr className="text-gray-600">
                    <td className="px-4 py-2.5">Platform + Lohnabrechnung & Arbeitgeberkosten (15%)</td>
                    <td className="px-4 py-2.5 text-right text-red-600">−{fmt(c.platform)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2.5 font-semibold text-gray-800">Zwischensumme (vor Quellensteuer)</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{fmt(c.subtotal)}</td>
                  </tr>
                  {applySourceTax && (
                    <tr className="text-gray-600">
                      <td className="px-4 py-2.5 italic">
                        Quellensteuer {sourceTax === "unsure" ? "(Schätzung" : "(Schätzung"} — 10%{sourceTax === "unsure" ? ", nicht sicher" : ""})
                      </td>
                      <td className="px-4 py-2.5 text-right text-red-600">−{fmt(c.stAmount)}</td>
                    </tr>
                  )}
                  <tr className="bg-pink-50">
                    <td className="px-4 py-2.5 font-bold text-[#6B0064]">Geschätzter Nettolohn pro Stunde</td>
                    <td className="px-4 py-2.5 text-right font-bold text-[#6B0064]">{fmt(c.netHourly)}</td>
                  </tr>
                  {c.hours > 0 && (
                    <>
                      <tr className="text-gray-600 border-t border-gray-200">
                        <td className="px-4 py-2.5">× {c.hours} Stunden/Monat</td>
                        <td className="px-4 py-2.5 text-right">{fmt(c.netHourly * c.hours)}</td>
                      </tr>
                      <tr className="text-gray-600">
                        <td className="px-4 py-2.5">QUITT-Verwaltungsgebühr/Monat</td>
                        <td className="px-4 py-2.5 text-right text-red-600">−{fmt(QUITT_FEE)}</td>
                      </tr>
                      <tr className="bg-gradient-to-r from-pink-50 to-purple-50">
                        <td className="px-4 py-2.5 font-bold text-[#6B0064]">Geschätzter Monatsnettolohn</td>
                        <td className="px-4 py-2.5 text-right font-bold text-[#6B0064]">{fmt(c.netMonthly)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
              <p className="px-4 py-3 text-xs text-gray-500 italic border-t border-gray-100 bg-gray-50">
                „Sozial- & Pensionsbeiträge finanzieren deinen Schutz — sie sind keine Plattformgebühr."
              </p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        {t("step_earnings.footnote")}
      </p>
    </StepCard>
  );
}