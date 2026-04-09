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
    return { token: queryToken, source: "query" };
  }

  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (storedToken) {
    return { token: storedToken, source: "storage" };
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
    test: "https://www-test-api3.gingr.com/legal-onboarding",
    uat: "https://www-uat-api3.gingr.com/legal-onboarding",
    staging: "https://www-staging-api3.gingr.com/legal-onboarding",
    production: "https://api3.gingr.com/legal-onboarding",
  };

  return envUrls[env] || envUrls.production;
}

export async function validateStoredToken() {
  const tokenState = initializeToken();
  if (!tokenState?.token) return null;

  const response = await fetch(getLegalOnboardingStartUrl(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenState.token}`,
    },
  });

  if (!response.ok) {
    if (tokenState.source === "storage") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    window.location.href = "/invalid-token";
    return null;
  }

  if (tokenState.source === "query") {
    localStorage.setItem(TOKEN_STORAGE_KEY, tokenState.token);
  }

  return tokenState.token;
}