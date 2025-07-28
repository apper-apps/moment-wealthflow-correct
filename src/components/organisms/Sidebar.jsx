import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ className }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Transactions", href: "/transactions", icon: "Receipt" },
    { name: "Budgets", href: "/budgets", icon: "PieChart" },
    { name: "Goals", href: "/goals", icon: "Target" },
    { name: "Bills", href: "/bills", icon: "Calendar" },
    { name: "Reports", href: "/reports", icon: "BarChart3" },
  ];

  return (
    <div className={cn(
      "flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm",
      className
    )}>
      {/* Logo */}
      <div className="flex items-center px-6 py-8">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <ApperIcon name="DollarSign" size={24} className="text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold gradient-text">WealthFlow</h1>
            <p className="text-xs text-gray-500">Finance Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-8">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105",
                    isActive
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:text-primary"
                  )}
                >
                  <ApperIcon
                    name={item.icon}
                    size={20}
                    className={cn(
                      "mr-3 flex-shrink-0 transition-colors",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-primary"
                    )}
                  />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="px-4 pb-6">
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <ApperIcon name="User" size={18} className="text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Demo User</p>
              <p className="text-xs text-gray-500">Premium Plan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;