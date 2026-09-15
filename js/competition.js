(function () {
  var STORAGE_KEY = "copaChigui.activeUniverse.v001";
  var navApi = window.CopaChiguiNavigation;
  var tournamentApi = window.CopaChiguiTournament;

  if (!navApi || !tournamentApi) {
    return;
  }

  var homeSection = document.querySelector('[data-game-view="home"]');
  var tournamentScreen = document.getElementById("tournamentScreen");
  if (!homeSection || !tournamentScreen) {
    return;
  }

  var homeButton = document.querySelector('.game-nav-button[data-view="home"]');
  if (homeButton) {
    homeButton.textContent = "⚽ Competición";
  }

  homeSection.classList.remove("host-card");
  homeSection.classList.add("competition-dashboard");
  homeSection.innerHTML = "" +
    "<div class=\"competition-titlebar\">" +
      "<div><p class=\"eyebrow\">COPA CHIGUI</p><h2>Competición</h2><p id=\"competitionSubtitle\" class=\"muted\"></p></div>" +
      "<div class=\"competition-title-actions\">" +
        "<button class=\"secondary-button\" type=\"button\" disabled>Historial</button>" +
        "<button class=\"secondary-button\" type=\"button\" disabled>Configuración</button>" +
        "<button id=\"competitionBackButton\" class=\"secondary-button\" type=\"button\">Atrás</button>" +
      "</div>" +
    "</div>" +
    "<div id=\"competitionPhaseTabs\" class=\"competition-phase-tabs\"></div>" +
    "<div class=\"competition-layout\">" +
      "<section class=\"competition-column competition-calendar\">" +
        "<div class=\"competition-section-title\"><span>Calendario de partidos</span><span id=\"competitionCalendarProgress\" class=\"badge\"></span></div>" +
        "<div class=\"competition-selector\"><button id=\"competitionPrevDay\" type=\"button\">←</button><strong id=\"competitionDayLabel\">Jornada 1</strong><button id=\"competitionNextDay\" type=\"button\">→</button></div>" +
        "<div id=\"competitionMatchList\" class=\"competition-match-list\"></div>" +
      "</section>" +
      "<section class=\"competition-column competition-center\">" +
        "<div class=\"competition-section-title\"><span>Tabla de grupo</span><span id=\"competitionGroupProgress\" class=\"badge\"></span></div>" +
        "<div class=\"competition-selector\"><button id=\"competitionPrevGroup\" type=\"button\">←</button><strong id=\"competitionGroupLabel\">Grupo A</strong><button id=\"competitionNextGroup\" type=\"button\">→</button></div>" +
        "<div class=\"competition-table-wrap\"><table class=\"competition-table\"><thead><tr><th>#</th><th>Selección</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>Pts</th></tr></thead><tbody id=\"competitionGroupBody\"></tbody></table></div>" +
        "<div id=\"competitionBestTeam\" class=\"competition-best-team\"></div>" +
      "</section>" +
      "<aside class=\"competition-column competition-next\">" +
        "<div class=\"competition-section-title\"><span>Próximo partido</span></div>" +
        "<div id=\"competitionNextMatch\" class=\"competition-next-card\"></div>" +
        "<div id=\"competitionPower\" class=\"competition-power\"></div>" +
        "<button id=\"competitionPrimaryAction\" class=\"primary-button competition-primary-action\" type=\"button\"></button>" +
      "</aside>" +
    "</div>";

  var selectedDay = 0;
  var selectedGroup = 0;
  var lastSignature = "";
  var primaryAction = null;

  function readUniverse() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function teamById(cup, id) {
    return cup.participants.find(function (team) {
      return team.id === id;
    }) || null;
  }

  function scoreText(match) {
    if (!match.completed) {
      return "VS";
    }
    var text = match.homeGoals + " - " + match.awayGoals;
    if (match.penaltyHome !== null && typeof match.penaltyHome !== "undefined") {
      text += " (" + match.penaltyHome + "-" + match.penaltyAway + " pen.)";
    }
    return text;
  }

  function groupProgress(cup) {
    var total = 0;
    var completed = 0;
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
    return { completed: completed, total: total, finished: total > 0 && completed === total };
  }

  function roundMatches(cup, key) {
    return cup.knockout && Array.isArray(cup.knockout[key]) ? cup.knockout[key] : [];
  }

  function roundFinished(cup, key) {
    var matches = roundMatches(cup, key);
    return matches.length > 0 && matches.every(function (match) { return match.completed; });
  }

  function phaseDefinitions(cup) {
    return [
      { key: "groups", label: "Fase de grupos", unlocked: true, view: "groups" },
      { key: "roundOf32", label: "Dieciseisavos", unlocked: roundMatches(cup, "roundOf32").length > 0, view: "knockout", target: "roundOf32Section" },
      { key: "roundOf16", label: "Octavos", unlocked: roundMatches(cup, "roundOf16").length > 0, view: "knockout", target: "roundOf16Section" },
      { key: "quarterfinals", label: "Cuartos", unlocked: roundMatches(cup, "quarterfinals").length > 0, view: "knockout", target: "quarterfinalsSection" },
      { key: "semifinals", label: "Semifinales", unlocked: roundMatches(cup, "semifinals").length > 0, view: "knockout", target: "semifinalsSection" },
      { key: "final", label: "Final", unlocked: roundMatches(cup, "final").length > 0, view: "knockout", target: "finalsSection" },
      { key: "classification", label: "Clasificación", unlocked: true, view: "cup" }
    ];
  }

  function renderPhaseTabs(cup) {
    var wrap = document.getElementById("competitionPhaseTabs");
    wrap.innerHTML = "";
    phaseDefinitions(cup).forEach(function (phase) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "competition-phase-button";
      button.disabled = !phase.unlocked;
      button.textContent = phase.unlocked ? phase.label : "🔒 " + phase.label;
      button.addEventListener("click", function () {
        navApi.setView(phase.view);
        if (phase.target) {
          window.setTimeout(function () {
            var target = document.getElementById(phase.target);
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }
          }, 80);
        }
      });
      wrap.appendChild(button);
    });
  }

  function renderCalendar(cup) {
    selectedDay = Math.max(0, Math.min(2, selectedDay));
    document.getElementById("competitionDayLabel").textContent = "Jornada " + (selectedDay + 1);
    var list = document.getElementById("competitionMatchList");
    list.innerHTML = "";

    var completed = 0;
    var total = 0;
    cup.groups.forEach(function (group) {
      var day = group.matchdays && group.matchdays[selectedDay];
      if (!day) {
        return;
      }
      day.matches.forEach(function (match) {
        total += 1;
        if (match.completed) {
          completed += 1;
        }
        var home = teamById(cup, match.homeId);
        var away = teamById(cup, match.awayId);
        var row = document.createElement("div");
        row.className = "competition-match-line" + (match.completed ? " is-complete" : "");
        row.innerHTML = "" +
          "<span class=\"competition-match-team home\">" + (home ? home.flag + " " + home.name : match.homeId) + "</span>" +
          "<strong class=\"competition-match-score\">" + scoreText(match) + "</strong>" +
          "<span class=\"competition-match-team away\">" + (away ? away.flag + " " + away.name : match.awayId) + "</span>";
        list.appendChild(row);
      });
    });
    document.getElementById("competitionCalendarProgress").textContent = completed + "/" + total;
  }

  function renderGroup(cup) {
    selectedGroup = Math.max(0, Math.min(cup.groups.length - 1, selectedGroup));
    var group = cup.groups[selectedGroup];
    document.getElementById("competitionGroupLabel").textContent = group.name;
    var body = document.getElementById("competitionGroupBody");
    body.innerHTML = "";
    var standings = Array.isArray(group.standings) ? group.standings : [];

    standings.forEach(function (standing, index) {
      var row = document.createElement("tr");
      if (index < 2) {
        row.className = "competition-qualified-row";
      }
      var gd = standing.goalDifference > 0 ? "+" + standing.goalDifference : String(standing.goalDifference || 0);
      [
        String(index + 1),
        standing.flag + " " + standing.name,
        String(standing.played || 0),
        String(standing.wins || 0),
        String(standing.draws || 0),
        String(standing.losses || 0),
        gd,
        String(standing.tablePoints || 0)
      ].forEach(function (value, cellIndex) {
        var td = document.createElement("td");
        td.textContent = value;
        if (cellIndex === 1) {
          td.className = "competition-team-cell";
        }
        row.appendChild(td);
      });
      body.appendChild(row);
    });

    var played = standings.reduce(function (sum, standing) { return sum + (standing.played || 0); }, 0) / 2;
    document.getElementById("competitionGroupProgress").textContent = Math.round(played) + "/6";
  }

  function bestTeam(cup) {
    var best = cup.participants.slice().sort(function (a, b) {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return a.name.localeCompare(b.name, "es");
    })[0];
    return best || null;
  }

  function renderBestTeam(cup) {
    var best = bestTeam(cup);
    var card = document.getElementById("competitionBestTeam");
    if (!best) {
      card.innerHTML = "";
      return;
    }
    card.innerHTML = "<span>Mayor fuerza actual</span><strong>" + best.flag + " " + best.name + "</strong><b>" + best.points + " pts</b>";
  }

  function findNextPending(cup) {
    for (var dayIndex = 0; dayIndex < 3; dayIndex += 1) {
      for (var groupIndex = 0; groupIndex < cup.groups.length; groupIndex += 1) {
        var day = cup.groups[groupIndex].matchdays[dayIndex];
        for (var matchIndex = 0; matchIndex < day.matches.length; matchIndex += 1) {
          if (!day.matches[matchIndex].completed) {
            return {
              kind: "group",
              label: cup.groups[groupIndex].name + " · Jornada " + (dayIndex + 1),
              match: day.matches[matchIndex],
              groupIndex: groupIndex,
              dayIndex: dayIndex,
              matchIndex: matchIndex
            };
          }
        }
      }
    }

    var rounds = [
      { key: "roundOf32", label: "Dieciseisavos", section: "roundOf32Section" },
      { key: "roundOf16", label: "Octavos", section: "roundOf16Section" },
      { key: "quarterfinals", label: "Cuartos", section: "quarterfinalsSection" },
      { key: "semifinals", label: "Semifinales", section: "semifinalsSection" },
      { key: "thirdPlace", label: "Tercer puesto", section: "finalsSection" },
      { key: "final", label: "Gran final", section: "finalsSection" }
    ];

    for (var r = 0; r < rounds.length; r += 1) {
      var matches = roundMatches(cup, rounds[r].key);
      for (var m = 0; m < matches.length; m += 1) {
        if (!matches[m].completed) {
          return {
            kind: "knockout",
            label: rounds[r].label,
            roundKey: rounds[r].key,
            section: rounds[r].section,
            match: matches[m],
            matchIndex: m
          };
        }
      }
    }
    return null;
  }

  function nextCreation(cup) {
    var groups = groupProgress(cup);
    if (!groups.finished) {
      return null;
    }
    if (!roundMatches(cup, "roundOf32").length) {
      return { label: "Crear dieciseisavos", buttonId: "createRoundOf32Button" };
    }
    if (roundFinished(cup, "roundOf32") && !roundMatches(cup, "roundOf16").length) {
      return { label: "Crear octavos", buttonId: "createRoundOf16Button" };
    }
    if (roundFinished(cup, "roundOf16") && !roundMatches(cup, "quarterfinals").length) {
      return { label: "Crear cuartos", buttonId: "createQuarterfinalsButton" };
    }
    if (roundFinished(cup, "quarterfinals") && !roundMatches(cup, "semifinals").length) {
      return { label: "Crear semifinales", buttonId: "createSemifinalsButton" };
    }
    if (roundFinished(cup, "semifinals") && !roundMatches(cup, "final").length) {
      return { label: "Crear final y tercer puesto", buttonId: "createFinalsButton" };
    }
    return null;
  }

  function originalSimulationButton(next) {
    if (!next) {
      return null;
    }
    if (next.kind === "group") {
      var groups = document.querySelectorAll("#groupStageList .stage-group");
      var group = groups[next.groupIndex];
      if (!group) {
        return document.getElementById("simulateNextButton");
      }
      var days = group.querySelectorAll(".matchday-card");
      var day = days[next.dayIndex];
      if (!day) {
        return document.getElementById("simulateNextButton");
      }
      var rows = day.querySelectorAll(".match-row");
      var row = rows[next.matchIndex];
      return row ? row.querySelector(".match-simulate-button") : document.getElementById("simulateNextButton");
    }

    var section = document.getElementById(next.section);
    if (!section) {
      return null;
    }
    var cards = section.querySelectorAll(".knockout-card");
    var card = cards[next.matchIndex];
    return card ? card.querySelector(".match-simulate-button") : null;
  }

  function renderNext(cup) {
    var next = findNextPending(cup);
    var creation = nextCreation(cup);
    var card = document.getElementById("competitionNextMatch");
    var power = document.getElementById("competitionPower");
    var action = document.getElementById("competitionPrimaryAction");
    primaryAction = null;

    if (next) {
      var home = teamById(cup, next.match.homeId);
      var away = teamById(cup, next.match.awayId);
      card.innerHTML = "" +
        "<span class=\"competition-next-stage\">" + next.label + "</span>" +
        "<div class=\"competition-versus\">" +
          "<div><span class=\"competition-big-flag\">" + (home ? home.flag : "") + "</span><strong>" + (home ? home.name : next.match.homeId) + "</strong></div>" +
          "<b>VS</b>" +
          "<div><span class=\"competition-big-flag\">" + (away ? away.flag : "") + "</span><strong>" + (away ? away.name : next.match.awayId) + "</strong></div>" +
        "</div>";

      var homePoints = home ? home.points : 100;
      var awayPoints = away ? away.points : 100;
      power.innerHTML = "<span>Poder del equipo</span><div><b>" + homePoints + "</b><div class=\"competition-power-track\"><i style=\"width:" + Math.max(8, Math.min(92, 50 + (homePoints - awayPoints) * 2)) + "%\"></i></div><b>" + awayPoints + "</b></div>";

      if (cup.mode === "manual") {
        action.textContent = next.kind === "group" ? "Registrar resultado" : "Abrir eliminatorias";
        primaryAction = function () {
          navApi.setView(next.kind === "group" ? "groups" : "knockout");
          if (next.section) {
            window.setTimeout(function () {
              var target = document.getElementById(next.section);
              if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              }
            }, 80);
          }
        };
      } else {
        action.textContent = "Simular partido";
        primaryAction = function () {
          var original = originalSimulationButton(next);
          if (original && !original.disabled) {
            original.click();
          }
        };
      }
      action.disabled = false;
      return;
    }

    power.innerHTML = "";
    if (creation) {
      card.innerHTML = "<span class=\"competition-next-stage\">Siguiente fase</span><div class=\"competition-next-message\">✅ La ronda actual terminó.<br>Ya puedes avanzar.</div>";
      action.textContent = creation.label;
      action.disabled = false;
      primaryAction = function () {
        var original = document.getElementById(creation.buttonId);
        if (original && !original.disabled) {
          original.click();
        }
      };
      return;
    }

    if (cup.completed) {
      var champion = teamById(cup, cup.championId);
      card.innerHTML = "<span class=\"competition-next-stage\">Copa finalizada</span><div class=\"competition-next-message\">🏆 " + (champion ? champion.flag + " " + champion.name : "Campeón definido") + "</div>";
      action.textContent = "Copa terminada";
      action.disabled = true;
      return;
    }

    card.innerHTML = "<span class=\"competition-next-stage\">Sin partido pendiente</span><div class=\"competition-next-message\">Revisa la fase actual para continuar.</div>";
    action.textContent = "Continuar";
    action.disabled = true;
  }

  function signature(universe) {
    if (!universe || !universe.cup) {
      return "none";
    }
    var cup = universe.cup;
    var parts = [cup.mode, cup.completed, cup.championId || "", selectedDay, selectedGroup];
    cup.groups.forEach(function (group) {
      (group.matchdays || []).forEach(function (day) {
        (day.matches || []).forEach(function (match) {
          parts.push(match.id + ":" + (match.completed ? match.homeGoals + "-" + match.awayGoals : "x"));
        });
      });
    });
    ["roundOf32", "roundOf16", "quarterfinals", "semifinals", "thirdPlace", "final"].forEach(function (key) {
      parts.push(key + ":" + roundMatches(cup, key).map(function (match) {
        return match.id + "=" + (match.completed ? match.homeGoals + "-" + match.awayGoals : "x");
      }).join(","));
    });
    return parts.join("|");
  }

  function render(force) {
    var universe = readUniverse();
    if (!universe || !universe.cup) {
      return;
    }
    var sig = signature(universe);
    if (!force && sig === lastSignature) {
      return;
    }
    lastSignature = sig;

    var cup = universe.cup;
    document.getElementById("competitionSubtitle").textContent = (universe.name || "Universo") + " · Copa Chigui #" + (cup.edition || 1) + " · " + (cup.mode === "manual" ? "Manual" : "Simulada");
    renderPhaseTabs(cup);
    renderCalendar(cup);
    renderGroup(cup);
    renderBestTeam(cup);
    renderNext(cup);
  }

  document.getElementById("competitionPrevDay").addEventListener("click", function () {
    selectedDay = (selectedDay + 2) % 3;
    render(true);
  });
  document.getElementById("competitionNextDay").addEventListener("click", function () {
    selectedDay = (selectedDay + 1) % 3;
    render(true);
  });
  document.getElementById("competitionPrevGroup").addEventListener("click", function () {
    var universe = readUniverse();
    if (!universe || !universe.cup) {
      return;
    }
    selectedGroup = (selectedGroup + universe.cup.groups.length - 1) % universe.cup.groups.length;
    render(true);
  });
  document.getElementById("competitionNextGroup").addEventListener("click", function () {
    var universe = readUniverse();
    if (!universe || !universe.cup) {
      return;
    }
    selectedGroup = (selectedGroup + 1) % universe.cup.groups.length;
    render(true);
  });
  document.getElementById("competitionPrimaryAction").addEventListener("click", function () {
    if (typeof primaryAction === "function") {
      primaryAction();
    }
  });
  document.getElementById("competitionBackButton").addEventListener("click", function () {
    navApi.showMainMenu();
  });

  var observerScheduled = false;
  var observer = new MutationObserver(function () {
    if (observerScheduled) {
      return;
    }
    observerScheduled = true;
    window.setTimeout(function () {
      observerScheduled = false;
      render(false);
    }, 0);
  });
  observer.observe(tournamentScreen, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

  render(true);
}());
