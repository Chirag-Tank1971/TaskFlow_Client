import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaUsers, 
  FaUpload, 
  FaSignOutAlt, 
  FaChartBar,
  FaTasks,
  FaClock,
  FaCheckCircle,
  FaUserCircle,
  FaBell,
  FaSpinner
} from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../config/api";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completionRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topAgent, setTopAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeGreeting, setTimeGreeting] = useState("");

  useEffect(() => {
    // Get user name
    const name = localStorage.getItem("userName");
    setUserName(name || "Admin");

    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTimeGreeting("Good morning");
    } else if (hour >= 12 && hour < 17) {
      setTimeGreeting("Good afternoon");
    } else if (hour >= 17 && hour < 21) {
      setTimeGreeting("Good evening");
    } else {
      setTimeGreeting("Working late");
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get token - handle both formats
      let token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        token = JSON.parse(token);
      } catch (e) {
        // Token is already a plain string
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel
      const [agentsRes, statsRes, recentRes, performanceRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/agents`, { headers }),
        axios.get(`${API_BASE_URL}/api/analytics/stats`, { headers }),
        axios.get(`${API_BASE_URL}/api/analytics/recent`, { headers }),
        axios.get(`${API_BASE_URL}/api/analytics/performance`, { headers })
      ]);

      // Process agents data
      if (agentsRes.status === "fulfilled") {
        setStats(prev => ({ ...prev, totalAgents: agentsRes.value.data.length || 0 }));
      }

      // Process stats data
      if (statsRes.status === "fulfilled") {
        const statsData = statsRes.value.data;
        setStats(prev => ({
          ...prev,
          totalTasks: statsData.totalTasks || 0,
          pendingTasks: statsData.pendingTasks || 0,
          completionRate: statsData.completionRate || 0
        }));
      }

      // Process recent activity
      if (recentRes.status === "fulfilled") {
        setRecentActivity(recentRes.value.data.slice(0, 5) || []);
      }

      // Process top agent
      if (performanceRes.status === "fulfilled" && performanceRes.value.data.length > 0) {
        const sortedAgents = [...performanceRes.value.data].sort(
          (a, b) => (b.completionRate || 0) - (a.completionRate || 0)
        );
        setTopAgent(sortedAgents[0]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setLoading(false);
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
    localStorage.removeItem("userName");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <FaTasks className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </div>

            {/* Right Side */}
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
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {timeGreeting}, {userName}! 👋
              </h1>
              <p className="text-slate-200 text-lg md:text-xl">
                Here's what's happening with your tasks today
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Agents"
            value={stats.totalAgents}
            icon={<FaUsers className="text-2xl" />}
            gradient="from-indigo-500 to-indigo-600"
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
            title="Pending Tasks"
            value={stats.pendingTasks}
            icon={<FaClock className="text-2xl" />}
            gradient="from-amber-500 to-amber-600"
            loading={loading}
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate.toFixed(1)}%`}
            icon={<FaCheckCircle className="text-2xl" />}
            gradient="from-emerald-500 to-emerald-600"
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-200">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionCard
              to="/agents"
              title="Manage Agents"
              description="Add, edit, and manage your team agents"
              icon={<FaUsers className="text-4xl" />}
              gradient="from-indigo-500 to-purple-500"
            />
            <ActionCard
              to="/upload"
              title="Upload CSV"
              description="Import tasks from CSV file and distribute automatically"
              icon={<FaUpload className="text-4xl" />}
              gradient="from-purple-500 to-pink-500"
            />
            <ActionCard
              to="/analytics"
              title="View Analytics"
              description="Track performance, trends, and insights"
              icon={<FaChartBar className="text-4xl" />}
              gradient="from-pink-500 to-rose-500"
            />
          </div>
        </div>

        {/* Bottom Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-slate-200 flex items-center gap-2">
              <FaClock className="text-indigo-400" />
              Recent Activity
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-2xl text-slate-400" />
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((task, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-200">{task.firstName}</p>
                        <p className="text-sm text-slate-400 mt-1">{task.notes}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {task.agent?.name && `${task.agent.name} • `}
                          {new Date(task.createdAt || task.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : task.status === "in-progress"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No recent activity</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-slate-200 flex items-center gap-2">
              <FaChartBar className="text-purple-400" />
              Quick Stats
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-2xl text-slate-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {topAgent ? (
                  <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-4 border border-indigo-500/30">
                    <p className="text-sm text-slate-400 mb-1">Top Performer</p>
                    <p className="text-xl font-bold text-slate-200">{topAgent.agentName}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {topAgent.completionRate?.toFixed(1) || 0}% completion rate
                    </p>
                  </div>
                ) : null}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Today's Progress</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold text-slate-200">
                      {stats.completionRate.toFixed(1)}%
                    </span>
                    <div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${stats.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Active Tasks</p>
                  <p className="text-2xl font-bold text-slate-200">
                    {stats.totalTasks - stats.pendingTasks}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.pendingTasks} pending
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, gradient, loading }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const isPercentage = typeof value === "string" && value.includes("%");

  useEffect(() => {
    if (loading) return;
    
    if (isPercentage) {
      const numValue = parseFloat(value);
      animateValue(0, numValue, 1000);
    } else {
      animateValue(0, value, 1000);
    }
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
            {isPercentage ? `${displayValue.toFixed(1)}%` : displayValue}
          </p>
        )}
      </div>
    </div>
  );
};

// Action Card Component
const ActionCard = ({ to, title, description, icon, gradient }) => {
  return (
    <Link
      to={to}
      className="group relative bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
    >
      {/* Gradient Background on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className={`mb-6 p-4 rounded-xl bg-gradient-to-br ${gradient} w-fit group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2 group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
          {description}
        </p>
      </div>

      {/* Border Glow Effect */}
      <div className={`absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gradient-to-br ${gradient} opacity-0 group-hover:opacity-30 transition-opacity`}></div>
    </Link>
  );
};

export default Dashboard;
