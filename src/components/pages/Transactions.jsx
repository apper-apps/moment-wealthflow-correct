import React, { useState, useEffect } from "react";
import TransactionList from "@/components/organisms/TransactionList";
import TransactionForm from "@/components/organisms/TransactionForm";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import transactionService from "@/services/api/transactionService";
import { toast } from "react-toastify";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError("Failed to load transactions. Please try again.");
      console.error("Transactions loading error:", err);
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

  const handleEditTransaction = async (transactionData) => {
    try {
      const updatedTransaction = await transactionService.update(editingTransaction.Id, transactionData);
      setTransactions(prev => 
        prev.map(t => t.Id === editingTransaction.Id ? updatedTransaction : t)
      );
      setEditingTransaction(null);
    } catch (err) {
      toast.error("Failed to update transaction");
      console.error("Update transaction error:", err);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await transactionService.delete(transactionId);
      setTransactions(prev => prev.filter(t => t.Id !== transactionId));
      toast.success("Transaction deleted successfully");
    } catch (err) {
      toast.error("Failed to delete transaction");
      console.error("Delete transaction error:", err);
    }
  };

  const openEditForm = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const closeForm = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
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
          onClick={() => setShowTransactionForm(true)}
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
          onAction={() => setShowTransactionForm(true)}
        />
      ) : (
        <TransactionList
          transactions={transactions}
          onEdit={openEditForm}
          onDelete={handleDeleteTransaction}
        />
      )}

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={closeForm}
        onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
        transaction={editingTransaction}
      />
    </div>
  );
};

export default Transactions;