// ONRO live page: the same mascot + conversation controller as the preview, but answers come from
// ONROL's real assistant (CRM /api/public/assistant) instead of the scripted demoReply. Callback
// requests go through the hardened /api/public/leads intake.
// API base: ?api=... overrides; default is http://127.0.0.1:3100 on localhost, https://go.onrol.in elsewhere.
// Reaction metadata ({answer, reaction}) stays separate from the text and is never rendered.
import {createConversationController} from './conversation.js';
import {answerReaction, parseAssistantPayload, revealSteps} from './live-reaction.js';

const $ = id => document.getElementById(id);
try { if (window.self !== window.top) document.documentElement.classList.add('embedded'); } catch (e) { document.documentElement.classList.add('embedded'); }
const params = new URLSearchParams(location.search);
const LOCAL = ['127.0.0.1', 'localhost'].includes(location.hostname);
const apiBase = (() => {
  // Local preview talks to a local CRM (npx next start -p 3100); anywhere else, the live CRM.
  const raw = params.get('api') || (LOCAL ? 'http://127.0.0.1:3100' : 'https://go.onrol.in');
  try { const u = new URL(raw); return /^https?:$/.test(u.protocol) ? u.origin : 'https://go.onrol.in'; } catch { return 'https://go.onrol.in'; }
})();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const labels = {idle: 'Ready to listen', listening: 'Listening', thinking: 'Thinking', answering: 'Replying', error: 'Let’s try again'};

let mascot, controller, turn = 0, stage = 'idle', lastTopic = '', leadSubmissionId = null;
let inflight = null;       // AbortController of the request being waited on
let reveal = null;         // {node, text, timer} of the answer currently being typed out

function fallback(message) { $('error').textContent = message; $('error').hidden = false; $('concept').hidden = false; }
// The chat must work from the first keystroke, even on a slow device while the 3D model is still
// loading. So the controller is created immediately with a thin proxy, and the mascot attaches to it
// whenever it is ready (or never: the chat is unaffected if WebGL fails).
const mascotProxy = {setAction: reaction => mascot?.setAction(reaction), setSpeaking: speaking => mascot?.setSpeaking(speaking)};
// Animation must never interrupt the chat: every controller call goes through safeReact.
const safeReact = detail => { try { return controller.react(detail); } catch (error) { console.error('reaction failed', error); return false; } };
controller = createConversationController(mascotProxy, state => {
  $('status').textContent = labels[state.phase] ?? 'Ready to listen';
  $('stage').dataset.mood = state.mood; $('stage').dataset.gesture = state.gesture; $('stage').dataset.phase = state.phase;
});
import('./mascot.js?v=3')
  .then(({createMascot}) => { mascot = createMascot($('stage'), fallback); const s = controller.getState(); mascot.setAction({mood: s.mood, gesture: s.gesture}); })
  .catch(error => { console.error('ONRO initialization failed', error); fallback('The 3D preview is unavailable. ONRO\u2019s concept image is shown instead.'); });
$('concept').addEventListener('error', () => fallback('ONRO’s image could not load. Please reload to try again.'));

function appendMessage(text, role) {
  const message = document.createElement('p'); message.className = `message ${role}`;
  const label = document.createElement('span'); label.textContent = role === 'user' ? 'YOU' : 'ONRO';
  const body = document.createTextNode(text);
  message.append(label, body);
  const log = $('messages'); log.append(message);
  while (log.childElementCount > 40) log.firstElementChild.remove();
  log.scrollTop = log.scrollHeight;
  return {message, body};
}

async function postJson(path, body, signal, timeoutMs = 10000) {
  const inflightTimeout = new AbortController();
  const timer = setTimeout(() => inflightTimeout.abort(), timeoutMs);
  const both = signal ? AbortSignal.any([signal, inflightTimeout.signal]) : inflightTimeout.signal;
  try {
    const res = await fetch(apiBase + path, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body), signal: both});
    const data = await res.json().catch(() => ({}));
    return {res, data};
  } finally { clearTimeout(timer); }
}

// Finish a half-typed answer instantly (a newer message arrived, or the turn was superseded).
function settleReveal() {
  if (!reveal) return;
  clearTimeout(reveal.timer); reveal.node.nodeValue = reveal.text; reveal = null;
}

function startReveal(text, turnId, onDone) {
  const {body} = appendMessage('', 'assistant');
  const steps = revealSteps(text, reducedMotion);
  reveal = {node: body, text, timer: null};
  let i = 0;
  const tick = () => {
    if (!reveal || reveal.node !== body) return;       // superseded
    body.nodeValue = text.slice(0, steps[i]);
    $('messages').scrollTop = $('messages').scrollHeight;
    if (++i < steps.length) { reveal.timer = setTimeout(tick, 16); return; }
    reveal = null; onDone();
  };
  tick();
}

function showError(failedText) {
  safeReact({phase: 'error', turnId: turn});
  const {message} = appendMessage('Sorry, I couldn’t reach ONROL’s assistant just now. Please try again, or ask for a counsellor.', 'assistant');
  const retry = document.createElement('button');
  retry.type = 'button'; retry.className = 'retry'; retry.textContent = 'Try again';
  retry.addEventListener('click', () => { retry.remove(); send(failedText, {echo: false}); });
  message.append(' ', retry);
}

async function send(text, {echo = true} = {}) {
  settleReveal();
  inflight?.abort();                                   // a newer message supersedes the old request
  const turnId = ++turn;
  const mine = inflight = new AbortController();
  if (echo) appendMessage(text, 'user');
  safeReact({phase: 'user', text, turnId});
  safeReact({phase: 'thinking', turnId});
  try {
    const {res, data} = await postJson('/api/public/assistant', {message: text, stage, lastTopic}, mine.signal);
    if (turnId !== turn) return;                       // stale response: never touches the screen or mascot
    const payload = res.ok ? parseAssistantPayload(data) : null;
    if (!payload) throw new Error(`HTTP ${res.status}`);
    stage = payload.stage; lastTopic = payload.topic;
    // The visitor's own feeling leads; otherwise the answer's meaning picks the reaction (validated).
    const override = answerReaction(controller.getState().intent, payload.reaction);
    safeReact({phase: 'answering', text: payload.answer, turnId, ...(override ?? {})});
    startReveal(payload.answer, turnId, () => {
      if (turnId === turn) safeReact({phase: 'complete', turnId});
      if (payload.ask === 'contact') { $('lead-form').hidden = false; $('lead-name').focus({preventScroll: false}); }
    });
  } catch (error) {
    if (turnId !== turn) return;                       // aborted because a newer message was sent
    console.error('assistant request failed', error);
    showError(text);
  }
}

$('question').addEventListener('input', () => { safeReact({phase: 'listening'}); });
$('chat-form').addEventListener('submit', event => {
  event.preventDefault();
  const text = $('question').value.trim(); if (!text) return;
  $('question').value = '';
  send(text);
});

$('lead-form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button[type="submit"]'); if (button.disabled) return;
  const name = $('lead-name').value.trim(), phone = $('lead-phone').value.trim();
  const err = $('lead-err'); err.hidden = true;
  button.disabled = true; button.textContent = 'Sending…';
  leadSubmissionId ??= `onro-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; // reused on retry -> no duplicate lead
  const attribution = {};
  for (const k of ['ref', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) { const v = params.get(k); if (v) attribution[k] = v.slice(0, 100); }
  try {
    const {res, data} = await postJson('/api/public/leads', {
      ...attribution, name, phone, source: 'ONRO web assistant', campaign: 'onro-assistant',
      notes: 'Asked for a counsellor call via the ONRO web assistant.', message: 'Callback request via ONRO web assistant.',
      submissionId: leadSubmissionId,
    });
    if (res.status === 400) { err.textContent = typeof data.message === 'string' ? data.message : 'Please check your details.'; err.hidden = false; return; }
    if (!res.ok || !(data.saved ?? data.ok)) throw new Error(`HTTP ${res.status}`);
    $('lead-form').hidden = true; leadSubmissionId = null;
    const first = name.split(' ')[0];
    appendMessage(`Thanks${first ? ' ' + first : ''}! Your request is with our team. A counsellor will call you.`, 'assistant');
    safeReact({phase: 'answering', text: 'Thanks', mood: 'Grateful', gesture: 'Bow'});
  } catch (error) {
    console.error('lead request failed', error);
    err.textContent = 'We couldn’t send that. Please try again.'; err.hidden = false;
  } finally { button.disabled = false; button.textContent = 'Request a call'; }
});

window.addEventListener('pagehide', event => { if (event.persisted) return; inflight?.abort(); settleReveal(); controller.dispose(); mascot?.dispose(); });
