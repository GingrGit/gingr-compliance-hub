import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutDashboard, FileText, Bell, PenLine } from "lucide-react";

const GINGR_URL = "https://www.gingr.ch";

export default function StepCongratulations({ profile, profileId }) {
  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-8 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Vielen Dank! 🎉</h2>
      <p className="text-gray-600 text-sm mb-1">
        Wir haben alle deine Angaben erhalten.
      </p>
      <p className="text-gray-500 text-sm mb-7">
        Unser Team prüft jetzt deine Unterlagen. Sobald alles verifiziert ist, wirst du von uns per <strong>SMS und E-Mail</strong> benachrichtigt.
      </p>

      {/* What happens next */}
      <div className="bg-pink-50 border border-pink-100 rounded-xl p-5 text-left mb-7 space-y-4">
        <p className="text-xs font-semibold text-[#6B0064] uppercase tracking-wide">Was jetzt passiert</p>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText className="w-3 h-3 text-[#6B0064]" />
          </div>
          <p className="text-sm text-gray-700">Wir prüfen deine Angaben und Dokumente — das dauert in der Regel 1–2 Werktage.</p>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <PenLine className="w-3 h-3 text-[#6B0064]" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              {profile?.work_model === "self_employed"
                ? <>Du erhältst per <strong>SMS/E-Mail</strong> einen Link zu deiner <strong>Zusammenarbeitsvereinbarung</strong>, die du digital unterzeichnen kannst.</>
                : <>Du erhältst per <strong>SMS/E-Mail</strong> einen Link zu deinem <strong>Arbeitsvertrag</strong>, den du digital unterzeichnen kannst.</>
              }
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <LayoutDashboard className="w-3 h-3 text-[#6B0064]" />
          </div>
          <p className="text-sm text-gray-700">Den Status deines Antrags und deine Dokumente findest du jederzeit auf <strong>gingr.ch</strong> in deinem Profil.</p>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Bell className="w-3 h-3 text-[#6B0064]" />
          </div>
          <p className="text-sm text-gray-700">Sobald der Vertrag unterzeichnet ist, wird dein Profil auf gingr.ch aktiviert — ab dem vereinbarten Startdatum kannst du legal arbeiten. 🎉</p>
        </div>
      </div>

      <a href={GINGR_URL}>
        <Button className="w-full bg-[#FF3CAC] hover:bg-[#e030a0] text-white rounded-full py-3 text-base font-semibold shadow-md">
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Zurück zu gingr.ch
        </Button>
      </a>
    </div>
  );
}