'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  codeSnippet?: string;
  suggestedAction?: { label: string; route: string };
}

const AGENT_KNOWLEDGE: { keywords: string[]; response: string; code?: string; action?: { label: string; route: string } }[] = [
  {
    keywords: ['newton', 'motion', 'law', 'inertia', 'force', 'acceleration', 'action reaction'],
    response: 'Sir Isaac Newton formulated three foundational laws of motion:\n\n1. First Law (Inertia): An object remains at rest or in uniform straight motion unless acted upon by a net external force.\n2. Second Law (F = ma): Net force equals mass times acceleration (F = m × a). Vector equation: F = dp/dt.\n3. Third Law (Action-Reaction): For every action force, there is an equal magnitude and opposite direction reaction force!',
    action: { label: '🧪 Test Mechanics in 3D Virtual Lab', route: '/virtuallab' },
  },
  {
    keywords: ['doppler', 'sound', 'frequency', 'pitch', 'siren', 'redshift', 'blueshift'],
    response: 'The Doppler Effect describes frequency distortion caused by relative velocity between wave source and observer:\n\n• Approaching Source: Waves compress → Apparent frequency f\' = f × [v / (v − vs)] (higher pitch).\n• Receding Source: Waves stretch → Apparent frequency f\' = f × [v / (v + vs)] (lower pitch).\n• Light Waves: Approaching = Blueshift, Receding = Redshift (Hubble expansion).',
    action: { label: '📺 Open Doppler Video Lab', route: '/videolab?topic=phy_101' },
  },
  {
    keywords: ['quadratic', 'roots', 'equation', 'discriminant', 'parabola', 'formula', 'vieta'],
    response: 'Quadratic Equations ax² + bx + c = 0:\n\n• Quadratic Formula: x = [−b ± √(b² − 4ac)] / 2a\n• Discriminant Analysis (D = b² − 4ac):\n  - D > 0: Two distinct real roots\n  - D = 0: One repeated real root\n  - D < 0: Two complex conjugate roots\n• Parabola Vertex: x = −b / 2a, y = −D / 4a.',
    action: { label: '📈 Launch 3D Parabola Lab', route: '/virtuallab' },
  },
  {
    keywords: ['dna', 'rna', 'double helix', 'replication', 'base pair', 'watson', 'crick', 'adenine', 'thymine'],
    response: 'DNA Double Helix & Replication:\n\n• Complementary Base Pairs: Adenine (A) = Thymine (T) [2 H-bonds] | Guanine (G) ≡ Cytosine (C) [3 H-bonds]\n• Replication Engine: Semi-conservative process using DNA Helicase (unwinds), DNA Polymerase (synthesizes 5\'→3\'), and DNA Ligase (seals Okazaki fragments).',
    action: { label: '🧬 Explore 3D DNA Replication Lab', route: '/virtuallab' },
  },
  {
    keywords: ['cpu', 'scheduling', 'round robin', 'fcfs', 'sjf', 'gantt', 'turnaround'],
    response: 'Operating Systems CPU Scheduling:\n\n• FCFS: Non-preemptive queue execution.\n• SJF: Minimizes average waiting time.\n• Round Robin: Allocates fixed Time Quantum to circular process queue.\n• Turnaround Time = Completion Time − Arrival Time.',
    action: { label: '🖥️ Try CPU Scheduling Simulator', route: '/virtuallab' },
  },
  {
    keywords: ['tcp', 'handshake', 'syn', 'ack', 'port', 'ip', 'network', 'udp'],
    response: 'TCP 3-Way Handshake Connection Protocol:\n\n1. Client → Server: SYN (Sequence = x)\n2. Server → Client: SYN-ACK (Seq = y, Ack = x + 1)\n3. Client → Server: ACK (Ack = y + 1)\n\nEnsures reliable, ordered byte-stream delivery across IP networks.',
    action: { label: '🌐 Open TCP Handshake Lab', route: '/virtuallab' },
  },
  {
    keywords: ['python', 'binary search', 'two sum', 'leetcode', 'algorithm', 'code', 'dsa'],
    response: 'Binary Search Algorithm (O(log N) Time, O(1) Space):',
    code: `def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1`,
    action: { label: '💻 Open Multi-Language Code Editor', route: '/code' },
  },
  {
    keywords: ['upsc', 'polity', 'article', 'fundamental rights', 'constitution', 'writ', 'habeas corpus'],
    response: 'UPSC Indian Polity — Fundamental Rights (Part III, Articles 12–35):\n\n• Article 14: Equality before law\n• Article 19: Freedom of speech & expression\n• Article 21: Right to Life & Personal Liberty\n• Article 32: Constitutional Remedies (Writs: Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo-Warranto).',
    action: { label: '🎯 Take UPSC Polity Quiz', route: '/videolab?topic=upsc_101' },
  },
  {
    keywords: ['jee', 'rotational', 'torque', 'inertia', 'momentum', 'angular'],
    response: 'JEE Physics — Rotational Motion & Torque:\n\n• Torque τ = r × F (vector cross product)\n• Moment of Inertia I = ∑mᵢrᵢ²\n• Angular Momentum L = Iω (conserved when net external torque τ = 0)\n• Rotational Kinetic Energy K = ½Iω².',
    action: { label: '🎯 Take JEE Physics Quiz', route: '/videolab?topic=jee_101' },
  },
  {
    keywords: ['tamil', 'hindi', 'bhasha', 'language', 'translate', 'harini', 'speech'],
    response: 'Bhasha AI Vernacular Learning Tutor supports all 22 Scheduled Indian Languages with real-time text-to-speech audio, English-to-Indic translation, and cross-language peer chat bridge!',
    action: { label: '🔊 Open Bhasha 22 Languages', route: '/bhasha' },
  },
];

export default function AgentPage() {
  const [geminiKey, setGeminiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'agent',
      text: '🤖 Welcome to NEXUS AI Agent Master Console! I am your autonomous AI pair tutor powered by Google Gemini AI. Ask me about Newton\'s laws, Doppler effect, DNA, Quadratic equations, CPU scheduling, TCP, Python coding, JEE, NEET, or UPSC!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('NEXUS_GEMINI_KEY') || '';
    setGeminiKey(saved);
    setTempKey(saved);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const saveApiKey = () => {
    localStorage.setItem('NEXUS_GEMINI_KEY', tempKey.trim());
    setGeminiKey(tempKey.trim());
    setShowKeyModal(false);
  };

  const handleSend = async (customPrompt?: string) => {
    const text = customPrompt || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsThinking(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiKey ? { 'x-gemini-api-key': geminiKey } : {}),
        },
        body: JSON.stringify({
          prompt: text,
          customApiKey: geminiKey,
          history: messages.slice(-4).map(m => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'No response generated.';

      let action: { label: string; route: string } | undefined;
      const q = text.toLowerCase();
      if (q.includes('code') || q.includes('python') || q.includes('search')) {
        action = { label: '💻 Open Multi-Language Code Editor', route: '/code' };
      } else if (q.includes('physics') || q.includes('newton') || q.includes('doppler')) {
        action = { label: '🧪 Test in 3D Virtual Lab', route: '/virtuallab' };
      } else if (q.includes('bhasha') || q.includes('tamil') || q.includes('translate')) {
        action = { label: '🔊 Open Bhasha 22 Languages', route: '/bhasha' };
      }

      const agentMsg: ChatMessage = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: action,
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'agent',
          text: 'Connection error while communicating with AI service.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div style={{ background: 'var(--nexus-void, #020408)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,212,255,0.2)', background: 'rgba(2,4,8,0.95)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#00d4ff', margin: 0 }}>
          🤖 NEXUS Autonomous AI Agent Master Console
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setShowKeyModal(true)}
            style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}
          >
            🔑 {geminiKey ? 'Gemini Key Configured' : 'Configure Gemini Key'}
          </button>
          <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>
            🟢 Gemini 1.5 Flash Active
          </div>
        </div>
      </div>

      {/* Key Modal */}
      {showKeyModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            width: 440, padding: 24, borderRadius: 16, background: '#0a0f1d',
            border: '1px solid rgba(0,212,255,0.3)', display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#00d4ff', display: 'flex', justifyContent: 'space-between' }}>
              <span>🔑 Configure Google Gemini API Key</span>
              <button onClick={() => setShowKeyModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: 12, lineHeight: 1.5 }}>
              Enter your Google AI Studio Gemini API Key. It is saved in your local browser storage and used for live AI multi-turn discussions and problem solving.
            </p>
            <input
              type="password"
              value={tempKey}
              onChange={e => setTempKey(e.target.value)}
              placeholder="AIzaSy..."
              style={{
                padding: '10px 12px', borderRadius: 8, background: '#020408',
                border: '1px solid rgba(0,212,255,0.3)', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'JetBrains Mono',
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setTempKey(''); localStorage.removeItem('NEXUS_GEMINI_KEY'); setGeminiKey(''); }} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.2)', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>
                Clear Key
              </button>
              <button onClick={saveApiKey} style={{ padding: '8px 18px', borderRadius: 8, background: 'linear-gradient(135deg, #0066ff, #00d4ff)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                Save & Apply Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Console Layout */}
      <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Messages Container */}
        <div style={{ flex: 1, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', minHeight: 450 }}>
          {messages.map(m => (
            <div
              key={m.id}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%', padding: '14px 18px', borderRadius: 16,
                background: m.sender === 'user' ? 'linear-gradient(135deg, #0066ff, #00d4ff)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${m.sender === 'user' ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-line',
              }}
            >
              <div>{m.text}</div>
              {m.codeSnippet && (
                <pre style={{ margin: '10px 0 0', padding: 12, borderRadius: 8, background: '#020408', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, overflowX: 'auto' }}>
                  {m.codeSnippet}
                </pre>
              )}
              {m.suggestedAction && (
                <Link href={m.suggestedAction.route} style={{ display: 'inline-block', marginTop: 10, padding: '6px 12px', borderRadius: 8, background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                  {m.suggestedAction.label} →
                </Link>
              )}
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 6, textAlign: 'right' }}>{m.timestamp}</div>
            </div>
          ))}

          {isThinking && (
            <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', color: '#00d4ff', fontSize: 13 }}>
              🤖 NEXUS AI Agent is formulating response...
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Prompt Suggestions */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            'Explain Newton\'s Laws of Motion',
            'Explain Doppler Effect with ambulance sound analogy',
            'Write Python Binary Search solution with testcases',
            'What is DNA Double Helix base pairing?',
            'Explain CPU Round Robin scheduling',
            'What are UPSC Article 32 writs?',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid rgba(0,212,255,0.25)', background: 'rgba(0,212,255,0.05)', color: 'rgba(255,255,255,0.85)', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Outfit' }}
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Input Controls */}
        <div style={{ display: 'flex', gap: 10, padding: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Agent about Newton's laws, Doppler effect, DNA, Code, Math..."
            style={{ flex: 1, padding: '14px 18px', borderRadius: 12, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'Outfit' }}
          />
          <button
            onClick={() => handleSend()}
            style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #0066ff, #00d4ff)', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 14 }}
          >
            🚀 Ask Agent
          </button>
        </div>
      </div>
    </div>
  );
}
