import assert from "node:assert/strict";
import { test } from "node:test";
import { MATHQUEST_CONFIG, formatTime, getPaceLabel, getQuestLengthLabel } from "../js/features/mathquest/config.js";

test("config constants match spec defaults", () => {
  assert.equal(MATHQUEST_CONFIG.TIMER_SLIDER_MIN_SECONDS, 30);
  assert.equal(MATHQUEST_CONFIG.TIMER_SLIDER_MAX_SECONDS, 300);
  assert.equal(MATHQUEST_CONFIG.PACE_BAND_RELAXED_MIN, 106);
  assert.equal(MATHQUEST_CONFIG.PACE_BAND_MEDIUM_RANGE, 76);
  assert.equal(MATHQUEST_CONFIG.PACE_BAND_FAST_MAX, 75);
  assert.equal(MATHQUEST_CONFIG.MAX_QUESTIONS_PER_TABLE, 10);
  assert.equal(MATHQUEST_CONFIG.QUEST_LENGTH_QUICK_MAX, 6);
  assert.equal(MATHQUEST_CONFIG.QUEST_LENGTH_MARATHON_MIN, 10);
  assert.equal(MATHQUEST_CONFIG.POINTS_PER_CORRECT, 100);
  assert.equal(MATHQUEST_CONFIG.STREAK_BONUS_PER_LEVEL, 10);
  assert.equal(MATHQUEST_CONFIG.SKIP_TIME_PENALTY_SECONDS, 10);
  assert.equal(MATHQUEST_CONFIG.SHOW_ARRAY_PULSE_DURATION_MS, 1500);
  assert.equal(MATHQUEST_CONFIG.SHOW_ARRAY_PULSE_SCALE, 1.15);
  assert.equal(MATHQUEST_CONFIG.MIN_ACTIVE_TABLES, 1);
});

test("formatTime formats seconds as m:ss", () => {
  assert.equal(formatTime(125), "2:05");
  assert.equal(formatTime(60), "1:00");
  assert.equal(formatTime(30), "0:30");
  assert.equal(formatTime(0), "0:00");
});

test("pace labels follow spec thresholds", () => {
  assert.equal(getPaceLabel(30), "Fast Pace");
  assert.equal(getPaceLabel(75), "Fast Pace");
  assert.equal(getPaceLabel(76), "Medium Pace");
  assert.equal(getPaceLabel(105), "Medium Pace");
  assert.equal(getPaceLabel(106), "Relaxed Pace");
  assert.equal(getPaceLabel(300), "Relaxed Pace");
});

test("quest length labels follow spec thresholds", () => {
  assert.equal(getQuestLengthLabel(1), "Quick Quest");
  assert.equal(getQuestLengthLabel(6), "Quick Quest");
  assert.equal(getQuestLengthLabel(7), "Standard Quest");
  assert.equal(getQuestLengthLabel(9), "Standard Quest");
  assert.equal(getQuestLengthLabel(10), "Marathon Quest");
  assert.equal(getQuestLengthLabel(50), "Marathon Quest");
});
