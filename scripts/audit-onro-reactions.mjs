// Audits ONRO's expression + movement against what it is saying, over thousands of real questions.
// Uses the SAME logic as the website: the CRM brain (answer + reaction for the answer's meaning) and the
// website's conversation.js / live-reaction.js (the visitor's own feeling leads when it should).
//   node scripts/audit-onro-reactions.mjs            prints a summary + every rule violation
// ONRO's vocabulary (public/onro-studio/mascot.js): Confident WINKS, Playful is cheeky, Disappointed frowns,
// Surprised makes an "O" mouth; Shrug = "I don't know", Bow = thanks, Heart = reassurance, Celebrate/Clap = success,
// Wave = hello/goodbye, Lean-in = interested/sympathetic, Look-around = thinking.
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const crm = p => import(pathToFileURL(resolve('../onrol crm', p)).href);
const [{webReply, cleanQuery}, {buildIndex, searchIndex}, {KNOWLEDGE_CHUNKS}, corpus, fresh, fresh2] = await Promise.all([
  crm('src/lib/chatbot/onrol-flows.ts'), crm('src/lib/chatbot/knowledge-search.ts'), crm('src/lib/chatbot/knowledge-data.ts'),
  crm('test/qa-corpus.mjs'), crm('test/qa-fresh.mjs'), crm('test/qa-fresh2.mjs'),
]);
const {detectIntent, reactionForIntent} = await import('../public/onro-studio/conversation.js');
const {answerReaction} = await import('../public/onro-studio/live-reaction.js');

const index = buildIndex(KNOWLEDGE_CHUNKS);
const kb = q => { const h = searchIndex(index, cleanQuery(q)); return h ? {text: h.chunk.text} : null; };
const questions = [...corpus.buildCorpus().map(i => i.q), ...fresh.fresh.map(f => f[0]), ...fresh2.fresh2.map(f => f[0])];

const CHEER = new Set(['Happy', 'Excited', 'Proud', 'Playful', 'Confident']);           // upbeat faces
const CELEBRATE = new Set(['Celebrate', 'Clap', 'Bounce']);
const WINK = new Set(['Confident', 'Playful']);                                         // wink / cheeky: never on serious news
const SERIOUS_TOPICS = new Set(['refund', 'job', 'location', 'none', 'fee_ask', 'fee_expired', 'support', 'no_coding', 'contact', 'unknown_fact', 'abuse', 'complaint', 'stop_request', 'trust']);
const NEGATIVE_NEWS = new Set(['refund', 'job', 'location', 'none', 'fee_expired', 'unknown_fact', 'abuse', 'complaint']);   // "no refunds", "can't guarantee", "I don't know"
const RULES = [
  ['upbeat/winking face on negative news (refund / no job guarantee / "I don\'t know")', (r, t, u) => NEGATIVE_NEWS.has(t) && CHEER.has(r.mood) && !['success', 'gratitude', 'playful', 'improvement', 'greeting'].includes(u)],
  ['celebration gesture without the visitor having achieved/played', (r, t, u) => CELEBRATE.has(r.gesture) && !['success', 'playful', 'improvement'].includes(u)],
  ['wink/cheeky face on a serious topic', (r, t, u) => SERIOUS_TOPICS.has(t) && WINK.has(r.mood) && !['success', 'gratitude', 'playful', 'improvement'].includes(u)],
  ['Wave on something that is not a greeting/goodbye/introduction', (r, t, u) => r.gesture === 'Wave' && !['greeting_menu', 'bye', 'about'].includes(t) && !['greeting', 'goodbye'].includes(u)],
  ['Bow on something that is not thanks', (r, t, u) => r.gesture === 'Bow' && t !== 'thanks' && u !== 'gratitude' && t !== 'handoff_contact' && t !== 'fee_yes_contact'],
  ['Shrug on a definite answer (Shrug means "I don\'t know")', (r, t, u) => r.gesture === 'Shrug' && !['none', 'location', 'media_nudge', 'unknown_fact', 'offtopic'].includes(t) && u !== 'surprise'],
  ['Heart on something that is not reassurance/gratitude', (r, t, u) => r.gesture === 'Heart' && !['support', 'no_coding', 'suitability', 'beginner', 'trust', 'thanks'].includes(t) && !['worry', 'gratitude'].includes(u)],
  ['Nod on a refusal ("no refunds") - reads as agreeing', (r, t) => r.gesture === 'Nod' && ['refund', 'location'].includes(t)],
  ['Confused/Worried/Disappointed face when ONRO itself is answering helpfully', (r, t, u) => ['Confused', 'Worried', 'Disappointed'].includes(r.mood) && !['none', 'location'].includes(t) && !['worry', 'disappointment', 'confusion'].includes(u)],
  ['Turn/Roll/Look-around used while answering (they are idle/thinking movements)', (r) => ['Turn', 'Roll', 'Look-around'].includes(r.gesture)],
];

const byTopic = new Map();
const violations = new Map(RULES.map(([name]) => [name, []]));
for (const q of questions) {
  const server = webReply(q, 'idle', new Date('2026-10-08T10:00:00Z'), '', kb);
  const intent = detectIntent(q, 'neutral');
  const override = answerReaction(intent, server.reaction, server.topic);                 // exactly what the launcher does
  const final = override ?? reactionForIntent(intent);
  const key = server.topic;
  const row = byTopic.get(key) ?? {n: 0, combos: new Map()};
  row.n++; const c = `${final.mood}+${final.gesture}`; row.combos.set(c, (row.combos.get(c) ?? 0) + 1); byTopic.set(key, row);
  for (const [name, test] of RULES) if (test(final, server.topic, intent)) { const list = violations.get(name); if (list.length < 400) list.push(`${q}  [topic=${server.topic} intent=${intent}] -> ${c}`); }
}
console.log(`questions audited: ${questions.length}\n`);
console.log('REACTION BY ANSWER TYPE (what ONRO actually shows):');
for (const [topic, row] of [...byTopic].sort((a, b) => b[1].n - a[1].n)) {
  console.log(`  ${topic.padEnd(18)} n=${String(row.n).padEnd(5)} ${[...row.combos].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([c, n]) => `${c}(${n})`).join('  ')}`);
}
let total = 0;
console.log('\nRULE VIOLATIONS:');
for (const [name, list] of violations) { total += list.length; console.log(`  ${String(list.length).padStart(4)}  ${name}`); for (const s of list.slice(0, 3)) console.log(`          e.g. ${s}`); }
const used = new Set([...byTopic.values()].flatMap(r => [...r.combos.keys()]));
console.log(`\ndistinct expression+movement combinations actually shown: ${used.size} of 240`);
console.log(total ? `\n${total} violation(s)` : '\nno violations');
process.exit(total ? 1 : 0);
