(function () {
  var STORAGE_KEY = "copaChigui.activeUniverse.v001";
  var PODIUM_BONUSES = {
    champion: 6,
    runnerUp: 4,
    third: 2
  };

  var api = window.CopaChiguiTournament;
  if (!api) {
    return;
  }

  var pendingMode = null;
  var form = document.getElementById("newUniverseForm");
  var modeSelect = document.getElementById("cupMode");

  function validMode(value) {
    return value === "manual" ? "manual" : "simulated";
  }

  function readSavedUniverse() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function readSavedMode() {
    var saved = readSavedUniverse();
    return saved && saved.cup && saved.cup.mode ? validMode(saved.cup.mode) : null;
  }

  if (form) {
    form.addEventListener("submit", function () {
      pendingMode = validMode(modeSelect ? modeSelect.value : "simulated");
    }, true);
  }

  var originalGenerateFirstCup = api.generateFirstCup;
  var originalEnsureCupData = api.ensureCupData;
  var originalRecalculateCup = api.recalculateCup;
  var originalSetMatchResult = api.setMatchResult;
  var originalSimulateMatch = api.simulateMatch;
  var originalSimulateNextPendingMatch = api.simulateNextPendingMatch;
  var originalSimulateAllPendingGroupStage = api.simulateAllPendingGroupStage;
  var originalSetKnockoutResult = api.setKnockoutResult;
  var originalSimulateKnockoutMatch = api.simulateKnockoutMatch;
  var originalSimulateAllPendingRound = api.simulateAllPendingRound;
  var originalGetPodium = api.getPodium;

  function ensureMode(cup) {
    if (!cup.mode) {
      cup.mode = "simulated";
    }
    cup.mode = validMode(cup.mode);
    return cup.mode;
  }

  function cloneBonusData(data) {
    if (!data) {
      return null;
    }
    return JSON.parse(JSON.stringify(data));
  }

  function subtractBonusData(cup, data) {
    if (!data) {
      return;
    }

    ["champion", "runnerUp", "third"].forEach(function (key) {
      var entry = data[key];
      if (!entry) {
        return;
      }
      var team = api.findParticipant(cup, entry.id);
      if (team && typeof team.startingPoints === "number") {
        team.startingPoints -= entry.points;
      }
    });

    cup.podiumBonusesApplied = false;
    cup.podiumBonuses = null;
  }

  function applyPodiumBonuses(cup) {
    var podium = originalGetPodium(cup);

    if (!podium.completed || !podium.champion || !podium.runnerUp || !podium.third) {
      return podium;
    }

    if (!cup.podiumBonusesApplied) {
      podium.champion.startingPoints += PODIUM_BONUSES.champion;
      podium.runnerUp.startingPoints += PODIUM_BONUSES.runnerUp;
      podium.third.startingPoints += PODIUM_BONUSES.third;

      cup.podiumBonusesApplied = true;
      cup.podiumBonuses = {
        champion: { id: podium.champion.id, points: PODIUM_BONUSES.champion },
        runnerUp: { id: podium.runnerUp.id, points: PODIUM_BONUSES.runnerUp },
        third: { id: podium.third.id, points: PODIUM_BONUSES.third }
      };

      originalRecalculateCup(cup);
      podium = originalGetPodium(cup);
    }

    return podium;
  }

  api.generateFirstCup = function (allTeams) {
    var mode = pendingMode || readSavedMode() || validMode(modeSelect ? modeSelect.value : "simulated");
    pendingMode = null;
    var cup = originalGenerateFirstCup(allTeams);
    cup.mode = mode;
    cup.podiumBonusesApplied = false;
    cup.podiumBonuses = null;
    return cup;
  };

  api.ensureCupData = function (cup) {
    ensureMode(cup);
    if (typeof cup.podiumBonusesApplied !== "boolean") {
      cup.podiumBonusesApplied = Boolean(cup.podiumBonuses);
    }
    var result = originalEnsureCupData(cup);
    applyPodiumBonuses(cup);
    return result;
  };

  api.setMatchResult = function (cup, matchId, homeGoals, awayGoals, source) {
    ensureMode(cup);
    if (cup.mode === "simulated" && (source || "manual") === "manual") {
      throw new Error("Esta Copa está en modo simulado. Los resultados los genera el juego.");
    }
    return originalSetMatchResult(cup, matchId, homeGoals, awayGoals, source);
  };

  api.simulateMatch = function (cup, matchId) {
    ensureMode(cup);
    if (cup.mode === "manual") {
      throw new Error("Esta Copa está en modo manual. Escribe el resultado del partido.");
    }
    return originalSimulateMatch(cup, matchId);
  };

  api.simulateNextPendingMatch = function (cup) {
    ensureMode(cup);
    if (cup.mode === "manual") {
      throw new Error("Esta Copa está en modo manual. Escribe los resultados de los partidos.");
    }
    return originalSimulateNextPendingMatch(cup);
  };

  api.simulateAllPendingGroupStage = function (cup) {
    ensureMode(cup);
    if (cup.mode === "manual") {
      throw new Error("Esta Copa está en modo manual. Escribe los resultados de los partidos.");
    }
    return originalSimulateAllPendingGroupStage(cup);
  };

  api.setKnockoutResult = function (cup, matchId, homeGoals, awayGoals, penaltyHome, penaltyAway, source) {
    ensureMode(cup);
    if (cup.mode === "simulated" && (source || "manual") === "manual") {
      throw new Error("Esta Copa está en modo simulado. Los resultados los genera el juego.");
    }

    var previousBonuses = cloneBonusData(cup.podiumBonusesApplied ? cup.podiumBonuses : null);
    var result = originalSetKnockoutResult(cup, matchId, homeGoals, awayGoals, penaltyHome, penaltyAway, source);

    if (previousBonuses) {
      subtractBonusData(cup, previousBonuses);
      originalRecalculateCup(cup);
    }

    applyPodiumBonuses(cup);
    return result;
  };

  api.simulateKnockoutMatch = function (cup, matchId) {
    ensureMode(cup);
    if (cup.mode === "manual") {
      throw new Error("Esta Copa está en modo manual. Escribe el resultado del partido.");
    }
    var result = originalSimulateKnockoutMatch(cup, matchId);
    applyPodiumBonuses(cup);
    return result;
  };

  api.simulateAllPendingRound = function (cup, roundKey) {
    ensureMode(cup);
    if (cup.mode === "manual") {
      throw new Error("Esta Copa está en modo manual. Escribe los resultados de la ronda.");
    }
    var result = originalSimulateAllPendingRound(cup, roundKey);
    applyPodiumBonuses(cup);
    return result;
  };

  api.getPodium = function (cup) {
    ensureMode(cup);
    return applyPodiumBonuses(cup);
  };

  function applyModeToInterface() {
    var saved = readSavedUniverse();
    if (!saved || !saved.cup) {
      return;
    }

    var mode = validMode(saved.cup.mode || "simulated");
    var banner = document.getElementById("cupModeBanner");
    if (banner) {
      banner.textContent = mode === "manual" ? "✍️ Copa manual" : "🎮 Copa simulada";
    }

    if (mode === "manual") {
      [
        "simulateNextButton",
        "simulateAllButton",
        "simulateAllRoundOf32Button",
        "simulateAllRoundOf16Button",
        "simulateAllQuarterfinalsButton",
        "simulateAllSemifinalsButton",
        "simulateAllFinalsButton"
      ].forEach(function (id) {
        var button = document.getElementById(id);
        if (button) {
          button.disabled = true;
          button.title = "Esta Copa se creó en modo manual";
        }
      });

      document.querySelectorAll(".match-simulate-button").forEach(function (button) {
        button.disabled = true;
        button.title = "Modo manual";
      });
    } else {
      document.querySelectorAll(".match-save-button").forEach(function (button) {
        button.disabled = true;
        button.title = "Esta Copa se creó en modo simulado";
      });

      document.querySelectorAll(".goal-input").forEach(function (input) {
        input.disabled = true;
        input.title = "El resultado lo genera el modo simulado";
      });
    }

    var podiumText = document.getElementById("podiumDisplay");
    if (podiumText && saved.cup.completed && podiumText.textContent && podiumText.textContent.indexOf("Bonos") === -1) {
      podiumText.textContent += " · Bonos: 🥇 +6 · 🥈 +4 · 🥉 +2";
    }
  }

  var scheduled = false;
  function scheduleInterfaceRefresh() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    window.setTimeout(function () {
      scheduled = false;
      applyModeToInterface();
    }, 0);
  }

  var observer = new MutationObserver(function () {
    scheduleInterfaceRefresh();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  if (form) {
    form.addEventListener("submit", function () {
      window.setTimeout(scheduleInterfaceRefresh, 0);
    });
  }

  scheduleInterfaceRefresh();
}());
