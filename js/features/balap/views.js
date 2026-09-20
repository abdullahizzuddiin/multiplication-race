export function renderCountdown(app, level) {
  app.innerHTML = `<section id="screen-countdown" class="screen active" aria-label="Bersiap"><div class="countdown-wrap"><p class="countdown-label">Bersiap…</p><p class="countdown-num">3</p><p class="countdown-level">${level.name}</p></div></section>`;
}

export function renderPlay(app, vehicle) {
  app.innerHTML = `<section id="screen-play" class="screen active" aria-label="Balap Kali"><header class="play-header"><button type="button" class="btn btn-icon" id="btn-quit" aria-label="Keluar">←</button><div class="play-stats"><span class="stat" id="play-score" aria-label="Skor">0</span><span class="stat combo" id="play-combo" hidden>x2</span></div><div class="play-progress-text"><span id="q-index">1</span>/<span id="q-total">10</span></div></header><div class="race-track" aria-hidden="true"><div class="track-lane"><div class="vehicle" id="vehicle">${vehicle}</div><div class="finish">🏁</div></div></div><div class="timer-bar-wrap" aria-label="Waktu tersisa"><div class="timer-bar" id="timer-bar"></div></div><div class="question-card"><p class="question" id="question-text"></p></div><div class="choices" id="choices" role="group" aria-label="Pilihan jawaban"></div><div class="feedback" id="feedback" hidden><p class="feedback-text" id="feedback-text"></p></div></section>`;
}

export function renderResults(app, result, { onAgain, onHome }) {
  const title = result.stars >= 3 ? ["Hebat!", "Keren banget!", "Mantap!", "Jago!", "Luar biasa!"][Math.floor(Math.random() * 5)] : result.stars >= 1 ? "Bagus!" : "Yuk coba lagi!";
  app.innerHTML = `<section id="screen-results" class="screen active" aria-label="Hasil ronde"><header class="results-header"><p class="brand-sm">Balap Kali</p><h1 class="results-title">${title}</h1><div class="stars" aria-label="Bintang">${[1, 2, 3].map((n) => `<span class="star ${n <= result.stars ? "lit" : ""}">★</span>`).join("")}</div></header><div class="results-score-block"><p class="results-score-label">Skor</p><p class="results-score">${result.score}</p><p class="results-detail">${result.correctCount}/${result.total} benar · rata-rata ${result.avgSec.toFixed(1)} dtk</p></div><div class="insight-card"><p class="insight-text">${result.insight}</p></div>${result.leveledUp ? `<div class="level-up"><p class="level-up-text">${result.toLevel >= 6 ? "Kamu masuk Level Master!" : `Naik ke Level ${result.toLevel}!`}</p></div>` : ""}<div class="results-actions"><button type="button" class="btn btn-primary btn-lg" id="btn-again">Main Lagi</button><button type="button" class="btn btn-ghost" id="btn-home">Kembali ke Rumah</button></div></section>`;
  app.querySelector("#btn-again").addEventListener("click", onAgain);
  app.querySelector("#btn-home").addEventListener("click", onHome);
}
