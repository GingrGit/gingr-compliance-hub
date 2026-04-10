import { initializeEnv, initializeToken } from "@/lib/env";

const EMPLOYMENT_TYPE_MAP = {
  employee_unlimited: 0,
  employee_90days: 1,
  self_employed: 2,
};

const API_EMPLOYMENT_TYPE_MAP = {
  Employee: "employee_unlimited",
  EmployeeShortTerm: "employee_90days",
  SelfEmployed: "self_employed",
};

const TAX_ESTIMATE_MAP = {
  yes: "And",
  no: "No",
  unsure: "NotSure",
};

const API_TAX_ESTIMATE_MAP = {
  And: "yes",
  No: "no",
  NotSure: "unsure",
};

const API_RESIDENCE_PERMIT_STATUS_MAP = {
  Pending: "uploaded_review_pending",
  Approved: "approved",
  Missing: "missing",
  Expired: "expired",
};

function getLegalOnboardingBaseUrl() {
  const env = initializeEnv();

  const envUrls = {
    test: "https://www-test-api3.gingr.com/legal-onboarding",
    uat: "https://www-uat-api3.gingr.com/legal-onboarding",
    staging: "https://www-staging-api3.gingr.com/legal-onboarding",
    production: "https://api3.gingr.com/legal-onboarding",
  };

  return envUrls[env] || envUrls.production;
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function mapCountryGroup(group) {
  if (group === "Ch") return "CH";
  if (group === "Eu") return "EU_EFTA";
  return "NON_EU";
}

async function parseJsonResponse(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function fetchLegalOnboardingData() {
  const tokenState = initializeToken();
  const token = tokenState?.token;

  if (!token) {
    return null;
  }

  const response = await fetch(getLegalOnboardingBaseUrl(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch onboarding data");
  }

  return parseJsonResponse(response);
}

export function mapLegalOnboardingDataToProfile(data, countries = []) {
  if (!data) {
    return {};
  }

  const matchedCountry = countries.find((country) => country.code === data.countryCode);

  const mapped = {
    first_name: data.firstName,
    last_name: data.lastName,
    date_of_birth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : undefined,
    escort_email: data.emailAddress,
    phone: data.mobile,
    address: data.address,
    postal_code: data.postalCode,
    city: data.city,
    nationality: data.countryCode || data.nationality,
    country_code: data.countryCode,
    citizenship_group: matchedCountry?.group,
    work_model: API_EMPLOYMENT_TYPE_MAP[data.employmentType],
    hourly_rate: data.hourlyRate,
    hours_per_month: data.hoursPerMonth,
    source_tax: API_TAX_ESTIMATE_MAP[data.taxEstimate],
    employment_start_date: data.startEmployment,
    permit_type: data.residencePermitType,
    permit_status: API_RESIDENCE_PERMIT_STATUS_MAP[data.residencePermitStatus],
    permit_url: data.residencePermitUrl,
    id_document_url: data.identityDocumentUrl,
    business_name: data.businessForm,
    prostitution_permit_url: data.authorizationProofUrl,
    prostitution_permit_status: data.authorizationProofStatus,
    canton: data.canton,
    municipality: data.municipality,
    marital_status: data.maritalStatus,
    has_children: typeof data.children === "boolean" ? (data.children ? "yes" : "no") : undefined,
    business_proof_url: data.commercialRegisterExtractUrl,
    self_employment_confirmation_url: data.selfEmploymentConfirmationUrl,
    profile_urls: data.profileUrls,
  };

  return Object.fromEntries(Object.entries(mapped).filter(([, value]) => hasValue(value)));
}

export function getLastIncompleteStepId(profile) {
  const isSwiss = profile.citizenship_group === "CH";
  const isSelfEmployed = profile.work_model === "self_employed";
  const needsSourceTaxStep = profile.source_tax === "yes" || profile.source_tax === "unsure";

  const checks = [
    { stepId: "work_model", requiredFields: [profile.work_model] },
    {
      stepId: "core_data",
      requiredFields: [
        profile.first_name,
        profile.last_name,
        profile.date_of_birth,
        profile.escort_email,
        profile.phone,
        profile.citizenship_group,
        profile.id_document_url,
      ],
    },
    {
      stepId: "residency",
      enabled: !isSwiss,
      requiredFields: [profile.permit_type, profile.permit_url],
    },
    {
      stepId: "eligibility",
      enabled: !profile.work_model,
      requiredFields: [profile.work_model],
    },
    {
      stepId: "earnings",
      enabled: !isSelfEmployed,
      requiredFields: [profile.hourly_rate, profile.hours_per_month, profile.source_tax],
    },
    {
      stepId: "self_employed",
      enabled: isSelfEmployed,
      requiredFields: [profile.business_name, profile.prostitution_permit_url],
    },
    {
      stepId: "source_tax",
      enabled: !isSelfEmployed && needsSourceTaxStep,
      requiredFields: [profile.canton, profile.marital_status],
    },
  ];

  for (const check of checks) {
    if (check.enabled === false) continue;
    const isComplete = check.requiredFields.every(hasValue);
    if (!isComplete) return check.stepId;
  }

  if (isSelfEmployed) return "self_employed_summary";
  if (needsSourceTaxStep) return "summary";
  return "summary";
}

export async function fetchCountries() {
  const tokenState = initializeToken();
  const token = tokenState?.token;

  if (!token) {
    return [];
  }

  const response = await fetch(`${getLegalOnboardingBaseUrl()}/countries`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch countries");
  }

  const data = await parseJsonResponse(response);
  return Array.isArray(data)
    ? data.map((country) => ({
        name: country.name,
        code: country.code,
        group: mapCountryGroup(country.group),
      }))
    : [];
}

export async function savePersonalDataProgress(profile) {
  const tokenState = initializeToken();
  const token = tokenState?.token;

  if (!token || !profile?.id_document_url) {
    return;
  }

  const formData = new FormData();
  formData.append("FirstName", profile.first_name || "");
  formData.append("LastName", profile.last_name || "");
  formData.append("DateOfBirth", profile.date_of_birth || "");
  formData.append("EmailAddress", profile.escort_email || "");
  formData.append("Mobile", profile.phone || "");
  formData.append("Address", profile.address || "");
  formData.append("PostalCode", profile.postal_code || "");
  formData.append("City", profile.city || "");
  formData.append("CountryCode", profile.country_code || profile.nationality || "");
  formData.append("Identity", profile.id_document_url);

  const response = await fetch(`${getLegalOnboardingBaseUrl()}/personal-data`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save personal data progress");
  }
}

export async function saveWorkModelProgress(workModel) {
  const tokenState = initializeToken();
  const token = tokenState?.token;
  const employmentType = EMPLOYMENT_TYPE_MAP[workModel];

  if (!token || employmentType === undefined) {
    return;
  }

  const response = await fetch(`${getLegalOnboardingBaseUrl()}/work-model/${employmentType}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to save work model progress");
  }
}

export async function saveResidencePermitProgress({ permitFile, permitType }) {
  const tokenState = initializeToken();
  const token = tokenState?.token;

  if (!token || !permitFile || !permitType) {
    return;
  }

  const permitTypeMap = {
    B: "B",
    C: "C",
    L: "L",
    other: "Other",
  };

  const formData = new FormData();
  formData.append("ResidencePermit", permitFile);
  formData.append("PermitType", permitTypeMap[permitType] || permitType);

  const response = await fetch(`${getLegalOnboardingBaseUrl()}/residence-permit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save residence permit progress");
  }
}

export async function saveWorkModelSelection(workModel) {
  const tokenState = initializeToken();
  const token = tokenState?.token;
  const employmentType = EMPLOYMENT_TYPE_MAP[workModel];

  if (!token || employmentType === undefined) {
    return;
  }

  const response = await fetch(`${getLegalOnboardingBaseUrl()}/work-model/${employmentType}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to save work model progress");
  }
}

export async function saveEarningsProgress({ hourlyRate, hoursPerMonth, sourceTax }) {
  const tokenState = initializeToken();
  const token = tokenState?.token;
  const taxEstimate = TAX_ESTIMATE_MAP[sourceTax];

  if (!token || !hasValue(hourlyRate) || !hasValue(hoursPerMonth) || !taxEstimate) {
    return;
  }

  const response = await fetch(`${getLegalOnboardingBaseUrl()}/earnings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      hourlyRate: Number(hourlyRate),
      hoursPerMonth: Number(hoursPerMonth),
      taxEstimate,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save earnings progress");
  }
}

export async function submitLegalOnboarding(startDate) {
  const tokenState = initializeToken();
  const token = tokenState?.token;

  if (!token) {
    return;
  }

  const url = new URL(`${getLegalOnboardingBaseUrl()}/submit`);

  if (startDate) {
    url.searchParams.set("start", String(new Date(startDate).getTime()));
  }

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to submit legal onboarding");
  }
}