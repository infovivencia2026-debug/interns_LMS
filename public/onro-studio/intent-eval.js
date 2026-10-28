// DEVELOPMENT evaluation set (69 phrases). Baseline on first run was 48/69 (69.6%); its misses
// were then used to fix the intent RULES in conversation.js (mixed emotions, "did not", "could not",
// short follow-ups, question openers), so this set is NO LONGER a fair generalisation test.
// It stays as a regression suite. The fair test is intent-eval-blind.js (written after the fixes,
// never used to tune anything). Neither set is ever used to fit the example classifier.
// Each row: [visitor message, expected intent, previous intent (optional, for short follow-ups)].
// Grounded in ONROL topics: courses, certification, batches, jobs, fees. No visitor data is used.
export const intentEval = [
  // greetings / farewells
  ['hello onro, i am new here', 'greeting'],
  ['hey, good evening', 'greeting'],
  ['hi there', 'greeting'],
  ['bye for now, thanks', 'goodbye'],
  ['okay that is all for today, goodbye', 'goodbye'],
  ['see you tomorrow', 'goodbye'],

  // questions about the knowledge base (must stay curious, never celebrate)
  ['what is the difference between the generalist and the architect course', 'question'],
  ['how do i get certified after the course', 'question'],
  ['when does the next batch start', 'question'],
  ['can international students join', 'question'],
  ['do you give job assistance', 'question'],
  ['how many projects do i have to complete', 'question'],
  ['is there a cyber security track', 'question'],
  ['did anyone get hired after finishing the course', 'question'],
  ['can i finish the certification in a month', 'question'],

  // confusion
  ['i do not understand how the daily activities work', 'confusion'],
  ['the project scoring makes no sense to me', 'confusion'],
  ['i am stuck on the n8n workflow', 'confusion'],
  ['i am confused about which course fits me', 'confusion'],
  ['can you explain that in simpler words, i am lost', 'confusion'],
  ['yes', 'confusion', 'confusion'],

  // frustration / failed attempts
  ['my workflow keeps failing and i am annoyed', 'frustration'],
  ['i have not finished any project yet', 'frustration'],
  ['i could not complete the second project', 'frustration'],
  ['nothing is working and the deploy broke again', 'frustration'],
  ['the submission failed again', 'frustration'],
  ['i did not build it in time', 'frustration'],

  // worry about getting started / objections
  ['i am a non coder, will i manage this course', 'worry'],
  ['i am scared i will not be able to complete five projects', 'worry'],
  ['i am worried it is too late for me to start ai', 'worry'],
  ['i am nervous about joining without experience', 'worry'],
  ['not sure if i can afford this', 'worry'],
  ['i feel overwhelmed by so many tools', 'worry'],

  // disappointment
  ['i feel discouraged, my last project scored low', 'disappointment'],
  ['i am sad that i missed the batch', 'disappointment'],
  ['i am not happy with my result', 'disappointment'],
  ['i did not get the job i wanted', 'disappointment'],

  // achievements (explicit personal)
  ['i completed my first project on the platform', 'success'],
  ['i finished all five projects', 'success'],
  ['i built my chatbot and it is live', 'success'],
  ['i got a job offer after the course', 'success'],
  ['my n8n workflow worked', 'success'],
  ['i passed the viva', 'success'],

  // improvement
  ['it clicked now, the scoring makes sense', 'improvement'],
  ['i fixed the bug and it works now', 'improvement'],
  ['i am not stuck anymore', 'improvement'],
  ['i finally understand the daily activities', 'improvement'],

  // gratitude
  ['thank you so much for explaining the certification', 'gratitude'],
  ['thanks, that cleared things up', 'gratitude'],
  ['i really appreciate the help', 'gratitude'],
  ['that was very helpful', 'gratitude'],

  // playful / surprise
  ['tell me a joke about robots', 'playful'],
  ['can you say something funny', 'playful'],
  ['haha you are fun', 'playful'],
  ['wow, that is amazing', 'surprise'],
  ['i did not expect there would be so many projects', 'surprise'],

  // mixed emotions and negation (the dangerous cases)
  ['i built it but i am confused about the next step', 'confusion'],
  ['i finished the project but it still fails', 'frustration'],
  ['i thought i would finish but i have not', 'frustration'],
  ['not worried anymore, i get it now', 'improvement'],
  ['thanks, but i am still confused', 'confusion'],
  ['can i complete this if i have not coded before', 'question'],
  ['i do not feel proud of this result', 'disappointment'],

  // multi-turn short follow-ups
  ['still a little', 'worry', 'worry'],
  ['not yet', 'frustration', 'frustration'],
  ['ok', 'confusion', 'confusion'],

  // neutral
  ['i live in hyderabad', 'neutral'],
  ['my name is asha', 'neutral'],
  ['purple vegetables enormous orbit', 'neutral'],
];
