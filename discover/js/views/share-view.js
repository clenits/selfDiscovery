import { Button, Card, ErrorBox } from "../lib/components.js";
import { el } from "../lib/dom.js";
import {
  copyText,
  createResultCanvas,
  decodeSharePayload,
  downloadCanvas,
} from "../lib/share-card.js";

export function renderShareView({ query, registry, appState, refresh }) {
  const encoded = query.get("d");
  const payload = encoded ? decodeSharePayload(decodeURIComponent(encoded)) : null;

  if (!payload) {
    return Card({
      title: "Shared Result",
      description: "This link is missing or has invalid data.",
      children: [
        ErrorBox("Unable to decode shared payload", [
          "Use a valid link generated from a quiz result page.",
        ]),
        Button({ label: "Back to Tests", href: "#/tests" }),
      ],
    });
  }

  const quizMeta = registry.tests.find((item) => item.id === payload.quizId);
  const quizTitle = payload.quizTitle || quizMeta?.title || "Shared Quiz";
  const shareLink = window.location.href;

  const card = Card({
    title: payload.resultTitle,
    description: payload.resultSummary,
    children: [
      payload.resultDetails ? el("p", { text: payload.resultDetails }) : null,
      el("p", {
        className: "quiet",
        text: `From ${quizTitle} · Confidence ${payload.confidencePercent || 0}%`,
      }),
      payload.takenAt
        ? el("p", {
            className: "quiet",
            text: `Captured ${new Date(payload.takenAt).toLocaleString()}`,
          })
        : null,
    ],
  });

  const actions = Card({
    title: "Share Actions",
    description: "Regenerate the card image or open the original quiz.",
    children: [
      el("div", { className: "row-actions" }, [
        Button({
          label: "Download PNG",
          variant: "primary",
          onClick: () => {
            const canvas = createResultCanvas({
              quizTitle,
              resultTitle: payload.resultTitle,
              resultSummary: payload.resultSummary,
              confidencePercent: payload.confidencePercent || 0,
              link: shareLink,
            });
            downloadCanvas(canvas, `${payload.quizId || "shared"}-result.png`);
          },
        }),
        Button({
          label: "Copy Link",
          onClick: async () => {
            const copied = await copyText(shareLink);
            appState.shareNotice = copied ? "Link copied." : "Copy failed in this browser.";
            refresh();
          },
        }),
        quizMeta ? Button({ label: "Take This Test", href: `#/quiz/${quizMeta.id}` }) : null,
      ]),
      appState.shareNotice ? el("p", { className: "quiet", text: appState.shareNotice }) : null,
    ],
  });

  return el("div", { className: "surface-grid" }, [card, actions]);
}
