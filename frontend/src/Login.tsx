import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from './App.tsx'
import './style/App.css'
import './style/Header.css'
import './style/Auth.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:8080/api/users/login', {
        email,
        password,
      })
      const rawId = res.data?.id ?? res.data?.user?.id
      const userId = Number(rawId)
      if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error('ログインAPIから有効なユーザーIDが返りませんでした。')
      }
      sessionStorage.setItem('id', String(userId))
      navigate('/')
    } catch {
      setMessage('メールアドレスまたはパスワードが違います。もう一度お試しください。')
    }
  }

  return (
    <div className="authPage">
      <Header />
      <main className="authMain">
        <section className="authPanel" aria-labelledby="login-title">
          <div className="authIntro">
            <span className="authEyebrow"><span className="authSparkle">✦</span> MY CAREER, MY PACE</span>
            <h2 id="login-title">おかえりなさい</h2>
            <p>あなたの就活の続きから、ゆっくり始めましょう。</p>
          </div>

          <div className="authFields">
            <label className="authField">
              <span>メールアドレス</span>
              <input type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="authField">
              <span>パスワード</span>
              <input type="password" autoComplete="current-password" placeholder="8文字以上" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
          </div>

          <button className="authButton" type="button" onClick={handleLogin}>ログイン <span aria-hidden="true">→</span></button>
          {message && <p className="authMessage" role="alert">{message}</p>}
          <p className="authSwitch">はじめての方はこちら <Link to="/Register">新規登録</Link></p>
          <div className="authNote"><span aria-hidden="true">☘</span> 小さな一歩も、ちゃんと前進。</div>
        </section>
        <aside className="authSide" aria-label="サービスの紹介">
          <div className="authOrbit authOrbitOne" /><div className="authOrbit authOrbitTwo" />
          <span className="authSideLabel">YOUR NEXT CHAPTER</span>
          <div className="authIllustration" aria-hidden="true"><span className="authSun">☀</span><span className="authLeaf">✿</span><span className="authBook">▱</span></div>
          <h3>就活を、<br />ひとりにしない。</h3>
          <p>応募も、選考も、あなたのペースで。<br />ここから一緒に進めていこう。</p>
          <div className="authDots" aria-hidden="true"><i /><i /><i /></div>
        </aside>
      </main>
    </div>
  )
}

export default Login
