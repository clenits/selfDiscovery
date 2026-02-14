import { Button, Card } from "../lib/components.js";
import { el } from "../lib/dom.js";

export function renderTestsView({ registry, latestResults }) {
  const heading = Card({
    title: "Available Tests",
    description:
      "Each quiz is driven by JSON data. Add new tests by dropping a data file and registering metadata.",
  });

  const list = el("div", { className: "quiz-list" });

  registry.tests.forEach((test) => {
    const latest = latestResults.get(test.id);
    const card = Card({
      className: "stack-sm",
      title: test.title,
      description: test.description,
      children: [
        el("div", { className: "field-inline" }, [
          el("span", { className: "pill", text: test.durationEstimate }),
          ...((test.tags || []).map((tag) => el("span", { className: "quiet", text: tag }))),
        ]),
        latest
          ? el("p", {
              className: "quiet",
              text: `Saved result: ${latest.resultTitle} (${latest.confidencePercent}% confidence)`,
            })
          : el("p", {
              className: "quiet",
              text: "No local result saved yet.",
            }),
        el("div", { className: "row-actions" }, [
          Button({ label: "Take Test", href: `#/quiz/${test.id}`, variant: "primary" }),
          latest ? Button({ label: "View Profile", href: "#/profile" }) : null,
        ]),
      ],
    });
    list.append(card);
  });

  return el("div", { className: "surface-grid" }, [heading, list]);
}
