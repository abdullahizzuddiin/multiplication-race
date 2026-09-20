import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("setup view renders all required controls", async () => {
  const source = await read("js/features/mathquest/views.js");
  const stateSource = await read("js/features/mathquest/state.js");
  assert.match(source, /renderSetup/);
  assert.match(source, /MathQuest 10×10/);
  assert.match(source, /AGES 6-11/);
  assert.match(stateSource, /Beginner Scout/);
  assert.match(stateSource, /Junior Explorer/);
  assert.match(stateSource, /Math Champion/);
  assert.match(stateSource, /Custom Adventure/);
  assert.match(stateSource, /Very Easy/);
  assert.match(stateSource, /Hard/);
  assert.match(source, /Start Quest/);
  assert.match(source, /Prof\. Diin's Tip/);
  assert.match(source, /No score penalties for retries/);
});

test("setup view does not include omitted elements", async () => {
  const source = await read("js/features/mathquest/views.js");
  assert.doesNotMatch(source, /Chill Mode/);
  assert.doesNotMatch(source, /Daily Quest/);
  assert.doesNotMatch(source, /Star Scout/);
});

test("mathquest CSS file exists", async () => {
  await read("css/mathquest.css");
});
