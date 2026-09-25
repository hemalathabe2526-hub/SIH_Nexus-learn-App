'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Mic, Camera, Sparkles, ArrowLeft, Play, Square, CheckCircle2, HelpCircle, Send, Check } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  time: string;
  type: 'text' | 'voice_note' | 'image' | 'quiz_card';
  text?: string;
  audioDuration?: number;
  audioTranscript?: string;
  svgDiagram?: string;
  quizOptions?: { label: string; correct: boolean }[];
}

export default function WhatsAppMicroLMSPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      time: '10:45 AM',
      type: 'text',
      text: 'Welcome to Nexus Learn WhatsApp Study Bot! You can send voice notes, math photos, or take quick concept quizzes.',
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string, type: 'text' | 'voice_note' | 'image' = 'text') => {
    if (!text.trim() && type === 'text') return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      text: type === 'voice_note' ? 'Voice Message (0:14): "Explain torque and door hinge analogy"' : type === 'image' ? '[Handwritten Note: τ = r × F × sin(θ)]' : text,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMsg('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/whatsapp-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: '+91-98765-43210',
          messageType: type,
          text: text,
        })
      });
      const data = await res.json();

      setIsTyping(false);

      const botReply: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: data.svgDiagram ? 'quiz_card' : 'text',
        text: data.replyMessage,
        audioDuration: data.voiceNoteDurationSec,
        audioTranscript: data.audioTranscript,
        svgDiagram: data.svgDiagram,
        quizOptions: [
          { label: 'A: Zero Torque (sin 0° = 0)', correct: true },
          { label: 'B: Maximum Torque', correct: false }
        ]
      };

      setMessages(prev => [...prev, botReply]);
    } catch {
      setIsTyping(false);
    }
  };

  const playVoiceNote = (transcript?: string) => {
    if (typeof window === 'undefined') return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      const textToSpeak = transcript || 'Torque is the rotational counterpart of linear force, calculated as r cross F sin theta.';
      const u = new SpeechSynthesisUtterance(textToSpeak);
      u.onend = () => setIsPlayingAudio(false);
      u.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(u);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div style={{ background: '#0b141a', minHeight: '100vh', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', color: '#e9edef', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner */}
      <div style={{
        padding: '12px 24px', background: '#202c33', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #313d45', zIndex: 100, flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/dashboard" style={{ color: '#00a884', textDecoration: 'none', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
          <span style={{ color: '#54656f' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111b21' }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#e9edef', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Nexus Learn WhatsApp Study Bot</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00a884', display: 'inline-block' }}></span>
              </div>
              <div style={{ fontSize: 11, color: '#00a884' }}>Official Multi-Modal WhatsApp Gateway (+91 98765-43210)</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'rgba(0,168,132,0.15)', color: '#00a884', fontWeight: 700 }}>
            Low-Data Micro-LMS Ready
          </span>
          <Link href="/dial-in" style={{ padding: '6px 14px', borderRadius: 8, background: '#00a884', color: '#111b21', textDecoration: 'none', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>Try 1800 Phone Call</span>
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', maxWidth: 1200, margin: '0 auto', width: '100%', height: 'calc(100vh - 64px)' }}>

        {/* LEFT COLUMN: Low-Bandwidth Explainer & Quick Action Triggers */}
        <div style={{ width: 340, background: '#111b21', borderRight: '1px solid #222e35', padding: 18, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#00a884', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} />
              <span>Smart WhatsApp Assistant</span>
            </h3>
            <p style={{ fontSize: 12, color: '#8696a0', margin: 0, lineHeight: 1.5 }}>
              Standard chatbots output heavy walls of text. Nexus Learn sends bite-sized audio notes, clean SVG formula diagrams, and instant feedback directly via WhatsApp.
            </p>
          </div>

          <div style={{ borderTop: '1px solid #222e35', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#00a884', fontWeight: 700, textTransform: 'uppercase' }}>
              Test Quick Actions:
            </span>

            <button
              onClick={() => handleSendMessage('Explain torque and door hinge analogy', 'voice_note')}
              style={{
                padding: '12px 14px', borderRadius: 10, border: '1px solid #2a3942', background: '#202c33',
                color: '#e9edef', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#00a884' }}>
                <Mic size={15} />
                <span>Send Voice Question</span>
              </div>
              <div style={{ fontSize: 11, color: '#8696a0', marginTop: 4 }}>"Explain torque in physics and why handle is far from hinge"</div>
            </button>

            <button
              onClick={() => handleSendMessage('Please check my formula derivation', 'image')}
              style={{
                padding: '12px 14px', borderRadius: 10, border: '1px solid #2a3942', background: '#202c33',
                color: '#e9edef', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#00a884' }}>
                <Camera size={15} />
                <span>Send Math / Diagram Photo</span>
              </div>
              <div style={{ fontSize: 11, color: '#8696a0', marginTop: 4 }}>Audit handwritten physics equations via AI vision</div>
            </button>

            <button
              onClick={() => handleSendMessage('QUIZ', 'text')}
              style={{
                padding: '12px 14px', borderRadius: 10, border: '1px solid #2a3942', background: '#202c33',
                color: '#e9edef', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#00a884' }}>
                <HelpCircle size={15} />
                <span>Daily 2-Minute Quiz Drill</span>
              </div>
              <div style={{ fontSize: 11, color: '#8696a0', marginTop: 4 }}>Quick micro-assessment to reinforce your concepts</div>
            </button>
          </div>

          <div style={{ marginTop: 'auto', padding: 12, borderRadius: 10, background: 'rgba(0,168,132,0.08)', border: '1px solid rgba(0,168,132,0.2)', fontSize: 11, color: '#8696a0', lineHeight: 1.5 }}>
            <strong style={{ color: '#00a884' }}>Production Webhook:</strong> Connected to Next.js API route <code style={{ color: '#fff' }}>/api/whatsapp-gateway</code> for Twilio & WhatsApp Business Cloud API.
          </div>
        </div>

        {/* RIGHT COLUMN: Chat Viewport */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0b141a', backgroundImage: 'radial-gradient(#1e2a30 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          {/* Chat Messages */}
          <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(m => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  borderRadius: 10,
                  padding: '10px 14px',
                  background: m.sender === 'user' ? '#005c4b' : '#202c33',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {/* Voice Note Player if audio message */}
                {m.audioDuration && (
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <button
                      onClick={() => playVoiceNote(m.audioTranscript)}
                      style={{
                        width: 34, height: 34, borderRadius: '50%', border: 'none', background: '#00a884',
                        color: '#111b21', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      {isPlayingAudio ? <Square size={13} fill="#111b21" /> : <Play size={14} fill="#111b21" />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 18 }}>
                        {[40, 70, 90, 45, 80, 60, 30, 95, 60, 80, 50, 75, 40].map((h, i) => (
                          <div key={i} style={{ width: 3, height: `${h}%`, background: isPlayingAudio ? '#00a884' : '#8696a0', borderRadius: 2 }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 10, color: '#8696a0', marginTop: 2 }}>
                        Voice Note (0:{m.audioDuration}) • Tap to play audio
                      </div>
                    </div>
                  </div>
                )}

                {/* SVG Diagram if attached */}
                {m.svgDiagram && (
                  <div
                    style={{ margin: '6px 0', borderRadius: 8, overflow: 'hidden' }}
                    dangerouslySetInnerHTML={{ __html: m.svgDiagram }}
                  />
                )}

                {/* Text Content */}
                <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#e9edef' }}>
                  {m.text}
                </div>

                {/* Interactive Quiz Buttons */}
                {m.quizOptions && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {m.quizOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          alert(opt.correct ? 'Correct! When angle θ = 0°, sin(0°) = 0, so Torque is ZERO (no rotation).' : 'Incorrect. Pushing directly along the arm produces 0 torque.');
                        }}
                        style={{
                          padding: '8px 12px', borderRadius: 6, border: '1px solid #374248', background: '#111b21',
                          color: '#00a884', fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ alignSelf: 'flex-end', fontSize: 10, color: '#8696a0', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{m.time}</span>
                  {m.sender === 'user' && <Check size={12} color="#53bdeb" />}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', padding: '8px 14px', borderRadius: 10, background: '#202c33', color: '#00a884', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} />
                <span>Nexus AI is preparing voice note & diagram...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom Input Bar */}
          <div style={{ padding: '12px 18px', background: '#202c33', display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="text"
              placeholder="Ask a question in Hindi, Tamil, or English..."
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputMsg)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', background: '#2a3942',
                color: '#e9edef', fontSize: 14, outline: 'none',
              }}
            />
            <button
              onClick={() => handleSendMessage(inputMsg)}
              style={{
                padding: '10px 18px', borderRadius: 8, border: 'none', background: '#00a884',
                color: '#111b21', fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
