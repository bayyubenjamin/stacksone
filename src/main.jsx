// src/main.jsx (Update kode ini)
import './polyfills'; // <--- WAJIB DI BARIS PERTAMA

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
