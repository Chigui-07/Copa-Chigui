(function () {
  var api = window.CopaChiguiTournament;
  if (!api || api.__hostAlwaysA1) {
    return;
  }

  var originalGenerateFirstCup = api.generateFirstCup;

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
      worldPoints: typeof team.points === "number" ? team.points : 100
    };
  }

  function rebuildGroup(group, groupIndex) {
    group.matchdays = api.createGroupMatchdays(group.teams, groupIndex + 1);
    group.standings = group.teams.map(blankStanding);
  }

  api.generateFirstCup = function (allTeams) {
    var cup = originalGenerateFirstCup(allTeams);
    if (!cup || !cup.groups || !cup.groups.length || !cup.hostId) {
      return cup;
    }

    var groupA = cup.groups[0];
    var hostGroupIndex = -1;
    var hostSlotIndex = -1;

    cup.groups.some(function (group, groupIndex) {
      return group.teams.some(function (team, teamIndex) {
        if (team.id !== cup.hostId) {
          return false;
        }
        hostGroupIndex = groupIndex;
        hostSlotIndex = teamIndex;
        return true;
      });
    });

    if (hostGroupIndex === -1 || hostSlotIndex === -1) {
      return cup;
    }

    if (hostGroupIndex === 0 && hostSlotIndex === 0) {
      return cup;
    }

    var hostGroup = cup.groups[hostGroupIndex];
    var hostTeam = hostGroup.teams[hostSlotIndex];
    var displacedTeam = groupA.teams[0];

    groupA.teams[0] = hostTeam;
    hostGroup.teams[hostSlotIndex] = displacedTeam;

    rebuildGroup(groupA, 0);
    if (hostGroupIndex !== 0) {
      rebuildGroup(hostGroup, hostGroupIndex);
    }

    cup.hostSlot = "A1";
    return cup;
  };

  api.__hostAlwaysA1 = true;
}());
