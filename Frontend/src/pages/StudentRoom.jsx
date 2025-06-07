import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Sidebar from "@/components/ui/Sidebar";

export default function StudentRoom() {
  const [classworkTasks, setClassworkTasks] = useState({});
  const [currentTab, setCurrentTab] = useState("Teams");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [teamData, setTeamData] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [roomInfo, setRoomInfo] = useState({
    roomName: "",
    teacherName: "",
  });

  const url = "https://teamformationautomation-backend.onrender.com";

  const { roomId } = useParams();
  const [classes, setClasses] = useState([]);

  // Keep edit state per team
  const [editingTeam, setEditingTeam] = useState(null);
  const [tempTeamName, setTempTeamName] = useState("");
  const [students, setStudents] = useState([]);
  const [openPurpose, setOpenPurpose] = useState(null);
  const [userInfo, setUserInfo] = useState({
    userid: "",
    name: "",
    email: "",
    cgpa: "",
    skills: [],
    interests: [],
    friends: [],
  });

  // Handle edit button click
  const startEditing = () => {
    if (!myTeamData) return;
    setEditingTeam(myTeamData.purpose);
    setTempTeamName(teamNames[myTeamData.purpose] || "");
  };

  // Handle save edited name
  const saveTeamName = () => {
    if (tempTeamName.trim() === "") return; // Don't save empty name
    setTeamNames((prev) => ({
      ...prev,
      [editingTeam]: tempTeamName.trim(),
    }));
    setEditingTeam(null);
  };

  // Handle cancel editing
  const cancelEditing = () => {
    setEditingTeam(null);
    setTempTeamName("");
  };
  useEffect(() => {
    if (roomId) {
      fetchClassworkTasks();
      // Fetch room details (students, room name, teacher)
      axios
        .get(`${url}/api/room/${roomId}`)
        .then((res) => {
          const data = res.data;

          // Set students if on "People" tab
          setStudents(data.students || []);

          // Set room name and teacher name for header
          setRoomInfo({
            roomName: data.roomName || "",
            teacherName: data.teacher || "",
          });
        })
        .catch((err) => {
          console.error("Failed to fetch room info", err);
        })
        .finally(() => {
          if (currentTab === "People") setLoadingStudents(false);
        });

      // Fetch team data when on Teams tab
      if (currentTab === "Teams") {
        fetchExistingTeams();
      }
    }
  }, [currentTab, roomId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const userid = decoded.userid;

      axios
        .get(`${url}/api/profile/${userid}`)
        .then((response) => {
          // console.log(response.data);
          setUserInfo(response.data.user); // assuming response.data is the user object
        })
        .catch((error) => {
          console.error("Failed to fetch  profile:", error);
        });

      axios
        .get(`${url}/api/room/user/${userid}`)
        .then((res) => {
          setClasses(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch user rooms:", err);
        });
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }, []);

  const fetchClassworkTasks = async () => {
    try {
      const res = await fetch(`${url}/api/tasks/${roomId}`);
      const data = await res.json();
      setClassworkTasks(data); // Make sure this matches your backend response
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchExistingTeams = async () => {
    try {
      const response = await axios.get(`${url}/api/team/${roomId}`);
      const teams = response.data.allteams;

      // Group by purposeType:purpose
      const grouped = teams.reduce((acc, team) => {
        const key = `${team.purpose}`; // You can add purposeType prefix if needed
        if (!acc[key]) acc[key] = [];
        acc[key].push(team);
        return acc;
      }, {});

      setTeamData(grouped);
    } catch (error) {
      console.error("Error fetching teams:", error);
      alert("Failed to load existing teams.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
        {/* Left: Logo & Home */}
        <Link
          to="/HomePage"
          className="flex items-center gap-2 group"
          title="Go to Home"
        >
          <BookOpen
            size={28}
            className="text-indigo-600 group-hover:rotate-6 transition-transform duration-300"
          />
          <span className="text-2xl font-bold text-gray-800 group-hover:text-indigo-700 underline underline-offset-4 decoration-indigo-500">
            LearningRoom
          </span>
        </Link>
      </header>

      {/* Blue Banner with Room Code */}
      <div className="w-full bg-blue-600 flex justify-between items-center px-6 py-4 text-white sticky top-[64px] z-50">
        <div>
          <h1 className="text-2xl font-bold">Operating System</h1>
          <h2 className="text-lg">Student View</h2>
        </div>
        <div
          className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg shadow-md cursor-pointer select-none"
          onClick={() => {
            navigator.clipboard.writeText(roomId);
            alert("Room code copied: " + roomId);
          }}
        >
          <span className="font-semibold">Room Code: {roomId}</span>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-1" style={{ minHeight: "calc(100vh - 112px)" }}>
        {/* Sticky Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 bg-white border-r shadow-sm sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar classes={classes} userInfo={userInfo} />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex justify-start items-center mb-6">
            <div className="flex space-x-6">
              {["Classwork", "Teams", "People"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-2 pb-2 text-lg ${
                    currentTab === tab
                      ? "border-b-2 border-black font-semibold text-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Main Card */}
          <div className="p-6 bg-white rounded-2xl shadow-md space-y-6">
            <AnimatePresence mode="wait">
              {currentTab === "Classwork" && (
                <motion.div
                  key="Classwork"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Classwork
                  </h2>

                  {Object.keys(classworkTasks).length === 0 ? (
                    <p className="text-gray-500 text-center">
                      No tasks created yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {Object.keys(classworkTasks)
                        .reverse()
                        .map((taskKey) => {
                          const task = classworkTasks[taskKey];

                          return (
                            <div
                              key={taskKey}
                              className="bg-gray-100 p-4 rounded-lg"
                            >
                              <div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                  {task.type === "file" && task.fileUrl && (
                                    <a
                                      href={task.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 underline text-sm"
                                    >
                                      {task.filename}
                                    </a>
                                  )}

                                  {task.type === "text" && (
                                    <p className="text-gray-700 text-sm mt-1">
                                      {task.content}
                                    </p>
                                  )}
                                </h2>

                                <p className="text-gray-500 text-xs mt-1">
                                  {new Date(task.createdAt)
                                    .toLocaleString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    })
                                    .replace(",", "")}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </motion.div>
              )}

              {currentTab === "Teams" && (
                <motion.div
                  key="Teams"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Teams</h2>
                  {Object.keys(teamData).length === 0 && (
                    <p className="text-gray-500 text-center">
                      No teams formed yet. Wait for the Teacher to create
                      Teacher.
                    </p>
                  )}
                  {Object.entries(teamData).map(([purpose, teams]) => (
                    <div
                      key={purpose}
                      className="mb-6 rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md bg-white"
                    >
                      <div
                        className="flex justify-between items-center p-4 cursor-pointer bg-gray-100 rounded-t-lg hover:bg-gray-200 transition-colors duration-200"
                        onClick={() =>
                          setOpenPurpose(
                            openPurpose === purpose ? null : purpose
                          )
                        }
                      >
                        <h3 className="text-lg font-semibold text-gray-800">
                          {purpose}
                        </h3>
                        <span className="text-gray-600 text-xl">
                          {openPurpose === purpose ? "▲" : "▼"}
                        </span>
                      </div>

                      {openPurpose === purpose && (
                        <div className="divide-y divide-gray-100 px-4 py-2">
                          {teams.map((team, idx) => (
                            <div key={team._id || idx} className="py-4">
                              <h4 className="font-medium text-blue-700 text-base mb-1">
                                {team.teamName || `Team ${idx + 1}`}
                              </h4>
                              <ul className="ml-5 list-disc text-gray-700 text-sm space-y-0.5">
                                {team.students.map((student) => (
                                  <li key={student._id}>{student.name}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {currentTab === "People" && (
                <motion.div
                  key="People"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-600"
                >
                  <h2 className="text-2xl font-bold mb-4">People</h2>

                  {loadingStudents ? (
                    <p>Loading students...</p>
                  ) : students.length > 0 ? (
                    <ul className="space-y-2">
                      {students.map((student) => (
                        <li
                          key={student._id}
                          className="border p-3 rounded-md shadow-sm bg-white"
                        >
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-gray-500">
                            {student.rollno}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No students found.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
