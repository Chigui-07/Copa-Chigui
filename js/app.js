(function () {
  var STORAGE_KEY = "copaChigui.activeUniverse.v001";

  var setupScreen = document.getElementById("setupScreen");
  var tournamentScreen = document.getElementById("tournamentScreen");
  var form = document.getElementById("newUniverseForm");
  var newDrawButton = document.getElementById("newDrawButton");
  var simulateNextButton = document.getElementById("simulateNextButton");
  var simulateAllButton = document.getElementById("simulateAllButton");
  var createRoundOf32Button = document.getElementById("createRoundOf32Button");
  var simulateAllRoundOf32Button = document.getElementById("simulateAllRoundOf32Button");

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
  var roundOf32Section = document.getElementById("roundOf32Section");
  var roundOf32Grid = document.getElementById("roundOf32Grid");
  var roundOf32ProgressBadge = document.getElementById("roundOf32ProgressBadge");

  var currentUniverse = null;

  function safeText(value) {
    return String(value || "").trim();
  }

  function starsFor(team) {
    if (!team.titles) {
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
    currentUniverse.version = "0.0.5";
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

    var homeInput = document.createElement("input");
    homeInput.type = "number";
    homeInput.min = "0";
    homeInput.max = "99";
    homeInput.inputMode = "numeric";
    homeInput.className = "goal-input";
    homeInput.setAttribute("aria-label", "Goles de " + home.name);
    homeInput.disabled = locked;
    if (match.completed) {
      homeInput.value = match.homeGoals;
    }

    var separator = document.createElement("span");
    separator.className = "score-separator";
    separator.textContent = "–";

    var awayInput = document.createElement("input");
    awayInput.type = "number";
    awayInput.min = "0";
    awayInput.max = "99";
    awayInput.inputMode = "numeric";
    awayInput.className = "goal-input";
    awayInput.setAttribute("aria-label", "Goles de " + away.name);
    awayInput.disabled = locked;
    if (match.completed) {
      awayInput.value = match.awayGoals;
    }

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

    if (universe.cup.knockout && Array.isArray(universe.cup.knockout.roundOf32)) {
      createRoundOf32Button.disabled = true;
      createRoundOf32Button.textContent = "✅ Dieciseisavos creados";
    } else {
      createRoundOf32Button.disabled = false;
      createRoundOf32Button.textContent = "🏆 Crear dieciseisavos de final";
    }
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
    var card = document.createElement("article");
    card.className = "knockout-card" + (match.completed ? " completed-knockout" : "");

    var heading = document.createElement("div");
    heading.className = "knockout-card-heading";
    heading.textContent = "Partido " + (index + 1);
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
    saveButton.textContent = match.completed ? "Actualizar" : "Guardar manual";

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
    simulateButton.textContent = match.completed ? (match.source === "simulated" ? "🎲 Simulado" : "✓ Registrado") : "🎲 Simular";
    simulateButton.disabled = match.completed;

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
      winnerNote.textContent = "✅ Clasifica " + winner.flag + " " + winner.name + (match.penaltyHome !== null ? " por penales" : "");
      card.appendChild(winnerNote);
    }

    return card;
  }

  function renderRoundOf32(universe) {
    if (!universe.cup.knockout || !Array.isArray(universe.cup.knockout.roundOf32)) {
      roundOf32Section.classList.add("hidden");
      return;
    }

    roundOf32Section.classList.remove("hidden");
    roundOf32Grid.innerHTML = "";

    universe.cup.knockout.roundOf32.forEach(function (match, index) {
      roundOf32Grid.appendChild(renderKnockoutMatch(match, universe.cup, index));
    });

    var progress = window.CopaChiguiTournament.getRoundOf32Progress(universe.cup);
    roundOf32ProgressBadge.textContent = progress.completed + " / " + progress.total + " partidos";
    simulateAllRoundOf32Button.disabled = progress.finished;
    simulateAllRoundOf32Button.textContent = progress.finished ? "✅ Dieciseisavos terminados" : "⚡ Simular dieciseisavos pendientes";
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
    renderRoundOf32(universe);
  }

  function saveUniverse(universe) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(universe));
    } catch (error) {
      console.warn("No se pudo guardar el universo localmente.", error);
    }
  }

  function createUniverse(playerName, rivalName, universeName) {
    var cup = window.CopaChiguiTournament.generateFirstCup(window.COPA_CHIGUI_TEAMS);

    return {
      version: "0.0.5",
      name: universeName,
      playerName: playerName,
      rivalName: rivalName,
      coins: 0,
      predictionScore: {
        player: 0,
        rival: 0
      },
      cup: cup
    };
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

    var confirmation = window.confirm("¿Quieres repetir el sorteo de la Copa Chigui #1? El sorteo y los resultados actuales serán reemplazados.");
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
    var confirmation = window.confirm("¿Simular automáticamente los " + pending + " partidos pendientes de la fase de grupos?");
    if (!confirmation) {
      return;
    }

    window.CopaChiguiTournament.simulateAllPendingGroupStage(currentUniverse.cup);
    commitUniverseUpdate();
  });

  createRoundOf32Button.addEventListener("click", function () {
    if (!currentUniverse) {
      return;
    }

    var confirmation = window.confirm("¿Crear los dieciseisavos? La fase de grupos quedará bloqueada para conservar los 32 clasificados.");
    if (!confirmation) {
      return;
    }

    try {
      window.CopaChiguiTournament.createRoundOf32(currentUniverse.cup);
      commitUniverseUpdate();
    } catch (error) {
      window.alert(error.message);
    }
  });

  simulateAllRoundOf32Button.addEventListener("click", function () {
    if (!currentUniverse || !currentUniverse.cup.knockout) {
      return;
    }

    var progress = window.CopaChiguiTournament.getRoundOf32Progress(currentUniverse.cup);
    if (progress.finished) {
      return;
    }

    var pending = progress.total - progress.completed;
    var confirmation = window.confirm("¿Simular los " + pending + " partidos pendientes de dieciseisavos?");
    if (!confirmation) {
      return;
    }

    currentUniverse.cup.knockout.roundOf32.forEach(function (match) {
      if (!match.completed) {
        window.CopaChiguiTournament.simulateKnockoutMatch(currentUniverse.cup, match.id);
      }
    });

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
