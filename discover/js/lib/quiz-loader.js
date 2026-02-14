import { validateQuizDefinition, validateRegistry } from "./quiz-validator.js";

const quizCache = new Map();
let registryCache = null;

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

export async function loadRegistry() {
  if (registryCache) {
    return registryCache;
  }
  const registry = await fetchJson("./data/registry.json");
  const validation = validateRegistry(registry);
  if (!validation.valid) {
    throw new QuizLoadError("Quiz registry is invalid.", validation.errors);
  }
  registryCache = registry;
  return registry;
}

export async function loadQuizById(quizId, registry) {
  if (quizCache.has(quizId)) {
    return quizCache.get(quizId);
  }
  const source = registry.tests.find((item) => item.id === quizId);
  if (!source) {
    throw new QuizLoadError(`Quiz '${quizId}' is not registered.`);
  }

  const quiz = await fetchJson(source.path);
  const validation = validateQuizDefinition(quiz);
  if (!validation.valid) {
    throw new QuizLoadError(`Quiz '${quizId}' failed schema validation.`, validation.errors);
  }

  quizCache.set(quizId, quiz);
  return quiz;
}
