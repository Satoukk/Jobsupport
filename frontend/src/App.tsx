import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import supo from './assets/supo.png'
import './style/App.css'
import './style/Header.css'
import './style/Footer.css'

type Company = { id: number; company_name: string; industry: string; memo: string; userid: number }
type Character = { id: number; name: string; level: number; exp: number }

function App() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<Company[]>([])
  const [character, setCharacter] = useState<Character>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const userId = sessionStorage.getItem('id')
    if (!userId || !/^\d+$/.test(userId)) {
      navigate('/Login')
      return
    }

    const loadDashboard = async () => {
      try {
        const [companyResponse, characterResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/users/${Number(userId)}/companies`),
          axios.get(`http://localhost:8080/api/users/${Number(userId)}/characters`),
        ])
        setCompanies(companyResponse.data.companies ?? [])
        setCharacter((characterResponse.data.characters ?? [])[0])
      } catch (loadError) {
        console.error(loadError)
        setError('データを読み込めませんでした。バックエンドが起動しているか確認してください。')
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [navigate])

  if (loading) return <div className="appState"><span className="loadingMark">✦</span><p>あなたのページを準備しています…</p></div>
  if (error) return <div className="appState"><p>{error}</p><button className="softButton" onClick={() => window.location.reload()}>もう一度読み込む</button></div>

  return (
    <div className="dashboardPage">
      <Header />
      <main className="dashboardMain">
        <div className="dashboardWelcome">
          <div><p className="sectionEyebrow">YOUR CAREER JOURNAL</p><h2>今日も一歩ずつ。</h2><p>あなたのペースで、未来への準備を進めよう。</p></div>
          <span className="welcomeFlower" aria-hidden="true">✿</span>
        </div>
        {character ? <StatusCard character={character} /> : <section className="welcomeCard"><div className="welcomeIcon">🌱</div><div><h3>ここからスタート</h3><p>あなたの相棒キャラクターを準備中です。</p></div></section>}
        <section className="dashboardSection">
          <div className="sectionHeading"><div><p className="sectionEyebrow">OVERVIEW</p><h2>就活の進み具合</h2></div><span className="sectionIcon">✧</span></div>
          <StatusSummary companyCount={companies.length} />
        </section>
        <section className="dashboardSection scheduleSection">
          <div className="sectionHeading"><div><p className="sectionEyebrow">UP NEXT</p><h2>登録した企業</h2></div><button className="textLink" onClick={() => navigate('/companies')}>企業を見る <span>→</span></button></div>
          <ListSchedule companies={companies} />
        </section>
      </main>
      <Footer />
    </div>
  )
}

export function Header() {
  return <header className="headerbody"><div className="header-circle header-circle-left" /><div className="header-circle header-circle-right" /><div className="header-content"><span className="brandMark">✿</span><h1>就活サポート</h1><p>小さな一歩を、いっしょに。</p></div></header>
}

export function Footer() {
  const navigate = useNavigate()
  return <footer className="footer"><nav className="footer-nav" aria-label="メインナビゲーション"><button onClick={() => navigate('/')}>⌂ <span>ホーム</span></button><button onClick={() => navigate('/companies')}>▤ <span>企業</span></button><button onClick={() => navigate('/Certification')}>✉ <span>認証</span></button><button onClick={() => navigate('/Login')}>○ <span>アカウント</span></button></nav></footer>
}

function StatusCard({ character }: { character: Character }) {
  const maxExp = 100
  const expPercent = Math.min(100, Math.max(0, (character.exp / maxExp) * 100))
  return <section className="statusCard"><div className="characterFrame"><img className="characterImage" src={supo} alt="あなたの就活サポートキャラクター" /><span className="characterSparkle">✦</span></div><div className="statusText"><span className="characterCaption">YOUR PARTNER</span><h2>{character.name}</h2><p className="level">LEVEL <strong>{character.level}</strong></p><div className="expBar" role="progressbar" aria-label="経験値" aria-valuenow={character.exp} aria-valuemin={0} aria-valuemax={maxExp}><div className="expFill" style={{ width: `${expPercent}%` }} /></div><p className="expText">EXP <strong>{character.exp}</strong> / {maxExp}</p><p className="message">今日の小さな行動が、未来の自信につながるよ。</p></div></section>
}

function StatusSummary({ companyCount }: { companyCount: number }) {
  const items = [{ label: '気になる企業', count: companyCount, icon: '♡', tone: 'rose' }, { label: '選考中', count: 0, icon: '✧', tone: 'blue' }, { label: '内定', count: 0, icon: '✿', tone: 'mint' }, { label: 'これから', count: 0, icon: '→', tone: 'gold' }]
  return <div className="summarybody">{items.map((item) => <article className={`summaryitem ${item.tone}`} key={item.label}><span className="summaryIcon">{item.icon}</span><span className="summaryLabel">{item.label}</span><strong>{item.count}</strong></article>)}</div>
}

function ListSchedule({ companies }: { companies: Company[] }) {
  const upcoming = companies.filter((company) => company.company_name.trim()).slice(0, 4)
  if (upcoming.length === 0) return <div className="emptyCompanies"><span>☘</span><p>企業を登録すると、ここに表示されます。</p></div>
  return <ul className="companyPreview">{upcoming.map((company) => <li key={company.id}><span className="companyInitial">{company.company_name.slice(0, 1)}</span><span className="companyPreviewName">{company.company_name}</span><span className="companyPreviewMeta">{company.industry || '業界未設定'}</span><span className="previewArrow">↗</span></li>)}</ul>
}

export default App
