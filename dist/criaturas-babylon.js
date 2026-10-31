// Blockcraft 0.8: 32 modelos Babylon.js adaptados do bestiário enviado pelo usuário.
// Os modelos do arquivo original eram Three.js e não são utilizados diretamente.
window.BLOCKCRAFT_BESTIARIO=[{id:'zumbi',name:'Zumbi',tipo:'hostil'},{id:'esqueleto',name:'Esqueleto',tipo:'hostil'},{id:'creeper',name:'Creeper',tipo:'hostil'},{id:'aranha',name:'Aranha',tipo:'hostil'},{id:'enderman',name:'Enderman',tipo:'neutro'},{id:'bruxa',name:'Bruxa',tipo:'hostil'},{id:'afogado',name:'Afogado',tipo:'hostil'},{id:'deserto',name:'Zumbi do deserto',tipo:'hostil'},{id:'warden',name:'Guardião profundo',tipo:'hostil'},{id:'ghast',name:'Ghast',tipo:'hostil'},{id:'blaze',name:'Blaze',tipo:'hostil'},{id:'dragao',name:'Dragão',tipo:'chefe'},{id:'magma',name:'Cubo de magma',tipo:'hostil'},{id:'endermite',name:'Endermite',tipo:'hostil'},{id:'vaca',name:'Vaca',tipo:'passivo'},{id:'porco',name:'Porco',tipo:'passivo'},{id:'ovelha',name:'Ovelha',tipo:'passivo'},{id:'galinha',name:'Galinha',tipo:'passivo'},{id:'lobo',name:'Lobo',tipo:'neutro'},{id:'gato',name:'Gato',tipo:'passivo'},{id:'cavalo',name:'Cavalo',tipo:'passivo'},{id:'raposa',name:'Raposa',tipo:'passivo'},{id:'tartaruga',name:'Tartaruga',tipo:'passivo'},{id:'vaca-cogumelo',name:'Vaca cogumelo',tipo:'passivo'},{id:'aldeao',name:'Aldeão',tipo:'passivo'},{id:'golem',name:'Golem de ferro',tipo:'neutro'},{id:'golem-neve',name:'Golem de neve',tipo:'neutro'},{id:'abelha',name:'Abelha',tipo:'neutro'},{id:'morcego',name:'Morcego',tipo:'passivo'},{id:'peixe',name:'Peixe tropical',tipo:'passivo'},{id:'lula',name:'Lula',tipo:'passivo'},{id:'guardiao',name:'Guardião oceânico',tipo:'hostil'}];
window.criarMonstroBlockcraft=function(scene,def){
 const B=BABYLON, root=new B.TransformNode('criatura_'+def.id,scene),nodes=[],limbs=[];
 const colors={pele:'#7cb879',escuro:'#243344',osso:'#dcd9ca',metal:'#8d99a5',luz:'#ef5a46',branco:'#efeee5'};
 const palette={zumbi:['#65a88a','#51a4b7','#5069a6'],esqueleto:['#e5e1d2','#c9c8bc','#a7a7ab'],creeper:['#56b36b','#3f9560','#426b39'],aranha:['#49434e','#342d3a','#27242c'],enderman:['#23222d','#17151d','#17151d'],bruxa:['#77aa69','#6b4585','#51415d'],afogado:['#5cafa8','#456e65','#39588a'],deserto:['#cab58a','#a08c66','#655740'],warden:['#31565b','#338c9a','#223e4b'],ghast:['#e5e7e6','#e5e7e6','#e5e7e6'],blaze:['#f2bc54','#cc7b29','#dc922f'],dragao:['#272334','#383149','#22212c'],magma:['#e65b1c','#9b351e','#c97627'],endermite:['#6d438c','#46316d','#573476'],vaca:['#ddd9cc','#ddd9cc','#8b807b'],porco:['#e7a1a3','#e7a1a3','#c57c86'],ovelha:['#e4decc','#f5f5e8','#c8c8bd'],galinha:['#f4f0e6','#f4f0e6','#ed972e'],lobo:['#8f969a','#bcc3c2','#6e767c'],gato:['#d48c54','#d48c54','#b37b4f'],cavalo:['#956640','#956640','#5a3a2f'],raposa:['#de8144','#e9a35b','#534235'],tartaruga:['#6a9d56','#3c7145','#50835a'],aldeao:['#dbb48c','#976d4d','#72533b'],golem:['#c7c9bc','#9ba8a0','#969a91'],abelha:['#e2b83f','#e2b83f','#24242a'],peixe:['#e0a345','#37a7bd','#37a7bd'],lula:['#3485aa','#3485aa','#3485aa'],guardiao:['#369ca9','#388f9f','#a57240']};
 const p=palette[def.id]||['#9c8c73','#776b5d','#574d44'];
 const material=(hex,glow=false)=>{let m=new B.StandardMaterial('m_'+def.id+'_'+Math.random(),scene);m.diffuseColor=B.Color3.FromHexString(hex);m.specularColor=new B.Color3(.08,.08,.08);if(glow)m.emissiveColor=m.diffuseColor.scale(.65);return m};
 const mats=p.map(x=>material(x)),black=material('#191a22'),white=material('#fff7e3'),eyes=material(def.id==='enderman'?'#bd65f9':def.tipo==='hostil'?'#ff644a':'#202332',def.id==='enderman'||def.tipo==='hostil');
 function part(name,w,h,d,x,y,z,mat,parent=root){let m=B.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);m.material=mat;m.parent=parent;m.position.set(x,y,z);m.isPickable=false;nodes.push(m);return m}
 function pivot(name,x,y,z,parent=root){let t=new B.TransformNode(name,scene);t.parent=parent;t.position.set(x,y,z);return t}
 const animal=['vaca','porco','ovelha','lobo','gato','cavalo','raposa','tartaruga','vaca-cogumelo','galinha'].includes(def.id);
 const insect=['aranha','endermite'].includes(def.id), float=['ghast','blaze','abelha','morcego','lula','guardiao','peixe','dragao'].includes(def.id);
 if(def.id==='dragao'){
  part('corpo_dragao',1.1,.65,2.25,0,1.42,0,mats[0]);part('cabeca_dragao',.8,.63,.8,0,1.7,1.33,mats[0]);
  for(let s of [-1,1]){part('olho',.12,.13,.04,s*.23,1.83,1.75,eyes);let w=pivot('asa',s*.48,1.65,-.2);part('membrana_asa',1.8,.09,1.1,s*.95,0,0,mats[1],w);limbs.push(w);for(let z of [-.65,.65])part('pata',.23,.6,.29,s*.41,.8,z,mats[2])}
  for(let i=0;i<4;i++)part('cauda',.53-i*.1,.27,.48,0,1.3-i*.13,-1.36-i*.33,mats[0]);root.scaling.setAll(1.45);
 }else if(insect){
  part('corpo',.8,.52,.72,0,.59,-.15,mats[0]);part('cabeca',.58,.47,.48,0,.61,.43,mats[0]);
  for(let s of [-1,1])for(let k=0;k<4;k++){let leg=pivot('pata_aracnidea',s*.29,.65,-.45+k*.3);part('segmento',.65,.13,.12,s*.28,-.14,0,mats[1],leg);part('ponta',.13,.58,.13,s*.52,-.42,0,mats[1],leg);limbs.push(leg)}
  for(let x of [-.16,-.055,.055,.16])part('olho',.07,.075,.035,x,.75,.69,eyes);
 }else if(animal){
  part('corpo',.74,.62,1.05,0,.84,0,mats[1]);part('cabeca',.57,.56,.56,0,1.05,.64,mats[0]);
  part('focinho',.32,.22,.18,0,.94,.96,mats[2]);for(let s of [-1,1]){part('olho',.095,.095,.03,s*.16,1.15,.94,eyes);part('orelha',.15,.22,.16,s*.24,1.41,.59,mats[0]);for(let z of [-.35,.38]){let l=pivot('perna',s*.24,.62,z);part('perna_articulada',.2,.53,.22,0,-.26,0,mats[2],l);limbs.push(l)}}
  if(['lobo','gato','raposa','cavalo'].includes(def.id))part('cauda',.15,.2,.5,0,1,-.72,mats[0]);
  if(def.id==='vaca'||def.id==='vaca-cogumelo')for(let s of [-1,1])part('mancha',.04,.29,.31,s*.38,.86,-.12,black);
  if(def.id==='ovelha')for(let x of [-.25,0,.25])for(let z of [-.33,0,.33])part('la',.29,.23,.31,x,1.17,z,white);
  if(def.id==='galinha')root.scaling.setAll(.72);
 }else if(def.id==='ghast'){
  part('corpo_fantasma',1.5,1.5,1.5,0,1.55,0,mats[0]);for(let x of [-.32,.32])part('olho',.22,.24,.04,x,1.75,.77,black);
  for(let x of [-.5,-.16,.16,.5])for(let z of [-.3,.3]){let leg=pivot('tentaculo',x,.78,z);part('tentaculo_parte',.17,.68,.18,0,-.35,0,mats[0],leg);limbs.push(leg)}
 }else if(def.id==='blaze'){
  part('nucleo',.58,.58,.53,0,1.3,0,mats[0]);for(let s of [-1,1])part('olho',.11,.11,.035,s*.15,1.4,.28,eyes);
  for(let i=0;i<10;i++){let a=i*Math.PI*2/10,t=pivot('orbita',0,1.23,0);part('barra_fogo',.13,.53,.15,Math.cos(a)*.75,(i%3)*.13,Math.sin(a)*.75,mats[1],t);limbs.push(t)}
 }else if(['magma','slime'].includes(def.id)){
  part('gel_corpo',.96,.94,.95,0,.49,0,mats[0]);for(let s of [-1,1])part('olho',.11,.13,.04,s*.23,.63,.49,eyes);
 }else{
  const tall=def.id==='enderman'||def.id==='warden',headY=tall?2.28:1.91;
  part('tronco',.72,.83,.43,0,1.28,0,mats[1]);part('cabeca',.62,.61,.56,0,headY,0,mats[0]);
  for(let s of [-1,1]){part('olho',.115,.1,.035,s*.17,headY+.075,.297,eyes);
   let a=pivot('braco',s*.51,1.62,0);part('braco_modelado',.24,.74,.28,0,-.36,0,mats[1],a);limbs.push(a);
   let l=pivot('perna',s*.2,.8,0);part('perna_modelada',.25,.76,.28,0,-.39,0,mats[2],l);limbs.push(l)}
  if(def.id==='bruxa'){part('aba_chapeu',.85,.15,.84,0,2.28,0,black);part('chapeu',.5,.46,.5,0,2.58,0,black)}
  if(def.id==='aldeao')part('nariz',.15,.24,.18,0,headY-.09,.38,mats[0]);
  if(def.id==='esqueleto')for(let s of [-1,1])part('costela',.18,.06,.035,s*.18,1.3,.24,black);
  if(def.id==='warden')for(let s of [-1,1])part('antena',.18,.4,.18,s*.25,2.65,0,eyes);
  if(tall)root.scaling.setAll(1.14);
 }
 const originalY=0;
 return {root,update(dt,t,speed=1){const stride=Math.sin(t*5*speed)*.3;limbs.forEach((l,i)=>{l.rotation.x=stride*(i%2?-1:1)});if(float)root.position.y=originalY+Math.sin(t*2)*.10+root.metadataBaseY;},dispose(){root.dispose(false,true)}};
};
