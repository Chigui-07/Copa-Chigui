(function () {
  var STORAGE_KEY = "copaChigui.activeUniverse.v001";

  function readUniverse() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function titleFor(cup) {
    if (!cup) {
      return "Copa Chigui";
    }
    var hostName = cup.host && cup.host.name ? cup.host.name : "Anfitrión";
    var edition = Number(cup.edition) || 1;
    return "Copa Chigui " + hostName + " " + edition;
  }

  function applyTitle() {
    var universe = readUniverse();
    if (!universe || !universe.cup) {
      document.title = "Copa Chigui";
      return;
    }

    var cup = universe.cup;
    var fullTitle = titleFor(cup);
    document.title = fullTitle;

    var eyebrow = document.querySelector(".tournament-header .eyebrow");
    if (eyebrow) {
      eyebrow.textContent = fullTitle.toUpperCase();
    }

    var competitionEyebrow = document.querySelector(".competition-titlebar .eyebrow");
    if (competitionEyebrow) {
      competitionEyebrow.textContent = fullTitle.toUpperCase();
    }

    var subtitle = document.getElementById("competitionSubtitle");
    if (subtitle) {
      subtitle.textContent = fullTitle + " · " + (cup.mode === "manual" ? "Modo manual" : "Modo simulado");
    }

    var championLabel = document.querySelector("#championSection .host-label");
    if (championLabel && cup.completed) {
      championLabel.textContent = "🏆 " + fullTitle.toUpperCase() + " FINALIZADA";
    }

    var hostCard = document.getElementById("hostDisplay");
    if (hostCard) {
      hostCard.setAttribute("data-cup-title", fullTitle);
    }
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    window.setTimeout(function () {
      scheduled = false;
      applyTitle();
    }, 0);
  }

  var observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });

  window.CopaChiguiTitle = {
    apply: applyTitle,
    titleFor: titleFor
  };

  applyTitle();
}());
