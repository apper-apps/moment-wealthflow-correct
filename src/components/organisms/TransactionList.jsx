import React, { useState } from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency, formatTransactionDate, getCategoryColor, getTransactionTypeColor } from "@/utils/formatters";

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expenses" },
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "food", label: "Food & Dining" },
    { value: "transportation", label: "Transportation" },
    { value: "entertainment", label: "Entertainment" },
    { value: "shopping", label: "Shopping" },
    { value: "utilities", label: "Bills & Utilities" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "salary", label: "Salary" },
    { value: "freelance", label: "Freelance" },
    { value: "investment", label: "Investment" },
    { value: "other", label: "Other" },
  ];

  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "amount", label: "Amount" },
    { value: "description", label: "Description" },
  ];

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amount - a.amount;
        case "description":
          return a.description.localeCompare(b.description);
        case "date":
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm("")}
            placeholder="Search transactions..."
          />
          
          <FilterDropdown
            label="Filter by type"
            options={typeOptions}
            value={typeFilter}
            onChange={setTypeFilter}
          />
          
          <FilterDropdown
            label="Filter by category"
            options={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
          
          <FilterDropdown
            label="Sort by"
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
          />
        </div>
      </Card>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.Id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  transaction.type === "income" 
                    ? "bg-gradient-to-br from-green-100 to-green-200" 
                    : "bg-gradient-to-br from-red-100 to-red-200"
                }`}>
                  <ApperIcon 
                    name={transaction.type === "income" ? "TrendingUp" : "TrendingDown"} 
                    size={20} 
                    className={transaction.type === "income" ? "text-green-600" : "text-red-600"} 
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      {transaction.description}
                    </h3>
                    <Badge className={getCategoryColor(transaction.category)}>
                      {transaction.category}
                    </Badge>
                    {transaction.recurring && (
                      <Badge variant="info">Recurring</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatTransactionDate(transaction.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className={`font-semibold text-lg ${getTransactionTypeColor(transaction.type)}`}>
                    {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                  >
                    <ApperIcon name="Edit" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(transaction.Id)}
                  >
                    <ApperIcon name="Trash2" size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredTransactions.length === 0 && (
          <Card className="p-8 text-center">
            <ApperIcon name="Search" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">
              {searchTerm || typeFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start by adding your first transaction"
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransactionList;