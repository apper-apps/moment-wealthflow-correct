import React from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(({ 
  className, 
  type = "text", 
  label,
  error,
  as = "input",
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
{as === "textarea" ? (
        <textarea
          className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white resize-vertical min-h-[80px]",
            error && "border-red-300 focus:border-red-500 focus:ring-red-200",
            className
          )}
          ref={ref}
          {...props}
        />
      ) : (
        <input
          type={type}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white",
            error && "border-red-300 focus:border-red-500 focus:ring-red-200",
            className
          )}
          ref={ref}
          {...props}
        />
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;