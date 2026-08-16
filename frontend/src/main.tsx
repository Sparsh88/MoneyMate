import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 3 * 60 * 1000, // 3 minutes fresh cache time
      gcTime: 20 * 60 * 1000, // 20 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
})

// Instant Backend Pre-warming & Keep-Alive to eliminate Render free tier cold start delay
const prewarmBackend = () => {
  const apiUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '/api' : 'http://localhost:5000/api')
  const healthUrl = apiUrl.replace(/\/api\/?$/, '') + '/health'

  fetch(healthUrl, { method: 'GET', keepalive: true }).catch(() => {
    // Fallback attempt to /api/health
    fetch(`${apiUrl}/health`, { method: 'GET', keepalive: true }).catch(() => {})
  })
}

// Fire pre-warm immediately on script load
prewarmBackend()

// Maintain keep-alive every 10 minutes while user is on the tab
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      prewarmBackend()
    }
  }, 10 * 60 * 1000)

  // Re-ping when tab becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      prewarmBackend()
    }
  })
}



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#1e293b' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1e293b' },
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
