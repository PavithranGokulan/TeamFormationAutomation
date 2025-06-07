import axios from "axios";
import React from "react";
import { Plus, MoreVertical, BookOpen, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/Dialog";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Folder } from "lucide-react";
import Sidebar from "@/components/ui/Sidebar";

export default function HomeScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    userid: "",
    name: "",
    email: "",
    cgpa: "",
    skills: [],
    interests: [],
    friends: [],
  });

  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let userid = null;
    if (token) {
      const decoded = jwtDecode(token);
      userid = decoded.userid;
      // console.log(userid);

      // Fetch user profile
      axios
        .get(`http://localhost:5000/api/profile/${userid}`)
        .then((response) => {
          // console.log(response.data);
          setUserInfo(response.data.user); // assuming response.data is the user object
        })
        .catch((error) => {
          console.error("Failed to fetch  profile:", error);
        });

      // Fetch user rooms
      axios
        .get(`http://localhost:5000/api/room/user/${userid}`)
        .then((res) => {
          // console.log("User rooms:", res.data);
          setClasses(res.data); // set room data to your state
        })
        .catch((err) => {
          console.error("Failed to fetch user rooms:", err);
        });
    }
  }, []);

  const images = [
    "/class1.png",
    "/class2.webp",
    "/class3.jpg",
    "/class4.jpg",
    "/class5.jpg",
  ];

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };

  const [createClassForm, setCreateClassForm] = useState({
    roomName: "",
    teacher: "",
    department: "",
    semester: "",
    year: "",
  });

  const [joinClassForm, setJoinClassForm] = useState({
    joinClassCode: "",
    rollno: "",
  });

  //Create class
  const handleCreateClass = async () => {
    try {
      const newClass = {
        roomName: createClassForm.roomName,
        teacher: createClassForm.teacher,
        description: `${createClassForm.department} - ${createClassForm.semester} - ${createClassForm.year}`,
        department: "TBD",
        year: createClassForm.year,
        image: getRandomImage(),
        userId: userInfo.userid,
      };
      await axios.post("http://localhost:5000/api/room/create", newClass);

      // ✅ Fetch the updated rooms list again after creation
      const res = await axios.get(
        `http://localhost:5000/api/room/user/${userInfo.userid}`
      );
      setClasses(res.data);
      setCreateClassForm({
        roomName: "",
        teacher: "",
        department: "",
        semester: "",
        year: "",
      });

      setShowCreateModal(false);
    } catch (error) {
      console.error("Full error object:", error);
      if (error.response) {
        console.error("Backend response error:", error.response.data);
        alert(
          `Failed to create class: ${
            error.response.data.message || "Unknown error"
          }`
        );
      } else {
        console.error("Error creating class:", error.message);
        alert("Failed to create class. Network or unknown error.");
      }
    }
  };

  const handleJoinClass = async () => {
    const { joinClassCode, rollno } = joinClassForm;

    if (!joinClassCode.trim() || !rollno.trim()) {
      alert("Please enter both class code and register number.");
      return;
    }

    try {
      const payload = {
        roomId: joinClassCode,
        userId: userInfo.userid,
        name: userInfo.name,
        rollno: rollno,
        email: userInfo.email,
      };
      // console.log("Payload:", payload);
      await axios.post("http://localhost:5000/api/room/join", payload);

      // ✅ Refresh the class list after successful join
      const res = await axios.get(
        `http://localhost:5000/api/room/user/${userInfo.userid}`
      );
      setClasses(res.data);

      // ✅ Reset the form and close modal
      setJoinClassForm({ joinClassCode: "", rollno: "" });
      setShowJoinModal(false);
    } catch (error) {
      console.error("Join class error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to join class. Try again later."
      );
    }
  };

  const handleMoreClick = (event, index) => {
    const rect = event.target.getBoundingClientRect();
    setMenuPosition({
      top: rect.top + rect.height + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setClassToDelete(index);
    setShowMoreMenu(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleSkillsChange = (e) => {
    setUserInfo({ ...userInfo, skills: e.target.value.split(", ") });
  };

  const handleInterestsChange = (e) => {
    setUserInfo({ ...userInfo, interests: e.target.value.split(", ") });
  };
  const handleFriendsChange = (e) => {
    setUserInfo({ ...userInfo, friends: e.target.value.split(", ") });
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        ...userInfo,
        // Split comma-separated strings into arrays
        skills: userInfo.skills
          .join(",")
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        interests: userInfo.interests
          .join(",")
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i),
        friends: userInfo.friends
          .join(",")
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f),
      };

      await axios.put(
        `http://localhost:5000/api/edit/${userInfo.userid}`,
        updatedData
      );
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

        {/* Right: Profile Icon */}
        <div className="flex items-center space-x-4">
          <User
            size={24}
            className="text-gray-600 cursor-pointer hover:text-indigo-600 transition"
            onClick={() => setShowProfileModal(true)}
            title="Profile"
          />
        </div>
      </header>

      <div className="flex">
        {/* Sticky Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 bg-white border-r shadow-sm sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar classes={classes} userInfo={userInfo} />
        </aside>

        <div className="flex-1 p-6">
          {classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
              <img src="/Empty.png" alt="No classes" className="w-64 h-64" />
              <h2 className="text-xl font-semibold text-gray-700">
                No classes yet
              </h2>
              <p className="text-gray-500">
                Click the{" "}
                <span className="text-blue-600 font-bold text-lg">+</span>{" "}
                button to create or join one
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {classes.map((cls, i) => (
                <Card
                  key={i}
                  onClick={() => {
                    // console.log("Class user id", cls.userId);
                    if (cls.userId === userInfo.userid) {
                      navigate(`/teacher-room/${cls.roomId}`);
                    } else {
                      navigate(`/student-room/${cls.roomId}`);
                    }
                  }}
                  className="bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-lg overflow-hidden relative cursor-pointer"
                >
                  <div className="h-32 w-full relative">
                    <img
                      src={cls.image}
                      alt="Class Banner"
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start p-4">
                      <h2 className="text-white text-xl font-semibold">
                        {cls.roomName}
                      </h2>
                      <div className="relative ml-auto z-50">
                        <MoreVertical
                          onClick={(event) => {
                            event.stopPropagation(); // ✅ Stops event from bubbling to Card
                            handleMoreClick(event, i);
                          }}
                          className="absolute top-4 right-4 text-white hover:text-gray-200 cursor-pointer z-50"
                        />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-0">
                    <p className="text-gray-700 text-sm mt-4">
                      {cls.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2">
        <div className="relative">
          <Button
            onClick={() => setShowMenu(!showMenu)}
            className={`rounded-full h-14 w-14 p-0 shadow-lg transition-transform duration-300 ${
              showMenu ? "rotate-45" : ""
            } bg-blue-600 hover:bg-indigo-700 text-white`}
          >
            <Plus size={28} />
          </Button>

          {showMenu && (
            <div className="absolute bottom-16 right-0 bg-white shadow-md rounded-md py-2 w-40 z-40">
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Create Class
              </button>
              <button
                onClick={() => {
                  setShowJoinModal(true);
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Join Class
              </button>
            </div>
          )}
        </div>
      </div>

      {/* More Menu (Delete / Close) */}
      {showMoreMenu && (
        <div
          className="absolute bg-white shadow-lg rounded-md py-2 z-50"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <button
            onClick={() => {
              setShowMoreMenu(false);
              setShowDeleteConfirmDialog(true);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Delete
          </button>
          <button
            onClick={() => setShowMoreMenu(false)}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      )}

      {/* Create Class Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              name="roomName"
              placeholder="Room Name"
              value={createClassForm.roomName}
              onChange={(e) =>
                setCreateClassForm({
                  ...createClassForm,
                  roomName: e.target.value,
                })
              }
            />

            <Input
              name="teacher"
              placeholder="Teacher Name"
              value={createClassForm.teacher}
              onChange={(e) =>
                setCreateClassForm({
                  ...createClassForm,
                  teacher: e.target.value,
                })
              }
            />
            <Input
              name="Department"
              placeholder="department"
              value={createClassForm.department}
              onChange={(e) =>
                setCreateClassForm({
                  ...createClassForm,
                  department: e.target.value,
                })
              }
            />
            <Input
              name="semester"
              placeholder="Semester"
              value={createClassForm.semester}
              onChange={(e) =>
                setCreateClassForm({
                  ...createClassForm,
                  semester: e.target.value,
                })
              }
            />
            <Input
              name="year"
              placeholder="Year"
              value={createClassForm.year}
              onChange={(e) =>
                setCreateClassForm({ ...createClassForm, year: e.target.value })
              }
            />
          </div>
          <div className="mt-4 text-right">
            <Button onClick={handleCreateClass}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Class Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              name="joinClassCode"
              placeholder="Class Code"
              value={joinClassForm.joinClassCode}
              onChange={(e) =>
                setJoinClassForm({
                  ...joinClassForm,
                  joinClassCode: e.target.value,
                })
              }
            />
            <Input
              name="rollno"
              placeholder="Register Number"
              value={joinClassForm.rollno}
              onChange={(e) =>
                setJoinClassForm({ ...joinClassForm, rollno: e.target.value })
              }
            />
          </div>
          <div className="mt-4 text-right">
            <Button onClick={handleJoinClass}>Join</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog
        open={showProfileModal}
        onOpenChange={(open) => {
          setShowProfileModal(open);
          if (!open) setIsEditing(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>

          <p className="text-gray-700">
            <strong>User ID:</strong> {userInfo.userid}
          </p>
          <br></br>
          <div className="space-y-4">
            {["name", "email", "cgpa"].map((field) => (
              <p key={field} className="text-gray-700">
                <strong>
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                </strong>{" "}
                {isEditing ? (
                  <Input
                    name={field}
                    value={userInfo[field]}
                    onChange={handleChange}
                  />
                ) : (
                  userInfo[field]
                )}
              </p>
            ))}

            <p className="text-gray-700">
              <strong>Domains / Areas of Expertise:</strong>{" "}
              {isEditing ? (
                <Input
                  name="skills"
                  value={userInfo.skills.join(", ")}
                  onChange={handleSkillsChange}
                  placeholder="Eg.,Web Development, App Development"
                />
              ) : (
                userInfo.skills.join(", ")
              )}
            </p>

            <p className="text-gray-700">
              <strong>Interests:</strong>{" "}
              {isEditing ? (
                <Input
                  name="Technologies & Tools"
                  value={userInfo.interests.join(", ")}
                  onChange={handleInterestsChange}
                  placeholder="Eg.,Python,Express.js,MongoDB,SQL"
                />
              ) : (
                userInfo.interests.join(", ")
              )}
            </p>

            <p className="text-gray-700">
              <strong>Friends:</strong>{" "}
              {isEditing ? (
                <Input
                  name="friends"
                  value={userInfo.friends.join(", ")}
                  onChange={handleFriendsChange}
                  placeholder="Enter user IDs separated by commas (,)"
                />
              ) : (
                userInfo.friends.join(", ")
              )}
            </p>
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              onClick={() => {
                // You can add token/session clearing here
                localStorage.removeItem("token");
                navigate("/");
                setShowProfileModal(false);
                console.log("User Logged Out");
                // Optional: redirect to login page if using routing
                // navigate("/login");
              }}
              className="bg-gray-500 text-white hover:bg-red-600 shadow-md"
            >
              Logout
            </Button>

            <Button
              onClick={isEditing ? handleSave : toggleEditMode}
              className="bg-gray-500 text-white shadow-md hover:bg-gray-700 hover:shadow-lg active:shadow-inner transition-shadow duration-200 ease-in-out"
            >
              {isEditing ? "Save" : "Edit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this class?
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                if (classToDelete !== null && classes[classToDelete]) {
                  const roomId = classes[classToDelete].roomId;

                  try {
                    await axios.delete(
                      `http://localhost:5000/api/room/delete/${roomId}`
                    );

                    // Remove class from local state if delete is successful
                    const updated = [...classes];
                    updated.splice(classToDelete, 1);
                    setClasses(updated);
                    setClassToDelete(null);
                    setShowDeleteConfirmDialog(false);
                  } catch (error) {
                    console.error("Error deleting class:", error);
                    alert("Failed to delete class. Please try again.");
                  }
                } else {
                  setShowDeleteConfirmDialog(false);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <footer className="bg-gray-100 text-center text-sm text-gray-500 py-4 mt-12 border-t">
        <div className="max-w-screen-xl mx-auto px-4">
          <p className="font-semibold text-gray-700">
            TeamTrio Studios - Empowering Education, Together.
          </p>
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
