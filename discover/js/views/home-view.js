import { Button, Card } from "../lib/components.js";
import { el } from "../lib/dom.js";

export function renderHomeView({ registry, latestResults }) {
  const intro = Card({
    title: "A Place To Learn About Yourself",
    description:
      "Choose a test, answer at your own pace, and save results locally on this device.",
    children: [
      el("div", { className: "row-actions" }, [
        Button({ label: "Browse Tests", href: "#/tests", variant: "primary" }),
        Button({ label: "Open My Profile", href: "#/profile" }),
      ]),
      el("p", {
        className: "quiet",
        text: "Progressive enhancement: if JavaScript is unavailable, fallback content remains visible.",
      }),
    ],
  });

  const testPreview = el("section", { className: "surface-grid two" });
  registry.tests.forEach((test) => {
    const latest = latestResults.get(test.id);
    testPreview.append(
      Card({
        title: test.title,
        description: test.description,
        children: [
          el("div", { className: "field-inline" }, [
            el("span", { className: "pill", text: test.durationEstimate }),
            latest
              ? el("span", {
                  className: "quiet",
                  text: `Latest: ${latest.resultTitle} (${latest.confidencePercent}% confidence)`,
                })
              : el("span", {
                  className: "quiet",
                  text: "No saved result yet",
                }),
          ]),
          Button({ label: "Start", href: `#/quiz/${test.id}`, variant: "primary" }),
        ],
      })
    );
  });

  return el("div", { className: "surface-grid" }, [intro, testPreview]);
}
