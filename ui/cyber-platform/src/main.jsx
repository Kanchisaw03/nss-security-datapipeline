import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A1F2E',
            color: '#00FFC6',
            border: '1px solid #00FFC6',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#00FFC6',
              secondary: '#1A1F2E',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF00A8',
              secondary: '#1A1F2E',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
