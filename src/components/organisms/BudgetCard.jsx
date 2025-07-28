import React from "react";
import Card from "@/components/atoms/Card";
import Progress from "@/components/atoms/Progress";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency, calculateProgress, getCategoryColor } from "@/utils/formatters";

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const progressPercentage = calculateProgress(budget.spent, budget.limit);
  const remaining = budget.limit - budget.spent;
  const isOverBudget = budget.spent > budget.limit;

  const getProgressVariant = () => {
    if (isOverBudget) return "error";
    if (progressPercentage >= 75) return "warning";
    return "success";
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
            <ApperIcon name="PieChart" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">
              {budget.category}
            </h3>
            <Badge className={getCategoryColor(budget.category)}>
              {budget.period}
            </Badge>
          </div>
        </div>
<div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(budget)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="Edit" size={16} />
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ApperIcon name="Trash2" size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Spent</span>
          <span className={`font-semibold ${isOverBudget ? "text-red-600" : "text-gray-900"}`}>
            {formatCurrency(budget.spent)}
          </span>
        </div>

        <Progress
          value={progressPercentage}
          variant={getProgressVariant()}
          size="md"
        />

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {isOverBudget ? "Over budget" : "Remaining"}
          </span>
          <span className={`font-medium ${
            isOverBudget ? "text-red-600" : remaining < budget.limit * 0.1 ? "text-yellow-600" : "text-green-600"
          }`}>
            {formatCurrency(Math.abs(remaining))}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Budget</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(budget.limit)}
            </span>
          </div>
        </div>
      </div>

      {isOverBudget && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <ApperIcon name="AlertTriangle" size={16} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">
            You've exceeded your budget by {formatCurrency(Math.abs(remaining))}
          </p>
        </div>
      )}
    </Card>
  );
};

export default BudgetCard;