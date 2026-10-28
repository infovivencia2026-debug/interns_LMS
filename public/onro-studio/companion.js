import {createConversationController,demoReply} from './conversation.js';

const $=id=>document.getElementById(id);
let mascot,controller,replyTimer=null,turn=0;
const labels={idle:'Ready to listen',listening:'Listening',thinking:'Thinking',answering:'Replying',error:'Let’s try again'};
function fallback(message){$('error').textContent=message;$('error').hidden=false;$('concept').hidden=false;}
try {const {createMascot}=await import('./mascot.js');mascot=createMascot($('stage'),fallback);}catch(error){console.error('ONRO initialization failed',error);fallback('The 3D preview is unavailable. ONRO’s concept image is shown instead.');}
controller=createConversationController(mascot,state=>{
  $('status').textContent=labels[state.phase]??'Ready to listen';
  $('stage').dataset.mood=state.mood;$('stage').dataset.gesture=state.gesture;$('stage').dataset.phase=state.phase;
});
$('concept').addEventListener('error',()=>fallback('ONRO’s image could not load. Please reload to try again.'));
function appendMessage(text,role){
  const message=document.createElement('p');message.className=`message ${role}`;
  const label=document.createElement('span');label.textContent=role==='user'?'YOU':'ONRO';message.append(label,document.createTextNode(text));
  const log=$('messages');log.append(message);
  while(log.childElementCount>40)log.firstElementChild.remove();
  log.scrollTop=log.scrollHeight;
}
$('question').addEventListener('input',()=>{if(!$('chat-form').querySelector('button').disabled)controller.react({phase:'listening'});});
$('chat-form').addEventListener('submit',event=>{
  event.preventDefault();const text=$('question').value.trim();if(!text)return;
  clearTimeout(replyTimer);const turnId=++turn;
  appendMessage(text,'user');$('question').value='';$('chat-form').querySelector('button').disabled=true;
  controller.react({phase:'user',text,turnId});
  const result=demoReply(text,controller.getState().intent);
  replyTimer=setTimeout(()=>{
    controller.react({phase:'thinking',turnId});
    replyTimer=setTimeout(()=>{
      appendMessage(result.reply,'assistant');controller.react({phase:'answering',text:result.reply,turnId});
      $('chat-form').querySelector('button').disabled=false;$('question').focus({preventScroll:true});
    },500);
  },450);
});
window.addEventListener('onro:reaction',event=>controller.react(event.detail));
window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===window.parent&&event.data?.type==='onro:reaction')controller.react(event.data.detail);});
window.addEventListener('pagehide',event=>{if(event.persisted)return;clearTimeout(replyTimer);controller.dispose();mascot?.dispose();});
