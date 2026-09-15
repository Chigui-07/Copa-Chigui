(function () {
  var STORAGE_KEY = "copaChigui.activeUniverse.v001";
  var api = window.CopaChiguiTournament;
  var allTeams = window.COPA_CHIGUI_TEAMS || [];

  if (!api || !allTeams.length) {
    return;
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

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
      console.warn("No se pudo guardar el historial de Copa Chigui.", error);
      window.alert("No se pudo guardar la partida. Puede que el almacenamiento del navegador esté lleno.");
      return false;
    }
  }

  function teamById(cup, id) {
    if (!cup || !Array.isArray(cup.participants)) {
      return null;
    }
    return cup.participants.find(function (team) {
      return team.id === id;
    }) || null;
  }

  function teamLabel(team) {
    return team ? (team.flag || "🏳️") + " " + team.name : "—";
  }

  function ensureHistory(universe) {
    if (!Array.isArray(universe.history)) {
      universe.history = [];
    }
    if (typeof universe.currentEdition !== "number") {
      universe.currentEdition = universe.cup && Number(universe.cup.edition) ? Number(universe.cup.edition) : 1;
    }
    return universe.history;
  }

  function rankingSnapshot(cup) {
    var ranking = Array.isArray(cup.worldRankingTeams) ? cup.worldRankingTeams : [];
    return ranking.map(function (team) {
      return {
        id: team.id,
        name: team.name,
        flag: team.flag,
        points: team.points,
        titles: team.titles || 0,
        previousRank: team.previousRank,
        currentRank: team.currentRank,
        bestRank: team.bestRank
      };
    });
  }

  function archiveCompletedCup(universe) {
    if (!universe || !universe.cup || !universe.cup.completed) {
      return false;
    }

    ensureHistory(universe);
    var cup = universe.cup;
    var edition = Number(cup.edition) || 1;
    var exists = universe.history.some(function (entry) {
      return Number(entry.edition) === edition;
    });
    if (exists) {
      return false;
    }

    if (window.CopaChiguiRanking && typeof window.CopaChiguiRanking.calculate === "function") {
      window.CopaChiguiRanking.calculate(cup);
    }

    var snapshot = deepClone(cup);
    delete snapshot.worldRankingTeams;

    universe.history.push({
      edition: edition,
      archivedAt: new Date().toISOString(),
      mode: cup.mode || "simulated",
      hostId: cup.hostId,
      championId: cup.championId,
      runnerUpId: cup.runnerUpId,
      thirdPlaceId: cup.thirdPlaceId,
      cup: snapshot,
      ranking: rankingSnapshot(cup)
    });

    universe.history.sort(function (a, b) {
      return Number(a.edition) - Number(b.edition);
    });
    universe.currentEdition = edition;
    return true;
  }

  function prepareRankingForNextCup(previousCup) {
    if (window.CopaChiguiRanking && typeof window.CopaChiguiRanking.calculate === "function") {
      window.CopaChiguiRanking.calculate(previousCup);
    }

    var source = Array.isArray(previousCup.worldRankingTeams) && previousCup.worldRankingTeams.length
      ? previousCup.worldRankingTeams
      : allTeams.map(function (team, index) {
          return {
            id: team.id,
            name: team.name,
            flag: team.flag,
            points: typeof team.points === "number" ? team.points : 100,
            titles: team.titles || 0,
            previousPoints: typeof team.points === "number" ? team.points : 100,
            previousRank: index + 1,
            currentRank: index + 1,
            bestRank: index + 1
          };
        });

    return source.map(function (team, index) {
      var currentRank = typeof team.currentRank === "number" ? team.currentRank : index + 1;
      var points = typeof team.points === "number" ? team.points : 100;
      return {
        id: team.id,
        name: team.name,
        flag: team.flag,
        points: points,
        titles: team.titles || 0,
        previousPoints: points,
        previousRank: currentRank,
        currentRank: currentRank,
        bestRank: typeof team.bestRank === "number" ? team.bestRank : currentRank
      };
    });
  }

  function createNextCup(previousCup) {
    if (!previousCup || !previousCup.completed || !previousCup.championId) {
      throw new Error("La Copa actual todavía no está terminada.");
    }

    var nextRanking = prepareRankingForNextCup(previousCup);
    var rankingById = {};
    nextRanking.forEach(function (team) {
      rankingById[team.id] = team;
    });

    var rankedCatalog = allTeams.map(function (baseTeam) {
      var ranked = rankingById[baseTeam.id];
      return Object.assign({}, baseTeam, {
        points: ranked && typeof ranked.points === "number" ? ranked.points : 100,
        titles: ranked ? ranked.titles || 0 : 0
      });
    });

    var champion = rankedCatalog.find(function (team) {
      return team.id === previousCup.championId;
    });
    if (!champion) {
      throw new Error("No se encontró al campeón anterior dentro del catálogo de selecciones.");
    }

    var others = rankedCatalog.filter(function (team) {
      return team.id !== champion.id;
    });
    var selected = [champion].concat(api.shuffle(others).slice(0, 63));
    var nextCup = api.generateFirstCup(selected);

    nextCup.edition = (Number(previousCup.edition) || 1) + 1;
    nextCup.previousChampionId = champion.id;
    nextCup.autoQualifiedIds = [champion.id];
    nextCup.mode = previousCup.mode || nextCup.mode || "simulated";
    nextCup.worldRankingTeams = nextRanking;
    nextCup.createdAt = new Date().toISOString();

    api.ensureCupData(nextCup);
    return nextCup;
  }

  function roundLabel(key) {
    return {
      roundOf32: "Dieciseisavos",
      roundOf16: "Octavos",
      quarterfinals: "Cuartos de final",
      semifinals: "Semifinales",
      thirdPlace: "Tercer puesto",
      final: "Final"
    }[key] || key;
  }

  function scoreLabel(match) {
    if (!match || !match.completed) {
      return "Pendiente";
    }
    var text = match.homeGoals + "-" + match.awayGoals;
    if (match.penaltyHome !== null && typeof match.penaltyHome !== "undefined") {
      text += " (" + match.penaltyHome + "-" + match.penaltyAway + " pen.)";
    }
    return text;
  }

  function renderRecord(record) {
    var cup = record.cup || {};
    var host = teamById(cup, record.hostId || cup.hostId);
    var champion = teamById(cup, record.championId || cup.championId);
    var runnerUp = teamById(cup, record.runnerUpId || cup.runnerUpId);
    var third = teamById(cup, record.thirdPlaceId || cup.thirdPlaceId);

    var groupsHtml = (cup.groups || []).map(function (group) {
      var teamsHtml = (group.teams || []).map(function (team) {
        return "<div class=\"cup-history-group-team\"><span>" + escapeHtml(teamLabel(team)) + "</span><span>" + escapeHtml(String(team.points)) + " pts</span></div>";
      }).join("");
      var matches = [];
      (group.matchdays || []).forEach(function (day) {
        (day.matches || []).forEach(function (match) {
          var home = teamById(cup, match.homeId);
          var away = teamById(cup, match.awayId);
          matches.push("<div class=\"cup-history-match\"><span>" + escapeHtml((home ? home.name : match.homeId) + " vs " + (away ? away.name : match.awayId)) + "</span><strong>" + escapeHtml(scoreLabel(match)) + "</strong></div>");
        });
      });
      return "<div class=\"cup-history-group\"><h4>" + escapeHtml(group.name) + "</h4>" + teamsHtml + matches.join("") + "</div>";
    }).join("");

    var rounds = ["roundOf32", "roundOf16", "quarterfinals", "semifinals", "thirdPlace", "final"];
    var roundsHtml = rounds.map(function (key) {
      var matches = cup.knockout && Array.isArray(cup.knockout[key]) ? cup.knockout[key] : [];
      if (!matches.length) {
        return "";
      }
      var matchHtml = matches.map(function (match) {
        var home = teamById(cup, match.homeId);
        var away = teamById(cup, match.awayId);
        return "<div class=\"cup-history-match\"><span>" + escapeHtml((home ? home.name : match.homeId) + " vs " + (away ? away.name : match.awayId)) + "</span><strong>" + escapeHtml(scoreLabel(match)) + "</strong></div>";
      }).join("");
      return "<div class=\"cup-history-round\"><h4>" + escapeHtml(roundLabel(key)) + "</h4>" + matchHtml + "</div>";
    }).join("");

    var topRanking = (record.ranking || []).slice().sort(function (a, b) {
      return (a.currentRank || 9999) - (b.currentRank || 9999);
    }).slice(0, 10);
    var rankingHtml = topRanking.map(function (team) {
      return "<div class=\"cup-history-ranking-row\"><span>#" + escapeHtml(team.currentRank) + " · " + escapeHtml(teamLabel(team)) + "</span><strong>" + escapeHtml(team.points) + " pts</strong></div>";
    }).join("");

    return "" +
      "<article class=\"cup-history-card\">" +
        "<div class=\"cup-history-summary\">" +
          "<div><h3>🏆 Copa Chigui #" + escapeHtml(record.edition) + "</h3>" +
          "<div class=\"cup-history-podium\">🥇 " + escapeHtml(teamLabel(champion)) + "<br>🥈 " + escapeHtml(teamLabel(runnerUp)) + "<br>🥉 " + escapeHtml(teamLabel(third)) + "</div></div>" +
          "<div class=\"cup-history-host\"><strong>🏟️ Anfitrión</strong><br>" + escapeHtml(teamLabel(host)) + "<br>" + (record.mode === "manual" ? "✍️ Manual" : "🎮 Simulada") + "</div>" +
        "</div>" +
        "<details class=\"cup-history-details\"><summary>Ver grupos, resultados y ranking</summary>" +
          "<div class=\"cup-history-detail-content\">" +
            "<div><h3>Fase de grupos</h3><div class=\"cup-history-groups\">" + groupsHtml + "</div></div>" +
            "<div><h3>Eliminatorias</h3><div class=\"cup-history-rounds\">" + roundsHtml + "</div></div>" +
            "<div class=\"cup-history-ranking\"><h3>Top 10 al finalizar</h3>" + rankingHtml + "</div>" +
          "</div>" +
        "</details>" +
      "</article>";
  }

  function ensureOverlay() {
    var overlay = document.getElementById("cupHistoryOverlay");
    if (overlay) {
      return overlay;
    }

    overlay = document.createElement("div");
    overlay.id = "cupHistoryOverlay";
    overlay.className = "cup-history-overlay hidden";
    overlay.innerHTML = "" +
      "<div class=\"cup-history-dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"cupHistoryTitle\">" +
        "<header class=\"cup-history-header\"><div><p class=\"eyebrow\">UNIVERSO FUTBOLÍSTICO</p><h2 id=\"cupHistoryTitle\">Historial de Copas</h2></div><button id=\"cupHistoryClose\" class=\"secondary-button\" type=\"button\">✕ Cerrar</button></header>" +
        "<div id=\"cupHistoryBody\" class=\"cup-history-body\"></div>" +
      "</div>";
    document.body.appendChild(overlay);

    document.getElementById("cupHistoryClose").addEventListener("click", closeHistory);
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeHistory();
      }
    });
    return overlay;
  }

  function openHistory() {
    var universe = readUniverse();
    if (!universe) {
      return;
    }
    var changed = archiveCompletedCup(universe);
    if (changed) {
      writeUniverse(universe);
    }
    ensureHistory(universe);

    var overlay = ensureOverlay();
    var body = document.getElementById("cupHistoryBody");
    var records = universe.history.slice().sort(function (a, b) {
      return Number(b.edition) - Number(a.edition);
    });

    body.innerHTML = records.length
      ? "<div class=\"cup-history-list\">" + records.map(renderRecord).join("") + "</div>"
      : "<div class=\"cup-history-empty\">Todavía no hay Copas terminadas en este universo. La primera aparecerá aquí cuando completes la final y el tercer puesto. 🏆</div>";
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeHistory() {
    var overlay = document.getElementById("cupHistoryOverlay");
    if (overlay) {
      overlay.classList.add("hidden");
    }
    document.body.style.overflow = "";
  }

  function continueToNextCup() {
    var universe = readUniverse();
    if (!universe || !universe.cup || !universe.cup.completed) {
      window.alert("Primero debes terminar la Copa actual.");
      return;
    }

    var currentEdition = Number(universe.cup.edition) || 1;
    var nextEdition = currentEdition + 1;
    var champion = teamById(universe.cup, universe.cup.championId);
    var message = "¿Comenzar la Copa Chigui #" + nextEdition + "?\n\n" +
      (champion ? champion.name + " entrará automáticamente como campeón defensor. " : "") +
      "El anfitrión y las otras 63 plazas se sortearán de nuevo. El ranking y los títulos se conservarán.";

    if (!window.confirm(message)) {
      return;
    }

    archiveCompletedCup(universe);
    try {
      universe.cup = createNextCup(universe.cup);
      universe.currentEdition = nextEdition;
      if (writeUniverse(universe)) {
        window.location.reload();
      }
    } catch (error) {
      window.alert(error.message || "No se pudo crear la siguiente Copa.");
    }
  }

  function attachHistoryButton() {
    var actions = document.querySelector(".competition-title-actions");
    if (!actions) {
      return;
    }
    var buttons = actions.querySelectorAll("button");
    var button = document.getElementById("competitionHistoryButton") || buttons[0];
    if (!button || button.dataset.historyReady) {
      return;
    }
    button.id = "competitionHistoryButton";
    button.disabled = false;
    button.textContent = "Historial";
    button.dataset.historyReady = "true";
    button.addEventListener("click", openHistory);
  }

  function updateEditionLabels(universe) {
    if (!universe || !universe.cup) {
      return;
    }
    var edition = Number(universe.cup.edition) || 1;
    var desiredHeader = "COPA CHIGUI #" + edition;
    var headerEyebrow = document.querySelector(".tournament-header .eyebrow");
    if (headerEyebrow && headerEyebrow.textContent !== desiredHeader) {
      headerEyebrow.textContent = desiredHeader;
    }

    var desiredChampion = "🏆 COPA CHIGUI #" + edition + " FINALIZADA";
    var championLabel = document.querySelector("#championSection .host-label");
    if (championLabel && universe.cup.completed && championLabel.textContent !== desiredChampion) {
      championLabel.textContent = desiredChampion;
    }

    var newDraw = document.getElementById("newDrawButton");
    if (newDraw) {
      newDraw.classList.toggle("hidden", edition > 1);
    }

    var competitionSubtitle = document.getElementById("competitionSubtitle");
    var desiredSubtitle = "Copa Chigui #" + edition + " · " + (universe.cup.mode === "manual" ? "Modo manual" : "Modo simulado");
    if (competitionSubtitle && competitionSubtitle.textContent.indexOf("Copa Chigui #") === -1 && competitionSubtitle.textContent !== desiredSubtitle) {
      competitionSubtitle.textContent = desiredSubtitle;
    }
  }

  function ensureNextCupButton(universe) {
    var section = document.getElementById("championSection");
    if (!section || !universe || !universe.cup || !universe.cup.completed) {
      return;
    }
    if (document.getElementById("continueNextCupButton")) {
      return;
    }

    var nextEdition = (Number(universe.cup.edition) || 1) + 1;
    var champion = teamById(universe.cup, universe.cup.championId);
    var wrap = document.createElement("div");
    wrap.className = "next-cup-actions";
    var button = document.createElement("button");
    button.id = "continueNextCupButton";
    button.className = "primary-button";
    button.type = "button";
    button.textContent = "➡️ Continuar a Copa Chigui #" + nextEdition;
    button.addEventListener("click", continueToNextCup);
    wrap.appendChild(button);

    var note = document.createElement("p");
    note.className = "cup-continuity-note";
    note.textContent = champion
      ? champion.name + " tendrá plaza automática como campeón defensor. Las otras 63 selecciones y el nuevo anfitrión se sortearán de nuevo."
      : "El ranking, los títulos y el historial se conservarán en la siguiente Copa.";

    section.appendChild(wrap);
    section.appendChild(note);
  }

  function syncInterface() {
    var universe = readUniverse();
    if (!universe || !universe.cup) {
      return;
    }

    var changed = archiveCompletedCup(universe);
    if (changed) {
      writeUniverse(universe);
    }

    updateEditionLabels(universe);
    attachHistoryButton();
    ensureNextCupButton(universe);
  }

  var scheduled = false;
  function scheduleSync() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    window.setTimeout(function () {
      scheduled = false;
      syncInterface();
    }, 0);
  }

  var observer = new MutationObserver(scheduleSync);
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeHistory();
    }
  });

  window.CopaChiguiHistory = {
    open: openHistory,
    close: closeHistory,
    archiveCompletedCup: archiveCompletedCup,
    createNextCup: createNextCup
  };

  scheduleSync();
}());
