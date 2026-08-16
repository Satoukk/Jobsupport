import { useState } from 'react'
import axios from 'axios'
import { Header, Footer } from './App.tsx'
import { useNavigate } from "react-router-dom";
import './style/App.css'
import './style/Header.css'
import './style/Footer.css'

function Login() {
  return (
    <div>
      <Header />
      <LoginForm />
      <Footer />
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
      setMessage('登録しました');
      navigate("/Certification")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data.error || 'エラーが発生しました')
        return
      }

      if (error instanceof Error) {
        setMessage(error.message)
        return
      }

      setMessage('予期しないエラーが発生しました')
    }
  }

  return (
    <>
      <div>
        <input
          type="text"
          placeholder="ユーザー名を入力してください"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="メールアドレスを入力してください"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="パスワードを入力してください"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button type="button" onClick={createUser}>
          登録する
        </button>
      </div>
      {message && <p>{message}</p>}
    </>
  )
}

export default Login
