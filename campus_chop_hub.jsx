import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const G_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:'DM Sans',sans-serif;background:#FAF7F2;color:#1C1C1C;-webkit-font-smoothing:antialiased}
  h1,h2,h3,.serif{font-family:'Playfair Display',serif}
  img{display:block;max-width:100%}
  button{cursor:pointer;font-family:'DM Sans',sans-serif;border:none}
  input,select,textarea{font-family:'DM Sans',sans-serif}

  @keyframes spin    {to{transform:rotate(360deg)}}
  @keyframes fadeUp  {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
  @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
  @keyframes slideL  {from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:none}}
  @keyframes slideR  {from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
  @keyframes toast   {from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:none}}
  @keyframes shimmer {from{background-position:200% 0}to{background-position:-200% 0}}
  @keyframes pulse   {0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes grow    {from{width:0}to{width:100%}}
  @keyframes scalePop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}

  .anim{animation:fadeUp .5s ease both}
  .fadeIn{animation:fadeIn .4s ease both}
  .slideL{animation:slideL .4s ease both}
  .slideR{animation:slideR .4s ease both}
  .scalePop{animation:scalePop .35s cubic-bezier(.34,1.56,.64,1) both}

  .card-h{transition:transform .22s,box-shadow .22s}
  .card-h:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(0,0,0,.13)!important}

  input:focus,select:focus,textarea:focus{outline:none;border-color:#D97706!important;box-shadow:0 0 0 3px rgba(217,119,6,.12)}

  .shimmer{background:linear-gradient(90deg,#f0ebe3 25%,#e8e3db 50%,#f0ebe3 75%);background-size:400% 100%;animation:shimmer 1.4s infinite}

  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:3px}
  ::-webkit-scrollbar-track{background:transparent}

  @media(max-width:640px){.hide-sm{display:none!important}}
  @media(min-width:641px){.show-sm{display:none!important}}
`;

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & DATA
// ─────────────────────────────────────────────────────────────────────────────
const CAFES = ["Cafe 1","Cafe 2","Cafe 3","Back of Cafe"];
const HOSTELS = ["Joseph Hall","Daniel Hall","Mary Hall","Esther Hall","Peter Hall","Deborah Hall"];
const PAY = [
  {id:"wallet",  label:"LMU E-Wallet",     icon:"💳", note:"Deducted instantly"},
  {id:"transfer",label:"Bank Transfer",    icon:"🏦", note:"Send to cafe account"},
  {id:"cash",    label:"Cash on Delivery", icon:"💵", note:"Pay when food arrives"},
];
const VENDOR_ACCTS = [
  {id:"v1",u:"cafe1",    p:"Vendor1", cafe:"Cafe 1",       name:"Cafe 1 — Manager"},
  {id:"v2",u:"cafe2",    p:"Vendor2", cafe:"Cafe 2",       name:"Cafe 2 — Manager"},
  {id:"v3",u:"cafe3",    p:"Vendor3", cafe:"Cafe 3",       name:"Cafe 3 — Manager"},
  {id:"v4",u:"backcafe", p:"Vendor4", cafe:"Back of Cafe", name:"Back Cafe — Manager"},
];
const ADMIN = {u:"admin",p:"Admin2024",name:"Platform Administrator"};
const DEFAULT_TIMES = {"Cafe 1":20,"Cafe 2":15,"Cafe 3":18,"Back of Cafe":12};

// Unsplash photo map
const U = (id,w=500) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const PH = {
  1: U("1604329760661-e71dc83f8f26"),   // jollof rice
  2: U("1603133872878-684f208fb84b"),   // fried rice
  3: U("1455619452474-d2be8b1e70cd"),   // stew / amala
  4: U("1574894709920-11b28e7367e3"),   // soup + swallow
  5: U("1481931098730-318b6f776db0"),   // spaghetti
  6: U("1569050467447-ce54b3bbc37d"),   // noodles
  7: U("1516100882582-96c3a05fe590"),   // ofada rice
  8: U("1585937421612-70a008356fbe"),   // beans/plantain
  9: U("1568901346375-23c9450c58cd"),   // burger
  10:U("1565299585323-38d6b0865b47"),   // shawarma/wrap
  11:U("1571091718767-18b5b1457add"),   // pastry / meat pie
  12:U("1527477396000-e27163b481c2"),   // fried chicken
  13:U("1544025162-d76694265947"),      // suya / grilled meat
  14:U("1551754655-cd27e38d2076"),      // roasted corn
  15:U("1565958011703-44f9829ba187"),   // fish
  16:U("1528207776546-365bb710ee93"),   // plantain
  hero:  U("1504674900247-0877df9cc836",1600),  // food spread
  hero2: U("1414235077428-338989a2e8c0",1600),  // restaurant
  auth:  U("1567521464027-f127ff144326",900),   // food hall
  c1:    U("1466978913421-dad2ebd01d17",700),   // cafe 1
  c2:    U("1554118811-1e0d58224f24",700),       // cafe 2
  c3:    U("1493770348161-369560ae357d",700),    // cafe 3
  c4:    U("1555396273-367ea4eb4db5",700),       // back of cafe
  campus:U("1607237138185-eedd9c632b0b",1200),  // university
};
const CAFE_IMG = {"Cafe 1":PH.c1,"Cafe 2":PH.c2,"Cafe 3":PH.c3,"Back of Cafe":PH.c4};
const FB = U("1504674900247-0877df9cc836");     // fallback image

const INIT_MENU = {
  "Cafe 1":[
    {id:1,name:"Jollof Rice + Chicken",   price:1200,img:1,tag:"Bestseller",available:true},
    {id:2,name:"Fried Rice + Fish",       price:1100,img:2,tag:"Popular",   available:true},
    {id:3,name:"Amala + Ewedu Soup",      price:900, img:3,tag:"Bestselling",available:true},
    {id:4,name:"Egusi + Pounded Yam",     price:1300,img:4,tag:"Chef's Pick",available:false},
  ],
  "Cafe 2":[
    {id:5,name:"Spaghetti Bolognese",     price:800, img:5,tag:"Budget",    available:true},
    {id:6,name:"Indomie + Egg",           price:600, img:6,tag:"Fast",      available:true},
    {id:7,name:"Ofada Rice + Stew",       price:1400,img:7,tag:"Premium",   available:true},
    {id:8,name:"Fried Plantain + Beans",  price:700, img:8,tag:"Bestselling",          available:true},
  ],
  "Cafe 3":[
    {id:9, name:"Chicken Burger + Fries", price:1500,img:9, tag:"Trending", available:true},
    {id:10,name:"Beef Shawarma",          price:1200,img:10,tag:"Hot 🔥",   available:true},
    {id:11,name:"Meat Pie + Juice",       price:600, img:11,tag:"Snack",    available:true},
    {id:12,name:"Crispy Chicken Wings",   price:1800,img:12,tag:"Premium",  available:false},
  ],
  "Back of Cafe":[
    {id:13,name:"Beef Suya + Yam",        price:1000,img:13,tag:"Evening Fav",available:true},
    {id:14,name:"Roasted Corn + Ube",     price:400, img:14,tag:"Light",    available:true},
    {id:15,name:"Bole + Fish Sauce",      price:900, img:15,tag:"Classic",  available:true},
    {id:16,name:"Sweet Roasted Plantain", price:500, img:16,tag:"",         available:true},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────────────────────────────────────
const db = {
  async get(k){try{const r=await window.storage.get(k,true);return r?JSON.parse(r.value):null;}catch{return null;}},
  async set(k,v){try{await window.storage.set(k,JSON.stringify(v),true);return true;}catch{return false;}},
};

// ─────────────────────────────────────────────────────────────────────────────
// AI
// ─────────────────────────────────────────────────────────────────────────────
async function ai(sys,usr){
  const r=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:sys,messages:[{role:"user",content:usr}]}),
  });
  const d=await r.json();
  return d.content?.map(b=>b.text||"").join("")||"No response.";
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Spin = ()=><span style={{display:"inline-block",width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .7s linear infinite",verticalAlign:"middle"}} />;
const Dot  = ({c="#F59E0B"})=><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:c,animation:"pulse 1.5s ease-in-out infinite"}} />;

function Stars({val=0,set,sz=16}){
  return <div style={{display:"flex",gap:3}}>{[1,2,3,4,5].map(s=>(
    <span key={s} onClick={()=>set?.(s)} style={{fontSize:sz,cursor:set?"pointer":"default",color:s<=val?"#F59E0B":"#D5C9B8",transition:"color .12s"}}>★</span>
  ))}</div>;
}

function Badge({text,color="#16A34A"}){
  return <span style={{fontSize:10,fontWeight:700,letterSpacing:.5,background:color+"1A",color,border:`1px solid ${color}44`,borderRadius:30,padding:"3px 10px",whiteSpace:"nowrap"}}>{text}</span>;
}
function SChip({s}){
  const m={Preparing:"#F59E0B","On the Way":"#3B82F6",Delivered:"#16A34A",Pending:"#F59E0B","In Review":"#3B82F6",Resolved:"#16A34A",Cancelled:"#EF4444"};
  return <Badge text={s} color={m[s]||"#6B7280"}/>;
}

function Img({src,alt="",style={},fallback=FB}){
  const [err,setErr]=useState(false);
  return <img src={err?fallback:src} alt={alt} style={style} onError={()=>setErr(true)}/>;
}

function ImgSkeleton({style={}}){
  return <div className="shimmer" style={{borderRadius:0,...style}}/>;
}

function FoodCard({item,onAdd,onDec,qty,disabled}){
  const [loaded,setLoaded]=useState(false);
  return (
    <div className="card-h" style={{background:"#fff",borderRadius:18,overflow:"hidden",boxShadow:"0 2px 16px rgba(0,0,0,.07)",opacity:disabled?.55:1,position:"relative"}}>
      <div style={{height:180,overflow:"hidden",position:"relative",background:"#f0ebe3"}}>
        {!loaded&&<ImgSkeleton style={{position:"absolute",inset:0}}/>}
        <Img src={PH[item.img]||FB} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover",display:loaded?"block":"none",transition:"transform .4s"}} fallback={FB}/>
        <img src={PH[item.img]||FB} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0}} onLoad={()=>setLoaded(true)} onError={()=>setLoaded(true)}/>
        {item.tag&&<span style={{position:"absolute",top:10,left:10,background:"#0C3B2E",color:"#F59E0B",fontSize:10,fontWeight:700,letterSpacing:.6,borderRadius:20,padding:"4px 10px"}}>{item.tag}</span>}
        {!item.available&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"white",fontWeight:700,fontSize:13,letterSpacing:1,textTransform:"uppercase"}}>Unavailable</span></div>}
      </div>
      <div style={{padding:"14px 16px"}}>
        <div style={{fontWeight:700,fontSize:14,color:"#1C1C1C",marginBottom:4,lineHeight:1.35}}>{item.name}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
          <span style={{fontWeight:800,fontSize:16,color:"#0C3B2E"}}>₦{item.price.toLocaleString()}</span>
          {item.available&&(
            qty>0?(
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button onClick={onDec} style={{width:28,height:28,borderRadius:"50%",border:"2px solid #E5DDD0",background:"none",fontWeight:800,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:"#1C1C1C"}}>−</button>
                <span style={{fontWeight:800,fontSize:15,minWidth:18,textAlign:"center"}}>{qty}</span>
                <button onClick={onAdd} style={{width:28,height:28,borderRadius:"50%",background:"#0C3B2E",fontWeight:800,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:"#F59E0B"}}>+</button>
              </div>
            ):(
              <button onClick={onAdd} style={{background:"#0C3B2E",color:"#F59E0B",borderRadius:30,padding:"7px 18px",fontWeight:700,fontSize:13}}>Add +</button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Toast
function ToastContainer({toasts}){
  return <div style={{position:"fixed",bottom:28,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:10}}>
    {toasts.map(t=>(
      <div key={t.id} style={{background:t.type==="error"?"#EF4444":t.type==="warn"?"#F59E0B":"#0C3B2E",color:"white",borderRadius:12,padding:"12px 20px",fontSize:14,fontWeight:600,boxShadow:"0 8px 24px rgba(0,0,0,.2)",animation:"toast .35s ease both",maxWidth:300,display:"flex",alignItems:"center",gap:10}}>
        <span>{t.type==="error"?"✗":t.type==="warn"?"⚠":"✓"}</span>{t.msg}
      </div>
    ))}
  </div>;
}
function useToast(){
  const [toasts,setToasts]=useState([]);
  const show=(msg,type="ok")=>{
    const id=Date.now();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3200);
  };
  return{toasts,show};
}

// Input / Label
const Label=({text})=><label style={{fontSize:11,fontWeight:600,letterSpacing:1.2,color:"#8A7E72",textTransform:"uppercase",display:"block",marginBottom:6}}>{text}</label>;
const Input=({...p})=><input {...p} style={{width:"100%",padding:"11px 14px",borderRadius:10,border:"1.5px solid #E5DDD0",fontSize:14,background:"#FEFCF8",...p.style}}/>;
const Select=({children,...p})=><select {...p} style={{width:"100%",padding:"11px 14px",borderRadius:10,border:"1.5px solid #E5DDD0",fontSize:14,background:"#FEFCF8",appearance:"none",...p.style}}>{children}</select>;

// Page shell with sticky nav
function Shell({user,onLogout,children,tabs,activeTab,setTab,dark=false}){
  const bg=dark?"#0B1628":"#FAF7F2";
  const fg=dark?"white":"#1C1C1C";
  const border=dark?"rgba(255,255,255,.07)":"#EDE6DA";
  return(
    <div style={{minHeight:"100vh",background:bg,color:fg}}>
      {/* Navbar */}
      <nav style={{background:dark?"#0E1F3A":"#0C3B2E",position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 20px rgba(0,0,0,.25)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 20px",height:62,display:"flex",alignItems:"center",gap:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
            <div style={{width:36,height:36,borderRadius:10,background:"#F59E0B",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:18}}>🍛</span>
            </div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",color:"#F59E0B",fontWeight:900,fontSize:15,letterSpacing:.3}}>Campus Chop Hub</div>
              <div style={{color:"rgba(255,255,255,.35)",fontSize:9,letterSpacing:2,textTransform:"uppercase"}}>Landmark University</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:"rgba(255,255,255,.08)",borderRadius:20,padding:"6px 14px",display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:"#F59E0B",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#0C3B2E"}}>
                {user?.name?.[0]?.toUpperCase()||"?"}
              </div>
              <span style={{color:"white",fontSize:13,fontWeight:500,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} className="hide-sm">{user?.name}</span>
            </div>
            <button onClick={onLogout} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.7)",borderRadius:20,padding:"7px 16px",fontSize:12,fontWeight:600}}>Logout</button>
          </div>
        </div>
        {/* Tab bar */}
        {tabs&&(
          <div style={{maxWidth:1100,margin:"0 auto",padding:"0 20px",display:"flex",overflowX:"auto",borderTop:`1px solid ${dark?"rgba(255,255,255,.05)":"rgba(255,255,255,.08)"}`}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"12px 20px",background:"none",border:"none",borderBottom:activeTab===t.id?"3px solid #F59E0B":"3px solid transparent",color:activeTab===t.id?"#F59E0B":"rgba(255,255,255,.45)",fontWeight:activeTab===t.id?700:400,fontSize:"clamp(12px,2vw,14px)",whiteSpace:"nowrap",transition:"all .2s",cursor:"pointer"}}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        )}
      </nav>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 18px"}}>
        {children}
      </div>
    </div>
  );
}

// Section heading
const SectionHead=({title,sub})=>(
  <div style={{marginBottom:24}}>
    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,4vw,28px)",color:"#0C3B2E",lineHeight:1.2}}>{title}</h2>
    {sub&&<p style={{color:"#8A7E72",marginTop:6,fontSize:14}}>{sub}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null);
  const [authOpen,setAuthOpen]=useState(false);
  const [authMode,setAuthMode]=useState("student");// student | vendor | admin
  const [db_ready,setDbReady]=useState(false);

  // Shared backend state
  const [orders,setOrders]=useState([]);
  const [reviews,setReviews]=useState([]);
  const [complaints,setComplaints]=useState([]);
  const [menu,setMenu]=useState(INIT_MENU);
  const [delivTimes,setDelivTimes]=useState(DEFAULT_TIMES);
  const [students,setStudents]=useState([]);// registered students

  const {toasts,show:toast}=useToast();

  useEffect(()=>{
    (async()=>{
      const[o,r,c,m,dt,s]=await Promise.all([
        db.get("cch-orders"),db.get("cch-reviews"),db.get("cch-complaints"),
        db.get("cch-menu"),db.get("cch-dtimes"),db.get("cch-students"),
      ]);
      if(o)setOrders(o);if(r)setReviews(r);if(c)setComplaints(c);
      if(m)setMenu(m);if(dt)setDelivTimes(dt);if(s)setStudents(s);
      setDbReady(true);
    })();
  },[]);

  const save={
    orders:async v=>{setOrders(v);await db.set("cch-orders",v);},
    reviews:async v=>{setReviews(v);await db.set("cch-reviews",v);},
    complaints:async v=>{setComplaints(v);await db.set("cch-complaints",v);},
    menu:async v=>{setMenu(v);await db.set("cch-menu",v);},
    delivTimes:async v=>{setDelivTimes(v);await db.set("cch-dtimes",v);},
    students:async v=>{setStudents(v);await db.set("cch-students",v);},
  };

  const logout=()=>{setUser(null);toast("Logged out successfully");};

  if(!db_ready) return(
    <div style={{minHeight:"100vh",background:"#0C3B2E",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
      <style>{G_CSS}</style>
      <div style={{width:60,height:60,borderRadius:16,background:"#F59E0B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,boxShadow:"0 8px 32px rgba(245,158,11,.4)"}}>🍛</div>
      <div style={{fontFamily:"'Playfair Display',serif",color:"#F59E0B",fontSize:22,fontWeight:700}}>Campus Chop Hub</div>
      <Spin/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const shared={orders,reviews,complaints,menu,delivTimes,students,save,toast};

  return(
    <>
      <style>{G_CSS}</style>
      <ToastContainer toasts={toasts}/>
      {!user&&<LandingPage onOpenAuth={(m)=>{setAuthMode(m);setAuthOpen(true);}}/>}
      {!user&&authOpen&&<AuthModal mode={authMode} setMode={setAuthMode} students={students} saveStudents={save.students} onLogin={setUser} onClose={()=>setAuthOpen(false)} toast={toast}/>}
      {user?.role==="student"&&<StudentApp user={user} onLogout={logout} {...shared}/>}
      {user?.role==="vendor"&&<VendorApp   user={user} onLogout={logout} {...shared}/>}
      {user?.role==="admin"&&<AdminApp    user={user} onLogout={logout} {...shared}/>}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────
function LandingPage({onOpenAuth}){
  const [imgLoaded,setImgLoaded]=useState(false);
  const allItems=Object.values(INIT_MENU).flat().slice(0,8);
  return(
    <div style={{background:"#FAF7F2"}}>
      {/* Navbar */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(12,59,46,.97)",backdropFilter:"blur(10px)",boxShadow:"0 2px 20px rgba(0,0,0,.3)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 20px",height:65,display:"flex",alignItems:"center",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
            <div style={{width:38,height:38,borderRadius:10,background:"#F59E0B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🍛</div>
            <span style={{fontFamily:"'Playfair Display',serif",color:"#F59E0B",fontWeight:900,fontSize:17}}>Campus Chop Hub</span>
          </div>
          <div style={{display:"flex",gap:24,alignItems:"center"}} className="hide-sm">
            {["Menu","How It Works","Cafeterias"].map(l=><a key={l} href="#" style={{color:"rgba(255,255,255,.65)",fontSize:14,fontWeight:500,transition:"color .2s"}}
              onMouseEnter={e=>e.target.style.color="white"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.65)"}>{l}</a>)}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>onOpenAuth("student")} style={{background:"transparent",border:"1.5px solid rgba(255,255,255,.3)",color:"rgba(255,255,255,.8)",borderRadius:30,padding:"9px 20px",fontSize:13,fontWeight:600,transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="white";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.3)";e.currentTarget.style.color="rgba(255,255,255,.8)";}}>
              Log In
            </button>
            <button onClick={()=>onOpenAuth("student")} style={{background:"#F59E0B",color:"#0C3B2E",borderRadius:30,padding:"9px 22px",fontSize:13,fontWeight:700,boxShadow:"0 4px 14px rgba(245,158,11,.35)",transition:"transform .2s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{position:"relative",height:"92vh",minHeight:520,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div style={{position:"absolute",inset:0,background:"#0C3B2E"}}>
          {!imgLoaded&&<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#0C3B2E,#1A5C36)"}}/>}
          <img src={PH.hero} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.35,display:imgLoaded?"block":"none"}} onLoad={()=>setImgLoaded(true)}/>
        </div>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(12,59,46,.92) 40%,rgba(12,59,46,.6))"}}/>
        <div style={{position:"relative",maxWidth:1100,margin:"0 auto",padding:"0 20px",width:"100%"}}>
          <div style={{maxWidth:620,animation:"fadeUp .8s ease both"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.3)",borderRadius:30,padding:"6px 16px",marginBottom:24}}>
              <Dot/><span style={{color:"#F59E0B",fontSize:12,fontWeight:600,letterSpacing:.5}}>LMU Campus Food Platform · Now Live</span>
            </div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(38px,7vw,72px)",color:"#FEFCE8",lineHeight:1.08,marginBottom:20,fontWeight:900}}>
              Order Campus<br/><em style={{color:"#F59E0B",fontStyle:"italic"}}>Food</em> From<br/>Your Hostel
            </h1>
            <p style={{color:"rgba(255,255,255,.65)",fontSize:"clamp(15px,2vw,18px)",lineHeight:1.75,marginBottom:36,maxWidth:480}}>
              Skip the queue. Browse menus from all 4 cafeterias, place your order, and have it delivered straight to your room.
            </p>
            <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
              <button onClick={()=>onOpenAuth("student")} style={{background:"#F59E0B",color:"#0C3B2E",borderRadius:30,padding:"15px 34px",fontSize:15,fontWeight:700,boxShadow:"0 8px 30px rgba(245,158,11,.45)",transition:"all .25s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                Order Food Now →
              </button>
              <button onClick={()=>onOpenAuth("vendor")} style={{background:"rgba(255,255,255,.08)",border:"1.5px solid rgba(255,255,255,.25)",color:"white",borderRadius:30,padding:"15px 30px",fontSize:15,fontWeight:600,transition:"all .25s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.14)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}>
                Vendor Portal
              </button>
            </div>
          </div>
        </div>
        {/* Stats strip */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,.4)",backdropFilter:"blur(8px)"}}>
          <div style={{maxWidth:1100,margin:"0 auto",padding:"18px 20px",display:"flex",gap:30,overflowX:"auto"}}>
            {[["4","Cafeterias"],["6","Hostels Covered"],["100%","No Queues"],["Real-time","Order Tracking"]].map(([n,l])=>(
              <div key={l} style={{flexShrink:0,display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:"#F59E0B"}}>{n}</span>
                <span style={{color:"rgba(255,255,255,.6)",fontSize:13,lineHeight:1.3,maxWidth:80}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{padding:"80px 20px",background:"#fff"}}>
        <div style={{maxWidth:1100,margin:"0 auto",textAlign:"center"}}>
          <p style={{color:"#F59E0B",fontWeight:700,fontSize:12,letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>The Process</p>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,42px)",color:"#0C3B2E",marginBottom:50}}>Eating on campus,<br/><em style={{fontStyle:"italic"}}>made effortless</em></h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:30}}>
            {[
              {n:"01",title:"Browse Menus",body:"Explore live menus from Cafe 1, 2, 3, and Back of Cafe. See what's available, prices, and estimated times.",icon:"🍽️"},
              {n:"02",title:"Place Your Order",body:"Add items to cart, choose your hostel and room, pick a payment method, and confirm.",icon:"🛒"},
              {n:"03",title:"Track in Real Time",body:"Follow your order from kitchen to your door. Get live status updates every step.",icon:"📍"},
              {n:"04",title:"Rate & Review",body:"Share your experience, rate the food, and help improve the campus dining experience.",icon:"⭐"},
            ].map(s=>(
              <div key={s.n} style={{textAlign:"left",padding:28,borderRadius:20,border:"1px solid #EDE6DA",background:"#FAF7F2",transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#F59E0B";e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 36px rgba(0,0,0,.08)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#EDE6DA";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                <div style={{fontSize:32,marginBottom:14}}>{s.icon}</div>
                <div style={{color:"#F59E0B",fontWeight:800,fontSize:11,letterSpacing:2,marginBottom:8}}>STEP {s.n}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#0C3B2E",marginBottom:10}}>{s.title}</div>
                <p style={{color:"#6B6056",fontSize:14,lineHeight:1.7}}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cafeterias section */}
      <section style={{padding:"80px 20px",background:"#FAF7F2"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <p style={{color:"#F59E0B",fontWeight:700,fontSize:12,letterSpacing:3,textTransform:"uppercase",marginBottom:12,textAlign:"center"}}>Where to Eat</p>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(26px,4vw,40px)",color:"#0C3B2E",marginBottom:40,textAlign:"center"}}>Our 4 Dining Locations</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:24}}>
            {CAFES.map((c,i)=>(
              <div key={c} className="card-h" style={{borderRadius:20,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,.09)",background:"#fff"}}>
                <div style={{height:200,overflow:"hidden",position:"relative"}}>
                  <Img src={CAFE_IMG[c]} alt={c} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .5s"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(12,59,46,.85) 0%,transparent 50%)"}}/>
                  <div style={{position:"absolute",bottom:16,left:16}}>
                    <div style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:18,fontWeight:700}}>{c}</div>
                    <div style={{color:"rgba(255,255,255,.7)",fontSize:12,marginTop:2}}>{INIT_MENU[c].length} items · Open daily</div>
                  </div>
                </div>
                <div style={{padding:"16px 18px",display:"flex",gap:8,flexWrap:"wrap"}}>
                  {INIT_MENU[c].slice(0,3).map(it=><span key={it.id} style={{fontSize:12,color:"#6B6056",background:"#F0EBE3",borderRadius:20,padding:"3px 10px"}}>{it.name.split(" ")[0]}</span>)}
                  <span style={{fontSize:12,color:"#F59E0B",fontWeight:600}}>+ more</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section style={{padding:"80px 20px",background:"#0C3B2E",overflow:"hidden"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <p style={{color:"rgba(245,158,11,.7)",fontWeight:700,fontSize:12,letterSpacing:3,textTransform:"uppercase",marginBottom:12,textAlign:"center"}}>On the Menu Today</p>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(26px,4vw,40px)",color:"#FEFCE8",marginBottom:40,textAlign:"center"}}>Most Ordered Dishes</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:20}}>
            {allItems.map(item=>(
              <div key={item.id} style={{borderRadius:16,overflow:"hidden",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.07)",transition:"all .25s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.09)";e.currentTarget.style.transform="translateY(-4px)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.05)";e.currentTarget.style.transform="none";}}>
                <div style={{height:150,overflow:"hidden"}}>
                  <Img src={PH[item.img]||FB} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>
                <div style={{padding:"12px 14px"}}>
                  <div style={{color:"rgba(255,255,255,.85)",fontWeight:600,fontSize:13,marginBottom:4}}>{item.name}</div>
                  <div style={{color:"#F59E0B",fontWeight:800,fontSize:15}}>₦{item.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:40}}>
            <button onClick={()=>onOpenAuth("student")} style={{background:"#F59E0B",color:"#0C3B2E",borderRadius:30,padding:"14px 36px",fontSize:15,fontWeight:700,boxShadow:"0 8px 30px rgba(245,158,11,.35)"}}>
              View Full Menu & Order →
            </button>
          </div>
        </div>
      </section>

      {/* Portal cards */}
      <section style={{padding:"80px 20px",background:"#fff"}}>
        <div style={{maxWidth:1100,margin:"0 auto",textAlign:"center"}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(26px,4vw,38px)",color:"#0C3B2E",marginBottom:10}}>Choose Your Portal</h2>
          <p style={{color:"#8A7E72",marginBottom:48,fontSize:15}}>Three dedicated dashboards for students, cafeteria vendors, and the platform administrator.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:24}}>
            {[
              {role:"student", icon:"🎓", title:"Student Portal", color:"#0C3B2E", desc:"Browse menus, order food, track your delivery, and leave reviews.", cta:"Student Login"},
              {role:"vendor",  icon:"🍽️", title:"Vendor Portal", color:"#1E3A5F", desc:"Manage your menu, set delivery times, handle orders and complaints.", cta:"Vendor Login"},
              {role:"admin",   icon:"🛡️", title:"Admin Portal",  color:"#3D1A78", desc:"Full platform oversight — users, analytics, AI insights, and settings.", cta:"Admin Login"},
            ].map(p=>(
              <div key={p.role} style={{borderRadius:22,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,.1)",border:"1px solid #EDE6DA"}}>
                <div style={{background:p.color,padding:"32px 24px",textAlign:"center"}}>
                  <div style={{fontSize:48,marginBottom:12}}>{p.icon}</div>
                  <div style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:22,fontWeight:700}}>{p.title}</div>
                </div>
                <div style={{padding:"22px 24px",background:"#FAF7F2"}}>
                  <p style={{color:"#6B6056",fontSize:14,lineHeight:1.65,marginBottom:20}}>{p.desc}</p>
                  <button onClick={()=>onOpenAuth(p.role)} style={{width:"100%",background:p.color,color:"white",borderRadius:12,padding:"12px",fontWeight:700,fontSize:14,transition:"opacity .2s"}}
                    onMouseEnter={e=>e.currentTarget.style.opacity=".88"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    {p.cta} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background:"#0C3B2E",padding:"48px 20px 28px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:30,flexWrap:"wrap",marginBottom:36}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{width:34,height:34,borderRadius:9,background:"#F59E0B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🍛</div>
                <span style={{fontFamily:"'Playfair Display',serif",color:"white",fontWeight:700,fontSize:17}}>Campus Chop Hub</span>
              </div>
              <p style={{color:"rgba(255,255,255,.45)",fontSize:13,maxWidth:260,lineHeight:1.7}}>The official food ordering platform for Landmark University, Omu-Aran, Kwara State.</p>
            </div>
            <div style={{display:"flex",gap:40,flexWrap:"wrap"}}>
              {[{h:"Platform",links:["Menu","How It Works","Cafeterias","Reviews"]},{h:"Portals",links:["Student Login","Vendor Login","Admin Login"]},{h:"University",links:["LMU Official Site","Student Affairs","Campus Map"]}].map(col=>(
                <div key={col.h}>
                  <div style={{color:"#F59E0B",fontWeight:700,fontSize:12,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>{col.h}</div>
                  {col.links.map(l=><div key={l} style={{color:"rgba(255,255,255,.5)",fontSize:13,marginBottom:8,cursor:"pointer",transition:"color .2s"}}
                    onMouseEnter={e=>e.target.style.color="white"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.5)"}>{l}</div>)}
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <span style={{color:"rgba(255,255,255,.3)",fontSize:12}}>© 2025 Campus Chop Hub · Landmark University · All rights reserved</span>
            <div style={{display:"flex",gap:10}}>
              {["vendor","admin"].map(r=>(
                <button key={r} onClick={()=>onOpenAuth(r)} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.5)",borderRadius:20,padding:"5px 14px",fontSize:11,cursor:"pointer",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,.5)";}}>
                  {r==="vendor"?"Vendor":"Admin"} Login
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AuthModal({mode,setMode,students,saveStudents,onLogin,onClose,toast}){
  const [sub,setSub]=useState("login");// login | register (student only)
  const [form,setForm]=useState({name:"",matric:"",hostel:"",pass:"",uname:""});
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const f=k=>e=>setForm(p=>({...p,[k]:e.target.value}));

  const handleLogin=async()=>{
    setErr(""); setLoading(true);
    await new Promise(r=>setTimeout(r,500));
    if(mode==="student"){
      const s=students.find(s=>s.matric.toLowerCase()===form.matric.toLowerCase()&&s.pass===form.pass);
      if(!s){setErr("Invalid matric number or password.");setLoading(false);return;}
      onLogin({...s,role:"student"}); onClose(); toast(`Welcome back, ${s.name.split(" ")[0]}! 🎉`);
    } else if(mode==="vendor"){
      const v=VENDOR_ACCTS.find(v=>v.u===form.uname&&v.p===form.pass);
      if(!v){setErr("Invalid vendor credentials.");setLoading(false);return;}
      onLogin({id:v.id,name:v.name,role:"vendor",cafe:v.cafe}); onClose(); toast(`Welcome, ${v.name}!`);
    } else {
      if(form.uname!==ADMIN.u||form.pass!==ADMIN.p){setErr("Invalid admin credentials.");setLoading(false);return;}
      onLogin({id:"admin",name:ADMIN.name,role:"admin"}); onClose(); toast("Welcome, Administrator.");
    }
    setLoading(false);
  };

  const handleRegister=async()=>{
    setErr(""); if(!form.name||!form.matric||!form.hostel||!form.pass){setErr("Please fill all fields.");return;}
    if(form.pass.length<6){setErr("Password must be at least 6 characters.");return;}
    if(students.find(s=>s.matric.toLowerCase()===form.matric.toLowerCase())){setErr("Matric number already registered.");return;}
    setLoading(true);
    const ns={id:Date.now().toString(),name:form.name,matric:form.matric,hostel:form.hostel,pass:form.pass};
    const updated=[...students,ns];
    await saveStudents(updated);
    onLogin({...ns,role:"student"}); onClose(); toast(`Account created! Welcome, ${form.name.split(" ")[0]}! 🎉`);
    setLoading(false);
  };

  const TABS=[{k:"student",label:"Student"},{k:"vendor",label:"Vendor"},{k:"admin",label:"Admin"}];

  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{position:"absolute",inset:0,background:"rgba(12,59,46,.7)",backdropFilter:"blur(6px)"}}/>
      <div style={{position:"relative",background:"white",borderRadius:24,overflow:"hidden",width:"100%",maxWidth:860,maxHeight:"92vh",display:"flex",boxShadow:"0 30px 80px rgba(0,0,0,.35)",animation:"scalePop .35s cubic-bezier(.34,1.56,.64,1) both"}}>
        {/* Left image panel */}
        <div className="hide-sm" style={{flex:"0 0 40%",position:"relative",minHeight:520}}>
          <Img src={PH.auth} alt="Campus dining" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(12,59,46,.85),rgba(12,59,46,.5))"}}/>
          <div style={{position:"absolute",inset:0,padding:32,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
            <div style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:26,fontWeight:700,lineHeight:1.2,marginBottom:12}}>Great food,<br/><em style={{color:"#F59E0B"}}>right at your door.</em></div>
            <p style={{color:"rgba(255,255,255,.7)",fontSize:13,lineHeight:1.6}}>Join thousands of Landmark University students ordering campus meals without the queue.</p>
            {mode==="vendor"&&<div style={{marginTop:20,background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.4)",borderRadius:12,padding:"12px 16px"}}>
              <div style={{color:"#F59E0B",fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:6}}>VENDOR CREDENTIALS</div>
              {VENDOR_ACCTS.map(v=><div key={v.id} style={{color:"rgba(255,255,255,.7)",fontSize:11,marginBottom:3}}>
                <span style={{color:"white",fontWeight:600}}>{v.cafe}:</span> {v.u} / {v.p}
              </div>)}
            </div>}
            {mode==="admin"&&<div style={{marginTop:20,background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.4)",borderRadius:12,padding:"12px 16px"}}>
              <div style={{color:"#F59E0B",fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:6}}>ADMIN CREDENTIALS</div>
              <div style={{color:"rgba(255,255,255,.7)",fontSize:11}}><span style={{color:"white",fontWeight:600}}>Username:</span> admin</div>
              <div style={{color:"rgba(255,255,255,.7)",fontSize:11,marginTop:2}}><span style={{color:"white",fontWeight:600}}>Password:</span> Admin2024</div>
            </div>}
          </div>
        </div>

        {/* Right form panel */}
        <div style={{flex:1,padding:"36px 32px",overflowY:"auto",display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#0C3B2E"}}>
              {sub==="register"?"Create Account":"Welcome Back"}
            </div>
            <button onClick={onClose} style={{background:"#F0EBE3",border:"none",borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#6B6056",cursor:"pointer"}}>✕</button>
          </div>

          {/* Role tabs */}
          <div style={{display:"flex",background:"#F0EBE3",borderRadius:12,padding:4,marginBottom:24}}>
            {TABS.map(t=>(
              <button key={t.k} onClick={()=>{setMode(t.k);setErr("");setSub("login");setForm({name:"",matric:"",hostel:"",pass:"",uname:""});}} style={{flex:1,padding:"9px 0",borderRadius:9,border:"none",background:mode===t.k?"white":"transparent",color:mode===t.k?"#0C3B2E":"#8A7E72",fontWeight:mode===t.k?700:500,fontSize:13,boxShadow:mode===t.k?"0 2px 8px rgba(0,0,0,.1)":"none",transition:"all .2s",cursor:"pointer"}}>
                {t.k==="student"?"🎓":t.k==="vendor"?"🍽️":"🛡️"} {t.label}
              </button>
            ))}
          </div>

          {/* Student login/register toggle */}
          {mode==="student"&&(
            <div style={{display:"flex",borderBottom:"2px solid #F0EBE3",marginBottom:24,gap:0}}>
              {["login","register"].map(s=>(
                <button key={s} onClick={()=>{setSub(s);setErr("");}} style={{flex:1,padding:"10px 0",background:"none",border:"none",borderBottom:sub===s?"2px solid #0C3B2E":"2px solid transparent",marginBottom:-2,color:sub===s?"#0C3B2E":"#8A7E72",fontWeight:sub===s?700:500,fontSize:14,cursor:"pointer",transition:"all .2s"}}>
                  {s==="login"?"Log In":"Register"}
                </button>
              ))}
            </div>
          )}

          {/* Fields */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {mode==="student"&&sub==="register"&&(
              <>
                <div><Label text="Full Name"/><Input value={form.name} onChange={f("name")} placeholder="e.g. Temi Adeyemi"/></div>
                <div><Label text="Hostel"/>
                  <Select value={form.hostel} onChange={f("hostel")} style={{background:"#FEFCF8"}}>
                    <option value="">Select your hostel</option>
                    {HOSTELS.map(h=><option key={h}>{h}</option>)}
                  </Select>
                </div>
              </>
            )}
            {mode==="student"&&(
              <div><Label text="Matric Number"/><Input value={form.matric} onChange={f("matric")} placeholder="e.g. LMU/21/0001"/></div>
            )}
            {(mode==="vendor"||mode==="admin")&&(
              <div><Label text="Username"/><Input value={form.uname} onChange={f("uname")} placeholder={mode==="vendor"?"e.g. cafe1":"admin"}/></div>
            )}
            <div><Label text="Password"/><Input type="password" value={form.pass} onChange={f("pass")} placeholder="Enter password"/></div>

            {err&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"10px 14px",color:"#DC2626",fontSize:13}}>{err}</div>}

            <button onClick={sub==="register"?handleRegister:handleLogin} disabled={loading} style={{background:"#0C3B2E",color:"#F59E0B",borderRadius:12,padding:"14px",fontWeight:700,fontSize:15,marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:loading?.75:1,transition:"opacity .2s"}}>
              {loading?<><Spin/> Processing…</>:sub==="register"?"Create My Account →":"Log In →"}
            </button>
          </div>

          {mode==="student"&&sub==="login"&&(
            <p style={{textAlign:"center",marginTop:20,fontSize:13,color:"#8A7E72"}}>
              No account? <button onClick={()=>setSub("register")} style={{background:"none",border:"none",color:"#0C3B2E",fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>Register here</button>
            </p>
          )}

          <p style={{marginTop:"auto",paddingTop:20,fontSize:11,color:"#C4B8A8",textAlign:"center",lineHeight:1.6}}>
            By logging in, you agree to Campus Chop Hub's terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT APP
// ─────────────────────────────────────────────────────────────────────────────
function StudentApp({user,onLogout,orders,reviews,complaints,menu,delivTimes,save,toast}){
  const [tab,setTab]=useState("menu");
  const [cafe,setCafe]=useState("Cafe 1");
  const [cart,setCart]=useState([]);
  const [room,setRoom]=useState("");
  const [pay,setPay]=useState("wallet");
  const [myOrders,setMyOrders]=useState([]);
  const [ordering,setOrdering]=useState(false);
  const [countdown,setCountdown]=useState({}); // orderId -> secs remaining
  const timerRef=useRef(null);

  // Review form
  const [rvForm,setRvForm]=useState({cafe:"Cafe 1",rating:5,text:""});
  // Complaint form
  const [cpForm,setCpForm]=useState({cafe:"Cafe 1",issue:"",anon:false});

  // AI chat
  const [chatOpen,setChatOpen]=useState(false);
  const [chatMsgs,setChatMsgs]=useState([{role:"a",text:"Hello! I'm your Chop AI 🍛 Tell me what you're craving or your budget, and I'll suggest the best meal for you today!"}]);
  const [chatIn,setChatIn]=useState("");
  const [chatLoad,setChatLoad]=useState(false);
  const chatRef=useRef(null);

  const qty=(id)=>cart.find(c=>c.id===id)?.qty||0;
  const totalQty=cart.reduce((a,b)=>a+b.qty,0);
  const totalAmt=cart.reduce((a,b)=>a+b.price*b.qty,0);

  const add=(item)=>setCart(p=>{const ex=p.find(c=>c.id===item.id);return ex?p.map(c=>c.id===item.id?{...c,qty:c.qty+1}:c):[...p,{...item,qty:1}];});
  const dec=(id)=>setCart(p=>p.map(c=>c.id===id&&c.qty>1?{...c,qty:c.qty-1}:c).filter(c=>c.qty>0));

  const allItems=Object.values(menu).flat();

  useEffect(()=>{
    timerRef.current=setInterval(()=>{
      setCountdown(p=>{const n={...p};Object.keys(n).forEach(k=>{if(n[k]>0)n[k]--;});return n;});
    },1000);
    return()=>clearInterval(timerRef.current);
  },[]);
  useEffect(()=>{chatRef.current?.scrollIntoView({behavior:"smooth"});},[chatMsgs]);

  const placeOrder=async()=>{
    if(!room||cart.length===0){toast("Please add items and enter your room number.","error");return;}
    setOrdering(true);
    const dt=delivTimes[cafe]||20;
    const order={
      id:Date.now().toString(),studentId:user.id,studentName:user.name,
      cafe,hostel:user.hostel,room,items:cart.map(c=>({id:c.id,name:c.name,img:c.img,price:c.price,qty:c.qty})),
      total:totalAmt,payment:pay,deliveryMins:dt,status:"Preparing",
      createdAt:new Date().toISOString(),timestamp:new Date().toLocaleTimeString(),
    };
    const updated=[order,...orders];
    await save.orders(updated);
    setMyOrders(p=>[order,...p]);
    setCountdown(p=>({...p,[order.id]:dt*60}));
    setCart([]);setRoom("");
    setTab("track");
    toast(`Order placed! 🎉 Estimated delivery: ${dt} minutes.`);
    setOrdering(false);
  };

  const sendChat=async()=>{
    if(!chatIn.trim()||chatLoad)return;
    const msg=chatIn.trim();setChatIn("");
    setChatMsgs(p=>[...p,{role:"u",text:msg}]);
    setChatLoad(true);
    try{
      const ms=Object.entries(menu).map(([c,items])=>`${c}: `+items.filter(i=>i.available).map(i=>`${i.name} ₦${i.price}`).join(", ")).join("\n");
      const r=await ai(`You are Chop AI, a friendly food assistant at Landmark University Campus Chop Hub. Be brief, warm, and use emojis. Only recommend available menu items. Here is today's menu:\n${ms}`,msg);
      setChatMsgs(p=>[...p,{role:"a",text:r}]);
    }catch{setChatMsgs(p=>[...p,{role:"a",text:"Sorry, AI is taking a break! Check the menu tab for available items. 😊"}]);}
    setChatLoad(false);
  };

  const submitReview=async()=>{
    if(!rvForm.text.trim()){toast("Please write something!","warn");return;}
    const r={id:Date.now().toString(),...rvForm,student:user.name,avatar:user.name[0].toUpperCase(),time:"Just now",createdAt:new Date().toISOString()};
    await save.reviews([r,...reviews]);
    setRvForm({cafe:"Cafe 1",rating:5,text:""}); toast("Review submitted! Thank you ⭐");
  };
  const submitComplaint=async()=>{
    if(!cpForm.issue.trim()){toast("Please describe the issue.","warn");return;}
    const c={id:Date.now().toString(),student:cpForm.anon?"Anonymous":user.name,cafe:cpForm.cafe,issue:cpForm.issue,status:"Pending",vendorResponse:"",time:"Just now",createdAt:new Date().toISOString()};
    await save.complaints([c,...complaints]);
    setCpForm({cafe:"Cafe 1",issue:"",anon:false}); toast("Complaint submitted. We'll look into it!");
  };

  const TABS=[
    {id:"menu",  icon:"🍽️",label:"Menu"},
    {id:"order", icon:"🛒",label:`Cart${totalQty>0?` (${totalQty})`:""}` },
    {id:"track", icon:"📍",label:"Track"},
    {id:"reviews",icon:"⭐",label:"Reviews"},
  ];

  return(
    <Shell user={user} onLogout={onLogout} tabs={TABS} activeTab={tab} setTab={setTab}>
      {/* ── MENU ── */}
      {tab==="menu"&&(
        <div className="anim">
          {/* Cafe selector */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:22}}>
            {CAFES.map(c=>(
              <button key={c} onClick={()=>setCafe(c)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 18px",borderRadius:30,border:cafe===c?"none":"1.5px solid #EDE6DA",background:cafe===c?"#0C3B2E":"white",color:cafe===c?"#F59E0B":"#374151",fontWeight:700,fontSize:13,transition:"all .2s",boxShadow:cafe===c?"0 4px 16px rgba(12,59,46,.25)":"none"}}>
                {cafe===c&&<div style={{width:8,height:8,borderRadius:"50%",background:"#F59E0B"}}/>}{c}
              </button>
            ))}
          </div>

          {/* Cafe hero banner */}
          <div style={{borderRadius:20,overflow:"hidden",marginBottom:26,height:180,position:"relative"}}>
            <Img src={CAFE_IMG[cafe]} alt={cafe} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,rgba(12,59,46,.88) 30%,transparent)"}}/>
            <div style={{position:"absolute",inset:0,padding:"24px 28px",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
              <div style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:28,fontWeight:700,marginBottom:6}}>{cafe}</div>
              <div style={{display:"flex",gap:14,alignItems:"center"}}>
                <span style={{background:"rgba(245,158,11,.9)",color:"#0C3B2E",fontSize:11,fontWeight:700,borderRadius:20,padding:"3px 12px"}}>⏱ ~{delivTimes[cafe]||20} min delivery</span>
                <span style={{color:"rgba(255,255,255,.7)",fontSize:13}}>{(menu[cafe]||[]).filter(i=>i.available).length} items available</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:20}}>
            {(menu[cafe]||[]).map(item=>(
              <FoodCard key={item.id} item={item} qty={qty(item.id)} onAdd={()=>add(item)} onDec={()=>dec(item.id)} disabled={!item.available}/>
            ))}
          </div>
        </div>
      )}

      {/* ── CART ── */}
      {tab==="order"&&(
        <div className="anim">
          <SectionHead title="Your Order" sub="Review your items and complete checkout"/>
          {cart.length===0?(
            <div style={{background:"white",borderRadius:20,padding:56,textAlign:"center",boxShadow:"0 2px 20px rgba(0,0,0,.06)"}}>
              <Img src={PH[9]} alt="" style={{width:120,height:100,objectFit:"cover",borderRadius:14,margin:"0 auto 20px"}}/>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#0C3B2E",marginBottom:8}}>Your cart is empty</div>
              <p style={{color:"#8A7E72",marginBottom:20,fontSize:14}}>Browse the menu and add items you'd like to order.</p>
              <button onClick={()=>setTab("menu")} style={{background:"#0C3B2E",color:"#F59E0B",borderRadius:30,padding:"12px 28px",fontWeight:700,fontSize:14}}>Browse Menu →</button>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:20,maxWidth:680}}>
              {/* Cart items */}
              <div style={{background:"white",borderRadius:20,overflow:"hidden",boxShadow:"0 2px 20px rgba(0,0,0,.06)"}}>
                <div style={{padding:"18px 22px",borderBottom:"1px solid #F0EBE3",fontFamily:"'Playfair Display',serif",fontSize:18,color:"#0C3B2E"}}>Items</div>
                {cart.map((item,i)=>(
                  <div key={item.id} style={{display:"flex",alignItems:"center",padding:"14px 22px",borderBottom:i<cart.length-1?"1px solid #F9F5F0":"none",gap:14}}>
                    <div style={{width:56,height:52,borderRadius:10,overflow:"hidden",flexShrink:0}}>
                      <Img src={PH[item.img]||FB} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:14,color:"#1C1C1C"}}>{item.name}</div>
                      <div style={{color:"#8A7E72",fontSize:12,marginTop:2}}>₦{item.price.toLocaleString()} each</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <button onClick={()=>dec(item.id)} style={{width:28,height:28,borderRadius:"50%",border:"1.5px solid #EDE6DA",background:"none",fontWeight:800,fontSize:14}}>−</button>
                      <span style={{fontWeight:700,minWidth:18,textAlign:"center"}}>{item.qty}</span>
                      <button onClick={()=>add(item)} style={{width:28,height:28,borderRadius:"50%",background:"#0C3B2E",color:"#F59E0B",fontWeight:800,fontSize:14}}>+</button>
                    </div>
                    <span style={{fontWeight:800,color:"#0C3B2E",fontSize:15,minWidth:76,textAlign:"right"}}>₦{(item.price*item.qty).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{padding:"14px 22px",background:"#FAF7F2",display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:700}}>
                  <span style={{color:"#374151"}}>Order Total</span>
                  <span style={{color:"#0C3B2E",fontSize:18,fontFamily:"'Playfair Display',serif"}}>₦{totalAmt.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery details */}
              <div style={{background:"white",borderRadius:20,padding:"22px 24px",boxShadow:"0 2px 20px rgba(0,0,0,.06)"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"#0C3B2E",marginBottom:16}}>Delivery Details</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                  <div style={{gridColumn:"span 2"}}>
                    <Label text="Cafeteria"/>
                    <Select value={cafe} onChange={e=>setCafe(e.target.value)} style={{background:"#FEFCF8"}}>
                      {CAFES.map(c=><option key={c}>{c}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label text="Hostel"/>
                    <div style={{padding:"11px 14px",borderRadius:10,border:"1.5px solid #E5DDD0",fontSize:14,background:"#F0F0F0",color:"#6B6056"}}>{user.hostel||"Not set"}</div>
                  </div>
                  <div>
                    <Label text="Room Number"/>
                    <Input value={room} onChange={e=>setRoom(e.target.value)} placeholder="e.g. A204"/>
                  </div>
                </div>
                <div style={{background:"#F0FAF4",border:"1px solid #BBF7D0",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>⏱</span>
                  <span style={{fontSize:13,color:"#166534",fontWeight:600}}>Estimated delivery: <strong>{delivTimes[cafe]||20} minutes</strong> from order placement</span>
                </div>

                {/* Payment */}
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:"#0C3B2E",marginBottom:12}}>Payment Method</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {PAY.map(pm=>(
                    <div key={pm.id} onClick={()=>setPay(pm.id)} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:12,border:pay===pm.id?"1.5px solid #0C3B2E":"1.5px solid #E5DDD0",background:pay===pm.id?"#F0FAF4":"#FEFCF8",cursor:"pointer",transition:"all .18s"}}>
                      <span style={{fontSize:22}}>{pm.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:14,color:"#1C1C1C"}}>{pm.label}</div>
                        <div style={{color:"#8A7E72",fontSize:12}}>{pm.note}</div>
                      </div>
                      <div style={{width:18,height:18,borderRadius:"50%",border:`3px solid ${pay===pm.id?"#0C3B2E":"#D5C9B8"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {pay===pm.id&&<div style={{width:7,height:7,borderRadius:"50%",background:"#0C3B2E"}}/>}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={placeOrder} disabled={ordering||!room} style={{marginTop:20,width:"100%",background:room?"#0C3B2E":"#C4B8A8",color:room?"#F59E0B":"#8A7E72",borderRadius:14,padding:"15px",fontWeight:700,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all .2s",cursor:room?"pointer":"not-allowed",fontFamily:"inherit"}}>
                  {ordering?<><Spin/>Placing Order…</>:`Place Order — ₦${totalAmt.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TRACK ── */}
      {tab==="track"&&(
        <div className="anim">
          <SectionHead title="Order Tracking" sub="Live status of your food delivery"/>
          {myOrders.length===0?(
            <div style={{background:"white",borderRadius:20,padding:48,textAlign:"center",boxShadow:"0 2px 20px rgba(0,0,0,.06)"}}>
              <div style={{fontSize:52,marginBottom:16}}>📦</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#0C3B2E",marginBottom:8}}>No active orders</div>
              <p style={{color:"#8A7E72",fontSize:14}}>Place an order and track it here in real time.</p>
            </div>
          ):myOrders.map(o=>{
            const secs=countdown[o.id]??0;
            const tot=o.deliveryMins*60;
            const pct=Math.min(100,Math.round((1-secs/tot)*100));
            const liveStatus=orders.find(x=>x.id===o.id)?.status||o.status;
            const done=secs===0||liveStatus==="Delivered";
            const steps=[
              {l:"Order Confirmed",     icon:"✅",done:true},
              {l:"Kitchen Preparing",   icon:"👨‍🍳",done:pct>20||liveStatus!=="Preparing"},
              {l:"On the Way",          icon:"🛵",done:pct>70||liveStatus==="On the Way"||done},
              {l:"Delivered!",          icon:"🎉",done},
            ];
            const minsLeft=Math.ceil(secs/60);
            return(
              <div key={o.id} style={{marginBottom:24}}>
                {/* Order card */}
                <div style={{borderRadius:22,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,.1)",marginBottom:14}}>
                  <div style={{position:"relative",height:140}}>
                    <Img src={CAFE_IMG[o.cafe]} alt={o.cafe} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    <div style={{position:"absolute",inset:0,background:"rgba(12,59,46,.8)"}}/>
                    <div style={{position:"absolute",inset:0,padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontSize:10,letterSpacing:3,color:"rgba(255,255,255,.5)",textTransform:"uppercase",marginBottom:4}}>Order #{o.id.slice(-6)}</div>
                        <div style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:24,fontWeight:700}}>₦{o.total.toLocaleString()}</div>
                        <div style={{color:"rgba(255,255,255,.6)",fontSize:12,marginTop:3}}>{o.cafe} · {o.timestamp}</div>
                      </div>
                      <SChip s={done?"Delivered":liveStatus}/>
                    </div>
                  </div>
                  <div style={{background:"white",padding:"18px 22px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,background:"#F0FAF4",borderRadius:10,padding:"10px 14px"}}>
                      <span style={{fontSize:18}}>🏠</span>
                      <div>
                        <div style={{fontSize:11,color:"#6B6056"}}>Delivering to</div>
                        <div style={{fontWeight:700,fontSize:14,color:"#0C3B2E"}}>{o.hostel} — Room {o.room}</div>
                      </div>
                      {!done&&(
                        <div style={{marginLeft:"auto",textAlign:"right"}}>
                          <div style={{fontSize:11,color:"#6B6056"}}>ETA</div>
                          <div style={{fontWeight:800,fontSize:18,color:"#0C3B2E"}}>{minsLeft}m</div>
                        </div>
                      )}
                    </div>
                    {!done&&(
                      <div style={{marginBottom:14}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12,color:"#8A7E72"}}>
                          <span>Progress</span><span style={{fontWeight:700,color:"#0C3B2E"}}>{pct}%</span>
                        </div>
                        <div style={{background:"#F0EBE3",borderRadius:8,height:10,overflow:"hidden"}}>
                          <div style={{background:"linear-gradient(90deg,#0C3B2E,#1A5C36)",height:"100%",borderRadius:8,width:`${pct}%`,transition:"width 1s linear"}}/>
                        </div>
                      </div>
                    )}
                    <div style={{display:"flex",flexDirection:"column",gap:0}}>
                      {steps.map((s,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"11px 0",borderBottom:i<3?"1px solid #F9F5F0":"none"}}>
                          <div style={{width:38,height:38,borderRadius:"50%",background:s.done?"#0C3B2E":"#F0EBE3",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0,transition:"all .5s"}}>{s.icon}</div>
                          <span style={{fontWeight:s.done?600:400,color:s.done?"#0C3B2E":"#8A7E72",fontSize:14}}>{s.l}</span>
                          {s.done&&<span style={{marginLeft:"auto",fontSize:11,color:"#16A34A",fontWeight:700}}>✔ Done</span>}
                        </div>
                      ))}
                    </div>
                    {/* Items */}
                    <div style={{marginTop:14,display:"flex",gap:8,flexWrap:"wrap"}}>
                      {o.items.map(it=>(
                        <div key={it.id} style={{display:"flex",alignItems:"center",gap:8,background:"#F0EBE3",borderRadius:20,padding:"4px 12px 4px 4px",overflow:"hidden"}}>
                          <div style={{width:26,height:26,borderRadius:"50%",overflow:"hidden",flexShrink:0}}>
                            <Img src={PH[it.img]||FB} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          </div>
                          <span style={{fontSize:12,fontWeight:600,color:"#374141"}}>{it.name.split("+")[0].trim()} ×{it.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── REVIEWS ── */}
      {tab==="reviews"&&(
        <div className="anim">
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:24,maxWidth:680}}>
            {/* Write review */}
            <div style={{background:"white",borderRadius:20,padding:"24px 26px",boxShadow:"0 2px 20px rgba(0,0,0,.06)"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#0C3B2E",marginBottom:18}}>Share Your Experience</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div>
                  <Label text="Cafeteria"/>
                  <Select value={rvForm.cafe} onChange={e=>setRvForm(p=>({...p,cafe:e.target.value}))} style={{background:"#FEFCF8"}}>
                    {CAFES.map(c=><option key={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <Label text="Rating"/>
                  <Stars val={rvForm.rating} set={r=>setRvForm(p=>({...p,rating:r}))} sz={26}/>
                </div>
              </div>
              <textarea value={rvForm.text} onChange={e=>setRvForm(p=>({...p,text:e.target.value}))} placeholder="Tell us about the food, service, and delivery experience…" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid #E5DDD0",fontFamily:"inherit",fontSize:14,minHeight:90,resize:"vertical",background:"#FEFCF8"}}/>
              <button onClick={submitReview} style={{marginTop:12,background:"#0C3B2E",color:"#F59E0B",borderRadius:12,padding:"11px 24px",fontWeight:700,fontSize:14}}>Submit Review</button>
            </div>

            {/* Reviews feed */}
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#0C3B2E",marginBottom:16}}>Student Reviews ({reviews.length})</div>
              {reviews.length===0&&<div style={{background:"white",borderRadius:16,padding:32,textAlign:"center",color:"#8A7E72",fontSize:14}}>No reviews yet. Be the first to share!</div>}
              {reviews.map(r=>(
                <div key={r.id} style={{background:"white",borderRadius:16,padding:"18px 20px",marginBottom:12,display:"flex",gap:14,boxShadow:"0 2px 12px rgba(0,0,0,.05)"}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#0C3B2E,#1A5C36)",color:"#F59E0B",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,flexShrink:0}}>
                    {r.avatar||r.student?.[0]?.toUpperCase()||"?"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontWeight:700,fontSize:14,color:"#1C1C1C"}}>{r.student}</span>
                      <span style={{color:"#8A7E72",fontSize:11}}>{r.time}</span>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                      <Stars val={r.rating} sz={13}/>
                      <Badge text={r.cafe} color="#0C3B2E"/>
                    </div>
                    <p style={{color:"#374151",fontSize:14,lineHeight:1.6}}>{r.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit complaint */}
            <div style={{background:"white",borderRadius:20,padding:"24px 26px",boxShadow:"0 2px 20px rgba(0,0,0,.06)"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#0C3B2E",marginBottom:6}}>Submit a Complaint</div>
              <p style={{color:"#8A7E72",fontSize:13,marginBottom:18}}>We take every concern seriously. Vendors will respond within 24 hours.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div>
                  <Label text="Cafeteria"/>
                  <Select value={cpForm.cafe} onChange={e=>setCpForm(p=>({...p,cafe:e.target.value}))} style={{background:"#FEFCF8"}}>
                    {CAFES.map(c=><option key={c}>{c}</option>)}
                  </Select>
                </div>
                <div style={{display:"flex",alignItems:"flex-end",paddingBottom:2}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:14,color:"#374151",fontWeight:500}}>
                    <input type="checkbox" checked={cpForm.anon} onChange={e=>setCpForm(p=>({...p,anon:e.target.checked}))} style={{width:16,height:16,cursor:"pointer"}}/>
                    Submit anonymously
                  </label>
                </div>
              </div>
              <textarea value={cpForm.issue} onChange={e=>setCpForm(p=>({...p,issue:e.target.value}))} placeholder="Describe your complaint in detail…" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid #E5DDD0",fontFamily:"inherit",fontSize:14,minHeight:80,resize:"vertical",background:"#FEFCF8"}}/>
              <button onClick={submitComplaint} style={{marginTop:12,background:"#DC2626",color:"white",borderRadius:12,padding:"11px 24px",fontWeight:700,fontSize:14}}>Send Complaint</button>
            </div>

            {/* Complaint board */}
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#0C3B2E",marginBottom:16}}>Complaint Board</div>
              {complaints.map(c=>(
                <div key={c.id} style={{background:"white",borderRadius:14,padding:"16px 20px",marginBottom:10,boxShadow:"0 2px 10px rgba(0,0,0,.05)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                    <div style={{fontWeight:600,fontSize:14,color:"#1C1C1C",flex:1,marginRight:10}}>{c.issue}</div>
                    <SChip s={c.status}/>
                  </div>
                  <div style={{fontSize:12,color:"#8A7E72",marginBottom:c.vendorResponse?10:0}}>{c.student} · {c.cafe} · {c.time}</div>
                  {c.vendorResponse&&<div style={{background:"#F0FAF4",border:"1px solid #BBF7D0",borderRadius:10,padding:"10px 14px",borderLeft:"3px solid #16A34A"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#16A34A",marginBottom:4}}>Vendor Response</div>
                    <div style={{fontSize:13,color:"#374151"}}>{c.vendorResponse}</div>
                  </div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Chat */}
      <div style={{position:"fixed",bottom:24,right:20,zIndex:300}}>
        {chatOpen&&(
          <div style={{position:"absolute",bottom:68,right:0,width:320,background:"white",borderRadius:20,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.2)",border:"1px solid #EDE6DA",animation:"fadeUp .3s ease"}}>
            <div style={{background:"linear-gradient(90deg,#0C3B2E,#1A5C36)",padding:"14px 18px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:10,background:"#F59E0B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
              <div><div style={{color:"#F59E0B",fontWeight:700,fontSize:14}}>Chop AI</div><div style={{color:"rgba(255,255,255,.45)",fontSize:11}}>Your personal meal advisor</div></div>
            </div>
            <div style={{height:250,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
              {chatMsgs.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.role==="u"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"82%",background:m.role==="u"?"#0C3B2E":"#F0EBE3",color:m.role==="u"?"white":"#1C1C1C",borderRadius:m.role==="u"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"9px 13px",fontSize:13,lineHeight:1.55}}>{m.text}</div>
                </div>
              ))}
              {chatLoad&&<div style={{display:"flex",gap:6,alignItems:"center",color:"#8A7E72",fontSize:13}}><Spin/> Thinking…</div>}
              <div ref={chatRef}/>
            </div>
            <div style={{padding:"10px 14px",borderTop:"1px solid #F0EBE3",display:"flex",gap:8}}>
              <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="What are you craving?" style={{flex:1,background:"#F9F6F1",border:"1px solid #EDE6DA",borderRadius:30,padding:"8px 14px",fontFamily:"inherit",fontSize:13,color:"#1C1C1C"}}/>
              <button onClick={sendChat} disabled={chatLoad} style={{background:"#F59E0B",border:"none",borderRadius:"50%",width:36,height:36,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>➤</button>
            </div>
          </div>
        )}
        <button onClick={()=>setChatOpen(p=>!p)} style={{width:54,height:54,borderRadius:"50%",background:"linear-gradient(135deg,#F59E0B,#D97706)",border:"none",fontSize:26,boxShadow:"0 6px 24px rgba(245,158,11,.5)",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          {chatOpen?"✕":"🤖"}
        </button>
      </div>
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR APP
// ─────────────────────────────────────────────────────────────────────────────
function VendorApp({user,onLogout,orders,reviews,complaints,menu,delivTimes,save,toast}){
  const [tab,setTab]=useState("orders");
  const [editItem,setEditItem]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [addForm,setAddForm]=useState({name:"",price:"",img:1,tag:"",available:true});
  const [dtInput,setDtInput]=useState(String(delivTimes[user.cafe]||20));
  const [aiDraft,setAiDraft]=useState({});
  const [aiLoading,setAiLoading]=useState({});
  const af=k=>e=>setAddForm(p=>({...p,[k]:e.target.value}));
  const myOrders=orders.filter(o=>o.cafe===user.cafe);

  const updateStatus=async(id,status)=>{
    await save.orders(orders.map(o=>o.id===id?{...o,status}:o));
    toast(`Order updated to "${status}"`);
  };
  const saveDelivTime=async()=>{
    const v=parseInt(dtInput)||15;
    await save.delivTimes({...delivTimes,[user.cafe]:v});
    toast(`Delivery time updated to ${v} minutes ✓`);
  };
  const toggleAvail=async(id)=>{
    await save.menu({...menu,[user.cafe]:menu[user.cafe].map(i=>i.id===id?{...i,available:!i.available}:i)});
  };
  const saveEdit=async()=>{
    if(!editItem)return;
    await save.menu({...menu,[user.cafe]:menu[user.cafe].map(i=>i.id===editItem.id?{...editItem,price:Number(editItem.price)}:i)});
    setEditItem(null); toast("Item updated ✓");
  };
  const addItem=async()=>{
    if(!addForm.name||!addForm.price){toast("Name and price required","warn");return;}
    const ni={...addForm,id:Date.now(),price:Number(addForm.price),img:Number(addForm.img)||1};
    await save.menu({...menu,[user.cafe]:[...(menu[user.cafe]||[]),ni]});
    setAddForm({name:"",price:"",img:1,tag:"",available:true});setShowAdd(false);
    toast("New item added to menu ✓");
  };
  const delItem=async(id)=>{
    if(!window.confirm("Delete this item?"))return;
    await save.menu({...menu,[user.cafe]:menu[user.cafe].filter(i=>i.id!==id)});
    toast("Item removed");
  };
  const resolveComplaint=async(id,resp)=>{
    await save.complaints(complaints.map(c=>c.id===id?{...c,status:"Resolved",vendorResponse:resp}:c));
    toast("Complaint resolved ✓");
  };
  const genAI=async(c)=>{
    setAiLoading(p=>({...p,[c.id]:true}));
    try{
      const r=await ai("You are a professional cafeteria manager at Landmark University. Write a brief, empathetic, professional response to a student complaint (under 60 words). Acknowledge the issue, apologise, and state corrective action.","Complaint about "+c.cafe+": "+c.issue);
      setAiDraft(p=>({...p,[c.id]:r}));
    }catch{setAiDraft(p=>({...p,[c.id]:"Thank you for your feedback. We sincerely apologise for this experience and will take immediate corrective action to ensure it doesn't happen again."}));}
    setAiLoading(p=>({...p,[c.id]:false}));
  };

  const TABS=[
    {id:"orders",    icon:"🔔",label:"Live Orders"},
    {id:"menu",      icon:"📋",label:"Menu Editor"},
    {id:"delivery",  icon:"⏱",label:"Delivery Time"},
    {id:"analytics", icon:"📊",label:"Analytics"},
    {id:"complaints",icon:"📣",label:"Complaints"},
  ];

  return(
    <Shell user={user} onLogout={onLogout} tabs={TABS} activeTab={tab} setTab={setTab} dark>
      {/* ── LIVE ORDERS ── */}
      {tab==="orders"&&(
        <div className="anim">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
            <div>
              <h2 style={{color:"white",fontFamily:"'Playfair Display',serif",fontSize:26}}>Live Orders</h2>
              <p style={{color:"rgba(255,255,255,.45)",fontSize:13,marginTop:4}}>{user.cafe} · {myOrders.length} total orders</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(56,189,248,.1)",border:"1px solid rgba(56,189,248,.3)",borderRadius:20,padding:"7px 16px"}}>
              <Dot c="#38BDF8"/><span style={{color:"#38BDF8",fontSize:13,fontWeight:600}}>Live</span>
            </div>
          </div>
          {myOrders.length===0?(
            <div style={{background:"#1E293B",borderRadius:20,padding:48,textAlign:"center",border:"1px solid rgba(255,255,255,.07)"}}>
              <div style={{fontSize:48,marginBottom:14}}>📭</div>
              <div style={{color:"rgba(255,255,255,.5)",fontSize:15}}>No orders yet for {user.cafe}.</div>
            </div>
          ):myOrders.map(o=>(
            <div key={o.id} style={{background:"#1E293B",borderRadius:20,padding:"22px 24px",marginBottom:16,border:"1px solid rgba(56,189,248,.08)",boxShadow:"0 4px 20px rgba(0,0,0,.2)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:10}}>
                <div>
                  <div style={{fontSize:10,letterSpacing:3,color:"rgba(255,255,255,.35)",textTransform:"uppercase",marginBottom:4}}>Order #{o.id.slice(-6)}</div>
                  <div style={{fontFamily:"'Playfair Display',serif",color:"#38BDF8",fontSize:22}}>₦{o.total.toLocaleString()}</div>
                  <div style={{color:"rgba(255,255,255,.45)",fontSize:12,marginTop:3}}>by {o.studentName} · {o.hostel} Rm {o.room}</div>
                </div>
                <SChip s={o.status}/>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
                {o.items.map(it=>(
                  <div key={it.id} style={{display:"flex",alignItems:"center",gap:7,background:"rgba(255,255,255,.05)",borderRadius:20,padding:"4px 12px 4px 4px"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",overflow:"hidden",flexShrink:0}}>
                      <Img src={PH[it.img]||FB} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    </div>
                    <span style={{fontSize:12,color:"rgba(255,255,255,.75)"}}>{it.name.split("+")[0].trim()} ×{it.qty}</span>
                  </div>
                ))}
              </div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.3)",marginBottom:12}}>
                💳 {PAY.find(p=>p.id===o.payment)?.label} · ⏰ {o.timestamp} · ⏱ {o.deliveryMins}min delivery
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {["Preparing","On the Way","Delivered"].map(s=>(
                  <button key={s} onClick={()=>updateStatus(o.id,s)} style={{background:o.status===s?"#38BDF8":"rgba(255,255,255,.04)",color:o.status===s?"#0B1628":"rgba(255,255,255,.55)",border:`1px solid ${o.status===s?"#38BDF8":"rgba(255,255,255,.1)"}`,borderRadius:20,padding:"7px 16px",fontSize:13,fontWeight:o.status===s?700:500,cursor:"pointer",transition:"all .2s"}}>
                    {s==="Preparing"?"👨‍🍳":s==="On the Way"?"🛵":"✅"} {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MENU EDITOR ── */}
      {tab==="menu"&&(
        <div className="anim">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
            <div>
              <h2 style={{color:"white",fontFamily:"'Playfair Display',serif",fontSize:26}}>Menu Editor</h2>
              <p style={{color:"rgba(255,255,255,.4)",fontSize:13,marginTop:4}}>{user.cafe} · {(menu[user.cafe]||[]).length} items</p>
            </div>
            <button onClick={()=>setShowAdd(p=>!p)} style={{background:showAdd?"rgba(239,68,68,.15)":"#38BDF8",color:showAdd?"#EF4444":"#0B1628",border:showAdd?"1px solid #EF444455":"none",borderRadius:20,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .2s"}}>
              {showAdd?"✕ Cancel":"+ Add Item"}
            </button>
          </div>

          {showAdd&&(
            <div style={{background:"#1E293B",borderRadius:18,padding:24,marginBottom:20,border:"1px solid rgba(56,189,248,.2)",animation:"fadeUp .3s ease"}}>
              <div style={{color:"#38BDF8",fontWeight:700,fontSize:15,marginBottom:16}}>New Menu Item</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                {[{l:"Item Name",k:"name",ph:"e.g. Jollof Rice + Chicken"},{l:"Price (₦)",k:"price",ph:"1200"},{l:"Tag",k:"tag",ph:"Bestseller"}].map(f=>(
                  <div key={f.k} style={{gridColumn:f.k==="name"?"span 2":"span 1"}}>
                    <Label text={f.l}/>
                    <input value={addForm[f.k]} onChange={af(f.k)} placeholder={f.ph} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.05)",color:"white",fontFamily:"inherit",fontSize:14}}/>
                  </div>
                ))}
                <div>
                  <Label text="Photo (1–16)"/>
                  <input type="number" min={1} max={16} value={addForm.img} onChange={e=>setAddForm(p=>({...p,img:Number(e.target.value)}))} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.05)",color:"white",fontFamily:"inherit",fontSize:14}}/>
                </div>
              </div>
              {addForm.img&&<div style={{width:80,height:70,borderRadius:10,overflow:"hidden",marginBottom:12}}><Img src={PH[addForm.img]||FB} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}
              <button onClick={addItem} style={{background:"#38BDF8",color:"#0B1628",borderRadius:12,padding:"11px 24px",fontWeight:700,fontSize:14,cursor:"pointer"}}>Add to Menu</button>
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {(menu[user.cafe]||[]).map(item=>(
              <div key={item.id} style={{background:"#1E293B",borderRadius:16,padding:"16px 20px",border:"1px solid rgba(255,255,255,.05)"}}>
                {editItem?.id===item.id?(
                  <div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                      {[{l:"Name",k:"name"},{l:"Price (₦)",k:"price"},{l:"Tag",k:"tag"}].map(f=>(
                        <div key={f.k} style={{gridColumn:f.k==="name"?"span 2":"span 1"}}>
                          <Label text={f.l}/>
                          <input value={editItem[f.k]} onChange={e=>setEditItem(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid rgba(255,255,255,.12)",background:"rgba(255,255,255,.06)",color:"white",fontFamily:"inherit",fontSize:14}}/>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={saveEdit} style={{background:"#10B981",color:"white",borderRadius:20,padding:"8px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Save Changes</button>
                      <button onClick={()=>setEditItem(null)} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.5)",borderRadius:20,padding:"8px 18px",fontSize:13,cursor:"pointer"}}>Cancel</button>
                    </div>
                  </div>
                ):(
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:56,height:52,borderRadius:10,overflow:"hidden",flexShrink:0}}>
                      <Img src={PH[item.img]||FB} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14,color:"white"}}>{item.name}</div>
                      <div style={{color:"rgba(255,255,255,.4)",fontSize:12,marginTop:2}}>₦{Number(item.price).toLocaleString()}{item.tag?` · ${item.tag}`:""}</div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
                      <button onClick={()=>toggleAvail(item.id)} style={{background:item.available?"rgba(16,185,129,.15)":"rgba(239,68,68,.15)",color:item.available?"#10B981":"#EF4444",border:`1px solid ${item.available?"#10B98144":"#EF444444"}`,borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                        {item.available?"● Live":"● Off"}
                      </button>
                      <button onClick={()=>setEditItem({...item})} style={{background:"rgba(56,189,248,.1)",color:"#38BDF8",border:"1px solid rgba(56,189,248,.25)",borderRadius:20,padding:"5px 14px",fontSize:12,cursor:"pointer"}}>Edit</button>
                      <button onClick={()=>delItem(item.id)} style={{background:"rgba(239,68,68,.1)",color:"#EF4444",border:"1px solid rgba(239,68,68,.25)",borderRadius:20,padding:"5px 14px",fontSize:12,cursor:"pointer"}}>Remove</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DELIVERY TIME ── */}
      {tab==="delivery"&&(
        <div className="anim" style={{maxWidth:520}}>
          <h2 style={{color:"white",fontFamily:"'Playfair Display',serif",fontSize:26,marginBottom:6}}>Delivery Time Settings</h2>
          <p style={{color:"rgba(255,255,255,.45)",fontSize:14,marginBottom:28}}>Set how long students should expect to wait for delivery from {user.cafe}. This is displayed to students before and after they place an order.</p>
          <div style={{background:"#1E293B",borderRadius:20,padding:"28px 30px",border:"1px solid rgba(56,189,248,.15)",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}>
              <div style={{width:52,height:52,borderRadius:14,overflow:"hidden"}}><Img src={CAFE_IMG[user.cafe]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
              <div><div style={{color:"white",fontWeight:700,fontSize:16}}>{user.cafe}</div><div style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Current time: <strong style={{color:"#38BDF8"}}>{delivTimes[user.cafe]||20} minutes</strong></div></div>
            </div>
            <Label text="New Delivery Time (minutes)"/>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <input type="number" min={1} max={120} value={dtInput} onChange={e=>setDtInput(e.target.value)} style={{flex:1,padding:"12px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.06)",color:"white",fontFamily:"inherit",fontSize:18,fontWeight:700}}/>
              <span style={{color:"rgba(255,255,255,.5)",fontSize:14}}>min</span>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
              {[10,15,20,25,30,45].map(v=>(
                <button key={v} onClick={()=>setDtInput(String(v))} style={{background:dtInput===String(v)?"#38BDF8":"rgba(255,255,255,.06)",color:dtInput===String(v)?"#0B1628":"rgba(255,255,255,.55)",border:`1px solid ${dtInput===String(v)?"#38BDF8":"rgba(255,255,255,.1)"}`,borderRadius:20,padding:"6px 16px",fontSize:13,fontWeight:dtInput===String(v)?700:400,cursor:"pointer",transition:"all .18s"}}>
                  {v} min
                </button>
              ))}
            </div>
          </div>
          <button onClick={saveDelivTime} style={{background:"#38BDF8",color:"#0B1628",borderRadius:14,padding:"14px 28px",fontWeight:700,fontSize:15,cursor:"pointer",width:"100%"}}>
            ✓ Save Delivery Time
          </button>
          <div style={{marginTop:16,background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:12,padding:"12px 16px"}}>
            <div style={{color:"#F59E0B",fontWeight:700,fontSize:12,letterSpacing:1,marginBottom:4}}>💡 HOW IT WORKS</div>
            <p style={{color:"rgba(255,255,255,.5)",fontSize:13,lineHeight:1.6}}>The time you set here is shown to students on the menu page and used as their countdown timer after placing an order. Update it whenever your kitchen load changes.</p>
          </div>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {tab==="analytics"&&(
        <div className="anim">
          <h2 style={{color:"white",fontFamily:"'Playfair Display',serif",fontSize:26,marginBottom:22}}>Sales Analytics — {user.cafe}</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:14,marginBottom:24}}>
            {[
              {l:"Orders",    v:myOrders.length,          c:"#38BDF8"},
              {l:"Revenue",   v:`₦${myOrders.reduce((a,b)=>a+b.total,0).toLocaleString()}`,c:"#F59E0B"},
              {l:"Delivered", v:myOrders.filter(o=>o.status==="Delivered").length,c:"#10B981"},
              {l:"Preparing", v:myOrders.filter(o=>o.status==="Preparing").length, c:"#F472B6"},
            ].map(k=>(
              <div key={k.l} style={{background:"#1E293B",borderRadius:16,padding:"18px 16px",border:`1px solid ${k.c}1A`}}>
                <div style={{fontSize:22,fontWeight:800,fontFamily:"'Playfair Display',serif",color:k.c}}>{k.v}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:4}}>{k.l}</div>
              </div>
            ))}
          </div>
          {/* Item popularity */}
          <div style={{background:"#1E293B",borderRadius:18,padding:24,border:"1px solid rgba(255,255,255,.05)"}}>
            <div style={{color:"#38BDF8",fontWeight:700,fontSize:15,marginBottom:18}}>Item Performance</div>
            {(menu[user.cafe]||[]).map(item=>{
              const cnt=myOrders.reduce((a,o)=>a+(o.items.find(i=>i.id===item.id)?.qty||0),0);
              const max=Math.max(1,...(menu[user.cafe]||[]).map(x=>myOrders.reduce((a,o)=>a+(o.items.find(i=>i.id===x.id)?.qty||0),0)));
              return(
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                  <div style={{width:44,height:40,borderRadius:8,overflow:"hidden",flexShrink:0}}><Img src={PH[item.img]||FB} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.8)"}}>{item.name}</span>
                      <span style={{color:"#F59E0B",fontWeight:700,fontSize:13}}>{cnt} sold</span>
                    </div>
                    <div style={{background:"rgba(255,255,255,.06)",borderRadius:6,height:7}}>
                      <div style={{background:"#38BDF8",height:"100%",borderRadius:6,width:`${max>0?(cnt/max)*100:0}%`,transition:"width .8s ease"}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── COMPLAINTS ── */}
      {tab==="complaints"&&(
        <div className="anim">
          <h2 style={{color:"white",fontFamily:"'Playfair Display',serif",fontSize:26,marginBottom:22}}>Complaints & Reviews</h2>
          {complaints.length===0&&<div style={{background:"#1E293B",borderRadius:16,padding:40,textAlign:"center",color:"rgba(255,255,255,.4)"}}>No complaints. Excellent! 🎉</div>}
          {complaints.map(c=>(
            <div key={c.id} style={{background:"#1E293B",borderRadius:18,padding:"20px 22px",marginBottom:16,border:"1px solid rgba(255,255,255,.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:10}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:"white",marginBottom:4}}>{c.issue}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{c.student} · <span style={{color:"#38BDF8"}}>{c.cafe}</span> · {c.time}</div>
                </div>
                <SChip s={c.status}/>
              </div>
              {c.vendorResponse&&<div style={{background:"rgba(16,185,129,.08)",borderRadius:10,padding:"10px 14px",borderLeft:"3px solid #10B981",marginTop:10}}>
                <div style={{fontSize:11,fontWeight:700,color:"#10B981",marginBottom:4}}>Your Response</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.65)"}}>{c.vendorResponse}</div>
              </div>}
              {c.status!=="Resolved"&&(
                <div style={{marginTop:14}}>
                  {aiDraft[c.id]?(
                    <div>
                      <div style={{background:"rgba(56,189,248,.07)",borderRadius:10,padding:"12px 14px",marginBottom:10,border:"1px solid rgba(56,189,248,.15)"}}>
                        <div style={{fontSize:11,fontWeight:700,color:"#38BDF8",marginBottom:6}}>🤖 AI Draft — Edit before sending</div>
                        <textarea value={aiDraft[c.id]} onChange={e=>setAiDraft(p=>({...p,[c.id]:e.target.value}))} style={{width:"100%",background:"transparent",border:"none",color:"rgba(255,255,255,.75)",fontFamily:"inherit",fontSize:13,resize:"vertical",minHeight:60}}/>
                      </div>
                      <div style={{display:"flex",gap:10}}>
                        <button onClick={()=>resolveComplaint(c.id,aiDraft[c.id])} style={{background:"#10B981",color:"white",borderRadius:20,padding:"8px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>✔ Send & Resolve</button>
                        <button onClick={()=>setAiDraft(p=>({...p,[c.id]:""}))} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.45)",borderRadius:20,padding:"8px 16px",fontSize:13,cursor:"pointer"}}>Discard</button>
                      </div>
                    </div>
                  ):(
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      <button onClick={()=>genAI(c)} disabled={aiLoading[c.id]} style={{background:"rgba(56,189,248,.1)",border:"1px solid rgba(56,189,248,.3)",color:"#38BDF8",borderRadius:20,padding:"8px 18px",fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                        {aiLoading[c.id]?<><Spin/>Drafting…</>:"🤖 AI Draft Response"}
                      </button>
                      <button onClick={()=>resolveComplaint(c.id,"")} style={{background:"rgba(16,185,129,.1)",border:"1px solid rgba(16,185,129,.3)",color:"#10B981",borderRadius:20,padding:"8px 18px",fontSize:13,cursor:"pointer"}}>Mark Resolved</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {/* Reviews */}
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"white",margin:"28px 0 16px"}}>Student Reviews</div>
          {reviews.filter(r=>r.cafe===user.cafe).map(r=>(
            <div key={r.id} style={{background:"#1E293B",borderRadius:14,padding:"16px 18px",marginBottom:10,display:"flex",gap:13,border:"1px solid rgba(255,255,255,.04)"}}>
              <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(56,189,248,.15)",color:"#38BDF8",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,flexShrink:0}}>{r.avatar||"?"}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontWeight:700,fontSize:14,color:"white"}}>{r.student}</span>
                  <span style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>{r.time}</span>
                </div>
                <Stars val={r.rating} sz={13}/>
                <p style={{color:"rgba(255,255,255,.6)",fontSize:13,marginTop:6,lineHeight:1.55}}>{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN APP
// ─────────────────────────────────────────────────────────────────────────────
function AdminApp({user,onLogout,orders,reviews,complaints,menu,delivTimes,students,save,toast}){
  const [tab,setTab]=useState("overview");
  const [aiOut,setAiOut]=useState("");
  const [aiLoad,setAiLoad]=useState(false);
  const [dtEdits,setDtEdits]=useState({...delivTimes});
  const [filterCafe,setFilterCafe]=useState("All");

  const totalRev=orders.reduce((a,b)=>a+b.total,0);
  const avgRating=reviews.length>0?(reviews.reduce((a,b)=>a+b.rating,0)/reviews.length).toFixed(1):"—";
  const filtOrders=filterCafe==="All"?orders:orders.filter(o=>o.cafe===filterCafe);

  const saveAllTimes=async()=>{
    await save.delivTimes(dtEdits);
    toast("All delivery times updated ✓");
  };

  const runAI=async()=>{
    setAiLoad(true);
    try{
      const payload={
        orders:orders.length,revenue:totalRev,
        cafeBreakdown:CAFES.map(c=>({cafe:c,orders:orders.filter(o=>o.cafe===c).length,rev:orders.filter(o=>o.cafe===c).reduce((a,b)=>a+b.total,0)})),
        avgRating,openComplaints:complaints.filter(c=>c.status!=="Resolved").length,
        students:students.length,hostelBreakdown:HOSTELS.map(h=>({hostel:h,orders:orders.filter(o=>o.hostel===h).length})),
        payBreakdown:PAY.map(p=>({method:p.label,count:orders.filter(o=>o.payment===p.id).length})),
      };
      const r=await ai("You are a senior data analyst for Landmark University's Campus Chop Hub. Analyse the operational data and provide 4-5 specific, actionable business insights. Format as numbered points. Be direct and data-driven. Use plain text only.","Platform data: "+JSON.stringify(payload));
      setAiOut(r);
    }catch{setAiOut("AI analysis failed. Please check your connection and try again.");}
    setAiLoad(false);
  };

  const TABS=[
    {id:"overview",icon:"🏠",label:"Overview"},
    {id:"orders",  icon:"📦",label:"All Orders"},
    {id:"users",   icon:"👤",label:"Students"},
    {id:"settings",icon:"⚙️", label:"Settings"},
    {id:"ai",      icon:"🤖",label:"AI Insights"},
  ];
  const AC="#A78BFA";

  return(
    <Shell user={user} onLogout={onLogout} tabs={TABS} activeTab={tab} setTab={setTab} dark>
      {/* ── OVERVIEW ── */}
      {tab==="overview"&&(
        <div className="anim">
          <h2 style={{color:"white",fontFamily:"'Playfair Display',serif",fontSize:28,marginBottom:6}}>Platform Overview</h2>
          <p style={{color:"rgba(255,255,255,.4)",fontSize:14,marginBottom:24}}>Landmark University Campus Chop Hub · Real-time dashboard</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:14,marginBottom:28}}>
            {[
              {l:"Total Orders",  v:orders.length,                          c:AC,   i:"📦"},
              {l:"Revenue",       v:`₦${(totalRev/1000).toFixed(1)}k`,      c:"#F59E0B",i:"💰"},
              {l:"Students",      v:students.length,                        c:"#38BDF8",i:"🎓"},
              {l:"Delivered",     v:orders.filter(o=>o.status==="Delivered").length,c:"#10B981",i:"✅"},
              {l:"Avg Rating",    v:avgRating+"★",                          c:"#FBBF24",i:"⭐"},
              {l:"Open Issues",   v:complaints.filter(c=>c.status!=="Resolved").length,c:"#EF4444",i:"📣"},
            ].map(k=>(
              <div key={k.l} style={{background:"#161B35",borderRadius:18,padding:"18px 16px",border:`1px solid ${k.c}22`,transition:"transform .2s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                <div style={{fontSize:26,marginBottom:10}}>{k.i}</div>
                <div style={{fontSize:22,fontWeight:800,fontFamily:"'Playfair Display',serif",color:k.c}}>{k.v}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:4,letterSpacing:.3}}>{k.l}</div>
              </div>
            ))}
          </div>
          {/* Cafe comparison */}
          <div style={{background:"#161B35",borderRadius:20,padding:24,marginBottom:20,border:"1px solid rgba(167,139,250,.08)"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:AC,marginBottom:18}}>Cafeteria Performance</div>
            {CAFES.map((c,ci)=>{
              const co=orders.filter(o=>o.cafe===c);
              const rev=co.reduce((a,b)=>a+b.total,0);
              const maxR=Math.max(1,...CAFES.map(x=>orders.filter(o=>o.cafe===x).reduce((a,b)=>a+b.total,0)));
              const colors=[AC,"#F59E0B","#10B981","#F472B6"];
              return(
                <div key={c} style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
                  <div style={{width:48,height:42,borderRadius:9,overflow:"hidden",flexShrink:0}}><Img src={CAFE_IMG[c]} alt={c} style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.8)"}}>{c}</span>
                      <span style={{color:colors[ci],fontWeight:700,fontSize:13}}>{co.length} orders · ₦{rev.toLocaleString()}</span>
                    </div>
                    <div style={{background:"rgba(255,255,255,.06)",borderRadius:8,height:10,overflow:"hidden"}}>
                      <div style={{background:colors[ci],height:"100%",borderRadius:8,width:`${(rev/maxR)*100}%`,transition:"width .9s ease"}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Recent orders */}
          <div style={{background:"#161B35",borderRadius:20,padding:24,border:"1px solid rgba(167,139,250,.06)"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:AC,marginBottom:16}}>Recent Orders</div>
            {orders.slice(0,6).map(o=>(
              <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:"1px solid rgba(255,255,255,.04)",flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:38,height:34,borderRadius:8,overflow:"hidden",flexShrink:0}}><Img src={CAFE_IMG[o.cafe]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,color:"white"}}>{o.studentName}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{o.cafe} · {o.hostel} · {o.timestamp}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{color:AC,fontWeight:800,fontSize:15}}>₦{o.total.toLocaleString()}</span>
                  <SChip s={o.status}/>
                </div>
              </div>
            ))}
            {orders.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,.3)",padding:16}}>No orders yet.</div>}
          </div>
        </div>
      )}

      {/* ── ALL ORDERS ── */}
      {tab==="orders"&&(
        <div className="anim">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:12}}>
            <h2 style={{color:"white",fontFamily:"'Playfair Display',serif",fontSize:26}}>All Orders ({filtOrders.length})</h2>
            <select value={filterCafe} onChange={e=>setFilterCafe(e.target.value)} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(167,139,250,.2)",color:"white",borderRadius:20,padding:"8px 16px",fontFamily:"inherit",fontSize:13,cursor:"pointer"}}>
              <option>All</option>{CAFES.map(c=><option key={c} style={{background:"#161B35"}}>{c}</option>)}
            </select>
          </div>
          {filtOrders.length===0&&<div style={{background:"#161B35",borderRadius:16,padding:40,textAlign:"center",color:"rgba(255,255,255,.35)"}}>No orders found.</div>}
          {filtOrders.map(o=>(
            <div key={o.id} style={{background:"#161B35",borderRadius:16,padding:"18px 20px",marginBottom:12,border:"1px solid rgba(167,139,250,.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:44,height:40,borderRadius:9,overflow:"hidden",flexShrink:0}}><Img src={CAFE_IMG[o.cafe]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:"white"}}>{o.studentName}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{o.cafe} · {o.hostel} Rm {o.room} · {o.timestamp}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{color:AC,fontWeight:800}}> ₦{o.total.toLocaleString()}</span>
                  <SChip s={o.status}/>
                </div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {o.items.map(it=>(
                  <div key={it.id} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.04)",borderRadius:20,padding:"3px 10px 3px 3px"}}>
                    <div style={{width:22,height:22,borderRadius:"50%",overflow:"hidden"}}><Img src={PH[it.img]||FB} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
                    <span style={{fontSize:12,color:"rgba(255,255,255,.6)"}}>{it.name.split("+")[0].trim()} ×{it.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STUDENTS ── */}
      {tab==="users"&&(
        <div className="anim">
          <h2 style={{color:"white",fontFamily:"'Playfair Display',serif",fontSize:26,marginBottom:22}}>Registered Students ({students.length})</h2>
          {students.length===0&&<div style={{background:"#161B35",borderRadius:16,padding:40,textAlign:"center",color:"rgba(255,255,255,.35)"}}>No students registered yet.</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
            {students.map(s=>{
              const sOrders=orders.filter(o=>o.studentId===s.id);
              return(
                <div key={s.id} style={{background:"#161B35",borderRadius:16,padding:"18px 20px",border:"1px solid rgba(167,139,250,.07)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#A78BFA,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:17,color:"white",flexShrink:0}}>{s.name[0].toUpperCase()}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:"white"}}>{s.name}</div>
                      <div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>{s.matric}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <Badge text={s.hostel} color={AC}/>
                    <Badge text={`${sOrders.length} orders`} color="#10B981"/>
                    {sOrders.length>0&&<Badge text={`₦${sOrders.reduce((a,b)=>a+b.total,0).toLocaleString()}`} color="#F59E0B"/>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SETTINGS ── */}
      {tab==="settings"&&(
        <div className="anim" style={{maxWidth:600}}>
          <h2 style={{color:"white",fontFamily:"'Playfair Display',serif",fontSize:26,marginBottom:6}}>Platform Settings</h2>
          <p style={{color:"rgba(255,255,255,.4)",fontSize:14,marginBottom:28}}>Configure global settings for all cafeterias.</p>
          <div style={{background:"#161B35",borderRadius:20,padding:28,border:"1px solid rgba(167,139,250,.1)",marginBottom:20}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:AC,marginBottom:18}}>Delivery Time Configuration</div>
            <p style={{color:"rgba(255,255,255,.45)",fontSize:13,marginBottom:20,lineHeight:1.6}}>Set the delivery time for each cafeteria. These times are shown to students and used for their order countdown timers.</p>
            {CAFES.map(c=>(
              <div key={c} style={{display:"flex",alignItems:"center",gap:16,marginBottom:16,background:"rgba(255,255,255,.03)",borderRadius:12,padding:"14px 16px"}}>
                <div style={{width:44,height:40,borderRadius:8,overflow:"hidden",flexShrink:0}}><Img src={CAFE_IMG[c]} alt={c} style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
                <span style={{flex:1,fontWeight:600,fontSize:14,color:"rgba(255,255,255,.8)"}}>{c}</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <input type="number" min={1} max={120} value={dtEdits[c]||15} onChange={e=>setDtEdits(p=>({...p,[c]:Number(e.target.value)}))} style={{width:64,padding:"7px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.06)",color:"white",fontFamily:"inherit",fontSize:14,fontWeight:700,textAlign:"center"}}/>
                  <span style={{color:"rgba(255,255,255,.4)",fontSize:12}}>min</span>
                </div>
              </div>
            ))}
            <button onClick={saveAllTimes} style={{background:AC,color:"white",borderRadius:12,padding:"12px 24px",fontWeight:700,fontSize:14,cursor:"pointer",marginTop:8,width:"100%"}}>Save All Delivery Times</button>
          </div>
          {/* Credentials reference */}
          <div style={{background:"#161B35",borderRadius:20,padding:24,border:"1px solid rgba(167,139,250,.08)"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:AC,marginBottom:16}}>Vendor Credentials</div>
            {VENDOR_ACCTS.map(v=>(
              <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:34,height:30,borderRadius:7,overflow:"hidden"}}><Img src={CAFE_IMG[v.cafe]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
                  <span style={{color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:600}}>{v.cafe}</span>
                </div>
                <div style={{fontFamily:"monospace",fontSize:12,color:"rgba(255,255,255,.4)"}}>{v.u} / {v.p}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI INSIGHTS ── */}
      {tab==="ai"&&(
        <div className="anim" style={{maxWidth:720}}>
          <h2 style={{color:"white",fontFamily:"'Playfair Display',serif",fontSize:28,marginBottom:6}}>AI Business Insights</h2>
          <p style={{color:"rgba(255,255,255,.45)",fontSize:14,lineHeight:1.7,marginBottom:28}}>Let AI analyse your platform's live data to surface actionable insights and growth recommendations.</p>
          <div style={{background:"#161B35",borderRadius:20,padding:28,border:"1px solid rgba(167,139,250,.12)",marginBottom:20}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
              {[
                {l:"Orders Analysed",  v:orders.length},
                {l:"Total Revenue",    v:`₦${totalRev.toLocaleString()}`},
                {l:"Student Reviews",  v:reviews.length},
                {l:"Open Complaints",  v:complaints.filter(c=>c.status!=="Resolved").length},
              ].map(d=>(
                <div key={d.l} style={{background:`${AC}0D`,borderRadius:12,padding:"14px 18px",border:`1px solid ${AC}22`}}>
                  <div style={{fontSize:20,fontWeight:800,fontFamily:"'Playfair Display',serif",color:AC}}>{d.v}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:3}}>{d.l}</div>
                </div>
              ))}
            </div>
            <button onClick={runAI} disabled={aiLoad} style={{background:aiLoad?`${AC}33`:`linear-gradient(90deg,#7C3AED,${AC})`,color:"white",border:"none",borderRadius:14,padding:"14px 28px",fontWeight:700,fontSize:15,cursor:aiLoad?"not-allowed":"pointer",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"opacity .2s"}}>
              {aiLoad?<><Spin/>Analysing your data…</>:"✨ Generate AI Insights"}
            </button>
          </div>
          {aiOut&&(
            <div style={{background:"linear-gradient(135deg,#1A1035,#161B35)",borderRadius:20,padding:28,border:`1px solid ${AC}33`,animation:"fadeUp .5s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
                <div style={{width:40,height:40,borderRadius:12,background:`${AC}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🤖</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:AC}}>AI Analysis Report</div>
              </div>
              <div style={{color:"rgba(255,255,255,.75)",fontSize:14,lineHeight:1.85,whiteSpace:"pre-wrap"}}>{aiOut}</div>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
