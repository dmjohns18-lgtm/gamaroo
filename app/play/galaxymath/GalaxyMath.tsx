'use client'
import { useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const A = '/galaxymath/craftpix-896714-space-adventures-2d-game-kit/PNG'

const QUESTIONS: Record<number,{q:string,a:number}[]> = {
  3:[{q:'7×8',a:56},{q:'6×9',a:54},{q:'8×8',a:64},{q:'9×9',a:81},{q:'7×7',a:49},{q:'6×7',a:42},{q:'8×9',a:72},{q:'56÷7',a:8},{q:'54÷6',a:9},{q:'64÷8',a:8}],
  4:[{q:'23×4',a:92},{q:'15×6',a:90},{q:'12×8',a:96},{q:'11×11',a:121},{q:'144÷12',a:12},{q:'96÷8',a:12},{q:'25×4',a:100},{q:'13×7',a:91}],
  5:[{q:'125×4',a:500},{q:'256÷8',a:32},{q:'15×15',a:225},{q:'13×13',a:169},{q:'625÷25',a:25},{q:'24×12',a:288},{q:'17×8',a:136}],
}

function getRoomCode(){return Math.random().toString(36).substring(2,8).toUpperCase()}
function getQ(g:number){const p=QUESTIONS[g]||QUESTIONS[3];return p[Math.floor(Math.random()*p.length)]}
function makeChoices(a:number){const s=new Set([a]);while(s.size<4){const d=Math.floor(Math.random()*20)-10;if(d!==0)s.add(a+d)};return Array.from(s).sort(()=>Math.random()-0.5)}

let bid=0,eid=0,xid=0

interface Bullet{id:number,x:number,y:number,vx:number,vy:number,fromPlayer:boolean}
interface Enemy{id:number,x:number,y:number,vx:number,vy:number,frame:number,hp:number,shootTimer:number,angle:number}
interface Explosion{id:number,x:number,y:number,frame:number,timer:number}

interface GS{
  px:number,py:number,pvx:number,pvy:number,angle:number
  health:number,ammo:number,score:number,streak:number
  bullets:Bullet[],enemies:Enemy[],explosions:Explosion[]
  pFrame:number,fc:number,paused:boolean,gameOver:boolean,keys:Set<string>
}

export default function GalaxyMath(){
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const gs=useRef<GS>({
    px:400,py:300,pvx:0,pvy:0,angle:0,
    health:100,ammo:5,score:0,streak:0,
    bullets:[],enemies:[],explosions:[],
    pFrame:0,fc:0,paused:false,gameOver:false,keys:new Set()
  })
  const imgs=useRef<Record<string,HTMLImageElement>>({})
  const raf=useRef<number>()
  const showQRef=useRef(false)

  const [screen,setScreen]=useState<'lobby'|'game'|'over'>('lobby')
  const [grade,setGrade]=useState(3)
  const [playerName,setPlayerName]=useState('Player')
  const [mode,setMode]=useState<'solo'|'host'|'join'>('solo')
  const [roomCode,setRoomCode]=useState('')
  const [joinCode,setJoinCode]=useState('')
  const [showQ,setShowQ]=useState(false)
  const [question,setQuestion]=useState(getQ(3))
  const [choices,setChoices]=useState(makeChoices(56))
  const [feedback,setFeedback]=useState<string|null>(null)
  const [hud,setHud]=useState({health:100,ammo:5,score:0,streak:0})
  const [finalScore,setFinalScore]=useState(0)
  const [opponent,setOpponent]=useState<{name:string,health:number,score:number}|null>(null)
  const channelRef=useRef<any>(null)
  const gradeRef=useRef(3)

  useEffect(()=>{gradeRef.current=grade},[grade])

  useEffect(()=>{
    const load=(k:string,src:string)=>{const i=new Image();i.src=src;imgs.current[k]=i}
    for(let i=0;i<14;i++) load(`p${i}`,`${A}/Main Planes/Plane01/Idle and Moving/skeleton-MovingNIdle_${i}.png`)
    for(let i=0;i<26;i++) load(`e${i}`,`${A}/Enemy/Char01/Idle/skeleton-Idle_${i}.png`)
    for(let i=0;i<8;i++) load(`x${i}`,`${A}/Collision_Fx/skeleton-Colision_${i}.png`)
    load('bg',`${A}/Backgrounds/03/Layer1.png`)
    load('bg2',`${A}/Backgrounds/03/Layer2.png`)
    load('bg3',`${A}/Backgrounds/03/Layer3.png`)
    load('bullet',`${A}/Projectile/01.png`)
    load('pilot',`${A}/Pilot Icon/Pilot01.png`)
  },[])

  useEffect(()=>{
    if(screen!=='game') return
    const dn=(e:KeyboardEvent)=>{
      gs.current.keys.add(e.key)
      if(e.key===' '){e.preventDefault();doShoot()}
    }
    const up=(e:KeyboardEvent)=>gs.current.keys.delete(e.key)
    window.addEventListener('keydown',dn)
    window.addEventListener('keyup',up)
    return()=>{window.removeEventListener('keydown',dn);window.removeEventListener('keyup',up)}
  },[screen])

  function doShoot(){
    const s=gs.current
    if(s.ammo<=0||s.paused||s.gameOver||showQRef.current) return
    s.ammo=Math.max(0,s.ammo-1)
    const spd=14
    s.bullets.push({id:bid++,x:s.px,y:s.py,vx:Math.cos(s.angle)*spd,vy:Math.sin(s.angle)*spd,fromPlayer:true})
    setHud(h=>({...h,ammo:s.ammo}))
    if(s.ammo===0) triggerQ()
  }

  function triggerQ(){
    const s=gs.current
    s.paused=true
    showQRef.current=true
    const q=getQ(gradeRef.current)
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
      if(s.health<=0){endGame();return}
    }
    setHud({health:s.health,ammo:s.ammo,score:s.score,streak:s.streak})
    channelRef.current?.send({type:'broadcast',event:'update',payload:{health:s.health,score:s.score}})
    setTimeout(()=>{setFeedback(null);setShowQ(false);showQRef.current=false;s.paused=false},800)
  }

  function endGame(){
    gs.current.gameOver=true
    setFinalScore(gs.current.score)
    if(raf.current) cancelAnimationFrame(raf.current)
    setScreen('over')
  }

  useEffect(()=>{
    if(screen!=='game') return
    const canvas=canvasRef.current!
    const ctx=canvas.getContext('2d')!
    let lastSpawn=0

    function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight}
    resize()
    window.addEventListener('resize',resize)

    function loop(ts:number){
      const s=gs.current
      const im=imgs.current
      const W=canvas.width,H=canvas.height

      if(!s.paused&&!s.gameOver){
        s.fc++
        const keys=s.keys
        const spd=0.4
        const maxSpd=7

        // Movement -- ship rotates to face direction
        let moving=false
        if(keys.has('ArrowUp')||keys.has('w')){s.pvy-=spd;moving=true}
        if(keys.has('ArrowDown')||keys.has('s')){s.pvy+=spd;moving=true}
        if(keys.has('ArrowLeft')||keys.has('a')){s.pvx-=spd;moving=true}
        if(keys.has('ArrowRight')||keys.has('d')){s.pvx+=spd;moving=true}

        // Clamp speed
        const spd2=Math.sqrt(s.pvx*s.pvx+s.pvy*s.pvy)
        if(spd2>maxSpd){s.pvx=s.pvx/spd2*maxSpd;s.pvy=s.pvy/spd2*maxSpd}

        // Friction
        s.pvx*=0.92; s.pvy*=0.92

        // Update position -- wrap around edges
        s.px+=s.pvx; s.py+=s.pvy
        if(s.px<-50) s.px=W+50
        if(s.px>W+50) s.px=-50
        if(s.py<-50) s.py=H+50
        if(s.py>H+50) s.py=-50

        // Rotate ship to face movement direction
        if(moving&&spd2>0.5){
          const targetAngle=Math.atan2(s.pvy,s.pvx)
          let diff=targetAngle-s.angle
          while(diff>Math.PI) diff-=Math.PI*2
          while(diff<-Math.PI) diff+=Math.PI*2
          s.angle+=diff*0.15
        }

        s.pFrame=(s.pFrame+1)%14

        // Spawn enemies
        if(ts-lastSpawn>2000&&s.enemies.length<6){
          const side=Math.floor(Math.random()*4)
          let ex=0,ey=0
          if(side===0){ex=Math.random()*W;ey=-60}
          else if(side===1){ex=W+60;ey=Math.random()*H}
          else if(side===2){ex=Math.random()*W;ey=H+60}
          else{ex=-60;ey=Math.random()*H}
          const dx=s.px-ex,dy=s.py-ey
          const dist=Math.sqrt(dx*dx+dy*dy)
          const spd=1+Math.random()
          s.enemies.push({
            id:eid++,x:ex,y:ey,
            vx:dx/dist*spd,vy:dy/dist*spd,
            frame:0,hp:2,shootTimer:Math.random()*120+60,
            angle:Math.atan2(dy,dx)
          })
          lastSpawn=ts
        }

        // Update enemies -- track player
        s.enemies=s.enemies.filter(e=>{
          const dx=s.px-e.x,dy=s.py-e.y
          const dist=Math.sqrt(dx*dx+dy*dy)
          const spd=1.5
          e.vx=e.vx*0.95+(dx/dist*spd)*0.05
          e.vy=e.vy*0.95+(dy/dist*spd)*0.05
          e.x+=e.vx; e.y+=e.vy
          e.frame=(e.frame+1)%26
          e.angle=Math.atan2(dy,dx)
          e.shootTimer--

          // Enemy shoots at player
          if(e.shootTimer<=0){
            const spd2=5
            s.bullets.push({id:bid++,x:e.x,y:e.y,vx:dx/dist*spd2,vy:dy/dist*spd2,fromPlayer:false})
            e.shootTimer=Math.random()*180+90
          }

          // Enemy touches player
          if(dist<50){
            s.health=Math.max(0,s.health-15)
            s.explosions.push({id:xid++,x:e.x,y:e.y,frame:0,timer:0})
            setHud(h=>({...h,health:s.health}))
            if(s.health<=0) endGame()
            return false
          }
          return true
        })

        // Update bullets
        s.bullets=s.bullets.filter(b=>{
          b.x+=b.vx; b.y+=b.vy
          if(b.x<-20||b.x>W+20||b.y<-20||b.y>H+20) return false

          if(b.fromPlayer){
            const hit=s.enemies.findIndex(e=>Math.sqrt((b.x-e.x)**2+(b.y-e.y)**2)<50)
            if(hit!==-1){
              s.enemies[hit].hp--
              if(s.enemies[hit].hp<=0){
                s.explosions.push({id:xid++,x:s.enemies[hit].x,y:s.enemies[hit].y,frame:0,timer:0})
                s.score+=20
                setHud(h=>({...h,score:s.score}))
                s.enemies.splice(hit,1)
              }
              return false
            }
          } else {
            if(Math.sqrt((b.x-s.px)**2+(b.y-s.py)**2)<40){
              s.health=Math.max(0,s.health-8)
              setHud(h=>({...h,health:s.health}))
              if(s.health<=0) endGame()
              return false
            }
          }
          return true
        })

        // Update explosions
        s.explosions=s.explosions.filter(e=>{e.timer++;e.frame=Math.floor(e.timer/2);return e.frame<8})

        // Auto question every 20s
        if(s.fc%1200===0&&!showQRef.current) triggerQ()
      }

      // === DRAW ===
      ctx.clearRect(0,0,W,H)

      // Background
      const bg=im.bg
      if(bg?.complete&&bg.naturalWidth>0){
        ctx.drawImage(bg,0,0,W,H)
      } else {
        ctx.fillStyle='#080820';ctx.fillRect(0,0,W,H)
        ctx.fillStyle='rgba(255,255,255,0.7)'
        for(let i=0;i<100;i++) ctx.fillRect((i*137+23)%W,(i*97+11)%H,1.5,1.5)
      }

      // Parallax layers
      const bg2=im.bg2,bg3=im.bg3
      if(bg3?.complete&&bg3.naturalWidth>0){ctx.globalAlpha=0.4;ctx.drawImage(bg3,0,0,W,H);ctx.globalAlpha=1}
      if(bg2?.complete&&bg2.naturalWidth>0){ctx.globalAlpha=0.5;ctx.drawImage(bg2,0,0,W,H);ctx.globalAlpha=1}


      // Explosions
      s.explosions.forEach(e=>{
        const img=im[`x${Math.min(e.frame,7)}`]
        if(img?.complete&&img.naturalWidth>0) ctx.drawImage(img,e.x-50,e.y-50,100,100)
      })

      // Enemy bullets
      s.bullets.filter(b=>!b.fromPlayer).forEach(b=>{
        ctx.fillStyle='#ef4444'
        ctx.beginPath();ctx.arc(b.x,b.y,6,0,Math.PI*2);ctx.fill()
      })

      // Enemies -- rotate to face player
      s.enemies.forEach(e=>{
        const img=im[`e${e.frame%26}`]
        ctx.save()
        ctx.translate(e.x,e.y)
        ctx.rotate(e.angle)
        if(img?.complete&&img.naturalWidth>0){
          ctx.drawImage(img,-45,-35,90,70)
        } else {
          ctx.fillStyle='#8b5cf6'
          ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.fill()
        }
        ctx.restore()
      })

      // Player bullets
      s.bullets.filter(b=>b.fromPlayer).forEach(b=>{
        const img=im.bullet
        ctx.save()
        ctx.translate(b.x,b.y)
        ctx.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2)
        if(img?.complete&&img.naturalWidth>0){
          ctx.drawImage(img,-8,-20,16,32)
        } else {
          ctx.fillStyle='#fbbf24';ctx.fillRect(-3,-16,6,32)
        }
        ctx.restore()
      })

      // Engine trail
      ctx.save()
      ctx.translate(s.px,s.py)
      ctx.rotate(s.angle)
      const spd2=Math.sqrt(s.pvx*s.pvx+s.pvy*s.pvy)
      if(spd2>1){
        const grd=ctx.createRadialGradient(-40,0,2,-40,0,25)
        grd.addColorStop(0,'rgba(249,115,22,0.9)')
        grd.addColorStop(0.5,'rgba(239,68,68,0.5)')
        grd.addColorStop(1,'transparent')
        ctx.fillStyle=grd
        ctx.beginPath();ctx.arc(-40,0,25,0,Math.PI*2);ctx.fill()
      }
      ctx.restore()

      // Player ship -- rotates with movement
      ctx.save()
      ctx.translate(s.px,s.py)
      ctx.rotate(s.angle)
      const pimg=im[`p${s.pFrame}`]
      if(pimg?.complete&&pimg.naturalWidth>0){
        ctx.drawImage(pimg,-50,-35,100,70)
      } else {
        ctx.fillStyle='#818cf8'
        ctx.beginPath();ctx.moveTo(40,0);ctx.lineTo(-30,-20);ctx.lineTo(-30,20);ctx.closePath();ctx.fill()
      }
      ctx.restore()

      // HUD top bar
      ctx.fillStyle='rgba(0,0,0,0.7)'
      ctx.fillRect(0,0,W,60)

      // Pilot portrait circle
      const pilot=im.pilot
      if(pilot?.complete&&pilot.naturalWidth>0){
        ctx.save();ctx.beginPath();ctx.arc(36,30,22,0,Math.PI*2);ctx.clip()
        ctx.drawImage(pilot,14,8,44,44);ctx.restore()
        ctx.strokeStyle='#fbbf24';ctx.lineWidth=2
        ctx.beginPath();ctx.arc(36,30,22,0,Math.PI*2);ctx.stroke()
      }

      // HP bar
      ctx.fillStyle='#1f2937';ctx.fillRect(68,14,180,18)
      ctx.fillStyle=s.health>50?'#22c55e':s.health>25?'#f59e0b':'#ef4444'
      ctx.fillRect(68,14,s.health*1.8,18)
      ctx.strokeStyle='#374151';ctx.lineWidth=1;ctx.strokeRect(68,14,180,18)
      ctx.fillStyle='white';ctx.font='bold 11px Nunito,sans-serif'
      ctx.fillText(`${s.health}%`,74,27)

      // Ammo dots
      for(let i=0;i<10;i++){
        ctx.fillStyle=i<s.ammo?'#a78bfa':'#1f2937'
        ctx.beginPath();ctx.arc(72+i*16,44,6,0,Math.PI*2);ctx.fill()
      }

      // Score center
      ctx.fillStyle='#fbbf24';ctx.font='bold 20px Nunito,sans-serif'
      ctx.textAlign='center';ctx.fillText(`⭐ ${s.score}`,W/2,36)
      if(s.streak>=3){ctx.fillStyle='#f97316';ctx.font='bold 14px Nunito,sans-serif';ctx.fillText(`🔥 ${s.streak} streak`,W/2,54)}

      // Room code
      if(mode!=='solo'&&roomCode){
        ctx.fillStyle='#94a3b8';ctx.font='12px monospace';ctx.textAlign='right'
        ctx.fillText(`Room: ${roomCode}`,W-12,36)
      }

      // Controls hint
      ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='11px sans-serif';ctx.textAlign='left'
      ctx.fillText('WASD to fly • Space to shoot',12,H-10)

      ctx.textAlign='left'
      if(!s.gameOver) raf.current=requestAnimationFrame(loop)
    }

    raf.current=requestAnimationFrame(loop)
    return()=>{if(raf.current) cancelAnimationFrame(raf.current);window.removeEventListener('resize',resize)}
  },[screen,mode,roomCode])

  function startGame(){
    const s=gs.current
    const W=window.innerWidth,H=window.innerHeight
    s.px=W/2;s.py=H/2;s.pvx=0;s.pvy=0;s.angle=0
    s.health=100;s.ammo=5;s.score=0;s.streak=0
    s.bullets=[];s.enemies=[];s.explosions=[]
    s.pFrame=0;s.fc=0;s.paused=false;s.gameOver=false;s.keys=new Set()
    showQRef.current=false
    setHud({health:100,ammo:5,score:0,streak:0})
    setShowQ(false);setFeedback(null)
    const q=getQ(grade);setQuestion(q);setChoices(makeChoices(q.a))
    setScreen('game')
  }

  async function hostGame(){
    const sb=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const code=getRoomCode();setRoomCode(code);setMode('host')
    const ch=sb.channel(`galaxy-${code}`)
    channelRef.current=ch
    ch.on('broadcast',{event:'join'},({payload})=>setOpponent({name:payload.name,health:100,score:0}))
      .on('broadcast',{event:'update'},({payload})=>setOpponent(o=>o?{...o,...payload}:o))
      .subscribe()
    startGame()
  }

  async function joinGame(){
    const sb=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    setMode('join')
    const ch=sb.channel(`galaxy-${joinCode}`)
    channelRef.current=ch
    ch.on('broadcast',{event:'update'},({payload})=>setOpponent(o=>o?{...o,...payload}:o))
      .subscribe(()=>{
        ch.send({type:'broadcast',event:'join',payload:{name:playerName}})
        setOpponent({name:'Host',health:100,score:0})
        setRoomCode(joinCode)
        startGame()
      })
  }

  if(screen==='lobby') return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#080820,#1a0a3e)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      fontFamily:'Nunito,sans-serif',color:'white',padding:24}}>
      <div style={{fontSize:72,marginBottom:8}}>🚀</div>
      <h1 style={{fontSize:44,fontWeight:900,color:'#a78bfa',margin:'0 0 4px'}}>Galaxy Math</h1>
      <p style={{color:'#94a3b8',marginBottom:32,textAlign:'center',maxWidth:400}}>
        Fly freely through space. Shoot aliens. Answer math to reload your ammo!
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
              background:'#0f0e2a',color:'white',fontFamily:'monospace',fontSize:16,letterSpacing:3}}/>
          <button onClick={joinGame}
            style={{padding:'10px 20px',borderRadius:8,border:'none',
              background:'#059669',color:'white',fontWeight:900,cursor:'pointer'}}>
            Join
          </button>
        </div>
      </div>
      <p style={{color:'#475569',fontSize:13,marginTop:20}}>WASD to fly • Space to shoot</p>
    </div>
  )

  if(screen==='over') return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#080820,#1a0a3e)',
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

  return(
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',position:'relative',background:'#080820'}}>
      <canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}}/>

      {opponent&&(
        <div style={{position:'absolute',top:70,right:16,background:'rgba(0,0,0,0.7)',
          borderRadius:10,padding:'8px 14px',fontFamily:'Nunito,sans-serif',color:'white',fontSize:13,zIndex:10}}>
          <div style={{color:'#f87171',fontWeight:800}}>{opponent.name}</div>
          <div style={{width:100,height:6,background:'#374151',borderRadius:3,margin:'4px 0'}}>
            <div style={{width:`${opponent.health}%`,height:'100%',background:'#ef4444',borderRadius:3}}/>
          </div>
          <div style={{color:'#fbbf24'}}>⭐ {opponent.score}</div>
        </div>
      )}

      {showQ&&(
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.82)',
          display:'flex',alignItems:'center',justifyContent:'center',zIndex:20}}>
          <div style={{background:'#1e1b4b',borderRadius:24,padding:36,border:'2px solid #7c3aed',
            width:'100%',maxWidth:420,fontFamily:'Nunito,sans-serif',textAlign:'center',
            boxShadow:'0 0 60px rgba(124,58,237,0.6)'}}>
            <div style={{fontSize:13,color:'#94a3b8',marginBottom:8}}>🚀 Ammo depleted — answer to reload!</div>
            {feedback?(
              <div style={{fontSize:32,fontWeight:900,padding:24,
                color:feedback.startsWith('✓')?'#22c55e':'#ef4444'}}>{feedback}</div>
            ):(
              <>
                <div style={{fontSize:44,fontWeight:900,color:'white',marginBottom:28,
                  textShadow:'0 0 20px rgba(167,139,250,0.8)'}}>
                  {question.q} = ?
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  {choices.map(c=>(
                    <button key={c} onClick={()=>answerQ(c)}
                      style={{padding:'18px',borderRadius:14,border:'2px solid #3730a3',
                        background:'#0f0e2a',color:'white',fontWeight:900,fontSize:24,cursor:'pointer'}}
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