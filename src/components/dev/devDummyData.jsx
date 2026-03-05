// ─── Dev-only dummy profiles & documents ───────────────────────────────────
// Used exclusively by pages/DevDashboard for local development / design review.

const today = new Date();
const daysAgo = (n) => new Date(today - n * 86400000).toISOString();

// ── 1. Anstellung unbefristet ────────────────────────────────────────────────
export const profileUnlimited = {
  id: "dev-unlimited",
  first_name: "Anna",
  last_name: "Musterfrau",
  status: "approved",
  work_model: "employee_unlimited",
  citizenship_group: "CH",
  permit_type: "none",
  permit_status: "not_required",
  source_tax: "no",
  canton: "ZH",
  contract_signed: true,
  contract_signed_at: daysAgo(30),
  submitted_at: daysAgo(45),
};

export const docsUnlimited = [
  {
    id: "doc-u1",
    profile_id: "dev-unlimited",
    type: "contract",
    label: "Arbeitsvertrag 2025",
    period: "2025-01",
    file_url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2/sample.pdf",
    status: "available",
  },
  {
    id: "doc-u2",
    profile_id: "dev-unlimited",
    type: "payslip",
    label: "Lohnabrechnung Januar 2025",
    period: "2025-01",
    file_url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2/sample.pdf",
    status: "available",
  },
  {
    id: "doc-u3",
    profile_id: "dev-unlimited",
    type: "payslip",
    label: "Lohnabrechnung Februar 2025",
    period: "2025-02",
    file_url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2/sample.pdf",
    status: "available",
  },
  {
    id: "doc-u4",
    profile_id: "dev-unlimited",
    type: "payslip",
    label: "Lohnabrechnung März 2025",
    period: "2025-03",
    file_url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2/sample.pdf",
    status: "available",
  },
];

// ── 2. Anstellung 90 Tage ────────────────────────────────────────────────────
export const profile90Days = {
  id: "dev-90days",
  first_name: "Bianca",
  last_name: "Testfrau",
  status: "approved",
  work_model: "employee_90days",
  citizenship_group: "EU_EFTA",
  permit_type: "B",
  permit_status: "approved",
  permit_url: "https://example.com/permit.pdf",
  source_tax: "yes",
  canton: "BE",
  contract_signed: true,
  contract_signed_at: daysAgo(70),
  submitted_at: daysAgo(70), // 70 days ago → ~20 days remaining
};

export const docs90Days = [
  {
    id: "doc-9d1",
    profile_id: "dev-90days",
    type: "contract",
    label: "Befristeter Arbeitsvertrag 90 Tage",
    period: null,
    file_url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2/sample.pdf",
    status: "available",
  },
  {
    id: "doc-9d2",
    profile_id: "dev-90days",
    type: "payslip",
    label: "Lohnabrechnung Januar 2025",
    period: "2025-01",
    file_url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2/sample.pdf",
    status: "available",
  },
  {
    id: "doc-9d3",
    profile_id: "dev-90days",
    type: "payslip",
    label: "Lohnabrechnung Februar 2025",
    period: "2025-02",
    file_url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2/sample.pdf",
    status: "available",
  },
];

// ── 3. Selbstständig ─────────────────────────────────────────────────────────
export const profileSelfEmployed = {
  id: "dev-selfemployed",
  first_name: "Carmen",
  last_name: "Beispiel",
  status: "approved",
  work_model: "self_employed",
  citizenship_group: "NON_EU",
  permit_type: "C",
  permit_status: "approved",
  permit_url: "https://example.com/permit.pdf",
  source_tax: "no",
  canton: "GE",
  business_name: "Carmen Luxury GmbH",
  uid_number: "CHE-123.456.789",
  business_proof_url: "https://example.com/uid.pdf",
  contract_signed: true,
  contract_signed_at: daysAgo(15),
  submitted_at: daysAgo(20),
};

export const docsSelfEmployed = [
  {
    id: "doc-se1",
    profile_id: "dev-selfemployed",
    type: "contract",
    label: "Dienstleistungsvertrag 2025",
    period: null,
    file_url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2/sample.pdf",
    status: "available",
  },
  {
    id: "doc-se2",
    profile_id: "dev-selfemployed",
    type: "monthly_statement",
    label: "Monatsabrechnung Januar 2025",
    period: "2025-01",
    file_url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2/sample.pdf",
    status: "available",
  },
  {
    id: "doc-se3",
    profile_id: "dev-selfemployed",
    type: "monthly_statement",
    label: "Monatsabrechnung Februar 2025",
    period: "2025-02",
    file_url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2/sample.pdf",
    status: "available",
  },
  {
    id: "doc-se4",
    profile_id: "dev-selfemployed",
    type: "vat_statement",
    label: "MWST-Abrechnung Q4 2024",
    period: "2024-12",
    file_url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF2/sample.pdf",
    status: "available",
  },
];

export const DEV_SCENARIOS = [
  {
    key: "employee_unlimited",
    label: "Anstellung (unbefristet)",
    emoji: "💼",
    profile: profileUnlimited,
    documents: docsUnlimited,
  },
  {
    key: "employee_90days",
    label: "Anstellung (90 Tage)",
    emoji: "⏳",
    profile: profile90Days,
    documents: docs90Days,
  },
  {
    key: "self_employed",
    label: "Selbstständig",
    emoji: "🏢",
    profile: profileSelfEmployed,
    documents: docsSelfEmployed,
  },
];