import { el, appendChildren } from "./dom.js";

export function Card({ title, description, className = "", children = [] }) {
  const card = el("section", { className: `card stack-md ${className}`.trim() });
  if (title) {
    card.append(el("h2", { text: title }));
  }
  if (description) {
    card.append(el("p", { text: description }));
  }
  appendChildren(card, children);
  return card;
}

export function Button({
  label,
  variant = "",
  onClick,
  type = "button",
  href,
  attrs = {},
}) {
  if (href) {
    return el(
      "a",
      {
        className: `ui-link-button ${variant}`.trim(),
        attrs: { href, ...attrs },
      },
      label
    );
  }
  return el(
    "button",
    {
      className: `ui-button ${variant}`.trim(),
      type,
      on: onClick ? { click: onClick } : undefined,
      attrs,
    },
    label
  );
}

export function Toggle({
  label,
  pressed,
  onClick,
  attrs = {},
}) {
  return el(
    "button",
    {
      className: "ui-toggle",
      type: "button",
      attrs: {
        "aria-pressed": String(Boolean(pressed)),
        ...attrs,
      },
      on: onClick ? { click: onClick } : undefined,
    },
    label
  );
}

export function ProgressBar({ value, max, label }) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const pct = Math.round((clamped / safeMax) * 100);

  return el("div", { className: "progress-wrap" }, [
    el("div", {
      className: "quiet",
      attrs: {
        role: "status",
        "aria-live": "polite",
      },
      text: label || `${pct}% complete`,
    }),
    el(
      "div",
      {
        className: "progress-bar",
        attrs: {
          role: "progressbar",
          "aria-valuemin": "0",
          "aria-valuemax": String(safeMax),
          "aria-valuenow": String(clamped),
          "aria-label": label || "Quiz progress",
        },
      },
      el("span", {
        className: "progress-fill",
        attrs: { style: `width:${pct}%` },
      })
    ),
  ]);
}

export function RadioList({
  name,
  options,
  value,
  multiple = false,
  onChange,
  ariaLabel,
}) {
  const list = el("fieldset", {
    className: "radio-list",
    attrs: {
      "aria-label": ariaLabel || name,
    },
  });

  options.forEach((option) => {
    const isChecked = multiple
      ? Array.isArray(value) && value.includes(option.id)
      : value === option.id;

    const input = el("input", {
      type: multiple ? "checkbox" : "radio",
      checked: isChecked,
      attrs: {
        name,
        value: option.id,
      },
      on: {
        change: (event) => {
          if (!onChange) {
            return;
          }
          if (!multiple) {
            onChange(event.target.value);
            return;
          }
          const next = Array.isArray(value) ? [...value] : [];
          const idx = next.indexOf(option.id);
          if (event.target.checked && idx === -1) {
            next.push(option.id);
          } else if (!event.target.checked && idx >= 0) {
            next.splice(idx, 1);
          }
          onChange(next);
        },
      },
    });

    const label = el(
      "label",
      { className: `radio-item ${isChecked ? "selected" : ""}`.trim() },
      [
        input,
        el("div", { className: "stack-sm" }, [
          el("span", { text: option.label }),
          option.hint ? el("span", { className: "quiet", text: option.hint }) : null,
        ]),
      ]
    );
    list.append(label);
  });

  return list;
}

export function Question({
  index,
  total,
  prompt,
  description,
  inputControl,
}) {
  return el("section", { className: "card stack-md" }, [
    el("div", { className: "question-meta" }, [
      el("span", { className: "pill", text: `Question ${index} of ${total}` }),
      el("span", { className: "quiet", text: "Answer required" }),
    ]),
    el("h3", { className: "question-title", text: prompt }),
    description ? el("p", { text: description }) : null,
    inputControl,
  ]);
}

export function ErrorBox(title, errors = []) {
  return el("section", { className: "error-box stack-sm" }, [
    el("h3", { text: title }),
    errors.length
      ? el(
          "ul",
          {},
          errors.map((item) => el("li", { text: item }))
        )
      : null,
  ]);
}
