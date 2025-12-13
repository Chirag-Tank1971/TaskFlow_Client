import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  FaUserPlus, 
  FaUsers, 
  FaSpinner, 
  FaHome, 
  FaTrash, 
  FaUpload,
  FaSearch,
  FaFilter,
  FaSort,
  FaEye,
  FaEdit,
  FaCheckCircle,
  FaClock,
  FaTasks,
  FaArrowLeft,
  FaDownload,
  FaSync,
  FaTh,
  FaList,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
  FaBell
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../config/api";
import CategoryBadge from "../components/CategoryBadge";
import CategoryFilter from "../components/CategoryFilter";
// Enhanced Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, title = "Confirm Action" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl max-w-md w-full transform transition-all">
        <h3 className="text-xl font-bold text-slate-200 mb-2">{title}</h3>
        <p className="text-slate-400 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Agent Modal Component
const AddAgentModal = ({ isOpen, onClose, onSuccess, agents }) => {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "" });
  const [countryCode, setCountryCode] = useState("+91");
  const [selectedStatus, setSelectedStatus] = useState("Available");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const countryCodes = [
    { code: "+91", name: "India" },
    { code: "+1", name: "USA" },
    { code: "+44", name: "UK" },
    { code: "+61", name: "Australia" },
  ];

  const agentStatus = [
    { name: "Available" },
    { name: "Not-Available" },
    { name: "Decommissioned" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.email.endsWith("@agent.com")) {
      setError("Email must end with @agent.com");
      setLoading(false);
      return;
    }

    const emailExists = agents.some((agent) => agent.email === form.email);
    if (emailExists) {
      setError("An agent with this email already exists.");
      setLoading(false);
      return;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(form.mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    const fullMobileNumber = `${countryCode}${form.mobile}`;

    try {
      let token = localStorage.getItem("token");
      if (token) {
        try {
          token = JSON.parse(token);
        } catch (e) {
          // Token is already a plain string
        }
      }

      await axios.post(
        `${API_BASE_URL}/api/agents`,
        { ...form, mobile: fullMobileNumber, status: selectedStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setForm({ name: "", email: "", mobile: "", password: "" });
      setSelectedStatus("Available");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add agent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <FaUserPlus className="text-indigo-400" />
            Add New Agent
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input
              type="text"
              placeholder="Enter agent name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full p-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              placeholder="agent@agent.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full p-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">Must end with @agent.com</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mobile Number</label>
            <div className="flex space-x-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="p-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="10 digits"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                required
                maxLength={10}
                className="flex-1 p-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full p-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              {agentStatus.map((status) => (
                <option key={status.name} value={status.name}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <FaUserPlus />
                  Add Agent
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Agent Stats Cards Component
const AgentStatsCards = ({ agents, loading }) => {
  const stats = useMemo(() => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.status === "Available").length;
    const totalTasks = agents.reduce((sum, agent) => sum + (agent.taskCount || 0), 0);
    const avgTasks = totalAgents > 0 ? (totalTasks / totalAgents).toFixed(1) : 0;

    return {
      totalAgents,
      activeAgents,
      totalTasks,
      avgTasks
    };
  }, [agents]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Agents"
        value={stats.totalAgents}
        icon={<FaUsers className="text-2xl" />}
        gradient="from-indigo-500 to-indigo-600"
        loading={loading}
      />
      <StatCard
        title="Active Agents"
        value={stats.activeAgents}
        icon={<FaCheckCircle className="text-2xl" />}
        gradient="from-emerald-500 to-emerald-600"
        loading={loading}
      />
      <StatCard
        title="Total Tasks"
        value={stats.totalTasks}
        icon={<FaTasks className="text-2xl" />}
        gradient="from-purple-500 to-purple-600"
        loading={loading}
      />
      <StatCard
        title="Avg Tasks/Agent"
        value={stats.avgTasks}
        icon={<FaClock className="text-2xl" />}
        gradient="from-amber-500 to-amber-600"
        loading={loading}
      />
    </div>
  );
};

// Stat Card Component (Reusable)
const StatCard = ({ title, value, icon, gradient, loading }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (loading) return;
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    animateValue(0, numValue, 1000);
  }, [value, loading]);

  const animateValue = (start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      setDisplayValue(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(end);
      }
    };
    window.requestAnimationFrame(step);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} opacity-80 group-hover:opacity-100 transition-opacity`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-sm mb-1">{title}</p>
        {loading ? (
          <div className="flex items-center space-x-2">
            <FaSpinner className="animate-spin text-slate-400" />
            <span className="text-slate-400">Loading...</span>
          </div>
        ) : (
          <p className="text-3xl font-bold text-slate-200">
            {typeof value === "string" ? value : displayValue}
          </p>
        )}
      </div>
    </div>
  );
};

// Enhanced Agent Card Component
const AgentCard = ({ agent, onSelect, onDelete, onViewTasks, isSelected }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Not-Available":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Decommissioned":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border ${
        isSelected ? "border-indigo-500 shadow-lg shadow-indigo-500/20" : "border-slate-700/50"
      } shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer`}
      onClick={() => onSelect(agent._id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
            {getInitials(agent.name)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
              {agent.name}
            </h3>
            <p className="text-sm text-slate-400">{agent.email}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(agent._id);
          }}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <FaTrash />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-slate-400">
          <FaTasks className="mr-2" />
          <span>{agent.mobile}</span>
        </div>
        {agent.taskCount !== undefined && (
          <div className="flex items-center text-sm text-slate-400">
            <FaClock className="mr-2" />
            <span>{agent.taskCount} tasks assigned</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(agent.status)}`}
        >
          {agent.status}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewTasks(agent._id);
          }}
          className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-all text-sm flex items-center gap-1"
        >
          <FaEye />
          View Tasks
        </button>
      </div>
    </div>
  );
};

// Agent Tasks Panel Component
const AgentTasksPanel = ({ agentId, agentName, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  useEffect(() => {
    if (agentId) {
      fetchTasks();
    }
  }, [agentId]);
  
  // Filter and sort tasks
  useEffect(() => {
    let filtered = [...tasks];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter((task) => (task.category || "General") === categoryFilter);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.firstName?.toLowerCase().includes(query) ||
          task.phone?.includes(query) ||
          task.notes?.toLowerCase().includes(query) ||
          task.category?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
        case "date-asc":
          return new Date(a.createdAt || a.date || 0) - new Date(b.createdAt || b.date || 0);
        case "status":
          const statusOrder = { pending: 1, "in-progress": 2, completed: 3 };
          return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        case "name":
          return (a.firstName || "").localeCompare(b.firstName || "");
        case "category":
          return (a.category || "General").localeCompare(b.category || "General");
        default:
          return 0;
      }
    });
    
    setFilteredTasks(filtered);
    
    // Calculate stats
    const calculatedStats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === "pending").length,
      inProgress: tasks.filter(t => t.status === "in-progress").length,
      completed: tasks.filter(t => t.status === "completed").length
    };
    setStats(calculatedStats);
  }, [tasks, statusFilter, categoryFilter, searchQuery, sortBy]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");

    let token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized: Please log in again.");
      setLoading(false);
      return;
    }

    try {
      token = JSON.parse(token);
    } catch (e) {
      // Token is already a plain string
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks/${agentId}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "in-progress":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "pending":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  if (!agentId) return null;

  return (
    <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <FaTasks className="text-indigo-400" />
          Tasks for {agentName}
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <FaTimes />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-3xl text-slate-400" />
        </div>
      ) : error ? (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FaTasks className="text-4xl mx-auto mb-4 opacity-50" />
          <p>No tasks assigned to this agent</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div 
              onClick={() => setStatusFilter("all")}
              className={`bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 cursor-pointer hover:border-indigo-500/50 transition-all ${statusFilter === "all" ? "border-indigo-500" : ""}`}
            >
              <div className="text-sm text-slate-400 mb-1">Total Tasks</div>
              <div className="text-2xl font-bold text-slate-200">{stats.total}</div>
            </div>
            <div 
              onClick={() => setStatusFilter("pending")}
              className={`bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 cursor-pointer hover:border-red-500/50 transition-all ${statusFilter === "pending" ? "border-red-500" : ""}`}
            >
              <div className="text-sm text-slate-400 mb-1">Pending</div>
              <div className="text-2xl font-bold text-red-400">{stats.pending}</div>
            </div>
            <div 
              onClick={() => setStatusFilter("in-progress")}
              className={`bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 cursor-pointer hover:border-amber-500/50 transition-all ${statusFilter === "in-progress" ? "border-amber-500" : ""}`}
            >
              <div className="text-sm text-slate-400 mb-1">In Progress</div>
              <div className="text-2xl font-bold text-amber-400">{stats.inProgress}</div>
            </div>
            <div 
              onClick={() => setStatusFilter("completed")}
              className={`bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 cursor-pointer hover:border-emerald-500/50 transition-all ${statusFilter === "completed" ? "border-emerald-500" : ""}`}
            >
              <div className="text-sm text-slate-400 mb-1">Completed</div>
              <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            {/* Status and Sort Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <FaFilter className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex items-center gap-2">
                <FaSort className="text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                >
                  <option value="date-desc">Date (Newest)</option>
                  <option value="date-asc">Date (Oldest)</option>
                  <option value="status">Status</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="category">Category</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {(statusFilter !== "all" || categoryFilter !== "All" || searchQuery.trim() || sortBy !== "date-desc") && (
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setCategoryFilter("All");
                    setSearchQuery("");
                    setSortBy("date-desc");
                  }}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-slate-300 hover:text-slate-200 transition-all flex items-center gap-2"
                >
                  <FaTimes />
                  Clear Filters
                </button>
              )}
            </div>

            {/* Category Filter */}
            <CategoryFilter
              selectedCategory={categoryFilter}
              onCategoryChange={setCategoryFilter}
              theme="admin"
            />
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-slate-400">
            Showing {filteredTasks.length} of {tasks.length} tasks
            {(statusFilter !== "all" || categoryFilter !== "All" || searchQuery.trim()) && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setCategoryFilter("All");
                  setSearchQuery("");
                }}
                className="ml-2 text-indigo-400 hover:text-indigo-300 underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FaTasks className="text-4xl mx-auto mb-4 opacity-50" />
              <p>No tasks match your filters</p>
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setCategoryFilter("All");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:border-slate-500 transition-all"
                >
                  <h4 className="font-semibold text-slate-200 mb-2">{task.firstName}</h4>
                  <p className="text-sm text-slate-400 mb-1">Phone: {task.phone}</p>
                  <p className="text-sm text-slate-400 mb-3">{task.notes}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}
                    >
                      {task.status.toUpperCase()}
                    </span>
                    <CategoryBadge category={task.category || "General"} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Main Agents Component
const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedAgentName, setSelectedAgentName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      let token = localStorage.getItem("token");
      if (token) {
        try {
          token = JSON.parse(token);
        } catch (e) {
          // Token is already a plain string
        }
      }

      const [agentsRes, performanceRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/agents`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/analytics/performance`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (agentsRes.status === "fulfilled") {
        const agentsData = agentsRes.value.data;
        
        // Merge task counts from performance data
        if (performanceRes.status === "fulfilled") {
          const performanceData = performanceRes.value.data;
          const agentsWithTasks = agentsData.map(agent => {
            const perf = performanceData.find(p => p.agentEmail === agent.email);
            return {
              ...agent,
              taskCount: perf?.totalTasks || 0
            };
          });
          setAgents(agentsWithTasks);
        } else {
          setAgents(agentsData);
        }
      }
    } catch (err) {
      setError("Failed to fetch agents. Please try again.");
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAgent = async (id) => {
    try {
      let token = localStorage.getItem("token");
      if (token) {
        try {
          token = JSON.parse(token);
        } catch (e) {
          // Token is already a plain string
        }
      }

      await axios.delete(`${API_BASE_URL}/api/agents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAgents(agents.filter((agent) => agent._id !== id));
      setSuccess("Agent deleted successfully!");
      setIsDeleteModalOpen(false);
      
      if (selectedAgentId === id) {
        setSelectedAgentId(null);
        setSelectedAgentName("");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      setError("Failed to delete agent.");
    }
  };

  const handleAgentSelect = (agentId) => {
    const agent = agents.find(a => a._id === agentId);
    if (selectedAgentId === agentId) {
      setSelectedAgentId(null);
      setSelectedAgentName("");
    } else {
      setSelectedAgentId(agentId);
      setSelectedAgentName(agent?.name || "");
    }
  };

  const handleViewTasks = (agentId) => {
    const agent = agents.find(a => a._id === agentId);
    setSelectedAgentId(agentId);
    setSelectedAgentName(agent?.name || "");
  };

  // Filter and sort agents
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = [...agents];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        agent =>
          agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.mobile.includes(searchQuery)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(agent => agent.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "tasks":
          return (b.taskCount || 0) - (a.taskCount || 0);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [agents, searchQuery, statusFilter, sortBy]);

  const handleLogout = async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/auth/logout`, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Logout Error:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    window.location.href = "/";
  };

  const userName = localStorage.getItem("userName") || "Admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header Bar (Same as Dashboard) */}
      <header className="sticky top-0 z-50 bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors">
                <FaArrowLeft />
                <span>Back</span>
              </Link>
              <div className="w-px h-6 bg-slate-700"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <FaUsers className="text-white text-sm" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Manage Agents
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                <FaBell className="text-lg" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <FaUserCircle className="text-slate-400 text-xl" />
                <span className="text-sm font-medium">{userName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all flex items-center space-x-2 text-sm font-medium border border-red-600/30"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-emerald-500/20 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess("")} className="text-emerald-200 hover:text-white">
              <FaTimes />
            </button>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-200 hover:text-white">
              <FaTimes />
            </button>
          </div>
        )}

        {/* Quick Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <FaUserPlus />
            Add New Agent
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAgents}
              className="px-4 py-2 bg-slate-700/50 text-slate-200 rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <Link
              to="/upload"
              className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all flex items-center gap-2 border border-emerald-500/30"
            >
              <FaUpload />
              Upload Tasks
            </Link>
          </div>
        </div>

        {/* Agent Statistics Cards */}
        <AgentStatsCards agents={agents} loading={loading} />

        {/* Search and Filter Bar */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Not-Available">Not-Available</option>
                <option value="Decommissioned">Decommissioned</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <FaSort className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="name">Sort by Name</option>
                <option value="tasks">Sort by Tasks</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all ${
                  viewMode === "grid"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all ${
                  viewMode === "list"
                    ? "bg-indigo-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>

        {/* Agents Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-indigo-400" />
          </div>
        ) : filteredAndSortedAgents.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700/50 text-center">
            <FaUsers className="text-6xl text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">
              {searchQuery || statusFilter !== "all" ? "No agents found" : "No agents yet"}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first agent"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
              >
                <FaUserPlus className="inline mr-2" />
                Add First Agent
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredAndSortedAgents.map((agent) => (
              <AgentCard
                key={agent._id}
                agent={agent}
                onSelect={handleAgentSelect}
                onDelete={(id) => {
                  setAgentToDelete(id);
                  setIsDeleteModalOpen(true);
                }}
                onViewTasks={handleViewTasks}
                isSelected={selectedAgentId === agent._id}
              />
            ))}
          </div>
        )}

        {/* Selected Agent Tasks Panel */}
        {selectedAgentId && (
          <AgentTasksPanel
            agentId={selectedAgentId}
            agentName={selectedAgentName}
            onClose={() => {
              setSelectedAgentId(null);
              setSelectedAgentName("");
            }}
          />
        )}
      </main>

      {/* Modals */}
      <AddAgentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchAgents}
        agents={agents}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteAgent(agentToDelete)}
        message="Are you sure you want to delete this agent? This action cannot be undone and will also delete all associated tasks."
        title="Delete Agent"
      />
    </div>
  );
};

export default Agents;
