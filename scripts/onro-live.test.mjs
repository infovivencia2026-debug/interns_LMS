import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeReaction, answerReaction, parseAssistantPayload, revealSteps} from '../public/onro-studio/live-reaction.js';
import {detectIntent, createConversationController} from '../public/onro-studio/conversation.js';
import {moods, gestures} from '../public/onro-studio/actions.js';
import {intentEval} from '../public/onro-studio/intent-eval.js';
import {intentEvalBlind} from '../public/onro-studio/intent-eval-blind.js';
import {intentEvalFresh} from '../public/onro-studio/intent-eval-fresh.js';
import {intentExamples} from '../public/onro-studio/intent-examples.js';

test('reaction metadata is validated against the mascot allowlist; anything else is dropped', () => {
  assert.deepEqual(normalizeReaction({mood: 'Curious', gesture: 'Explain'}), {mood: 'Curious', gesture: 'Explain'});
  for (const bad of [null, undefined, 'Curious', [], {}, {mood: 'Curious'}, {mood: '<script>', gesture: 'Wave'},
    {mood: 'Happy', gesture: 'constructor'}, {mood: 'Happy', gesture: 'wave'}, {mood: {}, gesture: []}, {mood: '__proto__', gesture: 'Nod'}]) {
    assert.equal(normalizeReaction(bad), null, JSON.stringify(bad));
  }
});

test('payload parsing keeps answer and reaction separate and rejects unusable responses', () => {
  const ok = parseAssistantPayload({answer: ' Hello ', reaction: {mood: 'Happy', gesture: 'Wave'}, stage: 'menu', ask: null, topic: 'greeting_menu'});
  assert.deepEqual(ok, {answer: 'Hello', stage: 'menu', ask: null, topic: 'greeting_menu', reaction: {mood: 'Happy', gesture: 'Wave'}});
  assert.equal(parseAssistantPayload(null), null);
  assert.equal(parseAssistantPayload({}), null);
  assert.equal(parseAssistantPayload({answer: ''}), null);
  assert.equal(parseAssistantPayload({answer: 'x'.repeat(2001)}), null);
  assert.equal(parseAssistantPayload({reply: 'old shape'}), null);
  // bad optional fields degrade safely instead of failing the chat
  const loose = parseAssistantPayload({answer: 'Hi', reaction: {mood: 'nope', gesture: 'nope'}, stage: 'hax', ask: 'steal', topic: 'Bad Topic!'});
  assert.deepEqual(loose, {answer: 'Hi', stage: 'idle', ask: null, topic: '', reaction: null});
  assert.doesNotMatch(parseAssistantPayload({answer: 'a\u0000b\u0007c'}).answer, /[\u0000-\u0008]/);
});

test('a cheerful answer never overrides the visitor’s own difficulty', () => {
  const cheerful = {mood: 'Happy', gesture: 'Wave'};
  for (const intent of ['confusion', 'frustration', 'worry', 'disappointment']) assert.equal(answerReaction(intent, cheerful), null, intent);
  // achievements / gratitude / farewell keep their own reaction too (Proud+Clap, Grateful+Bow, ...)
  for (const intent of ['success', 'gratitude', 'goodbye', 'playful', 'improvement', 'surprise']) assert.equal(answerReaction(intent, cheerful), null, intent);
});

test('for plain greetings, questions and neutral chat the answer’s meaning picks the reaction', () => {
  const explain = {mood: 'Curious', gesture: 'Explain'};
  for (const intent of ['greeting', 'question', 'neutral']) assert.deepEqual(answerReaction(intent, explain), explain, intent);
  assert.equal(answerReaction('question', {mood: 'bad', gesture: 'bad'}), null, 'invalid metadata falls back to the calm default');
  assert.equal(answerReaction('question', undefined), null);
});

test('end to end through the real controller: frustrated visitor + upbeat answer stays empathetic', () => {
  const c = createConversationController();
  c.react({phase: 'user', text: 'the deploy fails every single time', turnId: 1});
  c.react({phase: 'thinking', turnId: 1});
  const override = answerReaction(c.getState().intent, {mood: 'Happy', gesture: 'Wave'});
  c.react({phase: 'answering', text: 'Great news! Happy to help.', turnId: 1, ...(override ?? {})});
  assert.equal(c.getState().mood, 'Empathetic');
  c.react({phase: 'complete', turnId: 1});
  assert.equal(c.getState().phase, 'idle');
  c.dispose();
});

test('end to end: a neutral question gets the answer’s Curious/Explain and then returns to calm', () => {
  const c = createConversationController();
  c.react({phase: 'user', text: 'what is the next batch', turnId: 1});
  const override = answerReaction(c.getState().intent, {mood: 'Curious', gesture: 'Explain'});
  c.react({phase: 'answering', text: 'A new batch starts every Monday.', turnId: 1, ...(override ?? {})});
  assert.deepEqual([c.getState().mood, c.getState().gesture], ['Curious', 'Explain']);
  c.react({phase: 'complete', turnId: 1});
  assert.deepEqual([c.getState().mood, c.getState().gesture], ['Listening', 'Rest']);
  c.dispose();
});

test('stale answers cannot change the latest turn’s reaction; mouth stops on completion', () => {
  const speaking = [];
  const c = createConversationController({setAction() {}, setSpeaking(v) { speaking.push(v); }});
  c.react({phase: 'user', text: 'first question', turnId: 1});
  c.react({phase: 'user', text: 'I am confused about the scoring', turnId: 2});
  assert.equal(c.react({phase: 'answering', text: 'late answer to question one', turnId: 1, mood: 'Happy', gesture: 'Wave'}), false);
  assert.equal(c.getState().mood, 'Empathetic');
  c.react({phase: 'answering', text: 'answer two', turnId: 2});
  assert.equal(speaking.at(-1), true);
  c.react({phase: 'complete', turnId: 2});
  assert.equal(speaking.at(-1), false);
  c.dispose();
});

test('typewriter reveal: chunked normally, a single step with reduced motion', () => {
  assert.deepEqual(revealSteps('abcdefg', false), [3, 6, 7]);
  assert.deepEqual(revealSteps('abcdefg', true), [7]);
  assert.deepEqual(revealSteps('', false), [0]);
  assert.equal(revealSteps('x'.repeat(2000), false).at(-1), 2000);
});

test('the intended default reactions hold for each conversation situation', () => {
  const run = (text, previous) => { const c = createConversationController(); c.react({phase: 'user', text, turnId: 1}); const s = c.getState(); c.dispose(); return `${s.mood}+${s.gesture}`; };
  assert.equal(run('Hello'), 'Happy+Wave');
  assert.equal(run('I am confused about the scoring'), 'Empathetic+Lean-in');
  assert.equal(run('my workflow keeps failing'), 'Empathetic+Nod');
  assert.equal(run('I am worried I cannot start without coding experience'), 'Hopeful+Heart');
  assert.equal(run('I completed my first project'), 'Proud+Clap');
  assert.equal(run('Thank you so much'), 'Grateful+Bow');
  assert.equal(run('tell me a joke'), 'Playful+Bounce');
  assert.equal(run('bye for now'), 'Grateful+Wave');
  assert.equal(run('I have not finished my project'), 'Empathetic+Nod', 'a failed attempt must never celebrate');
  assert.equal(run('Can I finish the certification in a month?'), 'Curious+Explain', 'a question about success is not an achievement');
});

// ---- evaluation: three sets, never used to fit the classifier ------------------------------
function accuracy(rows) { let ok = 0; for (const [t, e, p] of rows) if (detectIntent(t, p ?? 'neutral') === e) ok++; return ok / rows.length; }
test('evaluation sets stay disjoint from the training examples', () => {
  const train = new Set(Object.values(intentExamples).flat().map(t => t.toLowerCase().trim()));
  for (const [name, rows] of [['dev', intentEval], ['blind', intentEvalBlind], ['fresh', intentEvalFresh]]) {
    for (const [text] of rows) assert.equal(train.has(text.toLowerCase().trim()), false, `${name} leaked into training: ${text}`);
  }
});
test('regression: all evaluation sets keep passing after tuning (first-pass scores were 69.6% / 60.3% / 56.3%)', () => {
  assert.equal(accuracy(intentEval), 1);
  assert.equal(accuracy(intentEvalBlind), 1);
  assert.equal(accuracy(intentEvalFresh), 1);
});
test('safety: no negative visitor message in any set is ever read as a celebration', () => {
  const happy = new Set(['success', 'gratitude', 'playful', 'greeting', 'surprise']);
  const negatives = new Set(['confusion', 'frustration', 'worry', 'disappointment']);
  for (const [t, e, p] of [...intentEval, ...intentEvalBlind, ...intentEvalFresh]) {
    if (negatives.has(e)) assert.equal(happy.has(detectIntent(t, p ?? 'neutral')), false, t);
  }
});
test('every allowlisted mood/gesture combination is available (16 x 15 = 240)', () => {
  assert.equal(moods.length * gestures.length, 240);
});
