import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './style/index.css'
import App from './App.tsx'
import Company from './Company.tsx'
import Login from './Login.tsx'
import Certification from './Certification'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/companies" element={<Company />} />        
        <Route path="/Login" element={<Login />} />
        <Route path="/Certification" element={<Certification/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
