import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function MagicLinkLogin() {
  const [method, setMethod] = useState(null); // "sms" | "email"
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    setError("");
    if (!value.trim()) {
      setError(method === "sms" ? "Bitte gib deine Mobilnummer ein." : "Bitte gib deine E-Mail-Adresse ein.");
      return;
    }
    setLoading(true);

    // We need to find the profile by phone or email to get the profile_id
    const allProfiles = await base44.entities.OnboardingProfile.list("-created_date", 200);
    const profile = allProfiles.find(p =>
      method === "sms"
        ? p.phone === value.trim()
        : p.escort_email?.toLowerCase() === value.trim().toLowerCase()
    );

    if (!profile) {
      setError(method === "sms"
        ? "Keine registrierte Mobilnummer gefunden. Bitte wende dich an den Support."
        : "Keine registrierte E-Mail-Adresse gefunden. Bitte wende dich an den Support."
      );
      setLoading(false);
      return;
    }

    await base44.functions.invoke("sendMagicLink", {
      profile_id: profile.id,
      phone: method === "sms" ? value.trim() : null,
      email: method === "email" ? value.trim() : null,
      app_url: window.location.origin,
    });

    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F0F0] px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/e355eb65f_GingrLogo4x.png"
            alt="Gingr"
            className="h-10 object-contain"
          />
          <span className="text-xs text-gray-400 font-medium mt-1">Legal Onboarding</span>
        </div>

        <AnimatePresence mode="wait">
          {/* Sent confirmation */}
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-pink-100 shadow-sm p-8 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Link gesendet!</h2>
              <p className="text-sm text-gray-500">
                {method === "sms"
                  ? `Wir haben dir einen Link per SMS an ${value} geschickt. Klicke darauf, um dein Dashboard zu öffnen.`
                  : `Wir haben dir einen Link per E-Mail an ${value} geschickt. Klicke darauf, um dein Dashboard zu öffnen.`
                }
              </p>
              <button
                onClick={() => { setSent(false); setMethod(null); setValue(""); }}
                className="mt-6 text-xs text-gray-400 hover:text-[#FF3CAC] transition-colors"
              >
                Anderen Weg verwenden
              </button>
            </motion.div>

          ) : !method ? (
            /* Method selection */
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-2xl border border-pink-100 shadow-sm p-8"
            >
              <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">Zugang zu deinen Dokumenten</h1>
              <p className="text-sm text-gray-500 text-center mb-6">Wähle, wie du deinen Magic Link erhalten möchtest.</p>

              <div className="space-y-3">
                <button
                  onClick={() => setMethod("sms")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#FF3CAC] hover:bg-pink-50 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#FF3CAC]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Via SMS</p>
                    <p className="text-xs text-gray-400">Link an deine Mobilnummer senden</p>
                  </div>
                </button>

                <button
                  onClick={() => setMethod("email")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#FF3CAC] hover:bg-pink-50 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#FF3CAC]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Via E-Mail</p>
                    <p className="text-xs text-gray-400">Link an deine E-Mail-Adresse senden</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => window.location.href = createPageUrl("Home")}
                className="mt-6 flex items-center gap-1 text-xs text-gray-400 hover:text-[#FF3CAC] transition-colors mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Zurück zur Startseite
              </button>
            </motion.div>

          ) : (
            /* Input */
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-2xl border border-pink-100 shadow-sm p-8"
            >
              <button
                onClick={() => { setMethod(null); setValue(""); setError(""); }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#FF3CAC] transition-colors mb-6"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Zurück
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                  {method === "sms"
                    ? <MessageCircle className="w-5 h-5 text-[#FF3CAC]" />
                    : <Mail className="w-5 h-5 text-[#FF3CAC]" />
                  }
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {method === "sms" ? "Mobilnummer eingeben" : "E-Mail-Adresse eingeben"}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {method === "sms" ? "Wir senden dir einen Link per SMS." : "Wir senden dir einen Link per E-Mail."}
                  </p>
                </div>
              </div>

              <input
                type={method === "sms" ? "tel" : "email"}
                placeholder={method === "sms" ? "+41 79 123 45 67" : "deine@email.com"}
                value={value}
                onChange={e => { setValue(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 mb-2"
              />

              {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

              <button
                onClick={handleSend}
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#FF3CAC] hover:bg-[#e0309a] disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Senden…" : "Magic Link senden"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}