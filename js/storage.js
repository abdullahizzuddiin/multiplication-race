/**
 * localStorage helpers for Jagoan Kali — Balap Kali
 * Keys: jagoanKali_progress, jagoanKali_streak, jagoanKali_settings
 * Dates: YYYY-MM-DD (local device timezone)
 */

const Storage = (() => {
  const KEYS = {
    progress: "jagoanKali_progress",
    streak: "jagoanKali_streak",
    settings: "jagoanKali_settings",
  };

  const defaultProgress = () => ({
    level: 1,
    totalPoints: 0,
    bestScore: 0,
    facts: {},
    kebunLevel: 1,
    kebun: {
      unlockedModes: ["A"],
      decorations: [],
      sessionsByMode: { A: 0, B: 0, C: 0 },
    },
  });

  const defaultStreak = () => ({
    currentStreak: 0,
    lastPlayedDate: null,
    streakProtectionAvailable: true,
    longestStreak: 0,
    weekProtectionReset: null,
  });

  const defaultSettings = () => ({
    theme: "space",
    gardenTheme: "bunga",
  });

  function read(key, fallbackFn) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallbackFn();
      return { ...fallbackFn(), ...JSON.parse(raw) };
    } catch {
      return fallbackFn();
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function todayStr() {
    return formatDate(new Date());
  }

  function mondayOfWeek(d) {
    const copy = new Date(d);
    const day = copy.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + mondayOffset);
    return formatDate(copy);
  }

  function daysBetween(a, b) {
    const parse = (s) => {
      const [y, m, d] = s.split("-").map(Number);
      return Date.UTC(y, m - 1, d);
    };
    return Math.round((parse(b) - parse(a)) / 86400000);
  }

  function getProgress() {
    const progress = read(KEYS.progress, defaultProgress);
    // Older Balap Kali saves do not have Kebun fields. Normalise them here so
    // the original Balap `level` value remains untouched.
    progress.kebunLevel = Math.min(Math.max(Number(progress.kebunLevel) || 1, 1), 5);
    progress.kebun = {
      ...defaultProgress().kebun,
      ...(progress.kebun || {}),
      sessionsByMode: {
        ...defaultProgress().kebun.sessionsByMode,
        ...((progress.kebun && progress.kebun.sessionsByMode) || {}),
      },
    };
    if (!Array.isArray(progress.kebun.unlockedModes) || !progress.kebun.unlockedModes.length) {
      progress.kebun.unlockedModes = ["A"];
    }
    return progress;
  }

  function saveProgress(p) {
    write(KEYS.progress, p);
  }

  function getSettings() {
    return read(KEYS.settings, defaultSettings);
  }

  function saveSettings(s) {
    write(KEYS.settings, s);
  }

  function getStreak() {
    return read(KEYS.streak, defaultStreak);
  }

  /**
   * Call after a completed round (10 soal).
   * Grace: 1 free miss per week (streakProtectionAvailable).
   */
  function recordPlayDay() {
    const streak = getStreak();
    const today = todayStr();
    const weekKey = mondayOfWeek(new Date());

    if (streak.weekProtectionReset !== weekKey) {
      streak.streakProtectionAvailable = true;
      streak.weekProtectionReset = weekKey;
    }

    if (streak.lastPlayedDate === today) {
      write(KEYS.streak, streak);
      return streak;
    }

    if (!streak.lastPlayedDate) {
      streak.currentStreak = 1;
    } else {
      const gap = daysBetween(streak.lastPlayedDate, today);
      if (gap === 1) {
        streak.currentStreak += 1;
      } else if (gap === 2 && streak.streakProtectionAvailable) {
        streak.streakProtectionAvailable = false;
        streak.currentStreak += 1;
      } else if (gap >= 2) {
        streak.currentStreak = 1;
      }
    }

    streak.lastPlayedDate = today;
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    write(KEYS.streak, streak);
    return streak;
  }

  function recordFact(a, b, correct, ms) {
    const p = getProgress();
    const key = `${a}×${b}`;
    if (!p.facts[key]) {
      p.facts[key] = { correct: 0, wrong: 0, totalMs: 0 };
    }
    const f = p.facts[key];
    if (correct) f.correct += 1;
    else f.wrong += 1;
    f.totalMs += ms;
    saveProgress(p);
  }

  function saveKebunSession(result) {
    const p = getProgress();
    const kebun = p.kebun;
    const mode = result.mode;
    kebun.sessionsByMode[mode] = (kebun.sessionsByMode[mode] || 0) + 1;

    if (mode === "A" && !kebun.unlockedModes.includes("B")) {
      kebun.unlockedModes.push("B");
    }
    if (mode === "B" && result.accuracy >= 0.8 && !kebun.unlockedModes.includes("C")) {
      kebun.unlockedModes.push("C");
    }
    if (result.accuracy >= 0.8 && p.kebunLevel < 5) {
      p.kebunLevel += 1;
      const decoration = `level-${p.kebunLevel}`;
      if (!kebun.decorations.includes(decoration)) kebun.decorations.push(decoration);
    }
    p.totalPoints += result.points;
    saveProgress(p);
    return p;
  }

  return {
    getProgress,
    saveProgress,
    getSettings,
    saveSettings,
    getStreak,
    recordPlayDay,
    recordFact,
    saveKebunSession,
    todayStr,
  };
})();

export default Storage;
