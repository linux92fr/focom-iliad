import React from 'react'
import ReactDOM from 'react-dom/client'
import AuthShell from './AuthShell'
import '@neondatabase/auth/ui/css'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthShell />
  </React.StrictMode>,
)
