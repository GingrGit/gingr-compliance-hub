import React from "react";
import { FileCheck2 } from "lucide-react";
import { getGingrBaseUrl } from "@/lib/env";

export default function AlreadySubmitted() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white border border-pink-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mx-auto mb-5">
          <FileCheck2 className="w-8 h-8 text-[#FF3CAC]" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Form already submitted</h1>
        <p className="text-sm text-gray-500 leading-6 mb-8">
          This onboarding form has already been submitted and can no longer be edited here.
        </p>

        <a
          href={getGingrBaseUrl()}
          className="w-full inline-flex items-center justify-center bg-[#FF3CAC] hover:bg-[#e0309a] text-white text-sm font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          Back to Gingr
        </a>
      </div>
    </div>
  );
}