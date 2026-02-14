export function appendChildren(parent, children) {
  const list = Array.isArray(children) ? children : [children];
  list.flat().forEach((child) => {
    if (child === null || child === undefined || child === false) {
      return;
    }
    if (typeof child === "string" || typeof child === "number") {
      parent.append(document.createTextNode(String(child)));
      return;
    }
    parent.append(child);
  });
  return parent;
}

export function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  const {
    className,
    text,
    html,
    attrs,
    dataset,
    on,
    value,
    type,
    checked,
    disabled,
  } = options;

  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  if (html !== undefined) {
    node.innerHTML = html;
  }
  if (attrs) {
    Object.entries(attrs).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        node.setAttribute(key, String(val));
      }
    });
  }
  if (dataset) {
    Object.entries(dataset).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        node.dataset[key] = String(val);
      }
    });
  }
  if (on) {
    Object.entries(on).forEach(([evt, handler]) => {
      node.addEventListener(evt, handler);
    });
  }
  if (value !== undefined) {
    node.value = value;
  }
  if (type !== undefined) {
    node.type = type;
  }
  if (checked !== undefined) {
    node.checked = checked;
  }
  if (disabled !== undefined) {
    node.disabled = disabled;
  }

  appendChildren(node, children);
  return node;
}

export function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
