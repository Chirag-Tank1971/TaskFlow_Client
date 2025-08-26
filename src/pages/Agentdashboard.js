import React from "react";
import { Link } from "react-router-dom";
import {  FaUserEdit , FaSignOutAlt, FaMagento  } from "react-icons/fa";
import { MdTask } from "react-icons/md";  
import axios from "axios";

const AgentDashboard = () => {
  
  // Retrieve the logged-in user's information from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = async () => {
    await axios.get("https://taskflow-server-qmtw.onrender.com/api/auth/logout", {
      withCredentials: true,
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Clear user data on logout
    window.location.href = "/agent/login";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#2f3c48] to-[#1a2329] text-white">
      {/* Dashboard Container */}
      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all hover:shadow-3xl">
        {/* Welcome Message */}
        <h2 className="text-3xl font-extrabold text-center mb-4 text-gray-200 flex items-center justify-center gap-2">
          Welcome, {user ? user.name : "Agent"}!👋
        </h2>
        <p className="text-center text-gray-400 mb-6">What would you like to do today?</p>

        {/* Navigation Links */}
        <div className="space-y-5">
          <Link
            to="/agent/edit"
            className="flex items-center justify-center space-x-3 bg-gradient-to-r from-[#ff5d57] to-[#ff9b50] text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
          >
            <FaUserEdit  className="w-6 h-6" />
            <span className="font-medium">Edit Details</span>
          </Link>
          <Link
            to="/agent/tasks"
            className="flex items-center justify-center space-x-3 bg-gradient-to-r from-[#ff5d57] to-[#ff9b50] text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
          >
            <MdTask  className="w-6 h-6" />
            <span className="font-medium ">Manage Tasks</span>
          </Link>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center justify-center space-x-3 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-500 transition-all transform hover:scale-105 shadow-lg hover:shadow-red-500/50"
        >
          <FaSignOutAlt className="w-6 h-6 text-red-300" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-400">
        <p className="text-sm">© 2025 Agent Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AgentDashboard;