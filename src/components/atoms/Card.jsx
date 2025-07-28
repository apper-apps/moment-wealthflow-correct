import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  className, 
  variant = "default",
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-white shadow-card",
    glass: "bg-white/80 backdrop-blur-sm border border-white/20 shadow-glass",
    gradient: "bg-gradient-to-br from-white to-gray-50 shadow-elevated",
    elevated: "bg-white shadow-elevated",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-gray-100 transition-all duration-200 card-hover",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;