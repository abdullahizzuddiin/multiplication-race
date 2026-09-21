import { MATHQUEST_CONFIG } from "./config.js";

export const QUESTIONS_PER_TABLE = MATHQUEST_CONFIG.MAX_QUESTIONS_PER_TABLE;

export const TIERS = Object.freeze([
  { id: "very-easy", name: "Very Easy", nickname: "Starting Out", tables: [1, 2, 10] },
  { id: "easy", name: "Easy", nickname: "Confident", tables: [1, 2, 5, 10] },
  { id: "medium", name: "Medium", nickname: "Brain Booster", tables: [1, 2, 3, 4, 5, 10] },
  { id: "medium-plus", name: "Medium Plus", nickname: "Challenge", tables: [1, 2, 3, 4, 5, 6, 9, 10] },
  { id: "hard", name: "Hard", nickname: "Full Master", tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
]);

export const PRESETS = Object.freeze([
  { id: "beginner", name: "Beginner Scout", popular: false, tables: [1, 2, 10], timerSeconds: 120, questions: 5 },
  { id: "junior", name: "Junior Explorer", popular: true, tables: [1, 2, 10, 5, 3, 4], timerSeconds: 90, questions: 8 },
  { id: "champion", name: "Math Champion", popular: false, tables: [1, 2, 3, 4, 5, 6, 7, 8, 9], timerSeconds: 60, questions: 10 },
  { id: "custom", name: "Custom Adventure", popular: false, tables: null, timerSeconds: null, questions: null },
]);

export function createQuestSettings(tierId) {
  const tier = TIERS.find(t => t.id === tierId);
  const preset = PRESETS.find(p => p.id === tierId);
  const source = preset || tier || TIERS[0];
  return {
    tables: new Set(source.tables || TIERS[0].tables),
    timerSeconds: source.timerSeconds || 90,
    questions: source.questions || 8,
  };
}

export function buildQuestionPool(tables) {
  const pool = [];
  for (const table of tables) {
    for (let multiplier = 1; multiplier <= QUESTIONS_PER_TABLE; multiplier++) {
      pool.push({ table, multiplier });
    }
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export function takeQuestion(pool) {
  return pool.length > 0 ? pool.shift() : null;
}

export function clampQuestions(questions, activeTableCount) {
  const max = Math.max(QUESTIONS_PER_TABLE, activeTableCount * QUESTIONS_PER_TABLE);
  return Math.max(1, Math.min(questions, max));
}

export function findTierByTables(tables) {
  for (const tier of TIERS) {
    if (tier.tables.length === tables.size && tier.tables.every(t => tables.has(t))) return tier.id;
  }
  return null;
}
