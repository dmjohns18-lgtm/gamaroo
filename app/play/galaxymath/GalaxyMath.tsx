'use client'
import { useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const A = '/galaxymath/craftpix-896714-space-adventures-2d-game-kit/PNG'

const QUESTIONS: Record<number, {q:string,a:number}[]> = {
  3: [
    {q:'7 × 8',a:56},{q:'6 × 9',a:54},{q:'8 × 8',a:64},{q:'9 × 9',a:81},
    {q:'7 × 7',a:49},{q:'6 × 7',a:42},{q:'8 × 9',a:72},{q:'6 × 8',a:48},
    {q:'56 ÷ 7',a:8},{q:'54 ÷ 6',a:9},{q:'64 ÷ 8',a:8},{q:'72 ÷ 9',a:8},
  ],
  4: [
    {q:'23 × 4',a:92},{q:'15 × 6',a:90},{q:'12 × 8',a:96},{q:'11 × 11',a:121},
    {q:'144 ÷ 12',a:12},{q:'96 ÷ 8',a:12},{q:'25 × 4',a:100},{q:'13 × 7',a:91},
  ],
  5: [
    {q:'125 × 4',a:500},{q:'256 ÷ 8',a:32},{q:'15 × 15',a:225},{q:'13 × 13',a:169},
    {q:'625 ÷ 25',a:25},{q:'24 × 12',a:288},{q:'17 × 8',a:136},{q:'144 ÷ 9',a:16},
  ],
}

function getRoomCode() { return Math.random().toString(36).substring(2,8).toUpperCase() }
function getQ(grade:number) { const p=QUESTIONS[grade]||QUESTIONS[3]; return p[Math.floor(Math.random()*p.length)] }
function makeChoices(a:number) {
  const s=new Set([a])
  while(s.size<4){const d=Math.floor(Math.random()*20)-10; if(d!==0)s.add(a+d)}
  return Array.from(s).sort(()=>Math.random()-0.5)
}

interface Bullet{id:number,x:number,y:number,fromPlayer:boolean}
interface Enemy{id:number,x:number,y:number,vy:number,frame:number,hp:number,shootTimer:number}
interface Explosion{id:number,x:number,y:number,frame:number}

interface GS {
  px:number, py:number, pvx:number, pvy:number
  health:number, ammo:number, score:number, streak:number
  bullets:Bullet[], enemies:Enemy[], explosions:Explosion[]
  bgX:number, pFrame:number, fc:number
  paused:boolean, gameOver:boolean, keys:Set<string>
}

let bid=0, eid=0, xid=0

export default function GalaxyMath() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gs = useRef<GS>({
    px:200, py:300, pvx:0, pvy:0,
    health:100, ammo:5, score:0, streak:0,
    bullets:[], enemies:[], explosions:[],
    bgX:0, pFrame:0, fc:0,
    paused:false, gameOver:false, keys:new Set()
  })
  const imgs = useRef<Record<string,HTMLImageElement>>({})
  const raf = useRef<number>()

  const [screen, setScreen] = useState<'lobby'|'game'|'over'>('lobby')
  const [grade, setGrade] = useState(3)
  const [playerName, setPlayerName] = useState('Player')
  const [mode, setMode] = useState<'solo'|'host'|'join'>('solo')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [showQ, setShowQ] = useState(false)
  const [question, setQuestion] = useState(getQ(3))
  const [choices, setChoices] = useState(makeChoices(56))
  const [feedback, setFeedback] = useState<string|null>(null)
  const [hud, setHud] = useState({health:100,ammo:5,score:0,streak:0})
  const [finalScore, setFinalScore] = useState(0)
  const [opponent, setOpponent] = useState<{name:string,health:number,score:number}|null>(null)
  const channelRef = useRef<any>(null)
  const showQRef = useRef(false)

  // Preload
  useEffect(()=>{
    const load=(k:string,src:string)=>{
      const i=new Image(); i.src=src; imgs.current[k]=i
    }
    for(let i=0;i<14;i++) load(`p${i}`,`${A}/Main Planes/Plane01/Idle and Moving/skeleton-MovingNIdle_${i}.png`)
    for(let i=0;i<26;i++) load(`e${i}`,`${A}/Enemy/Char01/Idle/skeleton-Idle_${i}.png`)
    for(let i=0;i<8;i++) load(`x${i}`,`${A}/Collision_Fx/skeleton-Colision_${i}.png`)
    load('bg1',`${A}/Backgrounds/03/Layer1.png`)
    load('bg2',`${A}/Backgrounds/03/Layer2.png`)
    load('bg3',`${A}/Backgrounds/03/Layer3.png`)
    load('bullet',`${A}/Projectile/01.png`)
    load('pilot',`${A}/Pilot Icon/Pilot01.png`)
    load('hpbg',`${A}/Hud/HPbar_Bg.png`)
    load('hpfill',`${A}/Hud/Hpbar_green.png`)
  },[])

  // Keys
  useEffect(()=>{
    if(screen!=='game') return
    const dn=(e:KeyboardEvent)=>{
      gs.current.keys.add(e.key)
      if(e.key===' '){e.preventDefault(); shoot()}
    }
    const up=(e:KeyboardEvent)=>gs.current.keys.delete(e.key)
    window.addEventListener('keydown',dn)
    window.addEventListener('keyup',up)
    return()=>{window.removeEventListener('keydown',dn); window.removeEventListener('keyup',up)}
  },[screen])

  function shoot(){
    const s=gs.current
    if(s.ammo<=0||s.paused||s.gameOver||showQRef.current) return
    s.ammo=Math.max(0,s.ammo-1)
    s.bullets.push({id:bid++,x:s.px+60,y:s.py,fromPlayer:true})
    setHud(h=>({...h,ammo:s.ammo}))
    if(s.ammo===0) triggerQ()
  }

  function triggerQ(){
    const s=gs.current
    s.paused=true
    showQRef.current=true
    const q=getQ(grade)
    setQuestion(q)
    setChoices(makeChoices(q.a))
    setShowQ(true)
  }

  function answerQ(choice:number){
    const s=gs.current
    const correct=choice===question.a
    if(correct){
      s.ammo=Math.min(s.ammo+5,10)
      s.score+=50
      s.streak+=1
      setFeedback('✓ Correct! +5 ammo')
    } else {
      s.health=Math.max(0,s.health-20)
      s.streak=0
      setFeedback('✗ Wrong! -20 HP')
      if(s.health<=0) endGame()
    }
    setHud({health:s.health,ammo:s.ammo,score:s.score,streak:s.streak})
    if(channelRef.current){
      channelRef.current.send({type:'broadcast',event:'update',payload:{health:s.health,score:s.score}})
    }
    setTimeout(()=>{
      setFeedback(null)
      setShowQ(false)
      showQRef.current=false
      s.paused=false
    },800)
  }

  function endGame(){
    gs.current.gameOver=true
    setFinalScore(gs.current.score)
    if(raf.current) cancelAnimationFrame(raf.current)
    setScreen('over')
  }

  // Game loop
  useEffect(()=>{
    if(screen!=='game') return
    const canvas=canvasRef.current!
    const ctx=canvas.getContext('2d')!
    let lastSpawn=0

    function resize(){
      canvas.width=window.innerWidth
      canvas.height=window.innerHeight
    }
    resize()
    window.addEventListener('resize',resize)

    function loop(ts:number){
      const s=gs.current
      const im=imgs.current
      const W=canvas.width, H=canvas.height

      if(!s.paused&&!s.gameOver){
        s.fc++

        // Player movement
        const spd=5
        if(s.keys.has('ArrowUp')||s.keys.has('w')) s.pvy=-spd
        else if(s.keys.has('ArrowDown')||s.keys.has('s')) s.pvy=spd
        else s.pvy*=0.8
        if(s.keys.has('ArrowLeft')||s.keys.has('a')) s.pvx=-spd
        else if(s.keys.has('ArrowRight')||s.keys.has('d')) s.pvx=spd
        else s.pvx*=0.8

        s.px=Math.max(20,Math.min(W*0.5,s.px+s.pvx))
        s.py=Math.max(40,Math.min(H-80,s.py+s.pvy))
        s.pFrame=(s.pFrame+1)%14

        // Parallax scroll
        s.bgX=(s.bgX-0.5+W)%W

        // Spawn enemies from right
        if(ts-lastSpawn>2000&&s.enemies.length<5){
          s.enemies.push({
            id:eid++,
            x:W+60,
            y:Math.random()*(H-160)+60,
            vy:(Math.random()-0.5)*1.5,
            frame:0,
            hp:2,
            shootTimer:Math.random()*120+60
          })
          lastSpawn=ts
        }

        // Update enemies
        s.enemies=s.enemies.filter(e=>{
          e.x-=2
          e.y+=e.vy
          e.frame=(e.frame+1)%26
          if(e.y<40||e.y>H-80) e.vy*=-1
          e.shootTimer--
          if(e.shootTimer<=0){
            s.bullets.push({id:bid++,x:e.x-40,y:e.y,fromPlayer:false})
            e.shootTimer=Math.random()*180+90
          }
          // Enemy reaches left side
          if(e.x<-60){
            s.health=Math.max(0,s.health-10)
            setHud(h=>({...h,health:s.health}))
            if(s.health<=0) endGame()
            return false
          }
          return true
        })

        // Update bullets
        s.bullets=s.bullets.filter(b=>{
          b.x+=b.fromPlayer?14:-8
          if(b.x>W+20||b.x<-20) return false

          if(b.fromPlayer){
            const hit=s.enemies.findIndex(e=>Math.abs(b.x-e.x)<35&&Math.abs(b.y-e.y)<35)
            if(hit!==-1){
              s.enemies[hit].hp--
              if(s.enemies[hit].hp<=0){
                s.explosions.push({id:xid++,x:s.enemies[hit].x,y:s.enemies[hit].y,frame:0})
                s.enemies.splice(hit,1)
                s.score+=20
                setHud(h=>({...h,score:s.score}))
              }
              return false
            }
          } else {
            // Enemy bullet hits player
            if(Math.abs(b.x-s.px)<35&&Math.abs(b.y-s.py)<35){
              s.health=Math.max(0,s.health-8)
              setHud(h=>({...h,health:s.health}))
              if(s.health<=0) endGame()
              return false
            }
          }
          return true
        })

        // Update explosions
        s.explosions=s.explosions.filter(e=>{e.frame++; return e.frame<8})

        // Auto question every 20s
        if(s.fc%1200===0&&!showQRef.current) triggerQ()
      }

      // === DRAW ===
      ctx.clearRect(0,0,W,H)

      // Background
      const bg1=im.bg1, bg2=im.bg2, bg3=im.bg3
      if(bg1?.complete&&bg1.naturalWidth>0){
        ctx.drawImage(bg1,0,0,W,H)
      } else {
        ctx.fillStyle='#0d0d2b'; ctx.fillRect(0,0,W,H)
        // stars
        ctx.fillStyle='rgba(255,255,255,0.6)'
        for(let i=0;i<80;i++){
          ctx.fillRect((i*137+s.fc*0.2)%W,(i*97)%H,1.5,1.5)
        }
      }
      if(bg3?.complete&&bg3.naturalWidth>0){
        ctx.globalAlpha=0.5
        ctx.drawImage(bg3,s.bgX*0.3-W,0,W,H)
        ctx.drawImage(bg3,s.bgX*0.3,0,W,H)
        ctx.globalAlpha=1
      }
      if(bg2?.complete&&bg2.naturalWidth>0){
        ctx.globalAlpha=0.7
        ctx.drawImage(bg2,s.bgX*0.6-W,0,W,H)
        ctx.drawImage(bg2,s.bgX*0.6,0,W,H)
        ctx.globalAlpha=1
      }

      // Explosions
      s.explosions.forEach(e=>{
        const img=im[`x${Math.min(e.frame,7)}`]
        if(img?.complete&&img.naturalWidth>0) ctx.drawImage(img,e.x-50,e.y-50,100,100)
      })

      // Enemy bullets
      s.bullets.filter(b=>!b.fromPlayer).forEach(b=>{
        ctx.fillStyle='#ef4444'
        ctx.beginPath(); ctx.ellipse(b.x,b.y,12,5,0,0,Math.PI*2); ctx.fill()
      })

      // Enemies
      s.enemies.forEach(e=>{
        const img=im[`e${e.frame%26}`]
        if(img?.complete&&img.naturalWidth>0){
          ctx.save()
          ctx.scale(-1,1)
          ctx.drawImage(img,-e.x-50,e.y-40,100,80)
          ctx.restore()
        } else {
          ctx.fillStyle='#8b5cf6'
          ctx.beginPath(); ctx.arc(e.x,e.y,30,0,Math.PI*2); ctx.fill()
        }
      })

      // Player bullets
      s.bullets.filter(b=>b.fromPlayer).forEach(b=>{
        const img=im.bullet
        if(img?.complete&&img.naturalWidth>0){
          ctx.drawImage(img,b.x-8,b.y-20,24,40)
        } else {
          ctx.fillStyle='#fbbf24'
          ctx.fillRect(b.x-4,b.y-16,8,32)
        }
      })

      // Player ship
      const pimg=im[`p${s.pFrame}`]
      if(pimg?.complete&&pimg.naturalWidth>0){
        ctx.drawImage(pimg,s.px-50,s.py-40,100,80)
      } else {
        ctx.fillStyle='#818cf8'
        ctx.beginPath()
        ctx.moveTo(s.px+40,s.py)
        ctx.lineTo(s.px-30,s.py-25)
        ctx.lineTo(s.px-30,s.py+25)
        ctx.closePath(); ctx.fill()
      }

      // Engine trail
      ctx.globalAlpha=0.6
      const grd=ctx.createRadialGradient(s.px-50,s.py,2,s.px-50,s.py,20)
      grd.addColorStop(0,'#f97316')
      grd.addColorStop(1,'transparent')
      ctx.fillStyle=grd
      ctx.beginPath(); ctx.arc(s.px-50,s.py,20,0,Math.PI*2); ctx.fill()
      ctx.globalAlpha=1

      // === HUD ===
      // Top bar
      ctx.fillStyle='rgba(0,0,0,0.65)'
      ctx.fillRect(0,0,W,64)

      // Pilot portrait
      const pilot=im.pilot
      if(pilot?.complete&&pilot.naturalWidth>0){
        ctx.save()
        ctx.beginPath(); ctx.arc(40,32,24,0,Math.PI*2); ctx.clip()
        ctx.drawImage(pilot,16,8,48,48)
        ctx.restore()
        ctx.strokeStyle='#fbbf24'; ctx.lineWidth=2
        ctx.beginPath(); ctx.arc(40,32,24,0,Math.PI*2); ctx.stroke()
      }

      // HP bar
      const hpbg=im.hpbg, hpfill=im.hpfill
      if(hpbg?.complete&&hpbg.naturalWidth>0){
        ctx.drawImage(hpbg,72,20,200,24)
        ctx.save()
        ctx.beginPath(); ctx.rect(72,20,s.health*2,24); ctx.clip()
        if(hpfill?.complete&&hpfill.naturalWidth>0) ctx.drawImage(hpfill,72,20,200,24)
        ctx.restore()
      } else {
        ctx.fillStyle='#374151'; ctx.fillRect(72,20,200,24)
        ctx.fillStyle=s.health>50?'#22c55e':s.health>25?'#f59e0b':'#ef4444'
        ctx.fillRect(72,20,s.health*2,24)
      }

      // Ammo icons
      for(let i=0;i<Math.min(s.ammo,10);i++){
        ctx.fillStyle='#a78bfa'
        ctx.fillRect(72+i*18,48,12,10)
      }

      // Score
      ctx.fillStyle='#fbbf24'
      ctx.font='bold 22px Nunito, sans-serif'
      ctx.textAlign='center'
      ctx.fillText(`⭐ ${s.score}`,W/2,40)

      if(s.streak>=3){
        ctx.fillStyle='#f97316'
        ctx.font='bold 16px Nunito, sans-serif'
        ctx.fillText(`🔥 ${s.streak} streak`,W/2,58)
      }

      // Room code
      if(mode!=='solo'&&roomCode){
        ctx.fillStyle='#94a3b8'
        ctx.font='bold 13px monospace'
        ctx.textAlign='right'
        ctx.fillText(`Room: ${roomCode}`,W-16,40)
      }

      // Controls hint (bottom left)
      ctx.fillStyle='rgba(255,255,255,0.25)'
      ctx.font='12px Nunito, sans-serif'
      ctx.textAlign='left'
      ctx.fillText('WASD / Arrows to move • Space to shoot',16,H-12)

      ctx.textAlign='left'
      if(!s.gameOver) raf.current=requestAnimationFrame(loop)
    }

    raf.current=requestAnimationFrame(loop)
    return()=>{
      if(raf.current) cancelAnimationFrame(raf.current)
      window.removeEventListener('resize',resize)
    }
  },[screen,mode,roomCode,grade])

  function startGame(){
    const s=gs.current
    s.px=200; s.py=window.innerHeight/2
    s.pvx=0; s.pvy=0
    s.health=100; s.ammo=5; s.score=0; s.streak=0
    s.bullets=[]; s.enemies=[]; s.explosions=[]
    s.bgX=0; s.pFrame=0; s.fc=0
    s.paused=false; s.gameOver=false; s.keys=new Set()
    showQRef.current=false
    setHud({health:100,ammo:5,score:0,streak:0})
    setShowQ(false); setFeedback(null)
    const q=getQ(grade); setQuestion(q); setChoices(makeChoices(q.a))
    setScreen('game')
  }

  async function hostGame(){
    const supabase=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const code=getRoomCode(); setRoomCode(code); setMode('host')
    const ch=supabase.channel(`galaxy-${code}`)
    channelRef.current=ch
    ch.on('broadcast',{event:'join'},({payload})=>setOpponent({name:payload.name,health:100,score:0}))
      .on('broadcast',{event:'update'},({payload})=>setOpponent(o=>o?{...o,health:payload.health,score:payload.score}:o))
      .subscribe()
    startGame()
  }

  async function joinGame(){
    const supabase=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    setMode('join')
    const ch=supabase.channel(`galaxy-${joinCode}`)
    channelRef.current=ch
    ch.on('broadcast',{event:'update'},({payload})=>setOpponent(o=>o?{...o,health:payload.health,score:payload.score}:o))
      .subscribe(()=>{
        ch.send({type:'broadcast',event:'join',payload:{name:playerName}})
        setOpponent({name:'Host',health:100,score:0})
        setRoomCode(joinCode)
        startGame()
      })
  }

  if(screen==='lobby') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0d0d2b,#1a0a3e)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      fontFamily:'Nunito,sans-serif',color:'white',padding:24}}>
      <div style={{fontSize:72,marginBottom:8}}>🚀</div>
      <h1 style={{fontSize:44,fontWeight:900,color:'#a78bfa',margin:'0 0 4px'}}>Galaxy Math</h1>
      <p style={{color:'#94a3b8',marginBottom:32,textAlign:'center',maxWidth:400}}>
        Fly your ship through space. Answer math questions to reload ammo. Destroy enemy ships!
      </p>
      <div style={{background:'rgba(30,27,75,0.9)',borderRadius:20,padding:32,
        width:'100%',maxWidth:420,border:'1px solid #3730a3'}}>
        <label style={{display:'block',color:'#94a3b8',fontSize:13,marginBottom:6}}>Pilot Name</label>
        <input value={playerName} onChange={e=>setPlayerName(e.target.value)}
          style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid #3730a3',
            background:'#0f0e2a',color:'white',marginBottom:16,boxSizing:'border-box',fontSize:15}}/>

        <label style={{display:'block',color:'#94a3b8',fontSize:13,marginBottom:6}}>Grade</label>
        <select value={grade} onChange={e=>setGrade(Number(e.target.value))}
          style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid #3730a3',
            background:'#0f0e2a',color:'white',marginBottom:24,boxSizing:'border-box',fontSize:15}}>
          <option value={3}>Grade 3 — Multiplication & Division</option>
          <option value={4}>Grade 4 — Multi-digit Operations</option>
          <option value={5}>Grade 5 — Advanced Operations</option>
        </select>

        <button onClick={startGame}
          style={{width:'100%',padding:14,borderRadius:12,border:'none',
            background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'white',
            fontWeight:900,fontSize:17,cursor:'pointer',marginBottom:10}}>
          🚀 Solo Mission
        </button>
        <button onClick={hostGame}
          style={{width:'100%',padding:14,borderRadius:12,border:'none',
            background:'linear-gradient(135deg,#1d4ed8,#0369a1)',color:'white',
            fontWeight:900,fontSize:17,cursor:'pointer',marginBottom:10}}>
          👥 Host Multiplayer
        </button>
        <div style={{display:'flex',gap:8}}>
          <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())}
            placeholder="ROOM CODE" maxLength={6}
            style={{flex:1,padding:'10px 14px',borderRadius:8,border:'1px solid #3730a3',
              background:'#0f0e2a',color:'white',fontFamily:'monospace',
              fontSize:16,letterSpacing:3,textTransform:'uppercase'}}/>
          <button onClick={joinGame}
            style={{padding:'10px 20px',borderRadius:8,border:'none',
              background:'#059669',color:'white',fontWeight:900,cursor:'pointer'}}>
            Join
          </button>
        </div>
      </div>
      <p style={{color:'#475569',fontSize:13,marginTop:20}}>
        WASD / Arrow keys to move • Space to shoot
      </p>
    </div>
  )

  if(screen==='over') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0d0d2b,#1a0a3e)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      fontFamily:'Nunito,sans-serif',color:'white'}}>
      <div style={{fontSize:72}}>💥</div>
      <h1 style={{fontSize:52,fontWeight:900,color:'#ef4444',margin:'8px 0'}}>Mission Failed</h1>
      <p style={{fontSize:28,color:'#fbbf24',margin:'8px 0'}}>Score: {finalScore}</p>
      {opponent&&<p style={{color:'#94a3b8'}}>{opponent.name}: {opponent.score}</p>}
      <div style={{display:'flex',gap:12,marginTop:24}}>
        <button onClick={startGame}
          style={{padding:'14px 32px',borderRadius:12,border:'none',
            background:'#7c3aed',color:'white',fontWeight:900,fontSize:18,cursor:'pointer'}}>
          Try Again
        </button>
        <button onClick={()=>setScreen('lobby')}
          style={{padding:'14px 32px',borderRadius:12,border:'2px solid #3730a3',
            background:'transparent',color:'white',fontWeight:900,fontSize:18,cursor:'pointer'}}>
          Menu
        </button>
      </div>
    </div>
  )

  return (
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',position:'relative',background:'#0d0d2b'}}>
      <canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}}/>

      {/* Opponent HUD */}
      {opponent&&(
        <div style={{position:'absolute',top:70,right:16,background:'rgba(0,0,0,0.7)',
          borderRadius:10,padding:'8px 14px',fontFamily:'Nunito,sans-serif',
          color:'white',fontSize:13,zIndex:10}}>
          <div style={{color:'#f87171',fontWeight:800}}>{opponent.name}</div>
          <div style={{width:100,height:6,background:'#374151',borderRadius:3,margin:'4px 0'}}>
            <div style={{width:`${opponent.health}%`,height:'100%',background:'#ef4444',borderRadius:3}}/>
          </div>
          <div style={{color:'#fbbf24'}}>⭐ {opponent.score}</div>
        </div>
      )}

      {/* Question overlay */}
      {showQ&&(
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.8)',
          display:'flex',alignItems:'center',justifyContent:'center',zIndex:20}}>
          <div style={{background:'#1e1b4b',borderRadius:24,padding:36,
            border:'2px solid #7c3aed',width:'100%',maxWidth:420,
            fontFamily:'Nunito,sans-serif',textAlign:'center',
            boxShadow:'0 0 40px rgba(124,58,237,0.5)'}}>
            <div style={{fontSize:13,color:'#94a3b8',marginBottom:6}}>🚀 Reload ammo — answer correctly!</div>
            {feedback?(
              <div style={{fontSize:32,fontWeight:900,padding:20,
                color:feedback.startsWith('✓')?'#22c55e':'#ef4444'}}>{feedback}</div>
            ):(
              <>
                <div style={{fontSize:42,fontWeight:900,color:'white',marginBottom:28,
                  textShadow:'0 0 20px rgba(167,139,250,0.8)'}}>
                  {question.q} = ?
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  {choices.map(c=>(
                    <button key={c} onClick={()=>answerQ(c)}
                      style={{padding:'18px',borderRadius:14,border:'2px solid #3730a3',
                        background:'#0f0e2a',color:'white',fontWeight:900,
                        fontSize:24,cursor:'pointer',transition:'all 0.15s'}}
                      onMouseEnter={e=>(e.currentTarget.style.background='#3730a3')}
                      onMouseLeave={e=>(e.currentTarget.style.background='#0f0e2a')}>
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}