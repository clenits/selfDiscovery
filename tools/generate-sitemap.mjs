import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://selfdiscoverylab.org";
const DISCOVER_BASE = "/discover/";

function toIsoDate(date) {
  return date.toISOString().split("T")[0];
}

function parseRoutePatterns(appJsSource) {
  const patterns = [];
  const routePattern = /pattern:\s*"([^"]+)"/g;
  let match = routePattern.exec(appJsSource);
  while (match) {
    patterns.push(match[1]);
    match = routePattern.exec(appJsSource);
  }
  return patterns;
}

function buildDiscoverUrls(routePatterns, tests) {
  const urls = [];

  routePatterns.forEach((pattern) => {
    if (pattern === "*" || !pattern.startsWith("/")) {
      return;
    }

    if (pattern === "/") {
      urls.push(`${SITE_ORIGIN}${DISCOVER_BASE}`);
      return;
    }

    if (!pattern.includes(":")) {
      urls.push(`${SITE_ORIGIN}${DISCOVER_BASE}#${pattern}`);
      return;
    }

    if (pattern === "/quiz/:quizId") {
      tests.forEach((test) => {
        urls.push(`${SITE_ORIGIN}${DISCOVER_BASE}#/quiz/${encodeURIComponent(test.id)}`);
      });
    }
  });

  return urls;
}

function routePriority(url) {
  if (url.endsWith(`${DISCOVER_BASE}`)) {
    return "1.0";
  }

  if (url.includes("#/tests") || url.includes("#/profile")) {
    return "0.9";
  }

  if (url.includes("#/quiz/")) {
    return "0.8";
  }

  if (url.includes("#/share")) {
    return "0.7";
  }

  return "0.7";
}

async function generateSitemap() {
  const appJs = await readFile(path.join(repoRoot, "discover", "app.js"), "utf8");
  const discoverRegistry = JSON.parse(
    await readFile(path.join(repoRoot, "discover", "data", "registry.json"), "utf8")
  );

  const discoverTests = Array.isArray(discoverRegistry.tests)
    ? discoverRegistry.tests
    : [];
  const discoverRoutePatterns = parseRoutePatterns(appJs);

  const allUrls = buildDiscoverUrls(discoverRoutePatterns, discoverTests);
  const urls = [...new Set(allUrls)].sort((a, b) => a.localeCompare(b));

  const lastmod = toIsoDate(new Date());
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  urls.forEach((url) => {
    lines.push("  <url>");
    lines.push(`    <loc>${url}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push("    <changefreq>weekly</changefreq>");
    lines.push(`    <priority>${routePriority(url)}</priority>`);
    lines.push("  </url>");
  });

  lines.push("</urlset>");
  lines.push("");

  await writeFile(path.join(repoRoot, "sitemap.xml"), lines.join("\n"), "utf8");
}

generateSitemap().catch((error) => {
  console.error(error);
  process.exit(1);
});
