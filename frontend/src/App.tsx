import { useState ,useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import supo from "./assets/supo.png"
import axios from "axios"
import './style/App.css'
import './style/Header.css'
import './style/Footer.css'

type Company = {
  id: number;
  company_name: string;
  industry: string;
  memo: string;
  userid: number;
};

function App() {
  const [companys,setCompanys] = useState<Company[]>([]);
  const [err,setError] = useState("");
  const [loading,setLoading] = useState(true);
  //const [scheduleAts, setScheduleAts] = useState<string[]>([]);
  const [statusCount] = useState({
  entry:0,
  selection:0,
  offer: 0,
  rejection:0,
})

  useEffect(()=>{
    const fetchJob = async () => {
      try {
  
          const userid = 1;
          const res = await fetch(`http://localhost:8080/api/users/${userid}/companies`)
          if(!res.ok){
            throw new Error("データ取得に失敗しました")
          }
          const data: { companies: Company[] } = await res.json();
          setCompanys(data.companies);
      }
      catch(err){
          setError("エラーが発生しました");
      } finally{
        setLoading(false)
      }
    }
    const getcharacter = async () =>{
        const character = await axios.get('http://localhost:8080/api/character',{
            params: {
              id:1,
            },
        }) 
    }
    fetchJob();
  },[])

  if (loading) {
    return <p>読み込み中...</p>;
  }

  if (err) {
    return <p>{err}</p>;
  }

  return (
    <>
    <Header/>
    <StatusCard/>
    <StatusSummary statusCount={statusCount}/>
    <ListSchedule companys={companys}/>
    <Footer/>
    </>
  )
}

export function Header(){
  return(
    <> 
    <header className="headerbody">
      <div className="header-circle header-circle-left" />
      <div className="header-circle header-circle-right" />
      <div className="header-content">
      <h1>就活サポ</h1>
    </div>
    </header>
    </>
  )
}

export function Footer(){
    const navigate = useNavigate();
  return(
    <>
     <footer className="footer">
      <nav className="footer-nav">
        <button>ホーム</button>
        <button onClick={()=>navigate("/companies")}>企業</button>
        <button>予定</button>
        <button>キャラ</button>
      </nav>
     </footer>
    </>
  )
}

function StatusCard() {
  const exp = 70;
  const maxExp = 100;
  const expPercent = (exp / maxExp) * 100;

  return (
    <section className="statusCard">
      <img className="characterImage"src={supo} alt="たべるくん" />

      <div className="statusText">
        <h2>たべるくん</h2>
        <p className="level">Lv.4</p>

        <div className="expBar">
          <div
            className="expFill"
            style={{ width: `${expPercent}%` }}
          />
        </div>

        <p className="expText">EXP {exp} / {maxExp}</p>
        
        <p className="message">
          今日は締切を1つ片付けよう。<br />
          焦りは行動で削る。
        </p>
      </div>
    </section>
  );
}
function StatusSummary({
    statusCount,}: 
    {
    statusCount: {
      entry: number
      selection: number
      offer: number
      rejection: number
  }
}
){
  return(
    <>  
    <section className="summarybody">
    <StatusTitle label="応募" count={statusCount.entry}/>
    <StatusTitle label="選考中" count={statusCount.selection}/>
    <StatusTitle label="内定" count={statusCount.offer}/>
    <StatusTitle label="お祈り" count={statusCount.rejection}/>
    </section>
    </>
  )
}

function StatusTitle({label,count}:{label:string,count:number}){
  return(
    <div className="summaryitem">
      <span><b>{label}</b></span>
      <strong>{count}</strong>
    </div>
  )
}

function ListSchedule({ companys }: { companys: Company[] }){
  const scheduledCompanies = companys.filter((company) => company.company_name.trim());

  return(
    <>
    <strong>今後の予定</strong>
  <ul>
    {scheduledCompanies.map((company) => (
      <li key={company.id}>
        {company.company_name}
      </li>
    ))}
  </ul>

    </>
  )
}

export default App
