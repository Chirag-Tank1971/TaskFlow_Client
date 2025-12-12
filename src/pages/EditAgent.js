import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBackspace, FaUserEdit, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
const EditAgent = () => {
  const [agent, setAgent] = useState({ name: "", email: "", mobile: "", status:"" , id:"" });
  const [selectedStatus, setSelectedStatus] = useState("");
  const navigate = useNavigate();
  const agentStatus = [
    { name: "Available" },
    { name: "Not-Available" },
    { name: "Decommissioned" },
  ];

  // Fetch agent data from localStorage or API
  useEffect(() => {
    const storedAgent = JSON.parse(localStorage.getItem("user"));
    if (storedAgent) {
      setAgent({
        name: storedAgent.name || "",
        email: storedAgent.email || "",
        mobile: storedAgent.mobile || "",
        status:storedAgent.status || '',
        id:storedAgent._id
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgent((prev) => ({ ...prev, [name]: value }));
  };

  // Get token with robust parsing
  const getToken = () => {
    let token = localStorage.getItem("token");
    if (!token) return null;
    try {
      token = JSON.parse(token);
    } catch (e) {
      // Token is already a plain string
    }
    return token;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedStatus !== agent.status && selectedStatus !== "") {
      agent.status = selectedStatus;
    }

    try {
      const token = getToken();
      if (!token) {
        alert("Authentication required. Please log in again.");
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/agents/update`,
        { agent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Agent details updated successfully");
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/agent/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to update agent");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/agent/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-lg transition-all text-sm font-medium border border-orange-600/30 mb-4"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </Link>
          <h2 className="text-3xl font-bold text-slate-200 flex items-center gap-2">
            <FaUserEdit className="text-orange-400" />
            Edit Profile
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl p-8 space-y-6"
        >

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={agent.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={agent.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="mobile">
              Phone Number
            </label>
            <input
              id="mobile"
              type="text"
              name="mobile"
              value={agent.mobile}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={selectedStatus || agent.status}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="" disabled>
                Select Status
              </option>
              {agentStatus.map((status) => (
                <option key={status.name} value={status.name}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {agent.createdAt && (
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-sm text-slate-400">
                Member since: {new Date(agent.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <FaUserEdit />
              Update Details
            </button>

            <Link
              to="/agent/dashboard"
              className="flex items-center justify-center gap-2 px-6 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 rounded-lg font-medium transition-all"
            >
              <FaBackspace />
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAgent;
