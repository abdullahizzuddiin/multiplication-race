import assert from "node:assert/strict";
import { test } from "node:test";
import { createQuest } from "../js/features/mathquest/engine.js";

function makeSettings(tables = [2, 3], timer = 120, questions = 4) {
  return { tables: new Set(tables), timerSeconds: timer, questions };
}

test("correct answer awards 100 base + streak bonus and advances question", () => {
  const quest = createQuest(makeSettings());
  const q1 = quest.getQuestion();
  quest.submitAnswer(q1.table * q1.multiplier);
  assert.equal(quest.getScore(), 110);
  assert.equal(quest.getStreak(), 1);
  assert.equal(quest.getCompleted(), 1);
});

test("second consecutive correct answer awards higher streak bonus", () => {
  const quest = createQuest(makeSettings());
  const q1 = quest.getQuestion();
  quest.submitAnswer(q1.table * q1.multiplier);
  const q2 = quest.getQuestion();
  quest.submitAnswer(q2.table * q2.multiplier);
  assert.equal(quest.getScore(), 230);
});

test("wrong answer resets streak but question stays the same", () => {
  const quest = createQuest(makeSettings());
  const q1 = quest.getQuestion();
  quest.submitAnswer(999);
  assert.equal(quest.getStreak(), 0);
  assert.equal(quest.getScore(), 0);
  assert.equal(quest.getCompleted(), 0);
  const current = quest.getQuestion();
  assert.equal(current.table, q1.table);
  assert.equal(current.multiplier, q1.multiplier);
});

test("skip deducts 10s, resets streak, advances question", () => {
  const quest = createQuest(makeSettings());
  const q1 = quest.getQuestion();
  quest.submitAnswer(q1.table * q1.multiplier);
  const beforeSkip = quest.getTimeRemaining();
  quest.skip();
  assert.equal(quest.getStreak(), 0);
  assert.equal(quest.getTimeRemaining(), beforeSkip - 10);
  assert.equal(quest.getCompleted(), 2);
});

test("accuracy tracks total attempts including wrong answers and skips", () => {
  const quest = createQuest(makeSettings());
  const q1 = quest.getQuestion();
  quest.submitAnswer(999);
  quest.submitAnswer(q1.table * q1.multiplier);
  quest.skip();
  const acc = quest.getAccuracy();
  assert.equal(acc.total, 3);
  assert.equal(acc.correct, 1);
  assert.equal(acc.percentage, 33);
});

test("timer reaching zero ends the quest with time-up", () => {
  const quest = createQuest(makeSettings([2, 3], 10));
  quest.tick(10);
  assert.equal(quest.getPhase(), "ended");
  assert.equal(quest.getEndReason(), "time-up");
});

test("reaching question target ends the quest with all-complete", () => {
  const quest = createQuest(makeSettings());
  for (let i = 0; i < 4; i++) {
    const q = quest.getQuestion();
    quest.submitAnswer(q.table * q.multiplier);
  }
  assert.equal(quest.getPhase(), "ended");
  assert.equal(quest.getEndReason(), "all-complete");
});

test("skip cannot make timer negative", () => {
  const quest = createQuest(makeSettings([2, 3], 5));
  quest.skip();
  assert.ok(quest.getTimeRemaining() >= 0);
});

test("best streak tracks highest streak achieved", () => {
  const quest = createQuest(makeSettings());
  for (let i = 0; i < 3; i++) {
    const q = quest.getQuestion();
    quest.submitAnswer(q.table * q.multiplier);
  }
  assert.equal(quest.getBestStreak(), 3);
});

test("mastered percent is solved / (activeTables × 10) × 100", () => {
  const quest = createQuest(makeSettings());
  assert.equal(quest.getMasteredPercent(), 0);
  const q = quest.getQuestion();
  quest.submitAnswer(q.table * q.multiplier);
  assert.equal(quest.getMasteredPercent(), 5);
});
