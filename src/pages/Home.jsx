import { motion } from "framer-motion";
import { ShieldCheck, FolderLock } from "lucide-react";
import LogoHeader from "@/components/home/LogoHeader";
import ActionCard from "@/components/home/ActionCard";
import { createPageUrl } from "@/utils";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F0F0F0]">
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <LogoHeader />
        </motion.div>

        {/* Cards */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionCard
            icon={ShieldCheck}
            iconBg="bg-pink-100"
            iconColor="text-[#F49FFC]"
            title="Start Legal Onboarding"
            description="Complete your compliance steps to unlock secure booking and your legal setup."
            buttonLabel="Start Onboarding"
            onClick={() => window.location.href = createPageUrl("OnboardingWizard")}
          />
          <ActionCard
            icon={FolderLock}
            iconBg="bg-pink-50"
            iconColor="text-[#6B0064]"
            title="Access My Documents"
            description="Log in to view your contracts, status, and uploaded documents."
            buttonLabel="Log In"
            onClick={() => window.location.href = createPageUrl("MagicLinkLogin")}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400 flex items-center justify-center gap-3">
        <span>© {new Date().getFullYear()} Gingr</span>
        <span>·</span>
        <a
          href="mailto:support@gingr.ch"
          className="hover:text-[#6B0064] transition-colors"
        >
          Need help?
        </a>
      </footer>
    </div>
  );
}