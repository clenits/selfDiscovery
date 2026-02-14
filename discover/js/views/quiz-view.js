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

function shuffleArray(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildOptionOrderByQuestion(quiz) {
  const order = {};
  quiz.questions.forEach((question) => {
    if (!Array.isArray(question.options) || !question.options.length) {
      return;
    }
    order[question.id] = shuffleArray(question.options.map((option) => option.id));
  });
  return order;
}

function resetAttemptState(session, quiz) {
  session.currentIndex = 0;
  session.answers = createInitialAnswers(quiz);
  session.result = null;
  session.error = "";
  session.notice = "";
  // Keep scoring stable by shuffling display order only; option ids/weights stay untouched.
  session.optionOrderByQuestion = buildOptionOrderByQuestion(quiz);
}

function resolveQuestionOptions(question, session) {
  if (!Array.isArray(question.options) || !question.options.length) {
    return [];
  }

  if (!session.optionOrderByQuestion) {
    session.optionOrderByQuestion = {};
  }

  const optionById = new Map(question.options.map((option) => [option.id, option]));
  const knownIds = new Set(question.options.map((option) => option.id));
  const savedOrder = session.optionOrderByQuestion[question.id];
  const isValidOrder =
    Array.isArray(savedOrder) &&
    savedOrder.length === question.options.length &&
    savedOrder.every((id) => knownIds.has(id));

  if (!isValidOrder) {
    session.optionOrderByQuestion[question.id] = shuffleArray([...knownIds]);
  }

  return session.optionOrderByQuestion[question.id]
    .map((id) => optionById.get(id))
    .filter(Boolean);
}

function getSession(appState, quiz) {
  if (!appState.sessions[quiz.id]) {
    const session = {};
    resetAttemptState(session, quiz);
    appState.sessions[quiz.id] = session;
  } else if (!appState.sessions[quiz.id].optionOrderByQuestion) {
    appState.sessions[quiz.id].optionOrderByQuestion = buildOptionOrderByQuestion(quiz);
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

function renderQuestionControl(question, options, answer, setAnswer) {
  if (question.type === "single-choice") {
    return RadioList({
      name: question.id,
      options,
      value: answer,
      onChange: setAnswer,
      ariaLabel: question.prompt,
    });
  }

  if (question.type === "multi-choice") {
    return RadioList({
      name: question.id,
      options,
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

function renderResultView({ quiz, session, refresh, t }) {
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
      el("p", { className: "quiet", text: `${t("common.confidence")}: ${result.confidencePercent}%` }),
      result.code
        ? el("p", { className: "quiet", text: `${t("common.code")}: ${result.code}` })
        : null,
      renderAxisBreakdown(result),
    ],
  });

  const sharePreview = Card({
    title: t("quiz.shareableCardTitle"),
    description: t("quiz.shareableCardDescription"),
    children: [
      el("article", { className: "result-card-preview" }, [
        el("h3", { text: shareCardTitle }),
        el("p", { text: shareCardSubtitle }),
        el("p", { className: "quiet", text: shareCardFooter }),
      ]),
      el("div", { className: "row-actions" }, [
        Button({
          label: t("quiz.downloadPng"),
          variant: "primary",
          onClick: () => {
            const canvas = createResultCanvas({
              quizTitle: shareCardTitle,
              resultTitle: result.title,
              resultSummary: shareCardSubtitle,
              confidencePercent: result.confidencePercent,
              link: shareUrl,
              accent: quiz.shareCard.accent,
              confidenceLabel: t("common.confidence"),
              brandLabel: t("app.brand"),
            });
            downloadCanvas(canvas, `${quiz.id}-result.png`);
          },
        }),
        Button({
          label: t("quiz.copyShareLink"),
          onClick: async () => {
            const copied = await copyText(shareUrl);
            session.notice = copied ? t("quiz.shareCopied") : t("common.copyFailed");
            refresh();
          },
        }),
        Button({ label: t("quiz.openShareView"), href: `#/share?d=${encodedPayload}` }),
      ]),
      session.notice ? el("p", { className: "quiet", text: session.notice }) : null,
    ],
  });

  const actions = Card({
    title: t("quiz.whatNextTitle"),
    description: t("quiz.whatNextDescription"),
    children: [
      el("div", { className: "row-actions" }, [
        Button({
          label: t("quiz.retakeQuiz"),
          onClick: () => {
            resetAttemptState(session, quiz);
            refresh();
          },
        }),
        Button({ label: t("common.backToTests"), href: "#/tests" }),
        Button({ label: t("app.nav.profile"), href: "#/profile" }),
      ]),
    ],
  });

  return el("div", { className: "surface-grid" }, [resultCard, sharePreview, actions]);
}

export async function renderQuizView({ quizId, registry, appState, locale, t, refresh }) {
  let quiz;
  try {
    quiz = await loadQuizById(quizId, registry, locale);
  } catch (error) {
    const detail =
      error instanceof QuizLoadError ? error.details : [t("quiz.unexpectedLoadError")];
    return el("div", { className: "surface-grid" }, [
      Card({
        title: t("quiz.quizUnavailable"),
        description: t("quiz.couldNotLoad", { quizId }),
        children: [ErrorBox(t("quiz.validationErrors"), detail)],
      }),
      Button({ label: t("common.backToTests"), href: "#/tests" }),
    ]);
  }

  const session = getSession(appState, quiz);

  if (session.result) {
    return renderResultView({ quiz, session, refresh, t });
  }

  const question = quiz.questions[session.currentIndex];
  const total = quiz.questions.length;
  const answer = session.answers[question.id];
  const options = resolveQuestionOptions(question, session);

  const setAnswer = (nextValue) => {
    session.answers[question.id] = nextValue;
    session.error = "";
    refresh();
  };

  const progress = ProgressBar({
    value: session.currentIndex + 1,
    max: total,
    label: t("common.questionOf", {
      current: session.currentIndex + 1,
      total,
    }),
  });

  const questionCard = Question({
    index: session.currentIndex + 1,
    total,
    prompt: question.prompt,
    description: question.description,
    inputControl: renderQuestionControl(question, options, answer, setAnswer),
    questionLabel: t("common.questionOf", {
      current: session.currentIndex + 1,
      total,
    }),
    requiredLabel: t("common.answerRequired"),
  });

  const moveNext = () => {
    if (!isQuestionAnswered(question, session.answers[question.id])) {
      session.error = t("quiz.chooseAnswerError");
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
        el("span", { className: "quiet", text: t("common.localOnlyAnswers") }),
      ]),
      progress,
    ],
  });

  const navActions = el("section", { className: "card stack-sm" }, [
    session.error ? ErrorBox(t("quiz.questionRequired"), [session.error]) : null,
    el("div", { className: "row-actions" }, [
      Button({
        label: t("quiz.back"),
        onClick: moveBack,
        attrs: { disabled: session.currentIndex === 0 ? "true" : undefined },
      }),
      Button({
        label: session.currentIndex === total - 1 ? t("quiz.finish") : t("quiz.next"),
        variant: "primary",
        onClick: moveNext,
      }),
      Button({ label: t("quiz.quit"), href: "#/tests" }),
    ]),
  ]);

  return el("div", { className: "surface-grid" }, [header, questionCard, navActions]);
}
