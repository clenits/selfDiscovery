const STORAGE_KEY = "thinking-os:last-result";

async function loadConfig() {
  const response = await fetch("./questions.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load questions.json");
  }
  return response.json();
}

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) {
    node.className = options.className;
  }
  if (options.text !== undefined) {
    node.textContent = options.text;
  }
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        node.setAttribute(key, String(value));
      }
    });
  }
  if (options.on) {
    Object.entries(options.on).forEach(([eventName, handler]) => {
      node.addEventListener(eventName, handler);
    });
  }
  const list = Array.isArray(children) ? children : [children];
  list.forEach((child) => {
    if (child === null || child === undefined || child === false) {
      return;
    }
    if (typeof child === "string") {
      node.append(document.createTextNode(child));
      return;
    }
    node.append(child);
  });
  return node;
}

function clear(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function calculateScores(config, answers) {
  const scores = {};
  const maximums = {};

  config.resultTypes.forEach((type) => {
    const questionIds = type.questionIds || [];
    scores[type.id] = questionIds.reduce((sum, questionId) => sum + (answers[questionId] || 0), 0);
    maximums[type.id] = questionIds.length * config.scale.max;
  });

  const order = config.scoring?.tieBreaker || config.resultTypes.map((type) => type.id);
  const tieRank = new Map(order.map((id, index) => [id, index]));

  const ranked = [...config.resultTypes]
    .map((type) => {
      const max = Math.max(1, maximums[type.id]);
      return {
        id: type.id,
        name: type.name,
        score: scores[type.id],
        max,
        percent: Math.round((scores[type.id] / max) * 100),
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (tieRank.get(a.id) ?? 999) - (tieRank.get(b.id) ?? 999);
    });

  return {
    scores,
    ranked,
    winnerId: ranked[0].id,
  };
}

function saveResult(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function renderQuiz(config) {
  const mount = document.querySelector("#quiz-app");
  const errorBox = document.querySelector("#quiz-error");

  const state = {
    index: 0,
    answers: {},
  };

  function setError(text) {
    errorBox.textContent = text || "";
  }

  function selectedValue(questionId) {
    return state.answers[questionId] || null;
  }

  function render() {
    clear(mount);
    const question = config.questions[state.index];
    const total = config.questions.length;
    const currentNumber = state.index + 1;
    const progressWidth = Math.round((currentNumber / total) * 100);

    const progress = el("div", { className: "progress" }, [
      el("div", {
        className: "progress-label",
        text: `문항 ${currentNumber} / ${total}`,
      }),
      el("div", { className: "progress-track" }, [
        el("div", {
          className: "progress-fill",
          attrs: { style: `width:${progressWidth}%` },
        }),
      ]),
    ]);

    const questionNode = el("p", { className: "question", text: question.text });

    const options = el("div", { className: "scale-grid" });
    for (let value = config.scale.min; value <= config.scale.max; value += 1) {
      const id = `${question.id}-${value}`;
      const checked = selectedValue(question.id) === value;
      const option = el("div", { className: "scale-option" }, [
        el("input", {
          attrs: {
            id,
            name: question.id,
            type: "radio",
            value,
          },
          on: {
            change: () => {
              state.answers[question.id] = value;
              setError("");
            },
          },
        }),
        el("label", { attrs: { for: id } }, [
          String(value),
          el("small", { text: config.scale.labels[String(value)] || "" }),
        ]),
      ]);

      if (checked) {
        option.querySelector("input").checked = true;
      }

      options.append(option);
    }

    const backBtn = el("button", {
      className: "button secondary",
      text: "이전",
      attrs: { type: "button", disabled: state.index === 0 ? "true" : undefined },
      on: {
        click: () => {
          if (state.index > 0) {
            state.index -= 1;
            setError("");
            render();
          }
        },
      },
    });

    const nextLabel = state.index === total - 1 ? "결과 보기" : "다음";
    const nextBtn = el("button", {
      className: "button primary",
      text: nextLabel,
      attrs: { type: "button" },
      on: {
        click: () => {
          if (!selectedValue(question.id)) {
            setError("1~5 중 하나를 선택한 뒤 진행해주세요.");
            return;
          }

          if (state.index < total - 1) {
            state.index += 1;
            setError("");
            render();
            return;
          }

          const result = calculateScores(config, state.answers);
          saveResult({
            testId: config.id,
            takenAt: new Date().toISOString(),
            answers: state.answers,
            scores: result.scores,
            ranked: result.ranked,
            winnerId: result.winnerId,
          });

          window.location.href = `./result/${result.winnerId}/?from=quiz`;
        },
      },
    });

    mount.append(progress, questionNode, options, el("div", { className: "row" }, [backBtn, nextBtn]));
  }

  render();
}

(async function init() {
  try {
    const config = await loadConfig();
    renderQuiz(config);
  } catch (error) {
    const mount = document.querySelector("#quiz-app");
    mount.textContent = "문항 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
    console.error(error);
  }
})();
