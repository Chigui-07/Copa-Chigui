(function () {
  var STORAGE_KEY = "copaChigui.activeUniverse.v001";
  var api = window.CopaChiguiTournament;
  var nav = document.querySelector(".game-navigation");
  var tournamentScreen = document.getElementById("tournamentScreen");

  if (!api || !nav || !tournamentScreen) {
    return;
  }

  var predictionButton = nav.querySelector(".game-nav-future");
  if (!predictionButton) {
    return;
  }

  predictionButton.disabled = false;
  predictionButton.classList.remove("game-nav-future");
  predictionButton.textContent = "🎯 Predicciones";
  predictionButton.title = "Predicciones manuales contra la IA";

  var section = document.createElement("section");
  section.id = "predictionsSection";
  section.className = "panel predictions-panel navigation-hidden";
  nav.insertAdjacentElement("afterend", section);

  function readUniverse() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeUniverse(universe) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(universe));
      return true;
    } catch (error) {
      console.warn("No se pudieron guardar las predicciones.", error);
      return false;
    }
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function randomPoisson(lambda) {
    var limit = Math.exp(-lambda);
    var product = 1;
    var count = 0;
    do {
      count += 1;
      product *= Math.random();
    } while (product > limit);
    return count - 1;
  }

  function teamById(cup, id) {
    return (cup.participants || []).find(function (team) {
      return team.id === id;
    }) || null;
  }

  function ensurePredictionData(universe) {
    var cup = universe.cup;
    if (!cup.predictions || typeof cup.predictions !== "object") {
      cup.predictions = {
        version: 1,
        entries: {},
        createdAt: new Date().toISOString()
      };
    }
    if (!cup.predictions.entries || typeof cup.predictions.entries !== "object") {
      cup.predictions.entries = {};
    }
    return cup.predictions;
  }

  function aiPrediction(cup, home, away) {
    var difference = (Number(home.points) || 100) - (Number(away.points) || 100);
    var shift = clamp(difference * 0.045, -1.05, 1.05);
    var homeExpected = 1.32 + shift;
    var awayExpected = 1.32 - shift;

    if (home.id === cup.hostId) {
      homeExpected += 0.18;
    }
    if (away.id === cup.hostId) {
      awayExpected += 0.18;
    }

    homeExpected = clamp(homeExpected, 0.3, 3.25);
    awayExpected = clamp(awayExpected, 0.3, 3.25);

    return {
      home: randomPoisson(homeExpected),
      away: randomPoisson(awayExpected)
    };
  }

  function outcome(home, away) {
    if (home > away) {
      return "H";
    }
    if (away > home) {
      return "A";
    }
    return "D";
  }

  function predictionPoints(pick, match) {
    if (!pick || !match.completed) {
      return 0;
    }
    var home = Number(match.homeGoals);
    var away = Number(match.awayGoals);
    if (pick.home === home && pick.away === away) {
      return 3;
    }
    return outcome(pick.home, pick.away) === outcome(home, away) ? 1 : 0;
  }

  function collectMatches(cup) {
    var rounds = [];
    var groupMatches = [];
    (cup.groups || []).forEach(function (group) {
      (group.matchdays || []).forEach(function (day) {
        (day.matches || []).forEach(function (match) {
          groupMatches.push({
            label: group.name + " · Jornada " + day.number,
            match: match
          });
        });
      });
    });
    rounds.push({ key: "groups", label: "Fase de grupos", matches: groupMatches });

    [
      ["roundOf32", "Dieciseisavos"],
      ["roundOf16", "Octavos"],
      ["quarterfinals", "Cuartos de final"],
      ["semifinals", "Semifinales"],
      ["thirdPlace", "Tercer puesto"],
      ["final", "Gran final"]
    ].forEach(function (config) {
      var key = config[0];
      var list = cup.knockout && Array.isArray(cup.knockout[key]) ? cup.knockout[key] : [];
      if (!list.length) {
        return;
      }
      rounds.push({
        key: key,
        label: config[1],
        matches: list.map(function (match, index) {
          return { label: config[1] + " · Partido " + (index + 1), match: match };
        })
      });
    });

    return rounds;
  }

  function totals(universe) {
    var data = ensurePredictionData(universe);
    var player = 0;
    var ai = 0;
    var exactPlayer = 0;
    var exactAi = 0;

    collectMatches(universe.cup).forEach(function (round) {
      round.matches.forEach(function (item) {
        var entry = data.entries[item.match.id];
        if (!entry || !entry.player || !entry.ai || !item.match.completed) {
          return;
        }
        var pp = predictionPoints(entry.player, item.match);
        var ap = predictionPoints(entry.ai, item.match);
        player += pp;
        ai += ap;
        if (pp === 3) {
          exactPlayer += 1;
        }
        if (ap === 3) {
          exactAi += 1;
        }
      });
    });

    return { player: player, ai: ai, exactPlayer: exactPlayer, exactAi: exactAi };
  }

  function addTeamVisual(container, team, alignClass) {
    container.className = "prediction-team" + (alignClass ? " " + alignClass : "");
    if (window.CopaChiguiFlags && typeof window.CopaChiguiFlags.createVisual === "function") {
      container.appendChild(window.CopaChiguiFlags.createVisual(team));
      var label = document.createElement("span");
      label.textContent = team.name;
      container.appendChild(label);
    } else {
      container.textContent = (team.flag || "🏳️") + " " + team.name;
    }
  }

  function realScore(match) {
    if (!match.completed) {
      return "VS";
    }
    return match.homeGoals + " - " + match.awayGoals;
  }

  function pickText(pick) {
    return pick ? pick.home + " - " + pick.away : "—";
  }

  function lockPrediction(matchId) {
    var universe = readUniverse();
    if (!universe || !universe.cup) {
      return;
    }

    var cup = universe.cup;
    var match = null;
    collectMatches(cup).some(function (round) {
      return round.matches.some(function (item) {
        if (item.match.id === matchId) {
          match = item.match;
          return true;
        }
        return false;
      });
    });

    if (!match || match.completed) {
      window.alert("Ese partido ya comenzó o ya terminó. La predicción está cerrada.");
      render();
      return;
    }

    var homeInput = document.querySelector('[data-prediction-home="' + matchId + '"]');
    var awayInput = document.querySelector('[data-prediction-away="' + matchId + '"]');
    var homeGoals = Number(homeInput ? homeInput.value : NaN);
    var awayGoals = Number(awayInput ? awayInput.value : NaN);

    if (!Number.isInteger(homeGoals) || !Number.isInteger(awayGoals) || homeGoals < 0 || awayGoals < 0 || homeGoals > 20 || awayGoals > 20) {
      window.alert("Escribe un marcador válido entre 0 y 20 goles por selección.");
      return;
    }

    var data = ensurePredictionData(universe);
    if (data.entries[matchId] && data.entries[matchId].player) {
      return;
    }

    var home = teamById(cup, match.homeId);
    var away = teamById(cup, match.awayId);
    if (!home || !away) {
      return;
    }

    data.entries[matchId] = {
      player: { home: homeGoals, away: awayGoals },
      ai: aiPrediction(cup, home, away),
      lockedAt: new Date().toISOString()
    };

    if (writeUniverse(universe)) {
      render();
    }
  }

  function renderCard(universe, item) {
    var cup = universe.cup;
    var data = ensurePredictionData(universe);
    var match = item.match;
    var entry = data.entries[match.id] || null;
    var home = teamById(cup, match.homeId);
    var away = teamById(cup, match.awayId);
    if (!home || !away) {
      return null;
    }

    var card = document.createElement("article");
    card.className = "prediction-card" + (match.completed ? " is-complete" : "") + (!entry && match.completed ? " is-closed" : "");

    var label = document.createElement("div");
    label.className = "prediction-match-label";
    label.textContent = item.label;
    card.appendChild(label);

    var fixture = document.createElement("div");
    fixture.className = "prediction-fixture";
    var homeName = document.createElement("div");
    var score = document.createElement("strong");
    var awayName = document.createElement("div");
    addTeamVisual(homeName, home, "home");
    addTeamVisual(awayName, away, "away");
    score.className = "prediction-score-real";
    score.textContent = realScore(match);
    fixture.appendChild(homeName);
    fixture.appendChild(score);
    fixture.appendChild(awayName);
    card.appendChild(fixture);

    if (!entry && !match.completed) {
      var entryBox = document.createElement("div");
      entryBox.className = "prediction-entry";
      var inputHome = document.createElement("input");
      inputHome.type = "number";
      inputHome.min = "0";
      inputHome.max = "20";
      inputHome.inputMode = "numeric";
      inputHome.className = "prediction-input";
      inputHome.placeholder = "0";
      inputHome.dataset.predictionHome = match.id;
      inputHome.setAttribute("aria-label", "Goles pronosticados para " + home.name);

      var separator = document.createElement("strong");
      separator.textContent = "-";

      var inputAway = document.createElement("input");
      inputAway.type = "number";
      inputAway.min = "0";
      inputAway.max = "20";
      inputAway.inputMode = "numeric";
      inputAway.className = "prediction-input";
      inputAway.placeholder = "0";
      inputAway.dataset.predictionAway = match.id;
      inputAway.setAttribute("aria-label", "Goles pronosticados para " + away.name);

      var button = document.createElement("button");
      button.type = "button";
      button.className = "primary-button prediction-lock-button";
      button.textContent = "🔒 Guardar predicción";
      button.addEventListener("click", function () {
        lockPrediction(match.id);
      });

      entryBox.appendChild(inputHome);
      entryBox.appendChild(separator);
      entryBox.appendChild(inputAway);
      entryBox.appendChild(button);
      card.appendChild(entryBox);
      return card;
    }

    if (!entry && match.completed) {
      var closed = document.createElement("div");
      closed.className = "prediction-closed-note";
      closed.textContent = "🔒 Partido cerrado: no hubo predicción antes del resultado.";
      card.appendChild(closed);
      return card;
    }

    if (entry && !match.completed) {
      var locked = document.createElement("div");
      locked.className = "prediction-locked";
      locked.innerHTML = "🔒 Tu predicción: <strong>" + pickText(entry.player) + "</strong> · La predicción de la IA queda oculta hasta que termine el partido.";
      card.appendChild(locked);
      return card;
    }

    var reveal = document.createElement("div");
    reveal.className = "prediction-reveal";
    var playerPick = document.createElement("div");
    playerPick.className = "prediction-pick";
    var playerPts = predictionPoints(entry.player, match);
    playerPick.innerHTML = "<strong>👤 " + (universe.playerName || "Jugador") + "</strong><span>" + pickText(entry.player) + "</span><span class=\"prediction-points\">+" + playerPts + " pts</span>";

    var aiPick = document.createElement("div");
    aiPick.className = "prediction-pick";
    var aiPts = predictionPoints(entry.ai, match);
    aiPick.innerHTML = "<strong>🤖 " + (universe.rivalName || "IA") + "</strong><span>" + pickText(entry.ai) + "</span><span class=\"prediction-points\">+" + aiPts + " pts</span>";

    reveal.appendChild(playerPick);
    reveal.appendChild(aiPick);
    card.appendChild(reveal);
    return card;
  }

  function render() {
    var universe = readUniverse();
    if (!universe || !universe.cup) {
      section.innerHTML = "<div class=\"predictions-empty\">Crea una Copa para empezar las predicciones.</div>";
      return;
    }

    var score = totals(universe);
    var rounds = collectMatches(universe.cup);
    var playerName = universe.playerName || "Jugador";
    var aiName = universe.rivalName || "IA";
    var edition = Number(universe.cup.edition) || 1;

    section.innerHTML = "" +
      "<div class=\"predictions-heading\"><div><p class=\"eyebrow\">PREDICCIONES · COPA #" + edition + "</p><h2>🎯 " + playerName + " vs " + aiName + " 🤖</h2><p class=\"muted\">Pronostica el marcador antes de que se juegue cada partido.</p></div><span class=\"badge\">Sin dinero real</span></div>" +
      "<div class=\"predictions-scoreboard\"><div class=\"predictions-player\"><strong>👤 " + playerName + "</strong><span>" + score.player + " pts</span><small>Exactos: " + score.exactPlayer + "</small></div><div class=\"predictions-vs\">VS</div><div class=\"predictions-player\"><strong>🤖 " + aiName + "</strong><span>" + score.ai + " pts</span><small>Exactos: " + score.exactAi + "</small></div></div>" +
      "<div class=\"predictions-rules\"><strong>Puntuación:</strong> marcador exacto = 3 pts · resultado correcto = 1 pt · fallo = 0 pts. Al guardar, tu predicción y la de la IA quedan bloqueadas. La IA usa la fuerza actual de las selecciones y un componente aleatorio.</div>";

    var hasAny = false;
    rounds.forEach(function (round) {
      if (!round.matches.length) {
        return;
      }
      hasAny = true;
      var wrapper = document.createElement("div");
      wrapper.className = "predictions-round";
      var lockedCount = round.matches.filter(function (item) {
        return Boolean(universe.cup.predictions && universe.cup.predictions.entries && universe.cup.predictions.entries[item.match.id]);
      }).length;
      wrapper.innerHTML = "<div class=\"predictions-round-title\"><h3>" + round.label + "</h3><span class=\"badge\">" + lockedCount + "/" + round.matches.length + " guardadas</span></div>";
      var grid = document.createElement("div");
      grid.className = "predictions-grid";
      round.matches.forEach(function (item) {
        var card = renderCard(universe, item);
        if (card) {
          grid.appendChild(card);
        }
      });
      wrapper.appendChild(grid);
      section.appendChild(wrapper);
    });

    if (!hasAny) {
      var empty = document.createElement("div");
      empty.className = "predictions-empty";
      empty.textContent = "Todavía no hay partidos disponibles para predecir.";
      section.appendChild(empty);
    }
  }

  function showPredictions() {
    document.querySelectorAll("[data-game-view]").forEach(function (panel) {
      panel.classList.add("navigation-hidden");
    });
    document.querySelectorAll(".game-nav-button").forEach(function (button) {
      button.classList.remove("active");
      button.setAttribute("aria-current", "false");
    });
    predictionButton.classList.add("active");
    predictionButton.setAttribute("aria-current", "page");
    section.classList.remove("navigation-hidden");
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function hidePredictions() {
    section.classList.add("navigation-hidden");
    predictionButton.classList.remove("active");
    predictionButton.setAttribute("aria-current", "false");
  }

  predictionButton.addEventListener("click", function (event) {
    event.preventDefault();
    showPredictions();
  });

  nav.addEventListener("click", function (event) {
    var other = event.target.closest(".game-nav-button[data-view], .game-nav-menu-button");
    if (other) {
      hidePredictions();
    }
  }, true);

  var lastSignature = "";
  function signature() {
    var universe = readUniverse();
    if (!universe || !universe.cup) {
      return "none";
    }
    var cup = universe.cup;
    var values = [cup.edition, cup.completed, cup.championId || ""];
    collectMatches(cup).forEach(function (round) {
      round.matches.forEach(function (item) {
        var match = item.match;
        values.push(match.id + ":" + (match.completed ? match.homeGoals + "-" + match.awayGoals : "x"));
      });
    });
    values.push(JSON.stringify(cup.predictions && cup.predictions.entries ? cup.predictions.entries : {}));
    return values.join("|");
  }

  window.setInterval(function () {
    if (section.classList.contains("navigation-hidden")) {
      return;
    }
    var next = signature();
    if (next !== lastSignature) {
      lastSignature = next;
      render();
    }
  }, 800);

  window.CopaChiguiPredictions = {
    render: render,
    show: showPredictions,
    totals: totals
  };
}());
