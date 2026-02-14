import { Button, Card } from "../lib/components.js";
import { el } from "../lib/dom.js";
import { clearResults, listResults, latestResultsByQuiz } from "../lib/storage.js";

function formatDate(iso, locale) {
  try {
    return new Date(iso).toLocaleString(locale);
  } catch {
    return iso;
  }
}

export function renderProfileView({ registry, locale, t, refresh }) {
  const allResults = listResults();
  const latestMap = latestResultsByQuiz();

  if (!allResults.length) {
    return Card({
      title: t("profile.title"),
      description: t("profile.emptyDescription"),
      children: [Button({ label: t("profile.browseTests"), href: "#/tests", variant: "primary" })],
    });
  }

  const summaryCards = el("section", { className: "surface-grid two" });
  registry.tests.forEach((test) => {
    const latest = latestMap.get(test.id);
    if (!latest) {
      return;
    }
    summaryCards.append(
      Card({
        title: test.title,
        description: latest.resultTitle,
        children: [
          el("p", {
            className: "quiet",
            text: t("profile.confidenceAt", {
              confidence: latest.confidencePercent,
              date: formatDate(latest.takenAt, locale),
            }),
          }),
          Button({ label: t("profile.retake"), href: `#/quiz/${test.id}` }),
        ],
      })
    );
  });

  const historyList = Card({
    title: t("profile.savedHistory"),
    description: t("profile.localOnly"),
    children: [
      el(
        "div",
        { className: "stack-sm" },
        allResults.map((result) =>
          el("article", { className: "result-card-preview" }, [
            el("h3", { text: `${result.quizTitle}: ${result.resultTitle}` }),
            el("p", {
              className: "quiet",
              text: t("profile.historyItem", {
                date: formatDate(result.takenAt, locale),
                confidence: result.confidencePercent,
              }),
            }),
            result.code
              ? el("p", {
                  className: "quiet",
                  text: `${t("common.code")}: ${result.code}`,
                })
              : null,
          ])
        )
      ),
    ],
  });

  const privacyCard = Card({
    title: t("profile.localPrivacyTitle"),
    description: t("profile.localPrivacyDescription"),
    children: [
      el("div", { className: "row-actions" }, [
        Button({ label: t("profile.takeAnotherTest"), href: "#/tests", variant: "primary" }),
        Button({
          label: t("profile.clearLocalData"),
          onClick: () => {
            clearResults();
            refresh();
          },
        }),
      ]),
    ],
  });

  return el("div", { className: "surface-grid" }, [summaryCards, historyList, privacyCard]);
}
