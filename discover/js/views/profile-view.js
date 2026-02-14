import { Button, Card } from "../lib/components.js";
import { el } from "../lib/dom.js";
import { clearResults, listResults, latestResultsByQuiz } from "../lib/storage.js";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function renderProfileView({ registry, refresh }) {
  const allResults = listResults();
  const latestMap = latestResultsByQuiz();

  if (!allResults.length) {
    return Card({
      title: "My Profile",
      description:
        "No saved results yet. Complete a test and your latest results will appear here.",
      children: [Button({ label: "Browse Tests", href: "#/tests", variant: "primary" })],
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
            text: `Confidence ${latest.confidencePercent}% · ${formatDate(latest.takenAt)}`,
          }),
          Button({ label: "Retake", href: `#/quiz/${test.id}` }),
        ],
      })
    );
  });

  const historyList = Card({
    title: "Saved History",
    description: "Stored in this browser only.",
    children: [
      el(
        "div",
        { className: "stack-sm" },
        allResults.map((result) =>
          el("article", { className: "result-card-preview" }, [
            el("h3", { text: `${result.quizTitle}: ${result.resultTitle}` }),
            el("p", {
              className: "quiet",
              text: `${formatDate(result.takenAt)} · Confidence ${result.confidencePercent}%`,
            }),
            result.code ? el("p", { className: "quiet", text: `Code: ${result.code}` }) : null,
          ])
        )
      ),
    ],
  });

  const privacyCard = Card({
    title: "Local Privacy",
    description: "Data never leaves your browser unless you manually share a link.",
    children: [
      el("div", { className: "row-actions" }, [
        Button({ label: "Take Another Test", href: "#/tests", variant: "primary" }),
        Button({
          label: "Clear Local Data",
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
