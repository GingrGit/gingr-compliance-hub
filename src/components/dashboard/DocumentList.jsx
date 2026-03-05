import React from "react";
import { FileText, Download, Clock } from "lucide-react";
import { format } from "date-fns";

export default function DocumentList({ documents, emptyText = "Noch keine Dokumente vorhanden." }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
        <Clock className="w-4 h-4" />
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-[#FF3CAC]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{doc.label}</p>
            {doc.period && (
              <p className="text-xs text-gray-400">{doc.period}</p>
            )}
          </div>
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-purple-50 hover:border-purple-200 transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500" />
          </a>
        </div>
      ))}
    </div>
  );
}