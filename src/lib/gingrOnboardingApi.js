import { initializeEnv, initializeToken } from "@/lib/env";

const EMPLOYMENT_TYPE_MAP = {
  employee_unlimited: 0,
  employee_90days: 1,
  self_employed: 2,
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