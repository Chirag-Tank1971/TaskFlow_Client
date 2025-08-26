import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBackspace } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const EditAgent = () => {
  const [agent, setAgent] = useState({ name: "", email: "", mobile: "", status:"" , id:"" });
  const [selectedStatus, setSelectedStatus] = useState("");
  const navigate = useNavigate();
  const agentStatus = [
    { name: "Available" },
    { name: "Not-Available" },
    { name: "Decommissioned" },
  ];

  // Fetch agent data from localStorage or API
  useEffect(() => {
    const storedAgent = JSON.parse(localStorage.getItem("user"));
    if (storedAgent) {
      setAgent({
        name: storedAgent.name || "",
        email: storedAgent.email || "",
        mobile: storedAgent.mobile || "",
        status:storedAgent.status || '',
        id:storedAgent._id
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(selectedStatus !== agent.status && selectedStatus !== ''){
       agent.status = selectedStatus
    }

    try {
      console.log(agent.status)
      const res = await axios.post(
        "https://taskflow-server-qmtw.onrender.com/api/agents/update",
        { agent },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Agent details updated successfully");
      console.log(res.data);
      localStorage.setItem("user" , JSON.stringify(res.data))
      navigate("/agent/dashboard")
    } catch (err) {
      console.error(err);
      alert("Failed to update agent");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl shadow-xl space-y-5 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text">Edit Agent Details</h2>

        <div>
          <label className="text-l font-semibold text-gray-300" for="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={agent.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-l font-semibold text-gray-300" for="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={agent.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-l font-semibold text-gray-300" for="mobile">Phone No.</label>
          <input
            id="mobile"
            type="text"
            name="mobile"
            value={agent.mobile}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full p-3 rounded bg-gray-700 text-white focus:outline-none"
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-l font-semibold text-gray-300" for="status">Status:</label>
          <select
            id="status"
            value={selectedStatus || agent.status}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-3 bg-green-500 text-red font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select Status
            </option>
            {agentStatus.map((status) => (
              <option key={status.name} value={status.name}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-5">
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded font-medium transition"
        >
          Update Details
        </button>

        <a
          href="/agent/dashboard"
          className=" flex items-center justify-center gap-3  w-full inline-block  bg-red-600 hover:bg-red-700 py-3 rounded font-medium transition cursor-pointer"
        >
         Go Back <FaBackspace className="text-xl" /> 
        </a>
        </div>  
        
      </form>
    </div>
  );
};

export default EditAgent;
