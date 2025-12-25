// src/lib/google.js

import { CONFIG } from "@/config";

function withTimeout(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(id) };
}

export async function fetchView(view, { timeoutMs = 8000 } = {}) {
  if (!CONFIG.APPS_SCRIPT_EXEC || CONFIG.APPS_SCRIPT_EXEC.includes("REPLACE_ME")) {
    throw new Error("Apps Script exec URL not configured");
  }

  // Cache-bust to avoid stale CDN/browser caches (useful on GitHub Pages)
  const url = `${CONFIG.APPS_SCRIPT_EXEC}?view=${encodeURIComponent(view)}&t=${Date.now()}`;

  const { signal, cancel } = withTimeout(timeoutMs);
  try {
    const res = await fetch(url, { signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    cancel();
  }
}
