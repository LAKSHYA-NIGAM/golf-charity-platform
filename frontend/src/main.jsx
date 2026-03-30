import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f1a0f',
            color: '#f7f3ec',
            border: '1px solid rgba(45,140,45,0.3)',
            borderRadius: '12px',
            fontFamily: '"DM Sans", sans-serif',
          },
          success: { iconTheme: { primary: '#2d8c2d', secondary: '#f7f3ec' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#f7f3ec' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
