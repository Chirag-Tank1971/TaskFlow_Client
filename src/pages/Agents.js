import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserPlus, FaUsers, FaSpinner, FaHome, FaTrash , FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <p className="text-white text-lg mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: ""});
  const [countryCode, setCountryCode] = useState("+91");
  const [selectedStatus , setSelectedStatus] = useState("")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // For modal visibility
  const [agentToDelete, setAgentToDelete] = useState(null); // Track agent to delete
  const navigate = useNavigate();

  // List of country codes
  const countryCodes = [
    { code: "+91", name: "India" },
    { code: "+1", name: "USA" },
    { code: "+44", name: "UK" },
    { code: "+61", name: "Australia" },
    // Add more country codes as needed
  ];

  const agentStatus = [
    {name: "Available" },
    {name: "Not-Available" },
    {name: "Decommissioned" },
  ];

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get("https://taskflow-server-qmtw.onrender.com/api/agents", {
        headers: { Authorization: `Bearer ${ JSON.parse(localStorage.getItem("token"))}` },
      });
      setAgents(res.data);
    } catch (err) {
      setError("Failed to fetch agents. Please try again.");
      console.error("Fetch Error:", err);
    }
  };

  const deleteAgent = async (id) => {
    try {
      await axios.delete(`https://taskflow-server-qmtw.onrender.com/api/agents/${id}`, {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}` },
      });

      // Remove the deleted agent from the UI
      setAgents(agents.filter((agent) => agent._id !== id));
      setSuccess("Agent deleted successfully!");
    } catch (error) {
      console.error("Error deleting agent:", error);
      setError("Failed to delete agent.");
    } finally {
      setIsDeleteModalOpen(false); // Close the modal
    }
  };

  const addAgent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if(!form.email.endsWith("@agent.com")){
      setError("Email must be an @agent.com.");
      setLoading(false);
      return;
    }

    // Check if the email already exists
    const emailExists = agents.some((agent) => agent.email === form.email);
    if (emailExists) {
      setError("An agent with this email already exists.");
      setLoading(false);
      return;
    }

    // Validate mobile number (exactly 10 digits)
    const mobileRegex = /^\d{10}$/; // Regex for exactly 10 digits
    if (!mobileRegex.test(form.mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    // Combine country code and mobile number
    const fullMobileNumber = `${countryCode}${form.mobile}`;

    try {
      console.log(selectedStatus)
      await axios.post(
        "https://taskflow-server-qmtw.onrender.com/api/agents",
        { ...form, mobile: fullMobileNumber , status: selectedStatus==="" ? "Available" : selectedStatus},
        {
          headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}` },
        }
      );
      setSuccess("Agent added successfully!");
      setForm({ name: "", email: "", mobile: "", password: "" }); // Reset form
      fetchAgents(); // Refresh list
    } catch (err) {
      setError("Failed to add agent. Email may already exist.");
      console.error("Add Agent Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentClick = (agentId) => {
    setSelectedAgentId(agentId); // Set the selected agent ID
  };

  const handleDeleteClick = (agentId) => {
    setAgentToDelete(agentId); // Set the agent to delete
    setIsDeleteModalOpen(true); // Open the modal
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center space-x-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-all"
        >
          <FaHome className="w-6 h-6" />
          <span>Go to Dashboard</span>
        </button>

        {/* Upload Tasks Button */}
        <button
          onClick={() => navigate("/upload")}
          className="flex items-center space-x-2 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-all"
        >
          <FaUpload className="w-6 h-6" />
          <span>Upload Tasks</span>
        </button>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-blue-400">Agents</h2>

      {/* Add Agent Form */}
      <form onSubmit={addAgent} className="mb-8 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-blue-400 flex items-center space-x-2">
          <FaUserPlus className="w-6 h-6" />
          <span>Add New Agent</span>
        </h3>

        <div className="space-y-4">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              required
              className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div>
          <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-3 bg-yellow-500 text-red font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
            <option value="">Select Status</option>
              {agentStatus.map((status) => (
                  <option key={status.name} value={status.name}>
                     {status.name}
                  </option>
                ))}
            </select>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center"
          >
            {loading ? <FaSpinner className="animate-spin w-6 h-6" /> : "Add Agent"}
          </button>
        </div>
      </form>

      {/* Agent List */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-blue-400 flex items-center space-x-2">
          <FaUsers className="w-6 h-6" />
          <span>Agent List</span>
        </h3>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <ul className="space-y-3">
          {agents.map((agent) => (
            <li
              key={agent._id}
              onClick={() => handleAgentClick(agent._id)}
              className={`p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-all ${
                selectedAgentId === agent._id ? "border-2 border-blue-500" : ""
              }`}
            >
              <div className="bg-gray-800 p-4 rounded-xl shadow-md text-white w-full max-w-md">
                <div className="mb-3">
                  <h3 className="text-xl font-bold">{agent.name}</h3>
                  <p className="text-sm text-gray-400">{agent.email}</p>
                  <p className="text-sm text-gray-300">{agent.mobile}</p>
                </div> 
                <div className="flex items-center justify-between border-t border-gray-700 pt-3">
                <span className="text-sm font-medium">Status:</span>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    agent.status === "Available"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {agent.status}
                </span>
              </div> 
                
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent selecting agent when deleting
                    handleDeleteClick(agent._id); // Open the modal
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteAgent(agentToDelete)}
        message="Are you sure you want to delete this agent?"
      />

      {/* Tasks Section */}
      {selectedAgentId && (
        <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">Tasks for Selected Agent</h3>
          <Tasks agentId={selectedAgentId} />
        </div>
      )}
    </div>
  );
};

export default Agents;

// Tasks Component
const Tasks = ({ agentId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (agentId) {
      fetchTasks();
    }
  }, [agentId]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");

    const token = JSON.parse(localStorage.getItem("token"));
    if (!token) {
      setError("Unauthorized: Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://taskflow-server-qmtw.onrender.com/api/tasks/${agentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        setError("Invalid tasks data format.");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <p className="text-center text-gray-400">Loading tasks...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-400">No tasks found.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task._id} className="p-4 bg-gray-700 rounded-lg">
              <p className="text-lg font-semibold">{task.firstName}</p>
              <p className="text-sm text-gray-400">Phone: {task.phone}</p>
              <p className="text-sm text-gray-400">Notes: {task.notes}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};