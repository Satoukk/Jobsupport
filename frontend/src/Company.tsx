import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Header, Footer } from './App.tsx'
import './style/App.css'
import './style/Header.css'
import './style/Footer.css'

type CompanyRecord = { 
  id: number; 
  company_name: string;
  industry: string; 
  memo: string;
  userid: number
 }

let testCompany:CompanyRecord[] = [
  {
  id : 1,
  company_name:'名古屋オフィス',
  industry:'IT',
  memo:'',
  userid:37,
  },
  {
  id : 2,
  company_name:'大阪オフィス',
  industry:'IT',
  memo:'',
  userid:37,
  },
  {
  id : 3,
  company_name:'東京オフィス',
  industry:'IT',
  memo:'',
  userid:37,
  },
]

function Company() {
  const [companies, setCompanies] = useState<CompanyRecord[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const userId = sessionStorage.getItem('id')
    if (!userId || !/^\d+$/.test(userId)) {
      setError('企業を見るには、先にログインしてください。')
      setLoading(false)
      return
    }
    axios.get(`http://localhost:8080/api/users/${Number(userId)}/companies`)
      .then((response) => setCompanies(response.data.companies ?? []))
      .catch((requestError) => {
        console.error(requestError)
        setError('企業データを読み込めませんでした。')
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredCompanies = useMemo(() => companies.filter((company) => `${company.company_name} ${company.industry} ${company.memo}`.toLowerCase().includes(name.trim().toLowerCase())), [companies, name])

  return (
  <div className="companyPage">
    <Header />
    <div>
      {testCompany.map((company)=>(
        <div key = {company.id}>
          <li>{company.company_name}</li>
          <li>{company.industry}</li>
          <li>{company.memo}</li>
        </div>
      ))}
    </div>
    <Footer/>
  </div>
  )
}

export default Company
