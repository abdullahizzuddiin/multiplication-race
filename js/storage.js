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
    return read(KEYS.progress, defaultProgress);
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

  return {
    getProgress,
    saveProgress,
    getSettings,
    saveSettings,
    getStreak,
    recordPlayDay,
    recordFact,
    todayStr,
  };
})();
