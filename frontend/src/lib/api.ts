/**
 * The API now lives in this same Next app under /api, so the default is a
 * same-origin relative base — no NEXT_PUBLIC_API_URL needed for deploys.
 * Override it only to point the UI at a different host.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const getApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${cleanBase}/${cleanEndpoint}`;
};
