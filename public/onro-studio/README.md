# ONRO motion prototype

## Homepage greeting

The existing `launcher.js` loads `entrance.js` on the homepage. ONRO waits for
the loading cover and font loading to finish, rolls in from the right with
synchronized wheel rotation, turns toward the visitor, waves and displays
“Hi! I’m ONRO.” with mouth motion. This greeting is visual; it does not autoplay
audio. The greeting retires after a short pause and leaves the chat launcher.
Opening chat immediately disposes the entrance. Reduced-motion users receive
the stationary greeting. No animation controls are added to the homepage.

The character uses a transparent canvas and a small non-interactive overlay
above the existing chat launcher. WebGL failures leave the normal launcher
available. Verify locally with:

```sh
node scripts/verify-onro-entrance.mjs http://127.0.0.1:8095/
```

Run from the `onrol new` project root:

```sh
node scripts/preview-onro.mjs --port 8094
```

Open the printed `/onro-studio/` URL for the automatic conversation preview.
It has a normal chat composer and **no animation-control buttons**. Internal
animation controls live separately at `/onro-studio/studio.html`.
The existing Vite dev server also serves this directory.
It is a standalone, noindex preview, not linked from the website.
No existing routes, chatbot backend, CRM, package manifests or lockfiles are changed.

## What is implemented

- Procedural Three.js model: movable head, shoulders, elbows, hands and wheels.
- Jade / ivory / coral material palette; concept image available for comparison.
- Sixteen expressions and fifteen movements, yielding 240 combinations.
  These are blended procedural reactions, not 240 individually sculpted clips.
- New expressions: confused, hopeful, proud, grateful, shy, worried,
  disappointed and playful. New movements: rest, shrug, bow, look around,
  lean in, clap, hands near heart, and roll.
- Automatic local conversation reactions with short-follow-up context,
  negative-clause precedence, stale-response rejection, mouth motion and
  timed return to listening.
- Local scripted replies and an allowlisted event contract.
- Mobile layout, keyboard focus, pause, reduced motion, hidden-tab rendering skip,
  capped pixel ratio, image fallback and resource cleanup.
- Three.js 0.186.1 is vendored locally with its MIT license; no runtime CDN needed.

This is a working 3D prototype, not a pixel-identical recreation of the generated
image or an exported artist-rigged Blender/GLB asset. Fine sculpting, a complete
chatbot service and CRM integration remain separate work.

## Connect a conversation

Dispatch phases from the chatbot UI as the request changes state:

```js
window.dispatchEvent(new CustomEvent('onro:reaction', {
  detail: { phase: 'user', text: userQuestion, turnId: 1 }
}));
window.dispatchEvent(new CustomEvent('onro:reaction', {
  detail: { phase: 'thinking', turnId: 1 }
}));
window.dispatchEvent(new CustomEvent('onro:reaction', {
  detail: { phase: 'answering', text: assistantAnswer, turnId: 1 }
}));
```

Recognized phases: `user`, `idle`, `listening`, `thinking`, `answering`, `error`,
`complete`. Increasing `turnId` values prevent old answers from changing a newer
conversation reaction. Optional mood + gesture metadata can override the local
inference; both must be in the allowlist. Dispatch `complete` when streaming ends.
For React integration, create the mascot with `createMascot` from `mascot.js` and
pass it to `createConversationController` from `conversation.js`. Call `react()`
on conversation phases and `dispose()` on both objects when unmounting.
The preview also accepts same-origin parent-frame messages with
`{ type: 'onro:reaction', detail: { phase, text, turnId } }`.

This is a local English intent layer: an IDF-weighted nearest-example classifier
fitted from 102 curated examples in `intent-examples.js`, plus explicit lifecycle,
negation and priority rules. It is **not a trained or fine-tuned LLM**.
Low similarity, low separation between intents and unfamiliar vocabulary cause
the classifier to abstain. Edit the labeled examples to tune local reactions;
visitor conversations are never used for training automatically.
It deliberately stays calm on unknown text and considers the last user message
when reacting to an answer. It is not an emotion diagnosis. Real chatbot answers
and CRM integration still need a backend. No messages are persisted or transmitted
by this preview.

Rehearsal input stays in memory and is never sent or persisted. Real program
answers should come from a verified backend; animation metadata must be selected
from the allowlist, not evaluated as code. No credentials belong in these files.

## Live page: real ONROL assistant (`live.html`)

`live.html` + `live.js` use the same mascot and controller, but answers come from the CRM
endpoint `POST /api/public/assistant` (same brain as the WhatsApp assistant, knowledge base in
`onrol crm/whatsapp-assistant/knowledge`). Open it as
`/onro-studio/live.html?api=http://127.0.0.1:3100` against a local CRM (default API base is
`https://go.onrol.in`, which only works after the CRM is deployed).

- The response is `{ answer, reaction: { mood, gesture }, stage, ask, topic }`. The visitor sees
  only `answer`; `reaction` is validated against `actions.js` on the server and again in
  `live-reaction.js`. Invalid or missing metadata falls back to a calm reaction.
- Who leads: when the **visitor's own message** carries a feeling (confusion, frustration, worry,
  disappointment, achievement, gratitude, farewell, playfulness), ONRO keeps following it. A cheerful
  answer cannot override a frustrated visitor. For greetings, questions and neutral chat, the
  **meaning of the answer** picks the reaction (Curious/Confident + Explain, etc.).
- Phases: user message -> `user` -> `thinking` (Thinking + Look-around) -> `answering` while the
  text is typed out (mouth moves) -> `complete` (back to Listening + Rest). A newer message aborts the
  older request and any late response is ignored (`turnId`). Failures show a helpful message with
  a retry control and an Empathetic + Nod reaction. Reduced motion shows the answer in one step.
- Callback requests ("talk to a counsellor") show a name + phone form that posts to the existing
  `/api/public/leads` intake (country-code numbers accepted). Nothing is stored for training.

## Evaluation of the reaction classifier (be careful what you claim)

The reaction layer is **rules + an example-based classifier (IDF-weighted nearest example)**. It is
**not** an LLM and nothing here is fine-tuned or trained on visitor chats. Training examples
(`intent-examples.js`, 102 phrases about ONROL courses, batches, certification and projects) are kept
strictly separate from three evaluation sets (`intent-eval.js`, `intent-eval-blind.js`,
`intent-eval-fresh.js`; a test asserts no overlap).

First-pass accuracy on text the rules had never seen: **69.6%** (development set), **60.3%**
(blind set), **56.3%** (fresh set). Each set's misses were then used to widen the rules and examples
(mixed emotions after "but", "did not / could not", negated emotions, short follow-ups, question
openers), after which all three sets pass (100%) — **those 100% figures are tuned-on-the-test-set
numbers and overstate real-world accuracy**. Expect roughly 55-70% intent accuracy on genuinely new
phrasing. Misses mostly fall back to the calm default (Listening or Curious), and a test guards the
one failure that matters most: a negative message is never read as a celebration. To measure
properly, write a new unseen set (ideally from authorised, consented transcripts) before claiming more.

```sh
node scripts/onro-eval-report.mjs        # accuracy on the evaluation sets
node --test scripts/onro-live.test.mjs   # reaction selection, payload validation, stale turns, safety
```

## Verify

```sh
node scripts/verify-onro.mjs
node --test scripts/onro-conversation.test.mjs
# live flow against the real assistant (start the CRM first: npx next start -p 3100)
node scripts/verify-onro-live.mjs
```

Uses local Puppeteer and Chrome (or `PUPPETEER_EXECUTABLE_PATH`), starts its own
temporary local server, checks each expression and movement and conversation reactions,
mobile overflow, reduced motion, and unavailable WebGL. Screenshots are written
to `output/onro/`. No calls to production APIs occur.

## Concept provenance

`concept.png` was created with the built-in image-generation tool.
Prompt summary: one cheerful compact wheeled ONRO robot, a jade shell, curved
ivory forehead inset and face, large plum eyes, coral hands and diamond chest
light, rounded triangular wheel hubs, waving pose, premium stylized 3D rendering
on a warm paper studio background. This is design exploration for ONROL; it
does not establish legal exclusivity.
