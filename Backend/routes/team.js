const express = require("express");
const router = express.Router();
const Team = require("../models/room_team");

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function groupTeams(members, teamSize) {
  const teams = {};
  let teamIndex = 1;
  for (let i = 0; i < members.length; i += teamSize) {
    teams[`Team ${teamIndex++}`] = members.slice(i, i + teamSize);
  }
  return teams;
}

function balanceByCGPA(students) {
  const sorted = [...students].sort((a, b) => b.cgpa - a.cgpa);
  const result = [];
  let left = 0, right = sorted.length - 1;
  while (left <= right) {
    if (left !== right) {
      result.push(sorted[left], sorted[right]);
    } else {
      result.push(sorted[left]);
    }
    left++;
    right--;
  }
  return result;
}

function buildFriendGroups(students) {
  const graph = {};
  const visited = new Set();
  const userIdToStudent = Object.fromEntries(students.map(s => [s.userid, s]));

  // Create a graph of friendships using userid
  students.forEach(student => {
    const friendUserIds = (student.friends || [])
      .map(f => f.userid)
      .filter(id => userIdToStudent[id]);
    graph[student.userid] = friendUserIds;
  });

  const groups = [];

  function dfs(userid, group) {
    if (visited.has(userid)) return;
    visited.add(userid);
    group.push(userIdToStudent[userid]);
    for (const neighbor of graph[userid] || []) {
      dfs(neighbor, group);
    }
  }

  for (const student of students) {
    if (!visited.has(student.userid)) {
      const group = [];
      dfs(student.userid, group);
      if (group.length > 0) {
        groups.push(group);
      }
    }
  }

  const groupedUserIds = new Set(groups.flat().map(s => s.userid));
  const leftovers = students.filter(s => !groupedUserIds.has(s.userid));

  if (leftovers.length > 0) {
    groups.push(leftovers); 
  }

  return groups;
}

function groupFriendsTogether(students, teamSize) {
  const friendGroups = buildFriendGroups(students);
  const finalTeams = [];
  let buffer = [];

  for (const group of friendGroups) {
    for (const member of group) {
      buffer.push(member);
      if (buffer.length === teamSize) {
        finalTeams.push([...buffer]);
        buffer = [];
      }
    }
  }

  // ✅ Ensure remaining members are still grouped
  if (buffer.length > 0) {
    finalTeams.push([...buffer]);
  }

  // ✅ If only one team with 1 member — likely all were unmatched — group manually
  if (finalTeams.length === 1 && finalTeams[0].length === 1 && students.length > 1) {
    finalTeams.length = 0; // clear previous
    const shuffled = shuffleArray(students); // randomize grouping if needed
    for (let i = 0; i < shuffled.length; i += teamSize) {
      finalTeams.push(shuffled.slice(i, i + teamSize));
    }
  }

  return finalTeams.reduce((acc, team, idx) => {
    acc[`Team ${idx + 1}`] = team;
    return acc;
  }, {});
}


function combineBalanceStrategies(students, teamSize, criteria) {
  let result = [...students];

  if (criteria.includes("cgpa")) {
    result = balanceByCGPA(result);
  }

  if (criteria.includes("friends")) {
    return groupFriendsTogether(result, teamSize);
  }

  if (criteria.includes("skills")) {
    // Placeholder for future implementation
    result = shuffleArray(result);
  }

  if (criteria.includes("random")) {
    result = shuffleArray(result);
  }

  return groupTeams(result, teamSize);
}

// Main route
router.post("/segregate", async(req, res) => {
  try {
    const { roomId, purpose_type, purpose, teamSize, segregateBy, students } = req.body;
    // console.log("constraint:",segregateBy);
    // console.log(students);

    if (!roomId || !purpose || !teamSize || !segregateBy || !students || !Array.isArray(students)) {
      return res.status(400).json({ error: "Invalid input format" });
    }

    const existingTeam = await Team.findOne({ roomId, purpose });
    if (existingTeam) {
      return res.status(409).json({ error: "Purpose already exists" });
    }

    // ✅ Check if any student has friends
    const hasFriends = students.some(student => Array.isArray(student.friends) && student.friends.length > 0);
    if (segregateBy.includes("friends") && !hasFriends) {
      return res.status(400).json({ error: "Ask students to add friends in profile" });
    }

    const teams = combineBalanceStrategies(students, teamSize, segregateBy);
    const teamDocs = []; 
    for (const [teamName, members] of Object.entries(teams)) {
      const teamId = `${purpose}_${teamName}`;
      try{
      const newTeam = new Team({
        roomId,
        purpose_type,
        purpose,             // Save purpose here
        teamId,
        teamName,
        students: members,
        works: [],
      });
      await newTeam.save();
      // console.log("Saved to Database");
      teamDocs.push(newTeam);
    }catch (err) {
    console.error("Error saving team:", teamName, err);
    return res.status(500).json({ error: "Failed to save one or more teams", details: err.message });
  }
}
    return res.status(201).json({ message: "Teams created", teams: teamDocs });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// To get the List of teams in Room
router.get('/:roomId', async (req, res) => {
  try {
    const allteams = await Team.find({ roomId: req.params.roomId });
    return res.status(200).json({ allteams });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch purposes", details: err.message });
  }
});

//To display teams for specific purpose
router.get('/:roomId/:purpose', async (req, res) => {
  const { roomId, purpose } = req.params;

  try {
    const teams = await Team.find({ roomId, purpose });
    return res.status(200).json({ teams });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch teams", details: err.message });
  }
});

// Update team name
router.put("/update-teamname/:teamId", async (req, res) => {
  const { teamId } = req.params;
  const { newTeamName } = req.body;

  try {
    const team = await Team.findOne({ teamId });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const updatedTeamId = `${team.purpose}_${newTeamName}`;

    const existingTeam = await Team.findOne({ teamId: updatedTeamId });
    if (existingTeam && existingTeam.teamId !== teamId) {
      return res.status(409).json({ message: "A team with this name already exists for this purpose" });
    }

    team.teamName = newTeamName;
    team.teamId = updatedTeamId;

    await team.save();

    res.status(200).json({ message: "Team name updated successfully", updatedTeam: team });

  } catch (error) {
    console.error("Error updating team name:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
