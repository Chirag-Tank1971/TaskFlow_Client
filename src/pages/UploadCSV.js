import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUpload,
  FaHome,
  FaTasks,
  FaChartBar,
  FaUserCircle,
  FaSignOutAlt,
  FaBell,
  FaSpinner,
  FaFileCsv,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaDownload,
  FaInfoCircle,
  FaClock,
  FaFileAlt,
  FaTrash,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../config/api";

const UploadCSV = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadStats, setUploadStats] = useState({
    totalUploads: 0,
    successfulUploads: 0,
    failedUploads: 0,
    lastUploadDate: null,
    totalTasksCreated: 0,
    successRate: 0,
    avgTasksPerUpload: 0,
  });
  const [uploadHistory, setUploadHistory] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [userName, setUserName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null); // Progress tracking
  const navigate = useNavigate();

  useEffect(() => {
    // Get user name
    const name = localStorage.getItem("userName");
    setUserName(name || "Admin");

    // Fetch upload stats and history
    fetchUploadStats();
    fetchUploadHistory();
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

  const fetchUploadStats = async () => {
    try {
      setStatsLoading(true);
      const token = getToken();
      if (!token) {
        setStatsLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/upload/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUploadStats(response.data);
    } catch (err) {
      console.error("Upload Stats Error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUploadHistory = async () => {
    try {
      setHistoryLoading(true);
      const token = getToken();
      if (!token) {
        setHistoryLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/upload/history?limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUploadHistory(response.data);
    } catch (err) {
      console.error("Upload History Error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const validExtensions = [".csv", ".xlsx", ".xls"];

    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (
      !validTypes.includes(selectedFile.type) &&
      !validExtensions.includes(fileExtension)
    ) {
      setError("Please select a valid CSV or Excel file (.csv, .xlsx, .xls)");
      toast.error("Invalid file type. Please select a CSV or Excel file.");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError("File size exceeds 10MB limit");
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setFile(selectedFile);
    setFilePreview({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type || "Unknown",
    });
    setError("");
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    setError("");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file first!");
      toast.error("Please select a file first!");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("No authentication token found! Please log in again.");
      toast.error("Authentication required. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");
    setUploadProgress(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const jobId = response.data.jobId;
      
      if (!jobId) {
        throw new Error("No job ID received from server");
      }

      // Initialize progress
      setUploadProgress({
        status: 'initializing',
        currentStep: 'Starting upload...',
        progress: 0,
        totalTasks: 0,
        processedTasks: 0,
        categorizedTasks: 0,
        defaultTasks: 0,
        rateLimitHit: false
      });

      // Poll progress with authenticated requests
      const pollProgress = async () => {
        let pollCount = 0;
        const maxPolls = 1200; // 10 minutes max (1200 * 500ms)
        
        const pollInterval = setInterval(async () => {
          pollCount++;
          
          try {
            const progressResponse = await axios.get(
              `${API_BASE_URL}/api/upload/progress/${jobId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const progress = progressResponse.data;
            setUploadProgress(progress);

            // Check if completed or failed
            if (progress.status === 'completed' || progress.status === 'failed') {
              clearInterval(pollInterval);
              setLoading(false);

              if (progress.status === 'completed') {
                // Show success toast
                toast.success("File uploaded and tasks distributed successfully!", {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });

                // Show rate limit warning if applicable
                if (progress.rateLimitHit) {
                  const { categorizedTasks, defaultTasks } = progress;
                  toast.warning(
                    `AI rate limit reached. ${categorizedTasks} tasks categorized, ${defaultTasks} tasks set to default category.`,
                    {
                      position: "top-right",
                      autoClose: 5000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                    }
                  );
                }

                // Clear the file input
                setFile(null);
                setFilePreview(null);

                // Refresh stats and history
                await Promise.all([fetchUploadStats(), fetchUploadHistory()]);
              } else if (progress.status === 'failed') {
                toast.error(progress.error || "Upload failed. Please try again.", {
                  position: "top-right",
                  autoClose: 5000,
                });
                setError(progress.error || "Upload failed");
              }

              // Clear progress after 3 seconds
              setTimeout(() => {
                setUploadProgress(null);
              }, 3000);
            }
          } catch (err) {
            console.error("Progress polling error:", err);
            // Continue polling unless it's a 404 (job not found)
            if (err.response?.status === 404) {
              clearInterval(pollInterval);
              setLoading(false);
              setUploadProgress(null);
              toast.error("Upload job not found. Please try uploading again.", {
                position: "top-right",
                autoClose: 5000,
              });
            }
          }

          // Timeout after max polls
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            setLoading(false);
            setUploadProgress(prev => {
              if (prev && prev.status !== 'completed' && prev.status !== 'failed') {
                toast.error("Upload timeout. Please check the upload status.", {
                  position: "top-right",
                  autoClose: 5000,
                });
              }
              return null;
            });
          }
        }, 500); // Poll every 500ms for smooth updates
      };

      // Start polling
      pollProgress();

    } catch (err) {
      console.error("Upload Error:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.message || "Error uploading file. Please try again.";
      setError(errorMessage);

      toast.error(errorMessage, {
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

  const downloadSampleTemplate = () => {
    const csvContent =
      "FirstName,Phone,Notes\nJohn Doe,1234567890,Sample task notes\nJane Smith,0987654321,Another sample task";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "taskflow_sample_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Toast Container */}
      <ToastContainer />

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

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="px-3 py-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/agents"
                className="px-3 py-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Agents
              </Link>
              <Link
                to="/upload"
                className="px-3 py-2 text-indigo-400 font-semibold transition-colors text-sm"
              >
                Upload CSV
              </Link>
              <Link
                to="/analytics"
                className="px-3 py-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
              >
                Analytics
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                <FaBell className="text-lg" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <FaUserCircle className="text-slate-400 text-xl" />
                <span className="text-sm font-medium hidden sm:inline">{userName}</span>
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
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
                <FaUpload className="text-4xl" />
                Upload CSV
              </h1>
              <p className="text-slate-200 text-lg md:text-xl">
                Import tasks from CSV file and distribute them automatically to agents
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Uploads"
            value={uploadStats.totalUploads}
            icon={<FaUpload className="text-2xl" />}
            gradient="from-indigo-500 to-indigo-600"
            loading={statsLoading}
          />
          <StatCard
            title="Successful"
            value={uploadStats.successfulUploads}
            icon={<FaCheckCircle className="text-2xl" />}
            gradient="from-emerald-500 to-emerald-600"
            loading={statsLoading}
          />
          <StatCard
            title="Failed"
            value={uploadStats.failedUploads}
            icon={<FaExclamationTriangle className="text-2xl" />}
            gradient="from-red-500 to-red-600"
            loading={statsLoading}
          />
          <StatCard
            title="Success Rate"
            value={`${uploadStats.successRate.toFixed(1)}%`}
            icon={<FaChartBar className="text-2xl" />}
            gradient="from-purple-500 to-purple-600"
            loading={statsLoading}
          />
        </div>

        {/* Main Upload Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Upload Section - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Drag & Drop Upload Area */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-slate-200 flex items-center gap-2">
                <FaFileCsv className="text-indigo-400" />
                Select CSV File
              </h2>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-slate-600 hover:border-slate-500"
                }`}
              >
                {filePreview ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="p-4 bg-indigo-500/20 rounded-full">
                        <FaFileCsv className="text-4xl text-indigo-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-200 mb-1">
                        {filePreview.name}
                      </p>
                      <p className="text-sm text-slate-400">
                        {formatFileSize(filePreview.size)} • {filePreview.type}
                      </p>
                    </div>
                    <button
                      onClick={removeFile}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all flex items-center space-x-2 mx-auto text-sm font-medium border border-red-600/30"
                    >
                      <FaTrash />
                      <span>Remove File</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="p-4 bg-slate-700/50 rounded-full">
                        <FaUpload className="text-4xl text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-200 mb-2">
                        Drag & drop your CSV file here
                      </p>
                      <p className="text-sm text-slate-400 mb-4">or</p>
                      <label className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all cursor-pointer font-medium">
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                        Browse Files
                      </label>
                      <p className="text-xs text-slate-500 mt-3">
                        Supported formats: CSV, XLSX, XLS (Max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FaUpload />
                    <span>Upload & Distribute Tasks</span>
                  </>
                )}
              </button>

              {/* Progress Bar */}
              {uploadProgress && (
                <div className="mt-6 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-300">
                        {uploadProgress.currentStep || 'Processing...'}
                      </span>
                      <span className="text-sm font-bold text-indigo-400">
                        {uploadProgress.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                        style={{ width: `${uploadProgress.progress || 0}%` }}
                      >
                        {uploadProgress.progress > 10 && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Details */}
                  {uploadProgress.totalTasks > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700/50">
                      <div className="text-center">
                        <p className="text-xs text-slate-400 mb-1">Tasks Processed</p>
                        <p className="text-lg font-bold text-slate-200">
                          {uploadProgress.processedTasks || 0} / {uploadProgress.totalTasks}
                        </p>
                      </div>
                      {uploadProgress.status === 'categorizing' && (
                        <div className="text-center">
                          <p className="text-xs text-slate-400 mb-1">AI Categorized</p>
                          <p className="text-lg font-bold text-emerald-400">
                            {uploadProgress.categorizedTasks || 0}
                          </p>
                        </div>
                      )}
                      {uploadProgress.rateLimitHit && (
                        <div className="col-span-2 mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                          <p className="text-xs text-amber-400 flex items-center gap-2">
                            <FaExclamationTriangle />
                            Rate limit reached. Remaining tasks set to default category.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mt-4 flex items-center justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      uploadProgress.status === 'completed' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : uploadProgress.status === 'failed'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}>
                      {uploadProgress.status === 'parsing' && '📄 Parsing CSV'}
                      {uploadProgress.status === 'categorizing' && '🤖 Categorizing Tasks'}
                      {uploadProgress.status === 'saving' && '💾 Saving to Database'}
                      {uploadProgress.status === 'completed' && '✅ Completed'}
                      {uploadProgress.status === 'failed' && '❌ Failed'}
                      {uploadProgress.status === 'initializing' && '⚙️ Initializing'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* CSV Format Guide */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl overflow-hidden">
              <button
                onClick={() => setShowFormatGuide(!showFormatGuide)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
              >
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <FaInfoCircle className="text-indigo-400" />
                  CSV Format Guide
                </h3>
                {showFormatGuide ? (
                  <FaTimes className="text-slate-400" />
                ) : (
                  <FaInfoCircle className="text-slate-400" />
                )}
              </button>

              {showFormatGuide && (
                <div className="p-6 pt-0 space-y-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-sm text-slate-300 mb-3">
                      Your CSV file must include the following columns (case-insensitive):
                    </p>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-center gap-2">
                        <FaCheckCircle className="text-emerald-400" />
                        <span>
                          <strong className="text-slate-300">FirstName</strong> - Customer's first name
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FaCheckCircle className="text-emerald-400" />
                        <span>
                          <strong className="text-slate-300">Phone</strong> - Customer's phone number
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FaCheckCircle className="text-emerald-400" />
                        <span>
                          <strong className="text-slate-300">Notes</strong> - Task notes or description
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <p className="text-sm text-slate-300 mb-2 font-semibold">Example Format:</p>
                    <div className="bg-slate-900/50 rounded p-3 overflow-x-auto">
                      <pre className="text-xs text-slate-400">
                        {`FirstName,Phone,Notes
John Doe,1234567890,Follow up on inquiry
Jane Smith,0987654321,Schedule appointment`}
                      </pre>
                    </div>
                  </div>

                  <button
                    onClick={downloadSampleTemplate}
                    className="w-full px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium border border-indigo-600/30"
                  >
                    <FaDownload />
                    <span>Download Sample Template</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Uploads Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl sticky top-24">
              <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <FaClock className="text-indigo-400" />
                Recent Uploads
              </h3>

              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-slate-400 text-2xl" />
                </div>
              ) : uploadHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FaFileAlt className="text-4xl text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No uploads yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {uploadHistory.map((upload) => (
                    <div
                      key={upload.id}
                      className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {upload.filename}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDate(upload.createdAt)}
                          </p>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2 ${
                            upload.status === "success"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : upload.status === "failed"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {upload.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <FaTasks />
                          {upload.tasksCreated} tasks
                        </span>
                        {upload.processingTime && (
                          <span className="flex items-center gap-1">
                            <FaClock />
                            {(upload.processingTime / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                      {upload.errorMessage && (
                        <p className="text-xs text-red-400 mt-2 truncate" title={upload.errorMessage}>
                          {upload.errorMessage}
                        </p>
                      )}
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

// Stat Card Component (Reusable)
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

export default UploadCSV;
