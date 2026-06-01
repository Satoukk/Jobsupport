import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import './Header.css'
import './Footer.css'

function App() {

  return (
    <>
    <Header/>
    <Footer/>
    </>
  )
}

function Header(){
  return(
    <> 
    <header className="headerbody">
      <div className="header-circle header-circle-left" />
      <div className="header-circle header-circle-right" />
      <div className="header-content">
      <h1>就活サポ</h1>
    </div>
    </header>
    </>
  )
}

function Footer(){
  return(
    <>
     <footer className="footer">
      <nav className="footer-nav">
        <button>ホーム</button>
        <button>企業</button>
        <button>予定</button>
        <button>キャラ</button>
      </nav>
     </footer>
    </>
  )
}

export default App
