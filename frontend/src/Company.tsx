import { useState } from 'react'
import { Header, Footer } from './App.tsx'
import './style/App.css'
import './style/Header.css'
import './style/Footer.css'

function Company() {
  const [name, setName] = useState('')

  return (
    <div>
      <Header />
      <SearchBox value={name} onChange={setName} />
      <Footer />
    </div>
  )
}

function SearchBox({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <input
        type="search"
        id="searchBox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="企業名"
      />
      <button type="button">検索</button>
    </div>
  )
}

export default Company
