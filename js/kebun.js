import Storage from "./storage.js";
import KebunQuestions from "./kebun-questions.js";

/** Kebun Kali session controller. Uses Storage and KebunQuestions. */
const Kebun = (() => {
  const MODE_NAMES = { A: "Tanam Kelompok", B: "Tebak Kebun", C: "Kebun Kilat" };
  let state = null;
  let timerRaf = null;
  let nextTimer = null;
  let onEnd = null;

  const el = (id) => document.getElementById(id);
  const clearTimers = () => {
    if (timerRaf) cancelAnimationFrame(timerRaf);
    if (nextTimer) clearTimeout(nextTimer);
    timerRaf = null;
    nextTimer = null;
  };

  function renderHud() {
    el("kebun-mode-label").textContent = MODE_NAMES[state.mode];
    el("kebun-index").textContent = String(state.index + 1);
    el("kebun-total").textContent = String(state.questions.length);
    el("kebun-points").textContent = String(state.points);
  }

  function feedback(message, soft) {
    const node = el("kebun-feedback");
    node.textContent = message;
    node.classList.toggle("soft", !!soft);
  }

  function stopTimer() {
    if (timerRaf) cancelAnimationFrame(timerRaf);
    timerRaf = null;
  }

  function startTimer() {
    const bar = el("kebun-timer");
    bar.hidden = false;
    const started = performance.now();
    state.startedAt = started;
    const tick = (now) => {
      if (state.locked) return;
      const remaining = Math.max(0, 1 - (now - started) / 20000);
      bar.style.transform = `scaleX(${remaining})`;
      if (remaining <= 0) settle(false, null, true);
      else timerRaf = requestAnimationFrame(tick);
    };
    timerRaf = requestAnimationFrame(tick);
  }

  function makeChoice(option, correct) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    button.textContent = String(option);
    button.addEventListener("click", () => settle(option === correct, button, false));
    return button;
  }

  function renderA(q) {
    const pots = el("kebun-pots");
    pots.hidden = false;
    pots.innerHTML = "";
    el("kebun-story").textContent = `Ada ${q.a} pot. Isi setiap pot dengan ${q.b} bibit!`;
    el("kebun-question").textContent = `${q.a} kelompok × ${q.b} bibit`;
    state.startedAt = performance.now();
    const counts = Array(q.a).fill(0);
    for (let i = 0; i < q.a; i += 1) {
      const pot = document.createElement("div");
      pot.className = "garden-pot";
      const seeds = document.createElement("div");
      seeds.className = "pot-seeds";
      const counter = document.createElement("span");
      counter.className = "pot-counter";
      counter.textContent = "0 bibit";
      const controls = document.createElement("div");
      controls.className = "pot-controls";
      const minusButton = document.createElement("button");
      minusButton.type = "button";
      minusButton.className = "pot-add pot-remove";
      minusButton.textContent = "−";
      minusButton.disabled = true;
      minusButton.setAttribute("aria-label", `Kurangi bibit dari pot ${i + 1}`);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pot-add";
      button.textContent = "+";
      button.setAttribute("aria-label", `Tambah bibit ke pot ${i + 1}`);
      const updatePot = () => {
        seeds.textContent = "🌱".repeat(counts[i]);
        counter.textContent = `${counts[i]} bibit`;
        minusButton.disabled = counts[i] === 0;
        el("kebun-count").disabled = !counts.every((n) => n > 0);
      };
      minusButton.addEventListener("click", () => {
        if (state.locked || counts[i] === 0) return;
        counts[i] -= 1;
        updatePot();
      });
      button.addEventListener("click", () => {
        if (state.locked) return;
        counts[i] += 1;
        updatePot();
        if (counts.every((n) => n > 0)) {
          feedback("Yuk tekan Hitung saat setiap pot sudah siap!", false);
        }
      });
      controls.append(minusButton, button);
      pot.append(seeds, counter, controls);
      pots.appendChild(pot);
    }
    const countButton = el("kebun-count");
    countButton.hidden = false;
    countButton.disabled = true;
    countButton.onclick = () => {
      if (counts.every((n) => n === q.b)) {
        settle(true, countButton, false);
        return;
      }
      feedback(`Belum pas. Setiap pot perlu ${q.b} bibit. Yuk periksa lagi!`, true);
      countButton.classList.remove("try-again");
      void countButton.offsetWidth;
      countButton.classList.add("try-again");
    };
  }

  function renderQuestion() {
    stopTimer();
    state.locked = false;
    const q = state.questions[state.index];
    el("kebun-feedback").textContent = "";
    el("kebun-array").innerHTML = "";
    el("kebun-pots").hidden = true;
    el("kebun-count").hidden = true;
    el("kebun-timer").hidden = true;
    const choices = el("kebun-choices");
    choices.innerHTML = "";
    renderHud();
    if (state.mode === "A") {
      renderA(q);
      return;
    }
    el("kebun-story").textContent = state.mode === "B" ? "Hitung bunga di kebun ini." : "Jawab tanpa melihat kebun!";
    el("kebun-question").textContent = state.mode === "B" ? "Berapa semua bunga?" : `${q.a} × ${q.b} = ?`;
    if (state.mode === "B") {
      const array = el("kebun-array");
      array.style.setProperty("--columns", q.b);
      for (let i = 0; i < q.answer; i += 1) {
        const flower = document.createElement("span");
        flower.className = "garden-flower";
        flower.textContent = "🌼";
        array.appendChild(flower);
      }
    }
    q.options.forEach((option) => choices.appendChild(makeChoice(option, q.answer)));
    if (state.mode === "C") startTimer();
    else state.startedAt = performance.now();
  }

  function settle(correct, chosen, timeout) {
    if (!state || state.locked) return;
    state.locked = true;
    stopTimer();
    const q = state.questions[state.index];
    const elapsed = performance.now() - state.startedAt;
    el("kebun-choices").querySelectorAll("button").forEach((button) => { button.disabled = true; });
    if (correct) {
      state.correct += 1;
      state.points += 10 + (state.mode === "C" ? 5 : 0);
      if (chosen) chosen.classList.add("correct");
      el("kebun-array").classList.add("bloom");
      feedback(state.mode === "A" ? `${q.a} × ${q.b} = ${q.answer}. Hebat!` : "Benar! Kebunmu makin indah!", false);
    } else {
      if (chosen) chosen.classList.add("wrong");
      el("kebun-choices").querySelectorAll("button").forEach((button) => {
        if (Number(button.textContent) === q.answer) button.classList.add("reveal");
      });
      feedback(timeout ? `Waktunya habis. Jawabannya ${q.answer}.` : `Hampir benar. Jawabannya ${q.answer}.`, true);
    }
    Storage.recordFact(q.a, q.b, correct, elapsed);
    renderHud();
    nextTimer = setTimeout(next, correct ? 850 : 1350);
  }

  function next() {
    state.index += 1;
    if (state.index < state.questions.length) renderQuestion();
    else finish();
  }

  function finish() {
    const total = state.questions.length;
    const accuracy = state.correct / total;
    const result = { mode: state.mode, points: state.points, correct: state.correct, total, accuracy, stars: KebunQuestions.stars(accuracy) };
    const progress = Storage.saveKebunSession(result);
    result.level = progress.kebunLevel;
    if (typeof onEnd === "function") onEnd(result);
  }

  function start(mode, callbacks) {
    clearTimers();
    const progress = Storage.getProgress();
    onEnd = callbacks && callbacks.onEnd;
    state = { mode, questions: KebunQuestions.buildSession(progress.kebunLevel, mode), index: 0, correct: 0, points: 0, locked: false, startedAt: 0 };
    renderQuestion();
  }

  function quit() { clearTimers(); state = null; }
  return { start, quit, MODE_NAMES };
})();

export default Kebun;
