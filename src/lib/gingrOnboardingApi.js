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
  yes: "Yes",
  no: "No",
  unsure: "NotSure",
};

const MARITAL_STATUS_API_MAP = {
  single: "Single",
  married: "Married",
  partnership: "RegisteredPartnership",
  divorced: "Divorced",
  widowed: "Widowed",
  unsure: "NotSure",
};

const YES_NO_NOT_SURE_API_MAP = {
  yes: "Yes",
  no: "No",
  unsure: "NotSure",
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

  const businessFormMap = {
    Freelancer: "freelancer",
    Company: "company",
  };

  const maritalStatusMap = {
    Single: "single",
    Married: "married",
    RegisteredPartnership: "partnership",
    Divorced: "divorced",
    Widowed: "widowed",
    NotSure: "unsure",
  };

  const yesNoNotSureMap = {
    Yes: "yes",
    No: "no",
    NotSure: "unsure",
  };

  const apiStatusMap = {
    Draft: "draft",
    Submitted: "submitted",
    NeedsAction: "needs_action",
    Approved: "approved",
  };

  const mapped = {
    status: apiStatusMap[data.status],
    first_name: data.firstName,
    last_name: data.lastName,
    date_of_birth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : undefined,
    escort_email: data.emailAddress,
    phone: data.mobile,
    address: data.address,
    postal_code: data.postalCode,
    city: data.city,
    nationality: data.countryCode,
    country_code: data.countryCode,
    citizenship_group: matchedCountry?.group,
    work_model: API_EMPLOYMENT_TYPE_MAP[data.employmentType],
    business_type: businessFormMap[data.businessForm],
    hourly_rate: data.hourlyRate,
    hours_per_month: data.hoursPerMonth,
    source_tax: yesNoNotSureMap[data.taxEstimate],
    partner_in_household: yesNoNotSureMap[data.partnerSameHousehold],
    partner_income_ch: yesNoNotSureMap[data.partnerIncomeCh],
    employment_start_date: data.startEmployment ? data.startEmployment.split("T")[0] : undefined,
    permit_type: data.residencePermitType ? String(data.residencePermitType) : undefined,
    permit_status: data.residencePermitStatus === "Pending"
      ? "uploaded_review_pending"
      : data.residencePermitStatus
      ? String(data.residencePermitStatus).toLowerCase()
      : undefined,
    permit_url: data.residencePermitUrl,
    id_document_url: data.identityDocumentUrl,
    ahv_confirmation_url: data.selfEmploymentConfirmationUrl,
    commercial_register_url: data.commercialRegisterExtractUrl,
    invoice_proof_url: data.authorizationProofUrl,
    prostitution_permit_url: data.authorizationProofUrl,
    self_employment_confirmation_status: data.selfEmploymentConfirmationStatus ? String(data.selfEmploymentConfirmationStatus).toLowerCase() : undefined,
    commercial_register_status: data.commercialRegisterExtractStatus ? String(data.commercialRegisterExtractStatus).toLowerCase() : undefined,
    authorization_proof_status: data.authorizationProofStatus ? String(data.authorizationProofStatus).toLowerCase() : undefined,
    id_document_status: data.identityDocumentStatus ? String(data.identityDocumentStatus).toLowerCase() : undefined,
    has_children: typeof data.children === "boolean" ? (data.children ? "yes" : "no") : undefined,
    marital_status: maritalStatusMap[data.maritalStatus],
    canton: data.canton,
    municipality: data.municipality,
    activity_proof_url: data.profileUrls,
    activity_proof_urls: data.profileUrls
      ? String(data.profileUrls)
          .split(/[,\n]/)
          .map((url) => url.trim())
          .filter(Boolean)
      : undefined,
  };

  return Object.fromEntries(Object.entries(mapped).filter(([, value]) => hasValue(value)));
}

export function getLastIncompleteStepId(profile) {
  const isSwiss = profile.citizenship_group === "CH";
  const isSelfEmployed = profile.work_model === "self_employed";
  const needsSourceTaxStep = profile.source_tax === "yes" || profile.source_tax === "unsure";

  if (profile.id_document_status === "rejected") {
    return "core_data";
  }

  if (profile.permit_status === "rejected") {
    return "residency";
  }

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
    return false;
  }

  return true;
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

export async function saveTaxInfoProgress({ canton, municipality, marital_status, partner_in_household, partner_income_ch, has_children }) {
  const tokenState = initializeToken();
  const token = tokenState?.token;
  const maritalStatus = MARITAL_STATUS_API_MAP[marital_status];

  if (!token || !hasValue(canton) || !maritalStatus) {
    return;
  }

  const response = await fetch(`${getLegalOnboardingBaseUrl()}/tax-info`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      canton,
      municipality: municipality || null,
      maritalStatus,
      partnerSameHousehold: YES_NO_NOT_SURE_API_MAP[partner_in_household] || null,
      partnerIncomeCh: YES_NO_NOT_SURE_API_MAP[partner_income_ch] || null,
      children: has_children === "yes",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save tax info progress");
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