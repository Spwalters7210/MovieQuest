import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ROOMS } from '../common/rooms.js';
import { ENCOUNTERS } from '../common/encounters.js';
import { newProfile, applyChoice, recommend, explain } from '../common/recommender.js';

const W=1280,H=840,SPEED=240,RANGE=105;
const REQUIRED_LEADS=['casefile','witness','footprints','journal'];
export class GameScene extends Phaser.Scene {
 constructor(){super({key:SCENE_KEYS.GAME_SCENE});}
 create(){
  this.profile=newProfile();this.completed=new Set();this.mode='explore';this.active=null;
  this.room='square';this.ui=[];this.world=[];this.hud=[];this.player=null;this.toastTimer=null;
  // Independent HUD camera: world scrolling and zoom never move interface text.
  this.hudCamera=this.cameras.add(0,0,this.scale.width,this.scale.height);
  this.scale.on('resize',this.resizeCameras,this);

  this.cursors=this.input.keyboard.createCursorKeys();
  this.keys=this.input.keyboard.addKeys('W,A,S,D,E,J,ESC,ONE,TWO,R');
  this.input.keyboard.on('keydown-E',()=>this.interact());
  this.input.keyboard.on('keydown-J',()=>this.toggleNotebook());
  this.input.keyboard.on('keydown-ESC',()=>{if(this.mode==='notebook')this.closeNotebook();});
  this.input.keyboard.on('keydown-ONE',()=>this.choose(0));
  this.input.keyboard.on('keydown-TWO',()=>this.choose(1));
  this.input.keyboard.on('keydown-R',()=>{if(this.mode==='results')this.scene.restart();});
  this.drawRoom('square');
  this.notify('New case: investigate Fog Harbor. Press J to open your case journal.',4800);
 }
 addWorld(o){this.world.push(o);if(this.hudCamera)this.hudCamera.ignore(o);return o;}
 addHud(o){this.hud.push(o);this.cameras.main.ignore(o);return o;}
 addOverlay(o){this.ui.push(o);this.cameras.main.ignore(o);return o;}
 hudLabel(x,y,t,size=18,color='#e8e8e8'){
  return this.addHud(this.add.text(x,y,t,{fontFamily:'monospace',fontSize:`${size}px`,color,align:'center'}).setOrigin(.5).setDepth(100));
 }
 resizeCameras(){this.configureCameras();}
 configureCameras(){
  if(!this.player)return;
  const w=this.scale.width,h=this.scale.height;
  // The HUD uses its own camera. Reserve its top and bottom bars OUTSIDE
  // the world camera's viewport so the player can never render beneath text.
  const hudZoom=Math.min(1,w/W,h/H);
  const hudOffsetY=(h-H*hudZoom)/2;
  const worldTop=Math.max(0,Math.round(hudOffsetY+70*hudZoom));
  const worldBottom=Math.min(h,Math.round(hudOffsetY+774*hudZoom));
  const playHeight=Math.max(1,worldBottom-worldTop);
  this.cameras.main.setViewport(0,worldTop,w,playHeight);
  this.hudCamera.setViewport(0,0,w,h);
  // The square is 960x640 Tiled pixels; don't expose areas beyond its edges.
  const b=this.room==='square'&&this.squareBounds
   ? this.squareBounds : {left:70,top:62,right:1210,bottom:670};
  const worldW=b.right-b.left,worldH=b.bottom-b.top;
  const minimum=Math.max(w/worldW,playHeight/worldH);
  // At common desktop sizes, 2x zoom makes 16px tiles look like 32px tiles.
  const zoom=Math.max(2,minimum);
  this.cameras.main.setZoom(zoom);
  this.cameras.main.setBounds(b.left,b.top,worldW,worldH);
  this.cameras.main.startFollow(this.player,true,0.14,0.14);
  this.cameras.main.centerOn(this.player.x,this.player.y);
  // Scale only the HUD, never the Tiled world. Keep overlays readable on laptops.
  this.hudCamera.setZoom(hudZoom);
  this.hudCamera.centerOn(W/2,H/2);
 }

 clearWorld(){this.world.forEach(o=>o.destroy());this.world=[];}
 rect(x,y,w,h,c){return this.addWorld(this.add.rectangle(x,y,w,h,c));}
 label(x,y,t,size=18,color='#e8e8e8'){return this.addWorld(this.add.text(x,y,t,{fontFamily:'monospace',fontSize:`${size}px`,color,align:'center'}).setOrigin(.5));}
 drawRoom(key,spawn){
  this.clearWorld();this.hud.forEach(o=>o.destroy());this.hud=[];this.room=key;const r=ROOMS[key];this.mode='explore';
  if(this.toastTimer){this.toastTimer.remove(false);this.toastTimer=null;}
  this.addWorld(this.add.rectangle(640,H/2,W,H,0x101820));
  if(key!=='square'){this.rect(640,367,1140,610,r.floor);this.rect(640,86,1140,44,r.trim);}
  if(key==='square')this.drawFogHarborTilemap();
  // Floor tiles, giving the room depth without external paid assets.
  if(key!=='square')for(let x=100;x<1200;x+=64)for(let y=135;y<625;y+=64){
   const g=this.add.graphics();g.lineStyle(1,0xffffff,.07);g.strokeRect(x,y,64,64);this.addWorld(g);
  }
  this.addHud(this.add.rectangle(640,35,1280,70,0x101820,0.86).setDepth(99));
  this.hudLabel(640,36,r.title,29,'#e9d9b5');
  for(const p of r.props){
   if(key==='square' && (p.kind==='fountain'||p.kind==='lamp'))continue;
   this.drawProp(p);
  }
  for(const d of r.doors){
   if(key==='square' && (d.to==='station'||d.to==='office'))continue;
   this.rect(d.x,d.y,100,28,0x1d2029);this.rect(d.x,d.y,80,12,0xd5b06c);
   this.label(d.x,d.y+32,d.label,14,'#fff2ce');
  }
  for(const e of ENCOUNTERS.filter(e=>e.room===key)){
   this.addWorld(this.add.circle(e.x,e.y-43,10,0xe6cc78));
   this.label(e.x,e.y-68,this.completed.has(e.id)?'✓':e.id==='finale'?'!':'?',24,e.id==='finale'?'#e8a971':'#fff1a8');
  }
  const pos=spawn||r.spawn;this.player=this.drawDetective(pos.x,pos.y);
  this.addHud(this.add.rectangle(640,807,1280,66,0x101820,0.86).setDepth(99));
  this.hint=this.hudLabel(640,805,'WASD / arrows: move  •  E: investigate / enter  •  J: journal',17,'#e8e8e8');
  this.status=this.hudLabel(1090,36,`Leads: ${this.leadsFound()} / ${REQUIRED_LEADS.length}`,16,'#e9d9b5');
  this.toast=this.hudLabel(640,758,'',17,'#ffdc92');
  this.configureCameras();
 }
 drawFogHarborTilemap(){
  const map=this.make.tilemap({key:'fogHarborTown'});
  const tileset=map.addTilesetImage('Fog Harbor Town tilemap','fogHarborTiles');
  if(!tileset){console.warn('Fog Harbor tileset could not be loaded');return;}
  // Render the 60x40 Tiled map at its TRUE 16px-per-tile size.
  // The 1280x720 canvas is only the viewport; it does not define map size.
  // Center the native 960x640 world inside the taller 840px canvas.
  // This leaves 100px above and below for the fixed header and footer.
  const left=(W-map.widthInPixels)/2;
  const top=(H-map.heightInPixels)/2;
  this.squareBounds={left,top,right:left+map.widthInPixels,bottom:top+map.heightInPixels};
  map.layers.forEach(layerData=>{
   const layer=map.createLayer(layerData.name,tileset,left,top);
   if(layer){this.addWorld(layer);}
  });
 }
 drawProp(p){
  const {x,y,kind}=p;
  if(kind==='desk'){this.rect(x,y,122,65,0x70472e);this.rect(x,y-10,100,12,0xa87b4d);this.rect(x-25,y+5,20,12,0xd8cda2);}
  else if(kind==='bookshelf'){this.rect(x,y,110,110,0x392a25);for(let i=0;i<6;i++)this.rect(x-38+i*15,y-8,10,65,[0x963d39,0x466d75,0xa88746][i%3]);}
  else if(kind==='lamp'){this.rect(x,y,12,78,0x262d32);this.addWorld(this.add.circle(x,y-44,17,0xe8b967));}
  else if(kind==='fountain'){this.addWorld(this.add.circle(x,y,58,0x2e4656));this.addWorld(this.add.circle(x,y,42,0x6496a0));}
  else if(kind==='crate'){this.rect(x,y,76,70,0x805d42);this.rect(x,y,62,10,0xb28a5e);}
  else if(kind==='cabinet'){this.rect(x,y,96,100,0x78828b);this.rect(x,y,5,88,0x3b4851);}
 }
 drawDetective(x,y){
  // Small original procedural pixel-art character, built from Phaser rectangles.
  const c=this.add.container(x,y);const pixels=[
   [0,-24,30,8,0x3a2b22],[-8,-18,40,8,0x4b392c],
   [-3,-8,23,22,0xd2a071],[-9,-11,5,7,0x211c1b],[6,-11,5,7,0x211c1b],
   [0,16,30,28,0x796548],[0,5,9,16,0xd4c6ae],
   [-12,36,10,18,0x262d38],[12,36,10,18,0x262d38],
   [-22,14,8,24,0xd2a071],[22,14,8,24,0xd2a071]];
  for(const [px,py,w,h,color] of pixels)c.add(this.add.rectangle(px,py,w,h,color));
  // Match the detective to the roughly 16-20px-tall character tiles in the town map.
  // The container origin and interaction coordinates remain unchanged.
  c.setScale(0.27);
  this.addWorld(c);return c;
 }
 isReady(e){return !e.requires||e.requires.every(id=>this.completed.has(id));}
 leadsFound(){return REQUIRED_LEADS.filter(id=>this.completed.has(id)).length;}
 nearby(){
  // Locked encounters remain detectable so players receive useful feedback.
  const encounters=ENCOUNTERS.filter(e=>e.room===this.room&&!this.completed.has(e.id))
   .map(e=>({kind:this.isReady(e)?'encounter':'locked',value:e,distance:Phaser.Math.Distance.Between(this.player.x,this.player.y,e.x,e.y)}))
   .filter(e=>e.distance<RANGE).sort((a,b)=>a.distance-b.distance);
  if(encounters.length)return encounters[0];
  const doors=ROOMS[this.room].doors.map(d=>({kind:'door',value:d,distance:Phaser.Math.Distance.Between(this.player.x,this.player.y,d.x,d.y)})).filter(d=>d.distance<RANGE).sort((a,b)=>a.distance-b.distance);
  return doors[0]||null;
 }
 notify(message,duration=3600){
  if(!this.toast)return;
  if(this.toastTimer)this.toastTimer.remove(false);
  this.toast.setText(message);
  this.toastTimer=this.time.delayedCall(duration,()=>{if(this.toast?.active)this.toast.setText('');this.toastTimer=null;});
 }
 nextLead(){
  const e=ENCOUNTERS.find(e=>REQUIRED_LEADS.includes(e.id)&&!this.completed.has(e.id));
  return e||null;
 }
 lockedHint(){
  const missing=REQUIRED_LEADS.filter(id=>!this.completed.has(id));
  if(!missing.length)return 'The evidence is complete. I can confront the suspect now.';
  const clues={casefile:'The accounts do not agree. I need to look more closely at what was recorded.',witness:'Someone knows more than they are willing to say.',footprints:'There is a trail I have not followed to its end.',journal:'A written secret may still be waiting to be uncovered.'};
  if(missing.length===1)return `Something is still missing. ${clues[missing[0]]}`;
  return 'I cannot confront anyone on suspicion alone. There are still loose ends to investigate.';
 }
 toggleNotebook(){
  if(this.mode==='notebook'){this.closeNotebook();return;}
  if(this.mode!=='explore')return;
  this.mode='notebook';this.overlay();
  this.write(160,115,'CASE JOURNAL  •  FOG HARBOR',29);
  this.write(160,175,'The Blackwood Manor Investigation',20);
  const notes={casefile:'Two accounts of the same night cannot both be true.',witness:'Someone is holding back part of the story.',footprints:'A trail was left behind. Where does it lead?',journal:'Some secrets are safer on paper... until discovered.'};
  REQUIRED_LEADS.forEach((id,i)=>this.write(170,235+i*57,`${this.completed.has(id)?'[DONE]':'[     ]'}  ${notes[id]}`,18));
  this.write(170,480,this.leadsFound()===4?'The pieces finally fit. It is time to face the person behind it all.':`Unresolved threads: ${REQUIRED_LEADS.length-this.leadsFound()}  •  The truth is still out there.`,17);
  this.write(170,565,'Press J or Esc to close',16);
 }
 closeNotebook(){if(this.mode==='notebook')this.clearOverlay();}
 update(_,delta){
  if(this.mode!=='explore')return;
  let dx=0,dy=0;if(this.cursors.left.isDown||this.keys.A.isDown)dx--;
  if(this.cursors.right.isDown||this.keys.D.isDown)dx++;
  if(this.cursors.up.isDown||this.keys.W.isDown)dy--;
  if(this.cursors.down.isDown||this.keys.S.isDown)dy++;
  const mag=Math.hypot(dx,dy)||1;
  // Square movement follows the actual Tiled map bounds, not the old gray prototype.
  // Other rooms retain their original limits and interactions.
  const bounds=this.room==='square'&&this.squareBounds
   ? {left:this.squareBounds.left+12,right:this.squareBounds.right-12,top:this.squareBounds.top+18,bottom:this.squareBounds.bottom-18}
   : {left:115,right:1165,top:160,bottom:575};
  this.player.x=Phaser.Math.Clamp(this.player.x+dx/mag*SPEED*delta/1000,bounds.left,bounds.right);
  this.player.y=Phaser.Math.Clamp(this.player.y+dy/mag*SPEED*delta/1000,bounds.top,bounds.bottom);
  const n=this.nearby();this.hint.setText(n?`Press E: ${n.kind==='door'?'Enter '+n.value.label:n.kind==='locked'?'Approach '+n.value.name:n.value.name}  •  J: journal`:'WASD / arrows: move  •  E: investigate / enter  •  J: journal');
 }
 interact(){
  if(this.mode!=='explore')return;const n=this.nearby();if(!n)return;
  if(n.kind==='door'){this.drawRoom(n.value.to,n.value.spawn);return;}
  if(n.kind==='locked'){this.notify(this.lockedHint(),4800);return;}
  this.active=n.value;this.mode='choice';this.overlay();
  this.write(160,135,n.value.name,30);this.write(160,210,n.value.prompt,23);
  n.value.choices.forEach((c,i)=>this.write(175,320+i*78,`${i+1}. ${c.text}`,21));
  this.write(160,540,'Press 1 or 2 to choose.',18);
 }
 choose(index){
  if(this.mode!=='choice'||!this.active)return;
  const e=this.active,c=e.choices[index];if(!c)return;
  applyChoice(this.profile,c.effects);this.completed.add(e.id);this.active=null;
  this.clearOverlay();
  if(this.completed.size===ENCOUNTERS.length){this.showResults();return;}
  const currentRoom=this.room,position={x:this.player.x,y:this.player.y};
  this.drawRoom(currentRoom,position);
  if(this.leadsFound()===4)this.notify('The evidence finally fits together. I am ready to face the suspect.',5600);
  else this.notify('A new detail belongs in the case journal. Press J to review it.',4000);
 }
 overlay(){this.addOverlay(this.add.rectangle(640,360,1040,540,0x182532).setStrokeStyle(4,0xc7a66d).setDepth(200));}
 write(x,y,t,size){const o=this.add.text(x,y,t,{fontFamily:'monospace',fontSize:`${size}px`,color:'#f2ead7',wordWrap:{width:930}});this.addOverlay(o.setDepth(201));return o;}
 clearOverlay(){this.ui.forEach(o=>o.destroy());this.ui=[];this.mode='explore';}
 showResults(){this.mode='results';this.overlay();const results=recommend(this.profile);
  this.write(160,130,'CASE CLOSED • MYSTERY SOLVED',29);
  this.write(160,215,`Your movie: ${results[0].title} (${results[0].year})`,25);
  this.write(160,285,`Compatibility: ${results[0].score.toFixed(1)}%`,22);
  this.write(160,340,explain(this.profile,results[0]),19);
  this.write(160,405,`Also consider: ${results[1].title} and ${results[2].title}`,18);
  this.write(160,540,'Press R to investigate again.',18);
 }
}
