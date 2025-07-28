import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BankConnectionModal from "@/components/organisms/BankConnectionModal";
import transactionService from "@/services/api/transactionService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import TransactionList from "@/components/organisms/TransactionList";
import TransactionForm from "@/components/organisms/TransactionForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isBankConnectionOpen, setIsBankConnectionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
const [transactionsPerPage] = useState(10);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getAll();
      setTransactions(data || []);
      setFilteredTransactions(data || []);
    } catch (err) {
      setError("Failed to load transactions");
      console.error("Transactions loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (transactionData) => {
    try {
      if (editingTransaction) {
        const updatedTransaction = await transactionService.update(editingTransaction.id, transactionData);
        setTransactions(prev => 
          prev.map(t => t.id === editingTransaction.id ? updatedTransaction : t)
        );
        toast.success("Transaction updated successfully");
      } else {
        const newTransaction = await transactionService.create(transactionData);
        setTransactions(prev => [newTransaction, ...prev]);
        toast.success("Transaction added successfully");
      }
      setIsTransactionFormOpen(false);
      setEditingTransaction(null);
    } catch (err) {
      toast.error(editingTransaction ? "Failed to update transaction" : "Failed to add transaction");
      console.error("Transaction submit error:", err);
    }
  };

const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await transactionService.delete(transactionId);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      toast.success("Transaction deleted successfully");
    } catch (err) {
      toast.error("Failed to delete transaction");
      console.error("Delete transaction error:", err);
    }
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionFormOpen(true);
  };

  const handleConnectBank = () => {
    setIsBankConnectionOpen(true);
  };

  const handleBankConnectionSuccess = (importResult) => {
    loadTransactions();
    toast.success(`Successfully imported ${importResult.imported} transactions!`);
    setIsBankConnectionOpen(false);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionFormOpen(true);
  };

  if (loading) return <Loading type="transactions" />;
  if (error) return <Error message={error} onRetry={loadTransactions} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Track all your income and expenses</p>
        </div>
<Button 
          variant="primary" 
          onClick={handleAddTransaction}
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <Empty
          title="No transactions yet"
          description="Start tracking your finances by adding your first transaction"
          icon="Receipt"
actionLabel="Add Transaction"
          onAction={handleAddTransaction}
        />
      ) : (
        <TransactionList
          transactions={transactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}

      {/* Transaction Form Modal */}
<TransactionForm
        isOpen={isTransactionFormOpen}
        onClose={() => {
          setIsTransactionFormOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleTransactionSubmit}
        transaction={editingTransaction}
      />

      <BankConnectionModal
        isOpen={isBankConnectionOpen}
        onClose={() => setIsBankConnectionOpen(false)}
        onSuccess={handleBankConnectionSuccess}
      />
    </div>
  );
};

export default Transactions;