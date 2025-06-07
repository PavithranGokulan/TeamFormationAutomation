import React from "react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    userid: "",
    regNo: "",
    email: "",
    password: "",
    cgpa: "",
    interests: "",
    skills: "",
  });

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
        "https://teamformationautomation-backend.onrender.com/api/auth/signup",
        formData
      );
      TableRowsSplit.success("Account created successfully!");
      navigate("/");

      console.log(response.data);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed.");
      navigate("/");
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
          <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              placeholder="User Id"
              name="userid"
              value={formData.userid}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              placeholder="Reg No"
              name="regNo"
              value={formData.regNo}
              onChange={handleChange}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
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
            <Input
              type="number"
              step="0.01"
              placeholder="CGPA (e.g., 8.44)"
              name="cgpa"
              value={formData.cgpa}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              placeholder="Domains / Areas of Expertise (e.g., AI, Web Dev)"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              placeholder="Technologies & Tools (e.g., React, Python)"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              required
            />

            <Button
              className="w-full bg-gray-500 hover:bg-gray-600 text-white
          shadow-md hover:shadow-lg active:shadow-inner
           transition-shadow duration-200 ease-in-out"
            >
              Create Account
            </Button>
          </form>
          <p className="mt-4 text-sm text-center">
            Already have an account?{" "}
            <Link to="/" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
