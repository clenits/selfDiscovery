import { Card, ErrorBox } from "./js/lib/components.js";
import { clearNode } from "./js/lib/dom.js";
import { loadRegistry, QuizLoadError } from "./js/lib/quiz-loader.js";
import { updateSeo } from "./js/lib/meta.js";
import { Router } from "./js/lib/router.js";
import {
  latestResultsByQuiz,
  loadThemePreference,
  saveThemePreference,
} from "./js/lib/storage.js";
import { renderHomeView } from "./js/views/home-view.js";
import { renderProfileView } from "./js/views/profile-view.js";
import { renderQuizView } from "./js/views/quiz-view.js";
import { renderShareView } from "./js/views/share-view.js";
import { renderTestsView } from "./js/views/tests-view.js";

const appNode = document.querySelector("#app");
const themeToggle = document.querySelector("#theme-toggle");

const appState = {
  sessions: {},
  shareNotice: "",
  registry: null,
  registryError: null,
};

document.body.dataset.enhanced = "true";

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
  themeToggle.textContent = darkMode ? "Theme: Dark" : "Theme: Light";
  themeToggle.setAttribute("aria-pressed", String(darkMode));
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
  if (path === "/") {
    return {
      title: "Self Discovery Lab",
      description: "A place to learn about yourself with offline data-driven tests.",
    };
  }

  if (path === "/tests") {
    return {
      title: "Tests | Self Discovery Lab",
      description: "Browse personality and house sorting quizzes.",
    };
  }

  if (path === "/profile") {
    return {
      title: "My Profile | Self Discovery Lab",
      description: "View your locally saved quiz outcomes and history.",
    };
  }

  if (path.startsWith("/quiz/")) {
    const quiz = registry?.tests.find((item) => item.id === params.quizId);
    return {
      title: `${quiz?.title || "Quiz"} | Self Discovery Lab`,
      description: quiz?.description || "Take this self discovery test.",
    };
  }

  if (path === "/share") {
    return {
      title: "Shared Result | Self Discovery Lab",
      description: "View a shared Self Discovery result card.",
    };
  }

  return {
    title: "Not Found | Self Discovery Lab",
    description: "The requested route was not found.",
  };
}

async function ensureRegistry() {
  if (appState.registry || appState.registryError) {
    return;
  }
  try {
    appState.registry = await loadRegistry();
  } catch (error) {
    if (error instanceof QuizLoadError) {
      appState.registryError = {
        title: error.message,
        details: error.details,
      };
      return;
    }
    appState.registryError = {
      title: "Registry failed to load.",
      details: ["Unexpected error while loading /discover/data/registry.json"],
    };
  }
}

function registryErrorView() {
  return Card({
    title: "Quiz Registry Error",
    description: "Quiz data could not be loaded. Check JSON schema and file paths.",
    children: [
      ErrorBox(appState.registryError?.title || "Unknown error", appState.registryError?.details),
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
    await ensureRegistry();
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
      });
    } else if (route.id === "tests") {
      node = renderTestsView({
        registry: appState.registry,
        latestResults: latestResultsByQuiz(),
      });
    } else if (route.id === "quiz") {
      appState.shareNotice = "";
      node = await renderQuizView({
        quizId: params.quizId,
        registry: appState.registry,
        appState,
        refresh: () => router.renderCurrent(),
      });
    } else if (route.id === "profile") {
      node = renderProfileView({
        registry: appState.registry,
        refresh: () => router.renderCurrent(),
      });
    } else if (route.id === "share") {
      node = renderShareView({
        query,
        registry: appState.registry,
        appState,
        refresh: () => router.renderCurrent(),
      });
    } else {
      node = Card({
        title: "Page Not Found",
        description: "That route does not exist.",
      });
    }

    appNode.append(node);
    appNode.focus();
  },
});

initTheme();
registerServiceWorker();
router.start();
