import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../data");

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function validateQuizBasic(quiz) {
  const errors = [];
  if (!isObject(quiz)) {
    return ["Quiz must be an object."];
  }

  ["id", "title", "description", "durationEstimate"].forEach((field) => {
    if (typeof quiz[field] !== "string" || !quiz[field].trim()) {
      errors.push(`${field} must be a non-empty string.`);
    }
  });

  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    errors.push("questions must be a non-empty array.");
  }

  if (!isObject(quiz.scoring) || !Array.isArray(quiz.scoring.dimensions)) {
    errors.push("scoring.dimensions must be defined.");
  }

  if (!isObject(quiz.shareCard)) {
    errors.push("shareCard must be defined.");
  }

  return errors;
}

async function main() {
  const registryRaw = await readFile(path.join(dataDir, "registry.json"), "utf8");
  const registry = JSON.parse(registryRaw);

  const errors = [];
  if (!Array.isArray(registry.tests) || !registry.tests.length) {
    errors.push("registry.tests must contain at least one test.");
  }

  const files = new Set(await readdir(dataDir));
  const i18nRegistryFile = path.join(dataDir, "i18n", "registry.json");
  await readFile(i18nRegistryFile, "utf8").catch(() => {
    errors.push("Missing localization registry file: ./data/i18n/registry.json");
  });
  const i18nQuizDir = path.resolve(dataDir, "i18n", "quizzes");
  const i18nFiles = new Set(await readdir(i18nQuizDir).catch(() => []));

  for (const test of registry.tests || []) {
    const targetFile = path.basename(test.path || "");
    if (!targetFile || !files.has(targetFile)) {
      errors.push(`Missing quiz file for test '${test.id}': ${test.path}`);
      continue;
    }

    if (test.i18nPath) {
      const i18nFile = path.basename(test.i18nPath);
      if (!i18nFiles.has(i18nFile)) {
        errors.push(`Missing i18n file for test '${test.id}': ${test.i18nPath}`);
      }
    }

    const raw = await readFile(path.join(dataDir, targetFile), "utf8");
    const quiz = JSON.parse(raw);
    const quizErrors = validateQuizBasic(quiz);
    if (quiz.id !== test.id) {
      quizErrors.push(`Quiz id mismatch. registry=${test.id}, quiz=${quiz.id}`);
    }
    quizErrors.forEach((message) => errors.push(`${targetFile}: ${message}`));
  }

  if (errors.length) {
    console.error("JSON validation failed:");
    errors.forEach((err) => console.error(`- ${err}`));
    process.exit(1);
  }

  console.log("All discover JSON files passed basic validation.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
