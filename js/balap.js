import Storage from "./storage.js";
import Questions from "./questions.js";

/**
 * Balap Kali core round loop.
 * Importer: app.js (Balap.start / Balap.quit). Uses Questions + Storage.
 */
const Balap = (() => {
  const BASE_POINTS = 10;
  const SPEED_BONUS_MAX = 10;
  const COMBO_BONUS = 5;

  let state = null;
  let timerRaf = null;
  let nextTimer = null;
  let onRoundEnd = null;

  function el(id) {
    return document.getElementById(id);
  }

  function createState(levelId, factsMap) {
    const level = Questions.getLevel(levelId);
    const questions = Questions.buildRound(levelId, factsMap);
    return {
      level,
      questions,
      index: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      correctCount: 0,
      answered: [],
      questionStartedAt: 0,
      timeLimitMs: level.timeSec * 1000,
      locked: false,
      advanceCount: 0,
    };
  }

  function setVehicleProgress() {
    const vehicle = el("vehicle");
    if (!vehicle || !state) return;
    const total = state.questions.length;
    const steps = state.advanceCount;
    const pct = total ? Math.min(steps / total, 1) : 0;
    vehicle.style.left = `${pct * 88}%`;
  }

  function updateHud() {
    el("play-score").textContent = String(state.score);
    el("q-index").textContent = String(Math.min(state.index + 1, state.questions.length));
    el("q-total").textContent = String(state.questions.length);
    const comboEl = el("play-combo");
    if (state.combo >= 2) {
      comboEl.hidden = false;
      comboEl.textContent = `x${state.combo}`;
    } else {
      comboEl.hidden = true;
    }
  }

  function stopTimer() {
    if (timerRaf) {
      cancelAnimationFrame(timerRaf);
      timerRaf = null;
    }
  }

  function startTimer() {
    stopTimer();
    const bar = el("timer-bar");
    bar.classList.remove("mid", "low");
    bar.style.transform = "scaleX(1)";
    const start = performance.now();
    state.questionStartedAt = start;
    const tick = (now) => {
      if (state.locked) return;
      const elapsed = now - start;
      const remain = Math.max(0, 1 - elapsed / state.timeLimitMs);
      bar.style.transform = `scaleX(${remain})`;
      bar.classList.toggle("mid", remain <= 0.5 && remain > 0.25);
      bar.classList.toggle("low", remain <= 0.25);
      if (remain <= 0) {
        handleTimeout();
        return;
      }
      timerRaf = requestAnimationFrame(tick);
    };
    timerRaf = requestAnimationFrame(tick);
  }

  function showFeedback(text, soft) {
    const box = el("feedback");
    el("feedback-text").textContent = text;
    box.hidden = false;
    box.classList.toggle("soft", !!soft);
  }

  function hideFeedback() {
    el("feedback").hidden = true;
  }

  function renderQuestion() {
    hideFeedback();
    state.locked = false;
    const q = state.questions[state.index];
    el("question-text").textContent = `${q.a} × ${q.b} = ?`;
    const choices = el("choices");
    choices.innerHTML = "";
    choices.classList.toggle("choices-3", q.options.length === 3);
    choices.classList.toggle("choices-4", q.options.length === 4);
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      btn.textContent = String(opt);
      btn.dataset.value = String(opt);
      btn.addEventListener("click", () => onChoice(opt, btn));
      choices.appendChild(btn);
    });
    updateHud();
    setVehicleProgress();
    startTimer();
  }

  function disableChoices() {
    el("choices").querySelectorAll(".choice").forEach((b) => {
      b.disabled = true;
    });
  }

  function scoreForAnswer(correct, elapsedMs) {
    if (!correct) return 0;
    const ratio = Math.max(0, 1 - elapsedMs / state.timeLimitMs);
    const speedBonus = Math.round(SPEED_BONUS_MAX * ratio);
    const comboBonus = state.combo >= 2 ? COMBO_BONUS * Math.min(state.combo - 1, 4) : 0;
    return BASE_POINTS + speedBonus + comboBonus;
  }

  function settleAnswer(correct, chosenBtn) {
    stopTimer();
    state.locked = true;
    disableChoices();
    const q = state.questions[state.index];
    const elapsed = performance.now() - state.questionStartedAt;

    if (correct) {
      state.combo += 1;
      state.maxCombo = Math.max(state.maxCombo, state.combo);
      state.correctCount += 1;
      state.advanceCount += 1;
      state.score += scoreForAnswer(true, elapsed);
      if (chosenBtn) chosenBtn.classList.add("correct");
      showFeedback(state.combo >= 3 ? "Keren! Sedang on fire!" : "Benar! Melaju!", false);
      const vehicle = el("vehicle");
      vehicle.classList.remove("boost");
      void vehicle.offsetWidth;
      vehicle.classList.add("boost");
      setVehicleProgress();
    } else {
      state.combo = 0;
      if (chosenBtn) chosenBtn.classList.add("wrong");
      el("choices").querySelectorAll(".choice").forEach((b) => {
        if (Number(b.dataset.value) === q.answer) b.classList.add("reveal");
      });
      showFeedback(
        chosenBtn ? `Hampir benar! Jawabannya ${q.answer}` : `Waktu habis. Jawabannya ${q.answer}`,
        true
      );
    }

    state.answered.push({
      a: q.a,
      b: q.b,
      correct,
      ms: elapsed,
      tableFocus: q.tableFocus,
    });
    Storage.recordFact(q.a, q.b, correct, elapsed);
    updateHud();
    nextTimer = setTimeout(() => {
      nextTimer = null;
      nextQuestion();
    }, correct ? 700 : 1200);
  }

  function onChoice(value, btn) {
    if (state.locked) return;
    const q = state.questions[state.index];
    settleAnswer(value === q.answer, btn);
  }

  function handleTimeout() {
    if (state.locked) return;
    settleAnswer(false, null);
  }

  function nextQuestion() {
    state.index += 1;
    if (state.index >= state.questions.length) {
      finishRound();
      return;
    }
    renderQuestion();
  }

  function finishRound() {
    stopTimer();
    const total = state.questions.length;
    const accuracy = total ? state.correctCount / total : 0;
    const avgMs =
      state.answered.length > 0
        ? state.answered.reduce((s, a) => s + a.ms, 0) / state.answered.length
        : 0;
    const avgSec = avgMs / 1000;
    const stars = Questions.starsFromAccuracy(accuracy);
    const leveledUp = Questions.canLevelUp(state.level.id, accuracy, avgSec);
    const insight = Questions.buildInsight(state.answered);

    const result = {
      score: state.score,
      correctCount: state.correctCount,
      total,
      accuracy,
      avgSec,
      stars,
      leveledUp,
      fromLevel: state.level.id,
      toLevel: leveledUp ? state.level.id + 1 : state.level.id,
      insight,
      maxCombo: state.maxCombo,
      answered: state.answered,
    };

    const progress = Storage.getProgress();
    progress.totalPoints += state.score;
    if (state.score > progress.bestScore) progress.bestScore = state.score;
    if (leveledUp && progress.level === state.level.id) {
      progress.level = Math.min(state.level.id + 1, 6);
    }
    Storage.saveProgress(progress);
    Storage.recordPlayDay();

    if (typeof onRoundEnd === "function") onRoundEnd(result);
  }

  function start(levelId, callbacks) {
    stopTimer();
    if (nextTimer) clearTimeout(nextTimer);
    nextTimer = null;
    onRoundEnd = callbacks && callbacks.onRoundEnd;
    const progress = Storage.getProgress();
    state = createState(levelId || progress.level, progress.facts);
    const vehicle = el("vehicle");
    if (vehicle) vehicle.style.left = "0%";
    setVehicleProgress();
    renderQuestion();
  }

  function quit() {
    stopTimer();
    if (nextTimer) clearTimeout(nextTimer);
    nextTimer = null;
    state = null;
  }

  return { start, quit, getState: () => state };
})();

export default Balap;
