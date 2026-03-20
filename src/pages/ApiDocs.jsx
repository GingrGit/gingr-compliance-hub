import React, { useState } from "react";
import { Copy, CheckCircle2, Lock, FileText, User, Link, Zap, ArrowRight, Info } from "lucide-react";

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

function Section({ icon, title, badge, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">{icon}</div>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        {badge && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function ParamRow({ name, type, required, desc }) {
  return (
    <tr className="border-t border-gray-100">
      <td className="py-2 pr-4 font-mono text-xs text-pink-700 whitespace-nowrap">{name}</td>
      <td className="py-2 pr-4 text-xs text-gray-500 whitespace-nowrap">{type}</td>
      <td className="py-2 pr-4 text-xs">
        {required
          ? <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">required</span>
          : <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px]">optional</span>}
      </td>
      <td className="py-2 text-xs text-gray-600">{desc}</td>
    </tr>
  );
}

function Note({ type = "info", children }) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warn: "bg-yellow-50 border-yellow-200 text-yellow-800",
    tip: "bg-green-50 border-green-200 text-green-800",
  };
  const icons = { info: "ℹ️", warn: "⚠️", tip: "💡" };
  return (
    <div className={`mt-3 p-3 border rounded-xl text-xs ${styles[type]}`}>
      {icons[type]} {children}
    </div>
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
            Internal API — used by gingr.ch to read onboarding profiles and documents collected during the legal onboarding wizard.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> v1.0 · Active
          </div>
        </div>

        {/* Workflow Overview */}
        <Section icon={<Zap className="w-4 h-4 text-pink-500" />} title="Workflow Overview">
          <p className="text-sm text-gray-600 mb-4">
            The onboarding process works as follows. gingr.ch initiates onboarding by sending a magic link via SMS.
            The escort completes the wizard. Afterwards, gingr.ch polls this API to read the result.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs text-gray-700">
            {[
              "1. gingr.ch creates an OnboardingProfile via create_profile",
              "2. SMS magic link sent to escort",
              "3. Escort completes wizard",
              "4. gingr.ch polls get_profile for status",
              "5. gingr.ch fetches documents via get_documents",
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <div className="bg-pink-50 border border-pink-100 rounded-xl px-3 py-2 text-center leading-snug">{step}</div>
                {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 rotate-90 sm:rotate-0" />}
              </React.Fragment>
            ))}
          </div>
        </Section>

        {/* Auth */}
        <Section icon={<Lock className="w-4 h-4 text-pink-500" />} title="Authentication">
          <p className="text-sm text-gray-600 mb-3">
            Every request must include the API key in the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">x-api-key</code> header.
          </p>
          <CodeBlock code={`POST https://<function-url>
x-api-key: <GINGR_API_KEY>
Content-Type: application/json

{ "action": "...", ... }`} />
          <Note type="warn">Never expose the API key in frontend code or public repositories. Server-side only.</Note>
        </Section>

        {/* Base URL */}
        <Section icon={<Link className="w-4 h-4 text-pink-500" />} title="Endpoint URL">
          <p className="text-sm text-gray-600 mb-3">
            The function URL is found in the Base44 Dashboard under <strong>Code → Functions → gingrApi</strong>.
            All actions are sent as <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">POST</code> requests to this single endpoint.
          </p>
          <CodeBlock code={`POST https://app-<id>.base44.app/api/functions/gingrApi`} />
        </Section>

        {/* Action: create_profile */}
        <Section icon={<User className="w-4 h-4 text-pink-500" />} title="Action: create_profile" badge="Step 1">
          <p className="text-sm text-gray-600 mb-3">
            Creates a new onboarding profile and returns the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">profile_id</code> and a magic link URL to send to the escort via SMS.
            KYC data pre-fills the wizard so the escort doesn't need to re-enter it.
          </p>
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Field</th>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Type</th>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Status</th>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <ParamRow name="action" type="string" required desc={`Must be "create_profile"`} />
              <ParamRow name="escort_email" type="string" required desc="Escort's email address (used as identifier)" />
              <ParamRow name="phone" type="string" required desc="Mobile number to send the magic link SMS to (E.164 format)" />
              <ParamRow name="first_name" type="string" required desc="From KYC — pre-fills wizard" />
              <ParamRow name="last_name" type="string" required desc="From KYC — pre-fills wizard" />
              <ParamRow name="date_of_birth" type="string" required desc="ISO date: YYYY-MM-DD — from KYC" />
              <ParamRow name="nationality" type="string" required desc="Country name (e.g. Deutschland) — from KYC" />
              <ParamRow name="citizenship_group" type="string" required desc="CH | EU_EFTA | NON_EU — from KYC" />
            </tbody>
          </table>
          <CodeBlock code={`// Request
{
  "action": "create_profile",
  "escort_email": "anna@example.com",
  "phone": "+41791234567",
  "first_name": "Anna",
  "last_name": "Müller",
  "date_of_birth": "1995-06-15",
  "nationality": "Deutschland",
  "citizenship_group": "EU_EFTA"
}

// Response
{
  "profile_id": "abc123",
  "magic_link": "https://app.base44.app/Magic?token=xyz",
  "status": "draft"
}`} />
          <Note type="info">Send the <code>magic_link</code> via SMS to the escort. The link is valid for 72 hours and opens the wizard pre-filled with their data.</Note>
        </Section>

        {/* Action: get_profile */}
        <Section icon={<User className="w-4 h-4 text-pink-500" />} title="Action: get_profile" badge="Step 4">
          <p className="text-sm text-gray-600 mb-3">
            Returns the full onboarding profile. Use <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">status</code> to check where the escort is in the process.
            KYC fields (<code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">first_name</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">last_name</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">date_of_birth</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">nationality</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">citizenship_group</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">phone</code>) are read-only in the wizard.
          </p>
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Parameter</th>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Type</th>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Status</th>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <ParamRow name="action" type="string" required desc={`Must be "get_profile"`} />
              <ParamRow name="escort_email" type="string" required desc="Email address of the escort" />
            </tbody>
          </table>
          <CodeBlock code={`// Request
{
  "action": "get_profile",
  "escort_email": "anna@example.com"
}

// Response
{
  // ── Identifiers ──────────────────────────────────────
  "id": "abc123",
  "escort_email": "anna@example.com",

  // ── Status ───────────────────────────────────────────
  "status": "submitted",
  // draft           → wizard not yet completed
  // submitted       → escort submitted — awaiting review
  // approved        → approved, ready to activate
  // needs_action    → admin requested additional info

  // ── Work Model ───────────────────────────────────────
  "work_model": "employee_unlimited",
  // employee_unlimited  → unlimited employment contract
  // employee_90days     → 90-day short-term employment
  // self_employed       → self-employed / freelancer

  // ── KYC Data (pre-filled, read-only in wizard) ───────
  "first_name": "Anna",
  "last_name": "Müller",
  "date_of_birth": "1995-06-15",
  "nationality": "Deutschland",
  "citizenship_group": "EU_EFTA",  // CH | EU_EFTA | NON_EU
  "phone": "+41791234567",

  // ── Address (entered in wizard) ───────────────────────
  "address": "Bahnhofstrasse 10",
  "city": "Zürich",
  "postal_code": "8001",
  "canton": "ZH",
  "municipality": "Zürich",

  // ── Residency Permit (non-Swiss only) ────────────────
  "permit_type": "B",
  // none | B | C | L | other
  "permit_status": "approved",
  // not_required | uploaded_review_pending | approved | missing | expired

  // ── Source Tax (Quellensteuer) ────────────────────────
  "source_tax": "yes",           // yes | no | unsure
  "marital_status": "single",
  "partner_in_household": "no",
  "partner_income_ch": null,
  "has_children": "no",
  "children_count": 0,

  // ── Contract ─────────────────────────────────────────
  "contract_signed": true,
  "contract_signed_at": "2026-01-15T10:30:00Z",
  "employment_start_date": "2026-02-01",
  "submitted_at": "2026-01-15T10:35:00Z",

  // ── Prostitution Permit ───────────────────────────────
  "prostitution_permit_status": "approved"
  // submitted | approved
}`} />
        </Section>

        {/* Action: get_documents */}
        <Section icon={<FileText className="w-4 h-4 text-pink-500" />} title="Action: get_documents" badge="Step 5">
          <p className="text-sm text-gray-600 mb-3">
            Returns all documents associated with an escort — uploaded during onboarding (ID, permits) and generated later by admins (payslips, contracts, VAT statements).
          </p>
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Parameter</th>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Type</th>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Status</th>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <ParamRow name="action" type="string" required desc={`Must be "get_documents"`} />
              <ParamRow name="escort_email" type="string" required desc="Email address of the escort" />
            </tbody>
          </table>
          <CodeBlock code={`// Request
{
  "action": "get_documents",
  "escort_email": "anna@example.com"
}

// Response
{
  "profile_id": "abc123",
  "documents": [
    {
      "id": "doc456",
      "type": "payslip",
      // payslip | vat_statement | monthly_statement | contract | permit | other
      "label": "Lohnabrechnung März 2026",
      "period": "2026-03",          // ISO month (YYYY-MM) or null
      "status": "available",        // available | pending | archived
      "file_url": "https://...",    // public URL, or null if private
      "uploaded_by_admin": true,    // false = uploaded by escort during wizard
      "created_date": "2026-03-01T08:00:00Z"
    }
  ]
}`} />
          <Note type="info">
            Documents uploaded by the escort (ID, permits) are stored as private files — <code>file_url</code> may be null.
            Use <strong>get_signed_url</strong> to access them securely.
          </Note>
        </Section>

        {/* Action: get_signed_url */}
        <Section icon={<Lock className="w-4 h-4 text-pink-500" />} title="Action: get_signed_url">
          <p className="text-sm text-gray-600 mb-3">
            Generates a time-limited signed URL for a private document. Valid for <strong>300 seconds</strong>.
            Use the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">file_url</code> from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">get_documents</code> as the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-700 text-xs">document_uri</code>.
          </p>
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Parameter</th>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Type</th>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Status</th>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <ParamRow name="action" type="string" required desc={`Must be "get_signed_url"`} />
              <ParamRow name="document_uri" type="string" required desc="Private file URI from get_documents response (file_url)" />
            </tbody>
          </table>
          <CodeBlock code={`// Request
{
  "action": "get_signed_url",
  "document_uri": "private://uploads/abc123/permit.pdf"
}

// Response
{
  "signed_url": "https://storage.base44.app/signed/...?token=xyz",
  "expires_in": 300
}`} />
          <Note type="tip">Generate signed URLs on-demand — never cache them, they expire after 300 seconds.</Note>
        </Section>

        {/* Error codes */}
        <Section icon={<span className="text-base">⚠️</span>} title="Error Codes">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">HTTP Status</th>
                <th className="text-left text-xs text-gray-400 font-semibold pb-2">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["200", "Success"],
                ["400", "Missing or invalid parameters (see error message in response body)"],
                ["401", "Invalid or missing API key"],
                ["404", "Profile not found for the given escort_email"],
                ["500", "Internal server error"],
              ].map(([code, desc]) => (
                <tr key={code} className="border-t border-gray-100">
                  <td className="py-2 pr-4 font-mono text-xs text-pink-700">{code}</td>
                  <td className="py-2 text-xs text-gray-600">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Error response body shape:</p>
            <CodeBlock code={`{ "error": "Missing 'escort_email'" }`} />
          </div>
        </Section>

        <p className="text-center text-xs text-gray-400 pb-10">Gingr Legal Onboarding API · Internal · Not publicly accessible</p>
      </div>
    </div>
  );
}