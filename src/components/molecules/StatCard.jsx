import React from "react";
import { cn } from "@/utils/cn";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  variant = "default",
  className 
}) => {
  const variants = {
    default: "from-white to-gray-50",
    primary: "from-primary/5 to-primary/10",
    success: "from-accent/5 to-accent/10",
    warning: "from-warning/5 to-warning/10",
    error: "from-error/5 to-error/10",
  };

  const trendColors = {
    up: "text-green-600 bg-green-100",
    down: "text-red-600 bg-red-100",
    neutral: "text-gray-600 bg-gray-100",
  };

  return (
    <Card className={cn(
      "p-6 bg-gradient-to-br",
      variants[variant],
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 count-animation">
            {value}
          </p>
          
          {trend && trendValue && (
            <div className="flex items-center mt-2 space-x-1">
              <span className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                trendColors[trend]
              )}>
                <ApperIcon 
                  name={trend === "up" ? "TrendingUp" : trend === "down" ? "TrendingDown" : "Minus"} 
                  size={12} 
                  className="mr-1" 
                />
                {trendValue}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center">
              <ApperIcon name={icon} size={24} className="text-primary" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;