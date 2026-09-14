(function () {
  var KNOCKOUT_ROUNDS = ["roundOf32", "roundOf16", "quarterfinals", "semifinals", "thirdPlace", "final"];

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
    var points = typeof team.points === "number" ? team.points : 100;
    var titles = typeof team.titles === "number" ? team.titles : 0;
    return {
      id: team.id,
      name: team.name,
      flag: team.flag,
      points: points,
      startingPoints: points,
      titles: titles,
      startingTitles: titles
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
    if (!cup.knockout) {
      return null;
    }

    for (var r = 0; r < KNOCKOUT_ROUNDS.length; r += 1) {
      var key = KNOCKOUT_ROUNDS[r];
      var matches = cup.knockout[key];
      if (!Array.isArray(matches)) {
        continue;
      }
      for (var i = 0; i < matches.length; i += 1) {
        if (matches[i].id === matchId) {
          return matches[i];
        }
      }
    }
    return null;
  }

  function normalizeKnockoutMatch(match, roundKey) {
    match.roundKey = match.roundKey || roundKey;
    if (typeof match.source === "undefined") {
      match.source = match.completed ? "manual" : null;
    }
    if (typeof match.penaltyHome === "undefined") {
      match.penaltyHome = null;
    }
    if (typeof match.penaltyAway === "undefined") {
      match.penaltyAway = null;
    }
    if (typeof match.winnerId === "undefined") {
      match.winnerId = null;
    }
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
      if (typeof team.startingTitles !== "number") {
        team.startingTitles = team.titles;
      }
    });

    cup.groups.forEach(function (group, groupIndex) {
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

    if (cup.knockout) {
      KNOCKOUT_ROUNDS.forEach(function (key) {
        if (Array.isArray(cup.knockout[key])) {
          cup.knockout[key].forEach(function (match) {
            normalizeKnockoutMatch(match, key);
          });
        }
      });
      if (Array.isArray(cup.knockout.roundOf32)) {
        cup.groupStageLocked = true;
      }
    }

    if (typeof cup.groupStageLocked !== "boolean") {
      cup.groupStageLocked = false;
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

  function getRoundMatches(cup, roundKey) {
    if (!cup.knockout || !Array.isArray(cup.knockout[roundKey])) {
      return [];
    }
    return cup.knockout[roundKey];
  }

  function applyKnockoutPoints(cup) {
    KNOCKOUT_ROUNDS.forEach(function (roundKey) {
      getRoundMatches(cup, roundKey).forEach(function (match) {
        if (!match.completed || !match.winnerId) {
          return;
        }
        var homeTeam = findParticipant(cup, match.homeId);
        var awayTeam = findParticipant(cup, match.awayId);
        if (!homeTeam || !awayTeam) {
          return;
        }
        var winner = match.winnerId === homeTeam.id ? homeTeam : awayTeam;
        var loser = match.winnerId === homeTeam.id ? awayTeam : homeTeam;
        winner.points += 2;
        loser.points -= 2;
      });
    });
  }

  function applyPodiumAndTitle(cup) {
    cup.championId = null;
    cup.runnerUpId = null;
    cup.thirdPlaceId = null;
    cup.completed = false;

    var finalMatches = getRoundMatches(cup, "final");
    var thirdMatches = getRoundMatches(cup, "thirdPlace");
    var finalMatch = finalMatches.length ? finalMatches[0] : null;
    var thirdMatch = thirdMatches.length ? thirdMatches[0] : null;

    if (finalMatch && finalMatch.completed && finalMatch.winnerId) {
      cup.championId = finalMatch.winnerId;
      cup.runnerUpId = finalMatch.winnerId === finalMatch.homeId ? finalMatch.awayId : finalMatch.homeId;
      var champion = findParticipant(cup, cup.championId);
      if (champion) {
        champion.titles += 1;
      }
    }

    if (thirdMatch && thirdMatch.completed && thirdMatch.winnerId) {
      cup.thirdPlaceId = thirdMatch.winnerId;
    }

    cup.completed = Boolean(finalMatch && finalMatch.completed && thirdMatch && thirdMatch.completed);
  }

  function syncGroupTeamRefs(cup) {
    cup.groups.forEach(function (group) {
      group.teams.forEach(function (team) {
        var participant = findParticipant(cup, team.id);
        if (participant) {
          team.points = participant.points;
          team.startingPoints = participant.startingPoints;
          team.titles = participant.titles;
          team.startingTitles = participant.startingTitles;
        }
      });
    });
  }

  function recalculateCup(cup) {
    cup.participants.forEach(function (team) {
      team.points = team.startingPoints;
      team.titles = team.startingTitles;
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
    applyPodiumAndTitle(cup);
    syncGroupTeamRefs(cup);
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
    return match ? simulateMatch(cup, match.id) : null;
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

  function makeKnockoutMatch(roundKey, code, index, homeId, awayId) {
    return {
      id: code + "-M" + (index + 1),
      roundKey: roundKey,
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
    cup.knockout = cup.knockout || {};
    if (Array.isArray(cup.knockout.roundOf32)) {
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
      matches.push(makeKnockoutMatch("roundOf32", "R32", matches.length, winners[start], runnersUp[start + 1]));
    });
    pairStarts.forEach(function (start) {
      matches.push(makeKnockoutMatch("roundOf32", "R32", matches.length, winners[start + 1], runnersUp[start]));
    });

    cup.knockout.roundOf32 = matches;
    cup.groupStageLocked = true;
    recalculateCup(cup);
    return matches;
  }

  function getRoundProgress(cup, roundKey) {
    var expected = {
      roundOf32: 16,
      roundOf16: 8,
      quarterfinals: 4,
      semifinals: 2,
      thirdPlace: 1,
      final: 1
    };
    var matches = getRoundMatches(cup, roundKey);
    if (!matches.length) {
      return { completed: 0, total: expected[roundKey] || 0, finished: false, created: false };
    }
    var completed = matches.filter(function (match) {
      return match.completed;
    }).length;
    return {
      completed: completed,
      total: matches.length,
      finished: completed === matches.length,
      created: true
    };
  }

  function roundWinners(cup, roundKey) {
    var progress = getRoundProgress(cup, roundKey);
    if (!progress.finished) {
      return [];
    }
    return getRoundMatches(cup, roundKey).map(function (match) {
      return match.winnerId;
    });
  }

  function createRoundOf16(cup) {
    cup.knockout = cup.knockout || {};
    if (Array.isArray(cup.knockout.roundOf16)) {
      return cup.knockout.roundOf16;
    }
    var winners = roundWinners(cup, "roundOf32");
    if (winners.length !== 16) {
      throw new Error("Debes terminar los 16 partidos de dieciseisavos antes de crear los octavos.");
    }

    var matches = [];
    for (var i = 0; i < 8; i += 1) {
      matches.push(makeKnockoutMatch("roundOf16", "R16", i, winners[i], winners[i + 8]));
    }
    cup.knockout.roundOf16 = matches;
    recalculateCup(cup);
    return matches;
  }

  function createQuarterfinals(cup) {
    cup.knockout = cup.knockout || {};
    if (Array.isArray(cup.knockout.quarterfinals)) {
      return cup.knockout.quarterfinals;
    }
    var winners = roundWinners(cup, "roundOf16");
    if (winners.length !== 8) {
      throw new Error("Debes terminar los octavos de final antes de crear los cuartos.");
    }

    var matches = [];
    for (var i = 0; i < 4; i += 1) {
      matches.push(makeKnockoutMatch("quarterfinals", "QF", i, winners[i * 2], winners[i * 2 + 1]));
    }
    cup.knockout.quarterfinals = matches;
    recalculateCup(cup);
    return matches;
  }

  function createSemifinals(cup) {
    cup.knockout = cup.knockout || {};
    if (Array.isArray(cup.knockout.semifinals)) {
      return cup.knockout.semifinals;
    }
    var winners = roundWinners(cup, "quarterfinals");
    if (winners.length !== 4) {
      throw new Error("Debes terminar los cuartos de final antes de crear las semifinales.");
    }

    var matches = [
      makeKnockoutMatch("semifinals", "SF", 0, winners[0], winners[1]),
      makeKnockoutMatch("semifinals", "SF", 1, winners[2], winners[3])
    ];
    cup.knockout.semifinals = matches;
    recalculateCup(cup);
    return matches;
  }

  function loserId(match) {
    if (!match.completed || !match.winnerId) {
      return null;
    }
    return match.winnerId === match.homeId ? match.awayId : match.homeId;
  }

  function createFinals(cup) {
    cup.knockout = cup.knockout || {};
    if (Array.isArray(cup.knockout.final) && Array.isArray(cup.knockout.thirdPlace)) {
      return {
        final: cup.knockout.final,
        thirdPlace: cup.knockout.thirdPlace
      };
    }

    var progress = getRoundProgress(cup, "semifinals");
    if (!progress.finished) {
      throw new Error("Debes terminar las semifinales antes de crear el tercer puesto y la final.");
    }

    var semis = getRoundMatches(cup, "semifinals");
    cup.knockout.thirdPlace = [
      makeKnockoutMatch("thirdPlace", "3P", 0, loserId(semis[0]), loserId(semis[1]))
    ];
    cup.knockout.final = [
      makeKnockoutMatch("final", "F", 0, semis[0].winnerId, semis[1].winnerId)
    ];
    recalculateCup(cup);
    return {
      final: cup.knockout.final,
      thirdPlace: cup.knockout.thirdPlace
    };
  }

  function isRoundLocked(cup, roundKey) {
    if (!cup.knockout) {
      return false;
    }
    if (roundKey === "roundOf32") {
      return Array.isArray(cup.knockout.roundOf16);
    }
    if (roundKey === "roundOf16") {
      return Array.isArray(cup.knockout.quarterfinals);
    }
    if (roundKey === "quarterfinals") {
      return Array.isArray(cup.knockout.semifinals);
    }
    if (roundKey === "semifinals") {
      return Array.isArray(cup.knockout.final) || Array.isArray(cup.knockout.thirdPlace);
    }
    return false;
  }

  function validatePenaltyScore(home, away) {
    return Number.isInteger(home) && Number.isInteger(away) && home >= 0 && away >= 0 && home !== away;
  }

  function setKnockoutResult(cup, matchId, homeGoals, awayGoals, penaltyHome, penaltyAway, source) {
    var match = findKnockoutMatch(cup, matchId);
    if (!match) {
      throw new Error("No se encontró el partido de eliminación directa.");
    }
    if (isRoundLocked(cup, match.roundKey)) {
      throw new Error("Esta ronda ya está cerrada porque la siguiente fase fue creada.");
    }

    var parsedHome = Number(homeGoals);
    var parsedAway = Number(awayGoals);
    if (!Number.isInteger(parsedHome) || !Number.isInteger(parsedAway) || parsedHome < 0 || parsedAway < 0) {
      throw new Error("El resultado debe usar goles enteros iguales o mayores que 0.");
    }

    var winnerId;
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
    return { home: home, away: away };
  }

  function simulateKnockoutMatch(cup, matchId) {
    recalculateCup(cup);
    var match = findKnockoutMatch(cup, matchId);
    if (!match) {
      throw new Error("No se encontró el partido de eliminación directa.");
    }
    if (isRoundLocked(cup, match.roundKey)) {
      throw new Error("Esta ronda ya está cerrada porque la siguiente fase fue creada.");
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

  function simulateAllPendingRound(cup, roundKey) {
    var matches = getRoundMatches(cup, roundKey);
    var simulated = 0;
    matches.forEach(function (match) {
      if (!match.completed) {
        simulateKnockoutMatch(cup, match.id);
        simulated += 1;
      }
    });
    return simulated;
  }

  function getPodium(cup) {
    recalculateCup(cup);
    return {
      champion: cup.championId ? findParticipant(cup, cup.championId) : null,
      runnerUp: cup.runnerUpId ? findParticipant(cup, cup.runnerUpId) : null,
      third: cup.thirdPlaceId ? findParticipant(cup, cup.thirdPlaceId) : null,
      completed: Boolean(cup.completed)
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
      championId: null,
      runnerUpId: null,
      thirdPlaceId: null,
      completed: false,
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
    createRoundOf16: createRoundOf16,
    createQuarterfinals: createQuarterfinals,
    createSemifinals: createSemifinals,
    createFinals: createFinals,
    setKnockoutResult: setKnockoutResult,
    simulateKnockoutMatch: simulateKnockoutMatch,
    simulateAllPendingRound: simulateAllPendingRound,
    getRoundProgress: getRoundProgress,
    getRoundMatches: getRoundMatches,
    isRoundLocked: isRoundLocked,
    getPodium: getPodium,
    findParticipant: findParticipant,
    findMatch: findMatch,
    findKnockoutMatch: findKnockoutMatch
  };
}());