(function () {
  var api = window.CopaChiguiTournament;
  var allTeams = window.COPA_CHIGUI_TEAMS || [];

  if (!api || !allTeams.length) {
    return;
  }

  var rankingExpanded = false;
  var activeCup = null;

  var section = document.getElementById("worldRankingSection");
  var tableBody = document.getElementById("worldRankingBody");
  var statusBadge = document.getElementById("worldRankingStatus");
  var statusText = document.getElementById("worldRankingStatusText");
  var countBadge = document.getElementById("worldRankingCount");
  var toggleButton = document.getElementById("worldRankingToggle");
  var searchInput = document.getElementById("worldRankingSearch");

  function basePoints(team) {
    return typeof team.points === "number" ? team.points : 100;
  }

  function baseTitles(team) {
    return typeof team.titles === "number" ? team.titles : 0;
  }

  function createInitialRanking() {
    return allTeams
      .slice()
      .sort(function (a, b) {
        return a.name.localeCompare(b.name, "es");
      })
      .map(function (team, index) {
        var points = basePoints(team);
        return {
          id: team.id,
          name: team.name,
          flag: team.flag,
          points: points,
          titles: baseTitles(team),
          previousPoints: points,
          previousRank: index + 1,
          currentRank: index + 1,
          bestRank: index + 1
        };
      });
  }

  function ensureRankingTeams(cup) {
    if (!Array.isArray(cup.worldRankingTeams) || !cup.worldRankingTeams.length) {
      cup.worldRankingTeams = createInitialRanking();
    }

    var existing = {};
    cup.worldRankingTeams.forEach(function (team) {
      existing[team.id] = team;
    });

    var alphabetical = allTeams.slice().sort(function (a, b) {
      return a.name.localeCompare(b.name, "es");
    });

    alphabetical.forEach(function (baseTeam, index) {
      if (existing[baseTeam.id]) {
        return;
      }

      var points = basePoints(baseTeam);
      var entry = {
        id: baseTeam.id,
        name: baseTeam.name,
        flag: baseTeam.flag,
        points: points,
        titles: baseTitles(baseTeam),
        previousPoints: points,
        previousRank: index + 1,
        currentRank: index + 1,
        bestRank: index + 1
      };
      cup.worldRankingTeams.push(entry);
      existing[baseTeam.id] = entry;
    });

    cup.worldRankingTeams.forEach(function (team, index) {
      if (typeof team.previousPoints !== "number") {
        team.previousPoints = typeof team.points === "number" ? team.points : 100;
      }
      if (typeof team.previousRank !== "number") {
        team.previousRank = index + 1;
      }
      if (typeof team.currentRank !== "number") {
        team.currentRank = team.previousRank;
      }
      if (typeof team.bestRank !== "number") {
        team.bestRank = team.currentRank;
      }
      if (typeof team.titles !== "number") {
        team.titles = 0;
      }
    });

    return existing;
  }

  function syncParticipantData(cup, rankingById) {
    cup.participants.forEach(function (participant) {
      var rankingTeam = rankingById[participant.id];
      if (!rankingTeam) {
        return;
      }

      rankingTeam.name = participant.name;
      rankingTeam.flag = participant.flag;
      rankingTeam.points = participant.points;
      rankingTeam.titles = participant.titles || 0;
    });
  }

  function calculateRanking(cup) {
    var rankingById = ensureRankingTeams(cup);
    syncParticipantData(cup, rankingById);

    cup.worldRankingTeams.sort(function (a, b) {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (a.previousRank !== b.previousRank) {
        return a.previousRank - b.previousRank;
      }
      return a.name.localeCompare(b.name, "es");
    });

    cup.worldRankingTeams.forEach(function (team, index) {
      team.currentRank = index + 1;
      team.bestRank = Math.min(team.bestRank, team.currentRank);
    });

    cup.rankingUpdatedAt = new Date().toISOString();
    cup.rankingVersion = 1;
    return cup.worldRankingTeams;
  }

  function movementText(team) {
    var change = team.previousRank - team.currentRank;
    if (change > 0) {
      return {
        text: "#" + team.previousRank + " → #" + team.currentRank + " ▲" + change,
        className: "ranking-up"
      };
    }
    if (change < 0) {
      return {
        text: "#" + team.previousRank + " → #" + team.currentRank + " ▼" + Math.abs(change),
        className: "ranking-down"
      };
    }
    return {
      text: "—",
      className: "ranking-same"
    };
  }

  function pointText(team) {
    var change = team.points - team.previousPoints;
    if (change > 0) {
      return team.points + " ( +" + change + " )";
    }
    if (change < 0) {
      return team.points + " ( " + change + " )";
    }
    return team.points + " ( 0 )";
  }

  function stars(team) {
    if (!team.titles) {
      return "";
    }
    if (team.titles <= 5) {
      return " " + "⭐".repeat(team.titles);
    }
    return " ⭐×" + team.titles;
  }

  function participantSet(cup) {
    var set = {};
    cup.participants.forEach(function (team) {
      set[team.id] = true;
    });
    return set;
  }

  function appendCell(row, text, className) {
    var cell = document.createElement("td");
    cell.textContent = text;
    if (className) {
      cell.className = className;
    }
    row.appendChild(cell);
    return cell;
  }

  function renderRanking(cup) {
    activeCup = cup;
    if (!section || !tableBody) {
      return;
    }

    var ranking = calculateRanking(cup);
    var participants = participantSet(cup);
    var query = searchInput ? searchInput.value.trim().toLocaleLowerCase("es") : "";

    var visible = ranking.filter(function (team) {
      if (!query) {
        return true;
      }
      return team.name.toLocaleLowerCase("es").indexOf(query) !== -1 || team.id.toLocaleLowerCase("es").indexOf(query) !== -1;
    });

    if (!query && !rankingExpanded) {
      visible = visible.slice(0, 20);
    }

    tableBody.innerHTML = "";

    visible.forEach(function (team) {
      var row = document.createElement("tr");
      var move = movementText(team);

      if (participants[team.id]) {
        row.classList.add("ranking-participant");
      } else {
        row.classList.add("ranking-outside-cup");
      }

      if (team.id === cup.hostId) {
        row.classList.add("ranking-host");
      }

      appendCell(row, "#" + team.currentRank, "ranking-position");

      var teamCell = document.createElement("td");
      teamCell.className = "ranking-team";
      teamCell.textContent = team.flag + " " + team.name + stars(team) + (team.id === cup.hostId ? " 🏟️" : "");
      row.appendChild(teamCell);

      appendCell(row, pointText(team), "ranking-points");
      appendCell(row, move.text, "ranking-movement " + move.className);
      appendCell(row, "#" + team.bestRank, "ranking-best");

      tableBody.appendChild(row);
    });

    if (statusBadge) {
      statusBadge.textContent = cup.completed ? "OFICIAL" : "PROVISIONAL";
      statusBadge.className = "badge " + (cup.completed ? "ranking-official" : "ranking-provisional");
    }

    if (statusText) {
      statusText.textContent = cup.completed
        ? "Ranking oficial al finalizar la Copa. Incluye resultados y bonos del podio."
        : "Ranking provisional en vivo. La posición anterior corresponde al inicio de esta Copa.";
    }

    if (countBadge) {
      countBadge.textContent = ranking.length + " selecciones";
    }

    if (toggleButton) {
      toggleButton.classList.toggle("hidden", Boolean(query));
      toggleButton.textContent = rankingExpanded ? "Ver Top 20" : "Ver ranking completo";
    }
  }

  function refresh(cup) {
    if (!cup) {
      return;
    }
    calculateRanking(cup);
    renderRanking(cup);
  }

  var originalGenerateFirstCup = api.generateFirstCup;
  api.generateFirstCup = function (teams) {
    var cup = originalGenerateFirstCup(teams);
    calculateRanking(cup);
    renderRanking(cup);
    return cup;
  };

  var originalEnsureCupData = api.ensureCupData;
  api.ensureCupData = function (cup) {
    var result = originalEnsureCupData(cup);
    refresh(cup);
    return result;
  };

  [
    "setMatchResult",
    "simulateMatch",
    "simulateNextPendingMatch",
    "simulateAllPendingGroupStage",
    "setKnockoutResult",
    "simulateKnockoutMatch",
    "simulateAllPendingRound"
  ].forEach(function (methodName) {
    var original = api[methodName];
    if (typeof original !== "function") {
      return;
    }

    api[methodName] = function () {
      var result = original.apply(api, arguments);
      refresh(arguments[0]);
      return result;
    };
  });

  if (toggleButton) {
    toggleButton.addEventListener("click", function () {
      rankingExpanded = !rankingExpanded;
      if (activeCup) {
        renderRanking(activeCup);
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      if (activeCup) {
        renderRanking(activeCup);
      }
    });
  }

  window.CopaChiguiRanking = {
    calculate: calculateRanking,
    render: renderRanking,
    refresh: refresh
  };
}());
