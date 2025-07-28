import React from "react";
import { cn } from "@/utils/cn";

const Progress = React.forwardRef(({ 
  className, 
  value = 0,
  variant = "primary",
  size = "md",
  showLabel = false,
  ...props 
}, ref) => {
  const variants = {
    primary: "bg-gradient-to-r from-primary to-blue-600",
    success: "bg-gradient-to-r from-accent to-green-600",
    warning: "bg-gradient-to-r from-warning to-orange-600",
    error: "bg-gradient-to-r from-error to-red-600",
  };

  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{clampedValue.toFixed(0)}%</span>
        </div>
      )}
      <div
        ref={ref}
        className={cn(
          "w-full bg-gray-200 rounded-full overflow-hidden",
          sizes[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "transition-all duration-500 ease-out rounded-full shadow-sm",
            variants[variant]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
});

Progress.displayName = "Progress";

export default Progress;