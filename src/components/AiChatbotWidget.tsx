'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  topic?: string;
  suggestedAction?: { label: string; route: string };
  isGemini?: boolean;
}

export default function AiChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [tempKey, setTempKey] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_1',
      sender: 'agent',
      text: '👋 Hello! I am NEXUS AI Agent — your 24/7 personal tutor powered by Google Gemini AI. Ask me anything in Physics, Math, Chemistry, Coding, Biology, or Exam Prep!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('NEXUS_GEMINI_KEY') || '';
    setGeminiKey(savedKey);
    setTempKey(savedKey);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const saveApiKey = () => {
    localStorage.setItem('NEXUS_GEMINI_KEY', tempKey.trim());
    setGeminiKey(tempKey.trim());
    setShowKeyModal(false);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiKey ? { 'x-gemini-api-key': geminiKey } : {}),
        },
        body: JSON.stringify({
          prompt: query,
          customApiKey: geminiKey,
          history: messages.slice(-4).map(m => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await response.json();
      const reply = data.reply || 'I could not generate an answer right now. Please try again.';

      // Determine suggested lab action based on query
      let action: { label: string; route: string } | undefined;
      const qLower = query.toLowerCase();
      if (qLower.match(/code|program|python|algorithm|search/)) {
        action = { label: '💻 Open Multi-Language Code Editor', route: '/code' };
      } else if (qLower.match(/physics|pendulum|slit|lens|gravity/)) {
        action = { label: '🧪 Open 3D Physics Lab', route: '/virtuallab' };
      } else if (qLower.match(/bhasha|language|tamil|hindi|translate/)) {
        action = { label: '🔊 Practice Bhasha 22 Languages', route: '/bhasha' };
      } else if (qLower.match(/video|watch|doppler/)) {
        action = { label: '📺 Open Video Lab Stream', route: '/videolab' };
      }

      const agentMsg: Message = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: action,
        isGemini: data.hasGeminiKey || data.source === 'gemini-1.5-flash',
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'agent',
          text: 'NEXUS Knowledge Engine: Connection error. Please verify your internet connection or check API keys.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 60, height: 60, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #0066ff, #00d4ff, #a855f7)',
          color: 'white', fontSize: 26, cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(0,102,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Open NEXUS AI Gemini Chatbot"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 96, right: 24, zIndex: 9999,
          width: 420, height: 580, borderRadius: 20,
          background: 'rgba(2,4,8,0.96)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          fontFamily: 'Outfit, sans-serif', animation: 'scale-in 0.25s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px', background: 'linear-gradient(135deg, rgba(0,102,255,0.25), rgba(168,85,247,0.25))',
            borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'Space Grotesk', display: 'flex', alignItems: 'center', gap: 6 }}>
                  NEXUS Gemini AI Tutor
                  <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: geminiKey ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: geminiKey ? '#10b981' : '#f59e0b', border: '1px solid currentColor' }}>
                    {geminiKey ? '✨ Gemini Active' : '⚡ Local AI'}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>24/7 Smart Educational Mentor</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setShowKeyModal(true)}
                title="Configure Google Gemini API Key"
                style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                🔑 Key
              </button>
              <Link href="/agent" onClick={() => setIsOpen(false)} style={{ fontSize: 11, color: '#00d4ff', textDecoration: 'none', fontWeight: 700, padding: '4px 8px', background: 'rgba(0,212,255,0.1)', borderRadius: 6 }}>
                Full ↗
              </Link>
            </div>
          </div>

          {/* Key Modal */}
          {showKeyModal && (
            <div style={{
              padding: 16, background: 'rgba(15,23,42,0.98)', borderBottom: '1px solid rgba(0,212,255,0.3)',
              display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12,
            }}>
              <div style={{ fontWeight: 700, color: '#00d4ff', display: 'flex', justifyContent: 'space-between' }}>
                <span>🔑 Enter Google Gemini API Key</span>
                <button onClick={() => setShowKeyModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: 11 }}>
                Get your free API key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: '#00d4ff' }}>Google AI Studio</a>. Saved securely in your local browser storage.
              </p>
              <input
                type="password"
                value={tempKey}
                onChange={e => setTempKey(e.target.value)}
                placeholder="AIzaSy..."
                style={{
                  padding: '8px 10px', borderRadius: 8, background: '#020408',
                  border: '1px solid rgba(0,212,255,0.3)', color: 'white', fontSize: 12, outline: 'none', fontFamily: 'JetBrains Mono',
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => { setTempKey(''); localStorage.removeItem('NEXUS_GEMINI_KEY'); setGeminiKey(''); }} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.2)', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 11 }}>
                  Clear
                </button>
                <button onClick={saveApiKey} style={{ padding: '6px 14px', borderRadius: 6, background: 'linear-gradient(135deg, #0066ff, #00d4ff)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 11 }}>
                  Save & Apply
                </button>
              </div>
            </div>
          )}

          {/* Messages Scroll View */}
          <div style={{ flex: 1, padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%', padding: '10px 14px', borderRadius: 14,
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #0066ff, #00d4ff)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${msg.sender === 'user' ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                  color: 'white', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                }}
              >
                <div>{msg.text}</div>
                {msg.suggestedAction && (
                  <Link
                    href={msg.suggestedAction.route}
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'inline-block', marginTop: 8, padding: '5px 10px', borderRadius: 6,
                      background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)',
                      color: '#00d4ff', fontSize: 11, fontWeight: 700, textDecoration: 'none',
                    }}
                  >
                    {msg.suggestedAction.label} →
                  </Link>
                )}
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 4, textAlign: 'right' }}>
                  {msg.isGemini && <span style={{ color: '#10b981', marginRight: 6 }}>✨ Gemini AI</span>}
                  {msg.timestamp}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', padding: '8px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                🤖 Gemini AI is generating response...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.3)', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {['Explain Newton\'s Laws', 'How does Doppler Effect work?', 'Python Binary Search code', 'What is DNA Replication?', 'Explain CPU Scheduling'].map(chip => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                style={{
                  padding: '4px 9px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.75)',
                  fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Outfit',
                }}
              >
                ⚡ {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div style={{ padding: 12, background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask Gemini AI anything in Science, Math, Code..."
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 10,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', fontSize: 13, outline: 'none', fontFamily: 'Outfit',
              }}
            />
            <button
              onClick={() => handleSend()}
              style={{
                padding: '10px 14px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
                color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 13,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
