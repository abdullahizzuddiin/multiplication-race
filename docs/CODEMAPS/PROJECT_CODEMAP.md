<!-- Generated: 2026-09-20 | Files scanned: 27 runtime/test files | Token estimate: ~770 -->

# Jagoan Kali — Project Codemap

## Purpose and stack

Single-page multiplication game for children, with two activities: **Balap Kali** (race quiz) and **Kebun Kali** (visual/grouping quiz). Runtime is dependency-free vanilla HTML, CSS, and browser-native ES modules. There is no package manager, build step, backend, API, or database; browser `localStorage` is the persistent store.

`DESIGN.md` is the visual-system reference. `Rancangan-Game-Jagoan-Kali.md` is the product/design brief. `ui_examples/` contains reference-only prototypes and screenshots; none are imported at runtime.

## Runtime architecture

```text
index.html
  -> #app + js/app.bundle.js (classic-script bundle; file:// compatible)
  -> generated from js/main.js and feature/core modules
  -> core/router.js: replace mounted screen; invoke prior cleanup
  -> feature view module renders one screen into #app
  -> feature engine controls quiz/timer/score
  -> storage.js reads or writes localStorage
```

`index.html` is intentionally only the shell, stylesheet links, and the generated `js/app.bundle.js`. It can be opened directly with `file://`; screens are rendered on demand, so inactive game pages are not kept in the DOM.

## Navigation and ownership

| Route/state | Coordinator in `js/main.js` | View module | Engine |
|---|---|---|---|
| Home | `showHome` | `features/home/home.js:renderHome` | — |
| Balap countdown/play/results | `startBalap`, `showBalapPlay`, `showBalapResults` | `features/balap/views.js` | `features/balap/game.js` → `balap.js` |
| Kebun menu/play/results | `showKebunMenu`, `startKebun`, `showKebunResults` | `features/kebun/views.js` | `features/kebun/game.js` → `kebun.js` |

`core/router.js:createRouter(app)` calls the previous screen cleanup before replacing `#app`. Balap and Kebun cleanup stop animation frames and pending timers. In particular, `balap.js:quit` cancels delayed question advancement so an exited game cannot update an unmounted view.

## Key modules

```text
js/main.js                    Application composition and navigation callbacks
scripts/build-file-bundle.mjs Converts the module source graph to the shipped classic bundle
js/app.bundle.js              Generated runtime bundle; do not edit directly
js/core/router.js             Minimal screen mount/unmount lifecycle
js/features/home/home.js      Home markup, theme selection, dashboard values
js/features/balap/views.js    Countdown, quiz, and result markup
js/features/kebun/views.js    Mode-menu, quiz, and result markup
js/balap.js                   Balap scoring, timer, HUD, question progression
js/kebun.js                   Kebun modes A/B/C, timer, scoring, progression
js/questions.js               Balap levels, adaptive question selection, insights
js/kebun-questions.js         Kebun levels, session/question generation
js/storage.js                 Persistence, streaks, fact history, unlocks
```

`services/storage.js` and the two `features/*/game.js` files are module-boundary re-exports. They provide feature-oriented import paths while the engine implementations remain in their original root files. `js/app.js` is the pre-module controller and is no longer loaded by `index.html`; do not import it for new work.

## State and data flow

```text
User input -> feature engine -> result callback -> main.js route change
                   |                    |
                   v                    v
              question module       storage.js
                                      -> localStorage
                                      -> next Home/menu render
```

LocalStorage keys are compatibility contracts: `jagoanKali_progress`, `jagoanKali_streak`, and `jagoanKali_settings`. `Storage.getProgress()` normalizes older saves with missing Kebun fields. Keep these keys and the progress shape stable unless a migration is added.

- Balap: `Questions.buildRound(level, facts)` favors unseen/weak facts; `Balap` records fact accuracy/timing, score, best score, level changes, and streak.
- Kebun: `KebunQuestions.buildSession(level, mode)` creates five questions; `Kebun` records points, unlocks modes B/C, and advances garden level after strong sessions.
- Theme: Home updates `settings.theme`; every mounted Home or Balap view reads the saved theme.

## Styling

`css/base.css` imports the established visual rules in `css/styles.css` to preserve appearance during the module migration. `css/components.css`, `css/home.css`, `css/balap.css`, and `css/kebun.css` are feature stylesheet entry points reserved for incremental rule extraction. Reuse existing custom properties and tactile component classes (`.btn`, `.choice`, `.timer-bar`, `.screen`) rather than adding inline styles.

## Tests and change checklist

Run tests:

```sh
node --experimental-default-type=module --test tests/*.test.mjs
```

After modifying a runtime module, regenerate the direct-file artifact once before sharing the project:

```sh
node scripts/build-file-bundle.mjs
```

`tests/module-structure.test.mjs` guards the shell/module boundary and Balap timer cleanup. `tests/game-modules.test.mjs` checks generated question invariants and Kebun option counts.

When adding a feature: create a feature view/engine, register navigation in `main.js`, return cleanup for timers/listeners, preserve storage compatibility, add a focused test, and update this document.
