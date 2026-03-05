import React from "react";
import { differenceInDays, parseISO, addDays, format } from "date-fns";
import { de } from "date-fns/locale";

export default function NinetyDayTracker({ profile }) {
  const startDate = profile.submitted_at ? parseISO(profile.submitted_at) : null;
  if (!startDate) {
    return <p className="text-xs text-gray-400">Startdatum nicht verfügbar.</p>;
  }

  const endDate = addDays(startDate, 90);
  const today = new Date();
  const daysRemaining = Math.max(0, differenceInDays(endDate, today));
  const daysPassed = Math.min(90, differenceInDays(today, startDate));
  const progress = Math.round((daysPassed / 90) * 100);

  const isExpiringSoon = daysRemaining <= 14 && daysRemaining > 0;
  const isEnded = daysRemaining === 0;

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div>
          <p className="text-xs text-gray-400">Startdatum</p>
          <p className="font-medium text-gray-800">{format(startDate, "dd. MMM yyyy", { locale: de })}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Enddatum</p>
          <p className="font-medium text-gray-800">{format(endDate, "dd. MMM yyyy", { locale: de })}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">{daysPassed} von 90 Tagen</span>
          <span className={`text-xs font-semibold ${isEnded ? "text-red-600" : isExpiringSoon ? "text-orange-600" : "text-[#FF3CAC]"}`}>
            {isEnded ? "Abgelaufen" : `Noch ${daysRemaining} Tage`}
          </span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isEnded ? "bg-red-400" : isExpiringSoon ? "bg-orange-400" : "bg-gradient-to-r from-[#FF3CAC] to-pink-400"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isExpiringSoon && !isEnded && (
        <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
          ⏳ Dein 90-Tage-Modell läuft bald ab. Bitte kontaktiere uns für einen Wechsel zur unbefristeten Anstellung.
        </div>
      )}
      {isEnded && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          ⚠️ Die 90-Tage-Periode ist abgelaufen. Bitte kontaktiere den Support umgehend.
        </div>
      )}
    </div>
  );
}