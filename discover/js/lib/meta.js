function ensureTag({ attr, value }) {
  let node = document.head.querySelector(`meta[${attr}="${value}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attr, value);
    document.head.append(node);
  }
  return node;
}

export function updateSeo({ title, description, url }) {
  document.title = title;

  const metaDesc = ensureTag({ attr: "name", value: "description" });
  metaDesc.setAttribute("content", description);

  const ogTitle = ensureTag({ attr: "property", value: "og:title" });
  ogTitle.setAttribute("content", title);

  const ogDescription = ensureTag({ attr: "property", value: "og:description" });
  ogDescription.setAttribute("content", description);

  const ogType = ensureTag({ attr: "property", value: "og:type" });
  ogType.setAttribute("content", "website");

  const ogUrl = ensureTag({ attr: "property", value: "og:url" });
  ogUrl.setAttribute("content", url);
}
