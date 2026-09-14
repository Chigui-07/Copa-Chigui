(function () {
  function shuffle(list) {
    var copy = list.slice();

    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }

    return copy;
  }

  function cloneTeam(team) {
    return {
      id: team.id,
      name: team.name,
      flag: team.flag,
      points: team.points,
      titles: team.titles
    };
  }

  function generateFirstCup(allTeams) {
    if (!Array.isArray(allTeams) || allTeams.length < 64) {
      throw new Error("Se necesitan al menos 64 selecciones para generar una Copa Chigui.");
    }

    var pool = shuffle(allTeams).map(cloneTeam);
    var host = pool[Math.floor(Math.random() * pool.length)];

    var remaining = pool.filter(function (team) {
      return team.id !== host.id;
    });

    var participants = [host].concat(shuffle(remaining).slice(0, 63));
    participants = shuffle(participants);

    var groups = [];
    var letters = "ABCDEFGHIJKLMNOP".split("");

    for (var i = 0; i < 16; i += 1) {
      groups.push({
        name: "Grupo " + letters[i],
        teams: participants.slice(i * 4, i * 4 + 4)
      });
    }

    return {
      edition: 1,
      hostId: host.id,
      host: host,
      participants: participants,
      groups: groups,
      createdAt: new Date().toISOString()
    };
  }

  window.CopaChiguiTournament = {
    shuffle: shuffle,
    generateFirstCup: generateFirstCup
  };
}());
