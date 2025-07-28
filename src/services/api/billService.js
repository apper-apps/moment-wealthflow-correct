import billData from "@/services/mockData/bills.json";

class BillService {
  constructor() {
    this.bills = [...billData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.bills];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const bill = this.bills.find(b => b.Id === id);
    if (!bill) {
      throw new Error("Bill not found");
    }
    return { ...bill };
  }

  async create(billData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newBill = {
      Id: Math.max(...this.bills.map(b => b.Id)) + 1,
      ...billData,
    };
    
    this.bills.push(newBill);
    return { ...newBill };
  }

  async update(id, billData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.bills.findIndex(b => b.Id === id);
    if (index === -1) {
      throw new Error("Bill not found");
    }
    
    this.bills[index] = { ...this.bills[index], ...billData };
    return { ...this.bills[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.bills.findIndex(b => b.Id === id);
    if (index === -1) {
      throw new Error("Bill not found");
    }
    
    this.bills.splice(index, 1);
    return true;
  }
}

export default new BillService();