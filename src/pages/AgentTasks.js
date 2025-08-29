// pages/AgentTasks.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaPhoneAlt, FaTasks, FaTrash, FaCheckCircle } from "react-icons/fa";
import { MdManageAccounts, MdDashboard, MdPendingActions } from "react-icons/md";

const AgentTasks = () => {
  const agent = JSON.parse(localStorage.getItem("user"));
  const agentId = agent._id;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [filter, setFilter] = useState("all"); // "all", "completed", "pending"

  const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://taskflow-server-qmtw.onrender.com/api/tasks/${agentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [agentId]);

  useEffect(() => {
    // Clear messages after 3 seconds
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleDeleteClick = (taskId) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleTaskDeletion = async (id) => {
    try {
      await axios.delete(`https://taskflow-server-qmtw.onrender.com/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks(tasks.filter((task) => task._id !== id));
      setSuccess("Task deleted successfully!");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting Task:", error);
      setError("Failed to delete Task.");
      setIsDeleteModalOpen(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
    const res =  await axios.post(
        `https://taskflow-server-qmtw.onrender.com/api/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    
      const updatedTask = res.data;

      // Update the task in the local state
      setTasks(tasks.map(task => 
        task._id === updatedTask._id ? updatedTask:task
      ));
      
      setSuccess(`Task marked as ${newStatus.toLowerCase()}`);
    } catch (err) {
      console.error("Failed to update task status:", err);
      setError("Failed to update task status.");
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.status === "completed";
    if (filter === "pending") return task.status === "pending";
    return true;
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#1a2329] to-[#2f3c48] px-4 py-8">
      <div className="w-full max-w-4xl bg-[#1f2a32] rounded-xl shadow-xl p-6 relative">
        {/* Notification Messages */}
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-200 p-3 rounded-lg text-red-500 border border-red-600 mb-4 z-10 max-w-md">
            {error}
          </div>
        )}
        {success && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-200 p-3 rounded-lg border border-green-600 text-green-500 mb-4 z-10 max-w-md">
            {success}
          </div>
        )}

        <h2 className="text-3xl font-bold flex justify-center items-center gap-3 text-center text-yellow-500 mb-6">
          <FaTasks /> Agent Task List
        </h2>

        <a
          href="/agent/dashboard"
          className="absolute left-8 top-3 w-auto p-3 text-[1.1rem] text-center bg-gradient-to-r from-[#ff5d57] to-[#ff9b50] text-white py-3 rounded-lg font-bold hover:from-[#ff9b50] hover:to-[#ff5d57] transition-all transform hover:scale-105 flex items-center gap-2"
        >
          <MdDashboard />
          Dashboard
        </a>

        {/* Filter Controls */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === "all"
                ? "bg-yellow-500 text-gray-900"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              filter === "pending"
                ? "bg-red-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            <MdPendingActions /> Pending
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              filter === "completed"
                ? "bg-green-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            <FaCheckCircle /> Completed
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-300 py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mb-2"></div>
            <p>Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {filter === "all" ? "No tasks assigned." : `No ${filter} tasks.`}
          </div>
        ) : (
          <div>
            <ul className="space-y-4">
              {filteredTasks.map((task) => (
                <li
                  key={task._id}
                  className="border border-gray-700 rounded-lg p-4 bg-[#2d3b45] hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-400 flex gap-2 uppercase">
                        <span className="text-red-500">Task:</span> {task.notes}
                      </h3>
                      <h3 className="text-lg text-white flex items-center gap-2 mt-2">
                        <MdManageAccounts />
                        Name: {task.firstName}
                      </h3>
                      <h3 className="text-lg text-white flex items-center gap-2 mt-2">
                        <FaPhoneAlt />
                        Phone: {task.phone}
                      </h3>
                      <p className="text-sm text-gray-300 mt-3">
                        {task.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(task._id);
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete task"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                      
                     {task.status === "pending" ? (
                        <button
                          onClick={() => handleStatusUpdate(task._id, "in-progress")}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-yellow-700 transition-colors"
                        >
                          <MdPendingActions /> Start Progress
                        </button>
                      ) : task.status === "in-progress" ? (
                        <button
                          onClick={() => handleStatusUpdate(task._id, "completed")}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-green-700 transition-colors"
                        >
                          <FaCheckCircle /> Mark Complete
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusUpdate(task._id, "pending")}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-gray-700 transition-colors"
                        >
                          <MdPendingActions /> Mark Pending
                        </button>
                      )}
                    </div>
                  </div>

                  

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700">
                    <p className="text-sm font-medium text-white">
                      Status:{" "}
                      <span
                        className={`font-semibold uppercase ${
                          task.status === "completed"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {task.status}
                      </span>
                    </p>
                    
                    <p className="text-xs text-gray-300">
                      Created: {new Date(task.date).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      
        {/* Confirmation Modal - Now properly placed inside the return statement */}
        <ConfirmationModal
          isOpen={  isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => handleTaskDeletion(taskToDelete)}
          message="Are you sure you want to delete this task?"
        />
      </div>
    </div>
  );
};

export default AgentTasks;


