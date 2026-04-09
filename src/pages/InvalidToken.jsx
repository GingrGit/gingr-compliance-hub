import React from "react";
import { ShieldAlert, ArrowLeft, RefreshCw } from "lucide-react";

export default function InvalidToken() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white border border-pink-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-8 h-8 text-[#FF3CAC]" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Invalid or expired link</h1>
        <p className="text-sm text-gray-500 leading-6 mb-8">
          This access link is no longer valid. Please request a new link or go back and try again.
        </p>

        <div className="space-y-3">
          <a
            href="/MagicLinkLogin"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#FF3CAC] hover:bg-[#e0309a] text-white text-sm font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Request new link
          </a>

          <button
            onClick={() => window.history.back()}
            className="w-full inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}