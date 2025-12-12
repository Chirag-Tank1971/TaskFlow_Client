import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Agentlogin from "./pages/Agentlogin";
import Agentsignup from "./pages/Agentsignup";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AgentDashboard from "./pages/Agentdashboard";
import AgentTasks from "./pages/AgentTasks";
import Agents from "./pages/Agents";
import AgentEdit from "./pages/EditAgent"
import UploadCSV from "./pages/UploadCSV";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/agent/login" element={<Agentlogin />} />
        <Route path="/agent/signup" element={<Agentsignup />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/agent/dashboard" element={
          <ProtectedRoute>
            <AgentDashboard />
          </ProtectedRoute>

        } />

        <Route path="/agent/tasks" element={ 
          <ProtectedRoute>
            <AgentTasks/>
          </ProtectedRoute>

        } />

        <Route path="/agents" element={
          <ProtectedRoute>
            <Agents />
          </ProtectedRoute>

        } />

        <Route
          path="/agent/edit" element={
            <ProtectedRoute>
              <AgentEdit />
            </ProtectedRoute>
          }
        />
        <Route path="/upload" element={
          <ProtectedRoute>
            <UploadCSV />
          </ProtectedRoute>

        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/tasks/:agentId" element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
