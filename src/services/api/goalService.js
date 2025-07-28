import goalData from "@/services/mockData/goals.json";

class GoalService {
  constructor() {
    this.goals = [...goalData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.goals];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const goal = this.goals.find(g => g.Id === id);
    if (!goal) {
      throw new Error("Goal not found");
    }
    return { ...goal };
  }

  async create(goalData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newGoal = {
      Id: Math.max(...this.goals.map(g => g.Id)) + 1,
      ...goalData,
    };
    
    this.goals.push(newGoal);
    return { ...newGoal };
  }

  async update(id, goalData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.goals.findIndex(g => g.Id === id);
    if (index === -1) {
      throw new Error("Goal not found");
    }
    
    this.goals[index] = { ...this.goals[index], ...goalData };
    return { ...this.goals[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.goals.findIndex(g => g.Id === id);
    if (index === -1) {
      throw new Error("Goal not found");
    }
    
    this.goals.splice(index, 1);
    return true;
  }
}

export default new GoalService();