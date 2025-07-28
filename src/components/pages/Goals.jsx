import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import goalService from "@/services/api/goalService";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import GoalCard from "@/components/organisms/GoalCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await goalService.getAll();
      setGoals(data);
    } catch (err) {
      setError("Failed to load goals. Please try again.");
      console.error("Goals loading error:", err);
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

    if (!formData.name.trim()) {
      errors.name = "Goal name is required";
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      errors.targetAmount = "Target amount must be greater than 0";
    }

    if (!formData.currentAmount || parseFloat(formData.currentAmount) < 0) {
      errors.currentAmount = "Current amount must be 0 or greater";
    }

    if (!formData.targetDate) {
      errors.targetDate = "Target date is required";
    } else if (new Date(formData.targetDate) <= new Date()) {
      errors.targetDate = "Target date must be in the future";
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
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        targetDate: new Date(formData.targetDate).toISOString(),
      };

      if (editingGoal) {
        const updatedGoal = await goalService.update(editingGoal.Id, goalData);
        setGoals(prev => 
          prev.map(g => g.Id === editingGoal.Id ? updatedGoal : g)
        );
        toast.success("Goal updated successfully!");
      } else {
        const newGoal = await goalService.create(goalData);
        setGoals(prev => [...prev, newGoal]);
        toast.success("Goal created successfully!");
      }

      resetForm();
    } catch (err) {
      toast.error("Failed to save goal");
      console.error("Save goal error:", err);
    }
};

const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: new Date(goal.targetDate).toISOString().split("T")[0],
      description: goal.description || "",
    });
    setShowGoalForm(true);
  };

  const handleDelete = (goal) => {
    setGoalToDelete(goal);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!goalToDelete) return;

    try {
      await goalService.delete(goalToDelete.Id);
      setGoals(prev => prev.filter(g => g.Id !== goalToDelete.Id));
      toast.success("Goal deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete goal");
      console.error("Delete goal error:", err);
    } finally {
      setShowDeleteModal(false);
      setGoalToDelete(null);
    }
  };

const resetForm = () => {
    setFormData({
      name: "",
      targetAmount: "",
      currentAmount: "",
      targetDate: "",
      description: "",
    });
    setFormErrors({});
    setEditingGoal(null);
    setShowGoalForm(false);
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadGoals} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-600">Track your progress towards financial milestones</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowGoalForm(true)}
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Empty
          title="No savings goals yet"
          description="Create your first savings goal to start tracking your financial progress"
          icon="Target"
          actionLabel="Create Goal"
          onAction={() => setShowGoalForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.Id}
goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Goal Form Modal */}
      <Modal
        isOpen={showGoalForm}
        onClose={resetForm}
        title={editingGoal ? "Edit Goal" : "Create New Goal"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Goal Name"
            value={formData.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            error={formErrors.name}
            placeholder="e.g., Emergency Fund, Vacation, New Car"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.targetAmount}
              onChange={(e) => handleFormChange("targetAmount", e.target.value)}
              error={formErrors.targetAmount}
              placeholder="0.00"
            />

            <Input
              label="Current Amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.currentAmount}
              onChange={(e) => handleFormChange("currentAmount", e.target.value)}
              error={formErrors.currentAmount}
              placeholder="0.00"
            />
          </div>

<Input
            label="Target Date"
            type="date"
            value={formData.targetDate}
            onChange={(e) => handleFormChange("targetDate", e.target.value)}
            error={formErrors.targetDate}
            min={new Date().toISOString().split("T")[0]}
          />

          <Input
            label="Description (Optional)"
            as="textarea"
            rows={3}
            value={formData.description}
            onChange={(e) => handleFormChange("description", e.target.value)}
            placeholder="Add a description for this goal..."
            error={formErrors.description}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingGoal ? "Update Goal" : "Create Goal"}
            </Button>
          </div>
</form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Goal"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the goal{" "}
            <span className="font-medium">"{goalToDelete?.name}"</span>? This action cannot be undone.
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
              Delete Goal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Goals;