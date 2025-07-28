import transactionData from "@/services/mockData/transactions.json";

class TransactionService {
  constructor() {
    this.transactions = [...transactionData];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Sort by date descending
    return [...this.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const transaction = this.transactions.find(t => t.Id === id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
return { ...transaction };
  }

  async connectBankAccount(bankData) {
    // Simulate secure bank connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate potential connection failures
    if (Math.random() < 0.1) {
      throw new Error("Connection failed. Please check your credentials and try again.");
    }
    
    return {
      connectionId: `conn_${Date.now()}`,
      bankName: bankData.bankName,
      accountNumber: `****${bankData.accountNumber.slice(-4)}`,
      status: 'connected',
      connectedAt: new Date().toISOString()
    };
  }

  async authenticateBank(credentials) {
    // Simulate bank authentication
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate authentication failures
    if (Math.random() < 0.15) {
      throw new Error("Authentication failed. Please verify your login credentials.");
    }
    
    return {
      authToken: `auth_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
    };
  }

  async importTransactions(connectionData) {
    // Simulate fetching transactions from bank
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate realistic bank transactions
    const importedTransactions = this.generateBankTransactions(connectionData.bankName);
    
    // Process and categorize transactions
    const processedTransactions = importedTransactions.map(transaction => ({
      ...transaction,
      Id: Math.max(...this.transactions.map(t => t.Id), 0) + this.transactions.length + Math.random() * 1000,
      category: this.getCategorySuggestion(transaction.description),
      source: 'bank_import',
      importedAt: new Date().toISOString()
    }));
    
    // Add to existing transactions
    this.transactions.push(...processedTransactions);
    
    return {
      imported: processedTransactions.length,
      transactions: processedTransactions
    };
  }

  generateBankTransactions(bankName) {
    const sampleTransactions = [
      { description: "STARBUCKS COFFEE #1234", amount: -5.47, type: "expense" },
      { description: "SALARY DEPOSIT", amount: 3250.00, type: "income" },
      { description: "UBER TRIP", amount: -12.85, type: "expense" },
      { description: "GROCERY STORE PURCHASE", amount: -67.23, type: "expense" },
      { description: "ATM WITHDRAWAL", amount: -100.00, type: "expense" },
      { description: "TARGET STORE #2156", amount: -45.67, type: "expense" },
      { description: "NETFLIX SUBSCRIPTION", amount: -15.99, type: "expense" },
      { description: "FREELANCE PAYMENT", amount: 850.00, type: "income" },
      { description: "GAS STATION PURCHASE", amount: -32.18, type: "expense" },
      { description: "AMAZON PURCHASE", amount: -89.99, type: "expense" }
    ];

    // Return 5-8 random transactions
    const transactionCount = Math.floor(Math.random() * 4) + 5;
    const selectedTransactions = [];
    
    for (let i = 0; i < transactionCount; i++) {
      const transaction = sampleTransactions[Math.floor(Math.random() * sampleTransactions.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Last 30 days
      
      selectedTransactions.push({
        ...transaction,
        date: date.toISOString(),
        amount: Math.abs(transaction.amount) * (transaction.type === 'expense' ? -1 : 1)
      });
    }
    
    return selectedTransactions;
  }

  getCategorySuggestion(description) {
    const categoryMap = {
      'STARBUCKS|COFFEE|CAFE': 'food',
      'UBER|LYFT|TAXI|TRANSPORT': 'transportation', 
      'GROCERY|STORE|MARKET|FOOD': 'food',
      'TARGET|WALMART|AMAZON|SHOPPING': 'shopping',
      'NETFLIX|SPOTIFY|SUBSCRIPTION|ENTERTAINMENT': 'entertainment',
      'ATM|WITHDRAWAL|CASH': 'other',
      'SALARY|FREELANCE|PAYMENT|DEPOSIT': 'salary',
      'GAS|STATION|FUEL': 'transportation',
      'UTILITIES|ELECTRIC|WATER|INTERNET': 'utilities'
    };

    const upperDesc = description.toUpperCase();
    
    for (const [pattern, category] of Object.entries(categoryMap)) {
      const patterns = pattern.split('|');
      if (patterns.some(p => upperDesc.includes(p))) {
        return category;
      }
    }
    
    return 'other';
  }

  async create(transactionData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newTransaction = {
      Id: Math.max(...this.transactions.map(t => t.Id)) + 1,
      ...transactionData,
    };
    
    this.transactions.push(newTransaction);
    return { ...newTransaction };
  }

  async update(id, transactionData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.transactions.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    this.transactions[index] = { ...this.transactions[index], ...transactionData };
    return { ...this.transactions[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.transactions.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    this.transactions.splice(index, 1);
    return true;
  }
}

export default new TransactionService();