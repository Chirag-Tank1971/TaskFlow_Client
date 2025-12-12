import React, { useState, useEffect, useMemo } from "react";
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
  FaUserEdit,
  FaChartBar,
  FaTrophy,
  FaFire,
  FaCalendarDay,
  FaArrowRight,
  FaDownload,
} from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import API_BASE_URL from "../config/api";
import {
  calculateStats,
  calculatePerformance,
  getTodayTasks,
  getActivityFeed,
  formatCompletionTime,
  formatDate,
  calculateDaysActive,
} from "../utils/agentStats";

const AgentDashboard = () => {
  const [agent, setAgent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    todayTasks: 0,
    todayCompleted: 0,
    avgCompletionTime: 0,
    daysActive: 0,
  });
  const [performance, setPerformance] = useState({
    weeklyTrend: [],
    performanceScore: 0,
    completionRate: 0,
    avgCompletionTime: 0,
    bestDay: null,
  });
  const [activity, setActivity] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeGreeting, setTimeGreeting] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get agent from localStorage
    const storedAgent = JSON.parse(localStorage.getItem("user"));
    if (storedAgent) {
      setAgent(storedAgent);
    }

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const storedAgent = JSON.parse(localStorage.getItem("user"));
      if (!storedAgent || !storedAgent._id) {
        console.error("Agent not found in localStorage");
        setLoading(false);
        return;
      }

      // Verify user is an agent (not an admin)
      // Agents have emails ending with @agent.com
      if (storedAgent.email && !storedAgent.email.toLowerCase().endsWith("@agent.com")) {
        console.error("User is not an agent. Redirecting to admin dashboard...");
        // Redirect to admin dashboard
        window.location.href = "/dashboard";
        return;
      }

      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch agent tasks
      try {
        const tasksRes = await axios.get(`${API_BASE_URL}/api/tasks/${storedAgent._id}`, { headers });
        const tasksData = tasksRes.data || [];
        setTasks(tasksData);

        // Calculate statistics client-side
        const calculatedStats = calculateStats(tasksData);
        const daysActive = storedAgent.createdAt
          ? calculateDaysActive(storedAgent.createdAt)
          : 0;

        setStats({
          ...calculatedStats,
          daysActive,
        });

        // Calculate performance
        const calculatedPerformance = calculatePerformance(tasksData);
        setPerformance(calculatedPerformance);

        // Get activity feed
        const activityFeed = getActivityFeed(tasksData, 10);
        setActivity(activityFeed);

        // Get today's tasks
        const todayTasksList = getTodayTasks(tasksData);
        setTodayTasks(todayTasksList);
      } catch (taskError) {
        console.error("Error fetching tasks:", taskError);
        if (taskError.response?.status === 404) {
          // Agent has no tasks yet - set empty state
          setTasks([]);
          const daysActive = storedAgent.createdAt ? calculateDaysActive(storedAgent.createdAt) : 0;
          setStats({
            totalTasks: 0,
            pendingTasks: 0,
            inProgressTasks: 0,
            completedTasks: 0,
            completionRate: 0,
            todayTasks: 0,
            todayCompleted: 0,
            avgCompletionTime: 0,
            daysActive,
          });
          setPerformance({
            weeklyTrend: [],
            performanceScore: 0,
            completionRate: 0,
            avgCompletionTime: 0,
            bestDay: null,
          });
          setActivity([]);
          setTodayTasks([]);
        } else {
          // Other error - log it
          console.error("Failed to fetch tasks:", taskError);
        }
      }
    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
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
    window.location.href = "/agent/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
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
                className="px-3 py-2 text-orange-400 font-semibold transition-colors text-sm"
              >
                Dashboard
              </Link>
              <Link
                to="/agent/tasks"
                className="px-3 py-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
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
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {timeGreeting}, {agent ? agent.name : "Agent"}! 👋
              </h1>
              <p className="text-slate-200 text-lg md:text-xl">
                {stats.todayTasks > 0
                  ? `You have ${stats.todayTasks} task${stats.todayTasks > 1 ? "s" : ""} to focus on today`
                  : "You're all caught up! Great work!"}
              </p>
              {agent && agent.createdAt && (
                <p className="text-slate-300 text-sm mt-2">
                  Member since {formatDate(agent.createdAt)} • {stats.daysActive} days active
                </p>
              )}
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
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
            icon={<FaExclamationTriangle className="text-2xl" />}
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
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate.toFixed(1)}%`}
            icon={<FaChartBar className="text-2xl" />}
            gradient="from-purple-500 to-purple-600"
            loading={loading}
          />
          <StatCard
            title="Today's Tasks"
            value={stats.todayTasks}
            icon={<FaCalendarDay className="text-2xl" />}
            gradient="from-pink-500 to-pink-600"
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-200">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ActionCard
              to="/agent/tasks"
              title="View All Tasks"
              description="Manage and update your tasks"
              icon={<FaTasks className="text-4xl" />}
              gradient="from-orange-500 to-amber-500"
            />
            <ActionCard
              to="/agent/edit"
              title="Edit Profile"
              description="Update your profile information"
              icon={<FaUserEdit className="text-4xl" />}
              gradient="from-amber-500 to-yellow-500"
            />
            <ActionCard
              to="/agent/tasks"
              title="View Performance"
              description="Track your performance metrics"
              icon={<FaChartBar className="text-4xl" />}
              gradient="from-yellow-500 to-orange-500"
            />
            <ActionCard
              to="#"
              title="Download Report"
              description="Export your task data"
              icon={<FaDownload className="text-4xl" />}
              gradient="from-pink-500 to-rose-500"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement download functionality
                alert("Download feature coming soon!");
              }}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Focus - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Tasks */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-slate-200 flex items-center gap-2">
                <FaCalendarDay className="text-orange-400" />
                Today's Focus
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-slate-400 text-2xl" />
                </div>
              ) : todayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <FaCheckCircle className="text-4xl text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-400">No tasks assigned for today. Great job!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.slice(0, 5).map((task) => (
                    <div
                      key={task._id}
                      className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 hover:border-orange-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-200 mb-1">
                            {task.firstName}
                          </p>
                          <p className="text-xs text-slate-400 mb-2">{task.notes}</p>
                          <p className="text-xs text-slate-500">{task.phone}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            task.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : task.status === "in-progress"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {todayTasks.length > 5 && (
                    <Link
                      to="/agent/tasks"
                      className="block text-center text-orange-400 hover:text-orange-300 text-sm font-medium mt-4"
                    >
                      View all {todayTasks.length} tasks <FaArrowRight className="inline ml-1" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Performance Insights */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-slate-200 flex items-center gap-2">
                <FaChartBar className="text-orange-400" />
                Performance Insights
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-slate-400 text-2xl" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Performance Score */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Performance Score</span>
                      <span className="text-2xl font-bold text-orange-400">
                        {performance.performanceScore.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                        style={{ width: `${performance.performanceScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Weekly Trend Chart */}
                  {performance.weeklyTrend && performance.weeklyTrend.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-3">Weekly Completion Trend</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={performance.weeklyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                            }}
                          />
                          <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #334155",
                              borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#e2e8f0" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#f97316"
                            strokeWidth={2}
                            dot={{ fill: "#f97316", r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-400 mb-1">Avg Time</p>
                      <p className="text-lg font-bold text-slate-200">
                        {formatCompletionTime(performance.avgCompletionTime)}
                      </p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-400 mb-1">Completion</p>
                      <p className="text-lg font-bold text-slate-200">
                        {performance.completionRate.toFixed(1)}%
                      </p>
                    </div>
                    {performance.bestDay && (
                      <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-400 mb-1">Best Day</p>
                        <p className="text-lg font-bold text-slate-200">
                          {performance.bestDay.count} tasks
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl sticky top-24">
              <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <FaClock className="text-orange-400" />
                Recent Activity
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-slate-400 text-2xl" />
                </div>
              ) : activity.length === 0 ? (
                <div className="text-center py-8">
                  <FaTasks className="text-4xl text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {activity.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 hover:border-orange-500/50 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            item.activityType === "completed"
                              ? "bg-emerald-500/20"
                              : item.activityType === "in-progress"
                              ? "bg-yellow-500/20"
                              : "bg-amber-500/20"
                          }`}
                        >
                          {item.activityType === "completed" ? (
                            <FaCheckCircle className="text-emerald-400" />
                          ) : item.activityType === "in-progress" ? (
                            <FaClock className="text-yellow-400" />
                          ) : (
                            <FaTasks className="text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-200 mb-1">
                            {item.message}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatDate(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
  }, [value, loading, isPercentage]);

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
const ActionCard = ({ to, title, description, icon, gradient, onClick }) => {
  const content = (
    <div className="group relative bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer">
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
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  );

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return <Link to={to}>{content}</Link>;
};

export default AgentDashboard;
