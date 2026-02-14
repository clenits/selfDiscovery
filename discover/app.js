import { Card, ErrorBox } from "./js/lib/components.js";
import { clearNode } from "./js/lib/dom.js";
import { createTranslator, detectPreferredLocale, LOCALE_OPTIONS, normalizeLocale } from "./js/lib/i18n.js";
import { loadRegistry, QuizLoadError } from "./js/lib/quiz-loader.js";
import { updateSeo } from "./js/lib/meta.js";
import { Router } from "./js/lib/router.js";
import {
  latestResultsByQuiz,
  loadLocalePreference,
  loadThemePreference,
  saveLocalePreference,
  saveThemePreference,
} from "./js/lib/storage.js";
import { renderHomeView } from "./js/views/home-view.js";
import { renderProfileView } from "./js/views/profile-view.js";
import { renderQuizView } from "./js/views/quiz-view.js";
import { renderShareView } from "./js/views/share-view.js";
import { renderTestsView } from "./js/views/tests-view.js";

const appNode = document.querySelector("#app");
const themeToggle = document.querySelector("#theme-toggle");
const languageSelect = document.querySelector("#language-select");
const skipLink = document.querySelector("#skip-link");
const brandLink = document.querySelector("#brand-link");
const topNav = document.querySelector("#top-nav");
const navHome = document.querySelector("#nav-home");
const navTests = document.querySelector("#nav-tests");
const navProfile = document.querySelector("#nav-profile");
const languageLabel = document.querySelector("#language-label");
const fallbackTitle = document.querySelector("#fallback-title");
const fallbackDesc = document.querySelector("#fallback-desc");
const fallbackCache = document.querySelector("#fallback-cache");
const fallbackOpenTests = document.querySelector("#fallback-open-tests");
const noscriptTitle = document.querySelector("#noscript-title");
const noscriptDesc = document.querySelector("#noscript-desc");
const footerCopy = document.querySelector("#footer-copy");

const appState = {
  sessions: {},
  shareNotice: "",
  registry: null,
  registryLocale: null,
  registryError: null,
  locale: "en",
  t: createTranslator("en"),
};

document.body.dataset.enhanced = "true";

function setText(node, text) {
  if (node) {
    node.textContent = text;
  }
}

function setTheme(theme) {
  if (theme === "light" || theme === "dark") {
    document.documentElement.dataset.theme = theme;
    saveThemePreference(theme);
    return;
  }
  document.documentElement.removeAttribute("data-theme");
  saveThemePreference(null);
}

function getEffectiveTheme() {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") {
    return explicit;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function syncThemeToggle() {
  const darkMode = getEffectiveTheme() === "dark";
  themeToggle.textContent = darkMode
    ? appState.t("app.themeDark")
    : appState.t("app.themeLight");
  themeToggle.setAttribute("aria-pressed", String(darkMode));
  themeToggle.setAttribute("aria-label", appState.t("app.themeToggleAria"));
}

function initTheme() {
  const saved = loadThemePreference();
  if (saved) {
    setTheme(saved);
  }
  syncThemeToggle();

  themeToggle.addEventListener("click", () => {
    const next = getEffectiveTheme() === "dark" ? "light" : "dark";
    setTheme(next);
    syncThemeToggle();
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!loadThemePreference()) {
      syncThemeToggle();
    }
  });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  try {
    await navigator.serviceWorker.register("./sw.js");
  } catch {
    // Service worker registration can fail silently in local file mode.
  }
}

function syncLanguageSelect() {
  if (!languageSelect.options.length) {
    LOCALE_OPTIONS.forEach((option) => {
      const node = document.createElement("option");
      node.value = option.id;
      node.textContent = option.label;
      languageSelect.append(node);
    });
  }
  languageSelect.value = appState.locale;
}

function syncStaticCopy() {
  const t = appState.t;
  document.documentElement.lang = appState.locale;

  setText(skipLink, t("app.skipToContent"));
  setText(brandLink, t("app.brand"));
  if (topNav) {
    topNav.setAttribute("aria-label", t("app.navSection"));
  }
  setText(navHome, t("app.nav.home"));
  setText(navTests, t("app.nav.tests"));
  setText(navProfile, t("app.nav.profile"));
  setText(languageLabel, t("app.language"));

  setText(fallbackTitle, t("app.fallback.title"));
  setText(fallbackDesc, t("app.fallback.description"));
  setText(fallbackCache, t("app.fallback.cacheHint"));
  setText(fallbackOpenTests, t("app.fallback.openTests"));
  setText(noscriptTitle, t("app.noscript.title"));
  setText(noscriptDesc, t("app.noscript.description"));
  setText(footerCopy, t("app.footer"));

  syncThemeToggle();
}

function applyLocale(locale, { persist = true } = {}) {
  appState.locale = normalizeLocale(locale);
  appState.t = createTranslator(appState.locale);
  if (persist) {
    saveLocalePreference(appState.locale);
  }
  syncLanguageSelect();
  syncStaticCopy();
}

function initLocale() {
  const savedLocale = loadLocalePreference();
  const preferred = detectPreferredLocale(savedLocale);
  applyLocale(preferred, { persist: true });

  languageSelect.addEventListener("change", () => {
    applyLocale(languageSelect.value, { persist: true });
    router.renderCurrent();
  });
}

function markActiveNav(path) {
  const links = Array.from(document.querySelectorAll(".top-nav a"));
  links.forEach((link) => {
    link.classList.remove("is-active");
    const href = link.getAttribute("href") || "";
    const routePath = href.replace(/^#/, "") || "/";
    if (path === routePath || (routePath === "/tests" && path.startsWith("/quiz/"))) {
      link.classList.add("is-active");
    }
  });
}

function routeMeta(path, params, registry) {
  const t = appState.t;
  if (path === "/") {
    return {
      title: t("meta.homeTitle"),
      description: t("meta.homeDescription"),
    };
  }

  if (path === "/tests") {
    return {
      title: t("meta.testsTitle"),
      description: t("meta.testsDescription"),
    };
  }

  if (path === "/profile") {
    return {
      title: t("meta.profileTitle"),
      description: t("meta.profileDescription"),
    };
  }

  if (path.startsWith("/quiz/")) {
    const quiz = registry?.tests.find((item) => item.id === params.quizId);
    return {
      title: `${quiz?.title || t("meta.quizFallbackTitle")} | ${t("app.brand")}`,
      description: quiz?.description || t("meta.quizFallbackDescription"),
    };
  }

  if (path === "/share") {
    return {
      title: t("meta.shareTitle"),
      description: t("meta.shareDescription"),
    };
  }

  return {
    title: t("meta.notFoundTitle"),
    description: t("meta.notFoundDescription"),
  };
}

async function ensureRegistry(locale) {
  if (appState.registry && appState.registryLocale === locale) {
    return;
  }
  if (appState.registryError && appState.registryLocale === locale) {
    return;
  }

  try {
    appState.registry = await loadRegistry(locale);
    appState.registryLocale = locale;
    appState.registryError = null;
  } catch (error) {
    appState.registry = null;
    appState.registryLocale = locale;

    if (error instanceof QuizLoadError) {
      appState.registryError = {
        title: error.message,
        details: error.details,
      };
      return;
    }

    appState.registryError = {
      title: "Registry failed to load.",
      details: ["Unexpected error while loading ./data/registry.json"],
    };
  }
}

function registryErrorView() {
  const t = appState.t;
  return Card({
    title: t("common.registryErrorTitle"),
    description: t("common.registryErrorDesc"),
    children: [
      ErrorBox(appState.registryError?.title || t("common.unknownError"), appState.registryError?.details),
    ],
  });
}

const routes = [
  { pattern: "/", id: "home" },
  { pattern: "/tests", id: "tests" },
  { pattern: "/quiz/:quizId", id: "quiz" },
  { pattern: "/profile", id: "profile" },
  { pattern: "/share", id: "share" },
  { pattern: "*", id: "not-found" },
];

const router = new Router({
  routes,
  onRouteChange: async ({ route, path, query, params }) => {
    await ensureRegistry(appState.locale);
    markActiveNav(path);

    const meta = routeMeta(path, params, appState.registry);
    updateSeo({
      title: meta.title,
      description: meta.description,
      url: `${window.location.origin}${window.location.pathname}#${path}`,
    });

    clearNode(appNode);

    let node;
    if (appState.registryError) {
      node = registryErrorView();
    } else if (route.id === "home") {
      node = renderHomeView({
        registry: appState.registry,
        latestResults: latestResultsByQuiz(),
        t: appState.t,
      });
    } else if (route.id === "tests") {
      node = renderTestsView({
        registry: appState.registry,
        latestResults: latestResultsByQuiz(),
        t: appState.t,
      });
    } else if (route.id === "quiz") {
      appState.shareNotice = "";
      node = await renderQuizView({
        quizId: params.quizId,
        registry: appState.registry,
        appState,
        locale: appState.locale,
        t: appState.t,
        refresh: () => router.renderCurrent(),
      });
    } else if (route.id === "profile") {
      node = renderProfileView({
        registry: appState.registry,
        locale: appState.locale,
        t: appState.t,
        refresh: () => router.renderCurrent(),
      });
    } else if (route.id === "share") {
      node = renderShareView({
        query,
        registry: appState.registry,
        appState,
        locale: appState.locale,
        t: appState.t,
        refresh: () => router.renderCurrent(),
      });
    } else {
      node = Card({
        title: appState.t("common.pageNotFoundTitle"),
        description: appState.t("common.pageNotFoundDesc"),
      });
    }

    appNode.append(node);
    appNode.focus();
  },
});

initLocale();
initTheme();
registerServiceWorker();
router.start();
