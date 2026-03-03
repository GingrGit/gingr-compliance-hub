import React from "react";
import { CheckCircle2, Clock, AlertTriangle, MinusCircle, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

const CHIP_CONFIG = {
  active: {
    icon: CheckCircle2,
    label: "Aktiv",
    className: "bg-green-50 text-green-700 border-green-200",
    iconClass: "text-green-500",
  },
  approved: {
    icon: CheckCircle2,
    label: "Genehmigt",
    className: "bg-green-50 text-green-700 border-green-200",
    iconClass: "text-green-500",
  },
  available: {
    icon: CheckCircle2,
    label: "Verfügbar",
    className: "bg-green-50 text-green-700 border-green-200",
    iconClass: "text-green-500",
  },
  up_to_date: {
    icon: CheckCircle2,
    label: "Aktuell",
    className: "bg-green-50 text-green-700 border-green-200",
    iconClass: "text-green-500",
  },
  in_progress: {
    icon: CheckCircle2,
    label: "Läuft",
    className: "bg-green-50 text-green-700 border-green-200",
    iconClass: "text-green-500",
  },
  review_pending: {
    icon: Clock,
    label: "Prüfung ausstehend",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    iconClass: "text-blue-400",
  },
  pending: {
    icon: Clock,
    label: "Ausstehend",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    iconClass: "text-blue-400",
  },
  not_yet_available: {
    icon: Clock,
    label: "Noch nicht verfügbar",
    className: "bg-gray-50 text-gray-600 border-gray-200",
    iconClass: "text-gray-400",
  },
  action_required: {
    icon: AlertTriangle,
    label: "Aktion erforderlich",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    iconClass: "text-amber-500",
  },
  expires_soon: {
    icon: Timer,
    label: "Läuft bald ab",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    iconClass: "text-orange-500",
  },
  not_available: {
    icon: MinusCircle,
    label: "Nicht verfügbar",
    className: "bg-gray-50 text-gray-400 border-gray-200",
    iconClass: "text-gray-400",
  },
  not_required: {
    icon: MinusCircle,
    label: "Nicht erforderlich",
    className: "bg-gray-50 text-gray-400 border-gray-200",
    iconClass: "text-gray-400",
  },
};

export default function StatusChip({ status, customLabel }) {
  const config = CHIP_CONFIG[status] || CHIP_CONFIG.not_available;
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium", config.className)}>
      <Icon className={cn("w-3.5 h-3.5", config.iconClass)} />
      {customLabel || config.label}
    </span>
  );
}