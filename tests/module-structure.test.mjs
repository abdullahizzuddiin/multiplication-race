import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("the HTML shell supports direct file opening without loading every game screen", async () => {
  const html = await read("index.html");

  assert.match(html, /<main id="app"><\/main>/);
  assert.match(html, /<script src="js\/app\.bundle\.js"><\/script>/);
  assert.doesNotMatch(html, /type="module"/);
  assert.doesNotMatch(html, /screen-kebun-play|screen-countdown|screen-results/);
  assert.doesNotMatch(html, /<script src="js\/storage\.js"><\/script>/);
});

test("the direct-file bundle contains no module syntax", async () => {
  const bundle = await read("js/app.bundle.js");

  assert.doesNotMatch(bundle, /^\s*import\s/m);
  assert.doesNotMatch(bundle, /^\s*export\s/m);
  assert.match(bundle, /showHome\(\);/);
});

test("each feature and shared service has its own module", async () => {
  const modules = [
    "js/main.js",
    "js/core/router.js",
    "js/services/storage.js",
    "js/features/home/home.js",
    "js/features/balap/game.js",
    "js/features/kebun/game.js",
    "css/base.css",
    "css/components.css",
    "css/home.css",
    "css/balap.css",
    "css/kebun.css",
  ];

  await Promise.all(modules.map((path) => access(new URL(path, root))));
});

test("Balap cancels delayed question advancement when its view unmounts", async () => {
  const source = await read("js/balap.js");

  assert.match(source, /let nextTimer = null/);
  assert.match(source, /nextTimer = setTimeout\(/);
  assert.match(source, /function quit\(\) \{\s*stopTimer\(\);\s*if \(nextTimer\) clearTimeout\(nextTimer\);/);
});

test("Balap countdown updates its visible number before starting play", async () => {
  const source = await read("js/main.js");

  assert.match(source, /querySelector\("\.countdown-num"\)/);
  assert.match(source, /setInterval\(/);
  assert.match(source, /countdown\.textContent = String\(count\)/);
});
