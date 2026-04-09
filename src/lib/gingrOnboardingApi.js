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

  return response.json();
}

export function mapLegalOnboardingDataToProfile(data) {
  if (!data) {
    return {};
  }

  const mapped = {
    first_name: data.firstName,
    last_name: data.lastName,
    date_of_birth: data.dateOfBirth,
    escort_email: data.emailAddress,
    phone: data.mobile,
    address: data.address,
    postal_code: data.postalCode,
    city: data.city,
    nationality: data.countryCode,
    work_model: API_EMPLOYMENT_TYPE_MAP[data.employmentType],
    hourly_rate: data.hourlyRate,
    hours_per_month: data.hoursPerMonth,
    source_tax: hasValue(data.taxEstimate) ? String(data.taxEstimate) : undefined,
    employment_start_date: data.startEmployment,
    permit_type: data.residencePermitType,
    permit_status: data.residencePermitStatus,
    permit_url: data.residencePermit ? "completed" : undefined,
    id_document_url: data.identityDocument ? "completed" : undefined,
    business_name: data.businessForm,
    prostitution_permit_url: data.authorizationProof ? "completed" : undefined,
  };

  return Object.fromEntries(Object.entries(mapped).filter(([, value]) => hasValue(value)));
}

export function getLastIncompleteStepIndex(profile) {
  const isSwiss = profile.citizenship_group === "CH";
  const isSelfEmployed = profile.work_model === "self_employed";
  const needsSourceTaxStep = profile.source_tax === "yes" || profile.source_tax === "unsure";

  const checks = [
    { step: 1, complete: hasValue(profile.work_model) },
    {
      step: 2,
      complete: [profile.first_name, profile.last_name, profile.date_of_birth, profile.escort_email, profile.phone, profile.citizenship_group, profile.id_document_url].some(hasValue),
    },
    {
      step: 3,
      enabled: !isSwiss,
      complete: [profile.permit_type, profile.permit_url].some(hasValue),
    },
    { step: 4, complete: hasValue(profile.work_model) },
    {
      step: 5,
      enabled: !isSelfEmployed,
      complete: [profile.hourly_rate, profile.hours_per_month, profile.source_tax].some(hasValue),
    },
    {
      step: 5,
      enabled: isSelfEmployed,
      complete: [profile.business_name, profile.prostitution_permit_url].some(hasValue),
    },
    {
      step: 6,
      enabled: !isSelfEmployed && needsSourceTaxStep,
      complete: [profile.canton, profile.marital_status].some(hasValue),
    },
  ];

  for (const check of checks) {
    if (check.enabled === false) continue;
    if (!check.complete) return check.step;
  }

  if (isSelfEmployed) return 6;
  if (needsSourceTaxStep) return 7;
  return 6;
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