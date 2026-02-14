const RESULTS_KEY = "self-discovery:results:v1";
const THEME_KEY = "self-discovery:theme";
const LOCALE_KEY = "self-discovery:locale";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function listResults() {
  const data = readJson(RESULTS_KEY, []);
  if (!Array.isArray(data)) {
    return [];
  }
  return data.sort((a, b) => String(b.takenAt).localeCompare(String(a.takenAt)));
}

export function saveResult(record) {
  const current = listResults();
  const next = [record, ...current].slice(0, 60);
  writeJson(RESULTS_KEY, next);
}

export function latestResultsByQuiz() {
  const map = new Map();
  listResults().forEach((record) => {
    if (!map.has(record.quizId)) {
      map.set(record.quizId, record);
    }
  });
  return map;
}

export function clearResults() {
  localStorage.removeItem(RESULTS_KEY);
}

export function loadThemePreference() {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "dark" || saved === "light" ? saved : null;
}

export function saveThemePreference(theme) {
  if (theme !== "light" && theme !== "dark") {
    localStorage.removeItem(THEME_KEY);
    return;
  }
  localStorage.setItem(THEME_KEY, theme);
}

export function loadLocalePreference() {
  const saved = localStorage.getItem(LOCALE_KEY);
  return saved || null;
}

export function saveLocalePreference(locale) {
  if (!locale) {
    localStorage.removeItem(LOCALE_KEY);
    return;
  }
  localStorage.setItem(LOCALE_KEY, locale);
}
