import { useEffect,  useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header,Footer } from "./App.tsx"
import "./App.css";
import "./Header.css";
import "./Footer.css";


function Company(){
  const [name,setName]=useState("")

  return(
    <div>
      <Header/>
      <SearchBox onChange={setName} />
      <Footer/>
    </div>
  )
}

const SearchBox=(props:{
  onChange:(value:string) => void;
}
)=>{
  return(
    <div>
      <input type="search" id="serchBox" onChange={(e)=>props.onChange(e.target.value)} placeholder="企業名" />
      <button onClick={()=>Serch()}></button>
    </div>
  )
}


function  Serch(){
  const serchresult = async()=>{
    try{
        
    }
    catch{

    }
  }
}
export default Company