import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const storagePath = path.join(process.cwd(), ".cors-whitelist.json");

function ensureStore() {
  const dir = path.dirname(storagePath);
  mkdirSync(dir, { recursive: true });
  if (!existsSync(storagePath)) {
    writeFileSync(storagePath, "[]", "utf8");
  }
}

function readStore(): string[] {
  ensureStore();
  try {
    const contents = readFileSync(storagePath, "utf8");
    const parsed = JSON.parse(contents);
    if (Array.isArray(parsed)) {
      return parsed.filter((entry): entry is string => typeof entry === "string" && !!entry.trim());
    }
  } catch {
    // fall back to empty store
  }
  return [];
}

function writeStore(origins: string[]) {
  ensureStore();
  writeFileSync(storagePath, JSON.stringify(origins, null, 2), "utf8");
}

export function getStoredOrigins(): string[] {
  return readStore();
}

export function setStoredOrigins(origins: string[]) {
  writeStore(origins);
  return origins;
}
