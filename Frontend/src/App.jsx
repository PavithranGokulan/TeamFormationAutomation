// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./pages/HomeScreen";
import TeacherRoom from "./pages/TeacherRoom";
import StudentRoom from "./pages/StudentRoom";
import Login from "./authentication/Login";
import Signup from "./authentication/Signup";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <Router>
      <ToastContainer position="top-right" />
      <Routes>
        <Route
          path="/HomePage"
          element={
            <ProtectedRoute>
              {" "}
              <HomeScreen />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-room/:roomId"
          element={
            <ProtectedRoute>
              <TeacherRoom />{" "}
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-room/:roomId"
          element={
            <ProtectedRoute>
              {" "}
              <StudentRoom />{" "}
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}
