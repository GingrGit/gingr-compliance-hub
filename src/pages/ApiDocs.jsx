import React, { useState } from "react";
import { Copy, CheckCircle2, Lock, FileText, User, Link } from "lucide-react";

const CODE_BG = "bg-gray-900 text-green-300 rounded-xl p-4 text-xs font-mono overflow-x-auto";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-2 text-gray-400 hover:text-white transition-colors"
    >
      {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function CodeBlock({ code }) {
  return (
    <div className="relative group">
      <pre className={CODE_BG}>{code}</pre>
      <div className="absolute top-3 right-3"><CopyButton text={code} /></div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">{icon}</div>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ParamRow({ name, type, required, desc }) {
  return (
    <tr className="border-t border-gray-100">
      <td className="py-2 pr-4 font-mono text-xs text-pink-700 whitespace-nowrap">{name}</td>
      <td className="py-2 pr-4 text-xs text-gray-500">{type}</td>
      <td className="py-2 pr-4 text-xs">{required ? <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">required</span> : <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px]">optional</span>}</td>
      <td className="py-2 text-xs text-gray-600">{desc}</td>
    </tr>
  );
}

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a69aeeacd958731b1cf96e/73e94775a_GingrLogo4x.png"
            alt="Gingr"
            className="h-10 object-contain mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900">Legal Onboarding API</h1>
          <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">
            Internal API documentation for integrating onboarding data into the gingr.ch main platform.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> v1.0 · Active
          </div>
        </div>

        {/* Auth */}
        <Section icon={<Lock className="w-4 h-4 text-pink-500" />} title="Authentication">
          <p className="text-sm text-gray-600 mb-3">
            All requests must include a valid API key in the HTTP header <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">x-api-key</code>.
            The key is securely managed as an environment variable on the server.
          </p>
          <CodeBlock code={`POST https://<function-url>/gingrApi
x-api-key: <GINGR_API_KEY>
Content-Type: application/json`} />
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800">
            ⚠️ Never store the API key in frontend code or public repositories. Use server-side only.
          </div>
        </Section>

        {/* Base URL */}
        <Section icon={<Link className="w-4 h-4 text-pink-500" />} title="Base URL">
          <p className="text-sm text-gray-600 mb-3">
            Find the function URL in the Base44 Dashboard under <strong>Code → Functions → gingrApi</strong>.
          </p>
          <CodeBlock code={`Base URL: https://<your-app>.base44.app/functions/gingrApi`} />
        </Section>

        {/* Action: get_profile */}
        <Section icon={<User className="w-4 h-4 text-pink-500" />} title="Action: get_profile">
          <p className="text-sm text-gray-600 mb-3">Gibt das vollständige Onboarding-Profil einer Escort zurück.</p>
          <table className="w-full mb-4">
            <thead><tr><th className="text-left text-xs text-gray-400 font-semibold pb-2">Parameter</th><th className="text-left text-xs text-gray-400 font-semibold pb-2">Typ</th><th className="text-left text-xs text-gray-400 font-semibold pb-2">Status</th><th className="text-left text-xs text-gray-400 font-semibold pb-2">Beschreibung</th></tr></thead>
            <tbody>
              <ParamRow name="action" type="string" required desc={`Muss "get_profile" sein`} />
              <ParamRow name="escort_email" type="string" required desc="E-Mail-Adresse der Escort" />
            </tbody>
          </table>
          <CodeBlock code={`// Request
{
  "action": "get_profile",
  "escort_email": "escort@example.com"
}

// Response
{
  "id": "abc123",
  "escort_email": "escort@example.com",
  "status": "approved",         // draft | submitted | approved | needs_action
  "work_model": "employee_unlimited", // employee_unlimited | employee_90days | self_employed
  "first_name": "Anna",
  "last_name": "Müller",
  "date_of_birth": "1995-06-15",
  "nationality": "DE",
  "citizenship_group": "EU_EFTA", // CH | EU_EFTA | NON_EU
  "address": "Bahnhofstrasse 10",
  "city": "Zürich",
  "postal_code": "8001",
  "phone": "+41791234567",
  "permit_type": "B",           // none | B | C | L | other
  "permit_status": "approved",  // not_required | uploaded_review_pending | approved | missing | expired
  "contract_signed": true,
  "contract_signed_at": "2026-01-15T10:30:00Z",
  "submitted_at": "2026-01-15T10:35:00Z",
  "employment_start_date": "2026-02-01",
  "prostitution_permit_status": "approved" // submitted | approved
}`} />
        </Section>

        {/* Action: get_documents */}
        <Section icon={<FileText className="w-4 h-4 text-pink-500" />} title="Action: get_documents">
          <p className="text-sm text-gray-600 mb-3">Gibt alle Dokumente einer Escort zurück (Lohnabrechnungen, Verträge, Permits, etc.).</p>
          <table className="w-full mb-4">
            <thead><tr><th className="text-left text-xs text-gray-400 font-semibold pb-2">Parameter</th><th className="text-left text-xs text-gray-400 font-semibold pb-2">Typ</th><th className="text-left text-xs text-gray-400 font-semibold pb-2">Status</th><th className="text-left text-xs text-gray-400 font-semibold pb-2">Beschreibung</th></tr></thead>
            <tbody>
              <ParamRow name="action" type="string" required desc={`Muss "get_documents" sein`} />
              <ParamRow name="escort_email" type="string" required desc="E-Mail-Adresse der Escort" />
            </tbody>
          </table>
          <CodeBlock code={`// Request
{
  "action": "get_documents",
  "escort_email": "escort@example.com"
}

// Response
{
  "profile_id": "abc123",
  "documents": [
    {
      "id": "doc456",
      "type": "payslip",          // payslip | vat_statement | monthly_statement | contract | permit | other
      "label": "Lohnabrechnung März 2026",
      "period": "2026-03",
      "status": "available",      // available | pending | archived
      "file_url": "https://...",  // Öffentliche URL (falls vorhanden)
      "uploaded_by_admin": true,
      "created_date": "2026-03-01T08:00:00Z"
    }
  ]
}`} />
        </Section>

        {/* Action: get_signed_url */}
        <Section icon={<Lock className="w-4 h-4 text-pink-500" />} title="Action: get_signed_url">
          <p className="text-sm text-gray-600 mb-3">
            Generiert eine temporäre, signierte URL für den sicheren Zugriff auf ein privates Dokument. Gültig für <strong>300 Sekunden</strong>.
          </p>
          <table className="w-full mb-4">
            <thead><tr><th className="text-left text-xs text-gray-400 font-semibold pb-2">Parameter</th><th className="text-left text-xs text-gray-400 font-semibold pb-2">Typ</th><th className="text-left text-xs text-gray-400 font-semibold pb-2">Status</th><th className="text-left text-xs text-gray-400 font-semibold pb-2">Beschreibung</th></tr></thead>
            <tbody>
              <ParamRow name="action" type="string" required desc={`Muss "get_signed_url" sein`} />
              <ParamRow name="document_uri" type="string" required desc="Private Datei-URI (aus get_documents Antwort)" />
            </tbody>
          </table>
          <CodeBlock code={`// Request
{
  "action": "get_signed_url",
  "document_uri": "private://uploads/doc456.pdf"
}

// Response
{
  "signed_url": "https://storage.base44.app/signed/...?token=xyz&expires=...",
  "expires_in": 300
}`} />
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
            💡 Signierte URLs sollten on-demand generiert und nie gecacht werden, da sie nach 300 Sekunden ablaufen.
          </div>
        </Section>

        {/* Error codes */}
        <Section icon={<span className="text-base">⚠️</span>} title="Fehlercodes">
          <table className="w-full text-sm">
            <thead><tr><th className="text-left text-xs text-gray-400 font-semibold pb-2">HTTP Status</th><th className="text-left text-xs text-gray-400 font-semibold pb-2">Bedeutung</th></tr></thead>
            <tbody>
              {[
                ["200", "Erfolg"],
                ["400", "Fehlende oder ungültige Parameter"],
                ["401", "Ungültiger oder fehlender API-Schlüssel"],
                ["404", "Profil nicht gefunden"],
                ["500", "Interner Serverfehler"],
              ].map(([code, desc]) => (
                <tr key={code} className="border-t border-gray-100">
                  <td className="py-2 pr-4 font-mono text-xs text-pink-700">{code}</td>
                  <td className="py-2 text-xs text-gray-600">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <p className="text-center text-xs text-gray-400 pb-10">Gingr Legal Onboarding API · Intern · Nicht öffentlich zugänglich</p>
      </div>
    </div>
  );
}