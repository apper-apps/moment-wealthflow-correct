import React, { useState, useEffect } from "react";
import BillCard from "@/components/organisms/BillCard";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import billService from "@/services/api/billService";
import { toast } from "react-toastify";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBillForm, setShowBillForm] = useState(false);
const [editingBill, setEditingBill] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dueDate: "",
    recurring: false,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billService.getAll();
      setBills(data);
    } catch (err) {
      setError("Failed to load bills. Please try again.");
      console.error("Bills loading error:", err);
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
      errors.name = "Bill name is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (!formData.dueDate) {
      errors.dueDate = "Due date is required";
    }

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
      const billData = {
        ...formData,
        amount: parseFloat(formData.amount),
        dueDate: new Date(formData.dueDate).toISOString(),
        isPaid: editingBill?.isPaid || false,
      };

      if (editingBill) {
        const updatedBill = await billService.update(editingBill.Id, billData);
        setBills(prev => 
          prev.map(b => b.Id === editingBill.Id ? updatedBill : b)
        );
        toast.success("Bill updated successfully!");
      } else {
        const newBill = await billService.create(billData);
        setBills(prev => [...prev, newBill]);
        toast.success("Bill created successfully!");
      }

      resetForm();
    } catch (err) {
      toast.error("Failed to save bill");
      console.error("Save bill error:", err);
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setFormData({
      name: bill.name,
      amount: bill.amount.toString(),
      dueDate: new Date(bill.dueDate).toISOString().split("T")[0],
      recurring: bill.recurring,
    });
    setShowBillForm(true);
  };

const handleTogglePaid = async (billId) => {
    try {
      const bill = bills.find(b => b.Id === billId);
      const updatedBill = await billService.update(billId, {
        ...bill,
        isPaid: !bill.isPaid,
      });
      
      setBills(prev => 
        prev.map(b => b.Id === billId ? updatedBill : b)
      );
      
      toast.success(updatedBill.isPaid ? "Bill marked as paid!" : "Bill marked as unpaid");
    } catch (err) {
      toast.error("Failed to update bill status");
      console.error("Toggle bill status error:", err);
    }
  };

  const handleDelete = (bill) => {
    setBillToDelete(bill);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!billToDelete) return;

    try {
      await billService.delete(billToDelete.Id);
      setBills(prev => prev.filter(b => b.Id !== billToDelete.Id));
      toast.success("Bill deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete bill");
      console.error("Delete bill error:", err);
    } finally {
      setShowDeleteModal(false);
      setBillToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      dueDate: "",
      recurring: false,
    });
    setFormErrors({});
    setEditingBill(null);
    setShowBillForm(false);
  };
  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadBills} />;

  // Sort bills by due date
  const sortedBills = [...bills].sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    
    // Unpaid bills first, then by due date
    if (a.isPaid !== b.isPaid) {
      return a.isPaid ? 1 : -1;
    }
    
    return dateA - dateB;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bills & Reminders</h1>
          <p className="text-gray-600">Keep track of your upcoming payments</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowBillForm(true)}
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Bill
        </Button>
      </div>

      {/* Bills Grid */}
      {bills.length === 0 ? (
        <Empty
          title="No bills tracked"
          description="Add your first bill to start tracking payment due dates"
          icon="Calendar"
          actionLabel="Add Bill"
          onAction={() => setShowBillForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBills.map((bill) => (
            <BillCard
              key={bill.Id}
              bill={bill}
onEdit={handleEdit}
              onTogglePaid={handleTogglePaid}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Bill Form Modal */}
      <Modal
        isOpen={showBillForm}
        onClose={resetForm}
        title={editingBill ? "Edit Bill" : "Add New Bill"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Bill Name"
            value={formData.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            error={formErrors.name}
            placeholder="e.g., Electric Bill, Rent, Internet"
          />

          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleFormChange("amount", e.target.value)}
            error={formErrors.amount}
            placeholder="0.00"
          />

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleFormChange("dueDate", e.target.value)}
            error={formErrors.dueDate}
          />

          <div className="flex items-center">
            <input
              id="recurring"
              type="checkbox"
              checked={formData.recurring}
              onChange={(e) => handleFormChange("recurring", e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">
              This is a recurring bill
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingBill ? "Update Bill" : "Add Bill"}
            </Button>
          </div>
        </form>
</Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Bill"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the bill{" "}
            <span className="font-medium">"{billToDelete?.name}"</span>? This action cannot be undone.
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
              Delete Bill
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bills;