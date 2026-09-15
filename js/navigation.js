(function () {
  var tournamentScreen = document.getElementById("tournamentScreen");
  if (!tournamentScreen) {
    return;
  }

  var styleLink = document.createElement("link");
  styleLink.rel = "stylesheet";
  styleLink.href = "css/navigation.css";
  document.head.appendChild(styleLink);

  var header = tournamentScreen.querySelector(".tournament-header");
  if (!header) {
    return;
  }

  var nav = document.createElement("nav");
  nav.className = "game-navigation panel";
  nav.setAttribute("aria-label", "Secciones de Copa Chigui");

  var buttonsWrap = document.createElement("div");
  buttonsWrap.className = "game-navigation-buttons";

  var views = [
    { key: "home", label: "🏠 Inicio" },
    { key: "draw", label: "🎲 Sorteo" },
    { key: "groups", label: "📋 Grupos" },
    { key: "knockout", label: "🏆 Eliminatorias" },
    { key: "ranking", label: "📊 Ranking" }
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

  function closestPanel(selector) {
    var element = document.querySelector(selector);
    return element ? element.closest(".panel") : null;
  }

  var sections = {
    home: [
      document.querySelector(".host-card")
    ],
    ranking: [
      document.getElementById("worldRankingSection")
    ],
    draw: [
      closestPanel("#groupsGrid")
    ],
    groups: [
      closestPanel("#groupStageList"),
      document.getElementById("qualifiedSection")
    ],
    knockout: [
      document.getElementById("roundOf32Section"),
      document.getElementById("roundOf16Section"),
      document.getElementById("quarterfinalsSection"),
      document.getElementById("semifinalsSection"),
      document.getElementById("finalsSection"),
      document.getElementById("championSection")
    ]
  };

  Object.keys(sections).forEach(function (key) {
    sections[key] = sections[key].filter(Boolean);
    sections[key].forEach(function (section) {
      section.dataset.gameView = key;
    });
  });

  var emptyState = document.createElement("section");
  emptyState.className = "panel navigation-empty-state";
  emptyState.innerHTML = "<div class=\"navigation-empty-icon\">🏟️</div><h2>Esta sección todavía no está disponible</h2><p class=\"muted\">Avanza en la Copa para desbloquear su contenido.</p>";
  nav.insertAdjacentElement("afterend", emptyState);

  function hasVisibleContent(key) {
    var list = sections[key] || [];
    return list.some(function (section) {
      return !section.classList.contains("hidden");
    });
  }

  function setView(key) {
    if (!sections[key]) {
      key = "home";
    }

    Object.keys(sections).forEach(function (viewKey) {
      sections[viewKey].forEach(function (section) {
        section.classList.toggle("navigation-hidden", viewKey !== key);
      });
    });

    nav.querySelectorAll(".game-nav-button[data-view]").forEach(function (button) {
      var active = button.dataset.view === key;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });

    emptyState.classList.toggle("navigation-hidden", hasVisibleContent(key));

    try {
      sessionStorage.setItem("copaChigui.activeView", key);
    } catch (error) {
      // La navegación sigue funcionando aunque el navegador bloquee sessionStorage.
    }
  }

  nav.addEventListener("click", function (event) {
    var button = event.target.closest(".game-nav-button[data-view]");
    if (!button) {
      return;
    }
    setView(button.dataset.view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  var initialView = "home";
  try {
    initialView = sessionStorage.getItem("copaChigui.activeView") || "home";
  } catch (error) {
    initialView = "home";
  }
  setView(initialView);

  var observer = new MutationObserver(function () {
    var active = nav.querySelector(".game-nav-button.active");
    var key = active ? active.dataset.view : "home";
    emptyState.classList.toggle("navigation-hidden", hasVisibleContent(key));
  });

  Object.keys(sections).forEach(function (key) {
    sections[key].forEach(function (section) {
      observer.observe(section, { attributes: true, attributeFilter: ["class"] });
    });
  });
}());
