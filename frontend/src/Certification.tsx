import { useEffect, useState } from 'react'
import axios from 'axios'
import { Header } from './App.tsx'
import { useNavigate } from 'react-router-dom'
import './style/App.css'
import './style/Header.css'
import './style/Register.css'

const certificationText = {
  title: '\u30e1\u30fc\u30eb\u8a8d\u8a3c',
  description:
    '\u30e1\u30fc\u30eb\u306b\u5c4a\u3044\u305f6\u6841\u306e\u30b3\u30fc\u30c9\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
  label: '\u8a8d\u8a3c\u30b3\u30fc\u30c9',
  placeholder: '000000',
  submit: '\u8a8d\u8a3c\u3059\u308b',
  invalid: '\u30b3\u30fc\u30c9\u304c\u9593\u9055\u3063\u3066\u3044\u307e\u3059',
  error: '\u8a8d\u8a3c\u306b\u5931\u6557\u3057\u307e\u3057\u305f',
}

function Certification() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const id = sessionStorage.getItem('id')

  const userfetch = async () => {
    try {
      await axios.get('http://localhost:8080/api/usercertification', {
        params: {
          id,
        },
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '')
    setCode(onlyNumbers.slice(0, 6))
  }

  const handleCodeCheck = async () => {
    try {
      const answer = await axios.post('http://localhost:8080/api/certification', {
        id: Number(id),
        verification_token: code,
      })

      if (answer.data.answer === true) {
        navigate('/')
        return
      }

      setMessage(certificationText.invalid)
    } catch (error) {
      setMessage(certificationText.error)
      console.error(error)
    }
  }

  useEffect(() => {
    userfetch()
  }, [])

  return (
    <div className="registerPage">
      <Header />

      <main className="registerMain">
        <section className="registerPanel certificationPanel" aria-labelledby="certification-title">
          <div className="registerIntro certificationIntro">
            <p className="registerEyebrow">Verify</p>
            <h2 id="certification-title">{certificationText.title}</h2>
            <p>{certificationText.description}</p>
          </div>

          <label className="registerField certificationField">
            <span>{certificationText.label}</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder={certificationText.placeholder}
              value={code}
              onChange={handleCodeChange}
            />
          </label>

          <button
            className="registerButton"
            disabled={code.length !== 6}
            onClick={handleCodeCheck}
            type="button"
          >
            {certificationText.submit}
          </button>

          {message && <p className="registerMessage">{message}</p>}
        </section>
      </main>
    </div>
  )
}

export default Certification
