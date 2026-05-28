import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { warmupServer } from './lib/api.ts'

// Despierta el servidor de Render lo antes posible para reducir el cold start
warmupServer()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
