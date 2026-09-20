import { MATHQUEST_CONFIG, formatTime, getPaceLabel, getQuestLengthLabel } from "./config.js";
import { TIERS, PRESETS, buildQuestionPool, clampQuestions, findTierByTables, QUESTIONS_PER_TABLE } from "./state.js";
import { createQuest } from "./engine.js";

export function renderSetup(app, { onStart }) {
  let state = {
    tables: new Set([1, 2, 3, 4, 5, 10]),
    timerSeconds: 90,
    questions: 8,
    activePresetId: null,
  };

  function reRender() {
    app.innerHTML = buildSetupHTML(state);
    wireSetupEvents(app, state, (newState) => { state = newState; reRender(); }, onStart);
  }

  reRender();
}

function buildSetupHTML(state) {
  const tierId = findTierByTables(state.tables);
  const tier = TIERS.find(t => t.id === tierId);
  const maxQuestions = state.tables.size * QUESTIONS_PER_TABLE;
  const activeTables = [...state.tables].sort((a, b) => a - b);

  return `
    <section id="screen-mathquest-setup" class="screen active mq-setup" aria-label="MathQuest Setup">
      <header class="mq-header">
        <div class="mq-header-icon" aria-hidden="true">🔢</div>
        <div class="mq-header-text">
          <h1 class="mq-title">MathQuest 10×10</h1>
          <div class="mq-badges"><span class="mq-badge mq-badge-age">AGES 6-11</span><span class="mq-badge mq-badge-mode">Interactive Quest</span></div>
        </div>
      </header>
      <p class="mq-subtitle">Multiplication Adventure • Configure Your Quest!</p>

      <div class="mq-presets">
        <h2 class="mq-section-title">⚡ 1-Click Fast Presets</h2>
        <div class="mq-preset-grid">
          ${PRESETS.map(preset => `
            <button type="button" class="mq-preset-card ${state.activePresetId === preset.id ? "active" : ""}" data-preset-id="${preset.id}">
              <span class="mq-preset-name">${preset.name}${preset.popular ? ' <span class="mq-preset-popular">⭐ Popular</span>' : ""}</span>
              <span class="mq-preset-detail">${preset.tables ? `${preset.tables.length} Tables • ${formatTime(preset.timerSeconds)} • ${preset.questions} Questions` : "Fine-tune manually"}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <div class="mq-section mq-section-tables">
        <h2 class="mq-section-title">📊 Tables &amp; Difficulty <span class="mq-pill">${tier ? tier.nickname : "Custom"}</span></h2>
        <div class="mq-tier-grid">
          ${TIERS.map(t => `
            <button type="button" class="mq-tier-card ${t.id === tierId ? "active" : ""}" data-tier-id="${t.id}">
              <span class="mq-tier-name">${t.name}</span>
              <span class="mq-tier-nick">${t.nickname}</span>
              <span class="mq-tier-count">${t.tables.length} Tables</span>
            </button>
          `).join("")}
        </div>
        <div class="mq-chips-strip">
          <span class="mq-chips-label">${state.tables.size} Tables Active</span>
          <div class="mq-chips">
            ${Array.from({ length: 10 }, (_, i) => i + 1).map(n => `
              <button type="button" class="mq-chip ${state.tables.has(n) ? "active" : ""}" data-table="${n}">×${n}</button>
            `).join("")}
          </div>
        </div>
      </div>

      <div class="mq-section mq-section-timer">
        <h2 class="mq-section-title">⏱️ Timer &amp; Speed <span class="mq-pill">${getPaceLabel(state.timerSeconds)}</span></h2>
        <div class="mq-timer-presets">
          <button type="button" class="mq-timer-btn ${state.timerSeconds === 120 ? "active" : ""}" data-timer="120">Easy 2:00</button>
          <button type="button" class="mq-timer-btn ${state.timerSeconds === 90 ? "active" : ""}" data-timer="90">Medium 1:30</button>
          <button type="button" class="mq-timer-btn ${state.timerSeconds === 60 ? "active" : ""}" data-timer="60">Hard 1:00</button>
        </div>
        <div class="mq-slider-row">
          <span class="mq-slider-label">${formatTime(state.timerSeconds)}</span>
          <input type="range" class="mq-slider" min="${MATHQUEST_CONFIG.TIMER_SLIDER_MIN_SECONDS}" max="${MATHQUEST_CONFIG.TIMER_SLIDER_MAX_SECONDS}" value="${state.timerSeconds}" id="mq-timer-slider" />
        </div>
      </div>

      <div class="mq-section mq-section-questions">
        <h2 class="mq-section-title">📝 Number of Questions <span class="mq-pill">${getQuestLengthLabel(state.questions)}</span></h2>
        <div class="mq-questions-row">
          <div class="mq-question-presets">
            <button type="button" class="mq-question-btn ${state.questions === 5 ? "active" : ""}" data-questions="5">5</button>
            <button type="button" class="mq-question-btn ${state.questions === 8 ? "active" : ""}" data-questions="8">8</button>
            <button type="button" class="mq-question-btn ${state.questions === 10 ? "active" : ""}" data-questions="10">10</button>
          </div>
          <div class="mq-stepper">
            <button type="button" class="mq-stepper-btn" id="mq-step-down" ${state.questions <= 1 ? "disabled" : ""}>−</button>
            <span class="mq-step-value">${state.questions}</span>
            <button type="button" class="mq-stepper-btn" id="mq-step-up" ${state.questions >= maxQuestions ? "disabled" : ""}>+</button>
          </div>
          <span class="mq-max-label">Max: ${maxQuestions}</span>
        </div>
      </div>

      <div class="mq-summary">
        <div class="mq-summary-row"><span class="mq-summary-label">Tables Selected</span><span class="mq-summary-value">${state.tables.size} Tables (${activeTables.join(", ")})</span></div>
        <div class="mq-summary-row"><span class="mq-summary-label">Time Limit</span><span class="mq-summary-value">${state.timerSeconds} Seconds</span></div>
        <div class="mq-summary-row"><span class="mq-summary-label">Challenge Total</span><span class="mq-summary-value">${state.questions} Questions</span></div>
      </div>

      <button type="button" class="mq-btn-start" id="mq-start">Start Quest! 🚀</button>

      <div class="mq-tip">
        <div class="mq-tip-avatar" aria-hidden="true">🦉</div>
        <div class="mq-tip-body">
          <p class="mq-tip-label">Prof. Diin's Tip</p>
          <p class="mq-tip-text">${MATHQUEST_CONFIG.PROF_DIIN_TIPS[Math.floor(Math.random() * MATHQUEST_CONFIG.PROF_DIIN_TIPS.length)]}</p>
        </div>
      </div>

      <p class="mq-footer-tagline">No score penalties for retries! Learn through play.</p>
    </section>
  `;
}

function wireSetupEvents(app, state, setState, onStart) {
  const clearPreset = (s) => { s.activePresetId = null; };
  const clamp = (s) => { s.questions = clampQuestions(s.questions, s.tables.size); };

  app.querySelectorAll("[data-preset-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const preset = PRESETS.find(p => p.id === btn.dataset.presetId);
      if (preset.id === "custom") {
        setState({ ...state, activePresetId: "custom" });
        return;
      }
      setState({
        tables: new Set(preset.tables),
        timerSeconds: preset.timerSeconds,
        questions: preset.questions,
        activePresetId: preset.id,
      });
    });
  });

  app.querySelectorAll("[data-tier-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tier = TIERS.find(t => t.id === btn.dataset.tierId);
      const s = { ...state, tables: new Set(tier.tables), activePresetId: null };
      clamp(s);
      setState(s);
    });
  });

  app.querySelectorAll("[data-table]").forEach(btn => {
    btn.addEventListener("click", () => {
      const n = Number(btn.dataset.table);
      const s = { ...state, tables: new Set(state.tables), activePresetId: null };
      if (s.tables.has(n)) {
        if (s.tables.size <= MATHQUEST_CONFIG.MIN_ACTIVE_TABLES) return;
        s.tables.delete(n);
      } else {
        s.tables.add(n);
      }
      clamp(s);
      setState(s);
    });
  });

  app.querySelectorAll("[data-timer]").forEach(btn => {
    btn.addEventListener("click", () => {
      const s = { ...state, timerSeconds: Number(btn.dataset.timer) };
      clearPreset(s);
      setState(s);
    });
  });

  const slider = app.querySelector("#mq-timer-slider");
  if (slider) {
    slider.addEventListener("input", () => {
      const s = { ...state, timerSeconds: Number(slider.value) };
      clearPreset(s);
      setState(s);
    });
  }

  app.querySelectorAll("[data-questions]").forEach(btn => {
    btn.addEventListener("click", () => {
      const s = { ...state, questions: Number(btn.dataset.questions) };
      clearPreset(s);
      setState(s);
    });
  });

  const stepDown = app.querySelector("#mq-step-down");
  if (stepDown) stepDown.addEventListener("click", () => setState({ ...state, questions: Math.max(1, state.questions - 1), activePresetId: null }));
  const stepUp = app.querySelector("#mq-step-up");
  if (stepUp) stepUp.addEventListener("click", () => setState({ ...state, questions: clampQuestions(state.questions + 1, state.tables.size), activePresetId: null }));

  const startBtn = app.querySelector("#mq-start");
  if (startBtn) startBtn.addEventListener("click", () => {
    onStart({ tables: state.tables, timerSeconds: state.timerSeconds, questions: state.questions });
  });
}
