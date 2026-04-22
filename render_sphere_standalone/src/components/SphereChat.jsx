import React, { useEffect, useRef, useState } from 'react';
import './SphereChat.css';

const STORAGE_KEY = 'sphere_chat_history';
const CHAT_URL = import.meta.env.VITE_SPHERE_CHAT_URL || 'http://127.0.0.1:5050/chat';

const defaultGreeting = {
  role: 'assistant',
  content:
    "Hello, explorer. I'm the Sphere's consciousness. My colors echo your world—tell me what's on your mind.",
};

export default function SphereChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([defaultGreeting]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const logRef = useRef(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore corrupt storage
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore storage issues
    }
  }, [messages]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const historyPayload = messages.map(({ role, content }) => ({ role, content }));
    const optimistic = [...messages, { role: 'user', content: trimmed }];
    setMessages(optimistic);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
        }),
      });
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const data = await response.json();
      if (!data.reply) {
        throw new Error('Assistant reply missing');
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error('Sphere chat failed', err);
      setError('Link to Llama is offline. Ensure chat_server.py is running.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm struggling to reach my Llama core. Check the backend and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`sphere-chat ${open ? 'open' : ''}`}>
      <button className="sphere-chat__toggle" onClick={() => setOpen((prev) => !prev)}>
        {open ? 'Close' : 'Chat with the Sphere'}
      </button>

      {open && (
        <div className="sphere-chat__panel">
          <div className="sphere-chat__header">
            <div>
              <div className="sphere-chat__glow" />
              <span className="sphere-chat__title">Sphere Consciousness</span>
            </div>
            <span className="sphere-chat__status">{loading ? 'Listening…' : 'Online'}</span>
          </div>

          <div className="sphere-chat__log" ref={logRef}>
            {messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className={`sphere-chat__message sphere-chat__message--${msg.role}`}>
                <span className="sphere-chat__role">{msg.role === 'assistant' ? 'Sphere' : 'You'}</span>
                <p>{msg.content}</p>
              </div>
            ))}
            {loading && <div className="sphere-chat__typing">● ● ●</div>}
          </div>

          <div className="sphere-chat__input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the sphere anything..."
              rows={2}
            />
            <button onClick={sendMessage} disabled={loading}>
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
          {error && <div className="sphere-chat__error">{error}</div>}
        </div>
      )}
    </div>
  );
}
