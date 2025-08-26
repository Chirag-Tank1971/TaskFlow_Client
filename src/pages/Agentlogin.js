import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { Link } from "react-router-dom";

const AgentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email.endsWith("@agent.com")) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "https://taskflow-server-qmtw.onrender.com/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/agent/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#2f3c48] to-[#1a2329]"
    >
      {/* Agent Login Link */}
      <a
        href="/"
        className="absolute flex gap-2 pl-5 items-center right-5 top-10 w-[210px] bg-gradient-to-r from-red-600 to-blue-600 text-white  py-2  rounded-lg font-semibold  hover:from-purple-700 hover:to-yellow-700 transition-all transform duration-300 hover:py-4"
      >
        <RiAdminFill />
        Go To Admin Login
      </a>

      {/* Main Login Form */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#1e2a32] p-8 rounded-2xl shadow-xl w-96 transform transition-all hover:scale-105"
      >
        <h2 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#ff5d57] to-[#ff9b50]">
          Agent Login
        </h2>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your agent email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5d57] focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5d57] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#ff5d57] transition-all"
              style={{ top: "55%" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#ff5d57] to-[#ff9b50] text-white py-3 rounded-lg font-semibold hover:from-[#ff9b50] hover:to-[#ff5d57] transition-all transform hover:scale-105"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Link to agent signup */}
        <div className="mt-3">
          <p className="text-center text-gray-400 mb-4">Or</p>
        </div>

        {/* Create Agent Account Link */}
        <div className="mt-5 text-center">
          <Link to={"/agent/signup"}>
            <button className="w-full bg-gradient-to-r from-[#ff5d57] to-[#ff9b50] text-white py-3 rounded-lg font-semibold hover:from-[#ff9b50] hover:to-[#ff5d57] transition-all transform hover:scale-105">
              Create New Agent Account
            </button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AgentLogin;
