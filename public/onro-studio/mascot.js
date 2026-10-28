import * as THREE from './vendor/three.module.js';
import {moods,gestures} from './actions.js';

const palette = {jade:0x58a88c, ivory:0xfff5e6, coral:0xf47c80, plum:0x351638, rubber:0x326f5b, paper:0xfbf9f5};

export function createMascot(container, onError, options={}) {
  const scene = new THREE.Scene();
  scene.background = options.transparent?null:new THREE.Color(palette.paper);
  if(!options.transparent)scene.fog = new THREE.Fog(palette.paper, 12, 24);
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 60);
  camera.position.set(2.3, 2.9, 8.1); camera.lookAt(0, 1.85, 0);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:!!options.transparent});
  if(options.transparent)renderer.setClearColor(0x000000,0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault(); onError('The 3D canvas lost its connection. Reload to try again. The original concept is shown instead.');
  });
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb7c2ac, 2.6));
  const key = new THREE.DirectionalLight(0xfff4e3, 3.8);
  key.position.set(-3,7,5); key.castShadow = true;
  key.shadow.mapSize.set(1024,1024); key.shadow.camera.left=-5; key.shadow.camera.right=5;
  key.shadow.camera.top=6; key.shadow.camera.bottom=-3; key.shadow.normalBias=.025;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd7eeff, 2); fill.position.set(5,4,-3); scene.add(fill);
  const materials = Object.fromEntries(Object.entries(palette).map(([name,color]) => [name,new THREE.MeshStandardMaterial({color,roughness:name==='rubber'?.78:.32,metalness:.06})]));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80,80),options.transparent?new THREE.ShadowMaterial({opacity:.12}):materials.paper);
  floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; floor.position.y=-.03;scene.add(floor);
  const root = new THREE.Group(); scene.add(root);
  const torso = new THREE.Group(); root.add(torso);
  const sphereGeometry = new THREE.SphereGeometry(1,40,28);
  function ellipsoid(parent,mat,x,y,z,sx,sy,sz) {
    const mesh=new THREE.Mesh(sphereGeometry,materials[mat]); mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function rounded(parent,mat,w,h,d,r,x,y,z) {
    const s=new THREE.Shape(),left=-w/2,bottom=-h/2;
    s.moveTo(left+r,bottom);s.lineTo(left+w-r,bottom);s.quadraticCurveTo(left+w,bottom,left+w,bottom+r);
    s.lineTo(left+w,bottom+h-r);s.quadraticCurveTo(left+w,bottom+h,left+w-r,bottom+h);
    s.lineTo(left+r,bottom+h);s.quadraticCurveTo(left,bottom+h,left,bottom+h-r);
    s.lineTo(left,bottom+r);s.quadraticCurveTo(left,bottom,left+r,bottom);
    const geometry=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.055,bevelThickness:.055,curveSegments:18});
    geometry.translate(0,0,-d/2);
    const mesh=new THREE.Mesh(geometry,materials[mat]);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  rounded(root,'ivory',1.55,.53,.7,.23,0,.57,0);
  ellipsoid(torso,'ivory',0,1.12,0,.64,.64,.43);
  ellipsoid(torso,'jade',0,1.54,0,.66,.67,.44);
  const diamond=rounded(torso,'coral',.23,.23,.04,.07,0,1.6,.435);diamond.rotation.z=Math.PI/4;
  ellipsoid(torso,'rubber',0,2.01,0,.25,.19,.22);
  const head=new THREE.Group();head.position.set(0,2.35,0);torso.add(head);
  const shell=rounded(head,'jade',2.25,1.68,.64,.52,0,.38,0);
  shell.rotation.z=-.025;
  rounded(head,'ivory',1.99,1.39,.045,.43,0,.36,.38);
  const swoosh=ellipsoid(head,'ivory',.18,1.18,.05,.63,.09,.31);swoosh.rotation.z=-.14;
  const faceCanvas=document.createElement('canvas');faceCanvas.width=768;faceCanvas.height=512;
  const ctx=faceCanvas.getContext('2d');
  if(!ctx) throw new Error('Facial canvas is unavailable.');
  const texture=new THREE.CanvasTexture(faceCanvas);texture.colorSpace=THREE.SRGBColorSpace;
  const face=new THREE.Mesh(new THREE.PlaneGeometry(1.87,1.23),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
  face.position.set(0,.36,.469);head.add(face);
  const wheels=[];
  for(const side of [-1,1]) {
    const wheel=new THREE.Group();wheel.position.set(side*.91,.48,0);root.add(wheel);wheels.push(wheel);
    const tire=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,.33,48),materials.rubber);tire.rotation.z=Math.PI/2;tire.castShadow=true;wheel.add(tire);
    const rim=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.345,40),materials.ivory);rim.rotation.z=Math.PI/2;wheel.add(rim);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.37,3),materials.coral);hub.rotation.z=Math.PI/2;wheel.add(hub);
    for(let i=0;i<18;i++) {
      const angle=i*Math.PI*2/18;
      const tread=new THREE.Mesh(new THREE.BoxGeometry(.34,.06,.12),materials.jade);
      tread.position.set(0,Math.cos(angle)*.451,Math.sin(angle)*.451);tread.rotation.x=angle;wheel.add(tread);
    }
  }
  const arms=[];
  for(const side of [-1,1]) {
    const shoulder=new THREE.Group();shoulder.position.set(side*.61,1.72,0);torso.add(shoulder);
    ellipsoid(shoulder,'rubber',side*.1,0,0,.18,.18,.18);
    ellipsoid(shoulder,'ivory',side*.28,-.09,0,.31,.17,.18);
    const elbow=new THREE.Group();elbow.position.set(side*.5,-.15,0);shoulder.add(elbow);
    ellipsoid(elbow,'jade',0,-.22,0,.23,.33,.23);
    const hand=new THREE.Group();hand.position.set(0,-.49,.02);elbow.add(hand);
    ellipsoid(hand,'coral',0,-.08,0,.2,.2,.11);
    for(let i=0;i<3;i++) ellipsoid(hand,'coral',(i-1)*.13,-.27,0,.075,.17,.08);
    const thumb=ellipsoid(hand,'coral',side*.2,-.08,.02,.085,.16,.08);thumb.rotation.z=side*.6;
    arms.push({shoulder,elbow,hand,side});
  }
  let look={x:0,y:0},state={mood:'Happy',gesture:'Wave'},paused=false,hidden=document.hidden,disposed=false;
  let previous=performance.now(),time=0,lastFace=-1;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let mouthMotion=false,wheelTravel=0,entranceHeading=0;
  const view={yaw:0,tilt:0,nod:0,left:0,right:0,elbowL:0,elbowR:0,bounce:0,lean:0,roll:0};
  const faces={
    Happy:{eye:1,gaze:0,brow:0,arch:66,mouth:'open',blush:.28,tilt:.04},
    Curious:{eye:1.05,gaze:14,brow:12,arch:59,mouth:'smile',blush:.2,tilt:.16},
    Thinking:{eye:.82,gaze:-22,brow:20,arch:72,mouth:'flat',blush:.1,tilt:-.08},
    Listening:{eye:.9,gaze:0,brow:3,arch:69,mouth:'smile',blush:.13,tilt:.07},
    Excited:{eye:1.12,gaze:0,brow:0,arch:39,mouth:'open',blush:.4,tilt:.1},
    Empathetic:{eye:.88,gaze:0,brow:-22,arch:77,mouth:'smile',blush:.19,tilt:-.12},
    Surprised:{eye:1.16,gaze:0,brow:0,arch:25,mouth:'o',blush:.1,tilt:0},
    Confident:{eye:.91,gaze:5,brow:10,arch:60,mouth:'smile',blush:.15,tilt:.05,wink:1},
    Confused:{eye:.92,gaze:-10,brow:33,arch:82,mouth:'flat',blush:.09,tilt:.23},
    Hopeful:{eye:1.04,gaze:0,brow:-10,arch:54,mouth:'smile',blush:.3,tilt:-.05},
    Proud:{eye:.77,gaze:0,brow:0,arch:49,mouth:'smile',blush:.32,tilt:-.04},
    Grateful:{eye:.68,gaze:0,brow:-5,arch:68,mouth:'smile',blush:.38,tilt:.09},
    Shy:{eye:.86,gaze:24,brow:-8,arch:80,mouth:'small',blush:.52,tilt:-.2},
    Worried:{eye:.96,gaze:-6,brow:-28,arch:86,mouth:'o',blush:.08,tilt:-.09},
    Disappointed:{eye:.62,gaze:0,brow:-18,arch:88,mouth:'frown',blush:.06,tilt:.03},
    Playful:{eye:1.02,gaze:18,brow:18,arch:52,mouth:'open',blush:.34,tilt:.18,wink:0}
  };
  function drawFace(t) {
    ctx.clearRect(0,0,768,512);
    const mood=state.mood,style=faces[mood],blink=!paused&&!reduced.matches&&t%4.6>4.42;
    const eyeHeight=blink?.09:style.eye;
    const gaze=style.gaze+look.x*34,gy=look.y*26;   // the eyes follow the cursor too
    for(const [index,x] of [225,543].entries()) {
      const wink=style.wink===index;
      ctx.save();ctx.translate(x,240);ctx.scale(1,wink?.15:eyeHeight);
      ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(0,0,108,126,0,0,Math.PI*2);ctx.fill();
      const grad=ctx.createRadialGradient(gaze-20,-34+gy,4,gaze,gy,87);grad.addColorStop(0,'#7c407d');grad.addColorStop(1,'#28102c');ctx.fillStyle=grad;
      ctx.beginPath();ctx.ellipse(gaze,2+gy,88,107,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(gaze+25,-38+gy,22,25,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(gaze-24,42+gy,12,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.strokeStyle='#f47c80';ctx.lineWidth=19;ctx.lineCap='round';ctx.beginPath();
      const brow=index===0?style.brow:-style.brow;
      ctx.moveTo(x-47,105+brow);ctx.quadraticCurveTo(x,style.arch,x+47,105-brow);ctx.stroke();
    }
    ctx.fillStyle=`rgba(244,124,128,${style.blush})`;for(const x of [130,638]) {ctx.beginPath();ctx.ellipse(x,345,40,21,0,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#351638';ctx.beginPath();
    if(style.mouth==='o') {ctx.ellipse(384,372,mood==='Worried'?20:30,mood==='Worried'?23:42,0,0,Math.PI*2);ctx.fill();}
    else if(style.mouth!=='open'&&!mouthMotion) {
      const width=style.mouth==='small'?25:39;
      const curve=style.mouth==='frown'?340:style.mouth==='flat'?365:395;
      ctx.moveTo(384-width,365);ctx.quadraticCurveTo(384,curve,384+width,365);ctx.lineWidth=10;ctx.strokeStyle='#351638';ctx.stroke();
    } else {const open=mouthMotion?12*Math.sin(t*15):0;ctx.moveTo(328,347);ctx.quadraticCurveTo(384,375,440,347);ctx.quadraticCurveTo(429,431+open,384,434+open);ctx.quadraticCurveTo(339,427+open,328,347);ctx.fill();ctx.fillStyle='#f47c80';ctx.beginPath();ctx.ellipse(384,415+open,30,15,0,0,Math.PI*2);ctx.fill();}
    texture.needsUpdate=true;
  }
  function render(now) {
    if(disposed)return;
    const delta=Math.min((now-previous)/1000,.05);previous=now;
    if(hidden)return;
    if(!paused&&!reduced.matches)time+=delta;
    const t=time,active=paused||reduced.matches?0:1,s=Math.sin(t*3),g=state.gesture;
    const target={yaw:0,tilt:faces[state.mood].tilt,nod:0,left:-.25,right:.25,elbowL:0,elbowR:0,bounce:0,lean:0,roll:0};
    if(g==='Wave'){target.left=-.35;target.elbowL=-2.25+s*.2*active;}
    if(g==='Nod')target.nod=.17*s*active;
    if(g==='Explain'){target.left=-.8;target.right=.8;target.elbowL=-.4;target.elbowR=.4;target.yaw=.08*s*active;}
    if(g==='Point'){target.right=1.28;target.elbowR=.32;target.yaw=-.18;}
    if(g==='Bounce')target.bounce=Math.abs(Math.sin(t*4))*.18*active;
    if(g==='Turn')target.yaw=Math.sin(t*1.7)*.6*active;
    if(g==='Celebrate'){target.left=-2.3;target.right=2.3;target.bounce=Math.abs(Math.sin(t*5))*.16*active;target.tilt+=s*.12*active;}
    if(g==='Shrug'){target.left=-.62;target.right=.62;target.elbowL=-1.25;target.elbowR=1.25;target.nod=-.1;}
    if(g==='Bow'){target.nod=.25+(1-Math.cos(t*2))*.1*active;target.lean=.16;target.left=.05;target.right=-.05;}
    if(g==='Look-around'){target.yaw=Math.sin(t*1.4)*.23*active;target.nod=-.08;target.tilt=-.13;}
    if(g==='Lean-in'){target.lean=.12;target.nod=.08;target.left=-.42;target.right=.42;}
    if(g==='Clap'){target.left=.4;target.right=-.4;target.elbowL=-1.65+s*.18*active;target.elbowR=1.65-s*.18*active;target.bounce=.025*(s+1)*active;}
    if(g==='Heart'){target.left=.34;target.right=-.34;target.elbowL=-1.6;target.elbowR=1.6;target.tilt=-.08;}
    if(g==='Roll'){target.roll=Math.sin(t*1.3)*.2*active;target.yaw=-.15;target.left=-.5;target.right=.1;}
    const calm=['Rest','Look-around','Nod','Lean-in','Explain'].includes(g),lk=reduced.matches?0:(calm?1:.6);target.yaw+=look.x*.8*lk;target.nod+=look.y*.3*lk;
    for(const key of Object.keys(view))view[key]=reduced.matches?target[key]:THREE.MathUtils.damp(view[key],target[key],7,delta);
    root.position.set(view.roll,view.bounce,0);root.rotation.y=view.yaw+entranceHeading;
    torso.position.y=Math.sin(t*1.7)*.016*active;torso.rotation.x=view.lean;head.rotation.set(view.nod,(state.mood==='Thinking'?-.13:0)+look.x*.35,view.tilt);
    arms[0].shoulder.rotation.z=view.left;arms[1].shoulder.rotation.z=view.right;
    arms[0].elbow.rotation.z=view.elbowL;arms[1].elbow.rotation.z=view.elbowR;
    for(const arm of arms){arm.hand.rotation.y=['Clap','Heart'].includes(g)?arm.side*.75:g==='Explain'?Math.sin(t*2)*.2*active:0;arm.shoulder.rotation.x=['Clap','Heart'].includes(g)?-.85:0;}
    if(g==='Turn')for(const [i,wheel] of wheels.entries())wheel.rotation.x=Math.sin(t*1.7)*.5*(i===0?1:-1)*active;
    else if(g==='Roll')for(const wheel of wheels)wheel.rotation.x=view.roll/.46;
    else for(const wheel of wheels)wheel.rotation.x=reduced.matches?0:THREE.MathUtils.damp(wheel.rotation.x,0,7,delta);
    if(options.transparent)for(const wheel of wheels)wheel.rotation.x=-wheelTravel/.46;
    if(Math.floor(t*24)!==lastFace){drawFace(t);lastFace=Math.floor(t*24);}
    renderer.render(scene,camera);
  }
  const resize=()=>{const {width,height}=container.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize);observer.observe(container);resize();drawFace(0);
  let offscreen=false;const refreshHidden=()=>{hidden=document.hidden||offscreen;};
  const io=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{offscreen=!entries.some(e=>e.isIntersecting);refreshHidden();}):null;if(io)io.observe(container);
  const visibility=()=>{refreshHidden();};document.addEventListener('visibilitychange',visibility);
  renderer.setAnimationLoop(render);
  return {
    setAction(next){if(!next||!moods.includes(next.mood)||!gestures.includes(next.gesture))return false;state={mood:next.mood,gesture:next.gesture};lastFace=-1;return true;},
    setLook(x,y){const nx=Math.max(-1,Math.min(1,+x||0)),ny=Math.max(-1,Math.min(1,+y||0));if(Math.abs(nx-look.x)>.04||Math.abs(ny-look.y)>.04)lastFace=-1;look.x=nx;look.y=ny;},
    setPaused(value){paused=value;lastFace=-1;},
    setSpeaking(value){mouthMotion=value;lastFace=-1;},
    setTravel(pixels){if(Number.isFinite(pixels))wheelTravel=pixels/52;},
    setEntranceHeading(radians){if(Number.isFinite(radians))entranceHeading=radians;},
    dispose(){disposed=true;renderer.setAnimationLoop(null);observer.disconnect();document.removeEventListener('visibilitychange',visibility);const geometries=new Set(),mats=new Set();scene.traverse(obj=>{if(obj.isMesh){geometries.add(obj.geometry);for(const mat of Array.isArray(obj.material)?obj.material:[obj.material])mats.add(mat);}});for(const geometry of geometries)geometry.dispose();for(const mat of mats)mat.dispose();texture.dispose();renderer.dispose();renderer.domElement.remove();}
  };
}
