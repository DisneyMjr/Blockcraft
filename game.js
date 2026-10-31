/* Blockcraft 0.7 Mundo Vivo | Babylon.js */
(()=>{'use strict';
const $=s=>document.querySelector(s),canvas=$('#renderCanvas');const sounds=window.BlockcraftAudio||{unlock(){},play(){},step(){},ambience(){},toggle(){return true},setVolume(){},get muted(){return false},get volume(){return .58}};if(!window.BABYLON){alert('É necessária conexão para carregar Babylon.js.');return;}
const engine=new BABYLON.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,antialias:true});engine.setHardwareScalingLevel(Math.max(1,Math.min(2.2,(window.matchMedia('(pointer:coarse)').matches?devicePixelRatio/1.05:devicePixelRatio/1.5))));
const scene=new BABYLON.Scene(engine);scene.clearColor=new BABYLON.Color4(.47,.74,.94,1);scene.fogMode=BABYLON.Scene.FOGMODE_EXP2;scene.fogDensity=.006;scene.fogColor=new BABYLON.Color3(.52,.75,.92);scene.ambientColor=new BABYLON.Color3(.25,.3,.38);
const camera=new BABYLON.FreeCamera('camera',new BABYLON.Vector3(0,10,-8),scene);camera.minZ=.06;camera.maxZ=200;camera.fov=1.15;scene.activeCamera=camera;
const light=new BABYLON.HemisphericLight('ambiente',new BABYLON.Vector3(.3,1,.5),scene);light.intensity=.95;const sun=new BABYLON.DirectionalLight('sol',new BABYLON.Vector3(-.45,-1,-.35),scene);sun.intensity=.75;const moon=new BABYLON.DirectionalLight('lua',new BABYLON.Vector3(.3,-1,.3),scene);moon.intensity=0;const sunDisc=BABYLON.MeshBuilder.CreateSphere('discoSolar',{diameter:6,segments:12},scene);const sunMat=new BABYLON.StandardMaterial('brilhoSol',scene);sunMat.disableLighting=true;sunMat.emissiveColor=new BABYLON.Color3(1,.86,.55);sunDisc.material=sunMat;sunDisc.isPickable=false;sunDisc.alwaysSelectAsActiveMesh=true;const moonDisc=BABYLON.MeshBuilder.CreateSphere('discoLunar',{diameter:4,segments:12},scene);const moonMat=new BABYLON.StandardMaterial('brilhoLua',scene);moonMat.disableLighting=true;moonMat.emissiveColor=new BABYLON.Color3(.66,.77,1);moonDisc.material=moonMat;moonDisc.isPickable=false;moonDisc.alwaysSelectAsActiveMesh=true;
const mats=[[.36,.66,.25],[.43,.3,.19],[.52,.53,.55],[.72,.59,.36],[.17,.48,.74],[.25,.58,.26],[.8,.77,.56]];
const materials=mats.map((c,i)=>{let m=new BABYLON.StandardMaterial('tipo'+i,scene);m.diffuseColor=BABYLON.Color3.FromArray(c);m.specularColor=new BABYLON.Color3(.03,.03,.03);m.backFaceCulling=false;return m});
// Texturas pequenas geradas localmente, sem downloads e sem aumentar o APK.
const paintPalettes=[['#567a31','#6a9637','#7fa54c','#3d6128'],['#644a32','#816043','#533d2c','#9a7853'],['#707881','#979b9d','#59636f','#afb2b1'],['#8e7148','#b39463','#6b502f','#c5a671'],['#2162a2','#3484c0','#153958','#74b9d8'],['#386f35','#488646','#28582c','#6f9c51'],['#b0a17a','#cbb88e','#908165','#e1cf9d']];
materials.forEach((mat,index)=>{
 const tex=new BABYLON.DynamicTexture('textura_viva_'+index,{width:64,height:64},scene,false);
 const ctx=tex.getContext(),palette=paintPalettes[index];ctx.fillStyle=palette[0];ctx.fillRect(0,0,64,64);
 let seed=(index+1)*73856093;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/4294967296;}
 for(let i=0;i<450;i++){const size=1+Math.floor(rnd()*5);ctx.fillStyle=palette[Math.floor(rnd()*palette.length)];ctx.globalAlpha=.25+rnd()*.45;ctx.fillRect(Math.floor(rnd()*64),Math.floor(rnd()*64),size,size);}
 ctx.globalAlpha=1;tex.update();mat.diffuseTexture=tex;mat.diffuseColor=new BABYLON.Color3(.96,.96,.96);mat.specularColor=new BABYLON.Color3(.035,.035,.04);
});
// Materiais adicionais para gemas, minerais e lava.
const newColors=[[.12,.72,.78],[.28,.68,.92],[.38,.8,.35],[.78,.20,.32],[.94,.66,.18],[.95,.28,.04],[.15,.28,.38]];
newColors.forEach((c,i)=>{let m=new BABYLON.StandardMaterial('mineral_'+i,scene);m.diffuseColor=BABYLON.Color3.FromArray(c);m.specularColor=new BABYLON.Color3(.3,.35,.38);if(i===5)m.emissiveColor=new BABYLON.Color3(.8,.13,.01);materials.push(m)});
const SEA_LEVEL=4,MIN_DEPTH=-192,DEEP_SEGMENT=24;
function deepCave(x,y,z){const n=Math.sin(x*.29+y*.21)*Math.cos(z*.27-y*.15)+Math.sin(x*.12-z*.19+y*.33);return n>1.03}
function underMaterial(x,y,z){let q=hash(x*3+y*19,z*7-y*13);if(y<-145 && deepCave(x,y,z))return 12;if(y<-145&&q>.995)return 12;if(q>.992)return 7;if(q>.986)return 8;if(q>.980)return 9;if(q>.974)return 10;if(q>.968)return 11;return y<-64?13:2}
function liquidAt(x,y,z){
 if(y>=MIN_DEPTH&&y<-145&&deepCave(x,y,z))return 'lava';
 // A superfície da água renderizada fica em SEA_LEVEL+1.03. Só é água se a célula estiver livre.
 if(y>=0&&y<SEA_LEVEL+1.03&&y>heightAt(x,z)+.9&&getBlock(Math.floor(x),Math.floor(y),Math.floor(z))<0)return 'water';
 return null;
}
const CHUNK=12;let RADIUS=2;const world=new Map(),edits=new Map(),keys={},held={forward:0,right:0};let wood=0,saplings=0,sticks=0,fruit=0,coins=0,stars=0,stageIndex=0,stageWins={},npcKills=0,stageObjective=0,stageStartedAt=0,selected=0,camMode=0,started=false,char='angelo',mode='creative',yaw=0,pitch=.1,velocityY=0,grounded=false,attackAt=0,player={x:2,y:12,z:2},pointerDown=false;
const stateKey='blockcraft_04_save';
const settingsKey='blockcraft_settings_v1';
let settings={renderDistance:2,mouseSensitivity:1,fov:66,dayMinutes:20};
try{const v=JSON.parse(localStorage.getItem(settingsKey)||'{}');if(v&&typeof v==='object')settings={...settings,...v};}catch(e){}
settings.renderDistance=Math.max(1,Math.min(3,Number(settings.renderDistance)||2));
settings.mouseSensitivity=Math.max(.3,Math.min(2.5,Number(settings.mouseSensitivity)||1));
settings.fov=Math.max(55,Math.min(90,Number(settings.fov)||66));
settings.dayMinutes=Math.max(5,Math.min(40,Number(settings.dayMinutes)||20));
RADIUS=settings.renderDistance;
camera.fov=settings.fov*Math.PI/180;
try{const saved=JSON.parse(localStorage.getItem(stateKey)||'{}');if(saved.edits)for(const [k,v] of Object.entries(saved.edits))edits.set(k,v);if(saved.player&&Number.isFinite(saved.player.x))player=saved.player; if(saved.coins)coins=saved.coins; if(saved.wood)wood=saved.wood; if(saved.saplings)saplings=saved.saplings; if(saved.sticks)sticks=saved.sticks; if(saved.fruit)fruit=saved.fruit; if(saved.stars)stars=saved.stars;}catch(e){}
function hash(x,z){let q=Math.sin(x*127.1+z*311.7)*43758.5453;return q-Math.floor(q)}
function heightAt(x,z){let h=4+Math.sin(x*.06)*2.2+Math.cos(z*.07)*2.2+Math.sin((x+z)*.14)*1.1+Math.sin(x*.22-z*.13)*.5;let continent=Math.sin(x*.012)*2.5+Math.cos(z*.016)*2.5+Math.sin((x+z)*.009)*2.2;return Math.max(1,Math.min(13,Math.floor(h+continent-1.6)))}
function groundType(x,z){const h=heightAt(x,z);return h<4?6:0}
function key(x,y,z){return `${x},${y},${z}`}
function getBlock(x,y,z){const k=key(x,y,z);if(edits.has(k))return edits.get(k);if(y<MIN_DEPTH)return -1;if(y<0)return deepCave(x,y,z)?-1:underMaterial(x,y,z);let h=heightAt(x,z);if(y>h)return -1;if(y===h)return groundType(x,z);if(y>h-3)return 1;return 2}
const faces=[{d:[1,0,0],v:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],norm:[1,0,0]},{d:[-1,0,0],v:[[0,0,1],[0,1,1],[0,1,0],[0,0,0]],norm:[-1,0,0]},{d:[0,1,0],v:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],norm:[0,1,0]},{d:[0,-1,0],v:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],norm:[0,-1,0]},{d:[0,0,1],v:[[1,0,1],[0,0,1],[0,1,1],[1,1,1]],norm:[0,0,1]},{d:[0,0,-1],v:[[0,0,0],[1,0,0],[1,1,0],[0,1,0]],norm:[0,0,-1]}];
function createChunk(cx,cz){const groups=materials.map(()=>({p:[],n:[],i:[],uv:[]}));let minY=Math.max(MIN_DEPTH,Math.floor((player.y-18)/DEEP_SEGMENT)*DEEP_SEGMENT),maxUnderground=Math.min(-1,minY+DEEP_SEGMENT+30);let minX=cx*CHUNK,minZ=cz*CHUNK;for(let x=minX;x<minX+CHUNK;x++)for(let z=minZ;z<minZ+CHUNK;z++){let maxY=heightAt(x,z);for(let [k,v] of edits){if(!v||v<0)continue;const parts=k.split(',').map(Number);if(parts[0]===x&&parts[2]===z)maxY=Math.max(maxY,parts[1])}for(let y=(minY<0?minY:0);y<=Math.min(20,maxY);y++){if(y<0&&y>maxUnderground)continue;let t=getBlock(x,y,z);if(t<0)continue;let g=groups[Math.min(t,materials.length-1)];for(let f of faces){if(getBlock(x+f.d[0],y+f.d[1],z+f.d[2])>=0)continue;let ofs=g.p.length/3;for(const vv of f.v){g.p.push(x+vv[0],y+vv[1],z+vv[2]);g.n.push(...f.norm)}g.i.push(ofs,ofs+1,ofs+2,ofs,ofs+2,ofs+3);g.uv.push(0,0,1,0,1,1,0,1)}}}
const meshes=[];groups.forEach((g,t)=>{if(!g.i.length)return;let mesh=new BABYLON.Mesh(`chunk_${cx}_${cz}_${t}`,scene),vd=new BABYLON.VertexData();vd.positions=g.p;vd.indices=g.i;vd.normals=g.n;vd.uvs=g.uv;vd.applyToMesh(mesh);mesh.material=materials[t];mesh.isPickable=true;mesh.metadata={terrain:true};meshes.push(mesh)});addTrees(cx,cz,meshes);addWaters(cx,cz,meshes);return meshes}
function updateWorld(){let cx=Math.floor(player.x/CHUNK),cz=Math.floor(player.z/CHUNK),layer=Math.floor((player.y-18)/DEEP_SEGMENT),needed=new Set();for(let dx=-RADIUS;dx<=RADIUS;dx++)for(let dz=-RADIUS;dz<=RADIUS;dz++){let a=cx+dx,b=cz+dz,k=`${a}:${b}`;needed.add(k);if(!world.has(k)||world.get(k)._layer!==layer){if(world.has(k))world.get(k).forEach(m=>m.dispose());const created=createChunk(a,b);created._layer=layer;world.set(k,created)}}for(const [k,meshes] of world)if(!needed.has(k)){for(let mesh of meshes)mesh.dispose();world.delete(k)}}
function refreshAt(x,z){let cx=Math.floor(x/CHUNK),cz=Math.floor(z/CHUNK);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){let k=`${cx+dx}:${cz+dz}`;if(world.has(k)){world.get(k).forEach(m=>m.dispose());{const created=createChunk(cx+dx,cz+dz);created._layer=Math.floor((player.y-18)/DEEP_SEGMENT);world.set(k,created)}}}}
function stateSnapshot(){return {format:'blockcraft-save',schema:1,savedAt:new Date().toISOString(),player:{...player},edits:Object.fromEntries(edits),coins,stars,wood,saplings,sticks,fruit,worldTime,stageIndex,stageWins};}
function save(silent=false){try{localStorage.setItem(stateKey,JSON.stringify(stateSnapshot()));if(!silent)toast('Mundo salvo ✓');return true;}catch(e){if(!silent)toast('Erro ao salvar: armazenamento indisponível');return false;}}
function exportWorld(){if(!save())return;const data=JSON.stringify(stateSnapshot(),null,2);const a=document.createElement('a');const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.href=url;a.download='blockcraft-mundo-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('Cópia do mundo exportada');}
async function importWorld(file){if(!file)return;try{if(file.size>25_000_000)throw new Error('Arquivo acima de 25 MB');const data=JSON.parse(await file.text());if(data.format!=='blockcraft-save'||data.schema!==1||!data.player||!Number.isFinite(data.player.x)||!Number.isFinite(data.player.y)||!Number.isFinite(data.player.z)||!data.edits||typeof data.edits!=='object'||Array.isArray(data.edits))throw new Error('Arquivo inválido');if(!confirm('Substituir o progresso atual pelo mundo importado? Esta ação não pode ser desfeita.'))return;localStorage.setItem(stateKey,JSON.stringify(data));location.reload();}catch(e){toast('Falha ao importar: '+e.message);}}
function updateSettings(){const ids={renderDistance:'renderDistance',mouseSensitivity:'mouseSensitivity',fov:'fov',dayMinutes:'dayMinutes'};for(const [k,id]of Object.entries(ids)){const el=document.getElementById(id);if(el)settings[k]=Number(el.value);}RADIUS=settings.renderDistance;camera.fov=settings.fov*Math.PI/180;localStorage.setItem(settingsKey,JSON.stringify(settings));updateWorld();toast('Configurações aplicadas');}

function toast(str){const e=$('#toast');e.textContent=str;e.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>e.style.display='none',2000)}
function avatar(){const root=new BABYLON.TransformNode('avatar',scene);const skin=new BABYLON.StandardMaterial('pele',scene);skin.diffuseColor=new BABYLON.Color3(.93,.69,.49);const hair=new BABYLON.StandardMaterial('cabelo',scene);hair.diffuseColor=new BABYLON.Color3(.24,.14,.1);const shirt=new BABYLON.StandardMaterial('camisa',scene);shirt.diffuseColor=char==='angelo'?new BABYLON.Color3(.08,.17,.35):new BABYLON.Color3(.92,.87,.74);const pants=new BABYLON.StandardMaterial('calca',scene);pants.diffuseColor=char==='angelo'?new BABYLON.Color3(.18,.38,.61):new BABYLON.Color3(.86,.47,.58);function part(n,s,p,m){const a=BABYLON.MeshBuilder.CreateBox(n,{width:s[0],height:s[1],depth:s[2]},scene);a.position.set(...p);a.parent=root;a.material=m;a.isPickable=false;return a}part('torso',[.72,.85,.32],[0,1.1,0],shirt);part('cabeca',[.62,.62,.56],[0,1.85,0],skin);part('cabelo',[.66,char==='angelo'?.22:.4,.6],[0,2.2,0],hair);avatarParts.leftArm=part('bracoE',[.25,.7,.28],[-.5,1.07,0],skin);avatarParts.rightArm=part('bracoD',[.25,.7,.28],[.5,1.07,0],skin);avatarParts.leftLeg=part('pernaE',[.28,.75,.3],[-.2,.35,0],pants);avatarParts.rightLeg=part('pernaD',[.28,.75,.3],[.2,.35,0],pants);return root}
let body=null;const avatarParts={};function setCharacter(v){char=v;if(body)body.dispose(false,true);body=avatar();createHands()}
let handRig=null,handArms=[];let swingTime=0;let impactStrength=0;let lastVerticalVelocity=0;
// Movimento baseado na distancia percorrida, nao no relogio: cada ciclo corresponde a passos.
let stepPhase=0,bobBlend=0,landingKick=0,airborne=false,viewBobLevel=1;
const damp=(from,to,speed,dt)=>from+(to-from)*(1-Math.exp(-speed*dt));

function createHands(){if(handRig)handRig.dispose(false,true);handRig=new BABYLON.TransformNode('maos_primeira_pessoa',scene);handArms=[];handRig.parent=camera;const sm=new BABYLON.StandardMaterial('pele_maos',scene);sm.diffuseColor=new BABYLON.Color3(.92,.66,.44);const sleeve=new BABYLON.StandardMaterial('manga_maos',scene);sleeve.diffuseColor=char==='angelo'?new BABYLON.Color3(.06,.16,.42):new BABYLON.Color3(.86,.79,.75);for(let side of [-1,1]){const arm=BABYLON.MeshBuilder.CreateBox('antebraco',{width:.14,height:.16,depth:.37},scene);arm.parent=handRig;arm.position.set(side*.29,-.65,.85);arm.rotation.x=-.3;arm.material=sleeve;arm.isPickable=false;handArms.push(arm);const fist=BABYLON.MeshBuilder.CreateBox('mao',{width:.14,height:.15,depth:.17},scene);fist.parent=arm;fist.position.z=.22;fist.material=sm;fist.isPickable=false;}handRig.setEnabled(camMode===0)}
function cameraUpdate(dt){let dir=new BABYLON.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));let eye=new BABYLON.Vector3(player.x,player.y+1.58,player.z);if(handRig){handRig.setEnabled(camMode===0);}
 if(camMode===0){body.setEnabled(true);
 // Primeira pessoa limpa: nao renderizar tronco/cabeca para evitar a faixa azul.
 // Mostrar apenas as pernas, e so quando o jogador olha bem para baixo.
 const lookingDown = false; // mobile: manter camera limpa; maos continuam visiveis
 for(const m of body.getChildMeshes()){
  if(m.name==='pernaE'||m.name==='pernaD'){
   m.isVisible=lookingDown;
  }else{
   m.isVisible=false;
  }
 }
 // O balanco da cabeca acompanha o movimento real e desacelera quando o jogador para.
 eye.y+=Math.abs(Math.sin(stepPhase))*0.075*bobBlend*viewBobLevel-landingKick*.095*viewBobLevel-impactStrength*.05;
 eye.x+=Math.sin(stepPhase)*Math.cos(yaw)*.036*bobBlend*viewBobLevel;
 eye.z-=Math.sin(stepPhase)*Math.sin(yaw)*.036*bobBlend*viewBobLevel;
 camera.position.copyFrom(eye)
 }else{body.setEnabled(true);for(const m of body.getChildMeshes())m.isVisible=true;let offset=new BABYLON.Vector3(-dir.x*5.5,2.2-dir.y*3,-dir.z*5.5);let pos=eye.add(offset);camera.position=BABYLON.Vector3.Lerp(camera.position,pos,Math.min(1,dt*8))}camera.setTarget(eye.add(dir.scale(12)));
 // Leve inclinacao a cada passo, sem alterar a direcao do mouse.
 camera.rotation.z=camMode===0?(Math.sin(stepPhase)*.013*bobBlend*viewBobLevel+Math.sin(impactStrength*3)*.007):0;
 if(handRig){handRig.position.x=Math.sin(stepPhase)*.032*bobBlend*viewBobLevel;
  handRig.position.y=-Math.abs(Math.sin(stepPhase))*.038*bobBlend*viewBobLevel+landingKick*.08*viewBobLevel;
  handRig.rotation.z=Math.sin(stepPhase)*.025*bobBlend*viewBobLevel;
  handRig.rotation.x= -Math.sin(Math.min(1,(performance.now()-swingTime)/340)*Math.PI)*.12;}
 if(camMode===0){body.position.set(player.x,player.y-0.08,player.z);}else{body.position.set(player.x,player.y,player.z);}body.rotation.y=yaw}
function toggleCam(){camMode=1-camMode;toast(camMode?'Terceira pessoa':'Primeira pessoa')}
function cast(){
 const hit=scene.pick(engine.getRenderWidth()/2,engine.getRenderHeight()/2,m=>m.metadata?.terrain||m.metadata?.treeBlock,false,camera);
 return hit?.hit&&hit.distance<7?hit:null;
}
function action(kind){
 const now=performance.now();swingTime=now;if(kind==='break'&&hitNPC()){sounds.play('attack');return;}
 if(now-attackAt<175)return;attackAt=now;
 const hit=cast();if(!hit)return;
 const info=hit.pickedMesh.metadata;
 if(info?.treeBlock){
  const {x,y,z,part}=info;
  if(kind==='break'){
   sounds.play(part==='log'?'wood':'leaves');
   edits.set('treepart:'+key(x,y,z),1);
   if(part==='log'){wood++;toast('🪵 +1 madeira · Total '+wood)}
   else{
    const h=hash(x*23+y*17,z*41);
    if(h<.18){saplings++;toast('🌱 +1 muda · Total '+saplings)}
    else if(h<.39){sticks++;toast('🌿 +1 graveto · Total '+sticks)}
    else if(h>.968){fruit++;toast('🍎 +1 fruto · Total '+fruit)}
   }
   refreshAt(x,z);
  }else{
   const n=hit.getNormal(true);if(!n)return;
   const xx=x+Math.round(n.x),yy=y+Math.round(n.y),zz=z+Math.round(n.z);
   if(getBlock(xx,yy,zz)>=0 || treeVoxelExists(xx,yy,zz))return;sounds.play('place');
   edits.set(key(xx,yy,zz),selected===3?3:selected===4?5:selected);refreshAt(xx,zz);
  }
  return;
 }
 const normal=hit.getNormal(true);if(!normal)return;
 let x=Math.floor(hit.pickedPoint.x-normal.x*.05),y=Math.floor(hit.pickedPoint.y-normal.y*.05),z=Math.floor(hit.pickedPoint.z-normal.z*.05);
 if(kind==='place'){
  x+=Math.round(normal.x);y+=Math.round(normal.y);z+=Math.round(normal.z);
  if(Math.abs(x-player.x)<.85&&Math.abs(z-player.z)<.85&&y<=player.y+1.8&&y>=player.y-1)return;
  if(treeVoxelExists(x,y,z))return;sounds.play('place');
  edits.set(key(x,y,z),selected===0?0:selected===1?1:selected===2?2:selected===3?3:5)
 }else{
  if(y<=MIN_DEPTH)return;let old=getBlock(x,y,z);sounds.play(old===3?'wood':old===5?'leaves':old===2?'stone':old>=7?'ore':'dirt');
  if(old===3){wood++;toast('🪵 +1 madeira · Total '+wood)}
  edits.set(key(x,y,z),-1)
 }
 refreshAt(x,z)
}
function plantSapling(){
 if(mode!=='creative'&&saplings<=0){toast('Colete mudas quebrando folhas');return;}
 const hit=cast();if(!hit){toast('Aponte para um bloco de terra ou grama');return;}
 let x,y,z;
 if(hit.pickedMesh.metadata?.treeBlock){const t=hit.pickedMesh.metadata;x=t.x;y=t.y;z=t.z;}
 else{const n=hit.getNormal(true);if(!n||n.y<.5){toast('Plante sobre o chão');return;}
 x=Math.floor(hit.pickedPoint.x-n.x*.05);y=Math.floor(hit.pickedPoint.y-n.y*.05);z=Math.floor(hit.pickedPoint.z-n.z*.05);}
 if(getBlock(x,y,z)<0||getBlock(x,y+1,z)>=0){toast('Escolha um chão livre');return;}
 const id='planted:'+x+','+z;
 if(edits.has(id)){toast('Já existe muda neste local');return;}
 edits.set(id,{x,z,y:y+1,type:Math.floor(hash(x*17,z*19)*4)});
 if(mode!=='creative')saplings--;
 refreshAt(x,z);toast('🌱 Muda plantada!');
}

const slots=[['Grama','#6fa143'],['Terra','#75513a'],['Pedra','#888991'],['Madeira','#bc9659'],['Folhas','#4d9b47']];slots.forEach(([name,color],i)=>{let el=document.createElement('button');el.className='slot'+(i===0?' active':'');el.innerHTML=`<span style="background:${color}"></span>${i+1} ${name}`;el.onclick=()=>select(i);$('#hotbar').appendChild(el)});function select(n){selected=n;document.querySelectorAll('.slot').forEach((e,i)=>e.classList.toggle('active',i===n))}
window.addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyV'&&!e.repeat)toggleCam();if(e.code==='KeyR'&&!e.repeat)plantSapling();if(/^Digit[1-5]$/.test(e.code))select(Number(e.code.slice(-1))-1);if(e.code==='Space')e.preventDefault();});window.addEventListener('keyup',e=>keys[e.code]=false);
canvas.addEventListener('click',()=>{if(!started)return;if(matchMedia('(pointer:fine)').matches&&!document.pointerLockElement)canvas.requestPointerLock?.()});document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas){yaw+=e.movementX*.003*settings.mouseSensitivity;pitch=Math.max(-1.15,Math.min(1.1,pitch-e.movementY*.003*settings.mouseSensitivity))}});
canvas.addEventListener('mousedown',e=>{if(!started||e.target!==canvas)return;if(document.pointerLockElement===canvas){if(e.button===0)action('break');else if(e.button===2)action('place')}});canvas.addEventListener('contextmenu',e=>e.preventDefault());
let lookTouch=null;canvas.addEventListener('touchstart',e=>{if(e.touches.length){const t=e.touches[0];lookTouch={x:t.clientX,y:t.clientY}}},{passive:true});canvas.addEventListener('touchmove',e=>{if(!lookTouch||!e.touches.length)return;const t=e.touches[0];yaw+=(t.clientX-lookTouch.x)*.005*settings.mouseSensitivity;pitch=Math.max(-1.15,Math.min(1.1,pitch-(t.clientY-lookTouch.y)*.005*settings.mouseSensitivity));lookTouch={x:t.clientX,y:t.clientY}},{passive:true});canvas.addEventListener('touchend',()=>lookTouch=null);
const pad=$('#pad'),knob=$('#knob');function movePad(e){e.preventDefault();const r=pad.getBoundingClientRect();let x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;let d=Math.max(1,Math.hypot(x,y)),k=Math.min(1,43/d);x*=k;y*=k;held.right=x/43;held.forward=-y/43;knob.style.transform=`translate(${x}px,${y}px)`}pad.addEventListener('pointerdown',e=>{pad.setPointerCapture(e.pointerId);movePad(e)});pad.addEventListener('pointermove',e=>{if(pad.hasPointerCapture(e.pointerId))movePad(e)});for(const evt of ['pointerup','pointercancel'])pad.addEventListener(evt,()=>{held.forward=held.right=0;knob.style.transform='' });pad.addEventListener('lostpointercapture',()=>{held.forward=0;held.right=0;knob.style.transform='';});
const optionsPanel=document.getElementById('optionsPanel');
for(const k of ['renderDistance','mouseSensitivity','fov','dayMinutes']){const e=document.getElementById(k);if(e)e.value=settings[k];}
document.getElementById('optionsToggle').onclick=()=>{optionsPanel.hidden=!optionsPanel.hidden;};
document.getElementById('settingsApply').onclick=updateSettings;
document.getElementById('exportWorld').onclick=exportWorld;
document.getElementById('importWorld').onchange=e=>{importWorld(e.target.files?.[0]);e.target.value='';};
$('#jump').addEventListener('pointerdown',()=>keys.Space=true);['pointerup','pointercancel'].forEach(n=>$('#jump').addEventListener(n,()=>keys.Space=false));$('#break').onclick=()=>action('break');$('#place').onclick=()=>action('place');$('#cameraBtn').onclick=toggleCam;$('#saveBtn').onclick=save;const soundBtn=$('#soundBtn'),soundVolume=$('#soundVolume');if(soundBtn){soundBtn.textContent=sounds.muted?'🔇 Som':'🔊 Som';soundBtn.onclick=()=>{soundBtn.textContent=sounds.toggle()?'🔊 Som':'🔇 Som';}}if(soundVolume){soundVolume.value=Math.round(sounds.volume*100);soundVolume.oninput=()=>{sounds.unlock();sounds.setVolume(Number(soundVolume.value)/100);};}
const plantButton=document.createElement('button');plantButton.textContent='🌱 Plantar';plantButton.title='Plantar muda (R)';plantButton.style.cssText='position:fixed;right:12px;bottom:158px;z-index:40;padding:10px 12px;border-radius:12px;background:#2c7647;color:white;border:2px solid #9fe0a2;font-weight:bold;display:none';document.body.appendChild(plantButton);plantButton.onclick=plantSapling;
$('#bobBtn').onclick=()=>{viewBobLevel=viewBobLevel===1?.45:viewBobLevel===.45?0:1;$('#bobBtn').textContent='Passos: '+(viewBobLevel===1?'Normal':viewBobLevel===.45?'Leve':'Off');};

// Sistemas de Blockcraft 0.4: florestas, NPCs, campanha e progressão local.
const worldsDef=[
['Floresta Encantada',['Primeiros passos','A floresta perdida','Ataque noturno','Defenda a aldeia','Guardião da Floresta']],
['Deserto Perdido',['Areias perigosas','Templo esquecido','Invasão dos arqueiros','Labirinto subterrâneo','Colosso de Areia']],
['Montanhas Geladas',['Escalada congelante','Caverna de cristais','Tempestade de neve','Fortaleza abandonada','Gigante de Gelo']],
['Pântano Sombrio',['Águas perigosas','Invasão dos monstros','Cabana da feiticeira','Segredo do pântano','Bruxa Ancestral']],
['Mundo Vulcânico',['Terra de lava','Fortaleza flamejante','Criaturas de fogo','Portal perdido','Titã de Magma']],
['Reino do Dragão',['Ilhas flutuantes','Templo dos guardiões','Exército das sombras','Torre final','Dragão do Vazio']]];
const npcTypes=window.BLOCKCRAFT_BESTIARIO.map((mob,i)=>({
 ...mob,kind:mob.tipo==='passivo'?'friendly':mob.tipo==='neutro'?'neutral':mob.tipo==='chefe'?'boss':
 ['creeper','magma'].includes(mob.id)?'blast':['enderman'].includes(mob.id)?'teleport':
 ['esqueleto','bruxa','ghast','blaze','guardiao'].includes(mob.id)?'ranged':'chase',
 damage:mob.tipo==='passivo'?0:mob.tipo==='chefe'?18:mob.tipo==='hostil'?7:3,
 health:mob.tipo==='chefe'?25:mob.tipo==='hostil'?4:5,drop:mob.tipo==='hostil'?'Fragmento':'Recurso'}));
const npcById=id=>npcTypes.find(n=>n.id===id)||npcTypes[0];
// Arvores voxel persistentes: cada cubo pode ser minerado individualmente.
const TREE_SPECIES=[
 {name:'Carvalho',log:'#77502f',leaf:'#34793d',height:4,radius:2},
 {name:'Pinheiro',log:'#6b4830',leaf:'#286044',height:6,radius:2},
 {name:'Acacia',log:'#8e6441',leaf:'#749546',height:4,radius:2},
 {name:'Carvalho gigante',log:'#59432e',leaf:'#3b8443',height:7,radius:3}
];
const treeMaterials=TREE_SPECIES.map((v,i)=>{
 const log=new BABYLON.StandardMaterial('casca_'+i,scene);log.diffuseColor=BABYLON.Color3.FromHexString(v.log);log.specularColor=new BABYLON.Color3(.025,.025,.025);
 const leaf=new BABYLON.StandardMaterial('folha_'+i,scene);leaf.diffuseColor=BABYLON.Color3.FromHexString(v.leaf);leaf.specularColor=new BABYLON.Color3(.025,.045,.025);
 return {log,leaf};
});
const treeVoxelCache=new Map();
function treeLayout(x,z,h,type){
 const spec=TREE_SPECIES[type];const cubes=new Map();
 const add=(xx,yy,zz,part)=>{const k=key(xx,yy,zz);if(!cubes.has(k)||part==='log')cubes.set(k,{x:xx,y:yy,z:zz,part})};
 for(let i=0;i<spec.height;i++)add(x,h+1+i,z,'log');
 const top=h+spec.height;
 if(type===1){
  for(let ly=top-3;ly<=top+2;ly++){
   const radius=ly>=top+1?0:ly===top?1:ly===top-3?2:2;
   for(let dx=-radius;dx<=radius;dx++)for(let dz=-radius;dz<=radius;dz++){
    if(Math.abs(dx)+Math.abs(dz)<=radius*2) add(x+dx,ly,z+dz,'leaf');
   }
  }
 }else{
  for(let ly=top-2;ly<=top+1;ly++){
   const radius=(ly===top+1?1:ly===top-2?spec.radius-1:spec.radius);
   for(let dx=-radius;dx<=radius;dx++)for(let dz=-radius;dz<=radius;dz++){
    if(Math.abs(dx)===radius&&Math.abs(dz)===radius&&hash(x+dx*31+ly,z+dz*19)>.5)continue;
    add(x+dx,ly,z+dz,'leaf');
   }
  }
 }
 return [...cubes.values()];
}
function treeVoxelExists(x,y,z){
 // Verificacao local para impedir colocar blocos dentro das arvores visiveis.
 const ck=key(x,y,z);if(edits.has('treepart:'+ck))return false;
 for(const meshes of world.values())for(const m of meshes){if(m.metadata?.treeBlock&&m.metadata.x===x&&m.metadata.y===y&&m.metadata.z===z)return true;}
 return false;
}
const waterMat=new BABYLON.StandardMaterial('agua_translucida',scene);waterMat.diffuseColor=new BABYLON.Color3(.05,.36,.69);waterMat.alpha=.70;waterMat.specularColor=new BABYLON.Color3(.4,.55,.7);waterMat.backFaceCulling=false;
function addWaters(cx,cz,meshes){for(let x=cx*CHUNK;x<cx*CHUNK+CHUNK;x+=2)for(let z=cz*CHUNK;z<cz*CHUNK+CHUNK;z+=2){if(heightAt(x,z)>SEA_LEVEL&&heightAt(x+1,z+1)>SEA_LEVEL)continue;let q=BABYLON.MeshBuilder.CreateGround('agua',{width:2,height:2},scene);q.position.set(x+1,SEA_LEVEL+1.03,z+1);q.material=waterMat;q.isPickable=false;meshes.push(q)}}
function renderTreePart(part,type,meshes){
 if(edits.has('treepart:'+key(part.x,part.y,part.z)))return;
 // Folhas e madeira em cubos voxel, sem malhas cilindricas ou copas esfericas.
 if(getBlock(part.x,part.y,part.z)>=0)return;
 const m=BABYLON.MeshBuilder.CreateBox('arvore_'+part.part,{size:1},scene);
 m.position.set(part.x+.5,part.y+.5,part.z+.5);
 m.material=treeMaterials[type][part.part==='log'?'log':'leaf'];
 m.metadata={treeBlock:true,part:part.part,x:part.x,y:part.y,z:part.z,species:type};
 m.isPickable=true;meshes.push(m);
}
function addTrees(cx,cz,meshes){
 let placed=0;
 // Distribuicao deterministica de arvores com espaco para explorar.
 for(let x=cx*CHUNK+2;x<cx*CHUNK+CHUNK-1;x+=4)for(let z=cz*CHUNK+2;z<cz*CHUNK+CHUNK-1;z+=4){
  if(hash(x*7,z*13)<.68||heightAt(x,z)<5||placed>=3||edits.has('tree:'+x+','+z))continue;
  const h=heightAt(x,z);const type=Math.min(3,Math.floor(hash(x*27,z*31)*4));placed++;
  for(const part of treeLayout(x,z,h,type)){
   // Blocos da copa pertencem a regiao que os contem para nao desaparecer na borda.
   if(Math.floor(part.x/CHUNK)!==cx||Math.floor(part.z/CHUNK)!==cz)continue;
   renderTreePart(part,type,meshes);
  }
 }
 // Cubos de copas cujas arvores comecam em uma regiao vizinha.
 for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){
  if(dx===0&&dz===0)continue;const ax=cx+dx,az=cz+dz;let n=0;
  for(let x=ax*CHUNK+2;x<ax*CHUNK+CHUNK-1;x+=4)for(let z=az*CHUNK+2;z<az*CHUNK+CHUNK-1;z+=4){
   if(hash(x*7,z*13)<.68||heightAt(x,z)<5||n>=3||edits.has('tree:'+x+','+z))continue;n++;
   const h=heightAt(x,z),type=Math.min(3,Math.floor(hash(x*27,z*31)*4));
   for(const part of treeLayout(x,z,h,type))if(Math.floor(part.x/CHUNK)===cx&&Math.floor(part.z/CHUNK)===cz)renderTreePart(part,type,meshes);
  }
 }
 // Arvores replantadas salvas nas modificacoes do mundo.
 for(const [id,plant] of edits){if(!id.startsWith('planted:')||!plant||typeof plant!=='object')continue;
  const type=plant.type%TREE_SPECIES.length;
  for(const part of treeLayout(plant.x,plant.z,plant.y-1,type)){
   if(Math.floor(part.x/CHUNK)===cx&&Math.floor(part.z/CHUNK)===cz)renderTreePart(part,type,meshes);
  }
 }
}
let npcs=[],life=100,air=20,damageScreen=0,lastHostileRefresh=0;const MAX_AIR=20,DROWN_DAMAGE=16;const skyDay=new BABYLON.Color3(.46,.72,.96),skyNight=new BABYLON.Color3(.018,.027,.09),skyDusk=new BABYLON.Color3(.86,.36,.27);let worldTime=.24;try{const st=JSON.parse(localStorage.getItem(stateKey)||'{}');if(Number.isFinite(st.worldTime))worldTime=st.worldTime;}catch(e){}
function makeNPC(def,x,z,isBoss=false){
 const model=window.criarMonstroBlockcraft(scene,def);
 const root=model.root;
 const floor=heightAt(Math.floor(x),Math.floor(z))+1;
 root.position.set(x,floor,z);
 root.metadataBaseY=floor;
 if(isBoss)root.scaling.scaleInPlace(1.7);
 return {def,root,model,hp:isBoss?def.health*2:def.health,x,z,speed:isBoss?1.4:.75+hash(x,z)*.75,isBoss,aggro:false,phase:hash(x,z)*7,attackedAt:0};
}
// Fases mantêm seus adversários de missão. No mundo aberto, inimigos comuns só existem à noite.
function nightNow(){const altitude=Math.sin((worldTime-.25)*Math.PI*2);return altitude<-.12;}
function hostileNPC(n){return n.def.tipo==='hostil'||n.def.tipo==='chefe'||n.def.kind==='boss';}
function spawnNPCs(){
 for(const n of npcs)n.root.dispose(false,true);npcs=[];
 const night=nightNow();
 const count=mode==='creative'?8:mode==='stages'?8:18;
 let pool=mode==='creative'?npcTypes.filter(n=>n.kind==='friendly'||n.kind==='neutral'):
 mode==='stages'?npcTypes.filter(n=>n.kind!=='friendly'&&n.kind!=='neutral'&&n.kind!=='boss'):
 npcTypes.filter(n=>n.kind!=='boss'&&(night||n.tipo!=='hostil'));
 if(!pool.length)return;
 const tier=mode==='stages'?Math.floor(stageIndex/5):0;
 for(let i=0;i<count;i++){
  const angle=i*2.399,d=9+(i%6)*6,x=player.x+Math.cos(angle)*d,z=player.z+Math.sin(angle)*d;
  let type=pool[(Math.abs(Math.floor(x*31+z*17))+i*7+tier*3)%pool.length];
  const boss=mode==='stages'&&stageIndex%5===4&&i===0;
  if(boss)type=npcById(['golem','warden','golem-neve','bruxa','blaze','dragao'][tier]);
  npcs.push(makeNPC(type,x,z,boss));
 }
}
function syncNightMobs(now){
 if(mode==='stages'||mode==='creative')return;
 const night=nightNow();
 if(!night){
  for(let i=npcs.length-1;i>=0;i--){if(hostileNPC(npcs[i])){npcs[i].root.dispose(false,true);npcs.splice(i,1)}}
 }else if(now-lastHostileRefresh>9000){
  lastHostileRefresh=now;
  const hostileCount=npcs.filter(hostileNPC).length;
  const pool=npcTypes.filter(t=>t.tipo==='hostil'&&t.kind!=='boss');
  for(let i=hostileCount;i<Math.min(8,hostileCount+3);i++){
   const a=hash(Math.floor(now/1000)+i,i*37)*Math.PI*2,d=16+hash(i*13,Math.floor(now/1000))*22;
   const x=player.x+Math.cos(a)*d,z=player.z+Math.sin(a)*d;
   const type=pool[Math.floor(hash(Math.floor(x),Math.floor(z))*pool.length)];
   if(type)npcs.push(makeNPC(type,x,z));
  }
 }
}

function hitNPC(){let selected=null,dist=5;
 for(const n of npcs){let dx=n.x-player.x,dz=n.z-player.z,d=Math.hypot(dx,dz);const dot=(dx*Math.sin(yaw)+dz*Math.cos(yaw))/Math.max(.1,d);
 if(d<dist&&dot>.84){selected=n;dist=d;}}
 if(!selected)return false;sounds.play('hit');selected.hp--;selected.aggro=true;toast(selected.def.name+' '+Math.max(0,selected.hp)+' ❤');
 if(selected.hp<=0){selected.root.dispose(false,true);npcs.splice(npcs.indexOf(selected),1);npcKills++;coins+=4;stageObjective++;toast('+4 moedas · '+selected.def.drop);sounds.play('reward');}
 return true;}
function updateNPCs(dt,now){if(!started)return;
 if(!npcs.length&&now-stageStartedAt>1000)spawnNPCs();
 syncNightMobs(now);
 for(const n of npcs){let dx=player.x-n.x,dz=player.z-n.z,d=Math.hypot(dx,dz);
 if(d>65){n.root.dispose(false,true);npcs.splice(npcs.indexOf(n),1);continue;}
 n.phase+=dt;if(mode==='creative' || (n.def.kind==='friendly'||n.def.kind==='neutral')&&!n.aggro){
 n.x+=Math.sin(n.phase*.6)*dt*.32;n.z+=Math.cos(n.phase*.55)*dt*.32;
 } else if(d<20){if(n.def.kind==='teleport'&&n.phase>9){n.phase=0;n.x=player.x+Math.sin(now)*8;n.z=player.z+Math.cos(now)*8;}
 else if(d>1.4){n.x+=dx/Math.max(d,.01)*n.speed*dt;n.z+=dz/Math.max(d,.01)*n.speed*dt;}
 if(d<2.1&&now-n.attackedAt>1550&&mode!=='creative'){n.attackedAt=now;life=Math.max(0,life-n.def.damage);sounds.play('damage');if(life===0){toast('Você desmaiou! Voltando ao início.');life=100;player.x=2;player.z=2;player.y=15;}}
 }
 n.root.position.set(n.x,heightAt(Math.floor(n.x),Math.floor(n.z))+1+Math.sin(n.phase*2)*.08,n.z);
 n.root.rotation.y=Math.atan2(dx,dz);n.root.metadataBaseY=heightAt(Math.floor(n.x),Math.floor(n.z))+1;n.model.update(dt,n.phase,n.speed);
 }if(npcs.length<3&&mode!=='stages'&&now-stageStartedAt>8000){stageStartedAt=now;spawnNPCs();}
 $('#life').textContent=mode==='creative'?'✦ Criativo':`❤ ${life}`;$('#coins').textContent=`◈ ${coins} · 🪵 ${wood} · 🌱 ${saplings} · 🌿 ${sticks}`;
}
function respawnByWater(){
 life=100;air=MAX_AIR;player={x:2,y:heightAt(2,2)+4,z:2};velocityY=0;grounded=false;
 sounds.play('damage');toast('Você ficou sem ar! Voltando à superfície.');
}
function updateWaterPhysics(dt){
 const x=Math.floor(player.x),z=Math.floor(player.z),feet=player.y;
 const wetFeet=liquidAt(x,Math.floor(feet+.25),z)==='water';
 const submerged=liquidAt(x,Math.floor(feet+1.55),z)==='water';
 const partial=wetFeet||submerged;
 if(partial){
  // Arrasto e empuxo: a água freia a queda; Espaço permite nadar para cima.
  velocityY=Math.max(velocityY,-2.3);
  velocityY=Math.min(3.5,velocityY+9*dt);
  if(keys.Space||keys.ArrowUp)velocityY=Math.min(3.8,velocityY+12*dt);
  if(keys.ControlLeft||keys.ControlRight)velocityY=Math.max(-3,velocityY-9*dt);
  grounded=false;
 }
 if(mode==='creative'){air=MAX_AIR;}else if(submerged){
  air=Math.max(0,air-dt);
  if(air===0){life=Math.max(0,life-DROWN_DAMAGE*dt);if(life===0)respawnByWater();}
 }else{air=Math.min(MAX_AIR,air+dt*5);}
 const bar=$('#air');if(bar){
  bar.style.display=submerged||air<MAX_AIR?'inline-flex':'none';
  bar.textContent='🫧 Ar '+Math.ceil(air)+'s'+(air===0?' · Afogando!':'');
  bar.style.color=air<5?'#ff8a79':'#b8f1ff';
 }
 return partial;
}
function clamp01(v){return Math.max(0,Math.min(1,v))}
function updateDayNight(dt){
 worldTime=(worldTime+dt/(settings.dayMinutes*60))%1;
 // 0.25 = nascer do sol; 0.5 = meio-dia; 0.75 = por do sol; 0 = meia-noite.
 const angle=(worldTime-.25)*Math.PI*2,altitude=Math.sin(angle),day=clamp01((altitude+.12)/.38),twilight=clamp01(1-Math.abs(altitude)/.30)*(altitude>-.18?1:.5);
 const sky=BABYLON.Color3.Lerp(skyNight,skyDay,day);sky.r=sky.r*(1-twilight*.48)+skyDusk.r*twilight*.48;sky.g=sky.g*(1-twilight*.48)+skyDusk.g*twilight*.48;sky.b=sky.b*(1-twilight*.48)+skyDusk.b*twilight*.48;
 scene.clearColor=new BABYLON.Color4(sky.r,sky.g,sky.b,1);
 scene.fogColor=BABYLON.Color3.Lerp(new BABYLON.Color3(.035,.055,.12),sky,day*.9);
 light.intensity=.18+day*.88;sun.intensity=day*1.28;moon.intensity=(1-day)*.19;
 sun.direction.set(-Math.cos(angle)*.3,-Math.max(.05,altitude),-.55).normalize();
 moon.direction.set(.3,-Math.max(.1,-altitude),.4).normalize();
 sunDisc.position.set(player.x+Math.cos(angle)*95,player.y+altitude*90,player.z+50);
 moonDisc.position.set(player.x-Math.cos(angle)*95,player.y-altitude*90,player.z-50);
 sunDisc.setEnabled(altitude>-.06);moonDisc.setEnabled(altitude<.08);
 const hh=Math.floor(worldTime*24),mm=Math.floor(worldTime*1440)%60;
 const label=$('#clock');if(label)label.textContent=`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} ${day>.5?'☀':'☾'}`;
}
function stageSetup(){const w=worldsDef[Math.floor(stageIndex/5)],level=w[1][stageIndex%5];$('#mission').textContent=`Fase ${stageIndex+1}/30 · ${w[0]} · ${level}`;
 $('#objective').textContent=stageIndex%5===4?'Derrote o chefe':'Derrote criaturas ou quebre 5 blocos';}
function updateMission(){if(mode!=='stages')return;let target=stageIndex%5===4?1:5;
 $('#objective').textContent=`Objetivo: ${stageObjective}/${target}`;
 if(stageObjective>=target){stageObjective=0;stageWins[stageIndex]=true;stars+=3;coins+=25;
 toast('Fase concluída! +3 estrelas e +25 moedas');stageIndex=(stageIndex+1)%30;stageSetup();spawnNPCs();}}
for(let wi=0;wi<worldsDef.length;wi++)for(let li=0;li<5;li++){let opt=document.createElement('option');opt.value=wi*5+li;opt.textContent=`${wi*5+li+1}. ${worldsDef[wi][0]}: ${worldsDef[wi][1][li]}`;$('#stageSelect').appendChild(opt);}
$('#mode').addEventListener('change',()=>{$('#stagePicker').style.display=$('#mode').value==='stages'?'flex':'none';});

function start(){sounds.unlock();started=true;air=MAX_AIR;mode=$('#mode').value;stageIndex=Number($('#stageSelect').value||0);npcKills=0;stageObjective=0;stageStartedAt=performance.now();setCharacter($('#character').value);if(mode==='stages'){player={x:2,y:12,z:2};edits.clear();stageSetup();}// Recupera o personagem se o save antigo o deixou dentro de terreno/objetos.
 const px=Math.floor(player.x),pz=Math.floor(player.z);
 if(!Number.isFinite(player.y)||collidesAt(player.x,player.y,player.z)||player.y<heightAt(px,pz)-1){
   let ok=false;
   for(let rad=0;rad<=7&&!ok;rad++)for(let ax=-rad;ax<=rad&&!ok;ax++)for(let az=-rad;az<=rad&&!ok;az++){
     const x=px+ax,z=pz+az,y=heightAt(x,z)+1.15;
     if(!collidesAt(x+.5,y,z+.5)&&!collidesAt(x+.5,y+.6,z+.5)){
       player.x=x+.5;player.z=z+.5;player.y=y;ok=true;
     }
   }
   if(!ok){player.x=2.5;player.z=2.5;player.y=heightAt(2,2)+3;}
 }
 velocityY=0;grounded=false;updateWorld();$('#menu').classList.add('hidden');$('#hud').classList.remove('hidden');plantButton.style.display='block';toast(mode==='stages'?'Complete a missão para liberar a próxima fase!':'V alterna a câmera • Explore e construa!')};$('#start').onclick=start;
// Colisão física em células reais: remover blocos elimina o suporte do jogador.
// player.y representa a sola dos pés. O corpo ocupa 0.52 x 1.8 blocos.
const BODY_RADIUS=.27,BODY_HEIGHT=1.8,GRAVITY=22,JUMP_SPEED=8.2,TERMINAL_SPEED=32,STEP_HEIGHT=.48;
const offsets=[[-BODY_RADIUS,-BODY_RADIUS],[-BODY_RADIUS,BODY_RADIUS],[BODY_RADIUS,-BODY_RADIUS],[BODY_RADIUS,BODY_RADIUS]];
function solid(x,y,z){return getBlock(Math.floor(x),Math.floor(y),Math.floor(z))>=0}
function collidesAt(x,y,z){
 for(const [dx,dz] of offsets){for(const dy of [.08,.90,BODY_HEIGHT-.08])if(solid(x+dx,y+dy,z+dz))return true;}return false;
}
function groundLevel(x,z,feet,step){
 let top=-Infinity;
 for(const [dx,dz] of offsets){let xx=Math.floor(x+dx),zz=Math.floor(z+dz),max=Math.floor(feet+step-.0001);
 for(let y=Math.min(25,max);y>=MIN_DEPTH;y--){if(getBlock(xx,y,zz)>=0){top=Math.max(top,y+1);break;}}}
 return top;
}
function tryMoveAxis(axis,amount){if(Math.abs(amount)<1e-8)return;
 let nx=player.x+(axis==='x'?amount:0),nz=player.z+(axis==='z'?amount:0);
 if(!collidesAt(nx,player.y,nz)){player.x=nx;player.z=nz;return;}
 if(grounded&&velocityY<=0){const stepY=player.y+STEP_HEIGHT;
  if(!collidesAt(nx,stepY,nz)&&groundLevel(nx,nz,stepY,.02)>player.y+.03){player.x=nx;player.z=nz;player.y=stepY;grounded=false;velocityY=0;}}
}
let last=performance.now(),lastChunk=0,lastSave=0,lastAI=0,lastCreatureSound=0,wasSwimming=false;
engine.runRenderLoop(()=>{
 let now=performance.now(),dt=Math.min(.045,(now-last)/1000);last=now;
 if(started){
  const f0=(keys.KeyW?1:0)-(keys.KeyS?1:0)+held.forward,r0=(keys.KeyD?1:0)-(keys.KeyA?1:0)+held.right;
  const len=Math.max(1,Math.hypot(f0,r0));let f=f0/len,r=r0/len;
  const crouch=keys.ShiftLeft||keys.ShiftRight,running=(keys.ControlLeft||keys.ControlRight)&&!crouch,speed=(crouch?2.05:running?6.6:4.35)*(liquidAt(Math.floor(player.x),Math.floor(player.y+.5),Math.floor(player.z))==='water'?.48:1);
  const dx=(Math.sin(yaw)*f+Math.cos(yaw)*r)*speed*dt,dz=(Math.cos(yaw)*f-Math.sin(yaw)*r)*speed*dt;
  // Primeiro movimentação horizontal com colisão nas paredes.
  tryMoveAxis('x',dx);tryMoveAxis('z',dz);
  // Natação e ar: a cabeça submersa determina o tempo restante.
  const swimming=updateWaterPhysics(dt);if(swimming&&!wasSwimming)sounds.play('splash');wasSwimming=swimming;
  // Fora da água, Espaço pula. Dentro da água, Espaço sobe.
  if(keys.Space&&grounded&&!swimming){velocityY=JUMP_SPEED;grounded=false;sounds.play('jump');}
  // Descobrir se existe piso real imediatamente sob o personagem.
  let support=groundLevel(player.x,player.z,player.y,.06);
  if(grounded&&support<player.y-.09)grounded=false;
  if(!grounded){const prevY=player.y;lastVerticalVelocity=velocityY;velocityY=Math.max(swimming?-2.3:-TERMINAL_SPEED,velocityY-(swimming?4.8:GRAVITY)*dt);let newY=prevY+velocityY*dt;
   if(velocityY<=0){const landing=groundLevel(player.x,player.z,prevY,.01);
    if(landing!==-Infinity&&landing<=prevY+.02&&newY<=landing){newY=landing;sounds.play('land');impactStrength=Math.min(1,Math.abs(velocityY)/19);velocityY=0;grounded=true;}}
   else if(collidesAt(player.x,newY,player.z)){newY=prevY;velocityY=0;}
   player.y=newY;
  }else if(support>player.y&&support-player.y<.1){player.y=support;}
  if(player.y<MIN_DEPTH-6){player.y=heightAt(Math.floor(player.x),Math.floor(player.z))+6;velocityY=0;grounded=false;life=Math.max(1,life-25);toast('Limite técnico da camada subterrânea atingido.');}const cellLiquid=liquidAt(Math.floor(player.x),Math.floor(player.y),Math.floor(player.z));if(cellLiquid==='lava'&&mode!=='creative'){life=Math.max(0,life-dt*14);if(life===0){life=100;player.y=heightAt(Math.floor(player.x),Math.floor(player.z))+3;velocityY=0;toast('A lava queimou você!')}}
  const walking=Math.hypot(f,r)>.12;
  const groundMotion=walking&&grounded;if(groundMotion){const surface=swimming?'water':getBlock(Math.floor(player.x),Math.floor(player.y-0.15),Math.floor(player.z))===3?'wood':getBlock(Math.floor(player.x),Math.floor(player.y-0.15),Math.floor(player.z))===2?'stone':'grass';sounds.step(surface,running);}sounds.ambience(nightNow(),swimming,cellLiquid==='lava');
  const currentStride=groundMotion?(running?1.32:1.65):0;
  if(groundMotion)stepPhase+=speed*dt*Math.hypot(f,r)*Math.PI/currentStride;
  bobBlend=damp(bobBlend,groundMotion?1:0,groundMotion?10:7,dt);
  if(grounded&&airborne){landingKick=Math.min(1,Math.max(.18,Math.abs(velocityY)*.035));airborne=false;}
  if(!grounded)airborne=true;
  landingKick=damp(landingKick,0,10,dt);impactStrength=damp(impactStrength,0,9,dt);
  const gait=walking?Math.sin(stepPhase)*.49*bobBlend:0;
  for(const [name,part] of Object.entries(avatarParts))if(part){
    const opposite=(name==='leftArm'||name==='rightLeg')?1:-1;
    part.rotation.x=opposite*gait-(name.includes('Arm')?Math.sin(Math.max(0,1-(now-swingTime)/310)*Math.PI)*.8:0);
    if(name.includes('Arm'))part.rotation.z=(name==='leftArm'?-1:1)*(.06+.018*bobBlend);
  }
  const mining=Math.max(0,1-(now-swingTime)/310);handArms.forEach((arm,i)=>{
    const strike=i===1?Math.sin(mining*Math.PI):.15*Math.sin(mining*Math.PI);
    arm.rotation.x=-.3+Math.sin(stepPhase+i*Math.PI)*.21*bobBlend-strike*1.15;
    arm.position.z=.85-(strike*.14);arm.position.y=-.65+.04*Math.sin(stepPhase+i*Math.PI)*bobBlend;
  });
  cameraUpdate(dt);
  if(now-lastChunk>450){updateWorld();$('#coords').textContent=`X ${Math.floor(player.x)} · Y ${Math.floor(player.y)} · Z ${Math.floor(player.z)} · ${camMode?'3ª':'1ª'} pessoa`;lastChunk=now;}
  if(now-lastAI>85){updateNPCs(Math.min(.15,(now-lastAI)/1000),now);lastAI=now;}if(now-lastCreatureSound>6500&&npcs.length){const close=npcs.find(n=>Math.hypot(n.x-player.x,n.z-player.z)<13);if(close){sounds.play((close.def.tipo==='hostil'||close.def.tipo==='chefe')?'monster':'animal');lastCreatureSound=now;}}
  if(now-lastSave>30000){save(true);lastSave=now;}
 }
 updateDayNight(started?dt:0);
 scene.render();
});
window.addEventListener('resize',()=>engine.resize());window.addEventListener('beforeunload',()=>{if(started)save(true)});
})();
