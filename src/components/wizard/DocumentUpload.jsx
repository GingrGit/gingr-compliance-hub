import React, { useState } from "react";
import { Upload, CheckCircle2, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";

export default function DocumentUpload({ label, value, onChange, hint, profileId, documentType, disableDelete = false }) {
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setFileName(file.name);

    await new Promise((r) => setTimeout(r, 800));
    onChange(file);
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
                <p className="text-sm text-gray-500">{t("document_upload.uploading")}</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">{t("document_upload.select_file")}</p>
                <p className="text-xs text-gray-400 mt-1">{t("document_upload.file_types")}</p>
              </>
            )}
          </div>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
        </label>
      ) : (
        <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-800">{fileName || value?.name || t("document_upload.uploaded_label")}</span>
          </div>
          {!disableDelete && (
            <button
              onClick={() => {
                onChange("");
                setFileName("");
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {hint && (
        <div className="mt-2 space-y-1">
          {[t("document_upload.quality_check1"), t("document_upload.quality_check2"), t("document_upload.quality_check3")].map((c) => (
            <p key={c} className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" /> {c}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}