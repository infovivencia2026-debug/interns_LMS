// Prints ONRO's reaction-intent accuracy on the evaluation sets (never used to fit the classifier).
//   development set: public/onro-studio/intent-eval.js       (rules were tuned on it - regression only)
//   blind + fresh:   intent-eval-blind.js / intent-eval-fresh.js (first-pass scores were 60.3% / 56.3%;
//                    rules were tuned afterwards, so current 100% overstates real accuracy - see README)
// Usage: node scripts/onro-eval-report.mjs [--verbose]
import {detectIntent} from '../public/onro-studio/conversation.js';
import {intentEval} from '../public/onro-studio/intent-eval.js';
import {intentEvalBlind} from '../public/onro-studio/intent-eval-blind.js';
import {intentEvalFresh} from '../public/onro-studio/intent-eval-fresh.js';

const verbose = process.argv.includes('--verbose');
export function score(rows) {
  let ok = 0; const misses = [];
  for (const [text, expected, previous] of rows) {
    const got = detectIntent(text, previous ?? 'neutral');
    if (got === expected) ok++; else misses.push({text, expected, got});
  }
  return {ok, total: rows.length, misses};
}
for (const [name, rows] of [['development', intentEval], ['blind', intentEvalBlind], ['fresh', intentEvalFresh]]) {
  const r = score(rows);
  console.log(`${name}: ${r.ok}/${r.total} = ${(100 * r.ok / r.total).toFixed(1)}%`);
  if (verbose) for (const m of r.misses) console.log(`  MISS "${m.text}" expected=${m.expected} got=${m.got}`);
}
