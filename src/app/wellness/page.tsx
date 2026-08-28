'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WellnessPage() {
  const [messages, setMessages] = useState([
    { sender: 'AI Counselor', text: 'Namaste Arjun. I noticed your cognitive load was elevated during your 2-hour Physics session. How are you feeling right now?', time: '10:14 AM' },
  ]);
  const [input, setInput] = useState('');
  const [breathingModal, setBreathingModal] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (breathingModal) {
      timer = setInterval(() => {
        setBreathTimer(prev => {
          if (prev <= 1) {
            if (breathPhase === 'Inhale') { setBreathPhase('Hold'); return 7; }
            if (breathPhase === 'Hold') { setBreathPhase('Exhale'); return 8; }
            if (breathPhase === 'Exhale') { setBreathPhase('Inhale'); return 4; }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breathingModal, breathPhase]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'You', text: userMsg, time: '10:15 AM' }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'AI Counselor',
        text: 'I hear you. Exam stress is completely natural. Remember that taking a 10-minute walk or doing a 2-minute box breathing session consolidates memory by up to 28%. Shall we start a 2-minute relaxation break?',
        time: '10:15 AM'
      }]);
    }, 1000);
  };

  return (
    <div style={{ background: 'var(--nexus-void)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(52,211,153,0.2)', background: 'rgba(2,4,8,0.9)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#34d399' }}>
          🧘 Mental Health & Wellbeing Engine
        </h1>
        <span style={{ fontSize: 12, color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '4px 12px', borderRadius: 100 }}>
          💚 Stress Guard: Optimal
        </span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Proactive Wellbeing Monitor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#34d399' }}>
              📊 Burnout & Fatigue Guardian
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Cognitive Stress', val: 'Low (18%)', color: '#10b981' },
                { label: 'Study-Life Balance', val: '8.4 / 10', color: '#00d4ff' },
                { label: 'Screen Fatigue', val: 'Moderate', color: '#f59e0b' },
                { label: 'Recommended Break', val: 'In 24 mins', color: '#a855f7' },
              ].map(item => (
                <div key={item.label} style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: item.color, fontFamily: 'Space Grotesk' }}>{item.val}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: 16, borderRadius: 14, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>🧘 2-Min Brain Reset Exercise</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>Guided 4-7-8 breathing to calm focus before high-stakes problem solving.</div>
              <button
                onClick={() => setBreathingModal(true)}
                style={{ padding: '10px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                ▶ Begin Breathing Reset
              </button>
            </div>
          </div>
        </div>

        {/* Confidential AI Companion Chat */}
        <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', height: 480 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 14, color: '#00d4ff' }}>
            💬 Anonymous AI Study Companion
          </h2>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.sender === 'You' ? 'flex-end' : 'flex-start',
                maxWidth: '82%', padding: '10px 14px', borderRadius: 12,
                background: m.sender === 'You' ? 'rgba(0,102,255,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${m.sender === 'You' ? 'rgba(0,102,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
              }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{m.sender} · {m.time}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>{m.text}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Share your exam stress or doubts..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', fontSize: 13, fontFamily: 'Outfit', outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              style={{
                padding: '10px 18px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
                color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit'
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Breathing Reset Modal */}
      {breathingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,4,8,0.9)', backdropFilter: 'blur(15px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 180, height: 180, borderRadius: '50%', background: 'rgba(52,211,153,0.15)',
              border: '3px solid #34d399', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
              transform: `scale(${breathPhase === 'Inhale' ? 1.2 : breathPhase === 'Hold' ? 1.2 : 0.9})`,
              transition: 'transform 4s ease-in-out', boxShadow: '0 0 40px rgba(52,211,153,0.4)'
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399', fontFamily: 'Space Grotesk' }}>{breathPhase}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'white', fontFamily: 'Space Grotesk' }}>{breathTimer}s</div>
            </div>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 20, color: 'white', marginBottom: 8 }}>4-7-8 Breathing Reset Active</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>Follow the circle animation to reset your nervous system.</p>
            <button
              onClick={() => setBreathingModal(false)}
              style={{ padding: '10px 24px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit' }}
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
