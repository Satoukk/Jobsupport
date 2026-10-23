import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from './App.tsx'
import './style/App.css'
import './style/Header.css'
import './style/Auth.css'

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const createUser = async () => {
    try {
      const res = await axios.post('http://localhost:8080/api/usersemail', {
        username: name,
        email,
        password,
      })
      const rawId = res.data?.id ?? res.data?.user?.id
      const userId = Number(rawId)
      if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error(`登録APIから有効なIDが返りませんでした: ${JSON.stringify(res.data)}`)
      }
      sessionStorage.setItem('id', String(userId))
      navigate('/Certification')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data.error || '登録できませんでした。入力内容をご確認ください。')
        return
      }
      setMessage(error instanceof Error ? error.message : '予期しないエラーが発生しました。')
    }
  }

  return (
    <div className="authPage">
      <Header />
      <main className="authMain">
        <section className="authPanel" aria-labelledby="register-title">
          <div className="authIntro">
            <span className="authEyebrow"><span className="authSparkle">✦</span> START YOUR JOURNEY</span>
            <h2 id="register-title">就活サポートを<br className="authMobileBreak" />始めよう</h2>
            <p>まずはアカウントを作って、自分のペースで。</p>
          </div>

          <div className="authFields">
            <label className="authField">
              <span>ユーザー名</span>
              <input type="text" autoComplete="name" placeholder="山田 太郎" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="authField">
              <span>メールアドレス</span>
              <input type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="authField">
              <span>パスワード</span>
              <input type="password" autoComplete="new-password" placeholder="8文字以上" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
          </div>

          <button className="authButton" type="button" onClick={createUser}>認証コードを送る <span aria-hidden="true">→</span></button>
          {message && <p className="authMessage" role="alert">{message}</p>}
          <p className="authSwitch">すでにアカウントをお持ちですか？ <Link to="/Login">ログイン</Link></p>
          <div className="authNote"><span aria-hidden="true">✉</span> メール認証で、かんたんスタート。</div>
        </section>
        <aside className="authSide" aria-label="サービスの紹介">
          <div className="authOrbit authOrbitOne" /><div className="authOrbit authOrbitTwo" />
          <span className="authSideLabel">A LITTLE STEP, A BIG CHANGE</span>
          <div className="authIllustration" aria-hidden="true"><span className="authSun">☀</span><span className="authLeaf">✿</span><span className="authBook">▱</span></div>
          <h3>あなたらしい<br />未来を見つけよう。</h3>
          <p>がんばりすぎなくて大丈夫。<br />一歩ずつ、未来を育てていこう。</p>
          <div className="authDots" aria-hidden="true"><i /><i /><i /></div>
        </aside>
      </main>
    </div>
  )
}

export default Register
