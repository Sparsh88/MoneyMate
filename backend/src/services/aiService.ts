// AI Service — Gemini v0.21+ compatible
// Falls back to intelligent data-driven simulator if no API key is configured

let genAI: any = null;

const initAI = () => {
  if (genAI) return genAI;
  const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock_key';
  if (!hasApiKey) return null;
  try {
    // Dynamic require to avoid crash at startup if package is incompatible
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    return genAI;
  } catch {
    return null;
  }
};

// ─── Local Data-Driven Simulators ────────────────────────────────────────────
const getSimulatedInsights = (transactions: any[], budgets: any[], goals: any[]) => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const incomes = transactions.filter((t) => t.type === 'income');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const savings = totalIncome - totalExpense;

  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    const catName = e.category?.name || 'Other';
    categoryTotals[catName] = (categoryTotals[catName] || 0) + e.amount;
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

  return `### MoneyMate - AI Financial Insights

Based on your recent transaction history containing **${incomes.length} income transactions** ($${totalIncome.toFixed(2)}) and **${expenses.length} expenses** ($${totalExpense.toFixed(2)}):

1. **Savings Rate Analysis**: Your current monthly savings rate is **${totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0}%**. You saved **$${savings.toFixed(2)}** this period.
2. **Top Spending Category**: You spent the most on **${topCategory[0]}** ($${Number(topCategory[1]).toFixed(2)}), which represents **${totalExpense > 0 ? ((Number(topCategory[1]) / totalExpense) * 100).toFixed(0) : 0}%** of your total expenses.
3. **Alerts**: ${totalExpense > totalIncome ? '⚠️ **Caution**: Your expenses exceed your income. We recommend cutting down on discretionary spending.' : '✅ **Good Job**: You are living within your means. Consider putting your surplus savings into your active savings goals.'}
4. **Actionable Tip**: Try reducing your spending on *${topCategory[0]}* by 10% next month. This simple change would save you approximately **$${(Number(topCategory[1]) * 0.1).toFixed(2)}**!
5. **Budget Status**: You have ${budgets.length} budget(s) and ${goals.filter((g: any) => g.status === 'active').length} active savings goal(s). Keep tracking!`;
};

const getSimulatedPredictions = (transactions: any[]) => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const predictedNext = totalExpense * 1.05;

  return `### AI Spending Prediction (Next Month)

Based on your historical spending behavior:
- **Estimated Next Month Spending**: **$${predictedNext.toFixed(2)}** (5% seasonal adjustment applied)
- **Highest Risk Period**: Mid-month shopping surges tend to spike expenses
- **Recommended Daily Limit**: **$${(predictedNext / 30).toFixed(2)}** per day to stay on track
- **Insight**: If you reduce impulse purchases by just 15%, you could save an additional **$${(totalExpense * 0.15).toFixed(2)}** next month`;
};

const getSimulatedBudgetSuggestions = (transactions: any[]) => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    const catName = e.category?.name || 'Other';
    categoryTotals[catName] = (categoryTotals[catName] || 0) + e.amount;
  });

  let suggestions = `### AI Budget Recommendations\nBased on your actual spending, here are suggested caps for next month:\n\n`;
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    const suggestedCap = val * 0.9;
    suggestions += `- **${cat}**: Suggested Limit **$${suggestedCap.toFixed(0)}** (Previous: $${val.toFixed(2)}, saving you 10%)\n`;
  });

  if (Object.keys(categoryTotals).length === 0) {
    suggestions += `Add some transactions first to receive personalized budget suggestions tailored to your spending.`;
  } else {
    suggestions += `\n**Strategy**: Implement the 50/30/20 rule — 50% on needs, 30% on wants, 20% on savings & debt repayment.`;
  }
  return suggestions;
};

// ─── Gemini API Callers ───────────────────────────────────────────────────────
export const generateFinancialInsights = async (transactions: any[], budgets: any[], goals: any[]): Promise<string> => {
  const ai = initAI();
  if (!ai) return getSimulatedInsights(transactions, budgets, goals);
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a financial advisor. Analyze these personal finance records and provide concise, actionable bullet-point recommendations (under 250 words) covering savings rate, top category spending, and custom recommendations.
Transactions: ${JSON.stringify(transactions.slice(0, 50).map((t: any) => ({ amount: t.amount, type: t.type, date: t.date, category: t.category?.name, desc: t.description })))}
Budgets: ${JSON.stringify(budgets.slice(0, 10))}
Goals: ${JSON.stringify(goals.slice(0, 5))}`;
    const result = await model.generateContent(prompt);
    return result.response.text() || getSimulatedInsights(transactions, budgets, goals);
  } catch (error) {
    console.error('Gemini API Error (insights):', error);
    return getSimulatedInsights(transactions, budgets, goals);
  }
};

export const predictNextMonthSpending = async (transactions: any[]): Promise<string> => {
  const ai = initAI();
  if (!ai) return getSimulatedPredictions(transactions);
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Based on these expenses, predict next month's spending, highlight risks, and give a recommended daily budget. Be concise.
Expenses: ${JSON.stringify(transactions.filter((t: any) => t.type === 'expense').slice(0, 50).map((t: any) => ({ amount: t.amount, date: t.date, category: t.category?.name })))}`;
    const result = await model.generateContent(prompt);
    return result.response.text() || getSimulatedPredictions(transactions);
  } catch (error) {
    console.error('Gemini API Error (predictions):', error);
    return getSimulatedPredictions(transactions);
  }
};

export const getAiBudgetSuggestions = async (transactions: any[]): Promise<string> => {
  const ai = initAI();
  if (!ai) return getSimulatedBudgetSuggestions(transactions);
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Suggest monthly budget limits for different spending categories based on these transactions. Focus on optimizing savings while maintaining a comfortable lifestyle.
Transactions: ${JSON.stringify(transactions.slice(0, 50).map((t: any) => ({ amount: t.amount, type: t.type, category: t.category?.name })))}`;
    const result = await model.generateContent(prompt);
    return result.response.text() || getSimulatedBudgetSuggestions(transactions);
  } catch (error) {
    console.error('Gemini API Error (budget suggestions):', error);
    return getSimulatedBudgetSuggestions(transactions);
  }
};

export const getGoalRecommendations = async (user: any, currentGoals: any[]): Promise<string> => {
  const ai = initAI();
  if (!ai) {
    const goalSummary = currentGoals.map((g: any) => `${g.name}: Target $${g.targetAmount}, Current $${g.currentAmount}`).join('\n');
    return `### AI Goal Recommendations for ${user.name}

1. **Emergency Fund**: Set up a goal of at least 3-6 months of living expenses (typically **$3,000–$10,000**).
2. **Debt Payoff**: Prioritize high-interest debt (credit cards) before aggressively saving.
3. **Investment Goal**: Consider a long-term investment goal to grow wealth passively.

**Your Active Goals:**
${goalSummary || 'No goals yet. Start with an Emergency Fund!'}

**Tip**: Aim to contribute at least **15-20%** of your monthly income toward savings goals.`;
  }
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `As a financial advisor, recommend new savings goals or improvements to existing ones for ${user.name}. Be specific and encouraging.
Current Goals: ${JSON.stringify(currentGoals)}`;
    const result = await model.generateContent(prompt);
    return result.response.text() || 'Unable to generate recommendations at this time.';
  } catch (error) {
    console.error('Gemini API Error (goals):', error);
    return 'Error generating recommendations. Please try again later.';
  }
};

export const chatWithAdvisor = async (
  chatHistory: { role: 'user' | 'model'; parts: string }[],
  userMessage: string,
  financialContext: string
): Promise<string> => {
  const ai = initAI();
  if (!ai) {
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      return `Hello! 👋 I'm your **MoneyMate AI Financial Advisor**. I can help you with:\n\n- 📊 Budgeting strategies\n- 💰 Saving tips and tricks\n- 📈 Investment guidance\n- 🎯 Goal planning\n\nWhat financial question can I help you with today?`;
    }
    if (lowerMsg.includes('invest')) {
      return `Great question about investing! Here are my top recommendations:\n\n1. **Emergency Fund First**: Ensure you have 3-6 months of expenses saved before investing.\n2. **Tax-Advantaged Accounts**: Maximize contributions to tax-sheltered retirement accounts first.\n3. **Index Funds**: For long-term wealth building, low-cost broad-market index funds (e.g., S&P 500 ETFs) are historically reliable.\n4. **Diversification**: Never put all eggs in one basket — spread across asset classes.\n\n*Note: This is educational information, not certified financial advice. Consult a licensed advisor for personalized investment decisions.*`;
    }
    if (lowerMsg.includes('save') || lowerMsg.includes('saving') || lowerMsg.includes('budget')) {
      return `Here are proven strategies to boost your savings:\n\n1. **Automate It**: Set up automatic transfers to savings on payday — pay yourself first!\n2. **50/30/20 Rule**: Allocate 50% to needs, 30% to wants, and 20% to savings/debt.\n3. **Audit Subscriptions**: Review recurring charges monthly and cancel anything unused.\n4. **Meal Prep**: Reducing dining out by 50% typically saves $100-$300/month.\n5. **Use Cash Envelopes**: For discretionary categories, physically seeing money leave your wallet reduces spending.\n\nBased on your financial context: ${financialContext}`;
    }
    if (lowerMsg.includes('debt')) {
      return `For debt management, I recommend the **Debt Avalanche Method**:\n\n1. **List all debts** sorted by interest rate (highest first)\n2. **Pay minimums** on all debts\n3. **Attack the highest-rate debt** with any extra money\n4. **Roll payments** to the next debt once one is paid off\n\nThis mathematically saves the most money. Alternatively, the **Debt Snowball** (smallest balance first) provides motivational wins if you need encouragement.\n\n*Current context: ${financialContext}*`;
    }
    return `Thanks for your question! Based on your current financial snapshot:\n\n**${financialContext}**\n\nMy advice: Focus on maintaining a positive savings rate this month. Track every expense in MoneyMate to identify areas where you can cut back. Small, consistent improvements compound into major financial wins over time.\n\nFeel free to ask me about budgeting, saving, investing, or debt management!`;
  }

  try {
    const systemInstruction = `You are a certified professional financial advisor embedded in MoneyMate, a personal finance platform. Help users optimize budgets, track financial goals, understand investments, and develop healthy money habits. Always be constructive, professional, and concise. The user's current financial context: ${financialContext}`;

    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction,
    });

    const formattedHistory = chatHistory.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.parts }],
    }));

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(userMessage);
    return result.response.text() || 'I apologize, I could not generate a response. Please try again.';
  } catch (error) {
    console.error('Gemini API Error (chat):', error);
    return 'I encountered an error connecting to the AI service. Please try again in a moment.';
  }
};
