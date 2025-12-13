import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTasks,
  FaSignOutAlt,
  FaUserCircle,
  FaBell,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTrash,
  FaPhoneAlt,
  FaSearch,
  FaFilter,
  FaSort,
  FaTh,
  FaList,
  FaArrowLeft,
  FaEdit,
  FaSync,
  FaCalendarDay,
  FaUser,
} from "react-icons/fa";
import { MdManageAccounts, MdPendingActions, MdIncompleteCircle } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../config/api";
import {
  calculateStats,
  formatDate,
  formatCompletionTime,
} from "../utils/agentStats";
import CategoryBadge from "../components/CategoryBadge";
import CategoryFilter from "../components/CategoryFilter";

const AgentTasks = () => {
  const [agent, setAgent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskDetailsModal, setTaskDetailsModal] = useState(null);
  const [filter, setFilter] = useState("all"); // "all", "pending", "in-progress", "completed"
  const [categoryFilter, setCategoryFilter] = useState("All"); // Category filter
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc"); // "date-desc", "date-asc", "status", "name"
  const [viewMode, setViewMode] = useState("list"); // "list", "grid"
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    completionRate: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Get agent from localStorage
    const storedAgent = JSON.parse(localStorage.getItem("user"));
    if (storedAgent) {
      setAgent(storedAgent);
    }

    // Verify user is an agent
    if (storedAgent && storedAgent.email && !storedAgent.email.toLowerCase().endsWith("@agent.com")) {
      console.error("User is not an agent. Redirecting...");
      window.location.href = "/dashboard";
      return;
    }

    // Fetch tasks
    fetchTasks();
  }, []);

  // Filter and sort tasks when tasks, filter, categoryFilter, searchQuery, or sortBy changes
  useEffect(() => {
    let filtered = [...tasks];

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((task) => task.status === filter);
    }

    // Apply category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter((task) => task.category === categoryFilter);
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
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);

    // Calculate statistics
    const calculatedStats = calculateStats(tasks);
    setStats(calculatedStats);
  }, [tasks, filter, searchQuery, sortBy]);

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

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const storedAgent = JSON.parse(localStorage.getItem("user"));
      if (!storedAgent || !storedAgent._id) {
        setError("Agent not found. Please log in again.");
        setLoading(false);
        return;
      }

      const token = getToken();
      if (!token) {
        setError("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/api/tasks/${storedAgent._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const tasksData = Array.isArray(res.data) ? res.data : [];
      setTasks(tasksData);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      if (err.response?.status === 404) {
        setTasks([]);
      } else {
        setError("Failed to load tasks. Please try again.");
        toast.error("Failed to load tasks. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (taskId) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleTaskDeletion = async (id) => {
    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(tasks.filter((task) => task._id !== id));
      setSuccess("Task deleted successfully!");
      toast.success("Task deleted successfully!");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting Task:", error);
      setError("Failed to delete Task.");
      toast.error("Failed to delete task.");
      setIsDeleteModalOpen(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedTask = res.data.task || res.data;

      // Update the task in the local state
      setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)));

      setSuccess(`Task marked as ${newStatus.replace("-", " ")}`);
      toast.success(`Task marked as ${newStatus.replace("-", " ")}`);
    } catch (err) {
      console.error("Failed to update task status:", err);
      setError("Failed to update task status.");
      toast.error("Failed to update task status.");
    }
  };

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
    window.location.href = "/agent/login";
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <FaTasks className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                TaskFlow Agent
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                to="/agent/dashboard"
                className="px-3 py-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/agent/tasks"
                className="px-3 py-2 text-orange-400 font-semibold transition-colors text-sm"
              >
                Tasks
              </Link>
              <Link
                to="/agent/edit"
                className="px-3 py-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Profile
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                <FaBell className="text-lg" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <FaUserCircle className="text-slate-400 text-xl" />
                <span className="text-sm font-medium hidden sm:inline">
                  {agent ? agent.name : "Agent"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all flex items-center space-x-2 text-sm font-medium border border-red-600/30"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
                  <FaTasks className="text-4xl" />
                  My Tasks
                </h1>
                <p className="text-slate-200 text-lg md:text-xl">
                  Manage and track all your assigned tasks
                </p>
              </div>
              <button
                onClick={fetchTasks}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium backdrop-blur-sm"
                title="Refresh tasks"
              >
                <FaSync className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={<FaTasks className="text-2xl" />}
            gradient="from-orange-500 to-orange-600"
            loading={loading}
          />
          <StatCard
            title="Pending"
            value={stats.pendingTasks}
            icon={<FaClock className="text-2xl" />}
            gradient="from-amber-500 to-amber-600"
            loading={loading}
          />
          <StatCard
            title="In Progress"
            value={stats.inProgressTasks}
            icon={<MdPendingActions className="text-2xl" />}
            gradient="from-yellow-500 to-yellow-600"
            loading={loading}
          />
          <StatCard
            title="Completed"
            value={stats.completedTasks}
            icon={<FaCheckCircle className="text-2xl" />}
            gradient="from-emerald-500 to-emerald-600"
            loading={loading}
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <CategoryFilter
            selectedCategory={categoryFilter}
            onCategoryChange={setCategoryFilter}
            theme="agent"
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, notes, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <FaFilter className="text-slate-400" />
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  filter === "all"
                    ? "bg-orange-500 text-white shadow-lg"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2 ${
                  filter === "pending"
                    ? "bg-amber-500 text-white shadow-lg"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <MdPendingActions /> Pending
              </button>
              <button
                onClick={() => setFilter("in-progress")}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2 ${
                  filter === "in-progress"
                    ? "bg-yellow-500 text-white shadow-lg"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <MdIncompleteCircle /> In Progress
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2 ${
                  filter === "completed"
                    ? "bg-emerald-500 text-white shadow-lg"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <FaCheckCircle /> Completed
              </button>
            </div>

            {/* Sort and View Toggle */}
            <div className="flex items-center gap-2">
              <FaSort className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="status">By Status</option>
                <option value="name">By Name</option>
              </select>

              <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1 border border-slate-600">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "list"
                      ? "bg-orange-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="List view"
                >
                  <FaList />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "grid"
                      ? "bg-orange-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Grid view"
                >
                  <FaTh />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Display Area */}
        {loading ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700/50 shadow-xl">
            <div className="flex flex-col items-center justify-center">
              <FaSpinner className="animate-spin text-4xl text-orange-400 mb-4" />
              <p className="text-slate-400">Loading tasks...</p>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            filter={filter}
            searchQuery={searchQuery}
            onClearSearch={clearSearch}
            onClearFilter={() => setFilter("all")}
          />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                viewMode={viewMode}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleDeleteClick}
                onViewDetails={setTaskDetailsModal}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredTasks.length > 0 && (
          <div className="mt-6 text-center text-slate-400 text-sm">
            Showing {filteredTasks.length} of {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
            {filter !== "all" && ` (${filter} status)`}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleTaskDeletion(taskToDelete)}
        message="Are you sure you want to delete this task? This action cannot be undone."
        title="Delete Task"
      />

      {/* Task Details Modal */}
      {taskDetailsModal && (
        <TaskDetailsModal
          task={taskDetailsModal}
          onClose={() => setTaskDetailsModal(null)}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDeleteClick}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, gradient, loading }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (loading) return;
    animateValue(0, value, 1000);
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
          <p className="text-3xl font-bold text-slate-200">{displayValue}</p>
        )}
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, viewMode, onStatusUpdate, onDelete, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "in-progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getCompletionTime = () => {
    if (task.status === "completed" && task.completedDate && task.createdAt) {
      const timeDiff = new Date(task.completedDate) - new Date(task.createdAt);
      return formatCompletionTime(timeDiff / (1000 * 60 * 60));
    }
    return null;
  };

  if (viewMode === "grid") {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl hover:border-orange-500/50 hover:shadow-2xl transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-200 mb-2 group-hover:text-white transition-colors line-clamp-2">
              {task.notes || "Task"}
            </h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <FaUser className="text-orange-400" />
                {task.firstName}
              </p>
              <p className="flex items-center gap-2">
                <FaPhoneAlt className="text-orange-400" />
                {task.phone}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Delete task"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            <CategoryBadge category={task.category || "General"} size="sm" />
          </div>
          {getCompletionTime() && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <FaClock />
              {getCompletionTime()}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {task.status === "pending" ? (
            <button
              onClick={() => onStatusUpdate(task._id, "in-progress")}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <MdPendingActions />
              Start Progress
            </button>
          ) : task.status === "in-progress" ? (
            <button
              onClick={() => onStatusUpdate(task._id, "completed")}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <FaCheckCircle />
              Mark Complete
            </button>
          ) : (
            <button
              onClick={() => onStatusUpdate(task._id, "pending")}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <MdPendingActions />
              Mark Pending
            </button>
          )}
          <button
            onClick={() => onViewDetails(task)}
            className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <FaEdit />
            View Details
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500">
            Created: {formatDate(task.createdAt || task.date)}
          </p>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl hover:border-orange-500/50 hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-200 mb-2 group-hover:text-white transition-colors">
                {task.notes || "Task"}
              </h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p className="flex items-center gap-2">
                  <FaUser className="text-orange-400" />
                  <span className="font-medium">{task.firstName}</span>
                </p>
                <p className="flex items-center gap-2">
                  <FaPhoneAlt className="text-orange-400" />
                  {task.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <CategoryBadge category={task.category || "General"} size="sm" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task._id);
                }}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Delete task"
              >
                <FaTrash className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <FaCalendarDay />
              Created: {formatDate(task.createdAt || task.date)}
            </p>
            {getCompletionTime() && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <FaClock />
                Completed in: {getCompletionTime()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {task.status === "pending" ? (
              <button
                onClick={() => onStatusUpdate(task._id, "in-progress")}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                <MdPendingActions />
                Start Progress
              </button>
            ) : task.status === "in-progress" ? (
              <button
                onClick={() => onStatusUpdate(task._id, "completed")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                <FaCheckCircle />
                Mark Complete
              </button>
            ) : (
              <button
                onClick={() => onStatusUpdate(task._id, "pending")}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                <MdPendingActions />
                Mark Pending
              </button>
            )}
            <button
              onClick={() => onViewDetails(task)}
              className="bg-slate-700/50 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <FaEdit />
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ filter, searchQuery, onClearSearch, onClearFilter }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700/50 shadow-xl text-center">
      <div className="max-w-md mx-auto">
        <FaTasks className="text-6xl text-slate-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-200 mb-2">
          {searchQuery ? "No tasks found" : filter !== "all" ? `No ${filter} tasks` : "No tasks assigned"}
        </h3>
        <p className="text-slate-400 mb-6">
          {searchQuery
            ? `No tasks match your search "${searchQuery}"`
            : filter !== "all"
            ? `You don't have any ${filter} tasks at the moment.`
            : "You don't have any tasks assigned yet. Tasks will appear here once assigned."}
        </p>
        <div className="flex items-center justify-center gap-3">
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all text-sm font-medium"
            >
              Clear Search
            </button>
          )}
          {filter !== "all" && (
            <button
              onClick={onClearFilter}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all text-sm font-medium"
            >
              Show All Tasks
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
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
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Task Details Modal Component
const TaskDetailsModal = ({ task, onClose, onStatusUpdate, onDelete }) => {
  if (!task) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "in-progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getCompletionTime = () => {
    if (task.status === "completed" && task.completedDate && task.createdAt) {
      const timeDiff = new Date(task.completedDate) - new Date(task.createdAt);
      return formatCompletionTime(timeDiff / (1000 * 60 * 60));
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <FaTasks className="text-orange-400" />
            Task Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Task Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Task Notes</label>
            <p className="text-lg text-slate-200 bg-slate-700/30 rounded-lg p-4">{task.notes || "No notes"}</p>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Customer Name</label>
              <div className="flex items-center gap-2 text-slate-200 bg-slate-700/30 rounded-lg p-4">
                <FaUser className="text-orange-400" />
                {task.firstName || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
              <div className="flex items-center gap-2 text-slate-200 bg-slate-700/30 rounded-lg p-4">
                <FaPhoneAlt className="text-orange-400" />
                {task.phone || "N/A"}
              </div>
            </div>
          </div>

          {/* Status and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
              <CategoryBadge category={task.category || "General"} size="md" />
            </div>
            {getCompletionTime() && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Completion Time</label>
                <div className="flex items-center gap-2 text-slate-200 bg-slate-700/30 rounded-lg p-4">
                  <FaClock className="text-orange-400" />
                  {getCompletionTime()}
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Created Date</label>
              <div className="flex items-center gap-2 text-slate-200 bg-slate-700/30 rounded-lg p-4">
                <FaCalendarDay className="text-orange-400" />
                {formatDate(task.createdAt || task.date)}
              </div>
            </div>
            {task.completedDate && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Completed Date</label>
                <div className="flex items-center gap-2 text-slate-200 bg-slate-700/30 rounded-lg p-4">
                  <FaCheckCircle className="text-orange-400" />
                  {formatDate(task.completedDate)}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
            {task.status === "pending" ? (
              <button
                onClick={() => {
                  onStatusUpdate(task._id, "in-progress");
                  onClose();
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <MdPendingActions />
                Start Progress
              </button>
            ) : task.status === "in-progress" ? (
              <button
                onClick={() => {
                  onStatusUpdate(task._id, "completed");
                  onClose();
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <FaCheckCircle />
                Mark Complete
              </button>
            ) : (
              <button
                onClick={() => {
                  onStatusUpdate(task._id, "pending");
                  onClose();
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <MdPendingActions />
                Mark Pending
              </button>
            )}
            <button
              onClick={() => {
                onDelete(task._id);
                onClose();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <FaTrash />
              Delete
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentTasks;
