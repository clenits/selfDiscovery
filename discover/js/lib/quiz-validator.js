const QUESTION_TYPES = new Set(["single-choice", "multi-choice", "slider"]);

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ensureString(value, field, errors) {
  if (typeof value !== "string" || !value.trim()) {
    errors.push(`${field} must be a non-empty string.`);
  }
}

function ensureNumber(value, field, errors) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    errors.push(`${field} must be a number.`);
  }
}

function ensureWeightObject(weights, field, errors) {
  if (!isObject(weights)) {
    errors.push(`${field} must be an object of numeric weights by dimension.`);
    return;
  }
  Object.entries(weights).forEach(([key, val]) => {
    if (typeof val !== "number" || Number.isNaN(val)) {
      errors.push(`${field}.${key} must be numeric.`);
    }
  });
}

function validateCopyBlocks(blocks, field, errors) {
  if (blocks === undefined) {
    return;
  }
  if (!Array.isArray(blocks)) {
    errors.push(`${field} must be an array.`);
    return;
  }
  blocks.forEach((block, index) => {
    const path = `${field}[${index}]`;
    if (!isObject(block)) {
      errors.push(`${path} must be an object.`);
      return;
    }
    if (block.minConfidence !== undefined) {
      ensureNumber(block.minConfidence, `${path}.minConfidence`, errors);
    }
    if (
      block.text !== undefined &&
      (typeof block.text !== "string" || !block.text.trim())
    ) {
      errors.push(`${path}.text must be a non-empty string when provided.`);
    }
  });
}

function validateQuestion(question, index, dimensions, errors) {
  const path = `questions[${index}]`;
  if (!isObject(question)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  ensureString(question.id, `${path}.id`, errors);
  ensureString(question.prompt, `${path}.prompt`, errors);
  ensureString(question.type, `${path}.type`, errors);

  if (!QUESTION_TYPES.has(question.type)) {
    errors.push(
      `${path}.type must be one of: ${Array.from(QUESTION_TYPES).join(", ")}.`
    );
    return;
  }

  if (question.type === "single-choice" || question.type === "multi-choice") {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push(`${path}.options must contain at least 2 options.`);
      return;
    }

    question.options.forEach((option, optionIndex) => {
      const optionPath = `${path}.options[${optionIndex}]`;
      if (!isObject(option)) {
        errors.push(`${optionPath} must be an object.`);
        return;
      }
      ensureString(option.id, `${optionPath}.id`, errors);
      ensureString(option.label, `${optionPath}.label`, errors);
      ensureWeightObject(option.weights, `${optionPath}.weights`, errors);

      if (isObject(option.weights)) {
        Object.keys(option.weights).forEach((dimensionKey) => {
          if (!dimensions.includes(dimensionKey)) {
            errors.push(
              `${optionPath}.weights.${dimensionKey} references unknown dimension.`
            );
          }
        });
      }
    });
  }

  if (question.type === "slider") {
    ensureNumber(question.min, `${path}.min`, errors);
    ensureNumber(question.max, `${path}.max`, errors);
    ensureNumber(question.step, `${path}.step`, errors);

    if (question.max <= question.min) {
      errors.push(`${path}.max must be greater than .min.`);
    }
    if (!isObject(question.weightsByValue)) {
      errors.push(`${path}.weightsByValue must be an object keyed by slider value.`);
      return;
    }

    Object.entries(question.weightsByValue).forEach(([sliderValue, weightObj]) => {
      const sliderPath = `${path}.weightsByValue[${sliderValue}]`;
      ensureWeightObject(weightObj, sliderPath, errors);
      if (isObject(weightObj)) {
        Object.keys(weightObj).forEach((dimensionKey) => {
          if (!dimensions.includes(dimensionKey)) {
            errors.push(`${sliderPath}.${dimensionKey} references unknown dimension.`);
          }
        });
      }
    });
  }
}

function validateResultMapping(resultMapping, dimensions, errors) {
  if (!isObject(resultMapping)) {
    errors.push("scoring.resultMapping must be an object.");
    return;
  }

  ensureString(resultMapping.type, "scoring.resultMapping.type", errors);

  if (resultMapping.type === "top-dimension") {
    if (!isObject(resultMapping.items)) {
      errors.push("scoring.resultMapping.items must be an object.");
      return;
    }

    dimensions.forEach((dimension) => {
      const item = resultMapping.items[dimension];
      if (!isObject(item)) {
        errors.push(
          `scoring.resultMapping.items.${dimension} must exist for top-dimension model.`
        );
        return;
      }
      ensureString(item.title, `scoring.resultMapping.items.${dimension}.title`, errors);
      ensureString(
        item.summary,
        `scoring.resultMapping.items.${dimension}.summary`,
        errors
      );
      validateCopyBlocks(
        item.copyBlocks,
        `scoring.resultMapping.items.${dimension}.copyBlocks`,
        errors
      );
    });

    if (resultMapping.fallback !== undefined && !isObject(resultMapping.fallback)) {
      errors.push("scoring.resultMapping.fallback must be an object when provided.");
    }
  }

  if (resultMapping.type === "paired-code") {
    if (!Array.isArray(resultMapping.pairs) || resultMapping.pairs.length === 0) {
      errors.push("scoring.resultMapping.pairs must contain at least one axis pair.");
    } else {
      resultMapping.pairs.forEach((pair, index) => {
        const pairPath = `scoring.resultMapping.pairs[${index}]`;
        if (!isObject(pair)) {
          errors.push(`${pairPath} must be an object.`);
          return;
        }
        ensureString(pair.left, `${pairPath}.left`, errors);
        ensureString(pair.right, `${pairPath}.right`, errors);
        if (pair.left && !dimensions.includes(pair.left)) {
          errors.push(`${pairPath}.left must be defined in scoring.dimensions.`);
        }
        if (pair.right && !dimensions.includes(pair.right)) {
          errors.push(`${pairPath}.right must be defined in scoring.dimensions.`);
        }
      });
    }

    if (!isObject(resultMapping.codes) || !Object.keys(resultMapping.codes).length) {
      errors.push("scoring.resultMapping.codes must be a non-empty object.");
      return;
    }

    Object.entries(resultMapping.codes).forEach(([code, config]) => {
      const codePath = `scoring.resultMapping.codes.${code}`;
      if (!isObject(config)) {
        errors.push(`${codePath} must be an object.`);
        return;
      }
      ensureString(config.title, `${codePath}.title`, errors);
      ensureString(config.summary, `${codePath}.summary`, errors);
      validateCopyBlocks(config.copyBlocks, `${codePath}.copyBlocks`, errors);
    });

    if (resultMapping.fallback !== undefined && !isObject(resultMapping.fallback)) {
      errors.push("scoring.resultMapping.fallback must be an object when provided.");
    }
  }

  if (resultMapping.type !== "top-dimension" && resultMapping.type !== "paired-code") {
    errors.push(
      "scoring.resultMapping.type must be either 'top-dimension' or 'paired-code'."
    );
  }
}

export function validateQuizDefinition(quiz) {
  const errors = [];
  if (!isObject(quiz)) {
    return { valid: false, errors: ["Quiz file must be a JSON object."] };
  }

  ensureString(quiz.id, "id", errors);
  ensureString(quiz.title, "title", errors);
  ensureString(quiz.description, "description", errors);
  ensureString(quiz.durationEstimate, "durationEstimate", errors);

  if (!Array.isArray(quiz.questions) || !quiz.questions.length) {
    errors.push("questions must be a non-empty array.");
  }

  if (!isObject(quiz.scoring)) {
    errors.push("scoring must be an object.");
  } else {
    ensureString(quiz.scoring.model, "scoring.model", errors);
    if (quiz.scoring.model !== "dimension-sum") {
      errors.push("scoring.model must be 'dimension-sum'.");
    }
    if (!Array.isArray(quiz.scoring.dimensions) || !quiz.scoring.dimensions.length) {
      errors.push("scoring.dimensions must be a non-empty array.");
    }
  }

  const dimensions = Array.isArray(quiz?.scoring?.dimensions)
    ? quiz.scoring.dimensions
    : [];

  if (Array.isArray(quiz.questions) && dimensions.length) {
    quiz.questions.forEach((question, index) => {
      validateQuestion(question, index, dimensions, errors);
    });
  }

  if (isObject(quiz.scoring) && dimensions.length) {
    validateResultMapping(quiz.scoring.resultMapping, dimensions, errors);
  }

  if (!isObject(quiz.shareCard)) {
    errors.push("shareCard must be an object.");
  } else {
    ensureString(quiz.shareCard.titleTemplate, "shareCard.titleTemplate", errors);
    ensureString(quiz.shareCard.subtitleTemplate, "shareCard.subtitleTemplate", errors);
    ensureString(quiz.shareCard.footerTemplate, "shareCard.footerTemplate", errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateRegistry(registry) {
  const errors = [];
  if (!isObject(registry)) {
    return {
      valid: false,
      errors: ["Registry must be a JSON object."],
    };
  }

  if (!Array.isArray(registry.tests) || !registry.tests.length) {
    errors.push("registry.tests must be a non-empty array.");
  } else {
    registry.tests.forEach((test, index) => {
      const path = `tests[${index}]`;
      if (!isObject(test)) {
        errors.push(`${path} must be an object.`);
        return;
      }
      ensureString(test.id, `${path}.id`, errors);
      ensureString(test.title, `${path}.title`, errors);
      ensureString(test.description, `${path}.description`, errors);
      ensureString(test.durationEstimate, `${path}.durationEstimate`, errors);
      ensureString(test.path, `${path}.path`, errors);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
