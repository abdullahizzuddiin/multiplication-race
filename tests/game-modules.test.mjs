import assert from "node:assert/strict";
import { test } from "node:test";
import Questions from "../js/questions.js";
import KebunQuestions from "../js/kebun-questions.js";

test("Balap question module builds a complete level-1 round", () => {
  const round = Questions.buildRound(1, {});

  assert.equal(round.length, Questions.QUESTIONS_PER_ROUND);
  round.forEach((question) => {
    assert.equal(question.answer, question.a * question.b);
    assert.ok(question.options.includes(question.answer));
  });
});

test("Kebun question module keeps its mode-specific choice count", () => {
  const visualSession = KebunQuestions.buildSession(1, "A");
  const speedSession = KebunQuestions.buildSession(1, "C");

  assert.equal(visualSession.length, KebunQuestions.QUESTIONS_PER_SESSION);
  assert.ok(visualSession.every((question) => question.options.length === 3));
  assert.ok(speedSession.every((question) => question.options.length === 4));
});
