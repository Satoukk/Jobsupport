import { useState } from 'react'
import supo from "./assets/supo.png"
import './App.css'
import './Header.css'
import './Footer.css'


function App() {
  const [statusCount] = useState({
  entry:0,
  selection:0,
  offer: 0,
  rejection:0,
})

  return (
    <>
    <Header/>
    <StatusCard/>
    <StatusSummary statusCount={statusCount}/>
    <ListSchedule/>
    <Footer/>
    </>
  )
}

function Header(){
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

function Footer(){
  return(
    <>
     <footer className="footer">
      <nav className="footer-nav">
        <button>ホーム</button>
        <button>企業</button>
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

function ListSchedule(){
  const fetchhealth = async () =>{
  const res = await fetch("http://localhost:8080/api/health")
  const data = await res.json();
  console.log(data);
  }
  return(
    <>
    <strong>今後の予定</strong>
    <button onClick={fetchhealth}>API検証</button>
    </>
  )
}

export default App
