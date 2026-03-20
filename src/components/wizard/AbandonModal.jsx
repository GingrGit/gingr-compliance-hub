import React from "react";
import { Button } from "@/components/ui/button";
import { SaveIcon, ArrowRight } from "lucide-react";

export default function AbandonModal({ onContinue, onExit }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <SaveIcon className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Fortschritt gespeichert</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Wir haben alles gespeichert. Du kannst das Onboarding jederzeit mit dem Link aus deiner SMS fortsetzen.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={onContinue}
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl"
          >
            <ArrowRight className="w-4 h-4 mr-2" /> Weitermachen
          </Button>
          <Button variant="ghost" onClick={onExit} className="text-gray-500 text-sm">
            Beenden
          </Button>
        </div>
      </div>
    </div>
  );
}