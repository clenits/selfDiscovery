import {
  Button,
  Card,
  ErrorBox,
  ProgressBar,
  Question,
  RadioList,
} from "../lib/components.js";
import { el } from "../lib/dom.js";
import { loadQuizById, QuizLoadError } from "../lib/quiz-loader.js";
import {
  createInitialAnswers,
  isQuestionAnswered,
  scoreQuiz,
} from "../lib/quiz-engine.js";
import { saveResult } from "../lib/storage.js";
import {
  buildSharePayload,
  encodeSharePayload,
  copyText,
  createResultCanvas,
  downloadCanvas,
  fillTemplate,
} from "../lib/share-card.js";

function getSession(appState, quiz) {
  if (!appState.sessions[quiz.id]) {
    appState.sessions[quiz.id] = {
      currentIndex: 0,
      answers: createInitialAnswers(quiz),
      result: null,
      error: "",
      notice: "",
    };
  }
  return appState.sessions[quiz.id];
}

function renderSlider(question, value, onChange) {
  const slider = el("input", {
    className: "slider-input",
    type: "range",
    value: String(value),
    attrs: {
      min: String(question.min),
      max: String(question.max),
      step: String(question.step),
      "aria-label": question.prompt,
    },
    on: {
      input: (event) => {
        onChange(Number(event.target.value));
      },
    },
  });

  return el("div", { className: "slider-wrap" }, [
    slider,
    el("div", { className: "field-inline" }, [
      question.labelLow ? el("span", { className: "quiet", text: question.labelLow }) : null,
      el("span", { className: "pill", text: String(value) }),
      question.labelHigh
        ? el("span", { className: "quiet", text: question.labelHigh })
        : null,
    ]),
  ]);
}

function renderQuestionControl(question, answer, setAnswer) {
  if (question.type === "single-choice") {
    return RadioList({
      name: question.id,
      options: question.options,
      value: answer,
      onChange: setAnswer,
      ariaLabel: question.prompt,
    });
  }

  if (question.type === "multi-choice") {
    return RadioList({
      name: question.id,
      options: question.options,
      value: answer,
      onChange: setAnswer,
      ariaLabel: question.prompt,
      multiple: true,
    });
  }

  return renderSlider(question, answer, setAnswer);
}

function renderAxisBreakdown(result) {
  const rows = el("div", { className: "axis-bars" });
  result.rankedDimensions.forEach((item) => {
    rows.append(
      el("div", { className: "axis-row" }, [
        el("span", {
          text: `${item.dimension}: ${item.score} (${item.percent}%)`,
        }),
        ProgressBar({
          value: item.percent,
          max: 100,
          label: `${item.dimension} score`,
        }),
      ])
    );
  });
  return rows;
}

function renderResultView({ quiz, session, refresh }) {
  const result = session.result;
  const sharePayload = buildSharePayload({
    quizId: quiz.id,
    quizTitle: quiz.title,
    result,
  });
  const encodedPayload = encodeURIComponent(encodeSharePayload(sharePayload));
  const shareUrl = `${window.location.origin}${window.location.pathname}#/share?d=${encodedPayload}`;

  const replacements = {
    quizTitle: quiz.title,
    resultTitle: result.title,
    resultSummary: result.summary,
    confidencePercent: result.confidencePercent,
  };

  const shareCardTitle = fillTemplate(quiz.shareCard.titleTemplate, replacements);
  const shareCardSubtitle = fillTemplate(quiz.shareCard.subtitleTemplate, replacements);
  const shareCardFooter = fillTemplate(quiz.shareCard.footerTemplate, replacements);

  const resultCard = Card({
    title: result.title,
    description: result.summary,
    children: [
      result.details ? el("p", { text: result.details }) : null,
      el("p", { className: "quiet", text: `Confidence: ${result.confidencePercent}%` }),
      result.code
        ? el("p", { className: "quiet", text: `Code: ${result.code}` })
        : null,
      renderAxisBreakdown(result),
    ],
  });

  const sharePreview = Card({
    title: "Shareable Card",
    description:
      "Generate a local image via canvas and copy a hash-link that reproduces this result view.",
    children: [
      el("article", { className: "result-card-preview" }, [
        el("h3", { text: shareCardTitle }),
        el("p", { text: shareCardSubtitle }),
        el("p", { className: "quiet", text: shareCardFooter }),
      ]),
      el("div", { className: "row-actions" }, [
        Button({
          label: "Download PNG",
          variant: "primary",
          onClick: () => {
            const canvas = createResultCanvas({
              quizTitle: shareCardTitle,
              resultTitle: result.title,
              resultSummary: shareCardSubtitle,
              confidencePercent: result.confidencePercent,
              link: shareUrl,
              accent: quiz.shareCard.accent,
            });
            downloadCanvas(canvas, `${quiz.id}-result.png`);
          },
        }),
        Button({
          label: "Copy Share Link",
          onClick: async () => {
            const copied = await copyText(shareUrl);
            session.notice = copied ? "Share link copied." : "Copy failed in this browser.";
            refresh();
          },
        }),
        Button({ label: "Open Share View", href: `#/share?d=${encodedPayload}` }),
      ]),
      session.notice ? el("p", { className: "quiet", text: session.notice }) : null,
    ],
  });

  const actions = Card({
    title: "What Next",
    description: "Save remains local to this browser only.",
    children: [
      el("div", { className: "row-actions" }, [
        Button({
          label: "Retake Quiz",
          onClick: () => {
            session.currentIndex = 0;
            session.answers = createInitialAnswers(quiz);
            session.result = null;
            session.error = "";
            session.notice = "";
            refresh();
          },
        }),
        Button({ label: "Back to Tests", href: "#/tests" }),
        Button({ label: "My Profile", href: "#/profile" }),
      ]),
    ],
  });

  return el("div", { className: "surface-grid" }, [resultCard, sharePreview, actions]);
}

export async function renderQuizView({ quizId, registry, appState, refresh }) {
  let quiz;
  try {
    quiz = await loadQuizById(quizId, registry);
  } catch (error) {
    const detail =
      error instanceof QuizLoadError
        ? error.details
        : ["Unexpected error while loading quiz."];
    return el("div", { className: "surface-grid" }, [
      Card({
        title: "Quiz Unavailable",
        description: `Could not load '${quizId}'.`,
        children: [ErrorBox("Validation or loading errors", detail)],
      }),
      Button({ label: "Back to Tests", href: "#/tests" }),
    ]);
  }

  const session = getSession(appState, quiz);

  if (session.result) {
    return renderResultView({ quiz, session, refresh });
  }

  const question = quiz.questions[session.currentIndex];
  const total = quiz.questions.length;
  const answer = session.answers[question.id];

  const setAnswer = (nextValue) => {
    session.answers[question.id] = nextValue;
    session.error = "";
    refresh();
  };

  const progress = ProgressBar({
    value: session.currentIndex + 1,
    max: total,
    label: `Question ${session.currentIndex + 1} of ${total}`,
  });

  const questionCard = Question({
    index: session.currentIndex + 1,
    total,
    prompt: question.prompt,
    description: question.description,
    inputControl: renderQuestionControl(question, answer, setAnswer),
  });

  const moveNext = () => {
    if (!isQuestionAnswered(question, session.answers[question.id])) {
      session.error = "Choose at least one answer to continue.";
      refresh();
      return;
    }

    if (session.currentIndex < total - 1) {
      session.currentIndex += 1;
      session.error = "";
      refresh();
      return;
    }

    const result = scoreQuiz(quiz, session.answers);
    session.result = result;
    session.error = "";
    session.notice = "";

    saveResult({
      quizId: quiz.id,
      quizTitle: quiz.title,
      resultId: result.id,
      resultTitle: result.title,
      resultSummary: result.summary,
      confidencePercent: result.confidencePercent,
      scores: result.scores,
      code: result.code,
      takenAt: result.takenAt,
    });

    refresh();
  };

  const moveBack = () => {
    if (session.currentIndex > 0) {
      session.currentIndex -= 1;
      session.error = "";
      refresh();
    }
  };

  const header = Card({
    title: quiz.title,
    description: quiz.description,
    children: [
      el("div", { className: "field-inline" }, [
        el("span", { className: "pill", text: quiz.durationEstimate }),
        el("span", { className: "quiet", text: "Local-only answers" }),
      ]),
      progress,
    ],
  });

  const navActions = el("section", { className: "card stack-sm" }, [
    session.error ? ErrorBox("Question required", [session.error]) : null,
    el("div", { className: "row-actions" }, [
      Button({
        label: "Back",
        onClick: moveBack,
        attrs: { disabled: session.currentIndex === 0 ? "true" : undefined },
      }),
      Button({
        label: session.currentIndex === total - 1 ? "Finish" : "Next",
        variant: "primary",
        onClick: moveNext,
      }),
      Button({ label: "Quit", href: "#/tests" }),
    ]),
  ]);

  return el("div", { className: "surface-grid" }, [header, questionCard, navActions]);
}
