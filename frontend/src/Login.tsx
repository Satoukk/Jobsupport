import { useState ,useEffect} from 'react'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {Header,Footer} from "./App.tsx"
import supo from "./assets/supo.png"
import '../style/App.css'
import '../style/Header.css'
import '../style/Footer.css'

type Props = {
    name:string;
    email:string;
    password:string;
}

type User = {
    ID :  number;
    UserName :string;
    Email :string;
    Password : string;
}

const [error,setError] = useState("");

function Login(){
     return(
        <div>
            <Header/>
            <LoginForm />
            <Footer/>
        </div>
     )
}

//入力欄
function LoginForm(){
    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
   
    return(
        <>
        <div>
            <input type="text" placeholder="ユーザー名を記入してください" onChange={(e)=>setName(e.target.value)}></input>
            <input type="email" placeholder="メールアドレスを記入してください" onChange={(e)=>setEmail(e.target.value)}></input>
            <input type="password" placeholder="パスワードを記入してください" onChange={(e)=>setPassword(e.target.value)}></input>
        </div>
        <div>
            <button onClick={()=>CreateUser(name,email,password)}>登録する</button>
        </div>
        </>
    )
}

//ユーザー登録
const CreateUser = async(name:string,email:string,password:string)=>{
    try{
        const res = await axios.post(`http://localhost:8080/api/users/`,{
                name,
                email,
                password,
    });
        sessionStorage.setItem("userid", String(res.data.id));
        setError("成功しました");
    }catch(error){
           if( axios.isAxiosError(error)){
            setError(error.response?.data.error||"エラーが発生しました")
            return;
           }
           
           if(error instanceof Error){
            setError(error.message);
            return;
           }
           setError("予期しないエラー");
    }
}