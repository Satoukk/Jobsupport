import { useState } from 'react'
import axios from 'axios'
import { Header } from './App.tsx'
import { useNavigate } from 'react-router-dom'
import './style/App.css'
import './style/Header.css'
import './style/Register.css'

const registerText = {
  title: '\u65b0\u898f\u767b\u9332',
  description:
    '\u30e1\u30fc\u30eb\u8a8d\u8a3c\u30b3\u30fc\u30c9\u3092\u9001\u3063\u3066\u3001\u5c31\u6d3b\u30b5\u30dd\u30fc\u30c8\u3092\u59cb\u3081\u307e\u3059\u3002',
  userName: '\u30e6\u30fc\u30b6\u30fc\u540d',
  userNamePlaceholder: '\u5c71\u7530 \u592a\u90ce',
  email: '\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9',
  password: '\u30d1\u30b9\u30ef\u30fc\u30c9',
  passwordPlaceholder: '8\u6587\u5b57\u4ee5\u4e0a',
  submit: '\u8a8d\u8a3c\u30b3\u30fc\u30c9\u3092\u9001\u308b',
  registered: '\u767b\u9332\u3057\u307e\u3057\u305f',
  error: '\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f',
  unexpectedError:
    '\u4e88\u671f\u3057\u306a\u3044\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f',
}

function Login() {
  return (
    <div className="registerPage">
      <Header />
      <LoginForm />
    </div>
  )
}

function LoginForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const createUser = async () => {
    try {
      const res = await axios.post('http://localhost:8080/api/usersemail', {
        username: name,
        email,
        password,
      })

      sessionStorage.setItem('id', String(res.data.id))
      setMessage(registerText.registered)
      navigate('/Certification')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data.error || registerText.error)
        return
      }

      if (error instanceof Error) {
        setMessage(error.message)
        return
      }

      setMessage(registerText.unexpectedError)
    }
  }

  return (
    <main className="registerMain">
      <section className="registerPanel" aria-labelledby="register-title">
        <div className="registerIntro">
          <p className="registerEyebrow">Account</p>
          <h2 id="register-title">{registerText.title}</h2>
          <p>{registerText.description}</p>
        </div>

        <div className="registerFields">
          <label className="registerField">
            <span>{registerText.userName}</span>
            <input
              type="text"
              placeholder={registerText.userNamePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="registerField">
            <span>{registerText.email}</span>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="registerField">
            <span>{registerText.password}</span>
            <input
              type="password"
              placeholder={registerText.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        <button className="registerButton" type="button" onClick={createUser}>
          {registerText.submit}
        </button>

        {message && <p className="registerMessage">{message}</p>}
      </section>
    </main>
  )
}

export default Login
