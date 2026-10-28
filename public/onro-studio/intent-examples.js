// Curated TRAINING examples for the local reaction classifier (IDF-weighted nearest-example; this is
// example-based classification, NOT LLM training or fine-tuning). Phrases are written for ONROL topics
// (courses, batches, certification, projects). They are kept strictly separate from the evaluation sets
// (intent-eval*.js). No visitor chat is stored or used.
export const intentExamples = {
  greeting:['hello there','hi onro','good afternoon','nice to meet you','greetings friend','hello i have a question about the courses','hi onro is this the right place to ask about batches','hey there good morning','hello i am a student looking for an ai course'],
  success:['i achieved my goal','i launched my website','i got hired today','i aced my exam','my first app is live','i completed my first project on projects dot onrol','i published my chatbot for my college','my workflow runs end to end now','i submitted my capstone and it was accepted','i finished the viva and passed'],
  gratitude:['you made my day','you were a great help','much appreciated','that really helped me','i owe you one','thank you for walking me through the batches','thanks that was exactly what i needed','thanks for explaining the projects so clearly','that answer was really helpful'],
  confusion:['this makes no sense','i am lost in this lesson','i need a simpler explanation','can you simplify that','i am having trouble following this','i do not follow how the points add up','the daily activities are unclear to me','please explain the project steps simply','i do not know where to start'],
  frustration:['this is so frustrating','nothing seems to work','i keep running into problems','i am fed up with this','the app keeps crashing','my workflow keeps breaking at the webhook','the agent keeps giving the wrong answer','every deploy fails and i cannot see why','this is taking forever and nothing runs','i could not get the project to work'],
  worry:['i feel intimidated','i am afraid of failing','this feels overwhelming','i doubt my ability','i lack confidence','will i be able to keep up as a beginner','i am worried about completing five projects','i am anxious that the course is too advanced for me','i am not sure i can manage without coding experience','what if i fall behind the batch'],
  disappointment:['i feel let down','i feel discouraged','i did poorly today','i am feeling low','that was a setback','my project scored lower than i expected','i feel discouraged about my progress','i missed the batch and i am bummed','i did not get selected and i feel low'],
  playful:['tell me something silly','cheer me up with a joke','say something amusing','make me giggle','let us have some fun','tell me a robot joke','do robots get tired','say something funny about artificial intelligence','let us have a bit of fun'],
  surprise:['that blew my mind','i never expected that','that is incredible','what a pleasant surprise','i am astonished','i had no idea there were so many projects','wow that is a lot of options','i did not realise the certificate is verifiable online'],
  improvement:['it clicked for me','i figured it out','i solved the problem','that makes sense now','i am making progress','now the scoring makes sense to me','i understand the daily activities now','the bug is fixed and it runs','i figured out the n8n step'],
  goodbye:['catch you later','take care','talk to you later','i need to leave now','until next time','thanks that is all for now goodbye','i will come back later bye','signing off for the day','see you next week']
};

const stopwords=new Set(['i','am','a','an','the','this','that','it','is','was','are','be','my','me','you','your','to','in','of','with','for','and','so','can','onro','have','now','today']);
const tokens=text=>String(text).toLowerCase().match(/[a-z]+/g)?.filter(word=>!stopwords.has(word)).map(word=>word.length>5?word.replace(/(ing|ed|ly|s)$/,''):word)??[];

// Fit an IDF-weighted nearest-example classifier from the examples above.
// Unknown/low-margin inputs abstain. This is not a fine-tuned language model.
export function trainIntentClassifier(examples=intentExamples) {
  const rows=Object.entries(examples).flatMap(([intent,texts])=>texts.map(text=>({intent,words:tokens(text)})));
  const frequency=new Map();for(const row of rows)for(const word of new Set(row.words))frequency.set(word,(frequency.get(word)??0)+1);
  const vector=words=>{const counts=new Map();for(const word of words)if(frequency.has(word))counts.set(word,(counts.get(word)??0)+1);for(const [word,count] of counts)counts.set(word,count*(Math.log((rows.length+1)/((frequency.get(word)??0)+1))+1));return counts;};
  const norm=v=>Math.sqrt([...v.values()].reduce((sum,n)=>sum+n*n,0));
  const fitted=rows.map(row=>{const v=vector(row.words);return {intent:row.intent,v,norm:norm(v)};});
  return text=>{
    const words=tokens(text),v=vector(words),length=norm(v);
    if(!length||words.length<1)return null;
    const scores=new Map();
    for(const row of fitted){let dot=0;for(const [word,value] of v)dot+=value*(row.v.get(word)??0);const score=dot/(length*row.norm||1);scores.set(row.intent,Math.max(scores.get(row.intent)??0,score));}
    const sorted=[...scores].sort((a,b)=>b[1]-a[1]);
    const coverage=[...new Set(words)].filter(word=>frequency.has(word)).length/new Set(words).size;
    if(sorted[0][1]<.63||sorted[0][1]-sorted[1][1]<.12||coverage<.6)return null;
    return {intent:sorted[0][0],score:sorted[0][1]};
  };
}
