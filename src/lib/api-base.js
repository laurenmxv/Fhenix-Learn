// Single source of truth for the progress API origin.
//
// In dev, leave VITE_PROGRESS_API_ORIGIN unset — vite.config.js proxies /api → localhost:3101.
// In prod (Vercel), set VITE_PROGRESS_API_ORIGIN to your hosted API (e.g. Render URL).
//
// We aggressively strip trailing whitespace, slashes, and periods because copy-pasting
// from documentation often leaves a punctuation tail that breaks TLS hostname matching.

export const API_BASE = (import.meta.env.VITE_PROGRESS_API_ORIGIN || '')
    .trim()
    .replace(/[\s./]+$/, '');

export function apiUrl(path) {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE}${p}`;
}
