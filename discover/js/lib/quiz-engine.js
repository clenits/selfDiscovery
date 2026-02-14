function addWeights(scores, weights) {
  if (!weights) {
    return;
  }
  Object.entries(weights).forEach(([dimension, value]) => {
    scores[dimension] = (scores[dimension] || 0) + value;
  });
}

function pickCopyBlock(copyBlocks, confidence) {
  if (!Array.isArray(copyBlocks) || !copyBlocks.length) {
    return null;
  }
  const sorted = [...copyBlocks].sort(
    (a, b) => (a.minConfidence || 0) - (b.minConfidence || 0)
  );
  let selected = sorted[0];
  sorted.forEach((block) => {
    if ((block.minConfidence || 0) <= confidence) {
      selected = block;
    }
  });
  return selected;
}

function normalizeScores(scores) {
  const positiveTotal = Math.max(
    1,
    Object.values(scores).reduce((sum, value) => sum + Math.max(0, value), 0)
  );
  return Object.entries(scores)
    .map(([dimension, value]) => ({
      dimension,
      score: value,
      percent: Math.round((Math.max(0, value) / positiveTotal) * 100),
    }))
    .sort((a, b) => b.score - a.score);
}

function scoreTopDimension(mapping, scores) {
  const ranked = normalizeScores(scores);
  const winner = ranked[0];
  const runnerUp = ranked[1] || { score: 0 };
  const confidenceBase = Math.max(1, winner.score + runnerUp.score);
  const confidence = Math.max(0, (winner.score - runnerUp.score) / confidenceBase);

  const chosen = mapping.items[winner.dimension] || mapping.fallback || {
    title: "Result",
    summary: "No result mapping available.",
  };
  const copyBlock = pickCopyBlock(chosen.copyBlocks, confidence);

  return {
    id: winner.dimension,
    title: copyBlock?.title || chosen.title,
    summary: copyBlock?.summary || chosen.summary,
    details: copyBlock?.text || chosen.details || "",
    confidence,
    rankedDimensions: ranked,
    axisPairs: [],
    code: null,
  };
}

function scorePairedCode(mapping, scores) {
  const pairs = mapping.pairs || [];
  const axisPairs = [];
  let confidenceTotal = 0;

  const code = pairs
    .map((pair) => {
      const leftValue = scores[pair.left] || 0;
      const rightValue = scores[pair.right] || 0;
      const tieBreaker = pair.tieBreaker || pair.left;
      const pick = leftValue === rightValue
        ? tieBreaker
        : leftValue > rightValue
          ? pair.left
          : pair.right;
      const dominance = Math.abs(leftValue - rightValue) /
        Math.max(1, Math.abs(leftValue) + Math.abs(rightValue));
      confidenceTotal += dominance;

      axisPairs.push({
        label: pair.label || `${pair.left}/${pair.right}`,
        left: pair.left,
        right: pair.right,
        leftValue,
        rightValue,
        pick,
        dominance,
      });

      return pick;
    })
    .join("");

  const confidence = pairs.length ? confidenceTotal / pairs.length : 0;
  const chosen = mapping.codes?.[code] || mapping.fallback || {
    title: code || "Axis Profile",
    summary: "No specific mapping available for this code.",
  };
  const copyBlock = pickCopyBlock(chosen.copyBlocks, confidence);

  return {
    id: code,
    title: copyBlock?.title || chosen.title,
    summary: copyBlock?.summary || chosen.summary,
    details: copyBlock?.text || chosen.details || "",
    confidence,
    rankedDimensions: normalizeScores(scores),
    axisPairs,
    code,
  };
}

function resolveSliderWeights(question, answer) {
  if (answer === null || answer === undefined || answer === "") {
    return null;
  }
  const numeric = Number(answer);
  const key = String(numeric);
  if (question.weightsByValue?.[key]) {
    return question.weightsByValue[key];
  }

  const keys = Object.keys(question.weightsByValue || {})
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
  if (!keys.length) {
    return null;
  }
  const closest = keys.reduce((best, item) =>
    Math.abs(item - numeric) < Math.abs(best - numeric) ? item : best
  );
  return question.weightsByValue[String(closest)] || null;
}

export function defaultAnswerForQuestion(question) {
  if (question.type === "multi-choice") {
    return [];
  }
  if (question.type === "slider") {
    if (typeof question.defaultValue === "number") {
      return question.defaultValue;
    }
    return question.min;
  }
  return null;
}

export function createInitialAnswers(quiz) {
  return Object.fromEntries(
    quiz.questions.map((question) => [question.id, defaultAnswerForQuestion(question)])
  );
}

export function isQuestionAnswered(question, answer) {
  if (question.type === "multi-choice") {
    return Array.isArray(answer) && answer.length > 0;
  }
  if (question.type === "slider") {
    return answer !== null && answer !== undefined && answer !== "";
  }
  return typeof answer === "string" && answer.length > 0;
}

export function scoreQuiz(quiz, answers) {
  const scores = Object.fromEntries(
    quiz.scoring.dimensions.map((dimension) => [dimension, 0])
  );

  quiz.questions.forEach((question) => {
    const answer = answers[question.id];

    if (question.type === "single-choice") {
      const selected = question.options.find((option) => option.id === answer);
      addWeights(scores, selected?.weights);
      return;
    }

    if (question.type === "multi-choice") {
      const selected = Array.isArray(answer) ? answer : [];
      selected.forEach((optionId) => {
        const option = question.options.find((item) => item.id === optionId);
        addWeights(scores, option?.weights);
      });
      return;
    }

    if (question.type === "slider") {
      addWeights(scores, resolveSliderWeights(question, answer));
    }
  });

  const mapping = quiz.scoring.resultMapping;
  let result;

  if (mapping.type === "top-dimension") {
    result = scoreTopDimension(mapping, scores);
  } else {
    result = scorePairedCode(mapping, scores);
  }

  return {
    ...result,
    confidencePercent: Math.round(result.confidence * 100),
    scores,
    takenAt: new Date().toISOString(),
  };
}
