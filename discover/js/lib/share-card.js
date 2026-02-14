function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 5) {
  const words = String(text || "").split(/\s+/);
  let line = "";
  let usedLines = 0;

  words.forEach((word, idx) => {
    if (!word) {
      return;
    }
    const trial = line ? `${line} ${word}` : word;
    const width = ctx.measureText(trial).width;
    const isLastWord = idx === words.length - 1;

    if (width > maxWidth && line) {
      if (usedLines < maxLines) {
        ctx.fillText(line, x, y + usedLines * lineHeight);
      }
      usedLines += 1;
      line = word;
      return;
    }

    line = trial;
    if (isLastWord && usedLines < maxLines) {
      ctx.fillText(line, x, y + usedLines * lineHeight);
      usedLines += 1;
    }
  });

  if (!words.length && usedLines < maxLines) {
    ctx.fillText("", x, y);
  }

  return y + usedLines * lineHeight;
}

function encodeBase64(value) {
  const utf8 = new TextEncoder().encode(value);
  let binary = "";
  utf8.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function fillTemplate(template, replacements) {
  return String(template || "").replace(/{{\s*([\w]+)\s*}}/g, (_, key) => {
    const found = replacements[key];
    return found === undefined || found === null ? "" : String(found);
  });
}

export function buildSharePayload({ quizId, quizTitle, result }) {
  return {
    quizId,
    quizTitle,
    resultId: result.id,
    resultTitle: result.title,
    resultSummary: result.summary,
    resultDetails: result.details,
    confidencePercent: result.confidencePercent,
    takenAt: result.takenAt,
  };
}

export function encodeSharePayload(payload) {
  return encodeBase64(JSON.stringify(payload));
}

export function decodeSharePayload(serialized) {
  try {
    return JSON.parse(decodeBase64(serialized));
  } catch {
    return null;
  }
}

export function buildShareUrl(payload) {
  const encoded = encodeSharePayload(payload);
  return `${window.location.origin}${window.location.pathname}#/share?d=${encodeURIComponent(
    encoded
  )}`;
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const fallback = document.createElement("textarea");
  fallback.value = text;
  fallback.setAttribute("readonly", "readonly");
  fallback.style.position = "absolute";
  fallback.style.left = "-9999px";
  document.body.append(fallback);
  fallback.select();
  const success = document.execCommand("copy");
  fallback.remove();
  return success;
}

export function createResultCanvas({
  quizTitle,
  resultTitle,
  resultSummary,
  confidencePercent,
  link,
  accent = "#2168e5",
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#08172f");
  gradient.addColorStop(1, accent);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(60, 52, 1080, 526);

  ctx.fillStyle = "#b8d5ff";
  ctx.font = "600 28px Avenir Next";
  ctx.fillText("Self Discovery Lab", 96, 115);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 54px Avenir Next";
  const titleBottom = wrapText(ctx, resultTitle, 96, 200, 960, 64, 2);

  ctx.fillStyle = "#d8e6ff";
  ctx.font = "600 30px Avenir Next";
  ctx.fillText(quizTitle, 96, titleBottom + 30);

  ctx.font = "500 28px Nunito Sans";
  const summaryBottom = wrapText(
    ctx,
    resultSummary,
    96,
    titleBottom + 90,
    960,
    38,
    4
  );

  ctx.font = "700 24px Nunito Sans";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`Confidence: ${confidencePercent}%`, 96, summaryBottom + 34);

  ctx.font = "500 20px Nunito Sans";
  ctx.fillStyle = "#d8e6ff";
  wrapText(ctx, link, 96, 560, 990, 28, 2);

  return canvas;
}

export function downloadCanvas(canvas, filename) {
  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}
