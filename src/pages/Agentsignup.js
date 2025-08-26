import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from 'react-router-dom';

const AgentSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();


  const countryCodes = [
    { code: "+91", name: "India" },
    { code: "+1", name: "USA" },
    { code: "+44", name: "UK" },
    { code: "+61", name: "Australia" },
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fullNumber = `${countryCode}${number}`

    if(!email.endsWith("@agent.com")){
      setError("Email must be an @agent.com.");
      setLoading(false);
      return;
    }

    if (password !== confirmPass) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("https://taskflow-server-qmtw.onrender.com/api/auth/signup", { email, password , confirmPass, name, fullNumber});
      setSuccess("Agent Created Successfully,Now you can Login")
      localStorage.setItem("token", res.data.token);
      navigate("/agent/signup");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);  
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#2f3c48] to-[#1a2329]"
    >

      {/* Main Signup Form */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#1e2a32] p-8 rounded-2xl shadow-xl w-100 transform transition-all hover:scale-105"
      >
        <h2 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#ff5d57] to-[#ff9b50]">
          Create Your Agent Account
        </h2>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-6">

        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5d57] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5d57] focus:border-transparent transition-all"
            />
            <p className="text-gray-400 mt-2 font-medium">E.g.- agent007@agent.com</p>
          </div>

          <div className="flex space-x-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </select>
            <input
              placeholder="Mobile (10 digits)"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
              className="w-full p-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
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

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPass}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5d57] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#ff5d57] transition-all"
              style={{ top: "55%" }}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
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
              "Sign Up"
            )}
          </button>
        </form>

        {/* Already have an account */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 mb-6">Already have an account? Login
          </p>
          <Link to={"/agent/login"}>
            <button className="w-full bg-gradient-to-r from-[#ff5d57] to-[#ff9b50] text-white py-3 rounded-lg font-semibold hover:from-[#ff9b50] hover:to-[#ff5d57] transition-all transform hover:scale-105">
              Login to your Agent Account
            </button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AgentSignup;
