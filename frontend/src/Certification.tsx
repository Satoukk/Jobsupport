import { useState,useEffect } from 'react'
import axios from 'axios'
import { Header, Footer } from './App.tsx'
import { useNavigate } from "react-router-dom";
import './style/App.css'
import './style/Header.css'
import './style/Footer.css'

function Certification(){
    const navigate = useNavigate()
    //認証コード
    const [code, setCode] = useState("")
    const id = sessionStorage.getItem("id")
    const [message,setMessage] = useState("")
    //ユーザー情報取得関数
    const userfetch = async () =>{
        try{
        const res = await axios.get("http://localhost:8080/api/usercertification",{
            params:{
                ID : id,
            }
        })
        return res
        }catch(error){
          console.error(error)
        }
    }

//入力できる文字を制限
const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value

  const onlyNumbers = value.replace(/\D/g, "")
  const sixDigits = onlyNumbers.slice(0, 6)

  setCode(sixDigits)
}

//認証処理
const handleCodeCheck = async () => {
    try{
    const answer = await axios.get("http://localhost:8080/api/certification/",{
        params:{
            ID : id,
            verification_token : code,
        }
    })
    if(answer.data.answer===true){
      navigate("/")
    }
    else{
          setMessage("コードが間違っています")
    }
}catch(error){
    console.error(error);
}
}

    //ユーザー情報を取得
    useEffect(()=>{
        const userdata = userfetch()
    },[])
    return(
        <>
        <Header/>
        <p>
            メールに認証コードを送りました<br/>
            認証コードを入力してください
        </p>
           <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={6}
      value={code}
      onChange={handleCodeChange}
    />

    <button disabled={code.length !== 6} onClick={handleCodeCheck}>
      認証する
    </button>
    {message && <p>{message}</p>}
        </>
    )
}
export default Certification