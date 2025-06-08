import React from "react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [formData, setFormData] = useState({
    userid: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://teamformationautomation-backend.onrender.com/api/auth/login",
        formData
      );
      console.log(response);
      if (response.status == 200) {
        toast.success("Login successful!", {
          position: "top-right", // Customize the position as needed
          autoClose: 5000, // Time to auto-close in milliseconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progressStyle: { background: "blue" }, // Optional: Customize progress bar
        });
      }

      // optionally save token or user info here
      localStorage.setItem("token", response.data.token);

      navigate("/HomePage"); // redirect to home/dashboard
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert("Invalid credentials");
    }
  };

  return (
    <>
      <header className="bg-white text-gray-900 flex items-center px-6 py-4 shadow-md sticky top-0 z-50">
        <BookOpen size={32} className="mr-3 text-indigo-600" />
        <h1 className="text-2xl font-bold">LearningRoom</h1>
      </header>

      <div className="min-h-screen flex items-center justify-center bg-blue-100">
        <div className="bg-white p-8 w-full max-w-md rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Login
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              type="userid"
              placeholder="Enter User Id"
              name="userid"
              value={formData.userid}
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button
              className="w-full bg-gray-500 hover:bg-gray-600 text-white 
          shadow-md hover:shadow-lg active:shadow-inner
          transition-shadow duration-200 ease-in-out"
            >
              Login
            </Button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-600">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
