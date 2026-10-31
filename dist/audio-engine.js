/* Blockcraft 1.1: efeitos sonoros ORIGINAIS sintetizados no dispositivo. */
(()=>{'use strict';
let ctx,master,noiseBuffer,unlocked=false,muted=false,volume=.58,lastStep=0,lastAmbient=0,lastWater=0,lastLava=0;
const clamp=v=>Math.max(0,Math.min(1,v));
function setup(){if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC();master=ctx.createGain();master.gain.value=muted?0:volume;master.connect(ctx.destination);const size=ctx.sampleRate*2;noiseBuffer=ctx.createBuffer(1,size,ctx.sampleRate);const d=noiseBuffer.getChannelData(0);let s=12345;for(let i=0;i<size;i++){s=(Math.imul(s,1664525)+1013904223)|0;d[i]=((s>>>0)/4294967296)*2-1;}}
function unlock(){setup();if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});unlocked=true;}
function tone(freq=220,dur=.15,gain=.07,kind='sine',endFreq=0,delay=0){if(!ctx||muted)return;const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type=kind;o.frequency.setValueAtTime(Math.max(25,freq),t);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(25,endFreq),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.009);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.03);}
function hiss(dur=.14,gain=.07,low=100,high=2200,delay=0){if(!ctx||muted)return;const t=ctx.currentTime+delay,source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),env=ctx.createGain();source.buffer=noiseBuffer;source.loop=true;filter.type='bandpass';filter.frequency.value=(low+high)/2;filter.Q.value=.65;env.gain.setValueAtTime(.0001,t);env.gain.linearRampToValueAtTime(gain,t+.008);env.gain.exponentialRampToValueAtTime(.0001,t+dur);source.connect(filter);filter.connect(env);env.connect(master);source.start(t,Math.random());source.stop(t+dur+.025);}
function play(name,detail=''){if(!unlocked||muted)return;switch(name){
case 'step': {const isWater=detail==='water',isWood=detail==='wood',isStone=detail==='stone',isSand=detail==='sand';hiss(.075,isWater?.045:.048,isStone?120:180,isStone?1600:1100);tone(isWood?155:isStone?100:isSand?115:125,.063,.035,'triangle',75);break;}
case 'wood':hiss(.19,.095,130,1200);tone(175,.16,.085,'triangle',85);tone(105,.10,.035,'sine',65,.035);break;
case 'leaves':hiss(.25,.068,700,3900);break;
case 'stone':hiss(.12,.115,350,2600);tone(290,.09,.05,'square',160);break;
case 'dirt':hiss(.18,.075,75,1000);tone(95,.13,.045,'triangle',55);break;
case 'ore':hiss(.14,.065,350,2600);tone(640,.24,.072,'sine',950);tone(1010,.24,.038,'sine',1230,.09);break;
case 'place':tone(135,.11,.064,'triangle',75);hiss(.055,.036,130,1200);break;
case 'attack':hiss(.12,.088,250,2100);tone(220,.13,.045,'sawtooth',105);break;
case 'hit':tone(190,.15,.095,'sawtooth',50);hiss(.09,.09,170,1400);break;
case 'damage':tone(150,.32,.11,'sawtooth',48);hiss(.2,.085,150,1400);break;
case 'jump':tone(185,.15,.046,'sine',300);break;
case 'land':tone(85,.14,.055,'triangle',50);hiss(.08,.05,80,850);break;
case 'splash':hiss(.33,.12,250,2700);tone(100,.22,.05,'sine',180);break;
case 'bubble':tone(210+Math.random()*210,.19,.031,'sine',450+Math.random()*200);break;
case 'lava':hiss(.22,.055,70,530);tone(65,.26,.044,'triangle',44);break;
case 'night':tone(480,.8,.012,'sine',400);tone(720,1,.009,'sine',610,.2);break;
case 'day':tone(560,.8,.016,'sine',780);tone(830,.7,.011,'sine',920,.22);break;
case 'monster':tone(95,.35,.066,'sawtooth',58);hiss(.17,.032,90,620);break;
case 'animal':tone(235,.25,.04,'triangle',170);tone(180,.22,.032,'sine',140,.12);break;
case 'reward':for(let i=0;i<3;i++)tone([392,494,659][i],.23,.052,'sine',0,i*.095);break;
}}
function step(surface='grass',running=false){let t=performance.now();if(t-lastStep<(running?245:385))return;lastStep=t;play('step',surface)}
function ambience(isNight,inWater,inLava){const t=performance.now();if(!unlocked||muted)return;if(t-lastAmbient>9800){lastAmbient=t;play(isNight?'night':'day')}if(inWater&&t-lastWater>1100){lastWater=t;play('bubble')}if(inLava&&t-lastLava>2400){lastLava=t;play('lava')}}
function setVolume(v){volume=clamp(v);if(master)master.gain.value=muted?0:volume;localStorage.setItem('blockcraft_audio_volume',String(volume));}
function toggle(){muted=!muted;if(!muted)unlock();if(master)master.gain.value=muted?0:volume;localStorage.setItem('blockcraft_audio_muted',muted?'1':'0');return !muted}
try{muted=localStorage.getItem('blockcraft_audio_muted')==='1';const v=Number(localStorage.getItem('blockcraft_audio_volume'));if(v>0&&v<=1)volume=v}catch{}
window.BlockcraftAudio={unlock,play,step,ambience,toggle,setVolume,get muted(){return muted},get volume(){return volume}};
})();
