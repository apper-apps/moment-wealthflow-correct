import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";

// Currency formatter
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Percentage formatter
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

// Date formatter for transactions
export const formatTransactionDate = (date) => {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return "Today";
  }
  
  if (isYesterday(dateObj)) {
    return "Yesterday";
  }
  
  return format(dateObj, "MMM d, yyyy");
};

// Relative date formatter
export const formatRelativeDate = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Month year formatter
export const formatMonthYear = (date) => {
  return format(new Date(date), "MMMM yyyy");
};

// Short date formatter
export const formatShortDate = (date) => {
  return format(new Date(date), "MMM d");
};

// Number formatter for large amounts
export const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Get category color
export const getCategoryColor = (category) => {
  const colors = {
    food: "bg-orange-100 text-orange-800 border-orange-200",
    transportation: "bg-blue-100 text-blue-800 border-blue-200",
    entertainment: "bg-purple-100 text-purple-800 border-purple-200",
    shopping: "bg-pink-100 text-pink-800 border-pink-200",
    utilities: "bg-yellow-100 text-yellow-800 border-yellow-200",
    healthcare: "bg-red-100 text-red-800 border-red-200",
    education: "bg-indigo-100 text-indigo-800 border-indigo-200",
    savings: "bg-green-100 text-green-800 border-green-200",
    salary: "bg-emerald-100 text-emerald-800 border-emerald-200",
    freelance: "bg-teal-100 text-teal-800 border-teal-200",
    investment: "bg-violet-100 text-violet-800 border-violet-200",
    other: "bg-gray-100 text-gray-800 border-gray-200",
  };
  
  return colors[category.toLowerCase()] || colors.other;
};

// Get transaction type color
export const getTransactionTypeColor = (type) => {
  return type === "income" 
    ? "text-green-600" 
    : "text-red-600";
};

// Calculate progress percentage
export const calculateProgress = (current, target) => {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

// Get progress color based on percentage
export const getProgressColor = (percentage) => {
  if (percentage >= 90) return "text-red-500";
  if (percentage >= 75) return "text-yellow-500";
  return "text-green-500";
};