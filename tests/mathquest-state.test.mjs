import assert from "node:assert/strict";
import { test } from "node:test";
import {
  TIERS, PRESETS, createQuestSettings, buildQuestionPool, takeQuestion, clampQuestions, findTierByTables,
} from "../js/features/mathquest/state.js";

test("five tiers with correct table sets", () => {
  assert.equal(TIERS.length, 5);
  assert.deepEqual(TIERS[0].tables, [1, 2, 10]);
  assert.deepEqual(TIERS[1].tables, [1, 2, 5, 10]);
  assert.deepEqual(TIERS[2].tables, [1, 2, 3, 4, 5, 10]);
  assert.deepEqual(TIERS[3].tables, [1, 2, 3, 4, 5, 6, 9, 10]);
  assert.deepEqual(TIERS[4].tables, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(TIERS[0].nickname, "Starting Out");
  assert.equal(TIERS[2].nickname, "Brain Booster");
});

test("presets match spec values", () => {
  assert.equal(PRESETS.length, 4);
  assert.deepEqual(PRESETS[0].tables, [1, 2, 10]);
  assert.equal(PRESETS[0].timerSeconds, 120);
  assert.equal(PRESETS[0].questions, 5);
  assert.deepEqual(PRESETS[1].tables, [1, 2, 10, 5, 3, 4]);
  assert.equal(PRESETS[1].timerSeconds, 90);
  assert.equal(PRESETS[1].questions, 8);
  assert.equal(PRESETS[1].popular, true);
  assert.deepEqual(PRESETS[2].tables, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(PRESETS[2].timerSeconds, 60);
  assert.equal(PRESETS[2].questions, 10);
  assert.equal(PRESETS[3].id, "custom");
});

test("createQuestSettings returns active tables as a Set", () => {
  const settings = createQuestSettings("medium");
  assert.ok(settings.tables instanceof Set);
  assert.equal(settings.tables.size, 6);
  assert.ok(settings.tables.has(10));
  assert.equal(settings.timerSeconds, 90);
  assert.equal(settings.questions, 8);
});

test("buildQuestionPool produces exactly activeTables × 10 unique pairs", () => {
  const pool = buildQuestionPool(new Set([2, 5]));
  assert.equal(pool.length, 20);
  const keys = new Set(pool.map(q => `${q.table}x${q.multiplier}`));
  assert.equal(keys.size, 20);
});

test("takeQuestion pops from pool and returns null when empty", () => {
  const pool = [{ table: 2, multiplier: 3 }];
  const q = takeQuestion(pool);
  assert.equal(q.table, 2);
  assert.equal(q.multiplier, 3);
  assert.equal(pool.length, 0);
  assert.equal(takeQuestion(pool), null);
});

test("clampQuestions respects max and minimum", () => {
  assert.equal(clampQuestions(50, 3), 30);
  assert.equal(clampQuestions(8, 1), 8);
  assert.equal(clampQuestions(0, 1), 1);
});

test("findTierByTables matches exact sets only", () => {
  assert.equal(findTierByTables(new Set([1, 2, 10])), "very-easy");
  assert.equal(findTierByTables(new Set([1, 2, 3])), null);
});
