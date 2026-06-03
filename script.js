const messagesEl = document.getElementById('messages');
const inputEl    = document.getElementById('user-input');
const sendBtn    = document.getElementById('send-btn');
const welcome    = document.getElementById('welcome-screen');

// ── AUTO RESIZE TEXTAREA ──
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
});

// ── ENTER TO SEND ──
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ── CHIP CLICK ──
function sendChip(btn) {
  inputEl.value = btn.textContent;
  sendMessage();
}

// ── GET TIME ──
function getTime() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ── APPEND MESSAGE ──
function appendMessage(role, text) {
  if (welcome && welcome.isConnected) welcome.remove();

  const wrapper = document.createElement('div');
  wrapper.className = `msg-wrapper ${role}`;

  const avatar = document.createElement('div');
  avatar.className = `avatar ${role === 'ai' ? 'ai-avatar' : 'user-avatar'}`;
  avatar.textContent = role === 'ai' ? '🤖' : '👤';

  const inner = document.createElement('div');

  const bubble = document.createElement('div');
  bubble.className = `bubble ${role === 'ai' ? 'ai-bubble' : 'user-bubble'}`;
  bubble.textContent = text;

  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = getTime();

  inner.appendChild(bubble);
  inner.appendChild(time);
  wrapper.appendChild(avatar);
  wrapper.appendChild(inner);
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ── TYPING INDICATOR ──
function showTyping() {
  const wrapper = document.createElement('div');
  wrapper.className = 'msg-wrapper ai';
  wrapper.id = 'typing';

  const avatar = document.createElement('div');
  avatar.className = 'avatar ai-avatar';
  avatar.textContent = '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'bubble ai-bubble';
  bubble.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideTyping() {
  const t = document.getElementById('typing');
  if (t) t.remove();
}

// ── SEND MESSAGE ──
async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) {
    alert("diisi dulu baru enter");
    return;
  }

  inputEl.value = '';
  inputEl.style.height = 'auto';
  sendBtn.disabled = true;

  appendMessage('user', text);
  showTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    hideTyping();
    appendMessage('ai', data.reply);

  } catch (error) {
    hideTyping();
    appendMessage('ai', '⚠️ Gagal konek ke backend. Pastiin app.py udah jalan!');
  }

  sendBtn.disabled = false;
  inputEl.focus();
}