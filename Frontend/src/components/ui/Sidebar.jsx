import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Folder } from "lucide-react";

export default function Sidebar({ classes, userInfo }) {
  const navigate = useNavigate();
  const { roomId: currentRoomId } = useParams();

  return (
    <aside className="w-64 h-screen border-r bg-white shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4 border-b">
        <Folder className="text-indigo-600" />
        <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
          Your Classes
        </h1>
      </div>

      <nav className="overflow-y-auto h-[calc(100%-64px)] px-2 py-4 space-y-1">
        {classes.length === 0 ? (
          <div className="text-center px-4 py-12 text-gray-500">
            {/* <img
              src="/no-classes.svg"
              alt="No Classes"
              className="mx-auto mb-4 w-24 h-24 opacity-80"
            /> */}
            <p className="text-sm font-medium">No classes available yet</p>
            <p className="text-xs mt-1">
              Use the + button to create or join one
            </p>
          </div>
        ) : (
          classes.map((cls, idx) => {
            const isTeacher = cls.userId === userInfo.userid;
            const isStudent = cls.students?.some(
              (s) => s.userId === userInfo.userid
            );
            const isActive = cls.roomId === currentRoomId;

            const handleNavigation = () => {
              if (isTeacher) {
                navigate(`/teacher-room/${cls.roomId}`);
              } else if (isStudent) {
                navigate(`/student-room/${cls.roomId}`);
              } else {
                alert("You are not a part of this room.");
              }
            };

            return (
              <button
                type="button"
                key={idx}
                onClick={handleNavigation}
                className={`group flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-800 border-l-4 border-indigo-500"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-medium truncate">
                    {cls.roomName || "Unnamed Class"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {cls.description || "No description"}
                  </div>
                </div>
                {isTeacher && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                    Teacher
                  </span>
                )}
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
}
