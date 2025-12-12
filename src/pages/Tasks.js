import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

const Tasks = ({ agentId }) => {
  console.log("agentId:", agentId); // Debugging

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (agentId) {
      console.log("Fetching tasks for agentId:", agentId); // Debugging
      fetchTasks();
    } else {
      console.error("agentId is missing"); // Debugging
      setError("Agent ID is required.");
      setLoading(false);
    }
  }, [agentId]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    console.log("Token:", token); // Debugging

    if (!token) {
      setError("Unauthorized: Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/tasks/${agentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Tasks Data:", response.data); // Debugging

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
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Tasks Assigned</h2>

      {loading ? (
        <p className="text-center">Loading tasks...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="text-center">No tasks found.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task._id} className="border p-3 rounded-md">
              <strong>Name:</strong> {task.firstName} | <strong>Phone:</strong> {task.phone} | <strong>Notes:</strong> {task.notes}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tasks;