import React from "react";
import { FaFilter, FaTimes } from "react-icons/fa";

const CATEGORIES = ["All", "Support", "Sales", "Technical", "Billing", "Urgent", "General"];

const CategoryFilter = ({ selectedCategory, onCategoryChange, theme = "admin" }) => {
  const isAdminTheme = theme === "admin";
  const accentColorClass = isAdminTheme ? "text-indigo-400" : "text-orange-400";
  const activeBgClass = isAdminTheme ? "bg-indigo-500" : "bg-orange-500";

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaFilter className={accentColorClass} />
          <h3 className="font-semibold text-slate-200">Filter by Category</h3>
        </div>
        {selectedCategory !== "All" && (
          <button
            onClick={() => onCategoryChange("All")}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear filter"
          >
            <FaTimes />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === category
                ? `${activeBgClass} text-white shadow-lg transform scale-105`
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;

