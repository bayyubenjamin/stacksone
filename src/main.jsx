import './polyfills'; // <--- WAJIB DI BARIS 1
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'; // Tambahkan ini

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
// update 2 at Sel 31 Mar 2026 09:22:34 WIB
