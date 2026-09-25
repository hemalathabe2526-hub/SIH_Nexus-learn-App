'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface CallTranscriptItem {
  speaker: 'student' | 'ai_tutor';
  text: string;
  time: string;
}

export default function DialInTollFreePage() {
  const [phoneNumber, setPhoneNumber] = useState('1800-63987-53276');
  const [language, setLanguage] = useState<'english' | 'hindi' | 'tamil'>('hindi');
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState<CallTranscriptItem[]>([]);
  const [dtmfInput, setDtmfInput] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Call duration timer
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Start Call Flow
  const startCall = async () => {
    setCallState('calling');
    setTranscripts([]);
    setCallDuration(0);

    setTimeout(() => {
      setCallState('connected');
      const welcomeTexts = {
        english: 'Namaste! Welcome to Nexus Learn Toll-Free Socratic Voice Tutor. You can ask me any question in Physics, Math, or Chemistry. What would you like to learn today?',
        hindi: '??????! ?????? ???? ???-???? ???? ?????? ??? ???? ?????? ??? ????? ???????, ???? ?? ????? ??????? ??? ?? ???? ????? ????? ????',
        tamil: '???????! ??????? ?????? ??????????? ?????? ????????????? ????????????. ????????? ?????? ?????????? ?????? ?????????? ?????????.'
      };
      const welcome = welcomeTexts[language];
      setTranscripts([{ speaker: 'ai_tutor', text: welcome, time: '00:02' }]);

      // Speak verbally
      if (typeof window !== 'undefined') {
        const u = new SpeechSynthesisUtterance(welcome);
        u.lang = language === 'hindi' ? 'hi-IN' : language === 'tamil' ? 'ta-IN' : 'en-IN';
        u.onstart = () => setIsSpeaking(true);
        u.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
      }
    }, 2000);
  };

  const endCall = () => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    setCallState('ended');
    setIsSpeaking(false);
  };

  const askSampleQuestion = (question: string) => {
    if (callState !== 'connected') return;

    const userItem: CallTranscriptItem = {
      speaker: 'student',
      text: question,
      time: formatDuration(callDuration),
    };
    setTranscripts(prev => [...prev, userItem]);

    // AI Verbal Answer
    setTimeout(() => {
      const answers: Record<string, string> = {
        "What is Newton\'s Third Law?": "Newton's Third Law states that whenever one object exerts a force on a second object, the second exerts an equal and opposite force on the first. For example, when you jump off a boat, you push the boat backward while the boat pushes you forward!",
        '??? ?? ????? ???? ???? ???': '?????? ?? ????? ???? ?? ??????, ???????? ?????? ?? ????? ?? ?????? ???? ??? ??????????? ???? ??? ???? ?? ?? ??? ?? ????? ???, ?? ?? ??? ?? ???? ?????? ??? ?? ??? ???? ???!',
        '??????? ???? ??????? ?????': '??????????? ??????? ???? ?????? ????????????? ???? ???? ?????? ??????????? ????????? ?????????? ??????? ??????????. F = G m1 m2 divided by r squared.'
      };

      const reply = answers[question] || 'That is a fundamental question! Let us break it down into simple concepts...';
      const aiItem: CallTranscriptItem = {
        speaker: 'ai_tutor',
        text: reply,
        time: formatDuration(callDuration + 3),
      };
      setTranscripts(prev => [...prev, aiItem]);

      if (typeof window !== 'undefined') {
        const u = new SpeechSynthesisUtterance(reply);
        u.lang = language === 'hindi' ? 'hi-IN' : language === 'tamil' ? 'ta-IN' : 'en-IN';
        u.onstart = () => setIsSpeaking(true);
        u.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
      }
    }, 1200);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ background: 'var(--nexus-void, #020408)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div style={{
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,212,255,0.2)', background: 'rgba(2,4,8,0.95)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: '#00d4ff', fontSize: 13, fontWeight: 700 }}>
            ? Back to Dashboard
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>??</span>
            <span>Ultra-Low-Latency Full-Duplex AI Dial-In (SIP / WebRTC)</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 700 }}>
            Tier 4 Zero-Data / Feature Phone Ready
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '360px 1fr 340px', gap: 18, maxWidth: 1700, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* LEFT COLUMN: Feature Phone Keypad Simulator */}
        <div style={{ borderRadius: 20, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
            JioPhone / Basic Phone Simulator
          </div>

          {/* Screen */}
          <div style={{
            width: '100%', padding: '14px 16px', borderRadius: 12, background: '#020408',
            border: '1px solid rgba(0,212,255,0.3)', textAlign: 'center', marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, color: callState === 'connected' ? '#10b981' : 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
              {callState === 'calling' ? 'Calling SIP Gateway...' : callState === 'connected' ? `CONNECTED ? ${formatDuration(callDuration)}` : callState === 'ended' ? 'Call Disconnected' : 'Ready to Dial'}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginTop: 4, letterSpacing: 1 }}>
              {phoneNumber}
            </div>
            {dtmfInput && (
              <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>
                DTMF Keypad Input: {dtmfInput}
              </div>
            )}
          </div>

          {/* Keypad Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: '100%', marginBottom: 16 }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
              <button
                key={key}
                onClick={() => setDtmfInput(prev => prev + key)}
                style={{
                  padding: '12px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.03)', color: 'white', fontSize: 16, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Outfit', transition: 'background 0.15s',
                }}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Call / End Buttons */}
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            {callState !== 'connected' ? (
              <button
                onClick={startCall}
                disabled={callState === 'calling'}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit',
                  boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
                }}
              >
                {callState === 'calling' ? 'Dialing...' : '?? Call 1800 Toll-Free'}
              </button>
            ) : (
              <button
                onClick={endCall}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit',
                  boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
                }}
              >
                ?? End Call
              </button>
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: Live Audio Wave & Two-Way Socratic Transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 20 }}>
          {/* Audio Wave Visualizer */}
          <div style={{
            padding: 20, borderRadius: 14, background: '#020408', border: '1px solid rgba(0,212,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: callState === 'connected' ? '#10b981' : '#ef4444' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                  {callState === 'connected' ? (isSpeaking ? 'AI Tutor Speaking...' : 'AI Tutor Listening for Student...') : 'Call Inactive'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Full-Duplex Socratic Voice Pipeline (WebRTC Opus 24kbps)</div>
              </div>
            </div>

            {/* Wave animation */}
            <div style={{ display: 'flex', gap: 4, height: 26, alignItems: 'center' }}>
              {[40, 80, 50, 95, 60, 85, 30, 90, 45].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: callState === 'connected' && isSpeaking ? `${h}%` : '20%',
                    background: callState === 'connected' ? '#00d4ff' : 'rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    transition: 'height 0.2s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Transcript Box */}
          <div style={{ flex: 1, minHeight: 340, borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {transcripts.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: 80, fontSize: 13 }}>
                Click "Call 1800 Toll-Free" on the left to start a real-time verbal tutoring call.
              </div>
            ) : (
              transcripts.map((t, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: t.speaker === 'student' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%', padding: '10px 14px', borderRadius: 10,
                    background: t.speaker === 'student' ? 'rgba(0,102,255,0.2)' : 'rgba(0,212,255,0.12)',
                    border: `1px solid ${t.speaker === 'student' ? 'rgba(0,102,255,0.4)' : 'rgba(0,212,255,0.25)'}`,
                    fontSize: 13, lineHeight: 1.5,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.speaker === 'student' ? '#60a5fa' : '#00d4ff', fontWeight: 700, marginBottom: 2 }}>
                    <span>{t.speaker === 'student' ? '????? Student Spoke' : '?? AI Phone Tutor'}</span>
                    <span>{t.time}</span>
                  </div>
                  <div>{t.text}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Language & Quick Verbal Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 18 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#f59e0b', margin: 0 }}>
            ??? Dialect & Verbal Prompts
          </h2>

          <div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>CHOOSE CALL LANGUAGE:</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {(['hindi', 'tamil', 'english'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                    background: language === lang ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.04)',
                    color: language === lang ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', textTransform: 'capitalize',
                  }}
                >
                  {lang === 'hindi' ? '???? Hindi' : lang === 'tamil' ? '???? Tamil' : '?? English'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
              SIMULATE STUDENT VERBAL QUESTION:
            </span>

            {[
              { text: language === 'hindi' ? '??? ?? ????? ???? ???? ???' : language === 'tamil' ? '??????? ???? ??????? ?????' : "What is Newton\'s Third Law?", icon: '?' },
              { text: language === 'hindi' ? '????? ?? ?????? ?? ????? ?? ?????? ??????' : language === 'tamil' ? '?????? ????????? ?????' : 'Explain Torque and lever arm formula', icon: '??' },
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => askSampleQuestion(q.text)}
                disabled={callState !== 'connected'}
                style={{
                  padding: '12px 14px', borderRadius: 10, textAlign: 'left',
                  background: callState === 'connected' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${callState === 'connected' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  color: callState === 'connected' ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                  cursor: callState === 'connected' ? 'pointer' : 'not-allowed', fontFamily: 'Outfit',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700 }}>{q.icon} Speak: "{q.text}"</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 'auto', padding: 12, borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
            <strong style={{ color: '#f59e0b' }}>Digital Divide Solution:</strong> Students with no internet or smartphone dial a standard cellular number. The SIP trunk streams directly to Gemini Flash for real-time Socratic dialogue.
          </div>
        </div>

      </div>
    </div>
  );
}
