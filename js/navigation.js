(function () {
  var STORAGE_KEY = "copaChigui.activeUniverse.v001";
  var tournamentScreen = document.getElementById("tournamentScreen");
  var setupScreen = document.getElementById("setupScreen");
  var appShell = document.querySelector(".app-shell");

  if (!tournamentScreen || !appShell) {
    return;
  }

  var styleLink = document.createElement("link");
  styleLink.rel = "stylesheet";
  styleLink.href = "css/navigation.css";
  document.head.appendChild(styleLink);

  function readUniverse() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function closestPanel(selector) {
    var element = document.querySelector(selector);
    return element ? element.closest(".panel") : null;
  }

  function getRoundMatches(cup, key) {
    return cup && cup.knockout && Array.isArray(cup.knockout[key]) ? cup.knockout[key] : [];
  }

  function groupProgress(cup) {
    var total = 0;
    var completed = 0;
    if (!cup || !Array.isArray(cup.groups)) {
      return { completed: 0, total: 96, finished: false };
    }
    cup.groups.forEach(function (group) {
      (group.matchdays || []).forEach(function (day) {
        (day.matches || []).forEach(function (match) {
          total += 1;
          if (match.completed) {
            completed += 1;
          }
        });
      });
    });
    return { completed: completed, total: total || 96, finished: total > 0 && completed === total };
  }

  /* -----------------------------
     MENÚ PRINCIPAL
  ----------------------------- */

  var mainMenu = document.createElement("section");
  mainMenu.id = "mainMenuScreen";
  mainMenu.className = "panel main-menu-screen";
  mainMenu.innerHTML = "" +
    "<div class=\"main-menu-heading\">" +
      "<p class=\"eyebrow\">MENÚ PRINCIPAL</p>" +
      "<h2>Copa Chigui</h2>" +
      "<p class=\"muted\">Elige qué quieres hacer.</p>" +
    "</div>" +
    "<div class=\"main-menu-grid\">" +
      "<button id=\"mainPlayButton\" class=\"main-menu-button main-menu-primary\" type=\"button\"><span class=\"main-menu-icon\">▶️</span><span><strong>Jugar</strong><small id=\"mainPlaySubtitle\">Comenzar una nueva historia</small></span></button>" +
      "<button id=\"mainRankingButton\" class=\"main-menu-button\" type=\"button\"><span class=\"main-menu-icon\">📊</span><span><strong>Ranking Mundial</strong><small>Ver la clasificación del universo</small></span></button>" +
      "<button class=\"main-menu-button\" type=\"button\" disabled><span class=\"main-menu-icon\">💾</span><span><strong>Partidas</strong><small>Varios universos · Próximamente</small></span></button>" +
      "<button class=\"main-menu-button\" type=\"button\" disabled><span class=\"main-menu-icon\">🌐</span><span><strong>Multijugador online</strong><small>Salas privadas · Próximamente</small></span></button>" +
      "<button class=\"main-menu-button\" type=\"button\" disabled><span class=\"main-menu-icon\">⚙️</span><span><strong>Ajustes</strong><small>Opciones del juego · Próximamente</small></span></button>" +
    "</div>" +
    "<p class=\"main-menu-version muted\">Prototipo en desarrollo</p>";

  var hero = appShell.querySelector(".hero");
  if (hero) {
    hero.insertAdjacentElement("afterend", mainMenu);
  } else {
    appShell.insertBefore(mainMenu, appShell.firstChild);
  }

  var rankingReturnBar = document.createElement("section");
  rankingReturnBar.className = "panel menu-return-bar navigation-hidden";
  rankingReturnBar.innerHTML = "<button id=\"rankingBackToMenu\" class=\"secondary-button\" type=\"button\">← Menú principal</button><div><p class=\"eyebrow\">RANKING MUNDIAL</p><strong>Clasificación del universo</strong></div>";
  tournamentScreen.insertAdjacentElement("beforebegin", rankingReturnBar);

  function refreshMainMenu() {
    var universe = readUniverse();
    var playSubtitle = document.getElementById("mainPlaySubtitle");
    var rankingButton = document.getElementById("mainRankingButton");
    if (playSubtitle) {
      playSubtitle.textContent = universe ? "Continuar " + (universe.name || "partida") : "Comenzar una nueva historia";
    }
    if (rankingButton) {
      rankingButton.disabled = !universe;
      rankingButton.title = universe ? "" : "Crea primero un universo";
    }
  }

  function showMainMenu() {
    document.body.classList.remove("main-ranking-view");
    mainMenu.classList.remove("navigation-hidden");
    rankingReturnBar.classList.add("navigation-hidden");
    if (setupScreen) {
      setupScreen.classList.add("navigation-hidden");
    }
    tournamentScreen.classList.add("navigation-hidden");
    refreshMainMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* -----------------------------
     NAVEGACIÓN INTERNA DE LA COPA
  ----------------------------- */

  var header = tournamentScreen.querySelector(".tournament-header");
  if (!header) {
    return;
  }

  var nav = document.createElement("nav");
  nav.className = "game-navigation panel";
  nav.setAttribute("aria-label", "Secciones de Copa Chigui");

  var buttonsWrap = document.createElement("div");
  buttonsWrap.className = "game-navigation-buttons";

  var menuButton = document.createElement("button");
  menuButton.type = "button";
  menuButton.className = "game-nav-button game-nav-menu-button";
  menuButton.textContent = "← Menú";
  buttonsWrap.appendChild(menuButton);

  var views = [
    { key: "home", label: "🏠 Inicio" },
    { key: "cup", label: "🏅 Tabla de Copa" },
    { key: "groups", label: "📋 Grupos" },
    { key: "knockout", label: "🏆 Eliminatorias" }
  ];

  views.forEach(function (view) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "game-nav-button";
    button.dataset.view = view.key;
    button.textContent = view.label;
    buttonsWrap.appendChild(button);
  });

  var futureButton = document.createElement("button");
  futureButton.type = "button";
  futureButton.className = "game-nav-button game-nav-future";
  futureButton.textContent = "🎯 Predicciones";
  futureButton.disabled = true;
  futureButton.title = "Disponible en una próxima versión";
  buttonsWrap.appendChild(futureButton);

  nav.appendChild(buttonsWrap);
  header.insertAdjacentElement("afterend", nav);

  /* Tabla general de la Copa */
  var cupTableSection = document.createElement("section");
  cupTableSection.id = "cupTableSection";
  cupTableSection.className = "panel";
  cupTableSection.innerHTML = "" +
    "<div class=\"section-heading\">" +
      "<div><p class=\"eyebrow\">CLASIFICACIÓN DE ESTA COPA</p><h2>Del mejor al peor</h2></div>" +
      "<span id=\"cupTableCount\" class=\"badge\">64 selecciones</span>" +
    "</div>" +
    "<p class=\"muted\">Esta tabla ordena únicamente el rendimiento dentro de la Copa actual. No sustituye al Ranking Mundial Chigui.</p>" +
    "<div class=\"table-scroll cup-table-scroll\"><table class=\"standings-table cup-overall-table\">" +
      "<thead><tr><th>#</th><th>Selección</th><th>Fase</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>Pts Copa</th></tr></thead>" +
      "<tbody id=\"cupOverallBody\"></tbody>" +
    "</table></div>";
  nav.insertAdjacentElement("afterend", cupTableSection);

  /* El antiguo panel de sorteo no forma parte del menú de juego. */
  var legacyDrawPanel = closestPanel("#groupsGrid");
  if (legacyDrawPanel) {
    legacyDrawPanel.classList.add("navigation-hidden");
    legacyDrawPanel.dataset.navigationLegacyDraw = "true";
  }

  /* Cuadro eliminatorio progresivo. Conservamos los paneles originales
     para no romper los botones/eventos que crea app.js. */
  var knockoutSections = [
    document.getElementById("roundOf32Section"),
    document.getElementById("roundOf16Section"),
    document.getElementById("quarterfinalsSection"),
    document.getElementById("semifinalsSection"),
    document.getElementById("finalsSection"),
    document.getElementById("championSection")
  ].filter(Boolean);

  var bracketShell = document.createElement("section");
  bracketShell.id = "knockoutHub";
  bracketShell.className = "knockout-hub";

  var knockoutGate = document.createElement("div");
  knockoutGate.className = "panel knockout-gate";
  bracketShell.appendChild(knockoutGate);

  var bracketTrack = document.createElement("div");
  bracketTrack.className = "knockout-bracket-track";
  bracketShell.appendChild(bracketTrack);

  if (knockoutSections.length) {
    knockoutSections[0].parentNode.insertBefore(bracketShell, knockoutSections[0]);
    knockoutSections.forEach(function (section) {
      section.classList.add("knockout-round-column");
      bracketTrack.appendChild(section);
    });
  } else {
    cupTableSection.insertAdjacentElement("afterend", bracketShell);
  }

  var sections = {
    home: [document.querySelector(".host-card")],
    cup: [cupTableSection],
    groups: [closestPanel("#groupStageList"), document.getElementById("qualifiedSection")],
    knockout: [bracketShell],
    ranking: [document.getElementById("worldRankingSection")]
  };

  Object.keys(sections).forEach(function (key) {
    sections[key] = sections[key].filter(Boolean);
    sections[key].forEach(function (section) {
      section.dataset.gameView = key;
    });
  });

  var emptyState = document.createElement("section");
  emptyState.className = "panel navigation-empty-state navigation-hidden";
  emptyState.innerHTML = "<div class=\"navigation-empty-icon\">🏟️</div><h2>Esta sección todavía no está disponible</h2><p class=\"muted\">Avanza en la Copa para desbloquear su contenido.</p>";
  cupTableSection.insertAdjacentElement("afterend", emptyState);

  function participantInRound(cup, key, teamId) {
    return getRoundMatches(cup, key).some(function (match) {
      return match.homeId === teamId || match.awayId === teamId;
    });
  }

  function fourthPlaceId(cup) {
    var third = getRoundMatches(cup, "thirdPlace")[0];
    if (!third || !third.completed || !third.winnerId) {
      return null;
    }
    return third.winnerId === third.homeId ? third.awayId : third.homeId;
  }

  function teamStage(cup, teamId) {
    if (cup.championId === teamId) {
      return { depth: 8, label: "🏆 Campeón", fixed: 1 };
    }
    if (cup.runnerUpId === teamId) {
      return { depth: 7, label: "🥈 Subcampeón", fixed: 2 };
    }
    if (cup.thirdPlaceId === teamId) {
      return { depth: 6, label: "🥉 Tercer lugar", fixed: 3 };
    }
    if (fourthPlaceId(cup) === teamId) {
      return { depth: 5, label: "4.º lugar", fixed: 4 };
    }
    if (participantInRound(cup, "final", teamId)) {
      return { depth: 7, label: "Final" };
    }
    if (participantInRound(cup, "thirdPlace", teamId)) {
      return { depth: 6, label: "Top 4" };
    }
    if (participantInRound(cup, "semifinals", teamId)) {
      return { depth: 5, label: "Semifinales" };
    }
    if (participantInRound(cup, "quarterfinals", teamId)) {
      return { depth: 4, label: "Cuartos" };
    }
    if (participantInRound(cup, "roundOf16", teamId)) {
      return { depth: 3, label: "Octavos" };
    }
    if (participantInRound(cup, "roundOf32", teamId)) {
      return { depth: 2, label: "Dieciseisavos" };
    }
    return { depth: 1, label: "Fase de grupos" };
  }

  function createCupStats(cup) {
    var stats = {};
    cup.participants.forEach(function (team) {
      stats[team.id] = {
        id: team.id,
        name: team.name,
        flag: team.flag,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gf: 0,
        ga: 0,
        cupPoints: 0
      };
    });

    function applyMatch(match, knockout) {
      if (!match || !match.completed || !stats[match.homeId] || !stats[match.awayId]) {
        return;
      }
      var home = stats[match.homeId];
      var away = stats[match.awayId];
      var hg = Number(match.homeGoals || 0);
      var ag = Number(match.awayGoals || 0);
      home.played += 1;
      away.played += 1;
      home.gf += hg;
      home.ga += ag;
      away.gf += ag;
      away.ga += hg;

      if (knockout && match.winnerId) {
        var winner = stats[match.winnerId];
        var loser = match.winnerId === match.homeId ? away : home;
        winner.wins += 1;
        winner.cupPoints += 3;
        loser.losses += 1;
        return;
      }

      if (hg > ag) {
        home.wins += 1;
        home.cupPoints += 3;
        away.losses += 1;
      } else if (ag > hg) {
        away.wins += 1;
        away.cupPoints += 3;
        home.losses += 1;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.cupPoints += 1;
        away.cupPoints += 1;
      }
    }

    cup.groups.forEach(function (group) {
      (group.matchdays || []).forEach(function (matchday) {
        (matchday.matches || []).forEach(function (match) {
          applyMatch(match, false);
        });
      });
    });

    ["roundOf32", "roundOf16", "quarterfinals", "semifinals", "thirdPlace", "final"].forEach(function (key) {
      getRoundMatches(cup, key).forEach(function (match) {
        applyMatch(match, true);
      });
    });

    return stats;
  }

  var lastCupTableSignature = "";

  function cupSignature(cup) {
    var parts = [cup.championId || "", cup.runnerUpId || "", cup.thirdPlaceId || ""];
    cup.groups.forEach(function (group) {
      (group.matchdays || []).forEach(function (day) {
        (day.matches || []).forEach(function (match) {
          parts.push(match.id + ":" + (match.completed ? match.homeGoals + "-" + match.awayGoals : "x"));
        });
      });
    });
    ["roundOf32", "roundOf16", "quarterfinals", "semifinals", "thirdPlace", "final"].forEach(function (key) {
      getRoundMatches(cup, key).forEach(function (match) {
        parts.push(match.id + ":" + (match.completed ? match.homeGoals + "-" + match.awayGoals + ":" + match.winnerId : "x"));
      });
    });
    return parts.join("|");
  }

  function renderCupTable() {
    var universe = readUniverse();
    if (!universe || !universe.cup || !Array.isArray(universe.cup.participants)) {
      return;
    }
    var cup = universe.cup;
    var signature = cupSignature(cup);
    if (signature === lastCupTableSignature) {
      return;
    }
    lastCupTableSignature = signature;

    var stats = createCupStats(cup);
    var rows = cup.participants.map(function (team) {
      var row = stats[team.id];
      row.stage = teamStage(cup, team.id);
      row.gd = row.gf - row.ga;
      return row;
    });

    rows.sort(function (a, b) {
      if (a.stage.fixed && b.stage.fixed) {
        return a.stage.fixed - b.stage.fixed;
      }
      if (a.stage.fixed) {
        return -1;
      }
      if (b.stage.fixed) {
        return 1;
      }
      if (b.stage.depth !== a.stage.depth) {
        return b.stage.depth - a.stage.depth;
      }
      if (b.cupPoints !== a.cupPoints) {
        return b.cupPoints - a.cupPoints;
      }
      if (b.gd !== a.gd) {
        return b.gd - a.gd;
      }
      if (b.gf !== a.gf) {
        return b.gf - a.gf;
      }
      return a.name.localeCompare(b.name, "es");
    });

    var body = document.getElementById("cupOverallBody");
    var count = document.getElementById("cupTableCount");
    if (!body) {
      return;
    }
    body.innerHTML = "";
    rows.forEach(function (entry, index) {
      var tr = document.createElement("tr");
      if (index < 3 && cup.completed) {
        tr.className = "cup-podium-row";
      }
      [
        String(index + 1),
        entry.flag + " " + entry.name,
        entry.stage.label,
        String(entry.played),
        String(entry.wins),
        String(entry.draws),
        String(entry.losses),
        entry.gd > 0 ? "+" + entry.gd : String(entry.gd),
        String(entry.cupPoints)
      ].forEach(function (value, cellIndex) {
        var td = document.createElement("td");
        td.textContent = value;
        if (cellIndex === 1 || cellIndex === 2) {
          td.className = "cup-text-cell";
        }
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    if (count) {
      count.textContent = rows.length + " selecciones";
    }
  }

  /* -----------------------------
     MODO MANUAL / SIMULADO
  ----------------------------- */

  function applyModeVisibility() {
    var universe = readUniverse();
    if (!universe || !universe.cup) {
      return;
    }
    var simulated = universe.cup.mode !== "manual";
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
        button.classList.toggle("mode-control-hidden", !simulated);
      }
    });

    document.querySelectorAll(".match-simulate-button").forEach(function (button) {
      button.classList.toggle("mode-control-hidden", !simulated);
    });
    document.querySelectorAll(".match-save-button").forEach(function (button) {
      button.classList.toggle("mode-control-hidden", simulated);
    });
    document.body.classList.toggle("cup-mode-simulated", simulated);
    document.body.classList.toggle("cup-mode-manual", !simulated);
  }

  /* -----------------------------
     ELIMINATORIAS: ACCESO Y BLOQUEO
  ----------------------------- */

  var lastKnockoutGateSignature = "";

  function refreshKnockoutGate() {
    var universe = readUniverse();
    if (!universe || !universe.cup) {
      knockoutGate.innerHTML = "<p class=\"muted\">Crea una Copa para ver las eliminatorias.</p>";
      knockoutGate.classList.remove("navigation-hidden");
      bracketTrack.classList.add("navigation-hidden");
      return;
    }

    var cup = universe.cup;
    var progress = groupProgress(cup);
    var hasRoundOf32 = getRoundMatches(cup, "roundOf32").length > 0;
    var signature = [progress.completed, progress.total, hasRoundOf32, cup.completed].join("|");

    if (signature === lastKnockoutGateSignature) {
      return;
    }
    lastKnockoutGateSignature = signature;

    if (hasRoundOf32) {
      knockoutGate.classList.add("navigation-hidden");
      bracketTrack.classList.remove("navigation-hidden");
      return;
    }

    bracketTrack.classList.add("navigation-hidden");
    knockoutGate.classList.remove("navigation-hidden");

    if (!progress.finished) {
      knockoutGate.innerHTML = "" +
        "<div class=\"navigation-empty-icon\">🔒</div>" +
        "<p class=\"eyebrow\">ELIMINATORIAS BLOQUEADAS</p>" +
        "<h2>Primero termina la fase de grupos</h2>" +
        "<p class=\"muted\">Llevas " + progress.completed + " de " + progress.total + " partidos. Los dieciseisavos aparecerán aquí cuando existan 32 clasificados.</p>";
      return;
    }

    knockoutGate.innerHTML = "" +
      "<div class=\"navigation-empty-icon\">🏆</div>" +
      "<p class=\"eyebrow\">32 CLASIFICADOS</p>" +
      "<h2>Los dieciseisavos están listos</h2>" +
      "<p class=\"muted\">Confirma los clasificados para abrir el cuadro. Después, cada ronda aparecerá únicamente cuando la anterior haya terminado.</p>" +
      "<button id=\"knockoutStartButton\" class=\"primary-button\" type=\"button\">Crear dieciseisavos de final</button>";

    var startButton = document.getElementById("knockoutStartButton");
    if (startButton) {
      startButton.addEventListener("click", function () {
        var original = document.getElementById("createRoundOf32Button");
        if (original) {
          original.click();
        }
      });
    }
  }

  /* -----------------------------
     CAMBIO DE VISTAS
  ----------------------------- */

  function animateSection(section) {
    section.classList.remove("navigation-enter");
    void section.offsetWidth;
    section.classList.add("navigation-enter");
  }

  function setView(key) {
    if (!sections[key]) {
      key = "home";
    }

    Object.keys(sections).forEach(function (viewKey) {
      sections[viewKey].forEach(function (section) {
        var active = viewKey === key;
        section.classList.toggle("navigation-hidden", !active);
        if (active) {
          animateSection(section);
        }
      });
    });

    if (legacyDrawPanel) {
      legacyDrawPanel.classList.add("navigation-hidden");
    }

    nav.querySelectorAll(".game-nav-button[data-view]").forEach(function (button) {
      var active = button.dataset.view === key;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });

    emptyState.classList.add("navigation-hidden");
    if (key === "knockout") {
      refreshKnockoutGate();
    }
    if (key === "cup") {
      renderCupTable();
    }

    try {
      sessionStorage.setItem("copaChigui.activeView", key);
    } catch (error) {
      // La navegación funciona aunque sessionStorage esté bloqueado.
    }
  }

  function showGame() {
    document.body.classList.remove("main-ranking-view");
    mainMenu.classList.add("navigation-hidden");
    rankingReturnBar.classList.add("navigation-hidden");
    var universe = readUniverse();
    if (universe) {
      if (setupScreen) {
        setupScreen.classList.add("navigation-hidden");
      }
      tournamentScreen.classList.remove("navigation-hidden");
      setView("home");
    } else {
      tournamentScreen.classList.add("navigation-hidden");
      if (setupScreen) {
        setupScreen.classList.remove("navigation-hidden");
        animateSection(setupScreen);
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showRankingFromMenu() {
    var universe = readUniverse();
    if (!universe) {
      return;
    }
    mainMenu.classList.add("navigation-hidden");
    if (setupScreen) {
      setupScreen.classList.add("navigation-hidden");
    }
    tournamentScreen.classList.remove("navigation-hidden");
    rankingReturnBar.classList.remove("navigation-hidden");
    document.body.classList.add("main-ranking-view");
    setView("ranking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  var universeForm = document.getElementById("newUniverseForm");
  if (universeForm) {
    universeForm.addEventListener("submit", function () {
      window.setTimeout(function () {
        mainMenu.classList.add("navigation-hidden");
        rankingReturnBar.classList.add("navigation-hidden");
        document.body.classList.remove("main-ranking-view");
        if (setupScreen) {
          setupScreen.classList.add("navigation-hidden");
        }
        tournamentScreen.classList.remove("navigation-hidden");
        refreshInterface();
        setView("home");
      }, 0);
    });
  }

  document.getElementById("mainPlayButton").addEventListener("click", showGame);
  document.getElementById("mainRankingButton").addEventListener("click", showRankingFromMenu);
  document.getElementById("rankingBackToMenu").addEventListener("click", showMainMenu);
  menuButton.addEventListener("click", showMainMenu);

  nav.addEventListener("click", function (event) {
    var button = event.target.closest(".game-nav-button[data-view]");
    if (!button) {
      return;
    }
    setView(button.dataset.view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* -----------------------------
     ANIMACIÓN DE SIMULACIÓN
  ----------------------------- */

  var simulationOverlay = document.createElement("div");
  simulationOverlay.className = "simulation-overlay navigation-hidden";
  simulationOverlay.innerHTML = "" +
    "<div class=\"simulation-card\">" +
      "<div class=\"simulation-ball\">⚽</div>" +
      "<p class=\"eyebrow\">SIMULACIÓN EN CURSO</p>" +
      "<h2 id=\"simulationTitle\">Partido en juego</h2>" +
      "<p id=\"simulationClock\" class=\"simulation-clock\">0'</p>" +
      "<div class=\"simulation-track\"><div id=\"simulationProgress\" class=\"simulation-progress\"></div></div>" +
      "<p id=\"simulationMessage\" class=\"muted\">Los equipos salen al campo...</p>" +
    "</div>";
  document.body.appendChild(simulationOverlay);

  var simulationBusy = false;
  var bypassButtons = typeof WeakSet !== "undefined" ? new WeakSet() : null;

  function simulationTitleFor(button) {
    var matchRow = button.closest(".match-row");
    if (matchRow) {
      var teams = matchRow.querySelectorAll(".match-team");
      if (teams.length >= 2) {
        return teams[0].textContent.trim() + " vs " + teams[1].textContent.trim();
      }
    }
    var card = button.closest(".knockout-card");
    if (card) {
      var knockoutTeams = card.querySelectorAll(".knockout-team");
      if (knockoutTeams.length >= 2) {
        return knockoutTeams[0].textContent.trim() + " vs " + knockoutTeams[1].textContent.trim();
      }
    }
    if (button.id === "simulateAllButton") {
      return "Fase de grupos";
    }
    if (button.id === "simulateNextButton") {
      return "Siguiente partido";
    }
    return "Ronda eliminatoria";
  }

  function runSimulationAnimation(button) {
    if (simulationBusy) {
      return;
    }
    simulationBusy = true;
    var title = document.getElementById("simulationTitle");
    var clock = document.getElementById("simulationClock");
    var progress = document.getElementById("simulationProgress");
    var message = document.getElementById("simulationMessage");
    title.textContent = simulationTitleFor(button);
    clock.textContent = "0'";
    progress.style.width = "0%";
    message.textContent = "Los equipos salen al campo...";
    simulationOverlay.classList.remove("navigation-hidden");

    [
      { at: 300, minute: 18, width: 20, text: "El partido empieza a tomar ritmo." },
      { at: 650, minute: 45, width: 50, text: "Descanso. Todo sigue abierto." },
      { at: 1000, minute: 67, width: 74, text: "Entramos en el tramo decisivo." },
      { at: 1350, minute: 90, width: 100, text: "Final del partido. Revelando resultado..." }
    ].forEach(function (step) {
      window.setTimeout(function () {
        clock.textContent = step.minute + "'";
        progress.style.width = step.width + "%";
        message.textContent = step.text;
      }, step.at);
    });

    window.setTimeout(function () {
      simulationOverlay.classList.add("navigation-hidden");
      simulationBusy = false;
      if (bypassButtons) {
        bypassButtons.add(button);
      } else {
        button.dataset.simulationBypass = "true";
      }
      button.click();
    }, 1600);
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest(
      ".match-simulate-button, #simulateNextButton, #simulateAllButton, #simulateAllRoundOf32Button, #simulateAllRoundOf16Button, #simulateAllQuarterfinalsButton, #simulateAllSemifinalsButton, #simulateAllFinalsButton"
    );
    if (!button || button.disabled || button.classList.contains("mode-control-hidden")) {
      return;
    }

    if (bypassButtons && bypassButtons.has(button)) {
      bypassButtons.delete(button);
      return;
    }
    if (!bypassButtons && button.dataset.simulationBypass === "true") {
      delete button.dataset.simulationBypass;
      return;
    }

    var universe = readUniverse();
    if (!universe || !universe.cup || universe.cup.mode === "manual") {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    runSimulationAnimation(button);
  }, true);

  /* -----------------------------
     ACTUALIZACIÓN AUTOMÁTICA
  ----------------------------- */

  function refreshInterface() {
    renderCupTable();
    applyModeVisibility();
    refreshKnockoutGate();
    refreshMainMenu();
    if (legacyDrawPanel) {
      legacyDrawPanel.classList.add("navigation-hidden");
    }
  }

  var refreshScheduled = false;
  function scheduleRefresh() {
    if (refreshScheduled) {
      return;
    }
    refreshScheduled = true;
    window.setTimeout(function () {
      refreshScheduled = false;
      refreshInterface();
    }, 0);
  }

  var observer = new MutationObserver(scheduleRefresh);
  observer.observe(tournamentScreen, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

  var initialView = "home";
  try {
    initialView = sessionStorage.getItem("copaChigui.activeView") || "home";
    if (initialView === "draw" || initialView === "ranking") {
      initialView = "home";
    }
  } catch (error) {
    initialView = "home";
  }

  window.CopaChiguiNavigation = {
    setView: setView,
    showMainMenu: showMainMenu,
    showGame: showGame,
    showRanking: showRankingFromMenu,
    refresh: refreshInterface
  };

  renderCupTable();
  applyModeVisibility();
  refreshKnockoutGate();
  setView(initialView);
  showMainMenu();
}());
