import { Button, Card, ErrorBox } from "../lib/components.js";
import { el } from "../lib/dom.js";
import {
  copyText,
  createResultCanvas,
  decodeSharePayload,
  downloadCanvas,
} from "../lib/share-card.js";

export function renderShareView({ query, registry, appState, locale, t, refresh }) {
  const encoded = query.get("d");
  const payload = encoded ? decodeSharePayload(decodeURIComponent(encoded)) : null;

  if (!payload) {
    return Card({
      title: t("share.title"),
      description: t("share.invalidDescription"),
      children: [
        ErrorBox(t("share.decodeErrorTitle"), [
          t("share.decodeErrorHint"),
        ]),
        Button({ label: t("common.backToTests"), href: "#/tests" }),
      ],
    });
  }

  const quizMeta = registry.tests.find((item) => item.id === payload.quizId);
  const quizTitle = payload.quizTitle || quizMeta?.title || t("share.sharedQuizFallback");
  const shareLink = window.location.href;

  const card = Card({
    title: payload.resultTitle,
    description: payload.resultSummary,
    children: [
      payload.resultDetails ? el("p", { text: payload.resultDetails }) : null,
      el("p", {
        className: "quiet",
        text: t("share.fromQuiz", {
          quizTitle,
          confidence: payload.confidencePercent || 0,
        }),
      }),
      payload.takenAt
        ? el("p", {
            className: "quiet",
            text: t("share.capturedAt", {
              date: new Date(payload.takenAt).toLocaleString(locale),
            }),
          })
        : null,
    ],
  });

  const actions = Card({
    title: t("share.actionsTitle"),
    description: t("share.actionsDescription"),
    children: [
      el("div", { className: "row-actions" }, [
        Button({
          label: t("quiz.downloadPng"),
          variant: "primary",
          onClick: () => {
            const canvas = createResultCanvas({
              quizTitle,
              resultTitle: payload.resultTitle,
              resultSummary: payload.resultSummary,
              confidencePercent: payload.confidencePercent || 0,
              link: shareLink,
              confidenceLabel: t("common.confidence"),
              brandLabel: t("app.brand"),
            });
            downloadCanvas(canvas, `${payload.quizId || "shared"}-result.png`);
          },
        }),
        Button({
          label: t("share.copyLink"),
          onClick: async () => {
            const copied = await copyText(shareLink);
            appState.shareNotice = copied ? t("common.linkCopied") : t("common.copyFailed");
            refresh();
          },
        }),
        quizMeta ? Button({ label: t("share.takeThisTest"), href: `#/quiz/${quizMeta.id}` }) : null,
      ]),
      appState.shareNotice ? el("p", { className: "quiet", text: appState.shareNotice }) : null,
    ],
  });

  return el("div", { className: "surface-grid" }, [card, actions]);
}
