function parseHashLocation() {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [pathPart, queryPart] = raw.split("?");
  const path = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  return {
    path,
    query: new URLSearchParams(queryPart || ""),
  };
}

function compilePattern(pattern) {
  const segments = pattern.split("/").filter(Boolean);
  const keys = [];
  const regexParts = segments.map((segment) => {
    if (segment.startsWith(":")) {
      keys.push(segment.slice(1));
      return "([^/]+)";
    }
    return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  });
  const regex = new RegExp(`^/${regexParts.join("/")}$`);
  return { regex, keys };
}

function matchRoute(path, route) {
  if (route.pattern === "*") {
    return { params: {} };
  }
  const { regex, keys } = route._compiled;
  const match = path.match(regex);
  if (!match) {
    return null;
  }
  const params = {};
  keys.forEach((key, index) => {
    params[key] = decodeURIComponent(match[index + 1]);
  });
  return { params };
}

export class Router {
  constructor({ routes, onRouteChange }) {
    this.routes = routes.map((route) => ({
      ...route,
      _compiled: route.pattern === "*" ? null : compilePattern(route.pattern),
    }));
    this.onRouteChange = onRouteChange;
    this._boundHandler = this.renderCurrent.bind(this);
  }

  start() {
    window.addEventListener("hashchange", this._boundHandler);
    this.renderCurrent();
  }

  stop() {
    window.removeEventListener("hashchange", this._boundHandler);
  }

  navigate(path) {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    window.location.hash = normalized;
  }

  async renderCurrent() {
    const { path, query } = parseHashLocation();
    let active = this.routes.find((route) => matchRoute(path, route));
    if (!active) {
      active = this.routes.find((route) => route.pattern === "*");
    }

    const matched = matchRoute(path, active) || { params: {} };
    await this.onRouteChange({
      route: active,
      path,
      query,
      params: matched.params,
    });
  }
}
