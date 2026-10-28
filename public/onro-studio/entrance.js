import {createMascot} from './mascot.js?v=9';

const isHome=()=>['/','/index.html'].includes(location.pathname);

// Greeting is visible text plus lip motion; it does not autoplay audio.
export function mountHomepageEntrance(opts={}) {
  const inner=!!opts.inner;                       // inner pages: same animated 3D ONRO, quick pop-in instead of the long walk-in
  const onPage=()=>inner||isHome();
  if(!onPage())return ()=>{};
  let stopped=false,readyTimer=null,greetingTimer=null,leaveTimer=null,frame=null,mascot=null,actor=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const pending=document.createElement('span');pending.id='onro-entrance-pending';pending.hidden=true;document.body.append(pending);
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./entrance.css?v=9',import.meta.url).href;document.head.append(css);
  const observer=new MutationObserver(checkReady);
  function clearReady(){clearTimeout(readyTimer);readyTimer=null;}
  function cleanup(){
    stopped=true;observer.disconnect();clearReady();clearTimeout(greetingTimer);clearTimeout(leaveTimer);cancelAnimationFrame(frame);
    document.removeEventListener('visibilitychange',checkReady);window.removeEventListener('load',checkReady);window.removeEventListener('popstate',checkReady);
    document.removeEventListener('transitionend',checkReady,true);document.removeEventListener('animationend',checkReady,true);document.fonts?.removeEventListener('loadingdone',checkReady);
    window.removeEventListener('onrol:intro-complete',checkReady);window.removeEventListener('pagehide',cleanup);window.removeEventListener('onro:react',onReact);window.removeEventListener('pointermove',onPointer);window.removeEventListener('pointerdown',onPointer);clearTimeout(idleTimer);clearTimeout(reactTimer);clearTimeout(calmTimer);clearTimeout(fallbackTimer);
    mascot?.dispose();actor?.remove();pending.remove();css.remove();
  }
  function introIsReady(){
    if(inner)return !document.hidden&&document.readyState!=='loading';
    const waited=performance.now()>6000;      // slow connections: do not wait forever for the page `load` event / web fonts
    const loaded=document.readyState==='complete'||(waited&&document.readyState==='interactive');
    if(!isHome()||document.hidden||!loaded||document.body.classList.contains('loading'))return false;
    if(!waited&&document.fonts&&document.fonts.status==='loading')return false;
    if(!document.querySelector('#home-glydi .hero, header.hero, main h1, .hero h1'))return false;
    const covers=document.querySelectorAll('#preloader,.preloader,[data-page-intro],#page-intro');
    for(const cover of covers){const style=getComputedStyle(cover);if(!cover.hidden&&style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)>.05)return false;}
    return true;
  }
  function checkReady(){
    if(stopped)return;
    if(!onPage()){cleanup();return;}
    if(actor)return;
    if(!introIsReady()){clearReady();return;}
    // Wait through the existing logo/hero reveal after the loading cover clears.
    if(!readyTimer)readyTimer=setTimeout(()=>{readyTimer=null;if(introIsReady())start();},reduced.matches?150:(inner?250:900));
  }
  // Idle life: ONRO keeps looking at the cursor and shows a new expression every few seconds, so it never freezes.
  let idleTimer=null;
  const IDLE=[['Playful','Wave'],['Excited','Bounce'],['Proud','Nod'],['Curious','Lean-in'],['Happy','Rest'],['Curious','Look-around'],['Playful','Nod'],['Hopeful','Rest'],['Listening','Rest'],['Happy','Lean-in'],['Surprised','Bounce'],['Happy','Wave'],['Thinking','Look-around']];
  const ASKS=['Ask me anything about ONROL.','Psst… got questions? I don’t bite! 🤖','Tap me! I know all about our courses.','Not sure which course? Ask away!'];
  let askIndex=0;
  function rotateAsk(){const hi=actor&&actor.querySelector('.onro-hi');if(hi&&actor.dataset.phase==='rest'&&document.body.dataset.onroMini!=='open'){askIndex=(askIndex+1)%ASKS.length;hi.textContent=ASKS[askIndex];}}
  function scheduleIdle(){
    clearTimeout(idleTimer);if(stopped||reduced.matches)return;
    idleTimer=setTimeout(()=>{if(stopped||!mascot)return;if(performance.now()-lastPointerAt<2500){scheduleIdle();return;}try{rotateAsk();const p=IDLE[Math.floor(Math.random()*IDLE.length)];mascot.setPaused(false);mascot.setAction({mood:p[0],gesture:p[1]});}catch(_){}scheduleIdle();},4500+Math.random()*3500);
  }
  let lastPointerAt=0;
  function onPointer(event){
    if(stopped||!mascot||!actor)return;
    lastPointerAt=performance.now();
    const r=actor.getBoundingClientRect();if(!r.width)return;
    const reach=Math.max(r.width*2.2,320);   // looks fully at the cursor once it is ~2 ONRO-widths away, on any screen size
    mascot.setLook((event.clientX-(r.left+r.width/2))/reach,(event.clientY-(r.top+r.height*.3))/reach);
  }
  window.addEventListener('pointermove',onPointer,{passive:true});window.addEventListener('pointerdown',onPointer,{passive:true});   // touch screens: look at the last tap
  let reactTimer=null,calmTimer=null;
  function onReact(event){
    if(stopped||!mascot||!actor)return;
    const detail=event.detail||{};
    try{
      clearTimeout(reactTimer);clearTimeout(calmTimer);
      mascot.setPaused(false);clearTimeout(idleTimer);
      if(detail.mood&&detail.gesture)mascot.setAction({mood:detail.mood,gesture:detail.gesture});
      const speakMs=Number(detail.speakMs)||0;
      mascot.setSpeaking(speakMs>0&&!reduced.matches);
      reactTimer=setTimeout(()=>{if(stopped)return;mascot.setSpeaking(false);mascot.setAction({mood:'Happy',gesture:'Rest'});scheduleIdle();},speakMs>0?Math.min(speakMs,5000):1800);
    }catch(error){console.warn('ONRO reaction skipped:',error);}
  }
  window.addEventListener('onro:react',onReact);
  function makeInteractive(){
    if(stopped||!actor)return;
    actor.setAttribute('role','button');actor.tabIndex=0;actor.setAttribute('aria-label','Chat with ONRO, ONROL’s assistant');
    actor.querySelector('.onro-hi').textContent=ASKS[0];
    const openChat=()=>window.dispatchEvent(new CustomEvent('onro:open'));
    actor.addEventListener('click',openChat);
    actor.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openChat();}});
  }
  function greet(){
    if(stopped)return;
    actor.dataset.phase='greeting';actor.dataset.greeting='true';
    actor.querySelector('.onro-hi').textContent='Hi! I’m ONRO.';
    const legacy=document.getElementById('onro-greet');if(legacy)legacy.hidden=true;
    mascot?.setAction({mood:'Happy',gesture:'Wave'});mascot?.setSpeaking(!reduced.matches);
    greetingTimer=setTimeout(()=>{mascot?.setSpeaking(false);mascot?.setAction({mood:'Happy',gesture:'Rest'});mascot?.setPaused(reduced.matches);scheduleIdle();actor.dataset.phase='rest';makeInteractive();window.dispatchEvent(new CustomEvent('onro:entrance-rested'));},inner?1300:2200);
    window.dispatchEvent(new CustomEvent('onro:entrance-greeted'));
  }
  function start(){
    if(stopped||actor)return;
    actor=document.createElement('div');actor.id='onro-entrance';actor.dataset.phase='rolling';
    const stage=document.createElement('div');stage.className='onro-actor';stage.setAttribute('aria-hidden','true');
    const bubble=document.createElement('p');bubble.className='onro-hi';bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');
    actor.append(stage,bubble);document.body.append(actor);
    try {mascot=createMascot(stage,message=>{console.warn('ONRO entrance stopped:',message);cleanup();},{transparent:true});}
    catch(error){console.warn('ONRO entrance unavailable:',error);cleanup();return;}
    mascot.setAction({mood:'Happy',gesture:'Rest'});
    const width=actor.getBoundingClientRect().width,distance=width+40;
    if(reduced.matches){actor.dataset.visible='true';actor.style.transform='none';mascot.setPaused(true);greet();return;}
    let started=null;
    function roll(now){
      if(stopped)return;
      if(started===null)started=now;
      const progress=Math.min((now-started)/(inner?650:1450),1),eased=1-Math.pow(1-progress,3);
      actor.dataset.visible='true';actor.style.transform=`translateX(${(1-eased)*distance}px)`;mascot.setTravel(eased*distance);
      const turning=Math.max(0,Math.min(1,(progress-.55)/.45));mascot.setEntranceHeading(-.95*(1-turning));
      if(progress<1)frame=requestAnimationFrame(roll);else greet();
    }
    frame=requestAnimationFrame(roll);
  }
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','style']});
  document.addEventListener('visibilitychange',checkReady);window.addEventListener('load',checkReady);window.addEventListener('popstate',checkReady);
  document.addEventListener('transitionend',checkReady,true);document.addEventListener('animationend',checkReady,true);document.fonts?.addEventListener('loadingdone',checkReady);
  window.addEventListener('onrol:intro-complete',checkReady);window.addEventListener('pagehide',cleanup);
  const fallbackTimer=setTimeout(()=>{if(!stopped&&!actor&&onPage()&&!document.hidden)start();},inner?5000:12000);
  document.fonts?.ready.then(checkReady);checkReady();
  return cleanup;
}
