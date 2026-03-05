import React from "react";
import { FileText, Download, Clock, ArrowDownToLine } from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

function formatPeriod(period) {
  if (!period) return null;
  // Try to parse "2025-03" format
  try {
    const [year, month] = period.split("-");
    if (year && month) {
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return format(date, "MMMM yyyy", { locale: de });
    }
  } catch (_) {}
  return period;
}

export default function DocumentList({ documents, emptyText = "Noch keine Dokumente vorhanden." }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-3 px-1">
        <Clock className="w-4 h-4 flex-shrink-0" />
        <span>{emptyText}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <a
          key={doc.id}
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-pink-50 border border-transparent hover:border-pink-100 rounded-xl transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-200 transition-colors">
            <FileText className="w-5 h-5 text-[#FF3CAC]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{doc.label}</p>
            {doc.period && (
              <p className="text-xs text-gray-400 mt-0.5">{formatPeriod(doc.period)}</p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-[#FF3CAC] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowDownToLine className="w-4 h-4" />
            <span className="hidden sm:inline">Herunterladen</span>
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:border-pink-200 group-hover:bg-pink-50 transition-colors">
            <Download className="w-4 h-4 text-gray-400 group-hover:text-[#FF3CAC] transition-colors" />
          </div>
        </a>
      ))}
    </div>
  );
}