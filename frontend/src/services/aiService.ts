import api from './api'

export const aiService = {
  getInsights: async () => {
    const { data } = await api.get('/ai/insights')
    return data.insights as string
  },
  getPredictions: async () => {
    const { data } = await api.get('/ai/predictions')
    return data.predictions as string
  },
  getBudgetSuggestions: async () => {
    const { data } = await api.get('/ai/budget-suggestions')
    return data.suggestions as string
  },
  getGoalRecommendations: async () => {
    const { data } = await api.get('/ai/goal-recommendations')
    return data.recommendations as string
  },
  chat: async (message: string, history: { role: string; parts: string }[]) => {
    const { data } = await api.post('/ai/chat', { message, history })
    return data.response as string
  },
}
