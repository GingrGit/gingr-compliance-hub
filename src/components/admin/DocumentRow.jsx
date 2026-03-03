import React from "react";
import { FileText, CheckCircle2, XCircle, ExternalLink, AlertCircle, Minus } from "lucide-react";

const STATUS_CONFIG = {
  not_required:            { label: "Nicht erforderlich", color: "text-gray-400",   bg: "bg-gray-50",   icon: Minus },
  uploaded_review_pending: { label: "Prüfung ausstehend", color: "text-amber-600",  bg: "bg-amber-50",  icon: AlertCircle },
  approved:                { label: "Genehmigt",           color: "text-green-600",  bg: "bg-green-50",  icon: CheckCircle2 },
  missing:                 { label: "Fehlt / Abgelehnt",   color: "text-red-500",    bg: "bg-red-50",    icon: XCircle },
  uploaded:                { label: "Hochgeladen",          color: "text-blue-600",   bg: "bg-blue-50",   icon: CheckCircle2 },
};

export default function DocumentRow({ label, url, status, onApprove, onReject }) {
  const cfg = STATUS_CONFIG[status] || { label: "Nicht hochgeladen", color: "text-gray-300", bg: "bg-gray-50", icon: null };
  const Icon = cfg.icon;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
          <FileText className={`w-4 h-4 ${cfg.color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {status && Icon && (
            <div className={`flex items-center gap-1 ${cfg.color}`}>
              <Icon className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs">{cfg.label}</span>
            </div>
          )}
          {!status && <span className="text-xs text-gray-300">Nicht hochgeladen</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 border border-purple-200 hover:border-purple-400 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors font-medium"
          >
            <ExternalLink className="w-3 h-3" /> Öffnen
          </a>
        )}
        {onApprove && url && status !== "approved" && (
          <button
            onClick={onApprove}
            className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 border border-green-200 hover:border-green-400 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors font-medium"
          >
            <CheckCircle2 className="w-3 h-3" /> OK
          </button>
        )}
        {onReject && url && status !== "missing" && (
          <button
            onClick={onReject}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors font-medium"
          >
            <XCircle className="w-3 h-3" /> Ablehnen
          </button>
        )}
      </div>
    </div>
  );
}