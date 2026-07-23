import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Loader2, Sparkles, TrendingUp, PiggyBank, Target, RefreshCw } from 'lucide-react'
import { aiService } from '../services/aiService'
import type { ChatMessage } from '../types'

// We'll inline a small markdown renderer since react-markdown might not be in package.json
// Instead we'll render text with basic formatting
function MarkdownText({ text }: { text: string }) {
  return (
    <div className="prose prose-sm prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <p key={i} className="font-bold text-white text-base mt-3 mb-1">{line.slice(4)}</p>
        if (line.startsWith('## '))  return <p key={i} className="font-bold text-white text-lg mt-4 mb-2">{line.slice(3)}</p>
        if (line.startsWith('# '))   return <p key={i} className="font-bold text-white text-xl mt-4 mb-2">{line.slice(2)}</p>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <p key={i} className="flex gap-2"><span className="text-brand-400 mt-0.5">•</span><span>{parseBold(line.slice(2))}</span></p>
        if (/^\d+\. /.test(line)) {
          const [num, ...rest] = line.split('. ')
          return <p key={i} className="flex gap-2"><span className="text-brand-400 font-bold">{num}.</span><span>{parseBold(rest.join('. '))}</span></p>
        }
        if (line.trim() === '') return <br key={i} />
        return <p key={i}>{parseBold(line)}</p>
      })}
    </div>
  )
}

function parseBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{p}</strong> : p)
}

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your **MoneyMate AI Financial Advisor**. I can help you with budgeting strategies, spending analysis, savings goals, and investment ideas. What would you like to know today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'predictions' | 'suggestions'>('chat')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: insights, isLoading: loadingInsights, refetch: refetchInsights } = useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: aiService.getInsights,
    enabled: activeTab === 'insights',
    staleTime: 5 * 60 * 1000,
  })

  const { data: predictions, isLoading: loadingPred, refetch: refetchPred } = useQuery({
    queryKey: ['ai', 'predictions'],
    queryFn: aiService.getPredictions,
    enabled: activeTab === 'predictions',
    staleTime: 5 * 60 * 1000,
  })

  const { data: suggestions, isLoading: loadingSugg, refetch: refetchSugg } = useQuery({
    queryKey: ['ai', 'suggestions'],
    queryFn: aiService.getBudgetSuggestions,
    enabled: activeTab === 'suggestions',
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return
    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: m.content,
      }))
      const response = await aiService.chat(input, history)
      setMessages((prev) => [...prev, { role: 'assistant', content: response, timestamp: new Date() }])
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: Bot },
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'suggestions', label: 'Budget Tips', icon: PiggyBank },
  ] as const

  return (
    <div className="space-y-5 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-brand-400" /> AI Financial Advisor
        </h1>
        <p className="text-slate-400 text-sm">Powered by Gemini AI – your personal finance intelligence</p>
      </div>

      {/* Tab Strip */}
      <div className="flex gap-1 bg-surface-card border border-surface-border rounded-xl p-1 overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === id ? 'bg-brand-gradient text-white shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col card p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                  msg.role === 'assistant' ? 'bg-brand-gradient' : 'bg-surface-border'
                }`}>
                  {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : '👤'}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-brand-gradient text-white rounded-tr-sm'
                    : 'bg-surface-hover border border-surface-border rounded-tl-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                    <MarkdownText text={msg.content} />
                  ) : (
                    <p className="text-sm text-white">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-surface-hover border border-surface-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay }}
                        className="w-2 h-2 rounded-full bg-brand-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-surface-border p-4 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about budgets, savings, investments…"
              className="input flex-1"
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="btn-primary px-4"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Insights/Predictions/Suggestions Tabs */}
      {activeTab !== 'chat' && (
        <div className="flex-1 card overflow-y-auto">
          {(activeTab === 'insights' && loadingInsights) ||
           (activeTab === 'predictions' && loadingPred) ||
           (activeTab === 'suggestions' && loadingSugg) ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              <p className="text-slate-400 text-sm">AI is analyzing your finances…</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    if (activeTab === 'insights') refetchInsights()
                    if (activeTab === 'predictions') refetchPred()
                    if (activeTab === 'suggestions') refetchSugg()
                  }}
                  className="btn-secondary text-xs gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </button>
              </div>
              <MarkdownText text={
                activeTab === 'insights' ? (insights ?? '') :
                activeTab === 'predictions' ? (predictions ?? '') :
                (suggestions ?? '')
              } />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
