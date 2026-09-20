import { createRouter } from "./core/router.js";
import Storage from "./services/storage.js";
import Questions from "./questions.js";
import KebunQuestions from "./kebun-questions.js";
import Balap from "./features/balap/game.js";
import Kebun from "./features/kebun/game.js";
import { applyTheme, renderHome } from "./features/home/home.js";
import { renderCountdown, renderPlay as renderBalapPlay, renderResults as renderBalapResults } from "./features/balap/views.js";
import { renderMenu, renderPlay as renderKebunPlay, renderResults as renderKebunResults } from "./features/kebun/views.js";
import { renderSetup as renderMathQuestSetup, renderGame as renderMathQuestGame, renderResults as renderMathQuestResults } from "./features/mathquest/views.js";

const app = document.querySelector("#app");
const router = createRouter(app);
let lastKebunMode = "A";

function showHome() {
  Balap.quit();
  Kebun.quit();
  router.navigate((root) => renderHome(root, { onStart: startBalap, onKebun: showKebunMenu, onMathQuest: showMathQuestSetup }));
}

function showMathQuestSetup() {
  Balap.quit();
  Kebun.quit();
  router.navigate((root) => renderMathQuestSetup(root, {
    onStart: startMathQuestGame,
    onBack: showHome,
  }));
}

function startMathQuestGame(settings) {
  router.navigate((root) => {
    const cleanup = renderMathQuestGame(root, settings, {
      onExit: showMathQuestSetup,
      onEnd: showMathQuestResults,
    });
    return cleanup;
  });
}

function showMathQuestResults(result) {
  router.navigate((root) => renderMathQuestResults(root, result, {
    onAgain: () => startMathQuestGame(result),
    onSetup: showMathQuestSetup,
  }));
}

function startBalap() {
  const level = Questions.getLevel(Storage.getProgress().level);
  router.navigate((root) => {
    renderCountdown(root, level);
    const countdown = root.querySelector(".countdown-num");
    let count = 3;
    let active = true;
    const interval = setInterval(() => {
      count -= 1;
      countdown.textContent = String(count);
    }, 600);
    const timer = setTimeout(() => active && showBalapPlay(), 1800);
    return () => {
      active = false;
      clearInterval(interval);
      clearTimeout(timer);
    };
  });
}

function showBalapPlay() {
  const theme = applyTheme(Storage.getSettings().theme);
  router.navigate((root) => {
    renderBalapPlay(root, theme.vehicle);
    root.querySelector("#btn-quit").addEventListener("click", showHome);
    Balap.start(Storage.getProgress().level, { onRoundEnd: showBalapResults });
    return () => Balap.quit();
  });
}

function showBalapResults(result) {
  router.navigate((root) => renderBalapResults(root, result, { onAgain: startBalap, onHome: showHome }));
}

function showKebunMenu() {
  Kebun.quit();
  const progress = Storage.getProgress();
  router.navigate((root) => renderMenu(root, progress, KebunQuestions.getLevel(progress.kebunLevel), showHome, startKebun));
}

function startKebun(mode) {
  lastKebunMode = mode;
  router.navigate((root) => {
    renderKebunPlay(root);
    root.querySelector("#btn-kebun-quit").addEventListener("click", showKebunMenu);
    Kebun.start(mode, { onEnd: showKebunResults });
    return () => Kebun.quit();
  });
}

function showKebunResults(result) {
  router.navigate((root) => renderKebunResults(root, result, { onAgain: () => startKebun(lastKebunMode), onMenu: showKebunMenu }));
}

showHome();
