import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { 
  FaChartBar, 
  FaUsers, 
  FaTasks, 
  FaCheckCircle, 
  FaClock, 
  FaSpinner,
  FaArrowLeft
} from "react-icons/fa";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/api";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
  const [overallStats, setOverallStats] = useState(null);
  const [agentDistribution, setAgentDistribution] = useState([]);
  const [taskTrends, setTaskTrends] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get token - handle both JSON stringified and plain string formats
      let token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }
      
      // Try to parse, but if it fails, use as-is (handles both storage formats)
      try {
        token = JSON.parse(token);
      } catch (e) {
        // Token is already a plain string, use as-is
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [stats, distribution, trends, performance, recent] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/analytics/stats`, { headers }),
        axios.get(`${API_BASE_URL}/api/analytics/distribution`, { headers }),
        axios.get(`${API_BASE_URL}/api/analytics/trends`, { headers }),
        axios.get(`${API_BASE_URL}/api/analytics/performance`, { headers }),
        axios.get(`${API_BASE_URL}/api/analytics/recent`, { headers })
      ]);

      setOverallStats(stats.data);
      setAgentDistribution(distribution.data);
      setTaskTrends(trends.data);
      setAgentPerformance(performance.data);
      setRecentActivity(recent.data);
      setLoading(false);
    } catch (err) {
      console.error("Analytics Error:", err);
      setError(err.response?.data?.message || "Failed to load analytics data. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !overallStats) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
          <Link
            to="/dashboard"
            className="block mt-4 text-blue-400 hover:text-blue-300"
          >
            <FaArrowLeft className="inline mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const statusDistribution = overallStats ? [
    { name: "Completed", value: overallStats.completedTasks, color: "#00C49F" },
    { name: "Pending", value: overallStats.pendingTasks, color: "#FF8042" },
    { name: "In Progress", value: overallStats.inProgressTasks, color: "#FFBB28" }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FaChartBar className="text-blue-400" />
            Analytics Dashboard
          </h1>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
          >
            <FaArrowLeft />
            Back to Dashboard
          </Link>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Tasks"
            value={overallStats?.totalTasks || 0}
            icon={<FaTasks className="text-blue-400" />}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={overallStats?.completedTasks || 0}
            icon={<FaCheckCircle className="text-green-400" />}
            color="green"
          />
          <StatCard
            title="Pending"
            value={overallStats?.pendingTasks || 0}
            icon={<FaClock className="text-yellow-400" />}
            color="yellow"
          />
          <StatCard
            title="Completion Rate"
            value={`${overallStats?.completionRate || 0}%`}
            icon={<FaChartBar className="text-purple-400" />}
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Task Status Distribution Pie Chart */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Task Status Distribution</h2>
            {statusDistribution.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>

          {/* Task Distribution by Agent */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Tasks by Agent</h2>
            {agentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="agentName" 
                    stroke="#9CA3AF"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="#00C49F" name="Completed" />
                  <Bar dataKey="pending" fill="#FF8042" name="Pending" />
                  <Bar dataKey="inProgress" fill="#FFBB28" name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No agent data available
              </div>
            )}
          </div>
        </div>

        {/* Task Trends Over Time */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Task Trends (Last 30 Days)</h2>
          {taskTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={taskTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                  name="Pending"
                />
                <Line 
                  type="monotone" 
                  dataKey="inProgress" 
                  stroke="#FFBB28" 
                  strokeWidth={2}
                  name="In Progress"
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No trend data available
            </div>
          )}
        </div>

        {/* Agent Performance Table */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-400 flex items-center gap-2">
            <FaUsers />
            Agent Performance
          </h2>
          {agentPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 text-gray-300">Agent</th>
                    <th className="text-left p-3 text-gray-300">Total Tasks</th>
                    <th className="text-left p-3 text-gray-300">Completed</th>
                    <th className="text-left p-3 text-gray-300">Completion Rate</th>
                    <th className="text-left p-3 text-gray-300">Avg. Completion Time</th>
                  </tr>
                </thead>
                <tbody>
                  {agentPerformance.map((agent, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700 transition">
                      <td className="p-3">
                        <div>
                          <p className="font-semibold">{agent.agentName}</p>
                          <p className="text-sm text-gray-400">{agent.agentEmail}</p>
                        </div>
                      </td>
                      <td className="p-3">{agent.totalTasks}</td>
                      <td className="p-3 text-green-400">{agent.completedTasks}</td>
                      <td className="p-3">
                        <span className={`font-semibold ${
                          agent.completionRate >= 80 ? 'text-green-400' :
                          agent.completionRate >= 50 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {agent.completionRate?.toFixed(2) || 0}%
                        </span>
                      </td>
                      <td className="p-3">
                        {agent.avgCompletionTimeHours 
                          ? `${agent.avgCompletionTimeHours} hrs`
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No performance data available
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((task, index) => (
                <div 
                  key={index} 
                  className="bg-gray-700 p-4 rounded-lg flex justify-between items-center hover:bg-gray-600 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{task.firstName}</p>
                    <p className="text-sm text-gray-400 mt-1">{task.notes}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {task.agent?.name && `${task.agent.name} • `}
                      {new Date(task.createdAt || task.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      task.status === "completed"
                        ? "bg-green-500 text-white"
                        : task.status === "in-progress"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {task.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-500/20 border-blue-500",
    green: "bg-green-500/20 border-green-500",
    yellow: "bg-yellow-500/20 border-yellow-500",
    purple: "bg-purple-500/20 border-purple-500"
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4 hover:scale-105 transition-transform`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );
};

export default Analytics;

