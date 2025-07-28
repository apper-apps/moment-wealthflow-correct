import React, { useState, useEffect } from "react";
import BudgetCard from "@/components/organisms/BudgetCard";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import budgetService from "@/services/api/budgetService";
import { toast } from "react-toastify";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
const [formData, setFormData] = useState({
    category: "",
    limit: "",
    period: "monthly",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const categories = [
    { value: "food", label: "Food & Dining" },
    { value: "transportation", label: "Transportation" },
    { value: "entertainment", label: "Entertainment" },
    { value: "shopping", label: "Shopping" },
    { value: "utilities", label: "Bills & Utilities" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await budgetService.getAll();
      setBudgets(data);
    } catch (err) {
      setError("Failed to load budgets. Please try again.");
      console.error("Budgets loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

const validateForm = () => {
    const errors = {};

    if (!formData.category) {
      errors.category = "Category is required";
    }

    if (!formData.limit || parseFloat(formData.limit) <= 0) {
      errors.limit = "Budget limit must be greater than 0";
    }

    // Description is optional, no validation needed

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const budgetData = {
        ...formData,
        limit: parseFloat(formData.limit),
        spent: editingBudget?.spent || 0,
      };

      if (editingBudget) {
        const updatedBudget = await budgetService.update(editingBudget.Id, budgetData);
        setBudgets(prev => 
          prev.map(b => b.Id === editingBudget.Id ? updatedBudget : b)
        );
        toast.success("Budget updated successfully!");
      } else {
        const newBudget = await budgetService.create(budgetData);
        setBudgets(prev => [...prev, newBudget]);
        toast.success("Budget created successfully!");
      }

      resetForm();
    } catch (err) {
      toast.error("Failed to save budget");
      console.error("Save budget error:", err);
    }
  };
const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
      period: budget.period,
      description: budget.description || "",
    });
    setShowBudgetForm(true);
  };

  const handleDelete = (budget) => {
    setBudgetToDelete(budget);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!budgetToDelete) return;

    try {
      await budgetService.delete(budgetToDelete.Id);
      setBudgets(prev => prev.filter(b => b.Id !== budgetToDelete.Id));
      toast.success("Budget deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete budget");
      console.error("Delete budget error:", err);
    } finally {
      setShowDeleteModal(false);
      setBudgetToDelete(null);
    }
  };

const resetForm = () => {
    setFormData({
      category: "",
      limit: "",
      period: "monthly",
      description: "",
    });
    setFormErrors({});
    setEditingBudget(null);
    setShowBudgetForm(false);
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadBudgets} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600">Set and track your spending limits</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowBudgetForm(true)}
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <Empty
          title="No budgets set"
          description="Create your first budget to start tracking your spending limits"
          icon="PieChart"
          actionLabel="Create Budget"
          onAction={() => setShowBudgetForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.Id}
              budget={budget}
onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Budget Form Modal */}
      <Modal
        isOpen={showBudgetForm}
        onClose={resetForm}
        title={editingBudget ? "Edit Budget" : "Create New Budget"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => handleFormChange("category", e.target.value)}
            error={formErrors.category}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>

          <Input
            label="Budget Limit"
            type="number"
            step="0.01"
            min="0"
            value={formData.limit}
            onChange={(e) => handleFormChange("limit", e.target.value)}
            error={formErrors.limit}
            placeholder="0.00"
          />

<Select
            label="Period"
            value={formData.period}
            onChange={(e) => handleFormChange("period", e.target.value)}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>

          <Input
            label="Description (Optional)"
            as="textarea"
            rows={3}
            value={formData.description}
            onChange={(e) => handleFormChange("description", e.target.value)}
            placeholder="Add a description for this budget..."
            error={formErrors.description}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingBudget ? "Update Budget" : "Create Budget"}
            </Button>
          </div>
        </form>
</Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Budget"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the budget for{" "}
            <span className="font-medium">{budgetToDelete?.category}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete Budget
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Budgets;