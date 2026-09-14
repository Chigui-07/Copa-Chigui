(function () {
  var STORAGE_KEY = "copaChigui.activeUniverse.v001";
  var VERSION = "0.0.6";

  var setupScreen = document.getElementById("setupScreen");
  var tournamentScreen = document.getElementById("tournamentScreen");
  var form = document.getElementById("newUniverseForm");
  var newDrawButton = document.getElementById("newDrawButton");
  var simulateNextButton = document.getElementById("simulateNextButton");
  var simulateAllButton = document.getElementById("simulateAllButton");
  var createRoundOf32Button = document.getElementById("createRoundOf32Button");

  var playerNameInput = document.getElementById("playerName");
  var rivalNameInput = document.getElementById("rivalName");
  var universeNameInput = document.getElementById("universeName");

  var universeTitle = document.getElementById("universeTitle");
  var playersLabel = document.getElementById("playersLabel");
  var hostDisplay = document.getElementById("hostDisplay");
  var groupsGrid = document.getElementById("groupsGrid");
  var groupStageList = document.getElementById("groupStageList");
  var participantCount = document.getElementById("participantCount");
  var groupProgressBadge = document.getElementById("groupProgressBadge");
  var qualifiedSection = document.getElementById("qualifiedSection");
  var qualifiedGrid = document.getElementById("qualifiedGrid");
  var championSection = document.getElementById("championSection");
  var championDisplay = document.getElementById("championDisplay");
  var podiumDisplay = document.getElementById("podiumDisplay");

  var roundConfigs = {
    roundOf32: {
      section: document.getElementById("roundOf32Section"),
      grid: document.getElementById("roundOf32Grid"),
      badge: document.getElementById("roundOf32ProgressBadge"),
      simulateButton: document.getElementById("simulateAllRoundOf32Button"),
      createButton: document.getElementById("createRoundOf16Button"),
      nextKey: "roundOf16",
      nextLabel: "octavos",
      title: "Dieciseisavos"
    },
    roundOf16: {
      section: document.getElementById("roundOf16Section"),
      grid: document.getElementById("roundOf16Grid"),
      badge: document.getElementById("roundOf16ProgressBadge"),
      simulateButton: document.getElementById("simulateAllRoundOf16Button"),
      createButton: document.getElementById("createQuarterfinalsButton"),
      nextKey: "quarterfinals",
      nextLabel: "cuartos",
      title: "Octavos"
    },
    quarterfinals: {
      section: document.getElementById("quarterfinalsSection"),
      grid: document.getElementById("quarterfinalsGrid"),
      badge: document.getElementById("quarterfinalsProgressBadge"),
      simulateButton: document.getElementById("simulateAllQuarterfinalsButton"),
      createButton: document.getElementById("createSemifinalsButton"),
      nextKey: "semifinals",
      nextLabel: "semifinales",
      title: "Cuartos"
    },
    semifinals: {
      section: document.getElementById("semifinalsSection"),
      grid: document.getElementById("semifinalsGrid"),
      badge: document.getElementById("semifinalsProgressBadge"),
      simulateButton: document.getElementById("simulateAllSemifinalsButton"),
      createButton: document.getElementById("createFinalsButton"),
      nextKey: "final",
      nextLabel: "finales",
      title: "Semifinales"
    }
  };

  var finalsSection = document.getElementById("finalsSection");
  var finalsProgressBadge = document.getElementById("finalsProgressBadge");
  var thirdPlaceGrid = document.getElementById("thirdPlaceGrid");
  var finalGrid = document.getElementById("finalGrid");
  var simulateAllFinalsButton = document.getElementById("simulateAllFinalsButton");

  var currentUniverse = null;

  function safeText(value) {
    return String(value || "").trim();
  }

  function starsFor(team) {
    if (!team || !team.titles) {
      return "";
    }
    if (team.titles <= 5) {
      return " " + "⭐".repeat(team.titles);
    }
    return " ⭐×" + team.titles;
  }

  function getTeam(cup, teamId) {
    return window.CopaChiguiTournament.findParticipant(cup, teamId);
  }

  function renderTeamRow(team, hostId) {
    var row = document.createElement("div");
    row.className = "team-row";

    var main = document.createElement("div");
    main.className = "team-main";

    var flag = document.createElement("span");
    flag.className = "flag";
    flag.textContent = team.flag;

    var name = document.createElement("span");
    name.className = "team-name";
    name.textContent = team.name + starsFor(team);

    main.appendChild(flag);
    main.appendChild(name);

    if (team.id === hostId) {
      var hostMark = document.createElement("span");
      hostMark.className = "host-mark";
      hostMark.title = "Anfitrión";
      hostMark.textContent = "🏟️";
      main.appendChild(hostMark);
    }

    var points = document.createElement("span");
    points.className = "points";
    points.textContent = team.points + " pts";

    row.appendChild(main);
    row.appendChild(points);
    return row;
  }

  function renderDrawGroups(universe) {
    groupsGrid.innerHTML = "";
    universe.cup.groups.forEach(function (group) {
      var card = document.createElement("article");
      card.className = "group-card";

      var title = document.createElement("h3");
      title.className = "group-title";
      title.textContent = group.name;
      card.appendChild(title);

      group.teams.forEach(function (teamRef) {
        var team = getTeam(universe.cup, teamRef.id) || teamRef;
        card.appendChild(renderTeamRow(team, universe.cup.hostId));
      });
      groupsGrid.appendChild(card);
    });
  }

  function createCell(text, className) {
    var cell = document.createElement("td");
    cell.textContent = text;
    if (className) {
      cell.className = className;
    }
    return cell;
  }

  function renderStandings(group, cup) {
    var wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    var table = document.createElement("table");
    table.className = "standings-table";
    var thead = document.createElement("thead");
    var headRow = document.createElement("tr");

    ["#", "Selección", "PJ", "G", "E", "P", "GF", "GC", "DG", "Pts", "Rank"].forEach(function (label) {
      var th = document.createElement("th");
      th.textContent = label;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    group.standings.forEach(function (standing, index) {
      var team = getTeam(cup, standing.id);
      var row = document.createElement("tr");
      if (index < 2) {
        row.className = "qualifying-row";
      }

      row.appendChild(createCell(String(index + 1), "position-cell"));
      var teamCell = document.createElement("td");
      teamCell.className = "standing-team";
      teamCell.textContent = standing.flag + " " + standing.name + (standing.id === cup.hostId ? " 🏟️" : "");
      row.appendChild(teamCell);
      row.appendChild(createCell(String(standing.played)));
      row.appendChild(createCell(String(standing.wins)));
      row.appendChild(createCell(String(standing.draws)));
      row.appendChild(createCell(String(standing.losses)));
      row.appendChild(createCell(String(standing.goalsFor)));
      row.appendChild(createCell(String(standing.goalsAgainst)));
      row.appendChild(createCell(standing.goalDifference > 0 ? "+" + standing.goalDifference : String(standing.goalDifference)));
      row.appendChild(createCell(String(standing.tablePoints), "table-points-cell"));
      row.appendChild(createCell((team ? team.points : standing.worldPoints) + " pts", "world-points-cell"));
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);
    return wrapper;
  }

  function commitUniverseUpdate() {
    currentUniverse.version = VERSION;
    saveUniverse(currentUniverse);
    renderUniverse(currentUniverse);
  }

  function renderMatch(match, cup) {
    var home = getTeam(cup, match.homeId);
    var away = getTeam(cup, match.awayId);
    var locked = Boolean(cup.groupStageLocked);
    var row = document.createElement("div");
    row.className = "match-row" + (match.completed ? " completed-match" : "");

    var homeLabel = document.createElement("div");
    homeLabel.className = "match-team home-team";
    homeLabel.textContent = home.flag + " " + home.name;

    var score = document.createElement("div");
    score.className = "score-entry";
    var homeInput = numberInput("Goles de " + home.name, match.completed ? match.homeGoals : null);
    var awayInput = numberInput("Goles de " + away.name, match.completed ? match.awayGoals : null);
    homeInput.disabled = locked;
    awayInput.disabled = locked;
    var separator = document.createElement("span");
    separator.className = "score-separator";
    separator.textContent = "–";
    score.appendChild(homeInput);
    score.appendChild(separator);
    score.appendChild(awayInput);

    var awayLabel = document.createElement("div");
    awayLabel.className = "match-team away-team";
    awayLabel.textContent = away.flag + " " + away.name;

    var actions = document.createElement("div");
    actions.className = "match-actions";

    var saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "match-save-button";
    saveButton.textContent = locked ? "🔒 Fase cerrada" : (match.completed ? "Actualizar" : "Guardar manual");
    saveButton.disabled = locked;
    saveButton.addEventListener("click", function () {
      if (homeInput.value === "" || awayInput.value === "") {
        window.alert("Escribe los dos marcadores antes de guardar.");
        return;
      }
      try {
        window.CopaChiguiTournament.setMatchResult(currentUniverse.cup, match.id, Number(homeInput.value), Number(awayInput.value), "manual");
        commitUniverseUpdate();
      } catch (error) {
        window.alert(error.message);
      }
    });

    var simulateButton = document.createElement("button");
    simulateButton.type = "button";
    simulateButton.className = "match-simulate-button";
    simulateButton.textContent = locked ? "🔒 Cerrado" : (match.completed ? (match.source === "simulated" ? "🎲 Simulado" : "✓ Registrado") : "🎲 Simular");
    simulateButton.disabled = locked || match.completed;
    simulateButton.addEventListener("click", function () {
      try {
        window.CopaChiguiTournament.simulateMatch(currentUniverse.cup, match.id);
        commitUniverseUpdate();
      } catch (error) {
        window.alert(error.message);
      }
    });

    actions.appendChild(saveButton);
    actions.appendChild(simulateButton);
    row.appendChild(homeLabel);
    row.appendChild(score);
    row.appendChild(awayLabel);
    row.appendChild(actions);
    return row;
  }

  function renderGroupStage(universe) {
    groupStageList.innerHTML = "";
    universe.cup.groups.forEach(function (group, index) {
      var details = document.createElement("details");
      details.className = "stage-group";
      if (index === 0) {
        details.open = true;
      }

      var summary = document.createElement("summary");
      summary.className = "stage-group-summary";
      summary.textContent = group.name;
      details.appendChild(summary);

      var content = document.createElement("div");
      content.className = "stage-group-content";
      content.appendChild(renderStandings(group, universe.cup));

      var matchdays = document.createElement("div");
      matchdays.className = "matchdays";
      group.matchdays.forEach(function (matchday) {
        var day = document.createElement("section");
        day.className = "matchday-card";
        var heading = document.createElement("h4");
        heading.textContent = "Jornada " + matchday.number;
        day.appendChild(heading);
        matchday.matches.forEach(function (match) {
          day.appendChild(renderMatch(match, universe.cup));
        });
        matchdays.appendChild(day);
      });

      content.appendChild(matchdays);
      details.appendChild(content);
      groupStageList.appendChild(details);
    });
  }

  function renderQualifiedTeams(universe) {
    var qualified = window.CopaChiguiTournament.getQualifiedTeams(universe.cup);
    qualifiedGrid.innerHTML = "";

    if (!qualified.length) {
      qualifiedSection.classList.add("hidden");
      return;
    }

    qualifiedSection.classList.remove("hidden");
    for (var i = 0; i < qualified.length; i += 2) {
      var first = qualified[i];
      var second = qualified[i + 1];
      var card = document.createElement("article");
      card.className = "qualified-card";
      var title = document.createElement("h3");
      title.textContent = first.group;
      card.appendChild(title);

      [first, second].forEach(function (entry) {
        var row = document.createElement("div");
        row.className = "qualified-row";
        var position = document.createElement("span");
        position.className = "qualified-position";
        position.textContent = entry.position + "º";
        var name = document.createElement("span");
        name.className = "qualified-name";
        name.textContent = entry.flag + " " + entry.name + starsFor(entry);
        var points = document.createElement("span");
        points.className = "qualified-points";
        points.textContent = entry.points + " pts";
        row.appendChild(position);
        row.appendChild(name);
        row.appendChild(points);
        card.appendChild(row);
      });
      qualifiedGrid.appendChild(card);
    }

    var created = universe.cup.knockout && Array.isArray(universe.cup.knockout.roundOf32);
    createRoundOf32Button.disabled = created;
    createRoundOf32Button.textContent = created ? "✅ Dieciseisavos creados" : "🏆 Crear dieciseisavos de final";
  }

  function numberInput(label, value) {
    var input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "99";
    input.inputMode = "numeric";
    input.className = "goal-input";
    input.setAttribute("aria-label", label);
    if (value !== null && typeof value !== "undefined") {
      input.value = value;
    }
    return input;
  }

  function renderKnockoutMatch(match, cup, index) {
    var home = getTeam(cup, match.homeId);
    var away = getTeam(cup, match.awayId);
    var locked = window.CopaChiguiTournament.isRoundLocked(cup, match.roundKey);
    var card = document.createElement("article");
    card.className = "knockout-card" + (match.completed ? " completed-knockout" : "");

    var heading = document.createElement("div");
    heading.className = "knockout-card-heading";
    heading.textContent = match.roundKey === "final" ? "Gran final" : (match.roundKey === "thirdPlace" ? "Tercer puesto" : "Partido " + (index + 1));
    card.appendChild(heading);

    var teams = document.createElement("div");
    teams.className = "knockout-teams";
    var homeName = document.createElement("div");
    homeName.className = "knockout-team" + (match.winnerId === home.id ? " knockout-winner" : "");
    homeName.textContent = home.flag + " " + home.name + starsFor(home);
    var awayName = document.createElement("div");
    awayName.className = "knockout-team" + (match.winnerId === away.id ? " knockout-winner" : "");
    awayName.textContent = away.flag + " " + away.name + starsFor(away);
    teams.appendChild(homeName);
    teams.appendChild(awayName);
    card.appendChild(teams);

    var scoreBlock = document.createElement("div");
    scoreBlock.className = "knockout-score-block";
    var homeGoals = numberInput("Goles de " + home.name, match.completed ? match.homeGoals : null);
    var awayGoals = numberInput("Goles de " + away.name, match.completed ? match.awayGoals : null);
    homeGoals.disabled = locked;
    awayGoals.disabled = locked;
    var dash = document.createElement("span");
    dash.textContent = "–";
    dash.className = "score-separator";
    scoreBlock.appendChild(homeGoals);
    scoreBlock.appendChild(dash);
    scoreBlock.appendChild(awayGoals);
    card.appendChild(scoreBlock);

    var penaltyBlock = document.createElement("div");
    penaltyBlock.className = "penalty-block";
    var penaltyLabel = document.createElement("span");
    penaltyLabel.textContent = "Penales";
    var penaltyHome = numberInput("Penales de " + home.name, match.penaltyHome);
    penaltyHome.className += " penalty-input";
    var penaltyAway = numberInput("Penales de " + away.name, match.penaltyAway);
    penaltyAway.className += " penalty-input";
    penaltyHome.disabled = locked;
    penaltyAway.disabled = locked;
    var penaltyDash = document.createElement("span");
    penaltyDash.textContent = "–";
    penaltyDash.className = "score-separator";
    penaltyBlock.appendChild(penaltyLabel);
    penaltyBlock.appendChild(penaltyHome);
    penaltyBlock.appendChild(penaltyDash);
    penaltyBlock.appendChild(penaltyAway);
    card.appendChild(penaltyBlock);

    var actions = document.createElement("div");
    actions.className = "match-actions";
    var saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "match-save-button";
    saveButton.textContent = locked ? "🔒 Ronda cerrada" : (match.completed ? "Actualizar" : "Guardar manual");
    saveButton.disabled = locked;
    saveButton.addEventListener("click", function () {
      if (homeGoals.value === "" || awayGoals.value === "") {
        window.alert("Escribe el marcador del partido antes de guardarlo.");
        return;
      }
      try {
        window.CopaChiguiTournament.setKnockoutResult(
          currentUniverse.cup,
          match.id,
          Number(homeGoals.value),
          Number(awayGoals.value),
          penaltyHome.value === "" ? null : Number(penaltyHome.value),
          penaltyAway.value === "" ? null : Number(penaltyAway.value),
          "manual"
        );
        commitUniverseUpdate();
      } catch (error) {
        window.alert(error.message);
      }
    });

    var simulateButton = document.createElement("button");
    simulateButton.type = "button";
    simulateButton.className = "match-simulate-button";
    simulateButton.textContent = locked ? "🔒 Cerrado" : (match.completed ? (match.source === "simulated" ? "🎲 Simulado" : "✓ Registrado") : "🎲 Simular");
    simulateButton.disabled = locked || match.completed;
    simulateButton.addEventListener("click", function () {
      try {
        window.CopaChiguiTournament.simulateKnockoutMatch(currentUniverse.cup, match.id);
        commitUniverseUpdate();
      } catch (error) {
        window.alert(error.message);
      }
    });

    actions.appendChild(saveButton);
    actions.appendChild(simulateButton);
    card.appendChild(actions);

    if (match.completed && match.winnerId) {
      var winner = getTeam(cup, match.winnerId);
      var winnerNote = document.createElement("div");
      winnerNote.className = "winner-note";
      if (match.roundKey === "final") {
        winnerNote.textContent = "🏆 Campeón: " + winner.flag + " " + winner.name + (match.penaltyHome !== null ? " por penales" : "");
      } else if (match.roundKey === "thirdPlace") {
        winnerNote.textContent = "🥉 Tercer lugar: " + winner.flag + " " + winner.name + (match.penaltyHome !== null ? " por penales" : "");
      } else {
        winnerNote.textContent = "✅ Clasifica " + winner.flag + " " + winner.name + (match.penaltyHome !== null ? " por penales" : "");
      }
      card.appendChild(winnerNote);
    }

    return card;
  }

  function nextRoundCreated(cup, key) {
    if (!cup.knockout) {
      return false;
    }
    if (key === "final") {
      return Array.isArray(cup.knockout.final) && Array.isArray(cup.knockout.thirdPlace);
    }
    return Array.isArray(cup.knockout[key]);
  }

  function renderKnockoutStage(universe, roundKey) {
    var config = roundConfigs[roundKey];
    var matches = window.CopaChiguiTournament.getRoundMatches(universe.cup, roundKey);
    if (!matches.length) {
      config.section.classList.add("hidden");
      return;
    }

    config.section.classList.remove("hidden");
    config.grid.innerHTML = "";
    matches.forEach(function (match, index) {
      config.grid.appendChild(renderKnockoutMatch(match, universe.cup, index));
    });

    var progress = window.CopaChiguiTournament.getRoundProgress(universe.cup, roundKey);
    var locked = window.CopaChiguiTournament.isRoundLocked(universe.cup, roundKey);
    config.badge.textContent = progress.completed + " / " + progress.total + " partidos";
    config.simulateButton.disabled = progress.finished || locked;
    config.simulateButton.textContent = locked ? "🔒 Ronda cerrada" : (progress.finished ? "✅ Ronda terminada" : "⚡ Simular pendientes");

    var nextCreated = nextRoundCreated(universe.cup, config.nextKey);
    config.createButton.disabled = !progress.finished || nextCreated;
    config.createButton.textContent = nextCreated ? "✅ " + config.nextLabel.charAt(0).toUpperCase() + config.nextLabel.slice(1) + " creados" : "➡️ Crear " + config.nextLabel;
    if (roundKey === "semifinals" && !nextCreated) {
      config.createButton.textContent = "🏆 Crear tercer puesto y final";
    }
  }

  function renderFinals(universe) {
    var thirdMatches = window.CopaChiguiTournament.getRoundMatches(universe.cup, "thirdPlace");
    var finalMatches = window.CopaChiguiTournament.getRoundMatches(universe.cup, "final");
    if (!thirdMatches.length || !finalMatches.length) {
      finalsSection.classList.add("hidden");
      return;
    }

    finalsSection.classList.remove("hidden");
    thirdPlaceGrid.innerHTML = "";
    finalGrid.innerHTML = "";
    thirdPlaceGrid.appendChild(renderKnockoutMatch(thirdMatches[0], universe.cup, 0));
    finalGrid.appendChild(renderKnockoutMatch(finalMatches[0], universe.cup, 0));

    var thirdProgress = window.CopaChiguiTournament.getRoundProgress(universe.cup, "thirdPlace");
    var finalProgress = window.CopaChiguiTournament.getRoundProgress(universe.cup, "final");
    var completed = thirdProgress.completed + finalProgress.completed;
    var total = thirdProgress.total + finalProgress.total;
    finalsProgressBadge.textContent = completed + " / " + total + " partidos";
    simulateAllFinalsButton.disabled = completed === total;
    simulateAllFinalsButton.textContent = completed === total ? "✅ Copa terminada" : "⚡ Simular partidos pendientes";
  }

  function renderChampion(universe) {
    var podium = window.CopaChiguiTournament.getPodium(universe.cup);
    if (!podium.completed || !podium.champion || !podium.runnerUp || !podium.third) {
      championSection.classList.add("hidden");
      return;
    }

    championSection.classList.remove("hidden");
    championDisplay.textContent = podium.champion.flag + " " + podium.champion.name + starsFor(podium.champion);
    podiumDisplay.textContent = "🥇 " + podium.champion.name + " · 🥈 " + podium.runnerUp.name + " · 🥉 " + podium.third.name;
  }

  function renderProgress(universe) {
    var progress = window.CopaChiguiTournament.getGroupStageProgress(universe.cup);
    groupProgressBadge.textContent = progress.completed + " / " + progress.total + " partidos";
    simulateNextButton.disabled = progress.finished || universe.cup.groupStageLocked;
    simulateAllButton.disabled = progress.finished || universe.cup.groupStageLocked;

    if (universe.cup.groupStageLocked) {
      simulateNextButton.textContent = "🔒 Fase cerrada";
      simulateAllButton.textContent = "🔒 Eliminatorias iniciadas";
    } else if (progress.finished) {
      simulateNextButton.textContent = "✅ Fase terminada";
      simulateAllButton.textContent = "✅ 32 clasificados";
    } else {
      simulateNextButton.textContent = "🎲 Simular siguiente";
      simulateAllButton.textContent = "⚡ Simular todos los pendientes";
    }
  }

  function renderUniverse(universe) {
    currentUniverse = universe;
    window.CopaChiguiTournament.ensureCupData(universe.cup);

    setupScreen.classList.add("hidden");
    tournamentScreen.classList.remove("hidden");
    universeTitle.textContent = universe.name;
    playersLabel.textContent = universe.playerName + " vs " + universe.rivalName;
    hostDisplay.textContent = universe.cup.host.flag + " " + universe.cup.host.name;
    participantCount.textContent = universe.cup.participants.length + " equipos";

    renderDrawGroups(universe);
    renderProgress(universe);
    renderGroupStage(universe);
    renderQualifiedTeams(universe);
    renderKnockoutStage(universe, "roundOf32");
    renderKnockoutStage(universe, "roundOf16");
    renderKnockoutStage(universe, "quarterfinals");
    renderKnockoutStage(universe, "semifinals");
    renderFinals(universe);
    renderChampion(universe);
  }

  function saveUniverse(universe) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(universe));
    } catch (error) {
      console.warn("No se pudo guardar el universo localmente.", error);
    }
  }

  function createUniverse(playerName, rivalName, universeName) {
    return {
      version: VERSION,
      name: universeName,
      playerName: playerName,
      rivalName: rivalName,
      coins: 0,
      predictionScore: { player: 0, rival: 0 },
      cup: window.CopaChiguiTournament.generateFirstCup(window.COPA_CHIGUI_TEAMS)
    };
  }

  function simulateWholeRound(roundKey, label) {
    if (!currentUniverse) {
      return;
    }
    var progress = window.CopaChiguiTournament.getRoundProgress(currentUniverse.cup, roundKey);
    if (progress.finished || !progress.created) {
      return;
    }
    var pending = progress.total - progress.completed;
    var confirmation = window.confirm("¿Simular los " + pending + " partidos pendientes de " + label + "?");
    if (!confirmation) {
      return;
    }
    try {
      window.CopaChiguiTournament.simulateAllPendingRound(currentUniverse.cup, roundKey);
      commitUniverseUpdate();
    } catch (error) {
      window.alert(error.message);
    }
  }

  function createNextRound(createFunction, message) {
    if (!currentUniverse) {
      return;
    }
    if (!window.confirm(message)) {
      return;
    }
    try {
      createFunction(currentUniverse.cup);
      commitUniverseUpdate();
    } catch (error) {
      window.alert(error.message);
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var playerName = safeText(playerNameInput.value);
    var rivalName = safeText(rivalNameInput.value);
    var universeName = safeText(universeNameInput.value);
    if (!playerName || !rivalName || !universeName) {
      return;
    }
    var universe = createUniverse(playerName, rivalName, universeName);
    saveUniverse(universe);
    renderUniverse(universe);
  });

  newDrawButton.addEventListener("click", function () {
    if (!currentUniverse) {
      return;
    }
    var confirmation = window.confirm("¿Quieres repetir el sorteo de la Copa Chigui #1? El sorteo y todos los resultados actuales serán reemplazados.");
    if (!confirmation) {
      return;
    }
    currentUniverse.cup = window.CopaChiguiTournament.generateFirstCup(window.COPA_CHIGUI_TEAMS);
    commitUniverseUpdate();
  });

  simulateNextButton.addEventListener("click", function () {
    if (!currentUniverse) {
      return;
    }
    var match = window.CopaChiguiTournament.simulateNextPendingMatch(currentUniverse.cup);
    if (match) {
      commitUniverseUpdate();
    }
  });

  simulateAllButton.addEventListener("click", function () {
    if (!currentUniverse) {
      return;
    }
    var progress = window.CopaChiguiTournament.getGroupStageProgress(currentUniverse.cup);
    if (progress.finished || currentUniverse.cup.groupStageLocked) {
      return;
    }
    var pending = progress.total - progress.completed;
    if (!window.confirm("¿Simular automáticamente los " + pending + " partidos pendientes de la fase de grupos?")) {
      return;
    }
    window.CopaChiguiTournament.simulateAllPendingGroupStage(currentUniverse.cup);
    commitUniverseUpdate();
  });

  createRoundOf32Button.addEventListener("click", function () {
    createNextRound(window.CopaChiguiTournament.createRoundOf32, "¿Crear los dieciseisavos? La fase de grupos quedará bloqueada para conservar los 32 clasificados.");
  });

  roundConfigs.roundOf32.simulateButton.addEventListener("click", function () {
    simulateWholeRound("roundOf32", "dieciseisavos");
  });
  roundConfigs.roundOf16.simulateButton.addEventListener("click", function () {
    simulateWholeRound("roundOf16", "octavos");
  });
  roundConfigs.quarterfinals.simulateButton.addEventListener("click", function () {
    simulateWholeRound("quarterfinals", "cuartos");
  });
  roundConfigs.semifinals.simulateButton.addEventListener("click", function () {
    simulateWholeRound("semifinal", "semifinales");
  });

  roundConfigs.roundOf32.createButton.addEventListener("click", function () {
    createNextRound(window.CopaChiguiTournament.createRoundOf16, "¿Crear los octavos de final con los 16 ganadores? Los dieciseisavos quedarán bloqueados.");
  });
  roundConfigs.roundOf16.createButton.addEventListener("click", function () {
    createNextRound(window.CopaChiguiTournament.createQuarterfinals, "¿Crear los cuartos de final? Los octavos quedarán bloqueados.");
  });
  roundConfigs.quarterfinals.createButton.addEventListener("click", function () {
    createNextRound(window.CopaChiguiTournament.createSemifinals, "¿Crear las semifinales? Los cuartos quedarán bloqueados.");
  });
  roundConfigs.semifinals.createButton.addEventListener("click", function () {
    createNextRound(window.CopaChiguiTournament.createFinals, "¿Crear el partido por el tercer puesto y la gran final? Las semifinales quedarán bloqueadas.");
  });

  simulateAllFinalsButton.addEventListener("click", function () {
    if (!currentUniverse) {
      return;
    }
    var third = window.CopaChiguiTournament.getRoundProgress(currentUniverse.cup, "thirdPlace");
    var finalProgress = window.CopaChiguiTournament.getRoundProgress(currentUniverse.cup, "final");
    var pending = (third.total - third.completed) + (finalProgress.total - finalProgress.completed);
    if (!pending) {
      return;
    }
    if (!window.confirm("¿Simular los " + pending + " partidos finales pendientes?")) {
      return;
    }
    window.CopaChiguiTournament.simulateAllPendingRound(currentUniverse.cup, "thirdPlace");
    window.CopaChiguiTournament.simulateAllPendingRound(currentUniverse.cup, "final");
    commitUniverseUpdate();
  });

  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      var recoveredUniverse = JSON.parse(saved);
      window.CopaChiguiTournament.ensureCupData(recoveredUniverse.cup);
      renderUniverse(recoveredUniverse);
    }
  } catch (error) {
    console.warn("No se pudo recuperar la partida guardada.", error);
  }
}());