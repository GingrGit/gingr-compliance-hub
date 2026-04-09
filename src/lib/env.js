const STORAGE_KEY = "gingr_env";
const VALID_ENVS = ["test", "uat", "staging", "production"];

export function initializeEnv() {
  const urlParams = new URLSearchParams(window.location.search);
  const queryEnv = urlParams.get("env");
  const normalizedQueryEnv = queryEnv?.toLowerCase();

  if (normalizedQueryEnv && VALID_ENVS.includes(normalizedQueryEnv)) {
    localStorage.setItem(STORAGE_KEY, normalizedQueryEnv);
    return normalizedQueryEnv;
  }

  const storedEnv = localStorage.getItem(STORAGE_KEY)?.toLowerCase();
  if (storedEnv && VALID_ENVS.includes(storedEnv)) {
    return storedEnv;
  }

  localStorage.setItem(STORAGE_KEY, "production");
  return "production";
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