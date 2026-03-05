import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardTile({ icon: Icon, iconBg = "bg-purple-100", iconColor = "text-purple-600", title, subtitle, status, children, primaryAction, secondaryAction, unavailable = false }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("bg-white rounded-2xl border shadow-sm overflow-hidden transition-all", unavailable ? "border-gray-100 opacity-60" : "border-gray-200 hover:border-pink-200 hover:shadow-md")}>
      <button
        className="w-full text-left p-5 flex items-center gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconBg || "bg-pink-100")}>
          <Icon className={cn("w-5 h-5", iconColor || "text-[#FF3CAC]")} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{title}</span>
            {status}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          {children && <div className="mb-4">{children}</div>}
          <div className="flex flex-wrap gap-2">
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className="flex-1 sm:flex-none bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white text-sm font-medium rounded-xl px-4 py-2 transition-colors"
              >
                {primaryAction.label}
              </button>
            )}
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled}
                className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-sm font-medium rounded-xl px-4 py-2 transition-colors"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}