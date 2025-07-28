import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import ChartCard from "@/components/organisms/ChartCard";
import TransactionForm from "@/components/organisms/TransactionForm";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency, formatTransactionDate } from "@/utils/formatters";
import transactionService from "@/services/api/transactionService";
import budgetService from "@/services/api/budgetService";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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
      setError("Failed to load dashboard data. Please try again.");
      console.error("Dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      const newTransaction = await transactionService.create(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (err) {
      toast.error("Failed to add transaction");
      console.error("Add transaction error:", err);
    }
  };

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  // Calculate financial metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  // Recent transactions
  const recentTransactions = transactions.slice(0, 5);

  // Spending by category data
  const expensesByCategory = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const spendingChartData = {
    series: Object.values(expensesByCategory),
    labels: Object.keys(expensesByCategory).map(cat => 
      cat.charAt(0).toUpperCase() + cat.slice(1)
    ),
  };

  // Monthly trend data (last 6 months)
  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === date.getMonth() && 
             transactionDate.getFullYear() === date.getFullYear();
    });

    const income = monthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyTrends.push({
      month: date.toLocaleDateString("en-US", { month: "short" }),
      income,
      expenses,
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
    categories: monthlyTrends.map(m => m.month),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-gray-600">Here's what's happening with your money</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowTransactionForm(true)}
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          icon="TrendingUp"
          trend="up"
          trendValue="12.5%"
          variant="success"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon="TrendingDown"
          trend="down"
          trendValue="3.2%"
          variant="error"
        />
        <StatCard
          title="Net Savings"
          value={formatCurrency(netSavings)}
          icon="DollarSign"
          trend={netSavings >= 0 ? "up" : "down"}
          trendValue={netSavings >= 0 ? "8.1%" : "2.1%"}
          variant={netSavings >= 0 ? "success" : "warning"}
        />
        <StatCard
          title="Budget Used"
          value={`${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}%`}
          icon="PieChart"
          trend="neutral"
          trendValue={`${formatCurrency(totalSpent)} of ${formatCurrency(totalBudget)}`}
          variant="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Spending by Category"
          data={spendingChartData}
          type="donut"
          height={350}
        />
        <ChartCard
          title="Income vs Expenses Trend"
          data={trendChartData}
          type="bar"
          height={350}
        />
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  transaction.type === "income" 
                    ? "bg-green-100 text-green-600" 
                    : "bg-red-100 text-red-600"
                }`}>
                  <ApperIcon 
                    name={transaction.type === "income" ? "ArrowUpRight" : "ArrowDownRight"} 
                    size={16} 
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{formatTransactionDate(transaction.date)}</p>
                </div>
              </div>
              <p className={`font-semibold ${
                transaction.type === "income" ? "text-green-600" : "text-red-600"
              }`}>
                {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
              </p>
            </div>
          ))}
          
          {recentTransactions.length === 0 && (
            <div className="text-center py-8">
              <ApperIcon name="Receipt" size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <Button 
                variant="primary" 
                size="sm"
                className="mt-2"
                onClick={() => setShowTransactionForm(true)}
              >
                Add Your First Transaction
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        onSubmit={handleAddTransaction}
      />
    </div>
  );
};

export default Dashboard;