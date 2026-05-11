// Small helpers used across pages — keeps render JSX free of nested ternaries.

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Resolve a doctor (or any) photo URL from the API.
 * - empty / null  -> fallback placeholder
 * - "/api/..."    -> prefix with REACT_APP_BACKEND_URL
 * - otherwise     -> return as-is (already absolute)
 */
export function resolvePhotoUrl(photoUrl, fallback) {
  if (!photoUrl) return fallback;
  if (photoUrl.startsWith("/api")) return `${BACKEND_URL}${photoUrl}`;
  return photoUrl;
}

/** Stepper item state ("done" | "current" | "todo"). */
export function stepState(index, currentStep) {
  if (index < currentStep) return "done";
  if (index === currentStep) return "current";
  return "todo";
}
