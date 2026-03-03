import React from "react";
import { FileText, CheckCircle2, XCircle, ExternalLink, AlertCircle } from "lucide-react";

const STATUS_CONFIG = {
  not_required:           { label: "Nicht erforderlich", color: "text-gray-400", icon: null },
  uploaded_review_pending:{ label: "Prüfung ausstehend", color: "text-amber-500", icon: AlertCircle },
  approved:               { label: "Genehmigt",          color: "text-green-600", icon: CheckCircle2 },
  missing:                { label: "Fehlt / Abgelehnt",  color: "text-red-500",   icon: XCircle },
  uploaded:               { label: "Hochgeladen",         color: "text-blue-500",  icon: CheckCircle2 },
};

export default function DocumentRow({ label, url, status, onApprove, onReject }) {
  const cfg = STATUS_CONFIG[status] || { label: "Nicht vorhanden", color: "text-gray-300", icon: null };
  const Icon = cfg.icon;

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <FileText className="w-4 h-4 text-gray-300 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {status && (
            <div className={`flex items-center gap-1 ${cfg.color}`}>
              {Icon && <Icon className="w-3 h-3" />}
              <span className="text-xs">{cfg.label}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg"
          >
            <ExternalLink className="w-3 h-3" /> Öffnen
          </a>
        )}
        {onApprove && url && (
          <button
            onClick={onApprove}
            className="text-xs text-green-600 hover:text-green-800 border border-green-200 px-2.5 py-1 rounded-lg"
          >
            ✓ OK
          </button>
        )}
        {onReject && url && (
          <button
            onClick={onReject}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2.5 py-1 rounded-lg"
          >
            ✗ Ablehnen
          </button>
        )}
        {!url && <span className="text-xs text-gray-300">Nicht hochgeladen</span>}
      </div>
    </div>
  );
}