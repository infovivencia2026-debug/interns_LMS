// Pure helpers for the live ONRO page: validate assistant payloads and decide which reaction to
// show for an answer. No DOM, no network - covered by scripts/onro-live.test.mjs.
import {moods, gestures} from './actions.js';

const STAGES = ['idle', 'menu', 'fee_offered'];

// When the VISITOR's own message carries one of these feelings, ONRO's face and body keep
// following that feeling (confusion -> Empathetic + Lean-in, achievement -> Proud + Clap, ...).
// A cheerful answer must not override it. For plain greetings, questions and neutral chat the
// answer's own meaning (from the assistant) decides the reaction.
const USER_FEELING_LEADS = new Set([
  'confusion', 'frustration', 'worry', 'disappointment',
  'success', 'improvement', 'gratitude', 'goodbye', 'playful', 'surprise',
]);

/** Returns {mood, gesture} only if BOTH are in the mascot allowlist; otherwise null. Never throws. */
export function normalizeReaction(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const {mood, gesture} = raw;
  if (typeof mood !== 'string' || typeof gesture !== 'string') return null;
  return moods.includes(mood) && gestures.includes(gesture) ? {mood, gesture} : null;
}

/**
 * Reaction to show while an answer is delivered.
 * Returns {mood, gesture} to pass as an override, or null to let the conversation controller keep
 * the reaction that matches the visitor's message (and fall back to calm when nothing applies).
 */
const ANSWER_LEADS = new Set(['thanks', 'bye', 'greeting_menu', 'about', 'ack']);   // topics where the visitor's own gratitude/greeting is the point
export function answerReaction(userIntent, serverReaction, topic) {
  // a "thanks" inside a question must not make ONRO bow on an informational answer: the answer's meaning leads
  if (topic && !ANSWER_LEADS.has(topic) && userIntent === 'gratitude') return normalizeReaction(serverReaction);
  if (USER_FEELING_LEADS.has(userIntent)) return null;
  return normalizeReaction(serverReaction);
}

/** Validates the assistant API payload. Returns a clean object, or null if unusable. */
export function parseAssistantPayload(data) {
  if (!data || typeof data !== 'object') return null;
  const answer = typeof data.answer === 'string' ? data.answer.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim() : '';
  if (!answer || answer.length > 2000) return null;
  return {
    answer,
    stage: STAGES.includes(data.stage) ? data.stage : 'idle',
    ask: data.ask === 'contact' ? 'contact' : null,
    topic: typeof data.topic === 'string' && /^[a-z_]{1,30}$/.test(data.topic) ? data.topic : '',
    reaction: normalizeReaction(data.reaction),
  };
}

/** Cumulative character counts for a typewriter reveal; one step when reduced motion is on. */
export function revealSteps(text, reducedMotion, chunk = 3) {
  const length = String(text ?? '').length;
  if (reducedMotion || length <= chunk) return [length];
  const steps = [];
  for (let n = chunk; n < length; n += chunk) steps.push(n);
  steps.push(length);
  return steps;
}
