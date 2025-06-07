import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Folder, Copy, Bold } from "lucide-react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Sidebar from "@/components/ui/Sidebar";
import { toast } from "react-toastify";
import { supabase } from "../supabaseClient";

export default function TeacherRoom() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [showFormTeamModal, setShowFormTeamModal] = useState(false);
  // const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [teamSize, setTeamSize] = useState(2);
  const [purposeType, setPurposeType] = useState("Assignment");
  const [purposeName, setPurposeName] = useState("");
  const [constraints, setConstraints] = useState({
    cgpa: false,
    skills: false,
    friends: false,
    random: false,
  });
  const [classes, setClasses] = useState([]);
  const [teamData, setTeamData] = useState({});
  const [classworkTasks, setClassworkTasks] = useState([]);
  const [currentTab, setCurrentTab] = useState("Teams");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [roomInfo, setRoomInfo] = useState({
    roomName: "",
    teacherName: "",
  });
  const [selectedType, setSelectedType] = useState("text");
  const [taskText, setTaskText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [openPurpose, setOpenPurpose] = useState(null);

  const url = "https://teamformationautomation-backend.onrender.com";

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room code copied!");
  };

  const [userInfo, setUserInfo] = useState({
    userid: "",
    name: "",
    email: "",
    cgpa: "",
    skills: [],
    interests: [],
    friends: [],
  });

  //Load Stuents from backend
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

  const handleFormTeams = async (e) => {
    e.preventDefault();

    if (!purposeName.trim()) {
      toast.alert("Please enter the name of the assignment/project/hackathon.");
      return;
    }
    if (!students || students.length === 0) {
      toast.error("No students in your class.");
      return;
    }

    // Extract selected constraints as array
    const segregateBy = Object.entries(constraints)
      .filter(([key, value]) => value)
      .map(([key]) => key);
    try {
      const response = await axios.post(`${url}/api/team/segregate`, {
        roomId,
        purpose_type: purposeType,
        purpose: purposeName,
        teamSize,
        segregateBy,
        students,
      });
      console.log(response.status);
      if (response.status == 201) {
        toast.success("Teams Formed Successfully");
      }
      const backendTeams = response.data.teams;

      const purposeKey = `${purposeType}: ${purposeName}`;
      const groupedByPurpose = backendTeams.reduce((acc, team) => {
        const key = `${purposeType}: ${team.purpose}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(team); // store the whole team object, not just students
        return acc;
      }, {});
      setTeamData((prev) => ({
        ...prev,
        ...groupedByPurpose,
      }));

      // Reset form
      setShowFormTeamModal(false);
      setPurposeType("Assignment");
      setPurposeName("");
      setTeamSize(2);
      setConstraints({
        cgpa: false,
        skills: false,
        friends: false,
        random: false,
      });
    } catch (err) {
      console.error("Failed to form teams:", err);
      const errorMsg = err.response?.data?.error;

      if (errorMsg === "Ask students to add friends in profile") {
        toast.error("Ask students to add friends in profile.");
      } else if (errorMsg === "Purpose already exists") {
        toast.error(
          "Purpose already exists. Please choose a different purpose."
        );
      } else {
        toast.error("Something went wrong while forming teams.");
      }
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

  const handleButtonClick = () => {
    if (currentTab === "Teams") setShowFormTeamModal(true);
    else if (currentTab === "Classwork") setShowAddTaskModal(true);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    const trimmedTask = newTaskDesc.trim();
    if (!trimmedTask) {
      alert("Please enter a valid task description.");
      return;
    }
    setClassworkTasks((prev) => {
      if (prev[trimmedTask]) {
        toast.alert("This task already exists.");
        return prev;
      }
      return { ...prev, [trimmedTask]: true };
    });
    setNewTaskDesc("");
    setShowAddTaskModal(false);
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmed) {
      toast.warn("Task deletion cancelled.");
      return;
    }

    try {
      await axios.delete(
        `${url}/api/room/taskdelete/${roomId}/tasks/${taskId}`
      );

      // Remove from UI immediately
      setClassworkTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskId)
      );

      toast.success("Task Deleted successfully.");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    }
  };

  //Upload Tasks
  const handleClassworkSubmit = async (e) => {
    e.preventDefault();

    if (!roomInfo?.teacherName) {
      alert("Teacher name is missing.");
      return;
    }

    let payload = {
      roomId,
      sender: roomInfo.teacherName,
      type: selectedType,
    };

    if (selectedType === "text") {
      if (!taskText.trim()) {
        alert("Please enter a task description.");
        return;
      }
      payload.text = taskText.trim();
    } else {
      if (!selectedFile) {
        alert("Please select a file to upload.");
        return;
      }

      const fileName = `${Date.now()}-${selectedFile.name}`;

      const { data, error } = await supabase.storage
        .from("teamformationautomationfiles") // Your Supabase bucket
        .upload(fileName, selectedFile);

      if (error) {
        console.error("Supabase upload error:", error.message);
        alert("File upload failed.");
        return;
      }

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("teamformationautomationfiles")
          .createSignedUrl(fileName, 60); // URL valid for 60 seconds

      if (signedUrlError) {
        console.error("Error creating signed URL:", signedUrlError.message);
        alert("Failed to generate file URL.");
        return;
      }

      payload.fileUrl = signedUrlData.signedUrl;
      payload.fileName = selectedFile.name;
    }

    try {
      const response = await axios.post(`${url}/api/tasks/send`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("Task added successfully.");
      setTaskText("");
      setSelectedFile(null);
      await fetchClassworkTasks();
    } catch (error) {
      console.error("Failed to upload task:", error);
      toast.error("Failed to upload task.");
    }
  };

  const fetchClassworkTasks = async () => {
    try {
      const res = await fetch(`${url}/api/tasks/${roomId}`);
      const data = await res.json();
      // console.log("Fetched Tasks", data);
      setClassworkTasks(data); // Make sure this matches your backend response
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
          <h1 className="text-2xl font-bold">
            {roomInfo.roomName || "Loading..."}
          </h1>
          <h2 className="text-lg">
            Teacher: {roomInfo.teacherName || "Loading..."}
          </h2>
        </div>
        <div
          className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg shadow-md cursor-pointer"
          onClick={copyRoomId}
        >
          <span className="font-semibold">Room Code: {roomId}</span>
          <Copy size={18} />
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-1" style={{ minHeight: "calc(100vh - 112px)" }}>
        {/* Sticky Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 bg-white border-r shadow-sm sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar classes={classes} userInfo={userInfo} />
        </aside>

        {/* Main Content */}
        <div className="w-full max-w-6xl mx-auto p-6">
          {/* Tabs & Button */}
          <div className="flex items-center justify-between mb-6">
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

            {currentTab === "Teams" && (
              <button
                onClick={handleButtonClick}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg mr-[210px]"
              >
                {currentTab === "Classwork" ? "Add Task" : "Form Team"}
              </button>
            )}
          </div>

          {/* Content Panels */}
          <div className="max-w-4xl ml-0 p-6 bg-white rounded-2xl shadow-md space-y-6 min-h-[300px]">
            <AnimatePresence mode="wait">
              {currentTab === "Classwork" && (
                <motion.div
                  key="Classwork"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Classwork
                  </h2>

                  {/* Form for sending classwork */}
                  <form
                    onSubmit={handleClassworkSubmit}
                    className="space-y-4 bg-white p-4 rounded-lg shadow"
                    encType="multipart/form-data"
                  >
                    {/* Dropdown for task type */}
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="text">Text Task</option>
                      <option value="file">Upload Document</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Enter a task description"
                      value={taskText}
                      onChange={(e) => setTaskText(e.target.value)}
                      style={{
                        display: selectedType === "text" ? "block" : "none",
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />

                    {/* File input (always rendered, conditionally shown) */}
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      style={{
                        display: selectedType === "file" ? "block" : "none",
                      }}
                      className="w-full"
                    />

                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Upload Task
                    </button>
                  </form>

                  {/* Display Tasks */}
                  {Object.keys(classworkTasks).length === 0 ? (
                    <p className="text-gray-500 text-center">
                      No tasks created yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {Object.keys(classworkTasks).length === 0 ? (
                        <p className="text-gray-500 text-center">
                          No tasks created yet.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {[...classworkTasks].reverse().map((task) => {
                            return (
                              <div
                                key={task._id}
                                className="bg-gray-100 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0"
                              >
                                <div>
                                  {/* <h3 className="text-lg font-semibold text-gray-800">
                                    {task.sender}
                                  </h3> */}

                                  <div className="w-full">
                                    {task.type === "file" && task.fileUrl && (
                                      <strong>
                                        <a
                                          href={task.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 underline text-sm block break-all"
                                        >
                                          {task.filename}
                                        </a>
                                      </strong>
                                    )}

                                    {task.type === "text" && (
                                      <p className="text-sm font-bold text-gray-900 mt-1 break-words whitespace-pre-wrap w-full">
                                        {task.content}
                                      </p>
                                    )}
                                  </div>
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

                                <button
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="text-red-600 hover:text-red-800 font-bold px-2 py-1 rounded border border-red-600"
                                  aria-label={`Delete task ${task._id}`}
                                >
                                  Delete
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
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
                      No teams formed yet. Use the "Form Team" button to create
                      teams.
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
        </div>
      </div>

      {/* Form Team Modal */}
      <Dialog open={showFormTeamModal} onOpenChange={setShowFormTeamModal}>
        <DialogContent className="max-w-lg p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Form Teams</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleFormTeams}
            className="space-y-6 mt-6"
            aria-label="Form to create teams"
          >
            <div className="space-y-1">
              <label htmlFor="teamSize" className="font-semibold">
                Team Size (Min:2)
              </label>
              <input
                type="number"
                id="teamSize"
                min={2}
                max={100}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full rounded border px-3 py-2"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="purposeType" className="font-semibold">
                Purpose Type
              </label>
              <select
                id="purposeType"
                value={purposeType}
                onChange={(e) => setPurposeType(e.target.value)}
                className="w-full rounded border px-3 py-2"
              >
                <option value="Assignment">Assignment</option>
                <option value="Project">Project</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="purposeName" className="font-semibold">
                Name of Assignment/Project/Hackathon
              </label>
              <input
                type="text"
                id="purposeName"
                placeholder="Enter name here"
                value={purposeName}
                onChange={(e) => setPurposeName(e.target.value)}
                className="w-full rounded border px-3 py-2"
                required
              />
            </div>

            <fieldset className="space-y-1">
              <legend className="font-semibold">Constraints</legend>
              {[
                { id: "cgpa", label: "CGPA" },
                { id: "skills", label: "Skills" },
                { id: "friends", label: "Friends" },
                { id: "random", label: "Random" },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={id}
                    checked={constraints[id]}
                    onChange={() =>
                      setConstraints((prev) => ({
                        ...prev,
                        [id]: !prev[id],
                      }))
                    }
                  />
                  <label htmlFor={id}>{label}</label>
                </div>
              ))}
            </fieldset>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowFormTeamModal(false)}
                className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
              >
                Form Teams
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Task Modal
      <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
        <DialogContent className="max-w-md p-8 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-6 mt-6">
            <div className="space-y-1">
              <label htmlFor="taskDesc" className="font-semibold">
                Task Description
              </label>
              <input
                type="text"
                id="taskDesc"
                placeholder="Enter task description"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                className="w-full rounded border px-3 py-2"
                required
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
              >
                Add Task
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
