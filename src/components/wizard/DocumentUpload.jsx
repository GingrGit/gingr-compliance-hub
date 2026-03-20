import React, { useState } from "react";
import { Upload, CheckCircle2, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const QUALITY_CHECKS = [
  "Alle Ecken sichtbar",
  "Text gut lesbar",
  "Dokument nicht abgelaufen",
];

export default function DocumentUpload({ label, value, onChange, hint, profileId, documentType }) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('profile_id', profileId || 'unknown');
    formData.append('document_type', documentType || 'other');

    const response = await base44.functions.invoke('uploadToGingrS3', formData);
    onChange(response.data.s3_key);
    setUploading(false);
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>

      {!value ? (
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 hover:border-rose-400 rounded-xl p-6 text-center transition-colors">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
                <p className="text-sm text-gray-500">Wird hochgeladen…</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Datei auswählen oder hier ablegen</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG oder PNG</p>
              </>
            )}
          </div>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
        </label>
      ) : (
        <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-800">{fileName || "Dokument hochgeladen"}</span>
          </div>
          <button
            onClick={() => { onChange(""); setFileName(""); }}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {hint && (
        <div className="mt-2 space-y-1">
          {QUALITY_CHECKS.map((c) => (
            <p key={c} className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" /> {c}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}