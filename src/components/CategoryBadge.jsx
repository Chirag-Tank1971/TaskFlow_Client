import React from "react";
import {
  FaHeadset,
  FaDollarSign,
  FaCog,
  FaCreditCard,
  FaExclamationTriangle,
  FaTag,
} from "react-icons/fa";

const CategoryBadge = ({ category, size = "sm" }) => {
  const getCategoryConfig = (cat) => {
    const configs = {
      Support: {
        icon: FaHeadset,
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        label: "Support",
      },
      Sales: {
        icon: FaDollarSign,
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        label: "Sales",
      },
      Technical: {
        icon: FaCog,
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        label: "Technical",
      },
      Billing: {
        icon: FaCreditCard,
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        label: "Billing",
      },
      Urgent: {
        icon: FaExclamationTriangle,
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        label: "Urgent",
      },
      General: {
        icon: FaTag,
        color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
        label: "General",
      },
    };
    return configs[cat] || configs.General;
  };

  const config = getCategoryConfig(category);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.color} ${sizeClasses[size]}`}
      title={`Category: ${config.label}`}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};

export default CategoryBadge;

