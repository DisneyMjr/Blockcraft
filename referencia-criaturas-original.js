// THREE carregado como script classico no HTML

// Blockcraft: modelos procedurais originais no estilo voxel.
// Cada objeto retorna THREE.Group com userData.update(dt, time) para animação.
const mat = (color, extras={}) => new THREE.MeshStandardMaterial({color, roughness:.88, flatShading:true,...extras});
const C = {
  grass:mat('#77a64b'), dirt:mat('#6b4932'), green:mat('#53a86b'), moss:mat('#355d35'), darkGreen:mat('#254a34'),
  white:mat('#f1eee3'), cream:mat('#e4cf99'), gray:mat('#8c8b87'), grayDark:mat('#44474d'), black:mat('#1c1b25'),
  eye:mat('#0f1321'), pink:mat('#e99fa6'), red:mat('#aa4245'), brown:mat('#886044'), brownDark:mat('#49322a'),
  aqua:mat('#4ba6b9'), cyan:mat('#33b6c6'), blue:mat('#3a61ac'), purple:mat('#644d99'), orange:mat('#d98d42'),
  gold:mat('#bba15c'), glow:mat('#e27039',{emissive:'#bd3b0b',emissiveIntensity:1.3}),
  violetGlow:mat('#be58f3',{emissive:'#862bd3',emissiveIntensity:1.4}), redGlow:mat('#ff5756',{emissive:'#d02720',emissiveIntensity:1.3})
};
function box(p,m,x,y,z,w,h,d){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o}
function group(p,x=0,y=0,z=0){const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g}
function eyes(p,x,y,z,space=.24,size=.09,m=C.eye){box(p,m,x-space,y,z,size,size,.025);box(p,m,x+space,y,z,size,size,.025)}
function nose(p,x,y,z,w=.18,h=.12,m=C.pink){box(p,m,x,y,z,w,h,.04)}
function legs(p,m,xs,y,z,w=.17,h=.5,d=.2){return xs.map(x=>{const pivot=group(p,x,y,z);box(p,m,0,-h/2,0,w,h,d);return pivot})}
function animate(g,pivots=[],mode='walk',speed=1){g.userData.update=(dt,t)=>{const a=Math.sin(t*speed*4)*.28; pivots.forEach((p,i)=>p.rotation.x=a*(i%2?-1:1));if(mode==='float'){g.position.y=g.userData.baseY+Math.sin(t*speed*2)*.14;g.rotation.z=Math.sin(t*speed)*.035;}else if(mode==='crawl'){g.position.y=g.userData.baseY+Math.sin(t*speed*7)*.025;} };g.userData.baseY=g.position.y;return g}
function quadruped(name,body,head,leg,opts={}){
 const g=new THREE.Group(); const scale=opts.scale||1;g.scale.setScalar(scale);
 box(g,body,0,.78,0,.65,.63,1.02);const h=group(g,0,1.02,.61);
 box(h,head,0,.02,.12,.56,.55,.55);eyes(h,0,.11,.406,.16,.075);
 nose(h,0,-.08,.414,.25,.16,opts.nose||C.pink);
 if(opts.ears){for(const x of [-.22,.22])box(h,head,x,.39,.04,.17,.29,.18)}
 if(opts.horns){for(const x of [-.22,.22])box(h,C.cream,x,.46,.1,.13,.27,.13)}
 if(opts.wool){for(const x of [-.26,0,.26])for(const z of [-.33,0,.33])box(g,C.white,x,1.12,z,.31,.29,.37)}
 if(opts.spots){box(g,C.black,-.31,.86,-.15,.035,.31,.35);box(g,C.black,.32,.73,.25,.035,.24,.24)}
 if(opts.tail)box(g,opts.tail,0,.95,-.64,.14,.15,.41);
 const piv=[];for(const x of [-.24,.24])for(const z of [-.34,.35])piv.push(...legs(g,leg,[x],.49,z,.17,.48,.19));
 g.userData.name=name;return animate(g,piv);
}
function humanoid(name,skin,shirt,pants,details={}){
 const g=new THREE.Group();box(g,pants,0,.64,0,.55,.72,.3);box(g,shirt,0,1.34,0,.73,.78,.4);
 const head=group(g,0,1.93,0);box(head,skin,0,0,0,.62,.62,.59);eyes(head,0,.07,.305,.16,.11,details.eye||C.eye);
 if(details.mouth)box(head,details.mouth,0,-.17,.307,.29,.055,.024);
 const arms=[];for(const x of [-.5,.5]){const p=group(g,x,1.65,0);box(p,shirt,0,-.34,0,.27,.68,.3);box(p,skin,0,-.71,0,.26,.13,.29);arms.push(p)}
 const feet=[];for(const x of [-.16,.16])feet.push(...legs(g,pants,[x],.3,0,.23,.52,.28));
 g.userData.name=name;animate(g,[...arms,...feet]);return g;
}
function spider(name,body=C.grayDark,eye=C.redGlow,scale=1){
 const g=new THREE.Group();g.scale.setScalar(scale);box(g,body,0,.65,-.18,.69,.53,.77);box(g,body,0,.61,.41,.52,.46,.53);
 for(let i=0;i<4;i++){const z=-.42+i*.33;for(const s of [-1,1]){let pivot=group(g,s*.31,.7,z);box(pivot,body,s*.32,-.06,0,.6,.14,.13);box(pivot,body,s*.58,-.32,0,.14,.62,.15);}}
 for(const x of [-.18,-.06,.06,.18])box(g,eye,x,.73,.687,.07,.075,.02);
 g.userData.name=name;return animate(g,[],'crawl',1.7);
}
function creeper(){const g=new THREE.Group();box(g,C.green,0,1.05,0,.62,1.08,.5);box(g,C.green,0,1.87,0,.73,.75,.68);
 for(const x of [-.18,.18])box(g,C.eye,x,1.98,.351,.15,.2,.023);
 box(g,C.eye,0,1.76,.356,.12,.22,.028);box(g,C.eye,-.1,1.65,.355,.17,.12,.025);box(g,C.eye,.1,1.65,.355,.17,.12,.025);
 const p=[];for(const x of [-.25,.25])for(const z of [-.21,.21])p.push(...legs(g,C.moss,[x],.54,z,.2,.55,.2));g.userData.name='Creeper';return animate(g,p)}
function slime(name,color,eye=C.eye){const g=new THREE.Group();const shell=box(g,color,0,.5,0,.94,.94,.94);shell.material=color.clone();shell.material.transparent=true;shell.material.opacity=.86;eyes(g,0,.61,.482,.22,.14,eye);box(g,C.moss,0,.35,.485,.25,.08,.025);g.userData.name=name;animate(g,[],'float',1.6);g.userData.baseY=0;return g}
function enderman(){const g=humanoid('Enderman',C.black,C.black,C.black,{eye:C.violetGlow});g.scale.set(0.76,1.55,.76);return g}
function skeleton(){const g=humanoid('Esqueleto',C.white,C.white,C.gray,{mouth:C.grayDark});box(g,C.grayDark,0,1.4,.213,.11,.41,.03);for(const x of [-.2,0,.2])box(g,C.grayDark,x,1.46,.217,.045,.08,.02);return g}
function ghast(){const g=new THREE.Group();box(g,C.white,0,1.5,0,1.5,1.5,1.48);eyes(g,0,1.76,.751,.35,.19,C.grayDark);box(g,C.grayDark,0,1.19,.753,.25,.28,.02);for(const x of [-.52,-.17,.17,.52])for(const z of [-.45,0,.45])box(g,C.white,x,.45,z,.2,.73,.22);g.userData.name='Ghast';return animate(g,[],'float',.55)}
function blaze(){const g=new THREE.Group();box(g,C.gold,0,1.2,0,.58,.61,.58);eyes(g,0,1.28,.302,.16,.11,C.glow);for(let i=0;i<10;i++){const a=2*Math.PI*i/10,r=.72;box(g,i%2?C.orange:C.gold,Math.cos(a)*r,1.08+(i%3)*.22,Math.sin(a)*r,.17,.54,.15)}g.userData.name='Blaze';return animate(g,[],'float',1.1)}
function dragon(){const g=new THREE.Group();const m=C.black;box(g,m,0,1.7,0,1.2,.64,2.35);box(g,m,0,1.92,1.4,.64,.58,.98);box(g,m,0,1.73,1.95,.92,.54,.8);eyes(g,0,1.91,2.359,.28,.14,C.violetGlow);
 for(const x of [-.39,.39])box(g,m,x,2.06,2.2,.2,.28,.22);for(let i=0;i<5;i++)box(g,m,0,1.6-i*.12,-1.5-i*.37,.6-i*.08,.3,.48);
 const wings=[];for(const s of [-1,1]){const w=group(g,s*.55,1.99,-.2);box(w,m,s*1.08,.04,0,2.2,.12,1.22);for(let i=0;i<3;i++)box(w,C.purple,s*(.7+i*.6),-.17,-.37+i*.36,.62,.065,.55);wings.push(w)}
 const lp=[];for(const x of [-.43,.43])for(const z of [-.65,.65])lp.push(...legs(g,m,[x],1.45,z,.3,.85,.28));g.scale.setScalar(.75);g.userData.name='Dragão';animate(g,lp,'float',.55);const old=g.userData.update;g.userData.update=(dt,t)=>{old(dt,t);wings[0].rotation.z=Math.sin(t*2)*-.22;wings[1].rotation.z=Math.sin(t*2)*.22};return g}
function fish(name,body,tail){const g=new THREE.Group();box(g,body,0,.51,0,.75,.53,.37);box(g,tail,0,.5,-.47,.44,.37,.09);box(g,tail,0,.87,-.05,.18,.27,.19);for(const x of [-.24,.24])box(g,C.eye,x,.57,.199,.1,.1,.024);g.userData.name=name;return animate(g,[],'float',1)}
function squid(){const g=new THREE.Group();box(g,C.aqua,0,1.1,0,.77,.94,.77);eyes(g,0,1.09,.401,.22,.13);for(const x of [-.31,-.1,.1,.31])for(const z of [-.23,.23])box(g,C.aqua,x,.38,z,.14,.59,.13);g.userData.name='Lula';return animate(g,[],'float',1)}
function bee(){const g=new THREE.Group();box(g,C.gold,0,.69,0,.65,.46,.8);for(const z of [-.2,.11])box(g,C.black,0,.69,z,.67,.47,.13);eyes(g,0,.76,.407,.2,.07);for(const x of [-.23,.23])box(g,C.white,x,.98,-.08,.33,.06,.42);g.userData.name='Abelha';return animate(g,[],'float',2)}
function wolf(){const g=quadruped('Lobo',C.gray,C.white,C.grayDark,{ears:true,tail:C.gray,nose:C.black});box(g,C.white,0,.95,.52,.43,.25,.26);return g}
function villager(){const g=humanoid('Aldeão',C.cream,C.brown,C.brownDark);box(g,C.brownDark,0,2.18,.02,.72,.15,.68);box(g,C.cream,0,1.9,.37,.16,.28,.19);return g}
function guardian(){const g=new THREE.Group();box(g,C.aqua,0,.87,0,.93,.91,.93);for(const x of [-.53,.53])for(const y of [.6,1.14])box(g,C.orange,x,y,0,.2,.12,.18);for(const z of [-.53,.53])box(g,C.orange,0,.89,z,.2,.19,.18);box(g,C.white,0,.96,.48,.46,.36,.05);box(g,C.eye,0,.96,.515,.2,.2,.025);g.userData.name='Guardião';return animate(g,[],'float',.8)}
function chicken(){const g=quadruped('Galinha',C.white,C.white,C.orange,{scale:.68,nose:C.orange});box(g,C.red,0,1.52,.5,.16,.24,.17);return g}
function pig(){return quadruped('Porco',C.pink,C.pink,C.pink,{nose:C.red,ears:true})}
function cow(){return quadruped('Vaca',C.white,C.white,C.grayDark,{spots:true,horns:true,nose:C.pink})}
function sheep(){return quadruped('Ovelha',C.cream,C.cream,C.gray,{wool:true})}
function horse(){const g=quadruped('Cavalo',C.brown,C.brown,C.brownDark,{tail:C.brownDark,ears:true});g.scale.set(1,1.12,1.16);return g}
function cat(){return quadruped('Gato',C.orange,C.orange,C.orange,{scale:.7,ears:true,tail:C.orange,nose:C.pink})}
function turtle(){const g=new THREE.Group();box(g,C.moss,0,.48,0,1,.41,.97);box(g,C.green,0,.73,0,.83,.19,.82);box(g,C.green,0,.47,.68,.43,.31,.35);eyes(g,0,.52,.872,.14,.08);for(const x of [-.47,.47])for(const z of [-.36,.36])box(g,C.green,x,.2,z,.23,.24,.29);g.userData.name='Tartaruga';return animate(g,[],'crawl',.7)}
function fox(){return quadruped('Raposa',C.orange,C.orange,C.brownDark,{ears:true,tail:C.orange,nose:C.black})}
function golem(){const g=humanoid('Golem de ferro',C.white,C.gray,C.gray,{eye:C.red});g.scale.set(1.35,1.4,1.2);box(g,C.green,0,1.48,.25,.21,.28,.045);return g}
function warden(){const g=humanoid('Guardião profundo',C.darkGreen,C.aqua,C.darkGreen,{eye:C.cyan});g.scale.set(1.5,1.5,1.5);for(const x of [-.32,.32])box(g,C.cyan,x,2.34,0,.2,.43,.22);box(g,C.black,0,1.35,.24,.38,.34,.05);return g}
function witch(){const g=humanoid('Bruxa',C.green,C.purple,C.grayDark);box(g,C.black,0,2.4,0,.79,.21,.75);box(g,C.black,0,2.69,0,.48,.52,.48);box(g,C.cream,0,2.75,.25,.21,.1,.06);return g}
function bat(){const g=new THREE.Group();box(g,C.brownDark,0,.6,0,.36,.39,.3);eyes(g,0,.62,.164,.1,.06,C.redGlow);for(const s of [-1,1]){box(g,C.brownDark,s*.44,.68,0,.59,.075,.4);box(g,C.brownDark,s*.9,.57,0,.36,.075,.28)}g.userData.name='Morcego';return animate(g,[],'float',2)}
function zombie(){return humanoid('Zumbi',C.green,C.aqua,C.blue,{mouth:C.darkGreen})}
function drowned(){return humanoid('Afogado',C.aqua,C.moss,C.blue,{eye:C.white})}
function husk(){return humanoid('Zumbi do deserto',C.cream,C.brown,C.brownDark,{eye:C.black})}
function snowgolem(){const g=new THREE.Group();box(g,C.white,0,.6,0,.86,.85,.78);box(g,C.white,0,1.38,0,.63,.66,.6);box(g,C.orange,0,1.31,.4,.16,.16,.4);eyes(g,0,1.49,.311,.16,.09);g.userData.name='Golem de neve';return animate(g,[],'walk')}
function magma(){return slime('Cubo de magma',C.glow,C.gold)}
function endermite(){return spider('Endermite',C.purple,C.violetGlow,.53)}
function mooshroom(){const g=quadruped('Vaca cogumelo',C.red,C.red,C.red,{spots:true,horns:true});for(const x of [-.23,.25])box(g,C.red,x,1.31,0,.36,.22,.35);return g}

const BESTIARIO = [
 ['zumbi','Zumbi','hostil',zombie],['esqueleto','Esqueleto','hostil',skeleton],['creeper','Creeper','hostil',creeper],['aranha','Aranha','hostil',()=>spider('Aranha')],['enderman','Enderman','neutro',enderman],['bruxa','Bruxa','hostil',witch],['afogado','Afogado','hostil',drowned],['deserto','Zumbi do deserto','hostil',husk],['warden','Guardião profundo','hostil',warden],['ghast','Ghast','hostil',ghast],['blaze','Blaze','hostil',blaze],['dragao','Dragão','chefe',dragon],['magma','Cubo de magma','hostil',magma],['endermite','Endermite','hostil',endermite],
 ['vaca','Vaca','passivo',cow],['porco','Porco','passivo',pig],['ovelha','Ovelha','passivo',sheep],['galinha','Galinha','passivo',chicken],['lobo','Lobo','neutro',wolf],['gato','Gato','passivo',cat],['cavalo','Cavalo','passivo',horse],['raposa','Raposa','passivo',fox],['tartaruga','Tartaruga','passivo',turtle],['vaca-cogumelo','Vaca cogumelo','passivo',mooshroom],['aldeao','Aldeão','passivo',villager],['golem','Golem de ferro','neutro',golem],['golem-neve','Golem de neve','neutro',snowgolem],['abelha','Abelha','neutro',bee],['morcego','Morcego','passivo',bat],['peixe','Peixe tropical','passivo',()=>fish('Peixe tropical',C.orange,C.cyan)],['lula','Lula','passivo',squid],['guardiao','Guardião oceânico','hostil',guardian]
].map(([id,nome,tipo,criar])=>({id,nome,tipo,criar}));
function criarCriatura(id){const item=BESTIARIO.find(c=>c.id===id);if(!item)throw new Error('Criatura desconhecida: '+id);const g=item.criar();g.userData.id=id;g.userData.tipo=item.tipo;return g}
function atualizarCriaturas(scene,dt,tempo){scene.traverse(o=>{if(o.userData.update)o.userData.update(dt,tempo)})}

window.BlockcraftCriaturas={BESTIARIO,criarCriatura,atualizarCriaturas};
