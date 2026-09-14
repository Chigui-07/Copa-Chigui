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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function cloneTeam(team) {
    return {
      id: team.id,
      name: team.name,
      flag: team.flag,
      points: typeof team.points === "number" ? team.points : 100,
      startingPoints: typeof team.points === "number" ? team.points : 100,
      titles: team.titles || 0
    };
  }

  function createMatch(groupIndex, day, matchIndex, homeId, awayId) {
    return {
      id: "G" + groupIndex + "-J" + day + "-M" + matchIndex,
      homeId: homeId,
      awayId: awayId,
      homeGoals: null,
      awayGoals: null,
      completed: false,
      source: null
    };
  }

  function createGroupMatchdays(teams, groupIndex) {
    return [
      {
        number: 1,
        matches: [
          createMatch(groupIndex, 1, 1, teams[0].id, teams[1].id),
          createMatch(groupIndex, 1, 2, teams[2].id, teams[3].id)
        ]
      },
      {
        number: 2,
        matches: [
          createMatch(groupIndex, 2, 1, teams[0].id, teams[2].id),
          createMatch(groupIndex, 2, 2, teams[3].id, teams[1].id)
        ]
      },
      {
        number: 3,
        matches: [
          createMatch(groupIndex, 3, 1, teams[3].id, teams[0].id),
          createMatch(groupIndex, 3, 2, teams[1].id, teams[2].id)
        ]
      }
    ];
  }

  function findParticipant(cup, teamId) {
    for (var i = 0; i < cup.participants.length; i += 1) {
      if (cup.participants[i].id === teamId) {
        return cup.participants[i];
      }
    }
    return null;
  }

  function findMatch(cup, matchId) {
    for (var g = 0; g < cup.groups.length; g += 1) {
      var group = cup.groups[g];
      for (var d = 0; d < group.matchdays.length; d += 1) {
        var matchday = group.matchdays[d];
        for (var m = 0; m < matchday.matches.length; m += 1) {
          if (matchday.matches[m].id === matchId) {
            return matchday.matches[m];
          }
        }
      }
    }
    return null;
  }

  function findKnockoutMatch(cup, matchId) {
    if (!cup.knockout || !Array.isArray(cup.knockout.roundOf32)) {
      return null;
    }

    for (var i = 0; i < cup.knockout.roundOf32.length; i += 1) {
      if (cup.knockout.roundOf32[i].id === matchId) {
        return cup.knockout.roundOf32[i];
      }
    }

    return null;
  }

  function ensureCupData(cup) {
    cup.participants.forEach(function (team) {
      if (typeof team.startingPoints !== "number") {
        team.startingPoints = typeof team.points === "number" ? team.points : 100;
      }
      if (typeof team.points !== "number") {
        team.points = team.startingPoints;
      }
      if (typeof team.titles !== "number") {
        team.titles = 0;
      }
    });

    cup.groups.forEach(function (group, groupIndex) {
      group.teams.forEach(function (team) {
        var participant = findParticipant(cup, team.id);
        if (participant) {
          team.startingPoints = participant.startingPoints;
          team.points = participant.points;
        }
      });

      if (!Array.isArray(group.matchdays) || group.matchdays.length !== 3) {
        group.matchdays = createGroupMatchdays(group.teams, groupIndex + 1);
      }

      group.matchdays.forEach(function (matchday) {
        matchday.matches.forEach(function (match) {
          if (typeof match.source === "undefined") {
            match.source = match.completed ? "manual" : null;
          }
        });
      });
    });

    if (cup.knockout && Array.isArray(cup.knockout.roundOf32)) {
      cup.groupStageLocked = true;
      cup.knockout.roundOf32.forEach(function (match) {
        if (typeof match.source === "undefined") {
          match.source = match.completed ? "manual" : null;
        }
        if (typeof match.penaltyHome === "undefined") {
          match.penaltyHome = null;
          match.penaltyAway = null;
        }
      });
    }

    recalculateCup(cup);
    return cup;
  }

  function blankStanding(team) {
    return {
      id: team.id,
      name: team.name,
      flag: team.flag,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      tablePoints: 0,
      worldPoints: team.points
    };
  }

  function applyKnockoutPoints(cup) {
    if (!cup.knockout || !Array.isArray(cup.knockout.roundOf32)) {
      return;
    }

    cup.knockout.roundOf32.forEach(function (match) {
      if (!match.completed || !match.winnerId) {
        return;
      }

      var homeTeam = findParticipant(cup, match.homeId);
      var awayTeam = findParticipant(cup, match.awayId);
      var winner = match.winnerId === homeTeam.id ? homeTeam : awayTeam;
      var loser = match.winnerId === homeTeam.id ? awayTeam : homeTeam;

      winner.points += 2;
      loser.points -= 2;
    });
  }

  function recalculateCup(cup) {
    cup.participants.forEach(function (team) {
      team.points = team.startingPoints;
    });

    cup.groups.forEach(function (group) {
      var standingsById = {};

      group.teams.forEach(function (team) {
        var participant = findParticipant(cup, team.id);
        standingsById[team.id] = blankStanding(participant || team);
      });

      group.matchdays.forEach(function (matchday) {
        matchday.matches.forEach(function (match) {
          if (!match.completed) {
            return;
          }

          var home = standingsById[match.homeId];
          var away = standingsById[match.awayId];
          var homeTeam = findParticipant(cup, match.homeId);
          var awayTeam = findParticipant(cup, match.awayId);
          var homeGoals = Number(match.homeGoals);
          var awayGoals = Number(match.awayGoals);

          home.played += 1;
          away.played += 1;
          home.goalsFor += homeGoals;
          home.goalsAgainst += awayGoals;
          away.goalsFor += awayGoals;
          away.goalsAgainst += homeGoals;

          if (homeGoals > awayGoals) {
            home.wins += 1;
            home.tablePoints += 3;
            away.losses += 1;
            homeTeam.points += 2;
            awayTeam.points -= 2;
          } else if (homeGoals < awayGoals) {
            away.wins += 1;
            away.tablePoints += 3;
            home.losses += 1;
            awayTeam.points += 2;
            homeTeam.points -= 2;
          } else {
            home.draws += 1;
            away.draws += 1;
            home.tablePoints += 1;
            away.tablePoints += 1;
          }
        });
      });

      var standings = Object.keys(standingsById).map(function (teamId) {
        var row = standingsById[teamId];
        var participant = findParticipant(cup, teamId);
        row.goalDifference = row.goalsFor - row.goalsAgainst;
        row.worldPoints = participant ? participant.points : row.worldPoints;
        return row;
      });

      standings.sort(function (a, b) {
        if (b.tablePoints !== a.tablePoints) {
          return b.tablePoints - a.tablePoints;
        }
        if (b.goalDifference !== a.goalDifference) {
          return b.goalDifference - a.goalDifference;
        }
        if (b.goalsFor !== a.goalsFor) {
          return b.goalsFor - a.goalsFor;
        }
        return a.name.localeCompare(b.name, "es");
      });

      group.standings = standings;
    });

    applyKnockoutPoints(cup);

    cup.groups.forEach(function (group) {
      group.teams.forEach(function (team) {
        var participant = findParticipant(cup, team.id);
        if (participant) {
          team.points = participant.points;
          team.startingPoints = participant.startingPoints;
        }
      });
    });

    return cup;
  }

  function setMatchResult(cup, matchId, homeGoals, awayGoals, source) {
    if (cup.groupStageLocked) {
      throw new Error("La fase de grupos está cerrada porque ya comenzaron las eliminatorias.");
    }

    var parsedHome = Number(homeGoals);
    var parsedAway = Number(awayGoals);

    if (!Number.isInteger(parsedHome) || !Number.isInteger(parsedAway) || parsedHome < 0 || parsedAway < 0) {
      throw new Error("El resultado debe usar goles enteros iguales o mayores que 0.");
    }

    var match = findMatch(cup, matchId);

    if (!match) {
      throw new Error("No se encontró el partido indicado.");
    }

    match.homeGoals = parsedHome;
    match.awayGoals = parsedAway;
    match.completed = true;
    match.source = source || "manual";

    return recalculateCup(cup);
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

  function simulateScore(cup, homeTeam, awayTeam) {
    var pointDifference = homeTeam.points - awayTeam.points;
    var strengthShift = clamp(pointDifference * 0.055, -1.15, 1.15);
    var homeExpected = 1.35 + strengthShift;
    var awayExpected = 1.35 - strengthShift;

    if (homeTeam.id === cup.hostId) {
      homeExpected += 0.22;
    }
    if (awayTeam.id === cup.hostId) {
      awayExpected += 0.22;
    }

    homeExpected = clamp(homeExpected, 0.25, 3.4);
    awayExpected = clamp(awayExpected, 0.25, 3.4);

    return {
      homeGoals: randomPoisson(homeExpected),
      awayGoals: randomPoisson(awayExpected)
    };
  }

  function simulateMatch(cup, matchId) {
    if (cup.groupStageLocked) {
      throw new Error("La fase de grupos está cerrada porque ya comenzaron las eliminatorias.");
    }

    recalculateCup(cup);

    var match = findMatch(cup, matchId);
    if (!match) {
      throw new Error("No se encontró el partido indicado.");
    }
    if (match.completed) {
      throw new Error("Ese partido ya tiene resultado. Puedes editarlo manualmente si quieres cambiarlo.");
    }

    var homeTeam = findParticipant(cup, match.homeId);
    var awayTeam = findParticipant(cup, match.awayId);
    var score = simulateScore(cup, homeTeam, awayTeam);

    setMatchResult(cup, match.id, score.homeGoals, score.awayGoals, "simulated");
    return match;
  }

  function getGroupStageProgress(cup) {
    var total = 0;
    var completed = 0;

    cup.groups.forEach(function (group) {
      group.matchdays.forEach(function (matchday) {
        matchday.matches.forEach(function (match) {
          total += 1;
          if (match.completed) {
            completed += 1;
          }
        });
      });
    });

    return {
      completed: completed,
      total: total,
      finished: total > 0 && completed === total
    };
  }

  function findNextPendingMatch(cup) {
    for (var day = 1; day <= 3; day += 1) {
      for (var g = 0; g < cup.groups.length; g += 1) {
        var matchday = cup.groups[g].matchdays[day - 1];
        for (var m = 0; m < matchday.matches.length; m += 1) {
          if (!matchday.matches[m].completed) {
            return matchday.matches[m];
          }
        }
      }
    }
    return null;
  }

  function simulateNextPendingMatch(cup) {
    var match = findNextPendingMatch(cup);
    if (!match) {
      return null;
    }
    return simulateMatch(cup, match.id);
  }

  function simulateAllPendingGroupStage(cup) {
    var simulated = 0;
    var next = findNextPendingMatch(cup);

    while (next) {
      simulateMatch(cup, next.id);
      simulated += 1;
      next = findNextPendingMatch(cup);
    }

    return simulated;
  }

  function getQualifiedTeams(cup) {
    recalculateCup(cup);

    if (!getGroupStageProgress(cup).finished) {
      return [];
    }

    var qualified = [];

    cup.groups.forEach(function (group) {
      group.standings.slice(0, 2).forEach(function (standing, index) {
        var team = findParticipant(cup, standing.id);
        qualified.push({
          group: group.name,
          position: index + 1,
          id: team.id,
          name: team.name,
          flag: team.flag,
          points: team.points,
          titles: team.titles || 0,
          tablePoints: standing.tablePoints,
          goalDifference: standing.goalDifference
        });
      });
    });

    return qualified;
  }

  function makeKnockoutMatch(index, homeId, awayId) {
    return {
      id: "R32-M" + (index + 1),
      homeId: homeId,
      awayId: awayId,
      homeGoals: null,
      awayGoals: null,
      penaltyHome: null,
      penaltyAway: null,
      winnerId: null,
      completed: false,
      source: null
    };
  }

  function createRoundOf32(cup) {
    if (!getGroupStageProgress(cup).finished) {
      throw new Error("Debes terminar la fase de grupos antes de crear los dieciseisavos.");
    }

    if (cup.knockout && Array.isArray(cup.knockout.roundOf32)) {
      return cup.knockout.roundOf32;
    }

    recalculateCup(cup);

    var winners = [];
    var runnersUp = [];
    cup.groups.forEach(function (group) {
      winners.push(group.standings[0].id);
      runnersUp.push(group.standings[1].id);
    });

    var matches = [];
    var pairStarts = [0, 2, 4, 6, 8, 10, 12, 14];

    pairStarts.forEach(function (start) {
      matches.push(makeKnockoutMatch(matches.length, winners[start], runnersUp[start + 1]));
    });

    pairStarts.forEach(function (start) {
      matches.push(makeKnockoutMatch(matches.length, winners[start + 1], runnersUp[start]));
    });

    cup.knockout = {
      roundOf32: matches
    };
    cup.groupStageLocked = true;
    recalculateCup(cup);
    return matches;
  }

  function validatePenaltyScore(home, away) {
    return Number.isInteger(home) && Number.isInteger(away) && home >= 0 && away >= 0 && home !== away;
  }

  function setKnockoutResult(cup, matchId, homeGoals, awayGoals, penaltyHome, penaltyAway, source) {
    var match = findKnockoutMatch(cup, matchId);
    if (!match) {
      throw new Error("No se encontró el partido de eliminación directa.");
    }

    var parsedHome = Number(homeGoals);
    var parsedAway = Number(awayGoals);

    if (!Number.isInteger(parsedHome) || !Number.isInteger(parsedAway) || parsedHome < 0 || parsedAway < 0) {
      throw new Error("El resultado debe usar goles enteros iguales o mayores que 0.");
    }

    var winnerId = null;
    var parsedPenaltyHome = null;
    var parsedPenaltyAway = null;

    if (parsedHome > parsedAway) {
      winnerId = match.homeId;
    } else if (parsedAway > parsedHome) {
      winnerId = match.awayId;
    } else {
      parsedPenaltyHome = Number(penaltyHome);
      parsedPenaltyAway = Number(penaltyAway);
      if (!validatePenaltyScore(parsedPenaltyHome, parsedPenaltyAway)) {
        throw new Error("Si el partido termina empatado, escribe una tanda de penales válida y sin empate.");
      }
      winnerId = parsedPenaltyHome > parsedPenaltyAway ? match.homeId : match.awayId;
    }

    match.homeGoals = parsedHome;
    match.awayGoals = parsedAway;
    match.penaltyHome = parsedPenaltyHome;
    match.penaltyAway = parsedPenaltyAway;
    match.winnerId = winnerId;
    match.completed = true;
    match.source = source || "manual";

    recalculateCup(cup);
    return match;
  }

  function simulatePenaltyShootout() {
    var home = 3 + Math.floor(Math.random() * 3);
    var away = 3 + Math.floor(Math.random() * 3);

    if (home === away) {
      if (Math.random() < 0.5) {
        home += 1;
      } else {
        away += 1;
      }
    }

    return {
      home: home,
      away: away
    };
  }

  function simulateKnockoutMatch(cup, matchId) {
    recalculateCup(cup);

    var match = findKnockoutMatch(cup, matchId);
    if (!match) {
      throw new Error("No se encontró el partido de eliminación directa.");
    }
    if (match.completed) {
      throw new Error("Ese partido ya tiene resultado.");
    }

    var homeTeam = findParticipant(cup, match.homeId);
    var awayTeam = findParticipant(cup, match.awayId);
    var score = simulateScore(cup, homeTeam, awayTeam);
    var penalties = { home: null, away: null };

    if (score.homeGoals === score.awayGoals) {
      penalties = simulatePenaltyShootout();
    }

    return setKnockoutResult(
      cup,
      match.id,
      score.homeGoals,
      score.awayGoals,
      penalties.home,
      penalties.away,
      "simulated"
    );
  }

  function getRoundOf32Progress(cup) {
    if (!cup.knockout || !Array.isArray(cup.knockout.roundOf32)) {
      return { completed: 0, total: 16, finished: false };
    }

    var completed = cup.knockout.roundOf32.filter(function (match) {
      return match.completed;
    }).length;

    return {
      completed: completed,
      total: cup.knockout.roundOf32.length,
      finished: completed === cup.knockout.roundOf32.length
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
      var teams = participants.slice(i * 4, i * 4 + 4);
      groups.push({
        name: "Grupo " + letters[i],
        teams: teams,
        matchdays: createGroupMatchdays(teams, i + 1),
        standings: teams.map(blankStanding)
      });
    }

    return {
      edition: 1,
      hostId: host.id,
      host: host,
      participants: participants,
      groups: groups,
      groupStageLocked: false,
      createdAt: new Date().toISOString()
    };
  }

  window.CopaChiguiTournament = {
    shuffle: shuffle,
    generateFirstCup: generateFirstCup,
    createGroupMatchdays: createGroupMatchdays,
    ensureCupData: ensureCupData,
    recalculateCup: recalculateCup,
    setMatchResult: setMatchResult,
    simulateMatch: simulateMatch,
    simulateNextPendingMatch: simulateNextPendingMatch,
    simulateAllPendingGroupStage: simulateAllPendingGroupStage,
    getGroupStageProgress: getGroupStageProgress,
    getQualifiedTeams: getQualifiedTeams,
    createRoundOf32: createRoundOf32,
    setKnockoutResult: setKnockoutResult,
    simulateKnockoutMatch: simulateKnockoutMatch,
    getRoundOf32Progress: getRoundOf32Progress,
    findParticipant: findParticipant,
    findMatch: findMatch,
    findKnockoutMatch: findKnockoutMatch
  };
}());
