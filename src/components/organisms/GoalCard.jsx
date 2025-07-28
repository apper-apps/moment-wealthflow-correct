import React from "react";
import Card from "@/components/atoms/Card";
import Progress from "@/components/atoms/Progress";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency, calculateProgress, formatRelativeDate } from "@/utils/formatters";

const GoalCard = ({ goal, onEdit }) => {
  const progressPercentage = calculateProgress(goal.currentAmount, goal.targetAmount);
  const remaining = goal.targetAmount - goal.currentAmount;
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isCompleted 
              ? "bg-gradient-to-br from-green-100 to-green-200" 
              : "bg-gradient-to-br from-primary/10 to-primary/20"
          }`}>
            <ApperIcon 
              name={isCompleted ? "CheckCircle" : "Target"} 
              size={20} 
              className={isCompleted ? "text-green-600" : "text-primary"} 
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {goal.name}
            </h3>
            <p className="text-sm text-gray-500">
              Target: {formatRelativeDate(goal.targetDate)}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onEdit(goal)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ApperIcon name="Edit" size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">
            {progressPercentage.toFixed(0)}%
          </span>
        </div>

        <Progress
          value={progressPercentage}
          variant={isCompleted ? "success" : "primary"}
          size="md"
        />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Saved</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(goal.currentAmount)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Target</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(goal.targetAmount)}
            </p>
          </div>
        </div>

        {isCompleted ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <ApperIcon name="CheckCircle" size={16} className="text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800 font-medium">
              Goal completed! 🎉
            </p>
          </div>
        ) : (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">{formatCurrency(remaining)}</span> remaining to reach your goal
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GoalCard;