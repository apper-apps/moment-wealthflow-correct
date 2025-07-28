import React, { useEffect, useState } from "react";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { toast } from "react-toastify";
import transactionService from "@/services/api/transactionService";
import budgetService from "@/services/api/budgetService";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import ChartCard from "@/components/organisms/ChartCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import { formatCurrency } from "@/utils/formatters";

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [timeRange, setTimeRange] = useState("6months");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleExport = () => {
    try {
      toast.info("Preparing report export...");

      // Calculate data for export
      const monthsToShow = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
      const startDate = startOfMonth(subMonths(new Date(), monthsToShow - 1));
      const endDate = endOfMonth(new Date());
      
      const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      // Prepare CSV data
      let csvContent = "WealthFlow Financial Report\n";
      csvContent += `Generated: ${format(new Date(), "MMM dd, yyyy 'at' HH:mm")}\n`;
      csvContent += `Period: ${format(startDate, "MMM yyyy")} - ${format(endDate, "MMM yyyy")}\n\n`;

      // Summary section
      const totalIncome = filteredTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = filteredTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
      const netSavings = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

      csvContent += "FINANCIAL SUMMARY\n";
      csvContent += "Metric,Amount\n";
      csvContent += `Total Income,${formatCurrency(totalIncome)}\n`;
      csvContent += `Total Expenses,${formatCurrency(totalExpenses)}\n`;
      csvContent += `Net Savings,${formatCurrency(netSavings)}\n`;
      csvContent += `Savings Rate,${savingsRate.toFixed(1)}%\n\n`;

      // Monthly trends
      csvContent += "MONTHLY TRENDS\n";
      csvContent += "Month,Income,Expenses,Savings\n";
      
      for (let i = 0; i < monthsToShow; i++) {
        const monthStart = startOfMonth(subMonths(new Date(), monthsToShow - 1 - i));
        const monthEnd = endOfMonth(monthStart);
        const monthTransactions = filteredTransactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= monthStart && transactionDate <= monthEnd;
        });
        
        const income = monthTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
        const savings = income - expenses;
        
        csvContent += `${format(monthStart, "MMM yyyy")},${formatCurrency(income)},${formatCurrency(expenses)},${formatCurrency(savings)}\n`;
      }

      // Expense categories
      const expensesByCategory = {};
      filteredTransactions.filter(t => t.type === "expense").forEach(transaction => {
        expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
      });

      csvContent += "\nEXPENSE BREAKDOWN BY CATEGORY\n";
      csvContent += "Category,Amount,Percentage\n";
      Object.entries(expensesByCategory)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, amount]) => {
          const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
          csvContent += `${category},${formatCurrency(amount)},${percentage.toFixed(1)}%\n`;
        });

      // Income categories
      const incomeByCategory = {};
      filteredTransactions.filter(t => t.type === "income").forEach(transaction => {
        incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount;
      });

      if (Object.keys(incomeByCategory).length > 0) {
        csvContent += "\nINCOME BREAKDOWN BY CATEGORY\n";
        csvContent += "Category,Amount,Percentage\n";
        Object.entries(incomeByCategory)
          .sort(([,a], [,b]) => b - a)
          .forEach(([category, amount]) => {
            const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
            csvContent += `${category},${formatCurrency(amount)},${percentage.toFixed(1)}%\n`;
          });
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `wealthflow-report-${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Financial report exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report. Please try again.");
    }
  };

const timeRangeOptions = [
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "12months", label: "Last 12 Months" },
  ];

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [transactionsData, budgetsData] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll()
      ]);
      
      setTransactions(transactionsData);
      setBudgets(budgetsData);
    } catch (err) {
      setError("Failed to load reports data. Please try again.");
      console.error("Reports loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadReportsData} />;

  // Calculate time range
  const monthsToShow = parseInt(timeRange.replace("months", ""));
  const startDate = startOfMonth(subMonths(new Date(), monthsToShow - 1));
  const endDate = endOfMonth(new Date());

  // Filter transactions by time range
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Monthly trend data
  const monthlyTrends = [];
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(new Date(), i));
    const monthEnd = endOfMonth(subMonths(new Date(), i));
    
    const monthTransactions = filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const income = monthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyTrends.push({
      month: format(monthStart, "MMM yyyy"),
      income,
      expenses,
      savings: income - expenses,
    });
  }

  const trendChartData = {
    series: [
      {
        name: "Income",
        data: monthlyTrends.map(m => m.income),
      },
      {
        name: "Expenses", 
        data: monthlyTrends.map(m => m.expenses),
      },
    ],
    categories: monthlyTrends.map(m => m.month.replace(" ", "\n")),
  };

  // Spending by category
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const categoryChartData = {
    series: Object.values(expensesByCategory),
    labels: Object.keys(expensesByCategory).map(cat => 
      cat.charAt(0).toUpperCase() + cat.slice(1)
    ),
  };

  // Income sources
  const incomeByCategory = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const incomeChartData = {
    series: Object.values(incomeByCategory),
    labels: Object.keys(incomeByCategory).map(cat => 
      cat.charAt(0).toUpperCase() + cat.slice(1)
    ),
  };

  // Savings trend
  const savingsChartData = {
    series: [
      {
        name: "Net Savings",
        data: monthlyTrends.map(m => m.savings),
      },
    ],
    categories: monthlyTrends.map(m => m.month.replace(" ", "\n")),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Analyze your financial patterns and trends</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-40"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          
<Button variant="outline" size="sm" onClick={handleExport}>
            <ApperIcon name="Download" size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          icon="TrendingUp"
          variant="success"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon="TrendingDown"
          variant="error"
        />
        <StatCard
          title="Net Savings"
          value={formatCurrency(netSavings)}
          icon="DollarSign"
          variant={netSavings >= 0 ? "success" : "warning"}
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon="Percent"
          variant="primary"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <ChartCard
          title="Income vs Expenses Trend"
          data={trendChartData}
          type="bar"
          height={350}
        />

        {/* Spending by Category */}
        <ChartCard
          title="Spending by Category"
          data={categoryChartData}
          type="donut"
          height={350}
        />

        {/* Income Sources */}
        <ChartCard
          title="Income Sources"
          data={incomeChartData}
          type="donut"
          height={350}
        />

        {/* Savings Trend */}
        <ChartCard
          title="Net Savings Trend"
          data={savingsChartData}
          type="bar"
          height={350}
        />
      </div>

      {/* Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ApperIcon name="Lightbulb" size={20} className="mr-2 text-yellow-500" />
          Financial Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Average Monthly Income</h4>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(totalIncome / monthsToShow)}
            </p>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-900 mb-2">Average Monthly Expenses</h4>
            <p className="text-2xl font-bold text-red-700">
              {formatCurrency(totalExpenses / monthsToShow)}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Average Monthly Savings</h4>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(netSavings / monthsToShow)}
            </p>
          </div>
        </div>

        {/* Top Categories */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top Expense Categories</h4>
            <div className="space-y-2">
              {Object.entries(expensesByCategory)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700 capitalize">{category}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Income Sources</h4>
            <div className="space-y-2">
              {Object.entries(incomeByCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700 capitalize">{category}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;