import { MATHQUEST_CONFIG, formatTime, getPaceLabel, getQuestLengthLabel } from "./config.js";
import { TIERS, PRESETS, buildQuestionPool, clampQuestions, findTierByTables, QUESTIONS_PER_TABLE } from "./state.js";
import { createQuest } from "./engine.js";

export function renderSetup(app, { onStart, onBack }) {
  let state = {
    tables: new Set([1, 2, 3, 4, 5, 10]),
    timerSeconds: 90,
    questions: 8,
    activePresetId: null,
  };

  function reRender() {
    app.innerHTML = buildSetupHTML(state);
    wireSetupEvents(app, state, (newState) => { state = newState; reRender(); }, onStart, onBack);
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
        <button type="button" class="mq-btn-back" id="mq-back" aria-label="Back to home">← Back</button>
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

function wireSetupEvents(app, state, setState, onStart, onBack) {
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

  const backBtn = app.querySelector("#mq-back");
  if (backBtn && onBack) backBtn.addEventListener("click", onBack);
}

export function renderGame(app, settings, { onExit, onEnd }) {
  const quest = createQuest(settings);
  let timerInterval = null;
  let active = true;

  function buildGrid() {
    const currentQ = quest.getQuestion();
    let html = '<div class="mq-grid" role="grid" aria-label="Multiplication Matrix">';
    html += '<div class="mq-cell mq-header-cell">×';
    for (let col = 1; col <= 10; col++) html += `</div><div class="mq-cell mq-header-cell ${currentQ && col === currentQ.multiplier ? "mq-target-col" : ""}">${col}`;
    for (let row = 1; row <= 10; row++) {
      html += `</div><div class="mq-cell mq-header-cell ${currentQ && row === currentQ.table ? "mq-target-row" : ""}">${row}`;
      for (let col = 1; col <= 10; col++) {
        const key = `${row}x${col}`;
        const solved = quest.getSolvedKeys().has(key);
        const isTarget = currentQ && row === currentQ.table && col === currentQ.multiplier;
        const isCrosshair = currentQ && !isTarget && (row === currentQ.table || col === currentQ.multiplier);
        const product = row * col;
        const content = isTarget ? "?" : product;
        const cls = [
          "mq-cell",
          solved ? "solved" : "",
          isTarget ? "target" : "",
          isCrosshair ? "crosshair" : "",
          isTarget || isCrosshair ? "" : "default",
        ].filter(Boolean).join(" ");
        html += `</div><div class="${cls}" data-key="${key}">${content}${solved ? " ✓" : ""}`;
      }
    }
    html += "</div></div>";
    return html;
  }

  function updateGameDOM() {
    const currentQ = quest.getQuestion();
    const timerEl = app.querySelector("#mq-timer-text");
    const timerBarEl = app.querySelector("#mq-timer-bar");
    if (timerEl) timerEl.textContent = formatTime(quest.getTimeRemaining());
    if (timerBarEl) timerBarEl.style.width = `${(quest.getTimeRemaining() / settings.timerSeconds) * 100}%`;
    const scoreEl = app.querySelector("#mq-score");
    if (scoreEl) scoreEl.textContent = String(quest.getScore());
    const streakEl = app.querySelector("#mq-streak");
    if (streakEl) streakEl.textContent = `×${quest.getStreak()}`;
    const accuracyEl = app.querySelector("#mq-accuracy");
    if (accuracyEl) { const acc = quest.getAccuracy(); accuracyEl.textContent = `${acc.correct}/${acc.total} • ${acc.percentage}%`; }
    const progressEl = app.querySelector("#mq-progress");
    if (progressEl) progressEl.textContent = `${quest.getMasteredPercent()}% Mastered`;
    const gridEl = app.querySelector("#mq-grid-wrap");
    if (gridEl) gridEl.innerHTML = buildGrid();
    const problemEl = app.querySelector("#mq-problem");
    if (problemEl) problemEl.textContent = currentQ ? `${currentQ.table} × ${currentQ.multiplier} = ` : "";
    const hintEl = app.querySelector("#mq-hint-text");
    if (hintEl) hintEl.textContent = currentQ ? MATHQUEST_CONFIG.PROF_DIIN_HINTS[currentQ.table] || "" : "";
  }

  app.innerHTML = `
    <section id="screen-mathquest-game" class="screen active mq-game" aria-label="MathQuest Game">
      <header class="mq-game-header">
        <div class="mq-game-stats">
          <div class="mq-stat"><span class="mq-stat-label">Timer</span><span class="mq-stat-value" id="mq-timer-text">${formatTime(quest.getTimeRemaining())}</span></div>
          <div class="mq-stat"><span class="mq-stat-label">Score</span><span class="mq-stat-value" id="mq-score">0</span></div>
          <div class="mq-stat mq-desktop-only"><span class="mq-stat-label">Accuracy</span><span class="mq-stat-value" id="mq-accuracy">0/0 • 0%</span></div>
          <div class="mq-stat mq-desktop-only"><span class="mq-stat-label">Streak</span><span class="mq-stat-value" id="mq-streak">×0</span></div>
        </div>
        <div class="mq-timer-bar-wrap"><div class="mq-timer-bar" id="mq-timer-bar" style="width:100%"></div></div>
        <div class="mq-game-actions">
          <button type="button" class="mq-btn-sm" id="mq-pause">⏸ Pause</button>
          <button type="button" class="mq-btn-sm mq-mobile-only" id="mq-exit">✕ Exit</button>
        </div>
      </header>
      <div class="mq-grid-wrap" id="mq-grid-wrap">${buildGrid()}</div>
      <div class="mq-progress-row"><span class="mq-progress-label">Grid Progress</span><span class="mq-progress-value" id="mq-progress">0% Mastered</span></div>
      <div class="mq-problem-panel">
        <p class="mq-problem" id="mq-problem"></p>
        <div class="mq-hint"><div class="mq-hint-avatar" aria-hidden="true">🦉</div><div><p class="mq-hint-label">Prof. Diin's Hint</p><p class="mq-hint-text" id="mq-hint-text"></p></div></div>
        <div class="mq-problem-actions">
          <button type="button" class="mq-btn-sm" id="mq-show-array">💡 Show Array</button>
          <button type="button" class="mq-btn-sm" id="mq-skip">⏭ Skip</button>
        </div>
      </div>
      <div class="mq-answer-row">
        <input type="number" inputmode="numeric" class="mq-input" id="mq-answer-input" placeholder="Answer" aria-label="Answer" autocomplete="off" />
        <button type="button" class="mq-btn-submit" id="mq-submit">Submit Answer</button>
      </div>
      <div class="mq-keypad mq-desktop-only" id="mq-keypad">
        <div class="mq-keypad-toggle"><button type="button" class="mq-btn-sm" id="mq-keypad-hide">Hide Keypad</button></div>
        <div class="mq-keypad-grid">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => `<button type="button" class="mq-key" data-key-value="${n}">${n}</button>`).join("")}
          <button type="button" class="mq-key" id="mq-key-clr">CLR</button>
          <button type="button" class="mq-key" id="mq-key-backspace">⌫</button>
        </div>
      </div>
    </section>
  `;

  function tick() {
    if (!active || quest.getPhase() === "ended") { clearInterval(timerInterval); return; }
    quest.tick(1);
    if (quest.getPhase() === "ended") {
      clearInterval(timerInterval);
      active = false;
      onEnd({
        ...settings,
        score: quest.getScore(),
        accuracy: quest.getAccuracy(),
        bestStreak: quest.getBestStreak(),
        completed: quest.getCompleted(),
        target: quest.getTarget(),
        endReason: quest.getEndReason(),
        solvedKeys: quest.getSolvedKeys(),
        masteredPercent: quest.getMasteredPercent(),
      });
      return;
    }
    updateGameDOM();
  }

  timerInterval = setInterval(tick, 1000);

  function submitAnswer() {
    if (quest.getPhase() !== "playing" || quest.getIsPaused()) return;
    const input = app.querySelector("#mq-answer-input");
    if (!input || input.value === "") return;
    quest.submitAnswer(Number(input.value));
    input.value = "";
    updateGameDOM();
    if (quest.getPhase() === "ended") {
      clearInterval(timerInterval);
      active = false;
      onEnd({
        ...settings,
        score: quest.getScore(),
        accuracy: quest.getAccuracy(),
        bestStreak: quest.getBestStreak(),
        completed: quest.getCompleted(),
        target: quest.getTarget(),
        endReason: quest.getEndReason(),
        solvedKeys: quest.getSolvedKeys(),
        masteredPercent: quest.getMasteredPercent(),
      });
    }
  }

  app.querySelector("#mq-submit").addEventListener("click", submitAnswer);
  const answerInput = app.querySelector("#mq-answer-input");
  answerInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); submitAnswer(); } });

  app.querySelector("#mq-skip").addEventListener("click", () => {
    quest.skip();
    updateGameDOM();
    if (quest.getPhase() === "ended") {
      clearInterval(timerInterval);
      active = false;
      onEnd({
        ...settings,
        score: quest.getScore(),
        accuracy: quest.getAccuracy(),
        bestStreak: quest.getBestStreak(),
        completed: quest.getCompleted(),
        target: quest.getTarget(),
        endReason: quest.getEndReason(),
        solvedKeys: quest.getSolvedKeys(),
        masteredPercent: quest.getMasteredPercent(),
      });
    }
  });

  const pauseBtn = app.querySelector("#mq-pause");
  pauseBtn.addEventListener("click", () => {
    if (quest.getIsPaused()) {
      quest.resume();
      pauseBtn.textContent = "⏸ Pause";
      app.querySelector("#mq-grid-wrap").classList.remove("mq-paused");
    } else {
      quest.pause();
      pauseBtn.textContent = "▶ Resume";
      app.querySelector("#mq-grid-wrap").classList.add("mq-paused");
    }
  });

  const exitBtn = app.querySelector("#mq-exit");
  if (exitBtn) exitBtn.addEventListener("click", () => {
    if (confirm("Exit quest? Your progress will be lost.")) {
      clearInterval(timerInterval);
      active = false;
      onExit();
    }
  });

  app.querySelector("#mq-show-array").addEventListener("click", () => {
    const crosshairs = app.querySelectorAll("#mq-grid-wrap .crosshair");
    crosshairs.forEach(c => c.classList.add("mq-pulse"));
    setTimeout(() => crosshairs.forEach(c => c.classList.remove("mq-pulse")), MATHQUEST_CONFIG.SHOW_ARRAY_PULSE_DURATION_MS);
  });

  const keypadHideBtn = app.querySelector("#mq-keypad-hide");
  const keypadEl = app.querySelector("#mq-keypad");
  if (keypadHideBtn && keypadEl) {
    keypadHideBtn.addEventListener("click", () => {
      const hidden = keypadEl.style.display === "none";
      keypadEl.style.display = hidden ? "" : "none";
      keypadHideBtn.textContent = hidden ? "Hide Keypad" : "Show Keypad";
    });
  }

  app.querySelectorAll("[data-key-value]").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = app.querySelector("#mq-answer-input");
      if (input) input.value += btn.dataset.keyValue;
    });
  });
  const clrBtn = app.querySelector("#mq-key-clr");
  if (clrBtn) clrBtn.addEventListener("click", () => { const input = app.querySelector("#mq-answer-input"); if (input) input.value = ""; });
  const backspaceBtn = app.querySelector("#mq-key-backspace");
  if (backspaceBtn) backspaceBtn.addEventListener("click", () => { const input = app.querySelector("#mq-answer-input"); if (input) input.value = input.value.slice(0, -1); });

  return () => {
    active = false;
    clearInterval(timerInterval);
  };
}

export function renderResults(app, result, { onAgain, onSetup }) {
  const reasonText = result.endReason === "time-up" ? "Time's up!" : "All questions complete!";
  app.innerHTML = `
    <div class="mq-modal-overlay">
      <div class="mq-modal">
        <h2 class="mq-modal-title">Quest Complete!</h2>
        <p class="mq-modal-subtitle">${reasonText}</p>
        <div class="mq-modal-stats">
          <div class="mq-modal-stat"><span class="mq-stat-label">Final Score</span><span class="mq-stat-value">${result.score} pts</span></div>
          <div class="mq-modal-stat"><span class="mq-stat-label">Correct Answers</span><span class="mq-stat-value">${result.accuracy.correct} / ${result.accuracy.total} (${result.accuracy.percentage}%)</span></div>
          <div class="mq-modal-stat"><span class="mq-stat-label">Best Streak</span><span class="mq-stat-value">×${result.bestStreak}</span></div>
          <div class="mq-modal-stat"><span class="mq-stat-label">Questions Completed</span><span class="mq-stat-value">${result.completed} / ${result.target}</span></div>
        </div>
        <div class="mq-modal-actions">
          <button type="button" class="mq-btn-start" id="mq-again">Play Again</button>
          <button type="button" class="mq-btn-ghost" id="mq-setup-btn">Back to Setup</button>
        </div>
      </div>
    </div>
  `;
  app.querySelector("#mq-again").addEventListener("click", onAgain);
  app.querySelector("#mq-setup-btn").addEventListener("click", onSetup);
}
