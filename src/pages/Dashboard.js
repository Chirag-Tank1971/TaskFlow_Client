import React from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaUpload, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";

const Dashboard = () => {
  // Retrieve the logged-in user's information from localStorage
  const user = JSON.parse((localStorage.getItem("user")); //Assuming user data is stored in localStorage
  const token = localStorage.getItem("token");
  const handleLogout = async () => {
    await axios.get("https://taskflow-server-qmtw.onrender.com/api/auth/logout", {
      withCredentials: true,
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Clear user data on logout
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Dashboard Container */}
      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all hover:shadow-3xl">
        {/* Welcome Message */}
        <h2 className="text-3xl font-extrabold text-center mb-4 text-gray-200">
          Welcome,{user ? user.name : "Admin"}! 👋
        </h2>
        <p className="text-center text-gray-400 mb-6">What would you like to do today?</p>

        {/* Navigation Links */}
        <div className="space-y-5">
          <Link
            to="/agents"
            className="flex items-center justify-center space-x-3 bg-gray-700 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
          >
            <FaUsers className="w-6 h-6 text-blue-400" />
            <span className="font-semibold">Manage Agents</span>
          </Link>
          <Link
            to="/upload"
            className="flex items-center justify-center space-x-3 bg-gray-700 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
          >
            <FaUpload className="w-6 h-6 text-green-400" />
            <span className="font-semibold">Upload CSV</span>
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
        <p className="text-sm">© 2025 Admin Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};


export default Dashboard;
