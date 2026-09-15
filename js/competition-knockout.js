(function () {
  var STORAGE_KEY = "copaChigui.activeUniverse.v001";
  var PHASE_KEY = "copaChigui.competitionRoundView";
  var wrap = document.getElementById("competitionPhaseTabs");
  var layout = document.querySelector(".competition-layout");
  if (!wrap || !layout) {
    return;
  }

  var calendarPanel = document.getElementById("competitionCalendarPanel") || document.querySelector(".competition-calendar");
  var groupPanel = document.getElementById("competitionGroupPanel") || document.querySelector(".competition-center");
  var nextPanel = document.querySelector(".competition-next");
  var view = document.getElementById("competitionKnockoutView");

  if (!view) {
    view = document.createElement("section");
    view.id = "competitionKnockoutView";
    view.className = "competition-knockout-view competition-phase-hidden";
    if (nextPanel) {
      layout.insertBefore(view, nextPanel);
    } else {
      layout.appendChild(view);
    }
  }

  var selectedPhase = "groups";
  try {
    selectedPhase = sessionStorage.getItem(PHASE_KEY) || "groups";
  } catch (error) {
    selectedPhase = "groups";
  }

  var lastSignature = "";

  function readUniverse() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function matchesFor(cup, key) {
    return cup && cup.knockout && Array.isArray(cup.knockout[key]) ? cup.knockout[key] : [];
  }

  function teamById(cup, id) {
    return cup.participants.find(function (team) {
      return team.id === id;
    }) || null;
  }

  function phaseFromButton(button) {
    var text = button.textContent.toLowerCase();
    if (text.indexOf("fase de grupos") !== -1) return "groups";
    if (text.indexOf("dieciseisavos") !== -1) return "roundOf32";
    if (text.indexOf("octavos") !== -1) return "roundOf16";
    if (text.indexOf("cuartos") !== -1) return "quarterfinals";
    if (text.indexOf("semifinales") !== -1) return "semifinals";
    if (text.indexOf("final") !== -1 && text.indexOf("cuartos") === -1 && text.indexOf("octavos") === -1 && text.indexOf("dieciseisavos") === -1) return "final";
    if (text.indexOf("clasificación") !== -1) return "classification";
    return null;
  }

  function phaseLabel(key) {
    return {
      roundOf32: "Dieciseisavos de final",
      roundOf16: "Octavos de final",
      quarterfinals: "Cuartos de final",
      semifinals: "Semifinales",
      final: "Final y tercer puesto"
    }[key] || "Eliminatorias";
  }

  function phaseUnlocked(cup, key) {
    if (key === "groups" || key === "classification") return true;
    if (key === "final") return matchesFor(cup, "final").length > 0;
    return matchesFor(cup, key).length > 0;
  }

  function setSelectedPhase(key) {
    selectedPhase = key;
    try {
      sessionStorage.setItem(PHASE_KEY, key);
    } catch (error) {
      // Sin sessionStorage la vista sigue funcionando.
    }
    lastSignature = "";
    refresh();
  }

  function updateTabs(cup) {
    wrap.querySelectorAll(".competition-phase-button").forEach(function (button) {
      var key = phaseFromButton(button);
      button.classList.toggle("active", key === selectedPhase);
      if (key && key !== "classification") {
        button.disabled = !phaseUnlocked(cup, key);
      }
    });
  }

  function rowScore(match, side) {
    if (!match.completed) return "—";
    var goals = side === "home" ? match.homeGoals : match.awayGoals;
    var penalties = side === "home" ? match.penaltyHome : match.penaltyAway;
    if (penalties !== null && typeof penalties !== "undefined") {
      return goals + " (" + penalties + ")";
    }
    return String(goals);
  }

  function teamRow(cup, match, side) {
    var id = side === "home" ? match.homeId : match.awayId;
    var team = teamById(cup, id);
    var row = document.createElement("div");
    row.className = "competition-ko-team";
    if (match.completed && match.winnerId) {
      row.classList.add(match.winnerId === id ? "is-winner" : "is-loser");
    }

    var name = document.createElement("span");
    name.className = "competition-ko-name";
    name.textContent = team ? team.flag + " " + team.name : id;
    var score = document.createElement("strong");
    score.className = "competition-ko-score";
    score.textContent = rowScore(match, side);
    row.appendChild(name);
    row.appendChild(score);
    return row;
  }

  function matchCard(cup, match, label) {
    var card = document.createElement("article");
    card.className = "competition-ko-card" + (match.completed ? " is-complete" : " is-pending");
    if (label) {
      var heading = document.createElement("div");
      heading.className = "competition-ko-label";
      heading.textContent = label;
      card.appendChild(heading);
    }
    card.appendChild(teamRow(cup, match, "home"));
    card.appendChild(teamRow(cup, match, "away"));
    return card;
  }

  function roundSignature(cup) {
    var keys = ["roundOf32", "roundOf16", "quarterfinals", "semifinals", "thirdPlace", "final"];
    var parts = [selectedPhase];
    keys.forEach(function (key) {
      matchesFor(cup, key).forEach(function (match) {
        parts.push(key + ":" + match.id + ":" + (match.completed ? match.homeGoals + "-" + match.awayGoals + ":" + (match.winnerId || "") + ":" + match.penaltyHome + "-" + match.penaltyAway : "x"));
      });
    });
    return parts.join("|");
  }

  function renderRound(cup) {
    if (selectedPhase === "groups") {
      if (calendarPanel) calendarPanel.classList.remove("competition-phase-hidden");
      if (groupPanel) groupPanel.classList.remove("competition-phase-hidden");
      view.classList.add("competition-phase-hidden");
      return;
    }

    if (!phaseUnlocked(cup, selectedPhase)) {
      selectedPhase = "groups";
      renderRound(cup);
      return;
    }

    if (calendarPanel) calendarPanel.classList.add("competition-phase-hidden");
    if (groupPanel) groupPanel.classList.add("competition-phase-hidden");
    view.classList.remove("competition-phase-hidden");

    var signature = roundSignature(cup);
    if (signature === lastSignature) return;
    lastSignature = signature;
    view.innerHTML = "";

    var heading = document.createElement("div");
    heading.className = "competition-ko-heading";
    var title = document.createElement("div");
    title.innerHTML = "<p class=\"eyebrow\">ELIMINACIÓN DIRECTA</p><h3>" + phaseLabel(selectedPhase) + "</h3>";
    var progress = document.createElement("span");
    progress.className = "badge";
    heading.appendChild(title);
    heading.appendChild(progress);
    view.appendChild(heading);

    var grid = document.createElement("div");
    grid.className = "competition-ko-grid";

    if (selectedPhase === "final") {
      grid.classList.add("competition-ko-grid-finals");
      var finalMatch = matchesFor(cup, "final")[0];
      var thirdPlace = matchesFor(cup, "thirdPlace")[0];
      var total = 0;
      var completed = 0;
      if (thirdPlace) {
        total += 1;
        if (thirdPlace.completed) completed += 1;
        grid.appendChild(matchCard(cup, thirdPlace, "🥉 Tercer puesto"));
      }
      if (finalMatch) {
        total += 1;
        if (finalMatch.completed) completed += 1;
        grid.appendChild(matchCard(cup, finalMatch, "🏆 Gran final"));
      }
      progress.textContent = completed + "/" + total;
    } else {
      var matches = matchesFor(cup, selectedPhase);
      var completedMatches = matches.filter(function (match) { return match.completed; }).length;
      progress.textContent = completedMatches + "/" + matches.length;
      grid.dataset.matches = String(matches.length);
      matches.forEach(function (match) {
        grid.appendChild(matchCard(cup, match, ""));
      });
    }

    view.appendChild(grid);
  }

  function refresh() {
    var universe = readUniverse();
    if (!universe || !universe.cup) return;
    var cup = universe.cup;
    if (!phaseUnlocked(cup, selectedPhase)) selectedPhase = "groups";
    updateTabs(cup);
    renderRound(cup);
  }

  wrap.addEventListener("click", function (event) {
    var button = event.target.closest(".competition-phase-button");
    if (!button || button.disabled) return;
    var key = phaseFromButton(button);
    if (!key || key === "classification") return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    setSelectedPhase(key);
  }, true);

  var scheduled = false;
  var observer = new MutationObserver(function () {
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(function () {
      scheduled = false;
      refresh();
    }, 0);
  });
  observer.observe(tournamentScreen, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

  refresh();
}());
