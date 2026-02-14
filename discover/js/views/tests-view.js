import { Button, Card } from "../lib/components.js";
import { el } from "../lib/dom.js";

export function renderTestsView({ registry, latestResults, t }) {
  const heading = Card({
    title: t("tests.title"),
    description: t("tests.description"),
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
              text: t("common.savedResult", {
                title: latest.resultTitle,
                confidence: latest.confidencePercent,
              }),
            })
          : el("p", {
              className: "quiet",
              text: t("common.noLocalSavedResult"),
            }),
        el("div", { className: "row-actions" }, [
          Button({ label: t("tests.takeTest"), href: `#/quiz/${test.id}`, variant: "primary" }),
          latest ? Button({ label: t("tests.viewProfile"), href: "#/profile" }) : null,
        ]),
      ],
    });
    list.append(card);
  });

  return el("div", { className: "surface-grid" }, [heading, list]);
}
