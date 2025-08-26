import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass , setConfirmPass] = useState("")
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if(email.endsWith("@agent.com")){
      setError("Invalid Credentials. Try Again")
      setLoading(false);  
      return;
    }

    try {
      const res = await axios.post("https://taskflow-server-qmtw.onrender.com/api/auth/signup", { email, password , confirmPass, name});
    //  localStorage.setItem("token", res.data.token);
      setSuccess("Account Created ! Now You Can Login");
    } catch (err) {
      setError(
        err.response?.status === 401 ? "Password Not Matched" : "User Already Exists. Try Login"
      );
      console.log(err); 
    } finally {
      setLoading(false);  
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const matchPassword = () => {
      if(password != confirmPass){
        return setError("Password Not matched")
      }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all hover:scale-105"
      >
        <h2 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
          Create Account
        </h2>

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

        <form onSubmit={handleSignup} className="space-y-6">

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="Enter your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

        <div className="flex flex-col gap-6">
          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute  right-0 pr-3 flex items-center text-gray-500 hover:text-purple-600 transition-all"
              style={{ top: "55%" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute  right-0 pr-3 flex items-center text-gray-500 hover:text-purple-600 transition-all"
              style={{ top: "55%" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

        </div>

          <button
            type="submit"
            disabled={loading} 
            onClick={matchPassword}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>


        <div className="mt-6">
          <p className="text-center text-gray-600 mb-4">Already Have Account?</p>
          <div className="mt-5 text-center">
          <Link to={"/"}>
          <button 
           className="w-full bg-gradient-to-r from-red-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-yellow-700 transition-all transform hover:scale-105"
           >
            Login To Existing Account
            </button>
          </Link>
          
        </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Signup;