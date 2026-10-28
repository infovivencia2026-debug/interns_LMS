import {actions,moods,gestures,rehearsal} from './actions.js';

const $=(id)=>document.getElementById(id);
let mascot,current={mood:'Happy',gesture:'Wave'},tourTimer=null,replyTimer=null,paused=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');

function stopTour() {clearInterval(tourTimer);tourTimer=null;$('tour').setAttribute('aria-pressed','false');$('tour').textContent=`Play all ${actions.length}`;}
function update(next) {
  current=next;mascot?.setAction(next);mascot?.setSpeaking(false);
  $('playing').textContent=`${next.mood} · ${next.gesture}`;
  $('counter').textContent=`${String(actions.findIndex(a=>a.mood===next.mood&&a.gesture===next.gesture)+1).padStart(3,'0')} / ${actions.length}`;
  for(const button of document.querySelectorAll('[data-mood]'))button.setAttribute('aria-pressed',String(button.dataset.mood===next.mood));
  for(const button of document.querySelectorAll('[data-gesture]'))button.setAttribute('aria-pressed',String(button.dataset.gesture===next.gesture));
}
$('controls-title').textContent=`${actions.length} expression and movement combinations.`;
$('controls-title').nextElementSibling.textContent=`${moods.length} expressions × ${gestures.length} body actions. Internal animation review.`;
$('tour').textContent=`Play all ${actions.length}`;
for(const [list,id,property] of [[moods,'moods','mood'],[gestures,'gestures','gesture']]) {
  for(const label of list) {
    const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset[property]=label;button.setAttribute('aria-pressed','false');
    button.addEventListener('click',()=>{stopTour();update({...current,[property]:label});});$(id).append(button);
  }
}
function fail(message) {$('error').textContent=message;$('error').hidden=false;$('concept').hidden=false;$('view').textContent='Concept shown';$('view').disabled=true;stopTour();$('tour').disabled=true;$('pause').disabled=true;}
try {const {createMascot}=await import('./mascot.js');mascot=createMascot($('stage'),fail);} catch(error) {console.error('ONRO preview could not initialize',error);fail('3D rendering is unavailable in this browser. The original concept is shown instead.');}
update(current);
$('concept').addEventListener('error',()=>{$('error').textContent='The concept image could not load. Reload the preview to try again.';$('error').hidden=false;});
$('view').addEventListener('click',()=>{const show=$('concept').hidden;$('concept').hidden=!show;$('view').setAttribute('aria-pressed',String(show));$('view').textContent=show?'Show 3D':'Show concept';mascot?.setPaused(show||paused);});
$('pause').addEventListener('click',()=>{paused=!paused;stopTour();mascot?.setPaused(paused||!$('concept').hidden);$('pause').setAttribute('aria-pressed',String(paused));$('pause').textContent=paused?'Resume motion':'Pause motion';});
$('tour').addEventListener('click',()=>{
  if(tourTimer){stopTour();return;}paused=false;$('pause').setAttribute('aria-pressed','false');$('pause').textContent='Pause motion';mascot?.setPaused(!$('concept').hidden);
  $('tour').setAttribute('aria-pressed','true');$('tour').textContent='Stop tour';let index=0;update(actions[index]);
  tourTimer=setInterval(()=>{index++;if(index>=actions.length){stopTour();return;}update(actions[index]);},2200);
});
function reply(text) {
  stopTour();clearTimeout(replyTimer);update({mood:'Listening',gesture:'Nod'});$('answer').textContent='Listening…';
  $('chat').querySelector('button').disabled=true;
  replyTimer=setTimeout(()=>{const result=rehearsal(text);update(result);$('answer').textContent=result.reply;$('chat').querySelector('button').disabled=false;mascot?.setSpeaking(true);replyTimer=setTimeout(()=>mascot?.setSpeaking(false),2500);},reduced.matches?0:650);
}
$('chat').addEventListener('submit',(event)=>{event.preventDefault();const text=$('question').value.trim();if(!text)return;reply(text);});
for(const button of document.querySelectorAll('[data-prompt]'))button.addEventListener('click',()=>{const text={hello:'Hello',confused:'I’m confused',success:'I built my first project!'}[button.dataset.prompt];$('question').value=text;reply(text);});

// Embedders can use the same animation contract with server-authored responses.
// Only allowlisted actions are accepted; arbitrary strings never become code/HTML.
export function reactToConversation(detail) {
  if(!detail||typeof detail!=='object')return false;
  const {phase,mood,gesture}=detail;
  stopTour();
  const phases={listening:{mood:'Listening',gesture:'Nod'},thinking:{mood:'Thinking',gesture:'Turn'},error:{mood:'Empathetic',gesture:'Explain'},idle:{mood:'Happy',gesture:'Nod'}};
  const next=phases[phase]??{mood,gesture};
  if(!moods.includes(next.mood)||!gestures.includes(next.gesture))return false;
  update(next);mascot?.setSpeaking(phase==='answering');return true;
}
window.addEventListener('onro:reaction',event=>{reactToConversation(event.detail);});
window.addEventListener('pagehide',event=>{if(event.persisted)return;stopTour();clearTimeout(replyTimer);mascot?.dispose();});
