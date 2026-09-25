'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Mic, Camera, Sparkles, ArrowLeft, Play, Square, CheckCircle2, XCircle, HelpCircle, Send, Check } from 'lucide-react';

interface QuizOption {
  label: string;
  correct: boolean;
  explanation?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  time: string;
  type: 'text' | 'voice_note' | 'image' | 'quiz_card';
  text?: string;
  audioDuration?: number;
  audioTranscript?: string;
  svgDiagram?: string;
  quizOptions?: QuizOption[];
}

const QUICK_CHIPS = [
  { label: '📝 Audit Formula: τ = r × F × sin(θ)', query: '[Handwritten Note: τ = r × F × sin(θ)]', type: 'image' as const },
  { label: '🎯 Daily Syllabus Quiz', query: 'QUIZ', type: 'text' as const },
  { label: '🔬 Explain Photosynthesis', query: 'Explain photosynthesis mechanism and chemical equation', type: 'text' as const },
  { label: '⚡ Ohm\'s Law: V = I × R', query: 'Explain Ohm\'s Law and how resistance affects current', type: 'text' as const },
  { label: '🍎 Newton\'s 3 Laws', query: 'Explain Newton\'s three laws of motion with real world analogies', type: 'text' as const },
  { label: '🌈 Snell\'s Law & Refraction', query: 'Explain Snell\'s law of refraction and light bending', type: 'text' as const },
  { label: '🇮🇳 हिन्दी: न्यूटन के नियम', query: 'न्यूटन के तीनों नियमों को सरल हिन्दी में समझाइए', type: 'text' as const },
  { label: '🇮🇳 தமிழ்: திருப்புவிசை', query: 'திருப்புவிசை (Torque) மற்றும் கதவு கைப்பிடி உதாரணம்', type: 'text' as const },
];

export default function WhatsAppMicroLMSPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      time: '10:45 AM',
      type: 'text',
      text: '👋 *Welcome to Nexus Learn WhatsApp Study Assistant!*\n\nI answer ANY questions in Physics, Chemistry, Biology, Mathematics, or Coding in English, Hindi, or Tamil.\n\n• Send photos of handwritten formulas to audit\n• Type *QUIZ* for daily 2-minute syllabus drills\n• Tap any quick chip above or type any query below!',
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [answeredQuiz, setAnsweredQuiz] = useState<{ [msgId: string]: number }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string, type: 'text' | 'voice_note' | 'image' = 'text') => {
    if (!textToSend.trim() && type === 'text') return;

    const outgoingText = type === 'voice_note'
      ? (textToSend || 'Explain torque and door hinge analogy')
      : type === 'image'
      ? (textToSend || '[Handwritten Note: τ = r × F × sin(θ)]')
      : textToSend;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      text: type === 'voice_note'
        ? `🎙️ Voice Note: "${outgoingText}"`
        : type === 'image'
        ? outgoingText
        : textToSend,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMsg('');
    setIsTyping(true);

    try {
      const savedKey = typeof window !== 'undefined' ? localStorage.getItem('NEXUS_GEMINI_KEY') || '' : '';
      const res = await fetch('/api/whatsapp-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: '+91-98765-43210',
          messageType: type,
          text: outgoingText,
          customApiKey: savedKey,
        })
      });
      const data = await res.json();

      setIsTyping(false);

      const botReply: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: data.svgDiagram || (data.quizOptions && data.quizOptions.length > 0) ? 'quiz_card' : 'text',
        text: data.replyMessage,
        audioDuration: data.voiceNoteDurationSec,
        audioTranscript: data.audioTranscript,
        svgDiagram: data.svgDiagram,
        quizOptions: data.quizOptions && data.quizOptions.length > 0 ? data.quizOptions : undefined
      };

      setMessages(prev => [...prev, botReply]);
    } catch {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          text: 'I am ready to help! Try typing any question in Science, Math, or Coding, or type QUIZ for a quick syllabus drill.',
        }
      ]);
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

  const handleSelectQuizOption = (msgId: string, optIndex: number, option: QuizOption) => {
    setAnsweredQuiz(prev => ({ ...prev, [msgId]: optIndex }));

    // Send confirmation message in chat
    const evalMsg: ChatMessage = {
      id: 'bot_eval_' + Date.now(),
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      text: option.correct
        ? `*[Quiz Drill: ✓ Correct!]*\n${option.explanation || 'Great job! You have mastered this concept.'}`
        : `*[Quiz Drill: ✗ Incorrect]*\n${option.explanation || 'Review the principle and try again!'}`
    };

    setMessages(prev => [...prev, evalMsg]);
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
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,168,132,0.2)', color: '#00a884' }}>Verified AI Tutor</span>
              </div>
              <div style={{ fontSize: 11, color: '#8696a0' }}>Online • Answers ANY STEM Question 24/7</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ padding: '4px 10px', borderRadius: 6, background: '#111b21', color: '#00a884', fontSize: 11, fontWeight: 700 }}>
            Micro-LMS Gateway Active
          </span>
          <Link href="/dial-in" style={{ padding: '6px 14px', borderRadius: 8, background: '#00a884', color: '#111b21', textDecoration: 'none', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>Try 1800 Phone Call</span>
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', maxWidth: 1200, margin: '0 auto', width: '100%', height: 'calc(100vh - 64px)' }}>

        {/* LEFT COLUMN: Sidebar with Features & Presets */}
        <div style={{ width: 340, background: '#111b21', borderRight: '1px solid #222e35', padding: 18, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#00a884', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} />
              <span>Omni-Sync WhatsApp LMS</span>
            </h3>
            <p style={{ fontSize: 12, color: '#8696a0', margin: 0, lineHeight: 1.5 }}>
              Standard chatbots output heavy walls of text. Nexus Learn sends bite-sized audio notes, clean SVG formula diagrams, and instant feedback directly via WhatsApp.
            </p>
          </div>

          <div style={{ borderTop: '1px solid #222e35', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#00a884', fontWeight: 700, textTransform: 'uppercase' }}>
              Instant Actions:
            </span>

            <button
              onClick={() => handleSendMessage('[Handwritten Note: τ = r × F × sin(θ)]', 'image')}
              style={{
                padding: '12px 14px', borderRadius: 10, border: '1px solid #2a3942', background: '#202c33',
                color: '#e9edef', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#00a884' }}>
                <Camera size={15} />
                <span>Audit Torque Derivation</span>
              </div>
              <div style={{ fontSize: 11, color: '#8696a0', marginTop: 4 }}>`τ = r × F × sin(θ)` dimensional and vector check</div>
            </button>

            <button
              onClick={() => handleSendMessage('QUIZ', 'text')}
              style={{
                padding: '12px 14px', borderRadius: 10, border: '1px solid #2a3942', background: '#202c33',
                color: '#e9edef', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#00a884' }}>
                <HelpCircle size={15} />
                <span>Daily 2-Minute Quiz Drill</span>
              </div>
              <div style={{ fontSize: 11, color: '#8696a0', marginTop: 4 }}>Randomized micro-assessment across syllabus</div>
            </button>

            <button
              onClick={() => handleSendMessage('Explain torque and door hinge analogy', 'voice_note')}
              style={{
                padding: '12px 14px', borderRadius: 10, border: '1px solid #2a3942', background: '#202c33',
                color: '#e9edef', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#00a884' }}>
                <Mic size={15} />
                <span>Voice Note Reasoning</span>
              </div>
              <div style={{ fontSize: 11, color: '#8696a0', marginTop: 4 }}>Listen to spoken Socratic explanations</div>
            </button>

            <button
              onClick={() => handleSendMessage('Explain photosynthesis mechanism and chemical equation', 'text')}
              style={{
                padding: '12px 14px', borderRadius: 10, border: '1px solid #2a3942', background: '#202c33',
                color: '#e9edef', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#00a884' }}>
                <Sparkles size={15} />
                <span>Photosynthesis & Biology</span>
              </div>
              <div style={{ fontSize: 11, color: '#8696a0', marginTop: 4 }}>Chemical formula, light reactions, chloroplasts</div>
            </button>
          </div>

          <div style={{ marginTop: 'auto', padding: 12, borderRadius: 10, background: 'rgba(0,168,132,0.08)', border: '1px solid rgba(0,168,132,0.2)', fontSize: 11, color: '#8696a0', lineHeight: 1.5 }}>
            <strong style={{ color: '#00a884' }}>Production Webhook:</strong> Live endpoint connected at <code style={{ color: '#fff' }}>/api/whatsapp-gateway</code>. Supports multilingual inquiries.
          </div>
        </div>

        {/* RIGHT COLUMN: WhatsApp Chat Viewport */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0b141a', backgroundImage: 'radial-gradient(#1e2a30 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          
          {/* Quick Chips Bar */}
          <div style={{
            padding: '8px 14px',
            background: '#111b21',
            borderBottom: '1px solid #222e35',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}>
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query, chip.type)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 16,
                  border: '1px solid #2a3942',
                  background: '#202c33',
                  color: '#e9edef',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(m => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
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
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <button
                      onClick={() => playVoiceNote(m.audioTranscript)}
                      style={{
                        width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#00a884',
                        color: '#111b21', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                      }}
                      title="Play spoken explanation voice note"
                    >
                      {isPlayingAudio ? <Square size={13} fill="#111b21" /> : <Play size={15} fill="#111b21" />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 18 }}>
                        {[40, 70, 90, 45, 80, 60, 30, 95, 60, 80, 50, 75, 40].map((h, i) => (
                          <div key={i} style={{ width: 3, height: `${h}%`, background: isPlayingAudio ? '#00a884' : '#8696a0', borderRadius: 2 }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 10, color: '#8696a0', marginTop: 2 }}>
                        Voice Note (0:{m.audioDuration < 10 ? '0' + m.audioDuration : m.audioDuration}) • Tap to play audio
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

                {/* Interactive Quiz Buttons with Inline Feedback */}
                {m.quizOptions && m.quizOptions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {m.quizOptions.map((opt, i) => {
                      const isChosen = answeredQuiz[m.id] === i;
                      const hasAnswered = answeredQuiz[m.id] !== undefined;

                      let btnBg = '#111b21';
                      let btnBorder = '#374248';
                      let btnColor = '#00a884';

                      if (isChosen) {
                        btnBg = opt.correct ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
                        btnBorder = opt.correct ? '#10b981' : '#ef4444';
                        btnColor = opt.correct ? '#34d399' : '#f87171';
                      }

                      return (
                        <div key={i}>
                          <button
                            onClick={() => handleSelectQuizOption(m.id, i, opt)}
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: 6,
                              border: `1px solid ${btnBorder}`,
                              background: btnBg,
                              color: btnColor,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              transition: 'all 0.15s ease',
                              fontFamily: 'inherit',
                            }}
                          >
                            <span>{opt.label}</span>
                            {isChosen && (
                              opt.correct
                                ? <CheckCircle2 size={16} color="#10b981" />
                                : <XCircle size={16} color="#ef4444" />
                            )}
                          </button>

                          {/* Inline Explanation if chosen */}
                          {isChosen && opt.explanation && (
                            <div style={{
                              marginTop: 4,
                              padding: '8px 10px',
                              borderRadius: 6,
                              background: opt.correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              border: `1px solid ${opt.correct ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                              fontSize: 11,
                              color: opt.correct ? '#a7f3d0' : '#fca5a5',
                              lineHeight: 1.4,
                            }}>
                              <strong>{opt.correct ? '✓ Explanation: ' : '✗ Note: '}</strong>
                              {opt.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ alignSelf: 'flex-end', fontSize: 10, color: '#8696a0', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <span>{m.time}</span>
                  {m.sender === 'user' && <Check size={12} color="#53bdeb" />}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', padding: '8px 14px', borderRadius: 10, background: '#202c33', color: '#00a884', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} />
                <span>Nexus AI is preparing step-by-step reasoning & audio...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom Input Bar */}
          <div style={{ padding: '12px 18px', background: '#202c33', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #313d45' }}>
            <input
              type="text"
              placeholder="Ask ANY question in Science, Math, or Coding (English / हिन्दी / தமிழ்)..."
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputMsg)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', background: '#2a3942',
                color: '#e9edef', fontSize: 14, outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => handleSendMessage(inputMsg)}
              disabled={!inputMsg.trim()}
              style={{
                padding: '10px 18px', borderRadius: 8, border: 'none', background: '#00a884',
                color: '#111b21', fontWeight: 700, cursor: inputMsg.trim() ? 'pointer' : 'default',
                opacity: inputMsg.trim() ? 1 : 0.6, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: 'inherit',
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
