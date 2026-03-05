import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

export default function InfoAccordion({ title = "Mehr erfahren", children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-pink-50 border border-pink-100 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#6B0064] hover:bg-pink-100 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#FF3CAC]" />
          {title}
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-sm text-[#6B0064] leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}