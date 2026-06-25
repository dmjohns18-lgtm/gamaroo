'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

const WW = 3200
const WH = 600
// Tilemap: 360x162px, 18px tiles = 20 cols x 9 rows
// Frame index = row * 20 + col
// Row 0: grass top (0=left, 1=mid, 2=right), col 3+ = other stuff
// Row 1: dirt top (20=left, 21=mid, 22=right)
// Row 2: dirt mid (40=left, 41=mid, 42=right)
// Row 3: dirt dark (60=left, 61=mid, 62=right)
// Row 4: snow top (80=left, 81=mid, 82=right)
// Col 16-19 Row 0-3: green tree/bush tiles (16,17,18,19,36,37,38,39,56,57,58,59)
const TS = 36 // tile display size (18px * 2x scale)

const PLAYER_SPEED = 220
const JUMP_VEL = -480
const GRAVITY = 650
const STANDARDS: Record<number,string> = {3:'3.MD.C.6',4:'4.MD.A.3',5:'5.NF.B.4b'}

interface PlacedBrick { id:number; worldX:number; worldY:number; color:string; brickType:string; sprite?:any }
interface MathChallenge { question:string; answer:number; choices:number[]; icon:string; title:string }

export default function BrickBlitz() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const phaserRef = useRef<any>(null)
  const sceneRef = useRef<any>(null)
  const playerRef = useRef<any>(null)
  const playerLabelRef = useRef<any>(null)
  const trollRef = useRef<any>(null)
  const trollLabelRef = useRef<any>(null)
  const cursorsRef = useRef<any>(null)
  const wasdRef = useRef<any>(null)
  const bricksRef = useRef<PlacedBrick[]>([])
  const nextIdRef = useRef(0)
  const phaseRef = useRef('build')
  const selectedColorRef = useRef('Red')
  const selectedTypeRef = useRef('brick_medium_1')
  const eraseModeRef = useRef(false)
  const timeLeftRef = useRef(35)
  const winsRef = useRef(0)
  const gradeRef = useRef(4)
  const targetAreaRef = useRef(10)
  const targetPerimRef = useRef(0)
  const timerFillRef = useRef<any>(null)
  const timerEventRef = useRef<any>(null)
  const startSecsRef = useRef(35)
  const waveRef = useRef(1)
  const hoverGfxRef = useRef<any>(null)

  const [grade, setGradeState] = useState(4)
  const [screen, setScreen] = useState<'select'|'game'>('select')
  const [selectedColor, setSelectedColorState] = useState('Red')
  const [selectedType, setSelectedTypeState] = useState('brick_medium_1')
  const [eraseMode, setEraseModeState] = useState(false)
  const [phase, setPhase] = useState('build')
  const [timeLeft, setTimeLeft] = useState(35)
  const [brickCount, setBrickCount] = useState(0)
  const [wins, setWins] = useState(0)
  const [stars, setStars] = useState(0)
  const [targetArea, setTargetArea] = useState(10)
  const [targetPerim, setTargetPerim] = useState(0)
  const [challenge, setChallenge] = useState<MathChallenge|null>(null)
  const [challengeQueue, setChallengeQueue] = useState<MathChallenge[]>([])
  const [challengeIdx, setChallengeIdx] = useState(0)
  const [feedback, setFeedback] = useState<string|null>(null)
  const [result, setResult] = useState<{won:boolean;area:number;perim:number}|null>(null)
  const [wave, setWave] = useState(1)

  const setGrade = (g:number) => { gradeRef.current=g; setGradeState(g) }
  const setSelectedColor = (c:string) => { selectedColorRef.current=c; setSelectedColorState(c) }
  const setSelectedType = (t:string) => { selectedTypeRef.current=t; setSelectedTypeState(t) }
  const setEraseMode = (e:boolean) => { eraseModeRef.current=e; setEraseModeState(e) }

  const genOptions = (correct:number) => {
    const set = new Set([correct]); let t=0
    while(set.size<4&&t++<300){const v=correct+Math.floor(Math.random()*12)-5;if(v>0&&v!==correct)set.add(v)}
    while(set.size<4)set.add(correct+set.size*3)
    const arr=[...set]
    for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}
    return arr
  }

  const getBounds = useCallback(() => {
    const bs=bricksRef.current; if(!bs.length)return null
    const cols=bs.map(b=>Math.round(b.worldX/TS)), rows=bs.map(b=>Math.round(b.worldY/TS))
    return{w:Math.max(...cols)-Math.min(...cols)+1,h:Math.max(...rows)-Math.min(...rows)+1}
  },[])

  const generateTarget = useCallback((g:number,w:number) => {
    const area=4+w*2+Math.floor(Math.random()*4)
    const pw=Math.floor(Math.random()*3)+3,ph=Math.ceil(area/pw)
    const perim=g>=4?2*(pw+ph):0
    targetAreaRef.current=area;targetPerimRef.current=perim;setTargetArea(area);setTargetPerim(perim)
  },[])

  const buildChallenges = useCallback((g:number) => {
    const area=bricksRef.current.length,bounds=getBounds()
    const perim=bounds?2*(bounds.w+bounds.h):0
    const q:MathChallenge[]=[]
    if(g===3)q.push({icon:'📐',title:'Math Challenge!',question:`Your wall covers <b>${area}</b> squares.<br/>What is the <b>area</b>?`,answer:area,choices:genOptions(area)})
    else if(g===4){
      q.push({icon:'📐',title:'Math Challenge!',question:`Your wall covers <b>${area}</b> squares.<br/>What is the <b>area</b>?`,answer:area,choices:genOptions(area)})
      if(bounds)q.push({icon:'📏',title:'One More!',question:`Your wall is <b>${bounds.w}</b> wide × <b>${bounds.h}</b> tall.<br/>What is the <b>perimeter</b>?`,answer:perim,choices:genOptions(perim)})
    }else q.push({icon:'🔢',title:'Math Challenge!',question:`Your wall has <b>${area}</b> bricks.<br/>If half are destroyed, how many remain?`,answer:Math.floor(area/2),choices:genOptions(Math.floor(area/2))})
    return q
  },[getBounds])

  const launchTroll = useCallback(() => {
    const scene=sceneRef.current,troll=trollRef.current; if(!scene||!troll)return
    phaseRef.current='marching'; setPhase('marching')
    if(timerEventRef.current)timerEventRef.current.remove()
    const targetX=Math.max(200,(playerRef.current?.x||600)-120)
    const speed=Math.max(800,2200-waveRef.current*150)
    scene.tweens.add({
      targets:troll,x:targetX,duration:speed,ease:'Linear',
      onUpdate:()=>{troll.y=WH-150+Math.sin(troll.x*0.05)*10;if(trollLabelRef.current)trollLabelRef.current.setPosition(troll.x,troll.y-75)},
      onComplete:()=>{
        scene.cameras.main.shake(280,0.016)
        if(bricksRef.current.length===0){phaseRef.current='result';setPhase('result');setResult({won:false,area:0,perim:0});return}
        const queue=buildChallenges(gradeRef.current)
        setChallengeQueue(queue);setChallengeIdx(0);setChallenge(queue[0])
        phaseRef.current='challenge';setPhase('challenge')
      }
    })
  },[buildChallenges])

  const startNextWave = useCallback(() => {
    const scene=sceneRef.current; if(!scene)return
    phaseRef.current='build';setPhase('build');setResult(null);setChallenge(null)
    const secs=Math.max(12,35-waveRef.current*3)
    startSecsRef.current=secs;timeLeftRef.current=secs;setTimeLeft(secs)
    generateTarget(gradeRef.current,waveRef.current)
    if(trollRef.current)trollRef.current.setPosition(-200,WH-150)
    if(trollLabelRef.current)trollLabelRef.current.setPosition(-200,WH-230)
    if(timerEventRef.current)timerEventRef.current.remove()
    timerEventRef.current=scene.time.addEvent({
      delay:1000,repeat:secs-1,
      callback:()=>{if(phaseRef.current!=='build')return;timeLeftRef.current--;setTimeLeft(timeLeftRef.current);if(timeLeftRef.current<=0)launchTroll()}
    })
  },[generateTarget,launchTroll])

  const handleAnswer = useCallback((val:number,ch:MathChallenge,idx:number,queue:MathChallenge[]) => {
    if(val===ch.answer){
      setFeedback('✅ Correct!')
      setTimeout(()=>{
        setFeedback(null)
        const next=idx+1
        if(next<queue.length){setChallengeIdx(next);setChallenge(queue[next])}
        else{
          setChallenge(null)
          const area=bricksRef.current.length,bounds=getBounds(),perim=bounds?2*(bounds.w+bounds.h):0
          setWins(w=>w+1);setStars(s=>s+1);winsRef.current++
          phaseRef.current='result';setPhase('result');setResult({won:true,area,perim})
          const scene=sceneRef.current
          if(trollRef.current&&scene)scene.tweens.add({targets:trollRef.current,x:-300,duration:900})
          bricksRef.current.forEach((b,i)=>{if(b.sprite&&scene)scene.time.delayedCall(i*15,()=>scene.tweens.add({targets:b.sprite,y:b.sprite.y-12,yoyo:true,duration:160}))})
          waveRef.current++;setWave(w=>w+1)
        }
      },700)
    }else{
      setFeedback('❌ Wrong!')
      setTimeout(()=>{
        setFeedback(null);setChallenge(null)
        const area=bricksRef.current.length,bounds=getBounds(),perim=bounds?2*(bounds.w+bounds.h):0
        phaseRef.current='result';setPhase('result');setResult({won:false,area,perim})
        const scene=sceneRef.current
        if(trollRef.current&&scene)scene.tweens.add({
          targets:trollRef.current,x:WW+200,duration:600,ease:'Power3',
          onComplete:()=>{
            scene.cameras.main.shake(500,0.025)
            bricksRef.current.forEach(b=>{if(b.sprite&&trollRef.current&&Math.abs(b.worldX-trollRef.current.x)<320)scene.tweens.add({targets:b.sprite,x:b.sprite.x+(Math.random()-0.5)*120,y:b.sprite.y+Math.random()*100,angle:(Math.random()-0.5)*80,alpha:0.3,duration:450})})
          }
        })
      },900)
    }
  },[getBounds])

  useEffect(()=>{
    if(screen!=='game')return
    const initPhaser=async()=>{
      const Phaser=(await import('phaser')).default
      if(!gameContainerRef.current||phaserRef.current)return
      const container=document.createElement('div')
      container.style.cssText='position:absolute;inset:0;'
      gameContainerRef.current.appendChild(container)
      generateTarget(gradeRef.current,1)

      class GameScene extends Phaser.Scene {
        private platformGroup!:Phaser.Physics.Arcade.StaticGroup

        constructor(){super('GameScene')}

        preload(){
          this.load.spritesheet('tiles','/pixelplatformer/Tilemap/tilemap_packed.png',{frameWidth:18,frameHeight:18})
          this.load.spritesheet('bgtiles','/pixelplatformer/Tilemap/tilemap-backgrounds_packed.png',{frameWidth:24,frameHeight:24})
          // Load Kenney character sprites
          for(let i=0;i<=4;i++) this.load.image('char_'+i,'/pixelplatformer/Tiles/Characters/tile_000'+i+'.png')
          const colors=['Red','Blue','Green','Yellow','Black','White']
          const types=['brick_medium_1','brick_medium_2','brick_high_1','brick_low_1','brick_medium_slope_left_2','brick_medium_slope_right_2']
          colors.forEach(c=>types.forEach(t=>this.load.image(`${c}_${t}`,`/bricks/Default/${c}/${t}.png`)))
        }

        create(){
          sceneRef.current=this
          this.physics.world.setBounds(0,0,WW,WH)
          this.drawBackground()
          this.platformGroup=this.physics.add.staticGroup()
          this.buildWorld()
          hoverGfxRef.current=this.add.graphics().setDepth(6)

          // Player — use pixel art rectangle character
          const player=this.physics.add.sprite(200,WH-TS*4,'char_0')
            .setDepth(8).setCollideWorldBounds(true).setScale(2.5)
          this.physics.add.collider(player,this.platformGroup)
          playerRef.current=player

          const lbl=this.add.text(200,WH-260,'🏗️ You',{fontSize:'13px',color:'#fff',stroke:'#000',strokeThickness:4,fontFamily:'Fredoka One'}).setOrigin(0.5).setDepth(9)
          playerLabelRef.current=lbl

          // Troll
          const troll=this.add.text(-200,WH-150,'🧌',{fontSize:'88px'}).setDepth(7).setScale(-1,1).setOrigin(0.5)
          trollRef.current=troll
          const tlbl=this.add.text(-200,WH-235,'👿 TROLL',{fontSize:'13px',color:'#ff4444',stroke:'#000',strokeThickness:4,fontFamily:'Fredoka One'}).setOrigin(0.5).setDepth(9)
          trollLabelRef.current=tlbl

          this.cameras.main.setBounds(0,0,WW,WH)
          this.cameras.main.startFollow(player,true,0.08,0.08)
          this.cameras.main.setZoom(0.8)

          cursorsRef.current=this.input.keyboard?.createCursorKeys()
          wasdRef.current=this.input.keyboard?.addKeys('W,A,S,D,SPACE')

          this.input.on('pointermove',(ptr:any)=>{
            if(phaseRef.current!=='build')return
            const hgfx=hoverGfxRef.current;if(!hgfx)return
            hgfx.clear()
            const col=Math.floor(ptr.worldX/TS),row=Math.floor(ptr.worldY/TS)
            const sx=col*TS,sy=row*TS
            const exists=bricksRef.current.some(b=>Math.abs(b.worldX-sx)<2&&Math.abs(b.worldY-sy)<2)
            const col2=eraseModeRef.current||exists?0xff4444:0xffd700
            hgfx.fillStyle(col2,0.28);hgfx.fillRect(sx+1,sy+1,TS-2,TS-2)
            hgfx.lineStyle(2,col2,0.9);hgfx.strokeRect(sx+1,sy+1,TS-2,TS-2)
          })

          this.input.on('pointerdown',(ptr:any)=>{
            if(phaseRef.current!=='build')return
            const col=Math.floor(ptr.worldX/TS),row=Math.floor(ptr.worldY/TS)
            const sx=col*TS,sy=row*TS
            const existing=bricksRef.current.find(b=>Math.abs(b.worldX-sx)<2&&Math.abs(b.worldY-sy)<2)
            if(eraseModeRef.current||existing){if(existing){existing.sprite?.destroy();bricksRef.current=bricksRef.current.filter(b=>b.id!==existing.id);setBrickCount(bricksRef.current.length)}return}
            const key=`${selectedColorRef.current}_${selectedTypeRef.current}`
            const sprite=this.add.image(sx+TS/2,sy+TS/2,key).setDisplaySize(TS,TS).setDepth(5).setAlpha(0)
            this.tweens.add({targets:sprite,alpha:1,duration:140,ease:'Back.Out'})
            const id=nextIdRef.current++
            bricksRef.current.push({id,worldX:sx,worldY:sy,color:selectedColorRef.current,brickType:selectedTypeRef.current,sprite})
            setBrickCount(bricksRef.current.length)
          })

          const secs=35;startSecsRef.current=secs;timeLeftRef.current=secs;setTimeLeft(secs)
          timerEventRef.current=this.time.addEvent({
            delay:1000,repeat:secs-1,
            callback:()=>{if(phaseRef.current!=='build')return;timeLeftRef.current--;setTimeLeft(timeLeftRef.current);if(timeLeftRef.current<=0)launchTroll()}
          })
          timerFillRef.current=this.add.graphics().setScrollFactor(0).setDepth(20)
        }

        drawBackground(){
          // Sky
          const sky=this.add.graphics().setDepth(-3)
          sky.fillGradientStyle(0x56b4e9,0x56b4e9,0x9ecae1,0x9ecae1,1)
          sky.fillRect(0,0,WW,WH)

          // Background tiles — bgtiles is 192x72, 18px tiles = 10 cols x 4 rows
          // Frame 0-9: row 0 (sky detail)
          // Frame 10-19: row 1 (far hills)
          // Frame 20-29: row 2 (mid trees)
          // Frame 30-39: row 3 (near decor)
          const bgTS=18*5 // 90px per bg tile displayed
          const bgCols=Math.ceil(WW/bgTS)+2

          // Far hills layer — row 1, frames 8-15
          for(let c=0;c<bgCols;c++){
            const frame=8+(c%8)
            this.add.image(c*bgTS,WH*0.6,'bgtiles',frame)
              .setOrigin(0,1).setDisplaySize(bgTS,bgTS*0.9)
              .setAlpha(0.45).setDepth(-2).setScrollFactor(0.15)
          }

          // Mid tree layer — row 2, frames 16-23
          for(let c=0;c<bgCols;c++){
            const frame=16+(c%8)
            this.add.image(c*bgTS,WH*0.78,'bgtiles',frame)
              .setOrigin(0,1).setDisplaySize(bgTS,bgTS)
              .setAlpha(0.6).setDepth(-1).setScrollFactor(0.35)
          }

          // Sun
          const sun=this.add.graphics().setDepth(-2).setScrollFactor(0.05)
          sun.fillStyle(0xFFF9C4,1);sun.fillCircle(2700,85,52)
          sun.fillStyle(0xFFF176,0.3);sun.fillCircle(2700,85,72)

          // Clouds
          const clouds=[{x:100,y:65,w:155,h:48,sf:0.12},{x:420,y:42,w:115,h:36,sf:0.18},{x:730,y:72,w:175,h:54,sf:0.15},{x:1050,y:50,w:135,h:42,sf:0.2},{x:1360,y:68,w:150,h:46,sf:0.14},{x:1680,y:38,w:120,h:38,sf:0.19},{x:1980,y:72,w:160,h:50,sf:0.16},{x:2290,y:48,w:105,h:33,sf:0.21},{x:2580,y:62,w:145,h:44,sf:0.13},{x:2870,y:44,w:128,h:39,sf:0.17}]
          for(let i=0;i<clouds.length;i++){
            const c=clouds[i]
            const cg=this.add.graphics()
            cg.setDepth(-1)
            cg.setScrollFactor(c.sf)
            cg.fillStyle(0xffffff,0.9)
            cg.fillRoundedRect(c.x,c.y,c.w,c.h,18)
            cg.fillCircle(c.x+28,c.y+5,26)
            cg.fillCircle(c.x+c.w-26,c.y+7,20)
            cg.fillCircle(c.x+c.w/2,c.y-8,22)
          }
        }

        buildWorld(){
          // Tile frames (20 cols x 9 rows, frame = row*20+col):
          // Grass top row: 0=left,1=mid,2=right
          // Dirt top:     20=left,21=mid,22=right
          // Dirt mid:     40=left,41=mid,42=right
          // Dirt deep:    60=left,61=mid,62=right
          // Green trees right side col 16-19:
          //   Row 0: 16,17,18,19 (tree tops)
          //   Row 1: 36,37,38,39
          //   Row 2: 56,57,58,59
          // Small trees col 4-5 rows 4-5: around frame 84,85,104,105
          // Cactus ~frame 101, mushroom ~frame 111, sign ~frame 87

          const groundY=WH-TS
          const worldCols=Math.ceil(WW/TS)

          // Ground
          for(let c=0;c<worldCols;c++){
            const x=c*TS+TS/2
            const isL=c===0,isR=c===worldCols-1
            const gi=isL?0:isR?2:1
            // Grass top
            this.add.image(x,groundY-TS/2,'tiles',gi).setDisplaySize(TS,TS).setDepth(2)
            // Dirt layers
            this.add.image(x,groundY+TS/2,'tiles',isL?20:isR?22:21).setDisplaySize(TS,TS).setDepth(2)
            this.add.image(x,groundY+TS*1.5,'tiles',isL?40:isR?42:41).setDisplaySize(TS,TS).setDepth(2)
            this.add.image(x,groundY+TS*2.5,'tiles',isL?60:isR?62:61).setDisplaySize(TS,TS).setDepth(2)
            // Collider - sits on top surface of ground tile
            const body=this.add.rectangle(x,groundY-TS/2,TS,8).setVisible(false)
            this.physics.add.existing(body,true)
            this.platformGroup.add(body as any)
          }

          // Platforms
          const plats=[
            {wx:320,wy:WH-TS*4,w:5},{wx:590,wy:WH-TS*5,w:4},{wx:850,wy:WH-TS*3,w:6},
            {wx:1080,wy:WH-TS*6,w:5},{wx:1360,wy:WH-TS*4,w:4},{wx:1580,wy:WH-TS*3,w:7},
            {wx:1860,wy:WH-TS*5,w:5},{wx:2080,wy:WH-TS*4,w:6},{wx:2340,wy:WH-TS*5,w:4},
            {wx:2580,wy:WH-TS*4,w:5},{wx:2840,wy:WH-TS*3,w:6},
          ]
          plats.forEach(p=>{
            for(let i=0;i<p.w;i++){
              const x=p.wx+i*TS+TS/2
              const isL=i===0,isR=i===p.w-1
              const gi=isL?0:isR?2:1
              this.add.image(x,p.wy,'tiles',gi).setDisplaySize(TS,TS).setDepth(2)
              this.add.image(x,p.wy+TS,'tiles',isL?20:isR?22:21).setDisplaySize(TS,TS).setDepth(2)
              const body=this.add.rectangle(x,p.wy,TS,8).setVisible(false)
              this.physics.add.existing(body,true)
              this.platformGroup.add(body as any)
            }
          })

          // Trees using actual Kenney tree tiles
          // Big tree: top=frame 17 (green top-mid), trunks=frame 97,117
          const groundSurface=WH-TS*2
          const treeXs=[480,760,1180,1700,2150,2650]
          treeXs.forEach(tx=>{
            // Leaves (use green tile col 17-18, rows 0-2)
            this.add.image(tx,groundSurface-TS*2.5,'tiles',17).setDisplaySize(TS*2,TS*2).setDepth(3)
            this.add.image(tx-TS*0.5,groundSurface-TS*1.8,'tiles',16).setDisplaySize(TS*1.4,TS*1.4).setDepth(3)
            this.add.image(tx+TS*0.5,groundSurface-TS*1.8,'tiles',18).setDisplaySize(TS*1.4,TS*1.4).setDepth(3)
            this.add.image(tx,groundSurface-TS*1.2,'tiles',37).setDisplaySize(TS*1.2,TS*1.2).setDepth(3)
            // Trunk
            this.add.image(tx,groundSurface-TS*0.4,'tiles',97).setDisplaySize(TS*0.7,TS).setDepth(3)
          })

          // Small decorations — use actual tile frames visible in tilemap
          // Cactus area: col 5 row 5 = frame 5*20+5=105... let's use small tree frame 84
          const decoXs=[400,720,1280,1820,2260,2720]
          decoXs.forEach((dx,i)=>{
            const frame=i%2===0?84:104 // alternating small trees/bushes
            this.add.image(dx,groundSurface+TS*0.1,'tiles',frame).setDisplaySize(TS*0.9,TS*0.9).setDepth(3)
          })

          // Chests/signs for flavor — frame 51 (chest), frame 87 (sign)
          const propXs=[940,1640,2320]
          propXs.forEach((px,i)=>{
            this.add.image(px,groundSurface+TS*0.1,'tiles',i%2===0?51:87).setDisplaySize(TS*0.9,TS*0.9).setDepth(3)
          })
        }

        update(){
          const player=playerRef.current,cursors=cursorsRef.current,wasd=wasdRef.current
          if(!player||!cursors)return
          const onGround=(player.body as any)?.blocked?.down
          let vx=0
          if(cursors.left.isDown||wasd?.A?.isDown){vx=-PLAYER_SPEED;player.setFlipX(true)}
          else if(cursors.right.isDown||wasd?.D?.isDown){vx=PLAYER_SPEED;player.setFlipX(false)}
          player.setVelocityX(vx)
          if((cursors.up.isDown||wasd?.W?.isDown||wasd?.SPACE?.isDown)&&onGround)player.setVelocityY(JUMP_VEL)
          if(playerLabelRef.current)playerLabelRef.current.setPosition(player.x,player.y-55)
          if(timerFillRef.current&&phaseRef.current==='build'){
            const pct=timeLeftRef.current/startSecsRef.current,bw=300
            timerFillRef.current.clear()
            timerFillRef.current.fillStyle(pct>0.5?0x4caf50:pct>0.25?0xff9800:0xf44336,1)
            timerFillRef.current.fillRoundedRect(window.innerWidth/2-bw/2,54,bw*pct,8,4)
          }
        }
      }

      phaserRef.current=new Phaser.Game({
        type:Phaser.AUTO,width:window.innerWidth,height:window.innerHeight,
        parent:container,backgroundColor:'#56b4e9',pixelArt:true,
        physics:{default:'arcade',arcade:{gravity:{x:0,y:GRAVITY},debug:false}},
        scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
        scene:GameScene,
      })
    }
    initPhaser()
    return()=>{if(phaserRef.current){phaserRef.current.destroy(true);phaserRef.current=null};bricksRef.current=[];sceneRef.current=null;playerRef.current=null}
  },[screen,generateTarget,launchTroll])

  const COLORS=[{name:'Red',bg:'#e74c3c'},{name:'Blue',bg:'#3498db'},{name:'Green',bg:'#2ecc71'},{name:'Yellow',bg:'#f1c40f'},{name:'Black',bg:'#444'},{name:'White',bg:'#ecf0f1'}]
  const BRICKS=[{type:'brick_medium_1',label:'Medium'},{type:'brick_medium_2',label:'Wide'},{type:'brick_high_1',label:'Tall'},{type:'brick_low_1',label:'Flat'},{type:'brick_medium_slope_left_2',label:'/ Slope'},{type:'brick_medium_slope_right_2',label:'\\ Slope'}]

  if(screen==='select')return(
    <div style={{width:'100vw',height:'100vh',background:'linear-gradient(180deg,#56b4e9 0%,#9ecae1 42%,#58d68d 42%,#27ae60 54%,#7d5a30 54%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Fredoka One, cursive',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:28,left:80,fontSize:38}}>☁️</div>
      <div style={{position:'absolute',top:14,right:110,fontSize:28}}>☁️</div>
      <div style={{position:'absolute',top:22,right:310,fontSize:42}}>☀️</div>
      <div style={{background:'rgba(14,22,46,0.94)',border:'3px solid rgba(255,215,0,0.32)',borderRadius:24,padding:'36px 52px',textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
        <div style={{fontSize:54,marginBottom:6}}>🧱</div>
        <div style={{fontSize:42,color:'#ffd700',marginBottom:8}}>Brick Blitz</div>
        <div style={{fontSize:14,color:'#90b8d8',marginBottom:32,lineHeight:1.6}}>Explore the world · Build your defense · Survive the troll!</div>
        <div style={{fontSize:13,color:'#7aa0cc',marginBottom:12}}>Select grade:</div>
        <div style={{display:'flex',gap:12,marginBottom:28,justifyContent:'center'}}>
          {[3,4,5].map(g=>(
            <button key={g} onClick={()=>setGrade(g)} style={{background:grade===g?'#1a4a1a':'#0d1a0d',border:`2px solid ${grade===g?'#4caf50':'#2a4a2a'}`,borderRadius:12,padding:'14px 28px',color:grade===g?'#fff':'#5a9a5a',fontSize:20,cursor:'pointer',fontFamily:'Fredoka One'}}>
              Grade {g}
            </button>
          ))}
        </div>
        <div style={{fontSize:12,color:'#3a6a5a',marginBottom:20}}>{STANDARDS[grade]}</div>
        <button onClick={()=>setScreen('game')} style={{background:'linear-gradient(135deg,#e94560,#c23152)',color:'white',fontSize:22,padding:'16px 52px',border:'none',borderRadius:16,cursor:'pointer',fontFamily:'Fredoka One',boxShadow:'0 5px 0 #8b1e33'}}>
          Play! ➜
        </button>
        <div style={{marginTop:20,fontSize:11,color:'#2a4a6a',lineHeight:2.2}}>
          WASD / Arrows to move · Space/W to jump<br/>Click anywhere to place bricks · Build before troll arrives!
        </div>
      </div>
    </div>
  )

  return(
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',position:'relative'}}>
      <div ref={gameContainerRef} style={{position:'absolute',inset:0}}/>
      <div style={{position:'absolute',top:0,left:0,right:0,display:'flex',alignItems:'center',gap:8,padding:'7px 14px',background:'rgba(0,0,0,0.7)',borderBottom:'2px solid rgba(255,215,0,0.2)',zIndex:10,fontFamily:'Fredoka One, cursive',flexWrap:'wrap'}}>
        <div style={{fontSize:17,color:'#ffd700'}}>🧱 Brick Blitz</div>
        <div style={{fontSize:12,color:'#ffd700',background:'rgba(255,215,0,0.1)',border:'1px solid rgba(255,215,0,0.3)',borderRadius:6,padding:'2px 9px'}}>Wave {wave}</div>
        <div style={{fontSize:12,color:'white',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:6,padding:'2px 9px'}}>⭐ {stars} | 🏆 {wins}</div>
        <div style={{fontSize:12,color:'white',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:6,padding:'2px 9px'}}>🧱 {brickCount}</div>
        {phase==='build'&&<>
          <div style={{fontSize:13,color:timeLeft<=8?'#ff5555':'#ffaa44',fontWeight:700}}>🧌 {timeLeft}s</div>
          <div style={{background:'rgba(76,175,80,0.18)',border:'1px solid #4caf50',borderRadius:6,padding:'2px 9px',fontSize:12,color:'#90ee90'}}>🎯 Area:{targetArea}{grade>=4&&targetPerim>0?` Perim:${targetPerim}`:''}</div>
        </>}
        {phase==='marching'&&<div style={{fontSize:13,color:'#ff4444',animation:'pulse 0.5s infinite alternate'}}>🚨 Troll incoming!</div>}
        <div style={{marginLeft:'auto'}}>
          <button onClick={launchTroll} disabled={phase!=='build'} style={{background:'#e94560',color:'white',border:'none',borderRadius:8,padding:'5px 13px',fontSize:12,cursor:'pointer',fontFamily:'Fredoka One',opacity:phase!=='build'?0.4:1}}>⚔️ Face Troll!</button>
        </div>
      </div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(10,18,40,0.97)',borderTop:'2px solid rgba(255,215,0,0.2)',padding:'7px 14px',zIndex:10,fontFamily:'Fredoka One, cursive'}}>
        <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
          <span style={{fontSize:11,color:'#7aa0cc'}}>Color:</span>
          {COLORS.map(c=>(
            <div key={c.name} onClick={()=>setSelectedColor(c.name)} style={{width:19,height:19,borderRadius:'50%',background:c.bg,border:selectedColor===c.name?'2px solid white':'2px solid transparent',cursor:'pointer',transform:selectedColor===c.name?'scale(1.25)':'scale(1)',transition:'all 0.1s',flexShrink:0}}/>
          ))}
          <div style={{width:1,height:26,background:'rgba(255,255,255,0.12)',margin:'0 3px'}}/>
          {BRICKS.map(b=>(
            <div key={b.type} onClick={()=>{setSelectedType(b.type);setEraseMode(false)}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'4px 7px',border:selectedType===b.type&&!eraseMode?'2px solid #ffd700':'2px solid transparent',borderRadius:8,cursor:'pointer',background:selectedType===b.type&&!eraseMode?'rgba(255,215,0,0.1)':'rgba(255,255,255,0.03)',transition:'all 0.1s'}}>
              <img src={`/bricks/Default/${selectedColor}/${b.type}.png`} alt={b.label} style={{height:24,width:'auto',imageRendering:'pixelated',pointerEvents:'none'}}/>
              <span style={{fontSize:9,color:'#7aa0cc'}}>{b.label}</span>
            </div>
          ))}
          <div style={{width:1,height:26,background:'rgba(255,255,255,0.12)',margin:'0 3px'}}/>
          <button onClick={()=>setEraseMode(!eraseMode)} style={{background:eraseMode?'#8b2222':'#1a0808',border:eraseMode?'2px solid #ff4444':'2px solid #4a1a1a',color:eraseMode?'white':'#ff8888',fontSize:11,padding:'4px 10px',borderRadius:8,cursor:'pointer',fontFamily:'Fredoka One'}}>🗑 Erase</button>
        </div>
      </div>
      {challenge&&(
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.82)',zIndex:30,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#16213e',border:'3px solid #ffd700',borderRadius:20,padding:'28px 32px',maxWidth:400,width:'90%',textAlign:'center',boxShadow:'0 0 40px rgba(255,215,0,0.2)',fontFamily:'Fredoka One, cursive'}}>
            <div style={{fontSize:44,marginBottom:6}}>{challenge.icon}</div>
            <div style={{fontSize:13,color:'#ffd700',letterSpacing:2,textTransform:'uppercase',marginBottom:8}}>{challenge.title}</div>
            <div style={{fontSize:19,color:'white',marginBottom:20,lineHeight:1.5}} dangerouslySetInnerHTML={{__html:challenge.question}}/>
            {feedback?<div style={{fontSize:28,color:feedback.startsWith('✅')?'#4caf50':'#f44336',padding:16}}>{feedback}</div>:(
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {challenge.choices.map((val,i)=>(
                  <button key={i} onClick={()=>handleAnswer(val,challenge,challengeIdx,challengeQueue)} style={{background:'#0f3460',border:'2px solid #1a4a8a',color:'white',fontSize:26,padding:14,borderRadius:12,cursor:'pointer',fontFamily:'Fredoka One'}}>{val}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {result&&!challenge&&(
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.82)',zIndex:30,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#16213e',border:'3px solid rgba(255,215,0,0.4)',borderRadius:24,padding:'36px 48px',maxWidth:420,textAlign:'center',fontFamily:'Fredoka One, cursive'}}>
            <div style={{fontSize:72,marginBottom:10}}>{result.won?'🎉':result.area===0?'😬':'💥'}</div>
            <div style={{fontSize:34,color:'#ffd700',marginBottom:10}}>{result.won?`Wave ${wave-1} Done!`:result.area===0?'No Defense!':'Troll Got Through!'}</div>
            <div style={{fontSize:15,color:'#aaa',marginBottom:10,lineHeight:1.6}}>
              {result.won?`Area: ${result.area} sq units${grade>=4?` | Perimeter: ${result.perim} units`:''}`:result.area===0?'Place bricks before facing the troll!':'Wrong answer — troll smashed through!'}
            </div>
            <div style={{fontSize:13,color:result.won?'#90ee90':'#ffaa44',marginBottom:24}}>
              {result.won?'Your bricks stay — keep building for the next wave!':'Remaining bricks still there — reinforce and try again!'}
            </div>
            <button onClick={startNextWave} style={{background:result.won?'#1a5c1a':'#e94560',color:'white',fontSize:20,padding:'14px 44px',border:'none',borderRadius:14,cursor:'pointer',fontFamily:'Fredoka One',boxShadow:`0 4px 0 ${result.won?'#0d3a0d':'#8b1e33'}`}}>
              {result.won?`Wave ${wave} — Go! ➜`:'Try Again ➜'}
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse{from{opacity:1}to{opacity:0.3}}`}</style>
    </div>
  )
}
