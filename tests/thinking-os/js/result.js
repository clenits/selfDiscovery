const STORAGE_KEY = "thinking-os:last-result";

function qs(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

async function loadConfig() {
  const response = await fetch("../../questions.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load questions.json");
  }
  return response.json();
}

function readLatestResult() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getShareText(type) {
  return `나의 사고 운영체제는 ${type.name} (${type.headline})`;
}

function renderResult(config, resultId) {
  const type = config.resultTypes.find((item) => item.id === resultId);
  const root = document.querySelector("#result-app");

  if (!type) {
    root.innerHTML = "<p>결과 정보를 찾을 수 없습니다.</p>";
    return;
  }

  const latest = readLatestResult();
  if (qs("from") === "quiz" && latest?.winnerId && latest.winnerId !== resultId) {
    window.location.replace(`../${latest.winnerId}/`);
    return;
  }

  const takenAt = latest?.takenAt ? new Date(latest.takenAt).toLocaleString() : null;
  const scoreRows = latest?.ranked
    ? latest.ranked
        .map(
          (row) => `
            <div class="score-row">
              <strong>${row.name}</strong>
              <div>${row.score} / ${row.max} (${row.percent}%)</div>
              <div class="score-bar"><span style="width:${row.percent}%"></span></div>
            </div>
          `
        )
        .join("")
    : "<p class=\"footer-note\">아직 점수 기록이 없습니다. 테스트를 진행하면 점수 비교가 표시됩니다.</p>";

  root.innerHTML = `
    <section class="card">
      <div class="pill">Thinking OS Result</div>
      <h1 class="result-name">${type.name}</h1>
      <h2 class="result-headline">${type.headline}</h2>
      <p>${type.fullDescription}</p>
      ${takenAt ? `<p class="footer-note">최근 진단 시각: ${takenAt}</p>` : ""}
    </section>

    <section class="card">
      <h2>핵심 강점</h2>
      <ul class="meta-list">
        ${type.strengths.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <section class="card">
      <h2>점수 비교</h2>
      <div class="score-list">${scoreRows}</div>
    </section>

    <section class="card">
      <h2>결과 공유</h2>
      <p>아래 버튼으로 결과 링크를 공유할 수 있습니다.</p>
      <div class="share-buttons">
        <a id="share-facebook" href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a id="share-twitter" href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
        <a id="share-x" href="#" target="_blank" rel="noopener noreferrer">X</a>
      </div>
      <div class="row" style="margin-top:12px;">
        <a class="button-link secondary" href="../../quiz.html">다시 테스트하기</a>
        <a class="button-link primary" href="../../">테스트 소개로 이동</a>
      </div>
    </section>
  `;

  const url = window.location.origin + window.location.pathname;
  const text = getShareText(type);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  document.querySelector("#share-facebook").href =
    `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  document.querySelector("#share-twitter").href =
    `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
  document.querySelector("#share-x").href =
    `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
}

(async function init() {
  const resultId = document.body.dataset.resultId;
  try {
    const config = await loadConfig();
    renderResult(config, resultId);
  } catch (error) {
    const root = document.querySelector("#result-app");
    root.textContent = "결과 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
    console.error(error);
  }
})();
