/** Question and level helpers for Kebun Kali. */
const KebunQuestions = (() => {
  const LEVELS = [
    { id: 1, tables: [1, 2], name: "Kebun Pemula" },
    { id: 2, tables: [10, 5], name: "Kebun Ceria" },
    { id: 3, tables: [3, 4], name: "Kebun Bunga" },
    { id: 4, tables: [6, 9], name: "Kebun Rimbun" },
    { id: 5, tables: [7, 8], name: "Kebun Jagoan" },
  ];
  const QUESTIONS_PER_SESSION = 5;

  function getLevel(id) {
    return LEVELS[Math.min(Math.max(Number(id) || 1, 1), LEVELS.length) - 1];
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function optionsFor(a, b, count) {
    const answer = a * b;
    const candidates = [(a - 1) * b, (a + 1) * b, a * (b - 1), a * (b + 1), a + b, answer - 2, answer + 2]
      .filter((n) => n > 0 && n <= 100 && n !== answer);
    const unique = [...new Set(candidates)];
    while (unique.length < count - 1) {
      const candidate = answer + (Math.floor(Math.random() * 11) - 5);
      if (candidate > 0 && candidate <= 100 && candidate !== answer && !unique.includes(candidate)) unique.push(candidate);
    }
    return shuffle([answer, ...shuffle(unique).slice(0, count - 1)]);
  }

  function buildSession(levelId, mode) {
    const level = getLevel(levelId);
    const pool = [];
    level.tables.forEach((a) => {
      for (let b = 1; b <= 10; b += 1) pool.push({ a, b });
    });
    return shuffle(pool).slice(0, QUESTIONS_PER_SESSION).map(({ a, b }) => ({
      a,
      b,
      answer: a * b,
      options: mode === "C" ? optionsFor(a, b, 4) : optionsFor(a, b, 3),
    }));
  }

  function stars(accuracy) {
    if (accuracy >= 0.9) return 3;
    if (accuracy >= 0.8) return 2;
    if (accuracy >= 0.5) return 1;
    return 0;
  }

  return { LEVELS, QUESTIONS_PER_SESSION, getLevel, buildSession, stars };
})();

export default KebunQuestions;
