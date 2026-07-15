import { getStoredOrigins, setStoredOrigins } from "./cors-store";

function normalizeOrigin(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return trimmed.replace(/\/+$/, "");
  }
}

export function getAllowedOrigins(): string[] {
  return getStoredOrigins()
    .map((entry) => normalizeOrigin(entry))
    .filter(Boolean);
}

export function isOriginAllowed(origin?: string | null): boolean {
  if (!origin) return false;
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  return getAllowedOrigins().includes(normalized);
}

export function addAllowedOrigin(candidate: string): string[] {
  const normalized = normalizeOrigin(candidate);
  if (!normalized) {
    throw new Error("Origin is required.");
  }

  const existing = getAllowedOrigins();
  const next = [...new Set([...existing, normalized])].sort();
  setStoredOrigins(next);
  return next;
}

export function removeAllowedOrigin(candidate: string): string[] {
  const normalized = normalizeOrigin(candidate);
  if (!normalized) {
    throw new Error("Origin is required.");
  }

  const current = getAllowedOrigins();
  const next = current.filter((origin) => origin !== normalized);
  setStoredOrigins(next);
  return next;
}
