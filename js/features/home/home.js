import Storage from "../../services/storage.js";
import Questions from "../../questions.js";

const THEMES = [
  { id: "space", name: "Luar Angkasa", vehicle: "🚀" },
  { id: "car", name: "Mobil", vehicle: "🚗" },
  { id: "ocean", name: "Bawah Laut", vehicle: "🐠" },
  { id: "forest", name: "Hutan", vehicle: "🦊" },
];

export function applyTheme(themeId) {
  const theme = THEMES.find((item) => item.id === themeId) || THEMES[0];
  document.body.className = `theme-${theme.id}`;
  const settings = Storage.getSettings();
  Storage.saveSettings({ ...settings, theme: theme.id });
  return theme;
}

export function renderHome(app, { onStart, onKebun }) {
  const progress = Storage.getProgress();
  const streak = Storage.getStreak();
  const theme = applyTheme(Storage.getSettings().theme);
  const level = Questions.getLevel(progress.level);

  app.innerHTML = `
    <section id="screen-home" class="screen active" aria-label="Rumah Jagoan Kali">
      <header class="home-header"><p class="brand">Jagoan Kali</p><div class="streak-badge" title="Api Semangat"><span class="streak-icon" aria-hidden="true">🔥</span><span class="streak-count">${streak.currentStreak}</span><span class="streak-label">hari</span></div></header>
      <div class="home-hero"><div class="mascot" aria-hidden="true">${theme.vehicle}</div><h1 class="home-title">Rumah Jagoan Kali</h1><p class="home-sub">Pilih permainanmu hari ini!</p></div>
      <div class="home-meta"><div class="meta-pill"><span class="meta-label">Level Balap</span><span class="meta-value">${progress.level}</span></div><div class="meta-pill"><span class="meta-label">Rekor</span><span class="meta-value">${progress.bestScore}</span></div><div class="meta-pill"><span class="meta-label">Poin</span><span class="meta-value">${progress.totalPoints}</span></div></div>
      <div class="home-actions"><button type="button" class="btn btn-garden btn-lg" id="btn-kebun">🌱 Kebun Kali</button><button type="button" class="btn btn-primary btn-lg" id="btn-start">🏁 Balap Kali</button><button type="button" class="btn btn-ghost" id="btn-theme">Tema Balap: <span id="theme-name">${theme.name}</span></button></div>
      <p class="home-hint">Balap: ${level.hint}</p>
    </section>`;

  app.querySelector("#btn-start").addEventListener("click", onStart);
  app.querySelector("#btn-kebun").addEventListener("click", onKebun);
  app.querySelector("#btn-theme").addEventListener("click", () => {
    const current = Storage.getSettings().theme;
    const index = THEMES.findIndex((item) => item.id === current);
    const next = THEMES[(index + 1) % THEMES.length];
    applyTheme(next.id);
    app.querySelector(".mascot").textContent = next.vehicle;
    app.querySelector("#theme-name").textContent = next.name;
  });
}
