// ONRO on onrol.in: ONRO itself is the bot, with a small chat box beside it. No separate panel or button.
//   HOME page : ONRO rolls in (entrance.js), waves, then a mini chat box says "Hi!" right next to it.
//               ONRO stays; clicking ONRO shows/hides the box. Replies are typed in the same box.
//   OTHER pages: a transparent ONRO portrait sits in the corner; clicking it opens the same mini chat.
//   <script src="/onro-studio/launcher.js?v=9" defer></script>
// Answers come from ONROL's assistant (go.onrol.in/api/public/assistant), grounded in the knowledge base.
// "Talk to a counsellor" collects name + phone and sends it through the existing lead intake.
// No cookies or tracking; sessionStorage only remembers that the greeting auto-opened once on inner pages.
// The server caches static files for a year: bump V and every ?v= (page tags, imports) when anything changes.
// Look matches onrol.in: white + orange #f46718, sharp corners, black header with orange rule, uppercase tracked labels, site body font.
(function () {
  if (window.__onroLauncher) return;
  window.__onroLauncher = true;
  var V = '9';
  var path = location.pathname;
  if (/^\/(onro-studio|learn|login|tasks)(\/|$)/.test(path)) return;      // never on the assistant itself or app shells
  var isHome = path === '/' || path === '/index.html';
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  var API = LOCAL ? 'http://127.0.0.1:3100' : 'https://go.onrol.in';       // local preview talks to a local CRM

  var css = [
    ':root{--onro-w:200px;--onro-box:344px;--onro-fs:14px}',
    '@media (min-width:1800px){:root{--onro-w:290px;--onro-box:460px;--onro-fs:18px}}',
    '@media (min-width:2600px){:root{--onro-w:400px;--onro-box:600px;--onro-fs:24px}}',
    '#onro-launcher{position:fixed;right:16px;bottom:16px;z-index:2147483000;display:flex;flex-direction:column;align-items:flex-end}',
    '#onro-launcher .onro-char{display:block;width:calc(var(--onro-w)*.46);padding:0;border:0;border-radius:0;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '#onro-launcher .onro-char img{display:block;width:100%;height:auto;' + (reduced ? '' : 'transition:transform .15s ease;') + '}',
    '#onro-launcher .onro-ask{margin:0 0 6px;min-height:44px;padding:0 14px;border:0;border-top:3px solid #f46718;border-radius:0;background:#0a0a0a;color:#fff;font-family:inherit;font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35)}',
    '#onro-launcher .onro-ask:hover{background:#f46718;color:#0a0a0a}',
    '#onro-launcher .onro-ask:focus-visible{outline:2px solid #f46718;outline-offset:2px}',
    'body:has(#onro-entrance) #onro-launcher .onro-ask,body:has(#onro-entrance-pending) #onro-launcher .onro-ask,body[data-onro-mini="open"] #onro-launcher .onro-ask{display:none}',
    '#onro-launcher.onro-wait .onro-char,#onro-launcher.onro-wait .onro-ask{display:none}',
    '#onro-launcher .onro-char:hover img{transform:translateY(-3px)}',
    '#onro-launcher .onro-char:focus-visible{outline:3px solid #f46718;outline-offset:2px}',
    'body:has(#onro-entrance) #onro-launcher .onro-char,body:has(#onro-entrance-pending) #onro-launcher .onro-char{display:none}',
    // the mini chat box: above the portrait on inner pages, beside the standing 3D ONRO on the home page
    '#onro-mini{position:fixed;right:16px;bottom:calc(var(--onro-w)*.62);width:min(var(--onro-box),calc(100vw - 32px));height:min(calc(var(--onro-box)*1.34),calc(100dvh - 140px));display:flex;flex-direction:column;overflow:hidden;border:0;border-top:4px solid #f46718;border-radius:0;background:#fff;color:#0a0a0a;box-shadow:0 20px 50px rgba(0,0,0,.45);z-index:2147483000;font-weight:400;font-size:var(--onro-fs);line-height:1.5;font-family:inherit}',
    '#onro-mini[hidden]{display:none}',
    'body:has(#onro-entrance) #onro-mini{right:calc(var(--onro-w) + 24px);bottom:16px;width:min(var(--onro-box),calc(100vw - var(--onro-w) - 56px));height:min(calc(var(--onro-box)*1.34),calc(100dvh - 32px))}',
    '#onro-mini header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 0 0 16px;min-height:56px;background:#0a0a0a !important;color:#fff !important;position:static !important;border:0 !important;box-shadow:none !important}',
    '#onro-mini header b{color:#fff;font-weight:800;letter-spacing:.14em;text-transform:uppercase;font-size:13px}',
    '#onro-mini header span{display:block;font-weight:500;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#f46718}',
    '#onro-mini .onro-x{min-width:56px;min-height:56px;border:0;border-radius:0;background:transparent !important;color:#fff !important;font-weight:600;font-size:20px;line-height:1;font-family:inherit;cursor:pointer}',
    '#onro-mini .onro-x:hover{background:#f46718;color:#0a0a0a}',
    '#onro-log{flex:1 1 auto;min-height:0;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#fff}',
    '#onro-log p{margin:0;padding:10px 14px;max-width:88%;white-space:pre-wrap;overflow-wrap:anywhere;border-radius:0}',
    '#onro-log p.bot{align-self:flex-start;background:#f7f2ee;color:#0a0a0a;border-left:3px solid #0a0a0a}',
    '#onro-log p.me{align-self:flex-end;background:#f46718;color:#0a0a0a;font-weight:600}',
    '#onro-log p.wait{color:#5a5a5a}',
    '#onro-log .onro-retry{margin-left:6px;min-height:36px;padding:0 12px;border:1px solid #0a0a0a;border-radius:0;background:#fff;color:#0a0a0a;font-weight:700;font-size:12px;line-height:1;font-family:inherit;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}',
    '#onro-chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 14px 12px;background:#fff}',
    '#onro-chips button{min-height:44px;padding:0 14px;border:1px solid #0a0a0a;border-radius:0;background:#fff;color:#0a0a0a;font-weight:700;font-size:12px;line-height:1;font-family:inherit;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:background .15s,color .15s}',
    '#onro-chips button:hover{background:#0a0a0a;color:#fff}',
    '#onro-mini form{display:flex;gap:0;padding:0;border-top:1px solid rgba(10,10,10,.15);background:#fff}',
    '#onro-mini input{flex:1 1 auto;min-width:0;min-height:52px;padding:0 14px;border:0;border-radius:0;background:#fff;color:#0a0a0a;font:inherit;font-size:16px}',
    '#onro-mini input:focus{background:#fff8f3}',
    '#onro-mini form button{flex:0 0 auto;min-height:52px;padding:0 22px;border:0;border-radius:0;background:#f46718;color:#0a0a0a;font-weight:800;font-size:12px;line-height:1;font-family:inherit;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:background .15s}',
    '#onro-mini form button:hover{background:#0a0a0a;color:#fff}',
    '#onro-mini form button:disabled{opacity:.6;cursor:progress}',
    '#onro-mini #onro-lead{display:grid;gap:8px;padding:12px 14px 14px}',
    '#onro-mini #onro-lead[hidden]{display:none}',
    '#onro-mini #onro-lead input{border:1px solid rgba(10,10,10,.3);min-height:44px}',
    '#onro-lead label{font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}',
    '#onro-lead .onro-err{margin:0;color:#b42318;font-size:13px}',
    '#onro-mini button:focus-visible,#onro-mini input:focus-visible{outline:2px solid #f46718;outline-offset:-2px}',
    '#onro-entrance .onro-hi{display:' + 'block}',
    'body[data-onro-mini="open"] #onro-entrance .onro-hi{display:none}',
    '@media (max-width:600px){#onro-mini,body:has(#onro-entrance) #onro-mini{right:8px;left:8px;width:auto;bottom:124px;height:min(60vh,calc(100dvh - 150px))}body:has(#onro-entrance) #onro-mini{bottom:204px;height:min(56vh,calc(100dvh - 230px))}#onro-launcher .onro-char{width:76px}#onro-chips{flex-wrap:nowrap;overflow-x:auto;padding-bottom:10px}#onro-chips button{flex:0 0 auto;min-height:44px;padding:0 12px;font-size:11px}#onro-log{min-height:96px}}'
  ].join('');
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  function seen() { try { return sessionStorage.getItem('onroGreetSeen') === '1'; } catch (e) { return false; } }
  function markSeen() { try { sessionStorage.setItem('onroGreetSeen', '1'); } catch (e) { /* storage unavailable */ } }
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    for (var k in props) { if (k === 'text') n.textContent = props[k]; else if (k === 'cls') n.className = props[k]; else n.setAttribute(k, props[k]); }
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  // ---- DOM ----
  var wrap = el('div', {id: 'onro-launcher'});
  var char = el('button', {type: 'button', cls: 'onro-char', 'aria-expanded': 'false', 'aria-controls': 'onro-mini', 'aria-label': 'Chat with ONRO, ONROL’s assistant'});
  var face = el('img', {src: '/onro-studio/onro-avatar.webp?v=' + V, alt: '', width: '92', height: '96', decoding: 'async'});
  face.addEventListener('error', function () {                       // image failed: keep a usable control
    char.textContent = 'Chat with ONRO'; char.style.cssText = 'width:auto;padding:12px 16px;border:1px solid #0a0a0a;background:#f46718;color:#0a0a0a;font:700 14px/1 system-ui,sans-serif';
  });
  char.appendChild(face); wrap.appendChild(char);
  var askBtn = el('button', {type: 'button', cls: 'onro-ask', text: 'Ask me anything'}); wrap.insertBefore(askBtn, char);   // inner pages: label above the portrait

  var mini = el('div', {id: 'onro-mini', role: 'dialog', 'aria-modal': 'false', 'aria-label': 'Chat with ONRO'}); mini.hidden = true;
  var closeBtn = el('button', {type: 'button', cls: 'onro-x', 'aria-label': 'Close chat', text: '×'});
  var head = el('header', {}, [el('b', {text: 'ONRO'}), el('span', {text: 'ONROL’s assistant'}), closeBtn]);
  head.firstChild.appendChild(el('span', {text: 'ONROL’s assistant'}));
  head.removeChild(head.children[1]);                                // (title block = name + subtitle)
  var log = el('div', {id: 'onro-log', role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversation with ONRO'});
  var chips = el('div', {id: 'onro-chips'});
  var form = el('form', {autocomplete: 'off'});
  var input = el('input', {type: 'text', maxlength: '300', placeholder: 'Type your question…', 'aria-label': 'Message ONRO', required: 'required'});
  var send = el('button', {type: 'submit', text: 'Send'});
  form.appendChild(input); form.appendChild(send);
  var lead = el('form', {id: 'onro-lead', autocomplete: 'on'}); lead.hidden = true;
  var leadName = el('input', {type: 'text', maxlength: '80', autocomplete: 'name', required: 'required', id: 'onro-lead-name'});
  var leadPhone = el('input', {type: 'tel', inputmode: 'tel', pattern: '[+]?[0-9 ()-]{8,20}', title: 'Include the country code, e.g. +91 98765 43210', maxlength: '20', autocomplete: 'tel', required: 'required', placeholder: '+91 98765 43210', id: 'onro-lead-phone'});
  var leadErr = el('p', {cls: 'onro-err', role: 'alert'}); leadErr.hidden = true;
  var leadBtn = el('button', {type: 'submit', text: 'Request a call'});
  [el('label', {for: 'onro-lead-name', text: 'Your name'}), leadName, el('label', {for: 'onro-lead-phone', text: 'Phone (with country code)'}), leadPhone, leadErr, leadBtn].forEach(function (n) { lead.appendChild(n); });
  [head, log, chips, lead, form].forEach(function (n) { mini.appendChild(n); });
  wrap.appendChild(mini);

  // ---- state ----
  var open = false, started = false, stage = 'idle', lastTopic = '', turn = 0, inflight = null, leadId = null, prevIntent = 'neutral', mods = null;

  function addMsg(text, who) {
    var p = el('p', {cls: who, text: text}); log.appendChild(p); log.scrollTop = log.scrollHeight; return p;
  }
  function showChips(more) {
    chips.textContent = '';
    (more ? ['Main menu', 'Courses', 'Certification', 'Batch timings', 'Talk to a counsellor'] : ['Courses', 'Certification', 'Batch timings', 'Talk to a counsellor']).forEach(function (label) {
      var b = el('button', {type: 'button', text: label});
      b.addEventListener('click', function () { chips.textContent = ''; ask(label === 'Talk to a counsellor' ? 'I want to talk to a counsellor' : label === 'Batch timings' ? 'batch timings' : label === 'Main menu' ? 'menu' : label); });
      chips.appendChild(b);
    });
  }
  function openMini(focus) {
    if (open) return;
    open = true; mini.hidden = false; document.body.dataset.onroMini = 'open'; char.setAttribute('aria-expanded', 'true');
    if (!started) {                                                  // ONRO says hi by default
      started = true; addMsg('Hey there! 👋 I’m ONRO, ONROL’s friendly AI buddy 🤖 Ask me about courses, certification or batch timings, or pick one below.', 'bot'); showChips();
    }
    if (focus) input.focus({preventScroll: true});
  }
  function closeMini() {
    if (!open) return;
    open = false; mini.hidden = true; document.body.dataset.onroMini = 'closed'; char.setAttribute('aria-expanded', 'false');
    var back = document.querySelector('#onro-entrance[role="button"]') || char; if (back.focus) back.focus({preventScroll: true});
  }
  function toggle() { open ? closeMini() : openMini(true); }

  // ---- ONRO's 3D body on the home page reacts to the conversation (entrance.js listens) ----
  function react(userText, data) {
    function dispatch(reaction, speakMs) { window.dispatchEvent(new CustomEvent('onro:react', {detail: {mood: reaction && reaction.mood, gesture: reaction && reaction.gesture, speakMs: speakMs}})); }
    var speakMs = Math.min(4500, Math.max(1200, (data.answer || '').length * 28));
    (mods ? Promise.resolve(mods) : Promise.all([import('/onro-studio/conversation.js?v=' + V), import('/onro-studio/live-reaction.js?v=' + V)]).then(function (m) { mods = m; return m; }))
      .then(function (m) {
        var intent = m[0].detectIntent(userText, prevIntent); prevIntent = intent;
        var override = m[1].answerReaction(intent, data.reaction, data.topic);            // the visitor's own feeling leads; else the answer's meaning
        dispatch(override || m[0].reactionForIntent(intent), speakMs);
      }).catch(function () { dispatch(data.reaction, speakMs); });
  }

  // ---- chat ----
  function post(pathname, body, signal) {
    var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, 10000);
    if (signal) signal.addEventListener('abort', function () { ctl.abort(); });
    return fetch(API + pathname, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body), signal: ctl.signal})
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (data) { clearTimeout(t); return {res: res, data: data}; }); })
      .catch(function (e) { clearTimeout(t); throw e; });
  }
  function ask(text) {
    if (!text) return;
    if (inflight) inflight.abort();
    var mine = turn + 1; turn = mine; inflight = new AbortController();
    chips.textContent = ''; addMsg(text, 'me');
    var wait = addMsg('…', 'bot'); wait.classList.add('wait'); wait.setAttribute('aria-label', 'ONRO is typing');
    window.dispatchEvent(new CustomEvent('onro:react', {detail: {mood: 'Thinking', gesture: 'Look-around', speakMs: 0}}));
    post('/api/public/assistant', {message: text, stage: stage, lastTopic: lastTopic}, inflight.signal).then(function (r) {
      if (mine !== turn) { wait.remove(); return; }                  // a newer message superseded this one
      var d = r.data;
      if (!r.res.ok || typeof d.answer !== 'string' || !d.answer || d.answer.length > 2000) throw new Error('HTTP ' + r.res.status);
      stage = ['idle', 'menu', 'fee_offered'].indexOf(d.stage) >= 0 ? d.stage : 'idle'; lastTopic = typeof d.topic === 'string' && /^[a-z_]{1,30}$/.test(d.topic) ? d.topic : '';
      wait.classList.remove('wait'); wait.textContent = d.answer.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
      log.scrollTop = log.scrollHeight;
      react(text, d);
      if (d.ask !== 'contact') showChips(true);                      // quick replies + "Main menu" stay available after every answer
      if (d.ask === 'contact') { lead.hidden = false; leadName.focus({preventScroll: false}); }
    }).catch(function () {
      if (mine !== turn) { wait.remove(); return; }
      wait.classList.remove('wait'); wait.textContent = 'Sorry, I couldn’t reach ONROL’s assistant just now. ';
      var retry = el('button', {type: 'button', cls: 'onro-retry', text: 'Try again'});
      retry.addEventListener('click', function () { wait.remove(); ask(text); });
      wait.appendChild(retry);
      window.dispatchEvent(new CustomEvent('onro:react', {detail: {mood: 'Empathetic', gesture: 'Nod', speakMs: 0}}));
    });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); var t = input.value.trim(); if (!t) return; input.value = ''; ask(t); });

  lead.addEventListener('submit', function (e) {
    e.preventDefault(); if (leadBtn.disabled) return;
    leadErr.hidden = true; leadBtn.disabled = true; leadBtn.textContent = 'Sending…';
    leadId = leadId || ('onro-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8));  // reused on retry: no duplicate lead
    var reg = lastTopic === 'enroll';
    var qs = new URLSearchParams(location.search), body = {name: leadName.value.trim(), phone: leadPhone.value.trim(), source: 'ONRO web assistant', campaign: reg ? 'onro-registration' : 'onro-assistant',
      notes: (reg ? 'Registration request via the ONRO assistant on ' : 'Asked for a counsellor call via the ONRO assistant on ') + path, message: reg ? 'Registration request via ONRO web assistant.' : 'Callback request via ONRO web assistant.', tags: reg ? ['registration-request', 'onro-assistant'] : ['onro-assistant'], submissionId: leadId};
    ['ref', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) { var v = qs.get(k); if (v) body[k] = v.slice(0, 100); });
    post('/api/public/leads', body).then(function (r) {
      if (r.res.status === 400) { leadErr.textContent = typeof r.data.message === 'string' ? r.data.message : 'Please check your details.'; leadErr.hidden = false; return; }
      if (!r.res.ok || !(r.data.saved || r.data.ok)) throw new Error('HTTP ' + r.res.status);
      lead.hidden = true; leadId = null;
      addMsg('Thanks ' + (body.name.split(' ')[0] || 'there') + '! ✅ ' + (reg ? 'Your registration request is saved. ' : 'Your request is with our team. ') + 'Our counsellor will contact you soon.\n\nYou can also reach us:\n📧 Email: info@onrol.in\n📞 Mobile: +91 96093 12345', 'bot');
      window.dispatchEvent(new CustomEvent('onro:react', {detail: {mood: 'Grateful', gesture: 'Bow', speakMs: 1500}}));
    }).catch(function () { leadErr.textContent = 'We couldn’t send that. Please try again.'; leadErr.hidden = false; })
      .then(function () { leadBtn.disabled = false; leadBtn.textContent = 'Request a call'; });
  });

  // ---- wiring ----
  char.addEventListener('click', toggle); askBtn.addEventListener('click', toggle);
  closeBtn.addEventListener('click', closeMini);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) closeMini(); });
  window.addEventListener('onro:open', toggle);                       // the standing 3D ONRO (entrance.js) was clicked
  // The box never opens by itself: the visitor clicks "Ask me anything" (or ONRO).

  function mount() {
    document.body.appendChild(wrap);
    // The animated 3D ONRO appears on EVERY page (long walk-in on the home page, a quick pop-in elsewhere).
    // The flat portrait is only a fallback when the 3D body cannot run (no WebGL, import error).
    if (!isHome) wrap.classList.add('onro-wait');
    function fallback() { wrap.classList.remove('onro-wait'); }
    import('/onro-studio/entrance.js?v=' + V).then(function (module) {
      module.mountHomepageEntrance({inner: !isHome});
      if (!isHome) setTimeout(function () { if (!document.getElementById('onro-entrance')) fallback(); }, 9000);
    }).catch(function (error) { console.warn('ONRO 3D unavailable:', error); fallback(); });
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
