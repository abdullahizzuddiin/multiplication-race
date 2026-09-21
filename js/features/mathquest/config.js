export const MATHQUEST_CONFIG = Object.freeze({
  TIMER_SLIDER_MIN_SECONDS: 30,
  TIMER_SLIDER_MAX_SECONDS: 300,
  PACE_BAND_RELAXED_MIN: 106,
  PACE_BAND_MEDIUM_RANGE: 76,
  PACE_BAND_FAST_MAX: 75,
  MAX_QUESTIONS_PER_TABLE: 10,
  QUEST_LENGTH_QUICK_MAX: 6,
  QUEST_LENGTH_STANDARD_RANGE: 7,
  QUEST_LENGTH_MARATHON_MIN: 10,
  POINTS_PER_CORRECT: 100,
  STREAK_BONUS_PER_LEVEL: 10,
  SKIP_TIME_PENALTY_SECONDS: 10,
  SHOW_ARRAY_PULSE_DURATION_MS: 1500,
  SHOW_ARRAY_PULSE_SCALE: 1.15,
  MIN_ACTIVE_TABLES: 1,
  PROF_DIIN_TIPS: [
    "Multiplying by 10 always gives a zero at the end! 5 × 10 = 50.",
    "Doubling is multiplying by 2. So 4 × 2 = 4 + 4 = 8!",
    "Any number times 1 stays the same. 7 × 1 = 7.",
    "Count by fives: 5, 10, 15, 20 — that's the 5 times table!",
    "The 9 times table always has digits that add up to 9. 9 × 3 = 27, and 2 + 7 = 9!",
  ],
  PROF_DIIN_HINTS: {
    1: "Any number times 1 is just that number! 7 × 1 = 7.",
    2: "Just double the number! 6 × 2 = 6 + 6 = 12.",
    3: "Count by threes: 3, 6, 9, 12, 15 — keep going!",
    4: "Double it, then double again! 3 × 4 = 6 doubled = 12.",
    5: "Count by fives — every answer ends in 0 or 5!",
    6: "Think 5 plus 1: 6 × 4 = 20 + 4 = 24.",
    7: "Count by sevens: 7, 14, 21, 28, 35 — you've got this!",
    8: "Double three times! 3 × 8 = 6, 12, 24.",
    9: "Multiply by 10, then subtract the number. 4 × 9 = 40 − 4 = 36.",
    10: "Just add a zero! 8 × 10 = 80.",
  },
});

export function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function getPaceLabel(seconds) {
  const { PACE_BAND_RELAXED_MIN, PACE_BAND_MEDIUM_RANGE, PACE_BAND_FAST_MAX } = MATHQUEST_CONFIG;
  if (seconds >= PACE_BAND_RELAXED_MIN) return "Relaxed Pace";
  if (seconds >= PACE_BAND_MEDIUM_RANGE) return "Medium Pace";
  return "Fast Pace";
}

export function getQuestLengthLabel(count) {
  const { QUEST_LENGTH_QUICK_MAX, QUEST_LENGTH_MARATHON_MIN } = MATHQUEST_CONFIG;
  if (count >= QUEST_LENGTH_MARATHON_MIN) return "Marathon Quest";
  if (count > QUEST_LENGTH_QUICK_MAX) return "Standard Quest";
  return "Quick Quest";
}
