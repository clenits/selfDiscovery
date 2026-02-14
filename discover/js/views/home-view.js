import { Button, Card } from "../lib/components.js";
import { el } from "../lib/dom.js";

export function renderHomeView({ registry, latestResults, t }) {
  const intro = Card({
    title: t("home.title"),
    description: t("home.description"),
    children: [
      el("div", { className: "row-actions" }, [
        Button({ label: t("home.browseTests"), href: "#/tests", variant: "primary" }),
        Button({ label: t("home.openProfile"), href: "#/profile" }),
      ]),
      el("p", {
        className: "quiet",
        text: t("home.progressiveNote"),
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
                  text: t("common.latestResult", {
                    title: latest.resultTitle,
                    confidence: latest.confidencePercent,
                  }),
                })
              : el("span", {
                  className: "quiet",
                  text: t("common.noSavedResult"),
                }),
          ]),
          Button({ label: t("home.start"), href: `#/quiz/${test.id}`, variant: "primary" }),
        ],
      })
    );
  });

  return el("div", { className: "surface-grid" }, [intro, testPreview]);
}
