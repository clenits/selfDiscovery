function cloneData(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function assignTextFields(target, source, keys) {
  if (!source || !target) {
    return;
  }
  keys.forEach((key) => {
    if (source[key] !== undefined) {
      target[key] = source[key];
    }
  });
}

function mergeCopyBlocks(targetBlocks, localeBlocks) {
  if (!Array.isArray(targetBlocks) || !Array.isArray(localeBlocks)) {
    return;
  }
  localeBlocks.forEach((localeBlock, index) => {
    if (!localeBlock || !targetBlocks[index]) {
      return;
    }
    assignTextFields(targetBlocks[index], localeBlock, ["title", "summary", "text"]);
  });
}

function mergeResultMapping(targetMapping, localeMapping) {
  if (!targetMapping || !localeMapping) {
    return;
  }

  if (targetMapping.type === "top-dimension" && localeMapping.items) {
    Object.entries(localeMapping.items).forEach(([dimension, localeItem]) => {
      const targetItem = targetMapping.items?.[dimension];
      if (!targetItem) {
        return;
      }
      assignTextFields(targetItem, localeItem, ["title", "summary", "details"]);
      mergeCopyBlocks(targetItem.copyBlocks, localeItem.copyBlocks);
    });
  }

  if (targetMapping.type === "paired-code") {
    if (Array.isArray(targetMapping.pairs) && Array.isArray(localeMapping.pairs)) {
      localeMapping.pairs.forEach((localePair, index) => {
        if (!targetMapping.pairs[index]) {
          return;
        }
        assignTextFields(targetMapping.pairs[index], localePair, ["label"]);
      });
    }

    if (localeMapping.codes) {
      Object.entries(localeMapping.codes).forEach(([code, localeCode]) => {
        const targetCode = targetMapping.codes?.[code];
        if (!targetCode) {
          return;
        }
        assignTextFields(targetCode, localeCode, ["title", "summary", "details"]);
        mergeCopyBlocks(targetCode.copyBlocks, localeCode.copyBlocks);
      });
    }
  }

  if (targetMapping.fallback && localeMapping.fallback) {
    assignTextFields(targetMapping.fallback, localeMapping.fallback, [
      "title",
      "summary",
      "details",
    ]);
    mergeCopyBlocks(targetMapping.fallback.copyBlocks, localeMapping.fallback.copyBlocks);
  }
}

function mergeQuestions(targetQuestions, localeQuestions) {
  if (!localeQuestions || !Array.isArray(targetQuestions)) {
    return;
  }

  const questionMap = new Map(targetQuestions.map((question) => [question.id, question]));

  Object.entries(localeQuestions).forEach(([questionId, localeQuestion]) => {
    const target = questionMap.get(questionId);
    if (!target) {
      return;
    }

    assignTextFields(target, localeQuestion, [
      "prompt",
      "description",
      "labelLow",
      "labelHigh",
    ]);

    if (!localeQuestion.options || !Array.isArray(target.options)) {
      return;
    }

    const optionMap = new Map(target.options.map((option) => [option.id, option]));
    Object.entries(localeQuestion.options).forEach(([optionId, localeOption]) => {
      const targetOption = optionMap.get(optionId);
      if (!targetOption) {
        return;
      }
      assignTextFields(targetOption, localeOption, ["label", "hint"]);
    });
  });
}

export function applyRegistryLocalization(registry, localePatch) {
  if (!localePatch) {
    return registry;
  }
  const next = cloneData(registry);
  const testsById = new Map(next.tests.map((test) => [test.id, test]));

  Object.entries(localePatch.tests || {}).forEach(([testId, patch]) => {
    const target = testsById.get(testId);
    if (!target) {
      return;
    }
    assignTextFields(target, patch, ["title", "description", "durationEstimate"]);
    if (Array.isArray(patch.tags)) {
      target.tags = patch.tags;
    }
  });

  return next;
}

export function applyQuizLocalization(quiz, localePatch) {
  if (!localePatch) {
    return quiz;
  }

  const next = cloneData(quiz);
  assignTextFields(next, localePatch, ["title", "description", "durationEstimate"]);

  mergeQuestions(next.questions, localePatch.questions);
  mergeResultMapping(next.scoring?.resultMapping, localePatch.scoring?.resultMapping);
  assignTextFields(next.shareCard, localePatch.shareCard, [
    "titleTemplate",
    "subtitleTemplate",
    "footerTemplate",
  ]);

  return next;
}
