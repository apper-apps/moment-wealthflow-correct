import React, { useState } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Modal from "@/components/molecules/Modal";
import { toast } from "react-toastify";

const TransactionForm = ({ isOpen, onClose, onSubmit, transaction = null }) => {
  const [formData, setFormData] = useState({
    type: transaction?.type || "expense",
    amount: transaction?.amount || "",
    category: transaction?.category || "",
    description: transaction?.description || "",
    date: transaction?.date || new Date().toISOString().split("T")[0],
    recurring: transaction?.recurring || false,
  });

  const [errors, setErrors] = useState({});

  const categories = {
    expense: [
      { value: "food", label: "Food & Dining" },
      { value: "transportation", label: "Transportation" },
      { value: "entertainment", label: "Entertainment" },
      { value: "shopping", label: "Shopping" },
      { value: "utilities", label: "Bills & Utilities" },
      { value: "healthcare", label: "Healthcare" },
      { value: "education", label: "Education" },
      { value: "other", label: "Other" },
    ],
    income: [
      { value: "salary", label: "Salary" },
      { value: "freelance", label: "Freelance" },
      { value: "investment", label: "Investment" },
      { value: "other", label: "Other" },
    ],
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === "type" && { category: "" }) // Reset category when type changes
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
    };

    onSubmit(transactionData);
    
    // Reset form
    setFormData({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      recurring: false,
    });
    
    toast.success(transaction ? "Transaction updated successfully!" : "Transaction added successfully!");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? "Edit Transaction" : "Add New Transaction"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
            error={errors.type}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>

          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            error={errors.amount}
            placeholder="0.00"
          />
        </div>

        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => handleChange("category", e.target.value)}
          error={errors.category}
        >
          <option value="">Select a category</option>
          {categories[formData.type].map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </Select>

        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={errors.description}
          placeholder="Enter transaction description"
        />

        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          error={errors.date}
        />

        <div className="flex items-center">
          <input
            id="recurring"
            type="checkbox"
            checked={formData.recurring}
            onChange={(e) => handleChange("recurring", e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">
            This is a recurring transaction
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {transaction ? "Update Transaction" : "Add Transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionForm;