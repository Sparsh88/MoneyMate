export const DEMO_SUMMARY = {
  summary: {
    balance: 185400,
    totalIncome: 550000,
    totalExpense: 364600,
    monthlyIncome: 95000,
    monthlyExpense: 38500,
    monthlySavings: 56500,
    savingsRate: 59.5,
  },
  recentTransactions: [
    {
      _id: 't1',
      description: 'Monthly Salary Credit - Tech Corp',
      amount: 85000,
      type: 'income',
      category: { _id: 'cat_salary', name: 'Salary', color: '#10b981', icon: 'Briefcase' },
      date: new Date().toISOString(),
      isRecurring: true,
      notes: 'Direct bank deposit',
    },
    {
      _id: 't2',
      description: 'Freelance UI/UX Project',
      amount: 10000,
      type: 'income',
      category: { _id: 'cat_freelance', name: 'Freelance', color: '#3b82f6', icon: 'Laptop' },
      date: new Date(Date.now() - 86400000).toISOString(),
      isRecurring: false,
      notes: 'Client payment',
    },
    {
      _id: 't3',
      description: 'Apartment Rent Payment',
      amount: 18000,
      type: 'expense',
      category: { _id: 'cat_housing', name: 'Housing', color: '#6366f1', icon: 'Home' },
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      isRecurring: true,
      notes: 'Paid via UPI',
    },
    {
      _id: 't4',
      description: 'Groceries & Supermarket',
      amount: 4200,
      type: 'expense',
      category: { _id: 'cat_food', name: 'Food & Dining', color: '#10b981', icon: 'Utensils' },
      date: new Date(Date.now() - 86400000 * 4).toISOString(),
      isRecurring: false,
    },
    {
      _id: 't5',
      description: 'Amazon Shopping (Wireless Headphones)',
      amount: 3500,
      type: 'expense',
      category: { _id: 'cat_shopping', name: 'Shopping', color: '#f59e0b', icon: 'ShoppingBag' },
      date: new Date(Date.now() - 86400000 * 6).toISOString(),
      isRecurring: false,
    },
  ],
};

export const DEMO_CATEGORIES = [
  { name: 'Rent & Housing', value: 18000, color: '#6366f1' },
  { name: 'Food & Dining', value: 8500, color: '#10b981' },
  { name: 'Shopping & Apparel', value: 5200, color: '#f59e0b' },
  { name: 'Utilities & Broadband', value: 3800, color: '#06b6d4' },
  { name: 'Entertainment & OTT', value: 3000, color: '#ec4899' },
];

export const DEMO_TRENDS = {
  incomeVsExpense: [
    { month: 'Feb', income: 85000, expense: 32000 },
    { month: 'Mar', income: 88000, expense: 35400 },
    { month: 'Apr', income: 90000, expense: 34000 },
    { month: 'May', income: 92000, expense: 37500 },
    { month: 'Jun', income: 95000, expense: 36000 },
    { month: 'Jul', income: 95000, expense: 38500 },
  ],
  budgetComparison: [
    { categoryName: 'Food & Dining', limit: 10000, actual: 8500, percent: 85 },
    { categoryName: 'Rent & Housing', limit: 20000, actual: 18000, percent: 90 },
    { categoryName: 'Shopping', limit: 8000, actual: 5200, percent: 65 },
    { categoryName: 'Utilities', limit: 5000, actual: 3800, percent: 76 },
    { categoryName: 'Entertainment', limit: 4000, actual: 3000, percent: 75 },
  ],
};

export const DEMO_CASHFLOW = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date(Date.now() - (29 - i) * 86400000);
  const dayStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  const isPayday = date.getDate() === 1 || date.getDate() === 15;
  return {
    date: dayStr,
    income: isPayday ? 42500 : Math.floor(Math.random() * 500),
    expense: Math.floor(Math.random() * 1500) + 200,
  };
});

export const DEMO_TRANSACTIONS = [
  ...DEMO_SUMMARY.recentTransactions,
  {
    _id: 't6',
    description: 'Electricity & Broadband Bill',
    amount: 2800,
    type: 'expense',
    category: { _id: 'cat_util', name: 'Utilities', color: '#06b6d4', icon: 'Zap' },
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    isRecurring: true,
  },
  {
    _id: 't7',
    description: 'SIP Mutual Fund Investment',
    amount: 10000,
    type: 'expense',
    category: { _id: 'cat_invest', name: 'Investments', color: '#8b5cf6', icon: 'TrendingUp' },
    date: new Date(Date.now() - 86400000 * 10).toISOString(),
    isRecurring: true,
  },
  {
    _id: 't8',
    description: 'Zomato Food Delivery',
    amount: 1450,
    type: 'expense',
    category: { _id: 'cat_food', name: 'Food & Dining', color: '#10b981', icon: 'Utensils' },
    date: new Date(Date.now() - 86400000 * 12).toISOString(),
    isRecurring: false,
  },
  {
    _id: 't9',
    description: 'Petrol / Fuel Fill',
    amount: 2000,
    type: 'expense',
    category: { _id: 'cat_trans', name: 'Transport', color: '#ef4444', icon: 'Car' },
    date: new Date(Date.now() - 86400000 * 14).toISOString(),
    isRecurring: false,
  },
  {
    _id: 't10',
    description: 'Netflix & Spotify Subscriptions',
    amount: 828,
    type: 'expense',
    category: { _id: 'cat_ent', name: 'Entertainment', color: '#ec4899', icon: 'Film' },
    date: new Date(Date.now() - 86400000 * 16).toISOString(),
    isRecurring: true,
  },
];

export const DEMO_BUDGETS = [
  { _id: 'b1', category: { _id: 'cat_food', name: 'Food & Dining' }, amount: 10000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { _id: 'b2', category: { _id: 'cat_housing', name: 'Housing' }, amount: 20000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { _id: 'b3', category: { _id: 'cat_shopping', name: 'Shopping' }, amount: 8000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { _id: 'b4', category: { _id: 'cat_util', name: 'Utilities' }, amount: 5000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { _id: 'b5', category: { _id: 'cat_ent', name: 'Entertainment' }, amount: 4000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
];

export const DEMO_GOALS = [
  {
    _id: 'g1',
    name: 'Emergency Fund',
    targetAmount: 200000,
    currentAmount: 140000,
    targetDate: new Date(Date.now() + 86400000 * 180).toISOString(),
    status: 'active',
  },
  {
    _id: 'g2',
    name: 'Goa Vacation',
    targetAmount: 40000,
    currentAmount: 35000,
    targetDate: new Date(Date.now() + 86400000 * 45).toISOString(),
    status: 'active',
  },
  {
    _id: 'g3',
    name: 'MacBook Pro M3',
    targetAmount: 180000,
    currentAmount: 180000,
    targetDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    status: 'achieved',
  },
  {
    _id: 'g4',
    name: 'Stock Portfolio',
    targetAmount: 500000,
    currentAmount: 120000,
    targetDate: new Date(Date.now() + 86400000 * 365).toISOString(),
    status: 'active',
  },
];

export const DEMO_RECURRING = [
  { _id: 'r1', description: 'Monthly Salary Credit', amount: 85000, type: 'income', frequency: 'monthly', startDate: '2026-01-01', nextDueDate: '2026-08-01', isAutoAdd: true },
  { _id: 'r2', description: 'House Rent Payment', amount: 18000, type: 'expense', frequency: 'monthly', startDate: '2026-01-05', nextDueDate: '2026-08-05', isAutoAdd: true },
  { _id: 'r3', description: 'Jio Fiber Broadband', amount: 999, type: 'expense', frequency: 'monthly', startDate: '2026-01-10', nextDueDate: '2026-08-10', isAutoAdd: true },
  { _id: 'r4', description: 'Netflix Premium 4K', amount: 649, type: 'expense', frequency: 'monthly', startDate: '2026-01-15', nextDueDate: '2026-08-15', isAutoAdd: false },
];

export const DEMO_NOTIFICATIONS = [
  { _id: 'n1', title: 'Budget Warning: Food & Dining at 85%', message: 'You have spent ₹8,500 of your ₹10,000 monthly limit.', type: 'budget_alert', isRead: false, createdAt: new Date().toISOString() },
  { _id: 'n2', title: 'Goal Achieved: MacBook Pro M3! 🎉', message: 'Congratulations! You reached your ₹180,000 savings goal.', type: 'goal_milestone', isRead: false, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { _id: 'n3', title: 'Recurring Bill Due Soon', message: 'Jio Fiber Broadband (₹999) is due in 3 days.', type: 'system', isRead: true, createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
];
