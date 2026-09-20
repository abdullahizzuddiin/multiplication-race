import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("game view renders grid, problem panel, input, and keypad", async () => {
  const source = await read("js/features/mathquest/views.js");
  assert.match(source, /renderGame/);
  assert.match(source, /mq-grid/);
  assert.match(source, /mq-cell/);
  assert.match(source, /Submit Answer/);
  assert.match(source, /Show Array/);
  assert.match(source, /Skip/);
  assert.match(source, /Pause/);
  assert.match(source, /Prof\. Diin's Hint/);
  assert.match(source, /Grid Progress/);
});

test("game view does not render omitted elements", async () => {
  const source = await read("js/features/mathquest/views.js");
  assert.doesNotMatch(source, /Round 15/);
  assert.doesNotMatch(source, /Target Intersection/);
  assert.doesNotMatch(source, /mq-stat-label">Best<\/span>/);
});

test("results view renders stats and buttons", async () => {
  const source = await read("js/features/mathquest/views.js");
  assert.match(source, /renderResults/);
  assert.match(source, /Quest Complete/);
  assert.match(source, /Final Score/);
  assert.match(source, /Play Again/);
  assert.match(source, /Back to Setup/);
});

test("main.js routes mathquest game and results", async () => {
  const source = await read("js/main.js");
  assert.match(source, /startMathQuestGame/);
  assert.match(source, /renderGame/);
  assert.match(source, /renderResults/);
});
