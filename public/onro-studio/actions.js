export const moods = ['Happy', 'Curious', 'Thinking', 'Listening', 'Excited', 'Empathetic', 'Surprised', 'Confident', 'Confused', 'Hopeful', 'Proud', 'Grateful', 'Shy', 'Worried', 'Disappointed', 'Playful'];
export const gestures = ['Wave', 'Nod', 'Explain', 'Point', 'Bounce', 'Turn', 'Celebrate', 'Rest', 'Shrug', 'Bow', 'Look-around', 'Lean-in', 'Clap', 'Heart', 'Roll'];
export const actions = moods.flatMap((mood) => gestures.map((gesture) => ({id: `${mood.toLowerCase()}-${gesture.toLowerCase()}`, mood, gesture})));

// This is a local rehearsal, not a source of truth for course details.
export function rehearsal(text) {
  if (/\b(error|failed|broken|wrong)\b/i.test(text)) return {mood:'Empathetic', gesture:'Nod', reply:'Let’s slow down and work through it. Which step went wrong?'};
  if (/\b(confused|hard|stuck|understand|worried)\b/i.test(text)) return {mood:'Empathetic', gesture:'Explain', reply:'We can take it one step at a time. Tell me the part that feels confusing.'};
  if (/\b(built|finished|success|completed|shipped)\b/i.test(text)) return {mood:'Excited', gesture:'Celebrate', reply:'You made something real! What did you build, and what would you like to try next?'};
  if (/\b(hello|hi|hey)\b/i.test(text)) return {mood:'Happy', gesture:'Wave', reply:'Hi! I’m ONRO, your curious learning companion. What would you like to explore?'};
  if (/\b(thank|thanks)\b/i.test(text)) return {mood:'Happy', gesture:'Nod', reply:'You’re welcome. Keep that curiosity going!'};
  if (/\b(price|fee|cost)\b/i.test(text)) return {mood:'Listening', gesture:'Explain', reply:'The ONROL team can help you with the program fit and fee. Use the website’s application form to connect with them.'};
  return {mood:'Curious', gesture:'Explain', reply:'Let’s start with your goal. What would you like to learn or build?'};
}
