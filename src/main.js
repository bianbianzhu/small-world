import './style.css';
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createBedroom,connectRooms} from './world/bedroom.js';
import {createRoomViews} from './roomViews.js';
import {createRoom} from './world/room.js';
import {createToys,createDecor} from './world/toys.js';
import {Yueyue} from './character/Yueyue.js';
import {Director} from './behaviors/Director.js';
import {mergeStatic} from './world/merge.js';
import {t,toyText,activityText,applyStatic,toggleLang,onLangChange} from './i18n.js';
applyStatic();
const canvas=document.querySelector('#world');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:true,powerPreference:'high-performance'});}catch(error){document.querySelector('#loading').innerHTML=`<p>${t('webgl')}</p>`;throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xf5f0e6);scene.fog=new THREE.Fog(0xf5f0e6,32,65);
const camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,.1,100);const initial=new THREE.Vector3(13,12.5,17);camera.position.copy(initial);
const controls=new OrbitControls(camera,canvas);controls.target.set(-.3,.6,0);controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=6;controls.maxDistance=46;controls.minPolarAngle=.28;controls.maxPolarAngle=Math.PI*.48;controls.enablePan=false;controls.autoRotateSpeed=.45;
// Cool sky fill, warm afternoon key, and restrained reflected light from the floor.
scene.add(new THREE.HemisphereLight(0xd6ebff,0xcdb58f,1.45));
const sun=new THREE.DirectionalLight(0xffebcf,2.6);sun.position.set(-3,7,-7);sun.target.position.set(.3,0,.8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:25});sun.shadow.bias=-.00012;sun.shadow.normalBias=.018;sun.shadow.radius=3;sun.shadow.blurSamples=8;scene.add(sun,sun.target);
const fill=new THREE.DirectionalLight(0xffe9d2,.45);fill.position.set(3,3,6);scene.add(fill);
const renderTarget=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:Math.min(4,renderer.capabilities.maxSamples)});
const composer=new EffectComposer(renderer,renderTarget);composer.setPixelRatio(Math.min(devicePixelRatio,1.5));composer.addPass(new RenderPass(scene,camera));
const contactAO=new GTAOPass(scene,camera,1,1);contactAO.updateGtaoMaterial({radius:.22,thickness:.35,distanceExponent:1.5});contactAO.blendIntensity=.38;composer.addPass(contactAO);composer.addPass(new OutputPass());
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xf5f0e6,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.4;floor.receiveShadow=true;scene.add(floor);
createRoom(scene);const bedroom=createBedroom(scene);connectRooms(scene);const toys=[...createToys(scene),...bedroom.toys];createDecor(scene);const yueyue=new Yueyue(scene);let activity={key:null,toy:null};function showActivity(){document.querySelector('#activity-text').textContent=activity.key?activityText(activity.key,activity.toy):t('activityDefault');}
const director=new Director(yueyue,toys,(key,toy)=>{activity={key,toy};showActivity();});showActivity();showActivity();
// Bake the ~1,200 static primitives into a few dozen draw calls. Every node that moves as a whole
// (toy roots, movable props, character joints) keeps its own merged meshes; parts animated one by one stay separate.
{const units=[];yueyue.root.traverse(o=>{if(o.isGroup)units.push(o)});for(const t of toys){units.push(t.root);for(const p of [t.parts.moving,t.parts.page])if(p?.isGroup)units.push(p);}
const exclude=[...yueyue.eyes];for(const t of toys)for(const p of [t.parts.moving,...(t.parts.bars??[]),...(t.parts.mallets??[])])if(p?.isMesh)exclude.push(p);
const merged=mergeStatic(scene,{units,exclude});if(import.meta.env.DEV){console.info('[perf] merged static meshes',merged);window.__world={renderer,scene,composer};}}
const roomViews=createRoomViews(camera,controls);
document.querySelector('#visit-bedroom').onclick=()=>{roomViews.select('bedroom');invite(bedroom.toys[0]);};
// One continuous sun direction covers both rooms, with enough shadow texels for the wider home.
sun.position.x+=4.0;sun.target.position.x+=4.0;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-13;sun.shadow.camera.right=13;sun.shadow.camera.top=10;sun.shadow.camera.bottom=-10;sun.shadow.camera.updateProjectionMatrix();
// Slow, almost imperceptible floating dust in the warm window light.
const dustPositions=new Float32Array(70*3);for(let i=0;i<70;i++){dustPositions[i*3]=(Math.random()-.5)*9;dustPositions[i*3+1]=Math.random()*3+.3;dustPositions[i*3+2]=(Math.random()-.5)*7}const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xfff6cc,size:.025,transparent:true,opacity:.42,depthWrite:false}));scene.add(dust);
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.setViewOffset(w,h,w>760?-w*.12:0,w>760?0:-h*.06,w,h);camera.updateProjectionMatrix();}window.addEventListener('resize',resize);resize();
function zoom(factor){roomViews.cancel();const v=camera.position.clone().sub(controls.target);const d=THREE.MathUtils.clamp(v.length()*factor,controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(v.setLength(d));}
document.querySelector('#zoom-in').onclick=()=>zoom(.85);document.querySelector('#zoom-out').onclick=()=>zoom(1.17);document.querySelector('#reset').onclick=()=>roomViews.reset();document.querySelector('#rotate').onclick=e=>{roomViews.cancel();controls.autoRotate=!controls.autoRotate;e.currentTarget.classList.toggle('active',controls.autoRotate);e.currentTarget.setAttribute('aria-pressed',String(controls.autoRotate));};
document.querySelector('#pause').onclick=e=>{director.paused=!director.paused;e.currentTarget.textContent=director.paused?'▷':'Ⅱ';e.currentTarget.setAttribute('aria-label',t(director.paused?'resume':'pause'));};
const panel=document.querySelector('#toy-panel');function setPanel(open){panel.hidden=!open;document.querySelector('#toys-toggle').setAttribute('aria-expanded',String(open));}document.querySelector('#toys-toggle').onclick=()=>setPanel(panel.hidden);document.querySelector('#close-toys').onclick=()=>setPanel(false);window.addEventListener('keydown',e=>{if(e.key==='Escape')setPanel(false)});
function invite(toy){director.select(toy);director.paused=false;document.querySelector('#pause').textContent='Ⅱ';document.querySelector('#pause').setAttribute('aria-label',t('pause'));}
const toyButtons=toys.map(toy=>{const button=document.createElement('button');button.onclick=()=>{invite(toy);setPanel(false)};document.querySelector('#toy-list').append(button);return [toy,button];});function labelToys(){for(const [toy,button] of toyButtons)button.textContent=`${toy.icon}  ${toyText(toy).label}`;}labelToys();
// Language toggle: static copy, toy names, the live activity line and any stateful aria-labels.
document.querySelector('#lang').onclick=()=>toggleLang();onLangChange(()=>{applyStatic();labelToys();showActivity();document.querySelector('#pause').setAttribute('aria-label',t(director.paused?'resume':'pause'));document.querySelector('#sound').setAttribute('aria-label',t(audioOn?'soundOff':'soundOn'));});
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down={x:0,y:0};function hit(e){const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(toys.map(t=>t.root),true)[0];}canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});canvas.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;const target=hit(e);if(target)invite(toys.find(t=>t.id===target.object.userData.toyId));});canvas.addEventListener('pointermove',e=>canvas.style.cursor=hit(e)?'pointer':'grab');
// Opt-in synthesized ambience: no autoplay and no external audio dependency.
let audioCtx,audioOn=false,nextNote=0;const notes=[261.63,293.66,329.63,392,440,523.25,587.33];function chime(note,volume=.035){if(!audioOn||!audioCtx)return;const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=notes[note%notes.length];gain.gain.setValueAtTime(0,audioCtx.currentTime);gain.gain.linearRampToValueAtTime(volume,audioCtx.currentTime+.015);gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+2);osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+2.1);}director.onBeat=n=>chime(n,.065);
document.querySelector('#sound').onclick=async e=>{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();await audioCtx.resume();audioOn=!audioOn;e.currentTarget.style.background=audioOn?'#dfe6d0':'#ffffff60';e.currentTarget.setAttribute('aria-label',t(audioOn?'soundOff':'soundOn'));e.currentTarget.setAttribute('aria-pressed',String(audioOn));if(audioOn)chime(3);};
// 60 fps is plenty for this slow-moving scene; on 120 Hz displays this halves the GPU work.
const clock=new THREE.Clock();let time=0;let alive=true;let lastFrame=-Infinity;function frame(now=performance.now()){if(!alive)return;requestAnimationFrame(frame);if(now-lastFrame<1000/61)return;lastFrame=now;const dt=Math.min(clock.getDelta(),.05);time+=dt;director.update(dt);roomViews.update(dt);if(audioOn&&time>nextNote){nextNote=time+3.2;chime(Math.floor(Math.random()*7),.018)}dust.rotation.y=Math.sin(time*.035)*.025;controls.update();composer.render();}frame();document.querySelector('#loading').style.opacity=0;setTimeout(()=>document.querySelector('#loading').remove(),900);
document.addEventListener('visibilitychange',()=>{director.pausedBeforeHidden??=director.paused;if(document.hidden){director.pausedBeforeHidden=director.paused;director.paused=true;audioCtx?.suspend();}else{director.paused=director.pausedBeforeHidden;clock.getDelta();if(audioOn)audioCtx?.resume();}});
if(import.meta.hot)import.meta.hot.dispose(()=>{alive=false;controls.dispose();composer.passes.forEach(p=>p.dispose?.());composer.dispose();renderer.dispose();audioCtx?.close();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}}});});
