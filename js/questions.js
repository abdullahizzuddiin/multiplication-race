/**
 * Question generation for Balap Kali.
 * Importers: balap.js, app.js via global Questions.
 * User: implement GAME 2 Balap Kali — vanilla HTML/CSS/JS, pastel, no gradient.
 */

const Questions = (() => {
  const LEVELS = [
    { id: 1, name: "Level 1", tables: [1, 2, 10], timeSec: 10, choices: 3, hint: "Tabel: 1, 2, 10 · 10 detik/soal" },
    { id: 2, name: "Level 2", tables: [5], timeSec: 8, choices: 3, hint: "Tabel: 5 · 8 detik/soal" },
    { id: 3, name: "Level 3", tables: [3, 4], timeSec: 7, choices: 4, hint: "Tabel: 3, 4 · 7 detik/soal" },
    { id: 4, name: "Level 4", tables: [6, 9], timeSec: 6, choices: 4, hint: "Tabel: 6, 9 · 6 detik/soal" },
    { id: 5, name: "Level 5", tables: [7, 8], timeSec: 5, choices: 4, hint: "Tabel: 7, 8 · 5 detik/soal" },
    { id: 6, name: "Master", tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], timeSec: 5, choices: 4, hint: "Campuran 1–10 · 5 detik/soal" },
  ];

  const QUESTIONS_PER_ROUND = 10;

  function getLevel(levelId) {
    const id = Math.min(Math.max(levelId || 1, 1), LEVELS.length);
    return LEVELS[id - 1];
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function uniquePush(list, n) {
    if (n > 0 && n <= 100 && !list.includes(n)) list.push(n);
  }

  function makeDistractors(a, b, count) {
    const correct = a * b;
    const pool = [];

    uniquePush(pool, (a - 1) * b);
    uniquePush(pool, (a + 1) * b);
    uniquePush(pool, a * (b - 1));
    uniquePush(pool, a * (b + 1));
    uniquePush(pool, a * a);
    uniquePush(pool, b * b);
    uniquePush(pool, a + b);
    uniquePush(pool, a * b + a);
    uniquePush(pool, a * b - a);
    uniquePush(pool, a * b + b);
    uniquePush(pool, a * b - b);
    uniquePush(pool, correct + 1);
    uniquePush(pool, correct - 1);
    uniquePush(pool, correct + 2);
    uniquePush(pool, correct - 2);

    const filtered = pool.filter((n) => n !== correct);
    let picks = shuffle(filtered).slice(0, count);

    let guard = 0;
    while (picks.length < count && guard < 40) {
      const candidate = correct + (Math.floor(Math.random() * 10) - 5);
      if (candidate !== correct && candidate > 0 && !picks.includes(candidate)) {
        picks.push(candidate);
      }
      guard += 1;
    }

    return picks.slice(0, count);
  }

  function buildFactPool(tables) {
    const facts = [];
    for (const t of tables) {
      for (let other = 1; other <= 10; other++) {
        facts.push({ a: t, b: other });
        if (t !== other) facts.push({ a: other, b: t });
      }
    }
    return facts;
  }

  function weightedPick(pool, factsMap, count) {
    if (!pool.length) return [];

    const scored = pool.map((f) => {
      const key = `${f.a}×${f.b}`;
      const rec = factsMap && factsMap[key];
      let weight = 1;
      if (rec) {
        const total = rec.correct + rec.wrong;
        if (total > 0) {
          const wrongRate = rec.wrong / total;
          const avgMs = rec.totalMs / total;
          weight = 1 + wrongRate * 4 + (avgMs > 4000 ? 2 : 0);
          if (rec.correct >= 3 && wrongRate < 0.2 && avgMs < 3000) weight = 0.35;
        }
      } else {
        weight = 2.5;
      }
      return { f, weight };
    });

    const picked = [];
    const used = new Set();
    const copy = scored.slice();

    while (picked.length < count && copy.length) {
      const totalW = copy.reduce((s, x) => s + x.weight, 0);
      let r = Math.random() * totalW;
      let idx = 0;
      for (; idx < copy.length; idx++) {
        r -= copy[idx].weight;
        if (r <= 0) break;
      }
      idx = Math.min(idx, copy.length - 1);
      const item = copy.splice(idx, 1)[0];
      const key = `${item.f.a}×${item.f.b}`;
      const commute = `${item.f.b}×${item.f.a}`;
      if (used.has(key) || used.has(commute)) continue;
      used.add(key);
      picked.push(item.f);
    }

    const shuffled = shuffle(pool);
    for (const f of shuffled) {
      if (picked.length >= count) break;
      const key = `${f.a}×${f.b}`;
      if (![...used].some((u) => u === key)) {
        picked.push(f);
        used.add(key);
      }
    }

    return picked.slice(0, count);
  }

  function buildRound(levelId, factsMap) {
    const level = getLevel(levelId);
    const pool = buildFactPool(level.tables);
    const selected = weightedPick(pool, factsMap, QUESTIONS_PER_ROUND);

    return selected.map(({ a, b }) => {
      const answer = a * b;
      const distractors = makeDistractors(a, b, level.choices - 1);
      const options = shuffle([answer, ...distractors]);
      return { a, b, answer, options, tableFocus: level.tables.includes(a) ? a : b };
    });
  }

  function starsFromAccuracy(accuracy) {
    if (accuracy >= 0.9) return 3;
    if (accuracy >= 0.8) return 2;
    if (accuracy >= 0.5) return 1;
    return 0;
  }

  function canLevelUp(levelId, accuracy, avgSec) {
    const level = getLevel(levelId);
    if (level.id >= 6) return false;
    return accuracy >= 0.8 && avgSec < 6;
  }

  function buildInsight(answers) {
    const byTable = {};
    for (const ans of answers) {
      const t = ans.tableFocus;
      if (!byTable[t]) byTable[t] = { correct: 0, total: 0 };
      byTable[t].total += 1;
      if (ans.correct) byTable[t].correct += 1;
    }

    const entries = Object.entries(byTable).map(([t, s]) => ({
      table: Number(t),
      rate: s.total ? s.correct / s.total : 0,
      total: s.total,
    }));

    if (!entries.length) return "Bagus main lagi nanti ya!";

    entries.sort((a, b) => b.rate - a.rate || b.total - a.total);
    const strong = entries[0];
    const weak = [...entries].sort((a, b) => a.rate - b.rate || b.total - a.total)[0];

    if (strong.rate === 1 && weak.rate === 1) {
      return "Kamu jago di semua tabel hari ini! Hebat!";
    }

    if (strong.table === weak.table || strong.rate === weak.rate) {
      return `Kamu jago di tabel ${strong.table}! Yuk main lagi biar makin cepat!`;
    }

    return `Kamu jago di tabel ${strong.table}! Yuk latihan tabel ${weak.table} besok ya!`;
  }

  return {
    LEVELS,
    QUESTIONS_PER_ROUND,
    getLevel,
    buildRound,
    starsFromAccuracy,
    canLevelUp,
    buildInsight,
  };
})();

export default Questions;
