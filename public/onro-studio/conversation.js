import {moods,gestures} from './actions.js';
import {trainIntentClassifier} from './intent-examples.js';
const classifyExample=trainIntentClassifier();

const reactions = {
  greeting:{mood:'Happy',gesture:'Wave'}, success:{mood:'Proud',gesture:'Clap'},
  gratitude:{mood:'Grateful',gesture:'Bow'}, confusion:{mood:'Empathetic',gesture:'Lean-in'},
  frustration:{mood:'Empathetic',gesture:'Nod'}, worry:{mood:'Hopeful',gesture:'Heart'},
  disappointment:{mood:'Empathetic',gesture:'Lean-in'}, playful:{mood:'Playful',gesture:'Bounce'},
  surprise:{mood:'Surprised',gesture:'Shrug'}, improvement:{mood:'Confident',gesture:'Nod'},
  question:{mood:'Curious',gesture:'Explain'}, goodbye:{mood:'Grateful',gesture:'Wave'},
  neutral:{mood:'Listening',gesture:'Rest'}
};
const normalize = text => String(text??'').slice(0,4000).toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();

// Intent examples plus explicit rules, not LLM fine-tuning or emotion diagnosis.
// Negative clauses take precedence over achievement keywords; ambiguity stays calm.
const RULES = {
  improvement: /\b(not (stuck|confused|worried) (anymore|now)|finally (understand|got it)|it works now|fixed it|now i (get|understand|see)|(error|problem|bug) is gone|(i am|i'm) not (confused|stuck|worried) anymore)\b/,
  frustration: /\b(frustrat\w*|annoy\w*|angry|fed up|useless|not helping|doesn't work|not working|nothing (is )?(working|works)|failed|failure|still fails?|fails? (every|each)|keeps? (failing|crashing)|errors? out|broke(n)?( again)?|error|wrong (answer|result|output)s?|(can't|cannot|can not|could not|couldn't|unable to) (finish|build|complete|submit|deploy|get)|haven't (finished|built|completed|managed)|(have|has) not (finished|built|completed|done|managed)|didn't (finish|build|complete|submit)|did not (finish|build|complete|submit)|not (finished|successful|completed)|(have|had) not$|(build|deploy|script|code|workflow|agent|app|page|upload) (breaks?|crash\w*|fails?)|crash(es|ed)\b|still (wrong|broken|failing))\b/,
  disappointment: /\b(sad|disappointed|not happy|upset|give up|hopeless|lost my job|rejected|discourag\w*|let down|scored low|low score|lower than (i )?(hoped|expected)|not what i (hoped|expected)|feeling low|missed the batch|did(n't| not) get (the|that|a|my) (job|offer|place|seat)|not (proud|satisfied)|do not feel proud|dejected|dismayed|did(n't| not) make it|did(n't| not) go well|did(n't| not) get (selected|chosen|in)|feel low)\b/,
  worry: /\b(worried|nervous|scared|anxious|afraid|overwhelmed|can't afford|cannot afford|afford|will i (be able|manage|cope|struggle)|too late (for me|to start)|not sure (if |that )?i can|i am a non[- ]?cod\w*|i have no (coding )?(experience|background)|zero (coding )?(experience|background)|without (any )?experience|not (smart|good|talented) enough|fall behind|what if i (am|can't|cannot|fail)|terrified|unsure|not sure (about|if)|too hard|too difficult for me)\b/,
  surprise: /\b(wow|whoa|amazing|unbelievable|never expected|did(n't| not) expect|had no idea (there|that|it)|did(n't| not) (realise|realize)|that is (wild|crazy|insane)|really\?)\b/,
  confusion: /\b(confus\w*|stuck|don't (understand|get)|do not (understand|get)|cannot understand|can't understand|hard to (understand|follow)|no (idea|clue)|makes no sense|nothing (sinks in|makes sense)|too difficult|(i am|i'm) (totally |completely )?lost|simpler (words|terms|way)|(cannot|can't|can not) figure|baffl\w*|bewilder\w*|perplex\w*|(don't|do not) know (where|how) to (begin|start)|(don't|do not) follow)\b/,
  success: /\b(i (have |just |finally )?(built|finished|completed|shipped|passed|submitted|cleared)|we (built|finished|completed|shipped)|my .{0,40}(is live|works|worked)|got (a|my|the) (job|offer|certificate)|it worked|i (just |finally )?(launched|earned|achieved|graduated))\b/,
  gratitude: /\b(thank you|thanks|thankful|grateful|appreciate|helpful)\b/,
  goodbye: /\b(bye|goodbye|see you|good night|that is all for today|that's all for today|signing off|take care|talk (to you )?later|catch you later|heading out)\b/,
  playful: /\b(joke|funny|haha|lol|make me laugh|something fun|silly|do you (dream|sleep|eat|have feelings))\b/,
};
const NEGATIVE = ['frustration', 'disappointment', 'worry', 'confusion'];
const matchNegative = clause => NEGATIVE.find(intent => RULES[intent].test(clause)) ?? null;
// "Can I ... / Do I need ..." are questions about eligibility, not statements about the person.
const asksFirst = /^(can|could|do|does|is|are)\b/;
// "I am not frustrated, just curious" negates the emotion; drop it before matching.
const negatedEmotion = /\b(am|is|are|was|do|does) not (frustrat\w*|worried|confus\w*|upset|angry|anxious|nervous|scared|sad)\b/g;

export function detectIntent(text, previous='neutral') {
  const value=normalize(text);
  if(RULES.improvement.test(value))return 'improvement';
  // Mixed emotions: when a message turns negative after "but / however / although", the last
  // clause wins ("I finished it but it still fails" is not a celebration).
  const clauses=value.split(/\b(?:but|however|although|though)\b|;/);
  if(clauses.length>1){const tail=matchNegative(clauses[clauses.length-1].trim());if(tail)return tail;}
  const v=value.replace(negatedEmotion,' ');
  for(const intent of ['frustration','disappointment','worry']) {
    if(intent==='worry'&&asksFirst.test(v))continue;
    if(RULES[intent].test(v))return intent;
  }
  if(RULES.surprise.test(v)&&!/\b(not|no clue|lost|stuck)\b/.test(v.replace(/had no idea/g,'')))return 'surprise';
  if(RULES.confusion.test(v))return 'confusion';
  // A success claim followed by "and it still ..." is not a celebration either.
  if(RULES.success.test(v)&&!/\b(and|so) (it|they|he|she) (still|keeps?|gives?|shows?)\b/.test(v))return 'success';
  if(RULES.goodbye.test(v))return 'goodbye';
  if(RULES.gratitude.test(v))return 'gratitude';
  if(RULES.playful.test(v))return 'playful';
  if(RULES.surprise.test(v))return 'surprise';
  if(/^(hi|hello|hey|good morning|good evening)\b/.test(v))return 'greeting';
  if(/^(yes|yeah|yep|no|okay|ok|please|yes please|still( a little)?|a little|not yet|not really|not sure|maybe|kind of|sort of)[.!?]*$/i.test(v)&&['confusion','worry','frustration','disappointment'].includes(previous))return previous;
  // Abstain from example-based inference on negated text; rules handle known negatives.
  if(!/\b(not|no|never|cannot|can't|haven't|didn't|don't)\b/.test(v)) {
    const inferred=classifyExample(v);if(inferred)return inferred.intent;
  }
  if(v.includes('?')||/^(can|could|do|does|did|is|are|will|would|should|how|what|when|where|which|why|who)\b/.test(v)||/\b(how|what|when|where|which|why|explain|help|learn|start|course|program|price|fee|cost|just want|just curious|want to know)\b/.test(v))return 'question';
  return 'neutral';
}

export function reactionForIntent(intent) {return {...(reactions[intent]??reactions.neutral)};}

// Call from a real chatbot's input/request/stream/error/completion callbacks.
export function createConversationController(mascot,onChange=()=>{}) {
  let previous='neutral',lastUser='',timer=null,turnId=0,disposed=false,current={phase:'idle',intent:'neutral',...reactions.neutral};
  const publish=(reaction,phase,intent)=>{current={...reaction,phase,intent};mascot?.setAction(reaction);mascot?.setSpeaking(phase==='answering');onChange({...current});};
  function react(detail) {
    if(disposed||!detail||typeof detail!=='object')return false;
    const {phase,text,mood,gesture}=detail;
    if(!['idle','listening','thinking','answering','error','complete','user'].includes(phase))return false;
    if(detail.turnId!==undefined&&(!Number.isSafeInteger(detail.turnId)||detail.turnId<turnId))return false;
    if(mood!==undefined||gesture!==undefined){if(!moods.includes(mood)||!gestures.includes(gesture))return false;}
    if(detail.turnId!==undefined)turnId=detail.turnId;
    clearTimeout(timer);
    if(phase==='user') {
      lastUser=normalize(text);previous=detectIntent(lastUser,previous);publish(reactionForIntent(previous),'listening',previous);
    } else if(phase==='listening')publish(reactions.neutral,phase,previous);
    else if(phase==='thinking')publish({mood:'Thinking',gesture:'Look-around'},phase,previous);
    else if(phase==='error')publish({mood:'Empathetic',gesture:'Nod'},phase,'frustration');
    else if(phase==='answering') {
      // Respond warmly to a user's difficulty even when the answer is upbeat.
      const intent=lastUser?previous:detectIntent(text,previous);
      publish(mood?{mood,gesture}:reactionForIntent(intent),phase,intent);
      const duration=Math.min(6500,Math.max(2200,normalize(text).length*35));
      timer=setTimeout(()=>publish(reactions.neutral,'idle',intent),duration);
    } else {publish(reactions.neutral,'idle',previous);if(phase==='idle')lastUser='';}
    return true;
  }
  publish(reactions.neutral,'idle','neutral');
  return {react,getState:()=>({...current}),dispose(){disposed=true;clearTimeout(timer);mascot?.setSpeaking(false);}};
}

export function demoReply(text,previous='neutral') {
  const intent=detectIntent(text,previous);
  const replies={
    greeting:'Hi! I’m ONRO. What would you like to learn or build?',
    success:'You made something real! What did you build, and what would you like to try next?',
    gratitude:'You’re welcome! I’m glad I could help. What would you like to explore next?',
    confusion:'We can break it into smaller steps. Which part is confusing: the idea, the tools, or the code?',
    frustration:'That sounds frustrating. Tell me what you tried and the error you saw, and we can work through the next step.',
    worry:'You don’t have to solve everything at once. What is your biggest concern about getting started?',
    disappointment:'I’m sorry that was disappointing. We can look at what happened and choose one manageable next step.',
    playful:'Why did the robot bring a notebook? It wanted to keep track of its bright ideas!',
    surprise:'There’s a lot to explore! Which part caught your attention?',
    improvement:'Nice progress! What helped it click, and what would you like to try next?',
    goodbye:'See you soon. Bring your next idea—we can explore it together.',
    question:/\b(price|fee|cost)\b/.test(normalize(text))?'The ONROL team can help you with program fit and fees. Use the website’s application form to connect with them.':'Tell me your starting point and what you want to build. Are you new to AI, or have you already tried a project?',
    neutral:'Tell me a little more about what you have in mind.'
  };
  return {intent,reply:replies[intent]};
}
