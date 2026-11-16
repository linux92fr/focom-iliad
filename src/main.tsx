import React from 'react'
import ReactDOM from 'react-dom/client'
import AuthShell from './AuthShell'
import './styles.css'
import '@neondatabase/auth/ui/css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthShell />
  </React.StrictMode>,
)
