import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://selfdiscoverylab.org";
const IGNORE_DIRS = new Set([".git", "node_modules", ".github"]);

async function walk(dirPath, relative = "") {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const rel = relative ? path.join(relative, entry.name) : entry.name;
    const full = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith(".")) {
        continue;
      }
      results.push(...(await walk(full, rel)));
      continue;
    }

    if (entry.isFile() && entry.name === "index.html") {
      results.push(rel);
    }
  }

  return results;
}

function routeFromIndexPath(indexPath) {
  const normalized = indexPath.replace(/\\/g, "/");
  if (normalized === "index.html") {
    return null;
  }

  const directory = normalized.replace(/\/index\.html$/, "");
  if (!directory) {
    return null;
  }

  return `/${directory}/`;
}

function toIsoDate(date) {
  return date.toISOString().split("T")[0];
}

async function generateSitemap() {
  const indexFiles = await walk(repoRoot);
  const urls = new Set(["/discover/"]);

  indexFiles.forEach((indexPath) => {
    const route = routeFromIndexPath(indexPath);
    if (route && route !== "/") {
      urls.add(route);
    }
  });

  const sorted = [...urls]
    .filter((route) => route.startsWith("/discover/"))
    .sort((a, b) => a.localeCompare(b));

  const now = new Date();
  const lastmod = toIsoDate(now);

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  sorted.forEach((route) => {
    lines.push("  <url>");
    lines.push(`    <loc>${SITE_ORIGIN}${route}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push("    <changefreq>weekly</changefreq>");
    lines.push(route === "/discover/" ? "    <priority>1.0</priority>" : "    <priority>0.8</priority>");
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
