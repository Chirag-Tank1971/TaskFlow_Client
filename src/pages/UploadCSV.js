import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { FaHome, FaUpload, FaTasks } from "react-icons/fa"; // Icons from react-icons
import { ToastContainer, toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const UploadCSV = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook for navigation

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file first!");
      return;
    }

    const token =JSON.parse(localStorage.getItem("token"));
    
    if (!token) {
      setError("No authentication token found! Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("https://taskflow-server-qmtw.onrender.com/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Show success toast
      toast.success(response.data.message || "CSV uploaded and tasks distributed successfully!", {
        position: "top-right",
        autoClose: 3000, // Close after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Clear the file input
      setFile(null);
    } catch (err) {
      console.error("Upload Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Error uploading file. Please try again.");

      // Show error toast
      toast.error(err.response?.data?.message || "Error uploading file. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Toast Container */}
      <ToastContainer />

      {/* Go to Dashboard Button */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => navigate("/dashboard")} // Navigate to the dashboard
          className="flex items-center space-x-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-all"
        >
          <FaHome className="w-6 h-6" />
          <span>Go to Dashboard</span>
        </button>

        {/* Go to Tasks Button */}
        <button
          onClick={() => navigate("/agents")}// Navigate to the tasks page
          className="flex items-center space-x-2 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-all"
        >
          <FaTasks className="w-6 h-6" />
          <span>View Tasks</span>
        </button>
      </div>

      {/* Upload CSV Section */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-400 flex items-center justify-center space-x-2">
          <FaUpload className="w-6 h-6" />
          <span>Upload CSV</span>
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span>Uploading...</span>
              </span>
            ) : (
              "Upload"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadCSV;