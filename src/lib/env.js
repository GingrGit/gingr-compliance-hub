const ENV_STORAGE_KEY = "gingr_env";
const TOKEN_STORAGE_KEY = "gingr_token";
const VALID_ENVS = ["test", "uat", "staging", "production"];

export function initializeEnv() {
  const urlParams = new URLSearchParams(window.location.search);
  const queryEnv = urlParams.get("env");
  const normalizedQueryEnv = queryEnv?.toLowerCase();

  if (normalizedQueryEnv && VALID_ENVS.includes(normalizedQueryEnv)) {
    localStorage.setItem(ENV_STORAGE_KEY, normalizedQueryEnv);
    return normalizedQueryEnv;
  }

  const storedEnv = localStorage.getItem(ENV_STORAGE_KEY)?.toLowerCase();
  if (storedEnv && VALID_ENVS.includes(storedEnv)) {
    return storedEnv;
  }

  localStorage.setItem(ENV_STORAGE_KEY, "production");
  return "production";
}

export function initializeToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const queryToken = urlParams.get("token");

  if (queryToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, queryToken);
    return queryToken;
  }

  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (storedToken) {
    return storedToken;
  }

  window.location.href = "/invalid-token";
  return null;
}

export function getGingrBaseUrl() {
  const env = initializeEnv();

  const envUrls = {
    test: "https://www-test.gingr.ch",
    uat: "https://www-uat.gingr.ch",
    staging: "https://www-staging.gingr.ch",
    production: "https://gingr.ch",
  };

  return envUrls[env] || envUrls.production;
}

export function getLegalOnboardingStartUrl() {
  const env = initializeEnv();

  const envUrls = {
    test: "https://www-test-api3.gingr.com/legal-onboarding/start",
    uat: "https://www-uat-api3.gingr.com/legal-onboarding/start",
    staging: "https://www-staging-api3.gingr.com/legal-onboarding/start",
    production: "https://api3.gingr.com/legal-onboarding/start",
  };

  return envUrls[env] || envUrls.production;
}

export async function validateStoredToken() {
  const token = initializeToken();
  if (!token) return null;

  const response = await fetch(getLegalOnboardingStartUrl(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.location.href = "/invalid-token";
    return null;
  }

  return token;
}