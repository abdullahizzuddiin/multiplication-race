import { MATHQUEST_CONFIG } from "./config.js";
import { buildQuestionPool, takeQuestion } from "./state.js";

export function createQuest(settings) {
  const pool = buildQuestionPool(settings.tables);
  const target = settings.questions;
  let currentQuestion = takeQuestion(pool);
  let phase = "playing";
  let endReason = null;
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let correctCount = 0;
  let totalAttempts = 0;
  let completed = 0;
  let timeRemaining = settings.timerSeconds;
  let isPaused = false;
  const solvedKeys = new Set();

  function endQuest(reason) {
    if (phase === "ended") return;
    phase = "ended";
    endReason = reason;
  }

  function checkEnd() {
    if (timeRemaining <= 0) endQuest("time-up");
    else if (completed >= target) endQuest("all-complete");
  }

  return {
    getPhase() { return phase; },
    getQuestion() { return phase === "ended" ? null : currentQuestion; },
    getScore() { return score; },
    getStreak() { return streak; },
    getBestStreak() { return bestStreak; },
    getCompleted() { return completed; },
    getTarget() { return target; },
    getTimeRemaining() { return Math.max(0, timeRemaining); },
    getIsPaused() { return isPaused; },
    pause() { isPaused = true; },
    resume() { isPaused = false; },
    getEndReason() { return endReason; },
    getAccuracy() {
      const percentage = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
      return { correct: correctCount, total: totalAttempts, percentage };
    },
    getMasteredPercent() {
      const total = settings.tables.size * MATHQUEST_CONFIG.MAX_QUESTIONS_PER_TABLE;
      return Math.round((solvedKeys.size / total) * 100);
    },
    getSolvedKeys() { return solvedKeys; },
    submitAnswer(answer) {
      if (phase !== "playing" || isPaused || !currentQuestion) return { correct: false };
      totalAttempts += 1;
      const key = `${currentQuestion.table}x${currentQuestion.multiplier}`;
      if (answer === currentQuestion.table * currentQuestion.multiplier) {
        streak += 1;
        bestStreak = Math.max(bestStreak, streak);
        score += MATHQUEST_CONFIG.POINTS_PER_CORRECT + MATHQUEST_CONFIG.STREAK_BONUS_PER_LEVEL * streak;
        correctCount += 1;
        completed += 1;
        solvedKeys.add(key);
        currentQuestion = takeQuestion(pool);
        checkEnd();
        return { correct: true };
      }
      streak = 0;
      return { correct: false };
    },
    skip() {
      if (phase !== "playing" || isPaused || !currentQuestion) return;
      timeRemaining -= MATHQUEST_CONFIG.SKIP_TIME_PENALTY_SECONDS;
      streak = 0;
      totalAttempts += 1;
      completed += 1;
      currentQuestion = takeQuestion(pool);
      checkEnd();
    },
    tick(seconds) {
      if (phase !== "playing" || isPaused) return;
      timeRemaining -= seconds;
      checkEnd();
    },
  };
}
