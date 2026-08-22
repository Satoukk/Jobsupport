import { useRef, useState } from 'react'
import axios from 'axios'
import { Header } from './App.tsx'
import { useNavigate } from 'react-router-dom'
import './style/App.css'
import './style/Header.css'
import './style/Login.css'

function Register() {
  const navigate = useNavigate()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  const Login = async () => {
    const email = emailRef.current?.value
    const password = passwordRef.current?.value

    try {
      const res = await axios.post('http://localhost:8080/api/users/login', {
        email: email,
        password: password,
      })

      sessionStorage.setItem('id', String(res.data.id))
      navigate('/')
    } catch (error) {
      console.log(error)
      setMessage('メールアドレスまたはパスワードが違います')
    }
  }

  return (
    <div className="loginPage">
      <Header />

      <main className="loginMain">
        <section className="loginPanel">
          <div className="loginIntro">
            <p>Account</p>
            <h2>ログイン</h2>
            <span>
              登録したメールアドレスとパスワードで始めましょう。
            </span>
          </div>

          <div className="loginFields">
            <label className="loginField">
              <span>メールアドレス</span>
              <input type="email" placeholder="name@example.com" ref={emailRef} />
            </label>

            <label className="loginField">
              <span>パスワード</span>
              <input type="password" placeholder="8文字以上" ref={passwordRef} />
            </label>
          </div>

          <button className="loginButton" type="button" onClick={Login}>
            ログイン
          </button>

          {message && <p className="loginMessage">{message}</p>}
        </section>
      </main>
    </div>
  )
}

export default Register
