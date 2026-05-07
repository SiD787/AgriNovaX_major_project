/**
 * Voice Assistant Widget - Conversational farming assistant
 * - Listens to voice input (Web Speech Recognition)
 * - Sends to backend chat engine
 * - Speaks response naturally (Web Speech Synthesis)
 * - Also supports text input
 */
import { chatWithAssistant } from '../utils/api.js';
import { getLanguage } from '../utils/i18n.js';
import { state } from '../utils/state.js';

const LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  bn: 'bn-IN',
};

const LANG_NAMES = {
  en: 'English', hi: 'Hindi', mr: 'Marathi',
  ta: 'Tamil', te: 'Telugu', kn: 'Kannada', bn: 'Bengali',
};

let recognition = null;
let isListening = false;
let isSpeaking = false;
let chatHistory = [];
let autoListen = false;
let synthesisUnlocked = false;

function unlockSynthesis() {
  if (synthesisUnlocked || !('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance('');
  utterance.volume = 0;
  speechSynthesis.speak(utterance);
  synthesisUnlocked = true;
}

/**
 * Initialize and inject the voice assistant widget into the page
 */
export function initVoiceAssistant() {
  // Remove existing widget if any
  const existing = document.getElementById('va-widget');
  if (existing) existing.remove();

  const widget = document.createElement('div');
  widget.id = 'va-widget';
  widget.innerHTML = getWidgetHTML();
  document.body.appendChild(widget);

  // Add CSS if not already added
  if (!document.getElementById('va-styles')) {
    const style = document.createElement('style');
    style.id = 'va-styles';
    style.textContent = getWidgetCSS();
    document.head.appendChild(style);
  }

  // Bind events
  bindEvents();

  // Send greeting on first open
  chatHistory = [];
}

function getWidgetHTML() {
  const lang = getLanguage();
  const langName = LANG_NAMES[lang] || 'English';
  
  return `
    <!-- Floating Button -->
    <button id="va-fab" class="va-fab" aria-label="Voice Assistant">
      <span class="va-fab__icon material-symbols-outlined">mic</span>
      <span class="va-fab__pulse"></span>
    </button>

    <!-- Chat Panel -->
    <div id="va-panel" class="va-panel" style="display:none">
      <div class="va-panel__header">
        <div class="va-panel__header-left">
          <div class="va-panel__avatar">
            <span class="material-symbols-outlined">smart_toy</span>
          </div>
          <div>
            <div class="va-panel__title">AgriNovaX Assistant</div>
            <div class="va-panel__status" id="va-status">Ready to help</div>
          </div>
        </div>
        <div class="va-panel__header-right">
          <select id="va-lang" class="va-lang-select" title="Language">
            <option value="en" ${lang==='en'?'selected':''}>English</option>
            <option value="hi" ${lang==='hi'?'selected':''}>हिन्दी</option>
            <option value="mr" ${lang==='mr'?'selected':''}>मराठी</option>
          </select>
          <button id="va-close" class="va-panel__close" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div class="va-panel__messages" id="va-messages">
        <div class="va-welcome">
          <span class="material-symbols-outlined" style="font-size:48px;color:var(--primary);opacity:0.5">agriculture</span>
          <p>Tap the mic button and ask me anything about farming!</p>
        </div>
      </div>

      <div id="va-suggestions" class="va-suggestions"></div>

      <div class="va-panel__input">
        <button id="va-mic-btn" class="va-mic-btn" aria-label="Speak">
          <span class="material-symbols-outlined" id="va-mic-icon">mic</span>
        </button>
        <input type="text" id="va-text-input" class="va-text-input" placeholder="Type your question..." />
        <button id="va-send-btn" class="va-send-btn" aria-label="Send">
          <span class="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  `;
}

function bindEvents() {
  const fab = document.getElementById('va-fab');
  const panel = document.getElementById('va-panel');
  const closeBtn = document.getElementById('va-close');
  const micBtn = document.getElementById('va-mic-btn');
  const sendBtn = document.getElementById('va-send-btn');
  const textInput = document.getElementById('va-text-input');

  fab.addEventListener('click', () => {
    unlockSynthesis();
    panel.style.display = 'flex';
    fab.style.display = 'none';
    panel.classList.add('va-panel--open');
    
    // Send greeting if first time
    if (chatHistory.length === 0) {
      sendMessage('hello', true);
    }
  });

  closeBtn.addEventListener('click', () => {
    autoListen = false;
    panel.classList.remove('va-panel--open');
    setTimeout(() => {
      panel.style.display = 'none';
      fab.style.display = 'flex';
    }, 200);
    stopListening();
    stopSpeaking();
  });

  micBtn.addEventListener('click', () => {
    unlockSynthesis();
    if (isListening || isSpeaking) {
      // User explicitly wants to stop the loop
      autoListen = false;
      stopListening();
      stopSpeaking();
    } else {
      // User starts the auto-conversation loop
      autoListen = true;
      toggleListening();
    }
  });

  sendBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text) {
      autoListen = false; // Manual type breaks auto-listen
      sendMessage(text);
      textInput.value = '';
    }
  });

  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = textInput.value.trim();
      if (text) {
        autoListen = false; // Manual type breaks auto-listen
        sendMessage(text);
        textInput.value = '';
      }
    }
  });

  const langSelect = document.getElementById('va-lang');
  if (langSelect) {
    langSelect.addEventListener('change', () => {
      stopSpeaking();
      const currentText = langSelect.options[langSelect.selectedIndex].text;
      addMessage('assistant', `I will now speak in ${currentText}. How can I help you?`);
    });
  }
}

function toggleListening() {
  if (isListening) {
    stopListening();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    addMessage('assistant', 'Speech recognition is not supported in this browser. Please type your question instead.');
    return;
  }

  const lang = document.getElementById('va-lang')?.value || getLanguage();
  
  recognition = new SpeechRecognition();
  recognition.lang = LANG_MAP[lang] || 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;
    updateMicState();
    setStatus('Listening... Speak now');
  };

  recognition.onresult = (event) => {
    let transcript = '';
    let isFinal = false;
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
      if (event.results[i].isFinal) isFinal = true;
    }

    // Show interim results
    updateInterim(transcript);

    if (isFinal && transcript.trim()) {
      clearInterim();
      sendMessage(transcript.trim());
    }
  };

  recognition.onerror = (event) => {
    isListening = false;
    updateMicState();
    if (event.error === 'no-speech') {
      setStatus('No speech detected. Try again.');
      if (autoListen) {
        // Retry listening if in auto loop
        setTimeout(toggleListening, 1000);
      }
    } else if (event.error === 'not-allowed') {
      autoListen = false;
      setStatus('Microphone access denied. Please allow microphone access.');
      alert('Microphone access is blocked! Please click the lock/mic icon in the browser URL bar, choose "Allow" for Microphone, and refresh the page.');
    } else {
      autoListen = false;
      setStatus('Ready to help');
    }
  };

  recognition.onend = () => {
    // If it stopped naturally and we're not speaking/thinking, and autoListen is on, we missed the speech, restart
    isListening = false;
    updateMicState();
    if (autoListen && !isSpeaking && !document.getElementById('va-typing')) {
       // It randomly stopped without a result? Keep listening
       setTimeout(() => { if(autoListen && !isSpeaking) toggleListening(); }, 500);
    } else if (!isSpeaking) {
       setStatus('Ready to help');
    }
  };

  try {
    recognition.start();
  } catch (err) {
    console.error("Speech recognition error:", err);
    isListening = false;
    updateMicState();
    autoListen = false;
    setStatus('Microphone error. Please type your question.');
  }
}

function stopListening() {
  if (recognition) {
    recognition.abort();
    recognition = null;
  }
  isListening = false;
  updateMicState();
}

function updateMicState() {
  const btn = document.getElementById('va-mic-btn');
  const icon = document.getElementById('va-mic-icon');
  if (!btn || !icon) return;

  if (isListening) {
    btn.classList.add('va-mic-btn--active');
    icon.textContent = 'hearing';
  } else {
    btn.classList.remove('va-mic-btn--active');
    icon.textContent = 'mic';
  }
}

function updateInterim(text) {
  let interim = document.getElementById('va-interim');
  if (!interim) {
    interim = document.createElement('div');
    interim.id = 'va-interim';
    interim.className = 'va-message va-message--user va-message--interim';
    document.getElementById('va-messages')?.appendChild(interim);
  }
  interim.textContent = text;
  scrollToBottom();
}

function clearInterim() {
  const interim = document.getElementById('va-interim');
  if (interim) interim.remove();
}

async function sendMessage(text, isGreeting = false) {
  stopListening();
  stopSpeaking();

  // Add user message (skip for greeting)
  if (!isGreeting) {
    addMessage('user', text);
  }

  setStatus('Thinking...');


  // Show typing indicator
  const typingId = addTypingIndicator();

  try {
    const lang = document.getElementById('va-lang')?.value || getLanguage();
    
    // Build context from current analysis results so the AI knows what the user entered
    const results = state.get('results');
    let chatContext = null;
    if (results) {
      chatContext = {
        recommendation: results.recommendation || null,
        soil_health: results.soil_health || null,
        input_summary: results.input_summary || null,
        economics: results.economics ? { summary: results.economics.summary } : null,
        alternatives: (results.alternatives || []).map(a => ({ crop: a.crop, confidence: a.confidence })),
        soil_improvement: results.soil_improvement ? { soil_tips: (results.soil_improvement.soil_tips || []).slice(0, 3) } : null,
      };
    }
    const result = await chatWithAssistant(text, lang, chatContext);
    
    // Remove typing indicator
    removeTypingIndicator(typingId);

    // Add assistant response
    const response = result.response || "I'm sorry, I couldn't understand. Please try again.";
    addMessage('assistant', response);
    chatHistory.push({ role: 'user', text }, { role: 'assistant', text: response });

    // Show suggestions
    if (result.suggestions && result.suggestions.length > 0) {
      showSuggestions(result.suggestions);
    }

    // Speak the response
    speakResponse(response, lang);

  } catch (err) {
    removeTypingIndicator(typingId);
    autoListen = false;
    addMessage('assistant', 'I am having trouble connecting. Please make sure the backend server is running.');
    setStatus('Connection error');
  }
}

function addMessage(role, text) {
  const messages = document.getElementById('va-messages');
  if (!messages) return;

  // Remove welcome screen
  const welcome = messages.querySelector('.va-welcome');
  if (welcome) welcome.remove();

  const msg = document.createElement('div');
  msg.className = `va-message va-message--${role}`;
  
  if (role === 'assistant') {
    msg.innerHTML = `
      <div class="va-message__avatar">
        <span class="material-symbols-outlined">smart_toy</span>
      </div>
      <div class="va-message__bubble">
        <div class="va-message__text">${formatText(text)}</div>
        <button class="va-message__speak-btn" title="Listen" onclick="window.__vaSpeak(this, '${escapeForAttr(text)}')">
          <span class="material-symbols-outlined" style="font-size:16px">volume_up</span>
        </button>
      </div>
    `;
  } else {
    msg.innerHTML = `<div class="va-message__bubble"><div class="va-message__text">${formatText(text)}</div></div>`;
  }

  messages.appendChild(msg);
  scrollToBottom();
}

// Global function for per-message speak buttons
window.__vaSpeak = (btn, text) => {
  const decoded = text.replace(/\\n/g, '\n').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const lang = document.getElementById('va-lang')?.value || getLanguage();
  speakResponse(decoded, lang);
};

function formatText(text) {
  return text
    .replace(/\n/g, '<br>')
    .replace(/•/g, '<span style="color:var(--primary);font-weight:bold">•</span>')
    .replace(/(\d+\.)/g, '<strong>$1</strong>');
}

function escapeForAttr(text) {
  return text.replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/\n/g, '\\n');
}

function addTypingIndicator() {
  const messages = document.getElementById('va-messages');
  if (!messages) return null;

  const typing = document.createElement('div');
  typing.className = 'va-message va-message--assistant va-typing';
  typing.id = 'va-typing';
  typing.innerHTML = `
    <div class="va-message__avatar"><span class="material-symbols-outlined">smart_toy</span></div>
    <div class="va-message__bubble">
      <div class="va-typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  messages.appendChild(typing);
  scrollToBottom();
  return typing.id;
}

function removeTypingIndicator(id) {
  if (id) document.getElementById(id)?.remove();
}

function showSuggestions(suggestions) {
  const container = document.getElementById('va-suggestions');
  if (!container) return;

  container.innerHTML = suggestions.map(s => `
    <button class="va-suggestion" onclick="window.__vaSuggest('${escapeForAttr(s)}')">${s}</button>
  `).join('');
}

window.__vaSuggest = (text) => {
  const decoded = text.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  sendMessage(decoded);
  const container = document.getElementById('va-suggestions');
  if (container) container.innerHTML = '';
};

function cleanForSpeech(text) {
  return text.replace(/[*#_]/g, '') // remove markdown artifacts
             .replace(/https?:\/\/\S+/g, 'link'); // remove raw urls
}

function speakResponse(text, lang) {
  if (!('speechSynthesis' in window)) return;

  stopSpeaking();
  setStatus('Speaking...');

  // Clean the text and split into sentences for natural pacing
  const cleanedText = cleanForSpeech(text);
  const sentences = cleanedText.match(/[^।.!?\n]+[।.!?\n]*/g) || [cleanedText];
  let index = 0;

  function speakNext() {
    if (index >= sentences.length) {
      isSpeaking = false;
      setStatus('Ready to help');
      // If we are in continuous ChatGPT mode, resume listening automatically!
      if (autoListen) {
        setTimeout(() => {
          if (autoListen) toggleListening();
        }, 500);
      }
      return;
    }

    const chunk = sentences[index].trim();
    if (!chunk || chunk.length < 2) {
      index++;
      speakNext();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    
    // Get best voice for language
    const voices = speechSynthesis.getVoices();
    const targetLang = LANG_MAP[lang] || 'en-IN';
    
    // Prefer female voices for a warmer feel
    let voice = voices.find(v => v.lang === targetLang && v.name.toLowerCase().includes('female'));
    if (!voice) voice = voices.find(v => v.lang === targetLang);
    if (!voice) voice = voices.find(v => v.lang.startsWith(lang));
    if (!voice) voice = voices.find(v => v.lang === 'en-IN');
    if (!voice) voice = voices.find(v => v.lang.startsWith('en'));
    
    if (voice) utterance.voice = voice;
    utterance.lang = targetLang;
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      isSpeaking = true;
    };

    utterance.onend = () => {
      index++;
      speakNext();
    };

    utterance.onerror = () => {
      isSpeaking = false;
      setStatus('Ready to help');
    };

    speechSynthesis.speak(utterance);
  }

  // Ensure voices are loaded
  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.addEventListener('voiceschanged', () => speakNext(), { once: true });
    speechSynthesis.getVoices();
    setTimeout(speakNext, 300);
  } else {
    speakNext();
  }
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  isSpeaking = false;
}

function setStatus(text) {
  const el = document.getElementById('va-status');
  if (el) el.textContent = text;
}

function scrollToBottom() {
  const messages = document.getElementById('va-messages');
  if (messages) {
    requestAnimationFrame(() => {
      messages.scrollTop = messages.scrollHeight;
    });
  }
}

function getWidgetCSS() {
  return `
    /* Floating Action Button */
    .va-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3D6631, #4a7c3a);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(61,102,49,0.4);
      z-index: 9998;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .va-fab:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 28px rgba(61,102,49,0.5);
    }
    .va-fab__icon { font-size: 28px; }
    .va-fab__pulse {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid #3D6631;
      animation: va-pulse 2s infinite;
    }
    @keyframes va-pulse {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.5); }
    }

    /* Chat Panel */
    .va-panel {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 400px;
      max-width: calc(100vw - 32px);
      height: 600px;
      max-height: calc(100vh - 48px);
      background: white;
      border-radius: 20px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
      z-index: 9999;
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: va-slide-up 0.3s ease-out;
    }
    .va-panel--open { display: flex; }
    @keyframes va-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .va-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: linear-gradient(135deg, #3D6631, #4a7c3a);
      color: white;
    }
    .va-panel__header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .va-panel__header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .va-panel__avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .va-panel__title {
      font-size: 15px;
      font-weight: 700;
    }
    .va-panel__status {
      font-size: 11px;
      opacity: 0.8;
    }
    .va-lang-select {
      background: rgba(255,255,255,0.15);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      outline: none;
    }
    .va-lang-select option { color: #333; background: white; }
    .va-panel__close {
      background: rgba(255,255,255,0.15);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .va-panel__close:hover { background: rgba(255,255,255,0.3); }

    /* Messages */
    .va-panel__messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8f7f4;
    }
    .va-welcome {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      color: var(--on-surface-muted, #888);
      font-size: 14px;
      gap: 12px;
    }

    /* Message Bubbles */
    .va-message {
      display: flex;
      gap: 8px;
      max-width: 90%;
      animation: va-msg-in 0.3s ease-out;
    }
    @keyframes va-msg-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .va-message--user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    .va-message--assistant { align-self: flex-start; }
    .va-message__avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3D6631, #4a7c3a);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .va-message__avatar .material-symbols-outlined { font-size: 18px; }
    .va-message__bubble {
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.6;
      position: relative;
    }
    .va-message--user .va-message__bubble {
      background: #3D6631;
      color: white;
      border-bottom-right-radius: 4px;
    }
    .va-message--assistant .va-message__bubble {
      background: white;
      color: #333;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .va-message--interim .va-message__bubble {
      opacity: 0.6;
      font-style: italic;
    }
    .va-message--interim { background: transparent !important; }
    .va-message__speak-btn {
      position: absolute;
      bottom: -8px;
      right: -8px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #3D6631;
      color: white;
      border: 2px solid white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .va-message__bubble:hover .va-message__speak-btn { opacity: 1; }

    /* Typing Indicator */
    .va-typing-dots {
      display: flex;
      gap: 4px;
      padding: 4px 0;
    }
    .va-typing-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #3D6631;
      animation: va-dot-bounce 1.4s infinite ease-in-out;
    }
    .va-typing-dots span:nth-child(2) { animation-delay: 0.16s; }
    .va-typing-dots span:nth-child(3) { animation-delay: 0.32s; }
    @keyframes va-dot-bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Suggestions */
    .va-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px 16px;
      background: #f8f7f4;
    }
    .va-suggestion {
      padding: 6px 12px;
      border: 1px solid #3D6631;
      border-radius: 20px;
      background: white;
      color: #3D6631;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .va-suggestion:hover {
      background: #3D6631;
      color: white;
    }

    /* Input Area */
    .va-panel__input {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #eee;
      background: white;
    }
    .va-mic-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid #3D6631;
      background: white;
      color: #3D6631;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .va-mic-btn:hover {
      background: #f0f7ed;
    }
    .va-mic-btn--active {
      background: #e53935 !important;
      border-color: #e53935 !important;
      color: white !important;
      animation: va-mic-pulse 1s infinite;
    }
    @keyframes va-mic-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(229,57,53,0.4); }
      50% { box-shadow: 0 0 0 10px rgba(229,57,53,0); }
    }
    .va-text-input {
      flex: 1;
      border: 1px solid #e0e0e0;
      border-radius: 24px;
      padding: 10px 16px;
      font-size: 13px;
      outline: none;
      font-family: 'Inter', sans-serif;
      transition: border-color 0.2s;
    }
    .va-text-input:focus { border-color: #3D6631; }
    .va-send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #3D6631;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .va-send-btn:hover { background: #2d4e24; }
    .va-send-btn .material-symbols-outlined { font-size: 20px; }

    @media (max-width: 480px) {
      .va-panel {
        bottom: 0;
        right: 0;
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
      }
    }
  `;
}
