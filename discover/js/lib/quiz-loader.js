import { applyQuizLocalization, applyRegistryLocalization } from "./quiz-localize.js";
import { validateQuizDefinition, validateRegistry } from "./quiz-validator.js";

const baseQuizCache = new Map();
const localizedQuizCache = new Map();
let baseRegistryCache = null;
const localizedRegistryCache = new Map();
let registryLocalePackCache = undefined;
const quizLocalePackCache = new Map();

export class QuizLoadError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = "QuizLoadError";
    this.details = details;
  }
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new QuizLoadError(`Failed to fetch ${path}.`, [
      `HTTP ${response.status} ${response.statusText}`,
    ]);
  }
  try {
    return await response.json();
  } catch {
    throw new QuizLoadError(`Failed to parse JSON from ${path}.`);
  }
}

async function fetchOptionalJson(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

async function loadBaseRegistry() {
  if (baseRegistryCache) {
    return baseRegistryCache;
  }

  const registry = await fetchJson("./data/registry.json");
  const validation = validateRegistry(registry);
  if (!validation.valid) {
    throw new QuizLoadError("Quiz registry is invalid.", validation.errors);
  }
  baseRegistryCache = registry;
  return baseRegistryCache;
}

async function loadRegistryLocalePack() {
  if (registryLocalePackCache !== undefined) {
    return registryLocalePackCache;
  }
  registryLocalePackCache = await fetchOptionalJson("./data/i18n/registry.json");
  return registryLocalePackCache;
}

async function loadQuizLocalePack(quizId, source) {
  if (quizLocalePackCache.has(quizId)) {
    return quizLocalePackCache.get(quizId);
  }

  const path = source.i18nPath || `./data/i18n/quizzes/${quizId}.json`;
  const pack = await fetchOptionalJson(path);
  quizLocalePackCache.set(quizId, pack);
  return pack;
}

export async function loadRegistry(locale = "en") {
  const baseRegistry = await loadBaseRegistry();
  if (locale === "en") {
    return baseRegistry;
  }
  if (localizedRegistryCache.has(locale)) {
    return localizedRegistryCache.get(locale);
  }

  const pack = await loadRegistryLocalePack();
  const patch = pack?.locales?.[locale] || null;
  const localized = applyRegistryLocalization(baseRegistry, patch);
  localizedRegistryCache.set(locale, localized);
  return localized;
}

export async function loadQuizById(quizId, registry, locale = "en") {
  const key = `${quizId}:${locale}`;
  if (localizedQuizCache.has(key)) {
    return localizedQuizCache.get(key);
  }

  const source = registry.tests.find((item) => item.id === quizId);
  if (!source) {
    throw new QuizLoadError(`Quiz '${quizId}' is not registered.`);
  }

  let baseQuiz = baseQuizCache.get(quizId);
  if (!baseQuiz) {
    baseQuiz = await fetchJson(source.path);
    const validation = validateQuizDefinition(baseQuiz);
    if (!validation.valid) {
      throw new QuizLoadError(
        `Quiz '${quizId}' failed schema validation.`,
        validation.errors
      );
    }
    baseQuizCache.set(quizId, baseQuiz);
  }

  if (locale === "en") {
    localizedQuizCache.set(key, baseQuiz);
    return baseQuiz;
  }

  const pack = await loadQuizLocalePack(quizId, source);
  const patch = pack?.locales?.[locale] || null;
  const localized = applyQuizLocalization(baseQuiz, patch);
  localizedQuizCache.set(key, localized);
  return localized;
}
