'use client';

import { useEffect, useRef } from 'react';
import { generateZone1, generateZone2, generateZone3 } from './questions';

export default function MathQuest() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;

    const loadPhaser = async () => {
      const mod = await import('phaser');
      const Phaser = mod.default ?? mod;
      const state = { lives: 3, coins: 0, zone: 1 };

      class BootScene extends Phaser.Scene {
        constructor() { super('Boot'); }
        preload() {
          this.load.image('bg1', '/mathquest/bg/BG_Layer (1).png');
          this.load.image('bg5', '/mathquest/bg/BG_Layer (5).png');
          this.load.image('bg7', '/mathquest/bg/BG_Layer (7).png');
          this.load.image('bg9', '/mathquest/bg/BG_Layer (9).png');
          this.load.image('chest',     '/mathquest/chest/Chest.png');
          this.load.image('chestOpen', '/mathquest/chest/Chest_Open_Full.png');
          this.load.image('coin',      '/mathquest/misc/Coin_1.png');
          this.load.image('spike',     '/mathquest/hazards/Spikes (2).png');
          this.load.image('tree',      '/mathquest/decor/Tree (1).png');
          this.load.image('rock',      '/mathquest/decor/Rock (2).png');
        }
        create() {
          const g = this.make.graphics({ x:0, y:0, add:false });
          g.fillStyle(0xC8860A); g.fillEllipse(20,26,28,32); g.fillEllipse(20,8,20,18);
          g.fillTriangle(12,2,8,-8,16,-2); g.fillTriangle(28,2,32,-8,24,-2);
          g.fillStyle(0xFFCC00); g.fillRect(10,18,20,14);
          g.fillStyle(0x333333); g.fillCircle(15,8,3); g.fillCircle(25,8,3);
          g.fillStyle(0xFFFFFF); g.fillCircle(14,7,1.5); g.fillCircle(24,7,1.5);
          g.fillStyle(0xC8860A); g.fillEllipse(6,36,10,18); g.fillRect(13,36,7,10); g.fillRect(22,36,7,10);
          g.generateTexture('roo',40,50); g.destroy();
          const h = this.make.graphics({ x:0, y:0, add:false });
          h.fillStyle(0xFF4444); h.fillCircle(8,6,6); h.fillCircle(18,6,6); h.fillTriangle(2,8,26,8,13,22);
          h.generateTexture('heart',26,22); h.destroy();
          this.scene.start('Menu', { state });
        }
      }

      class MenuScene extends Phaser.Scene {
        constructor() { super('Menu'); }
        create(data: any) {
          const W = this.scale.width, H = this.scale.height;
          this.add.rectangle(W/2,H/2,W,H,0x87CEEB);
          try { this.add.image(W/2,H/2,'bg5').setDisplaySize(W,H).setAlpha(0.5); } catch(e){}
          this.add.rectangle(W/2,H-20,W,40,0x5B8A3C);
          this.add.rectangle(W/2,H-6,W,12,0x8B5E3C);
          try { this.add.image(100,H-70,'tree').setDisplaySize(70,90); this.add.image(W-100,H-70,'tree').setDisplaySize(70,90); } catch(e){}
          this.add.text(W/2,70,"ROO'S MATH QUEST",{ fontFamily:'Nunito,Arial',fontSize:'34px',color:'#1A3A6B',stroke:'#FFFFFF',strokeThickness:6,fontStyle:'bold' }).setOrigin(0.5);
          this.add.text(W/2,115,'4th Grade Math Adventure',{ fontFamily:'Nunito,Arial',fontSize:'17px',color:'#FFFFFF',stroke:'#1A3A6B',strokeThickness:4 }).setOrigin(0.5);
          try { this.add.image(W/2,H/2-10,'roo').setDisplaySize(80,100); } catch(e){}
          const zoneNames=['Zone 1: Multiplication','Zone 2: Division','Zone 3: Fractions'];
          zoneNames.forEach((name,i)=>{
            const done=data.state.zone>i+1, cur=data.state.zone===i+1;
            const col=done?'#2ECC71':cur?'#FFD700':'#888888';
            const pre=done?'✓ ':cur?'▶ ':'🔒 ';
            this.add.text(W/2,H/2+50+i*36,pre+name,{ fontFamily:'Nunito,Arial',fontSize:'19px',color:col,stroke:'#000',strokeThickness:3 }).setOrigin(0.5);
          });
          const btn=this.add.rectangle(W/2,H-90,210,52,0x1A3A6B).setStrokeStyle(3,0xFFD700).setInteractive({useHandCursor:true});
          this.add.text(W/2,H-90,data.state.zone===1?'START QUEST!':'ENTER ZONE '+data.state.zone,{ fontFamily:'Nunito,Arial',fontSize:'21px',color:'#FFD700',fontStyle:'bold' }).setOrigin(0.5);
          btn.on('pointerover',()=>btn.setFillColor(0x2A5A9B));
          btn.on('pointerout', ()=>btn.setFillColor(0x1A3A6B));
          btn.on('pointerdown',()=>this.scene.start('Game',{state:data.state}));
        }
      }

      class GameScene extends Phaser.Scene {
        private player: any; private platforms: any; private coins: any;
        private chests: any; private hazards: any; private cursors: any;
        private wasd: any; private coinsText: any; private hearts: any[]=[];
        private state: any; private questions: any[]=[];
        private overlayObjects: any[]=[]; private overlayActive=false;
        private worldWidth=3200;
        private touchLeft=false; private touchRight=false; private touchJump=false;

        constructor() { super('Game'); }

        create(data:any) {
          this.state=data.state;
          const H=this.scale.height, W=this.scale.width;
          this.worldWidth=3200;
          this.touchLeft=false; this.touchRight=false; this.touchJump=false;
          this.overlayActive=false; this.overlayObjects=[]; this.hearts=[];

          if(this.state.zone===1) this.questions=generateZone1();
          else if(this.state.zone===2) this.questions=generateZone2();
          else this.questions=generateZone3();

          this.physics.world.setBounds(0,0,this.worldWidth,H);
          this.cameras.main.setBounds(0,0,this.worldWidth,H);
          this.add.rectangle(this.worldWidth/2,H/2,this.worldWidth,H,0x87CEEB).setDepth(-10);

          const bgKeys=['bg1','bg5','bg7','bg9'];
          const bgScrolls=[0.05,0.1,0.18,0.25];
          bgKeys.forEach((k,i)=>{
            try { this.add.tileSprite(0,0,this.worldWidth,H,k).setOrigin(0,0).setScrollFactor(bgScrolls[i]).setDisplaySize(W,H).setAlpha(0.65-i*0.05); } catch(e){}
          });

          this.platforms=this.physics.add.staticGroup();
          this.coins=this.physics.add.staticGroup();
          this.chests=this.physics.add.staticGroup();
          this.hazards=this.physics.add.staticGroup();
          this.buildLevel(H);

          this.player=this.physics.add.sprite(100,H-160,'roo').setDisplaySize(40,50).setCollideWorldBounds(true).setDepth(5);
          this.physics.add.collider(this.player,this.platforms);
          this.physics.add.overlap(this.player,this.coins,(_:any,coin:any)=>{ coin.destroy(); this.state.coins++; this.updateHUD(); });
          this.physics.add.overlap(this.player,this.chests,(_:any,chest:any)=>{ if(!chest.getData('solved')&&!this.overlayActive) this.showMath(chest); });
          this.physics.add.overlap(this.player,this.hazards,()=>{ if(!this.player.getData('inv')&&!this.overlayActive) this.loseLife(); });

          this.cameras.main.startFollow(this.player,true,0.1,0.1);
          this.cursors=this.input.keyboard!.createCursorKeys();
          this.wasd=this.input.keyboard!.addKeys({ up:Phaser.Input.Keyboard.KeyCodes.W, left:Phaser.Input.Keyboard.KeyCodes.A, right:Phaser.Input.Keyboard.KeyCodes.D, space:Phaser.Input.Keyboard.KeyCodes.SPACE });
          this.buildTouchControls(W,H);
          this.buildHUD(W);

          const zoneNames=['','Zone 1: Multiplication','Zone 2: Division','Zone 3: Fractions'];
          const banner=this.add.text(W/2,55,zoneNames[this.state.zone],{ fontFamily:'Nunito,Arial',fontSize:'21px',color:'#FFD700',stroke:'#1A3A6B',strokeThickness:5,fontStyle:'bold' }).setScrollFactor(0).setDepth(20).setOrigin(0.5);
          this.tweens.add({targets:banner,alpha:0,delay:2500,duration:800});
        }

        buildLevel(H:number) {
          const gY=H-40;
          const ground=this.add.rectangle(this.worldWidth/2,gY,this.worldWidth,28,0x5B8A3C);
          this.physics.add.existing(ground,true); this.platforms.add(ground);
          this.add.rectangle(this.worldWidth/2,H-14,this.worldWidth,28,0x8B5E3C).setDepth(-1);

          const plats=[
            {x:350,y:H-160,w:180},{x:600,y:H-230,w:140},{x:850,y:H-165,w:180},
            {x:1100,y:H-255,w:160},{x:1350,y:H-185,w:200},{x:1600,y:H-265,w:140},
            {x:1820,y:H-195,w:180},{x:2050,y:H-245,w:160},{x:2300,y:H-175,w:200},
            {x:2550,y:H-265,w:140},{x:2780,y:H-195,w:180},{x:3000,y:H-225,w:160},
          ];
          plats.forEach(p=>{
            const top=this.add.rectangle(p.x,p.y,p.w,18,0x6AAF45);
            this.physics.add.existing(top,true); this.platforms.add(top);
            this.add.rectangle(p.x,p.y+16,p.w,20,0x8B5E3C).setDepth(-1);
          });

          const coinSpots=[
            {x:350,y:H-200},{x:400,y:H-200},{x:450,y:H-200},{x:600,y:H-270},{x:650,y:H-270},
            {x:850,y:H-205},{x:900,y:H-205},{x:200,y:H-100},{x:250,y:H-100},{x:300,y:H-100},
            {x:1100,y:H-295},{x:1150,y:H-295},{x:1350,y:H-225},{x:1400,y:H-225},{x:1450,y:H-225},
            {x:1600,y:H-305},{x:1650,y:H-305},{x:1820,y:H-235},{x:1870,y:H-235},
            {x:2050,y:H-285},{x:2100,y:H-285},{x:2300,y:H-215},{x:2350,y:H-215},{x:2400,y:H-215},
            {x:2550,y:H-305},{x:2600,y:H-305},{x:2780,y:H-235},{x:2830,y:H-235},
            {x:3000,y:H-265},{x:3050,y:H-265},
          ];
          coinSpots.forEach(c=>{
            const coin=this.coins.create(c.x,c.y,'coin').setDisplaySize(26,26);
            this.tweens.add({targets:coin,y:c.y-8,duration:800+Math.random()*400,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
          });

          const chestSpots=[{x:850,y:H-198},{x:1820,y:H-228},{x:3050,y:gY-30}];
          chestSpots.forEach((c,i)=>{
            const chest=this.chests.create(c.x,c.y,'chest').setDisplaySize(52,44).setDepth(4);
            chest.setData('solved',false); chest.setData('index',i);
            this.tweens.add({targets:chest,alpha:0.7,duration:900,yoyo:true,repeat:-1});
          });

          const hazardSpots=[470,720,980,1230,1500,1750,2000,2200,2450,2700,2950];
          hazardSpots.forEach(x=>{ this.hazards.create(x,gY-16,'spike').setDisplaySize(40,32).setDepth(3); });

          const treeXs=[150,500,750,1000,1250,1500,1750,2000,2250,2500,2750,3000];
          treeXs.forEach(x=>{ try{this.add.image(x,gY-55,'tree').setDisplaySize(70,90).setDepth(1);}catch(e){} });
          const rockXs=[200,680,1050,1420,1680,2350,2620,2900];
          rockXs.forEach(x=>{ try{this.add.image(x,gY-18,'rock').setDisplaySize(36,28).setDepth(2);}catch(e){} });

          this.add.rectangle(3150,gY-80,6,160,0x888888).setDepth(3);
          this.add.rectangle(3165,gY-148,30,24,0xFF4444).setDepth(3);
          this.add.text(3150,gY-175,'🏁',{fontSize:'28px'}).setOrigin(0.5).setDepth(4);
        }

        buildTouchControls(W:number,H:number) {
          const s=64,m=16,y=H-m-s/2;
          const mk=(x:number,y:number,lbl:string,col:number,dn:()=>void,up:()=>void)=>{
            const b=this.add.rectangle(x,y,s,s,col,0.55).setScrollFactor(0).setDepth(30).setInteractive();
            this.add.text(x,y,lbl,{fontSize:'26px',color:'#fff'}).setScrollFactor(0).setDepth(31).setOrigin(0.5);
            b.on('pointerdown',dn); b.on('pointerup',up); b.on('pointerout',up);
          };
          mk(m+s/2,y,'◀',0x000000,()=>{this.touchLeft=true;},()=>{this.touchLeft=false;});
          mk(m*2+s*1.5,y,'▶',0x000000,()=>{this.touchRight=true;},()=>{this.touchRight=false;});
          mk(W-m-s/2,y,'▲',0x1A3A6B,()=>{this.touchJump=true;},()=>{this.touchJump=false;});
        }

        buildHUD(W:number) {
          this.add.rectangle(W/2,22,W,44,0x000000,0.5).setScrollFactor(0).setDepth(20);
          for(let i=0;i<3;i++){
            const h=this.add.image(20+i*30,22,'heart').setDisplaySize(22,18).setScrollFactor(0).setDepth(21);
            this.hearts.push(h);
          }
          try{this.add.image(W/2-40,22,'coin').setDisplaySize(22,22).setScrollFactor(0).setDepth(21);}catch(e){}
          this.coinsText=this.add.text(W/2-20,22,`${this.state.coins}`,{ fontFamily:'Nunito,Arial',fontSize:'18px',color:'#FFD700',fontStyle:'bold' }).setScrollFactor(0).setDepth(21).setOrigin(0,0.5);
          this.add.text(W-16,22,`Zone ${this.state.zone}/3`,{ fontFamily:'Nunito,Arial',fontSize:'16px',color:'#FFFFFF' }).setScrollFactor(0).setDepth(21).setOrigin(1,0.5);
        }

        updateHUD() {
          this.coinsText.setText(`${this.state.coins}`);
          this.hearts.forEach((h,i)=>h.setAlpha(i<this.state.lives?1:0.2));
        }

        loseLife() {
          if(this.player.getData('inv')) return;
          this.state.lives--; this.updateHUD();
          this.player.setData('inv',true);
          this.cameras.main.shake(300,0.012);
          this.tweens.add({targets:this.player,alpha:0.2,duration:120,yoyo:true,repeat:6,
            onComplete:()=>{this.player.setAlpha(1);this.player.setData('inv',false);}});
          if(this.state.lives<=0){
            this.time.delayedCall(700,()=>{this.state.lives=3;this.scene.restart({state:this.state});});
          } else {
            this.player.setPosition(100,this.scale.height-160);
          }
        }

        showMath(chest:any) {
          this.overlayActive=true;
          this.overlayObjects=[];
          const W=this.scale.width, H=this.scale.height;
          const q=this.questions[chest.getData('index')%this.questions.length];

          const add=(obj:any)=>{ this.overlayObjects.push(obj); return obj; };

          // background dim
          add(this.add.rectangle(W/2,H/2,W,H,0x000000,0.72).setScrollFactor(0).setDepth(60));
          // panel
          add(this.add.rectangle(W/2,H/2,460,310,0x1A3A6B,0.97).setStrokeStyle(4,0xFFD700).setScrollFactor(0).setDepth(61));
          // chest icon
          try{ add(this.add.image(W/2,H/2-115,'chest').setDisplaySize(50,42).setScrollFactor(0).setDepth(62)); }catch(e){}
          // question
          add(this.add.text(W/2,H/2-65,q.q,{ fontFamily:'Nunito,Arial',fontSize:'24px',color:'#FFFFFF',fontStyle:'bold',align:'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(62));
          add(this.add.text(W/2,H/2-28,'Choose the correct answer:',{ fontFamily:'Nunito,Arial',fontSize:'14px',color:'#AACCFF' }).setOrigin(0.5).setScrollFactor(0).setDepth(62));

          const shuffled=[...q.choices].sort(()=>Math.random()-0.5);
          shuffled.forEach((choice:any,i:number)=>{
            const bx=W/2+(i%2===0?-115:115);
            const by=H/2+(i<2?28:85);

            const btn=this.add.rectangle(bx,by,205,48,0x2A5A9B)
              .setStrokeStyle(2,0xFFFFFF)
              .setScrollFactor(0)
              .setDepth(63)
              .setInteractive({useHandCursor:true});

            const lbl=this.add.text(bx,by,String(choice),{
              fontFamily:'Nunito,Arial',fontSize:'20px',color:'#FFFFFF',fontStyle:'bold'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(64);

            add(btn); add(lbl);

            btn.on('pointerdown',()=>console.log('BTN CLICKED', String(choice)));
            btn.on('pointerover',()=>btn.setFillColor(0x3A6ABB));
            btn.on('pointerout', ()=>btn.setFillColor(0x2A5A9B));
            btn.on('pointerdown',()=>{
              const correct=String(choice)===String(q.a);
              btn.setFillColor(correct?0x2ECC71:0xE74C3C);
              // disable all buttons immediately
              shuffled.forEach((_:any,j:number)=>{
                const b=this.overlayObjects.find((o:any,idx:number)=>idx===8+j*2);
                if(b&&b.disableInteractive) b.disableInteractive();
              });
              if(correct){
                this.solveChest(chest);
                this.time.delayedCall(800,()=>this.clearOverlay());
              } else {
                this.time.delayedCall(700,()=>{ this.clearOverlay(); this.loseLife(); });
              }
            });
          });
        }

        clearOverlay() {
          this.overlayObjects.forEach((o:any)=>{ try{ o.destroy(); }catch(e){} });
          this.overlayObjects=[];
          this.overlayActive=false;
        }

        solveChest(chest:any) {
          chest.setData('solved',true); chest.setTexture('chestOpen');
          this.tweens.killTweensOf(chest); chest.setAlpha(1);
          for(let i=0;i<5;i++){
            try{
              const cx=this.add.image(chest.x,chest.y,'coin').setDisplaySize(20,20).setDepth(6);
              this.tweens.add({targets:cx,x:chest.x+Phaser.Math.Between(-60,60),y:chest.y-Phaser.Math.Between(40,100),alpha:0,duration:700,ease:'Power2',onComplete:()=>cx.destroy()});
              this.state.coins+=5;
            }catch(e){}
          }
          this.updateHUD();
          const solved=this.chests.getChildren().filter((c:any)=>c.getData('solved'));
          if(solved.length>=3) this.time.delayedCall(1000,()=>this.completeZone());
        }

        completeZone() {
          const W=this.scale.width,H=this.scale.height;
          const objs:any[]=[];
          const add=(o:any)=>{ objs.push(o); return o; };
          add(this.add.rectangle(W/2,H/2,W,H,0x000000,0.78).setScrollFactor(0).setDepth(70));
          add(this.add.rectangle(W/2,H/2,420,290,0x1A3A6B).setStrokeStyle(4,0xFFD700).setScrollFactor(0).setDepth(71));
          add(this.add.text(W/2,H/2-95,'ZONE COMPLETE!',{ fontFamily:'Nunito,Arial',fontSize:'32px',color:'#FFD700',fontStyle:'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(72));
          add(this.add.text(W/2,H/2-48,`Coins collected: ${this.state.coins}`,{ fontFamily:'Nunito,Arial',fontSize:'20px',color:'#FFFFFF' }).setOrigin(0.5).setScrollFactor(0).setDepth(72));
          const isLast=this.state.zone>=3;
          add(this.add.text(W/2,H/2-8,isLast?'Quest complete! Amazing work!':'Get ready for Zone '+(this.state.zone+1)+'!',{ fontFamily:'Nunito,Arial',fontSize:'18px',color:'#AAFFAA' }).setOrigin(0.5).setScrollFactor(0).setDepth(72));
          const nBtn=this.add.rectangle(W/2,H/2+75,220,54,0x2ECC71).setStrokeStyle(3,0xFFFFFF).setScrollFactor(0).setDepth(72).setInteractive({useHandCursor:true});
          add(nBtn);
          add(this.add.text(W/2,H/2+75,isLast?'FINISH QUEST':'NEXT ZONE',{ fontFamily:'Nunito,Arial',fontSize:'22px',color:'#FFFFFF',fontStyle:'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(73));
          nBtn.on('pointerdown',()=>{ this.state.zone=isLast?1:this.state.zone+1; this.state.lives=3; this.scene.start('Menu',{state:this.state}); });
        }

        update() {
          if(!this.player||this.overlayActive) return;
          const onGround=this.player.body.blocked.down;
          const goLeft=this.cursors.left.isDown||this.wasd.left.isDown||this.touchLeft;
          const goRight=this.cursors.right.isDown||this.wasd.right.isDown||this.touchRight;
          const doJump=(Phaser.Input.Keyboard.JustDown(this.cursors.up)||Phaser.Input.Keyboard.JustDown(this.wasd.up)||Phaser.Input.Keyboard.JustDown(this.wasd.space)||Phaser.Input.Keyboard.JustDown(this.cursors.space)||this.touchJump)&&onGround;
          if(goLeft){this.player.setVelocityX(-220);this.player.setFlipX(true);}
          else if(goRight){this.player.setVelocityX(220);this.player.setFlipX(false);}
          else{this.player.setVelocityX(0);}
          if(doJump){this.player.setVelocityY(-480);this.touchJump=false;}
        }
      }

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: containerRef.current!.offsetWidth||800,
        height: 520,
        parent: containerRef.current!,
        backgroundColor: '#87CEEB',
        physics:{default:'arcade',arcade:{gravity:{x:0,y:600},debug:false}},
        scene:[BootScene,MenuScene,GameScene],
      });
    };

    loadPhaser();
    return ()=>{gameRef.current?.destroy(true);gameRef.current=null;};
  },[]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div ref={containerRef} className="w-full max-w-4xl" style={{height:'520px',borderRadius:'12px',overflow:'hidden'}}/>
      <p className="text-gray-400 text-sm mt-3">Arrow keys or WASD to move · Space/W to jump · Touch buttons on tablet</p>
    </div>
  );
}
