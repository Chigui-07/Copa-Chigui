(function () {
  var STORAGE_KEY = "copaChigui.activeUniverse.v001";

  var setupScreen = document.getElementById("setupScreen");
  var tournamentScreen = document.getElementById("tournamentScreen");
  var form = document.getElementById("newUniverseForm");
  var newDrawButton = document.getElementById("newDrawButton");

  var playerNameInput = document.getElementById("playerName");
  var rivalNameInput = document.getElementById("rivalName");
  var universeNameInput = document.getElementById("universeName");

  var universeTitle = document.getElementById("universeTitle");
  var playersLabel = document.getElementById("playersLabel");
  var hostDisplay = document.getElementById("hostDisplay");
  var groupsGrid = document.getElementById("groupsGrid");
  var participantCount = document.getElementById("participantCount");

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

  function renderUniverse(universe) {
    currentUniverse = universe;

    setupScreen.classList.add("hidden");
    tournamentScreen.classList.remove("hidden");

    universeTitle.textContent = universe.name;
    playersLabel.textContent = universe.playerName + " vs " + universe.rivalName;
    hostDisplay.textContent = universe.cup.host.flag + " " + universe.cup.host.name;
    participantCount.textContent = universe.cup.participants.length + " equipos";

    groupsGrid.innerHTML = "";

    universe.cup.groups.forEach(function (group) {
      var card = document.createElement("article");
      card.className = "group-card";

      var title = document.createElement("h3");
      title.className = "group-title";
      title.textContent = group.name;
      card.appendChild(title);

      group.teams.forEach(function (team) {
        card.appendChild(renderTeamRow(team, universe.cup.hostId));
      });

      groupsGrid.appendChild(card);
    });
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
      version: "0.0.2",
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

    var confirmation = window.confirm("¿Quieres repetir el sorteo de la Copa Chigui #1? El sorteo actual será reemplazado.");
    if (!confirmation) {
      return;
    }

    currentUniverse.cup = window.CopaChiguiTournament.generateFirstCup(window.COPA_CHIGUI_TEAMS);
    saveUniverse(currentUniverse);
    renderUniverse(currentUniverse);
  });

  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      renderUniverse(JSON.parse(saved));
    }
  } catch (error) {
    console.warn("No se pudo recuperar la partida guardada.", error);
  }
}());
