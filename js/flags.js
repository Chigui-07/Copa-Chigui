(function () {
  var teams = window.COPA_CHIGUI_TEAMS || [];
  if (!teams.length) {
    return;
  }

  var style = document.createElement("style");
  style.textContent = "" +
    ".copa-flag-visual{display:inline-grid;place-items:center;width:28px;height:18px;flex:0 0 auto;margin-right:7px;vertical-align:-3px;position:relative;overflow:hidden;border-radius:2px;background:rgba(255,255,255,.08)}" +
    ".copa-flag-img{width:100%;height:100%;object-fit:cover;display:block;opacity:0;transition:opacity .16s ease}" +
    ".copa-flag-img.is-loaded{opacity:1}" +
    ".copa-flag-fallback{position:absolute;inset:0;display:grid;place-items:center;font-size:1rem;line-height:1}" +
    ".copa-flag-img.is-loaded+.copa-flag-fallback{display:none}" +
    ".flag .copa-flag-visual{margin-right:0}" +
    ".competition-big-flag .copa-flag-visual{width:54px;height:34px;margin:0 auto}" +
    ".competition-ko-name,.competition-match-team,.standing-team,.ranking-team,.qualified-name,.knockout-team,.cup-text-cell{align-items:center}" +
    "@media(max-width:620px){.copa-flag-visual{width:24px;height:16px;margin-right:5px}.competition-big-flag .copa-flag-visual{width:46px;height:30px}}" +
    "@media(prefers-reduced-motion:reduce){.copa-flag-img{transition:none}}";
  document.head.appendChild(style);

  function filenameForName(name) {
    return String(name || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim() + ".png";
  }

  function urlForTeam(team) {
    var filename = team.flagFile || filenameForName(team.name);
    return "assets/flags/" + encodeURIComponent(filename);
  }

  var teamsByLongestName = teams.slice().sort(function (a, b) {
    return b.name.length - a.name.length;
  });

  function findTeamByText(text) {
    var value = String(text || "");
    for (var i = 0; i < teamsByLongestName.length; i += 1) {
      if (value.indexOf(teamsByLongestName[i].name) !== -1) {
        return teamsByLongestName[i];
      }
    }
    return null;
  }

  function createVisual(team) {
    var visual = document.createElement("span");
    visual.className = "copa-flag-visual";
    visual.title = "Bandera de " + team.name;

    var image = document.createElement("img");
    image.className = "copa-flag-img";
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";

    var fallback = document.createElement("span");
    fallback.className = "copa-flag-fallback";
    fallback.textContent = team.flag || "🏳️";

    image.addEventListener("load", function () {
      image.classList.add("is-loaded");
    });
    image.addEventListener("error", function () {
      image.remove();
    });

    visual.appendChild(image);
    visual.appendChild(fallback);
    image.src = urlForTeam(team);
    return visual;
  }

  function decorateNamedElement(element) {
    if (!element || element.dataset.copaFlagEnhanced) {
      return;
    }

    var originalText = element.textContent.trim();
    var team = findTeamByText(originalText);
    if (!team) {
      return;
    }

    element.dataset.copaFlagEnhanced = team.id;
    var cleanText = originalText;
    if (team.flag) {
      cleanText = cleanText.replace(team.flag, "").trim();
    }

    element.textContent = "";
    element.appendChild(createVisual(team));
    var label = document.createElement("span");
    label.className = "copa-flag-label";
    label.textContent = cleanText;
    element.appendChild(label);
  }

  function decorateStandaloneFlag(element) {
    if (!element || element.dataset.copaFlagEnhanced) {
      return;
    }
    var row = element.closest(".team-row");
    var nameElement = row ? row.querySelector(".team-name") : null;
    var team = findTeamByText(nameElement ? nameElement.textContent : "");
    if (!team) {
      return;
    }
    element.dataset.copaFlagEnhanced = team.id;
    element.textContent = "";
    element.appendChild(createVisual(team));
  }

  function decorateBigFlag(element) {
    if (!element || element.dataset.copaFlagEnhanced) {
      return;
    }
    var parent = element.parentElement;
    var nameElement = parent ? parent.querySelector("strong") : null;
    var team = findTeamByText(nameElement ? nameElement.textContent : "");
    if (!team) {
      return;
    }
    element.dataset.copaFlagEnhanced = team.id;
    element.textContent = "";
    element.appendChild(createVisual(team));
  }

  var namedSelectors = [
    ".standing-team",
    ".match-team",
    ".qualified-name",
    ".knockout-team",
    ".ranking-team",
    ".competition-match-team",
    ".competition-team-cell",
    ".competition-best-team strong",
    ".competition-ko-name",
    ".cup-text-cell",
    "#hostDisplay",
    "#championDisplay"
  ].join(",");

  function refresh(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll(namedSelectors).forEach(decorateNamedElement);
    scope.querySelectorAll(".team-row .flag").forEach(decorateStandaloneFlag);
    scope.querySelectorAll(".competition-big-flag").forEach(decorateBigFlag);
  }

  var scheduled = false;
  function scheduleRefresh() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    window.setTimeout(function () {
      scheduled = false;
      refresh(document);
    }, 0);
  }

  var observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.body, { childList: true, subtree: true });

  window.CopaChiguiFlags = {
    filenameForName: filenameForName,
    urlForTeam: urlForTeam,
    createVisual: createVisual,
    refresh: refresh
  };

  refresh(document);
}());
