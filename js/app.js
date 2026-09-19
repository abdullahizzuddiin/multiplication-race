/**
 * App shell — screens, theme, home HUD.
 * Loaded by index.html; entry App.init on DOMContentLoaded.
 * Uses Storage, Questions, Balap. Themes stored in jagoanKali_settings.theme.
 * User: implement GAME 2 Balap Kali — vanilla HTML/CSS/JS, pastel, no gradient.
 */

const App = (() => {
  const THEMES = [
    { id: "space", name: "Luar Angkasa", vehicle: "🚀" },
    { id: "car", name: "Mobil", vehicle: "🚗" },
    { id: "ocean", name: "Bawah Laut", vehicle: "🐠" },
    { id: "forest", name: "Hutan", vehicle: "🦊" },
  ];

  const PRAISE = ["Hebat!", "Keren banget!", "Mantap!", "Jago!", "Luar biasa!"];
  let lastKebunMode = "A";

  function el(id) {
    return document.getElementById(id);
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => {
      const on = s.id === id;
      s.classList.toggle("active", on);
      if (on) s.removeAttribute("hidden");
      else s.setAttribute("hidden", "");
    });
  }

  function applyTheme(themeId) {
    const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
    document.body.className = `theme-${theme.id}`;
    el("theme-name").textContent = theme.name;
    el("home-mascot").textContent = theme.vehicle;
    el("vehicle").textContent = theme.vehicle;
    const settings = Storage.getSettings();
    settings.theme = theme.id;
    Storage.saveSettings(settings);
    return theme;
  }

  function cycleTheme() {
    const settings = Storage.getSettings();
    const idx = THEMES.findIndex((t) => t.id === settings.theme);
    const next = THEMES[(idx + 1) % THEMES.length];
    applyTheme(next.id);
  }

  function refreshHome() {
    const progress = Storage.getProgress();
    const streak = Storage.getStreak();
    const level = Questions.getLevel(progress.level);

    el("home-level").textContent = String(progress.level);
    el("home-best").textContent = String(progress.bestScore);
    el("home-points").textContent = String(progress.totalPoints);
    el("streak-count").textContent = String(streak.currentStreak);
    el("level-hint").textContent = `Balap: ${level.hint}`;
  }

  function showKebunMenu() {
    Kebun.quit();
    const progress = Storage.getProgress();
    const level = KebunQuestions.getLevel(progress.kebunLevel);
    el("kebun-level").textContent = `Level ${level.id}`;
    el("kebun-level-hint").textContent = `Tabel ${level.tables.join(" dan ")} · Yuk belajar kelompok!`;
    document.querySelectorAll("[data-kebun-mode]").forEach((button) => {
      const unlocked = progress.kebun.unlockedModes.includes(button.dataset.kebunMode);
      button.disabled = !unlocked;
      button.classList.toggle("locked", !unlocked);
      const label = button.querySelector("small");
      const descriptions = {
        A: "Isi pot, lalu hitung bersama",
        B: "Lihat bunga dan pilih jawabannya",
        C: "Jawab cepat tanpa gambar",
      };
      label.textContent = unlocked ? descriptions[button.dataset.kebunMode] : "Selesaikan mode sebelumnya untuk membuka";
    });
    el("kebun-unlock-note").textContent = progress.kebun.unlockedModes.includes("C")
      ? "Semua mode sudah terbuka. Kamu hebat!"
      : "Selesaikan Tanam Kelompok untuk membuka Tebak Kebun.";
    showScreen("screen-kebun-menu");
  }

  function startKebun(mode) {
    lastKebunMode = mode;
    showScreen("screen-kebun-play");
    Kebun.start(mode, { onEnd: showKebunResults });
  }

  function showKebunResults(result) {
    showScreen("screen-kebun-results");
    el("kebun-results-title").textContent = result.stars >= 2 ? "Kebunmu tumbuh!" : "Yuk rawat lagi!";
    el("kebun-results-points").textContent = String(result.points);
    el("kebun-results-detail").textContent = `${result.correct}/${result.total} benar · Level Kebun ${result.level}`;
    el("kebun-results-insight").textContent = result.accuracy >= 0.8
      ? "Hebat! Kamu siap menanam lebih banyak lagi."
      : "Tidak apa-apa. Coba lagi, pelan-pelan juga bisa!";
    document.querySelectorAll("#kebun-results-stars .star").forEach((star, index) => {
      star.classList.toggle("lit", index < result.stars);
    });
    refreshHome();
  }

  function runCountdown(levelId) {
    return new Promise((resolve) => {
      const level = Questions.getLevel(levelId);
      showScreen("screen-countdown");
      el("countdown-level").textContent = level.name;
      let n = 3;
      el("countdown-num").textContent = String(n);

      const tick = () => {
        n -= 1;
        if (n <= 0) {
          resolve();
          return;
        }
        const num = el("countdown-num");
        num.textContent = String(n);
        num.style.animation = "none";
        void num.offsetWidth;
        num.style.animation = "";
        setTimeout(tick, 600);
      };
      setTimeout(tick, 600);
    });
  }

  async function startGame() {
    const progress = Storage.getProgress();
    const levelId = progress.level;
    await runCountdown(levelId);
    showScreen("screen-play");
    Balap.start(levelId, { onRoundEnd: showResults });
  }

  function showResults(result) {
    showScreen("screen-results");

    const title =
      result.stars >= 3
        ? PRAISE[Math.floor(Math.random() * PRAISE.length)]
        : result.stars >= 1
          ? "Bagus!"
          : "Yuk coba lagi!";

    el("results-title").textContent = title;
    el("results-score").textContent = String(result.score);
    el("results-detail").textContent =
      `${result.correctCount}/${result.total} benar · rata-rata ${result.avgSec.toFixed(1)} dtk`;
    el("insight-text").textContent = result.insight;

    document.querySelectorAll("#results-stars .star").forEach((star) => {
      const n = Number(star.dataset.n);
      star.classList.toggle("lit", n <= result.stars);
    });

    const levelUp = el("level-up");
    if (result.leveledUp) {
      levelUp.hidden = false;
      el("level-up-text").textContent =
        result.toLevel >= 6
          ? "Kamu masuk Level Master!"
          : `Naik ke Level ${result.toLevel}!`;
    } else {
      levelUp.hidden = true;
    }

    refreshHome();
  }

  function quitToHome() {
    Balap.quit();
    Kebun.quit();
    refreshHome();
    showScreen("screen-home");
  }

  function bind() {
    el("btn-start").addEventListener("click", () => startGame());
    el("btn-theme").addEventListener("click", () => cycleTheme());
    el("btn-quit").addEventListener("click", () => quitToHome());
    el("btn-again").addEventListener("click", () => startGame());
    el("btn-home").addEventListener("click", () => quitToHome());
    el("btn-kebun").addEventListener("click", () => showKebunMenu());
    el("btn-kebun-home").addEventListener("click", () => quitToHome());
    el("btn-kebun-quit").addEventListener("click", () => showKebunMenu());
    el("btn-kebun-menu").addEventListener("click", () => showKebunMenu());
    el("btn-kebun-again").addEventListener("click", () => startKebun(lastKebunMode));
    document.querySelectorAll("[data-kebun-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!button.disabled) startKebun(button.dataset.kebunMode);
      });
    });
  }

  function init() {
    const settings = Storage.getSettings();
    applyTheme(settings.theme);
    refreshHome();
    bind();
    showScreen("screen-home");
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => App.init());
