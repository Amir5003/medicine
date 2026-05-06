import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

// Router will be configured in Phase 2 (T031)
// Placeholder app for Phase 1 buildability check
function App() {
  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-teal-600">MediCore</h1>
        <p className="text-gray-500 mt-2">Medicine Delivery & Salt Alternate Platform</p>
      </div>
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export default function Main() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}
