import test from 'node:test';
import assert from 'node:assert/strict';
import {detectIntent,createConversationController,demoReply} from '../public/onro-studio/conversation.js';
import {actions} from '../public/onro-studio/actions.js';
import {trainIntentClassifier,intentExamples} from '../public/onro-studio/intent-examples.js';

const examples=[
  ['Hello','greeting'],['Thanks, that was helpful','gratitude'],
  ['I built my first project!','success'],['I have finished my app','success'],
  ["I haven't finished my project",'frustration'],["I didn't complete it",'frustration'],
  ['My app is not working','frustration'],['I built it but it failed','frustration'],
  ['How do I finish a project?','question'],['Explain what a chatbot does','question'],
  ["I don't understand this",'confusion'],['I am stuck','confusion'],
  ['I am worried I cannot afford this','worry'],['I lost my job','disappointment'],
  ['I am not happy','disappointment'],['Make me laugh','playful'],['Wow!','surprise'],
  ['Bye','goodbye'],['I fixed it','improvement'],['I am not stuck anymore','improvement'],
  ['I finally understand','improvement'],['Unrelated statement','neutral'],
  ['I built this and I am confused','confusion']
];
for(const [text,intent] of examples)test(`Conversation: ${text}`,()=>assert.equal(detectIntent(text),intent));
test('Short follow-up retains the user’s difficulty, and clear success releases it',()=>{assert.equal(detectIntent('yes','confusion'),'confusion');assert.equal(detectIntent('I built my app','confusion'),'success');});
test('Answer stays empathetic after a confused user even when answer is upbeat',()=>{const c=createConversationController();c.react({phase:'user',text:'I am confused',turnId:1});c.react({phase:'answering',text:'Amazing, let us build!',turnId:1});assert.equal(c.getState().mood,'Empathetic');c.dispose();});
test('Old responses and invalid animation metadata cannot overwrite the current turn',()=>{const c=createConversationController();c.react({phase:'user',text:'I built my app',turnId:2});const before=c.getState();assert.equal(c.react({phase:'answering',text:'sorry',turnId:1}),false);assert.equal(c.react({phase:'answering',mood:'<script>',gesture:'Wave'}),false);assert.equal(c.react({phase:'__proto__'}),false);assert.deepEqual(c.getState(),before);c.dispose();});
test('Completion and errors stop speaking; disposal ignores late events',()=>{const speaking=[];const c=createConversationController({setAction(){},setSpeaking(value){speaking.push(value);}});c.react({phase:'answering',text:'Hello',mood:'Happy',gesture:'Wave'});assert.equal(speaking.at(-1),true);c.react({phase:'error'});assert.equal(speaking.at(-1),false);assert.equal(c.getState().mood,'Empathetic');c.react({phase:'complete'});assert.equal(c.getState().phase,'idle');c.dispose();assert.equal(c.react({phase:'answering',text:'late'}),false);});
test('Library has 240 unique allowlisted combinations and no pricing numbers',()=>{assert.equal(actions.length,240);assert.equal(new Set(actions.map(a=>a.id)).size,240);assert.doesNotMatch(demoReply('What is the course fee?').reply,/[₹0-9]/);});
test('Example-trained classifier recognizes additional conversation phrasing and abstains on unknown text',()=>{const classify=trainIntentClassifier(intentExamples);assert.equal(detectIntent('I feel rather intimidated'),'worry');assert.equal(detectIntent('I really figured it out'),'improvement');assert.equal(detectIntent('Please say something amusing'),'playful');assert.equal(classify('purple vegetables enormous orbit'),null);assert.notEqual(detectIntent('I am not making progress'),'improvement');});
test('All curated examples preserve their intended reactions after priority and negation rules',()=>{for(const [intent,examples] of Object.entries(intentExamples))for(const text of examples)assert.equal(detectIntent(text),intent,text);});
