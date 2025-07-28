import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency, formatShortDate } from "@/utils/formatters";
import { differenceInDays, isPast, isToday } from "date-fns";

const BillCard = ({ bill, onEdit, onTogglePaid }) => {
  const dueDate = new Date(bill.dueDate);
  const daysUntilDue = differenceInDays(dueDate, new Date());
  const isOverdue = isPast(dueDate) && !bill.isPaid;
  const isDueToday = isToday(dueDate);

  const getDueDateStatus = () => {
    if (bill.isPaid) return { text: "Paid", variant: "success" };
    if (isOverdue) return { text: "Overdue", variant: "error" };
    if (isDueToday) return { text: "Due Today", variant: "warning" };
    if (daysUntilDue <= 7) return { text: `${daysUntilDue} days left`, variant: "warning" };
    return { text: `${daysUntilDue} days left`, variant: "default" };
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-200 border-l-4 ${
      bill.isPaid 
        ? "border-l-green-500" 
        : isOverdue 
          ? "border-l-red-500" 
          : isDueToday 
            ? "border-l-yellow-500" 
            : "border-l-blue-500"
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            bill.isPaid 
              ? "bg-gradient-to-br from-green-100 to-green-200" 
              : isOverdue
                ? "bg-gradient-to-br from-red-100 to-red-200"
                : "bg-gradient-to-br from-primary/10 to-primary/20"
          }`}>
            <ApperIcon 
              name={bill.isPaid ? "CheckCircle" : "Calendar"} 
              size={20} 
              className={
                bill.isPaid 
                  ? "text-green-600" 
                  : isOverdue 
                    ? "text-red-600" 
                    : "text-primary"
              } 
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {bill.name}
            </h3>
            <p className="text-sm text-gray-500">
              Due: {formatShortDate(bill.dueDate)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={dueDateStatus.variant}>
            {dueDateStatus.text}
          </Badge>
          <button
            onClick={() => onEdit(bill)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="Edit" size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Amount</span>
          <span className="font-semibold text-lg text-gray-900">
            {formatCurrency(bill.amount)}
          </span>
        </div>

        {bill.recurring && (
          <div className="flex items-center space-x-2">
            <ApperIcon name="RotateCcw" size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">Recurring bill</span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100">
          <Button
            variant={bill.isPaid ? "success" : "primary"}
            size="sm"
            onClick={() => onTogglePaid(bill.Id)}
            className="w-full"
          >
            <ApperIcon 
              name={bill.isPaid ? "CheckCircle" : "Circle"} 
              size={16} 
              className="mr-2" 
            />
            {bill.isPaid ? "Paid" : "Mark as Paid"}
          </Button>
        </div>
      </div>

      {isOverdue && !bill.isPaid && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <ApperIcon name="AlertTriangle" size={16} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">
            This bill is {Math.abs(daysUntilDue)} day{Math.abs(daysUntilDue) !== 1 ? "s" : ""} overdue
          </p>
        </div>
      )}
    </Card>
  );
};

export default BillCard;