// BLIND evaluation set. Written AFTER the rule fixes and never used to tune rules or examples
// until its first score was recorded (see README "Evaluation"). It measures generalisation;
// do not add phrases here to make a score pass. It is never used to fit the classifier.
// Row: [visitor message, expected intent, previous intent (optional)].
export const intentEvalBlind = [
  // greetings / farewells
  ['hello, is anyone there', 'greeting'],
  ['hey onro', 'greeting'],
  ['good morning, i have a few questions', 'greeting'],
  ['alright, i am heading out now, bye', 'goodbye'],
  ['thanks for everything, see you', 'goodbye'],

  // knowledge-base questions
  ['what do i learn in the ai generalist course', 'question'],
  ['how long is the architect programme', 'question'],
  ['is the soc analyst track live or recorded', 'question'],
  ['can i get a certificate verified by employers', 'question'],
  ['do batches start every week', 'question'],
  ['which course suits a final year student', 'question'],
  ['does the certification need daily activities too', 'question'],
  ['are classes available on weekends', 'question'],
  ['will there be help finding a job', 'question'],

  // confusion
  ['i keep rereading the scoring section and nothing sinks in', 'confusion'],
  ['sorry, i am totally lost about the viva', 'confusion'],
  ['i cannot figure out which project to pick first', 'confusion'],
  ['this part is hard to follow', 'confusion'],
  ['i do not get what a daily activity is', 'confusion'],

  // frustration / failed attempts
  ['i tried three times and the upload still errors out', 'frustration'],
  ['the deploy fails every single time', 'frustration'],
  ['i have not managed to finish a single project', 'frustration'],
  ['my agent is broken and i am fed up', 'frustration'],
  ['i could not get the workflow to run', 'frustration'],

  // worry / objections
  ['i have zero coding background, is that a problem for me', 'worry'],
  ['i am afraid i will fall behind the batch', 'worry'],
  ['i am anxious about whether i will pass', 'worry'],
  ['what if i am not smart enough for this', 'worry'],
  ['i am nervous about starting at my age', 'worry'],

  // disappointment
  ['my project score came out lower than i hoped', 'disappointment'],
  ['i feel let down by my progress', 'disappointment'],
  ['honestly i am feeling low today', 'disappointment'],
  ['i was rejected from the last interview', 'disappointment'],

  // achievements
  ['i just completed my third project', 'success'],
  ['my chatbot is live now', 'success'],
  ['i submitted all five projects', 'success'],
  ['i got the certificate today', 'success'],
  ['i cleared the viva', 'success'],

  // improvement
  ['oh now i get how the points work', 'improvement'],
  ['the error is gone, i fixed it', 'improvement'],
  ['i am not confused anymore', 'improvement'],

  // gratitude
  ['thank you, that explained it well', 'gratitude'],
  ['many thanks for the quick help', 'gratitude'],
  ['i am grateful for your help', 'gratitude'],

  // playful / surprise
  ['do you dream of electric sheep', 'playful'],
  ['tell me something fun about robots', 'playful'],
  ['whoa, i had no idea there were twenty projects', 'surprise'],
  ['that is wild', 'surprise'],

  // mixed emotions / negation
  ['i finished the project, but i have no clue why it works', 'confusion'],
  ['i built the agent and it still gives wrong answers', 'frustration'],
  ['thank you, though i am still worried about the fee', 'worry'],
  ['i am not frustrated, just curious how scoring works', 'question'],
  ['i did not finish and i feel bad about it', 'frustration'],

  // multi-turn follow-ups
  ['a little', 'worry', 'worry'],
  ['yes please', 'confusion', 'confusion'],
  ['no', 'neutral'],

  // neutral
  ['i am from vijayawada', 'neutral'],
  ['my email is on the form', 'neutral'],
];
