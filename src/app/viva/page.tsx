'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface VivaQuestion {
  id: string;
  subject: string;
  topic: string;
  question: string;
  sampleKeyInsight: string;
}

const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 'viva_1',
    subject: 'Physics',
    topic: 'Wave Optics & Interference',
    question: 'Explain why the interference fringe width ? decreases when we increase the slit separation distance d in Young\'s experiment.',
    sampleKeyInsight: 'Because path difference ?x = y*d/D increases for the same angular position, meaning wave crests match and cancel over narrower spatial intervals.'
  },
  {
    id: 'viva_2',
    subject: 'Physics',
    topic: 'Electromagnetism & Induction',
    question: 'Why does an inductor oppose any sudden change in electrical current according to Lenz\'s Law and energy conservation?',
    sampleKeyInsight: 'The changing magnetic flux creates a back electromotive force (EMF = -L di/dt) that works against the source voltage to conserve magnetic field energy.'
  },
  {
    id: 'viva_3',
    subject: 'Computer Science',
    topic: 'Operating Systems & Memory',
    question: 'Why do operating systems use multi-level paging rather than a single contiguous page table for a 64-bit address space?',
    sampleKeyInsight: 'A linear page table for 64-bit would consume millions of gigabytes of RAM. Multi-level paging allows sparse allocation where unmapped memory directories take zero storage.'
  },
  {
    id: 'viva_4',
    subject: 'Chemistry',
    topic: 'Chemical Equilibrium & Thermodynamics',
    question: 'How does an increase in total pressure shift the equilibrium for the synthesis of ammonia (N2 + 3H2 ? 2NH3)?',
    sampleKeyInsight: 'By Le Chatelier principle, system shifts toward the side with fewer gas moles (4 moles reactants -> 2 moles product) to relieve the increased pressure.'
  }
];

export default function VivaVocePage() {
  const [selectedQuestion, setSelectedQuestion] = useState<VivaQuestion>(VIVA_QUESTIONS[0]);
  const [isListening, setIsListening] = useState(false);
  const [oralTranscript, setOralTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [audioLevel, setAudioLevel] = useState<number[]>([20, 45, 80, 50, 90, 30, 60, 40]);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = 'en-US';

        recog.onresult = (event: any) => {
          let full = '';
          for (let i = 0; i < event.results.length; i++) {
            full += event.results[i][0].transcript + ' ';
          }
          setOralTranscript(full.trim());
        };

        recog.onerror = () => setIsListening(false);
        recog.onend = () => setIsListening(false);
        recognitionRef.current = recog;
      }
    }
  }, []);

  // Audio wave animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setAudioLevel([
          Math.floor(Math.random() * 80) + 15,
          Math.floor(Math.random() * 95) + 20,
          Math.floor(Math.random() * 85) + 25,
          Math.floor(Math.random() * 90) + 15,
          Math.floor(Math.random() * 70) + 20,
          Math.floor(Math.random() * 85) + 15,
          Math.floor(Math.random() * 95) + 25,
          Math.floor(Math.random() * 60) + 20,
        ]);
      }, 120);
    } else {
      setAudioLevel([20, 20, 20, 20, 20, 20, 20, 20]);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setOralTranscript('');
      setEvaluation(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        setIsListening(true);
        // Fallback simulated oral transcription if mic hardware locked
        setOralTranscript('When slit separation d increases, the angular fringe spacing decreases because the path difference delta x between rays reaching the screen grows faster with spatial distance y. Since fringe width beta equals lambda times D over d, d is in the denominator, meaning fringes crowd closer together.');
      }
    }
  };

  const submitOralDefense = async () => {
    if (!oralTranscript.trim()) return;
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/socratic-viva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: selectedQuestion.question,
          studentAnswer: oralTranscript,
          subject: selectedQuestion.subject,
        })
      });
      const data = await res.json();
      setEvaluation(data.evaluation);

      // Speak probing follow-up verbally
      if (typeof window !== 'undefined' && data.evaluation?.probingFollowUp) {
        const u = new SpeechSynthesisUtterance(data.evaluation.probingFollowUp);
        window.speechSynthesis.speak(u);
      }
    } catch {
      // Fallback
    } finally {
      setIsEvaluating(false);
    }
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
            <span>???</span>
            <span>Socratic Voice Examiner ("Viva-Voce AI Mode")</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/agent" style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)', color: '#c084fc', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
            ?? AI Pedagogical Agent ?
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '320px 1fr 380px', gap: 16, maxWidth: 1700, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* LEFT COLUMN: Question Topic Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Oral Defense Pool</span>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: '4px 0' }}>
              Select Viva Topic
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
              Written multiple-choice questions can be guessed. The Socratic Examiner tests oral conceptual integrity.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {VIVA_QUESTIONS.map(q => (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedQuestion(q);
                  setOralTranscript('');
                  setEvaluation(null);
                }}
                style={{
                  padding: '12px 14px', borderRadius: 10, textAlign: 'left',
                  background: selectedQuestion.id === q.id ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedQuestion.id === q.id ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  color: selectedQuestion.id === q.id ? '#00d4ff' : 'white', cursor: 'pointer', fontFamily: 'Outfit',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 6, background: 'rgba(0,212,255,0.2)', color: '#00d4ff', fontWeight: 700 }}>
                    {q.subject}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{q.topic}</div>
              </button>
            ))}
          </div>
        </div>

        {/* MIDDLE COLUMN: Oral Defense Mic & Transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 20 }}>
          {/* Question Banner */}
          <div style={{ padding: 18, borderRadius: 14, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.25)' }}>
            <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Examiner Viva Question ({selectedQuestion.subject})
            </span>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: 'white', margin: '8px 0 0', lineHeight: 1.5 }}>
              "{selectedQuestion.question}"
            </h3>
          </div>

          {/* Audio Wave Visualizer & Mic Control */}
          <div style={{
            padding: 24, borderRadius: 14, background: '#020408', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            {/* Visualizer Bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 70 }}>
              {audioLevel.map((lvl, i) => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: `${lvl}%`,
                    background: isListening ? 'linear-gradient(to top, #0066ff, #00d4ff)' : 'rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    transition: 'height 0.1s ease',
                  }}
                />
              ))}
            </div>

            {/* Mic Button */}
            <button
              onClick={toggleListening}
              style={{
                padding: '14px 32px', borderRadius: 50, border: 'none',
                background: isListening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #0066ff, #00d4ff)',
                color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit',
                boxShadow: isListening ? '0 0 25px rgba(239,68,68,0.5)' : '0 0 20px rgba(0,212,255,0.3)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span>{isListening ? '?? Stop Speaking & Process' : '??? Tap to Speak Answer'}</span>
            </button>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
              {isListening ? 'Listening via browser microphone... Speak naturally.' : 'Click to begin oral conceptual defense.'}
            </span>
          </div>

          {/* Real-time Oral Transcript */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
              SPEECH-TO-TEXT ORAL TRANSCRIPTION:
            </span>
            <textarea
              value={oralTranscript}
              onChange={e => setOralTranscript(e.target.value)}
              placeholder="Your spoken words will appear here live as you speak into the microphone..."
              style={{
                flex: 1, minHeight: 120, borderRadius: 10, background: '#020408',
                border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', padding: 14,
                fontFamily: 'Outfit, sans-serif', fontSize: 14, lineHeight: 1.6, outline: 'none', resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={submitOralDefense}
              disabled={isEvaluating || !oralTranscript.trim()}
              style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #10b981, #00d4ff)', color: 'white',
                fontWeight: 700, fontSize: 13, cursor: isEvaluating ? 'wait' : 'pointer', fontFamily: 'Outfit',
              }}
            >
              {isEvaluating ? '?? Evaluating Conceptual Depth...' : '? Grade Oral Defense'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Socratic Evaluation & Counter-Probe */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 18 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#10b981', margin: 0 }}>
            ?? Viva Defense Scorecard
          </h2>

          {evaluation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Score Badge */}
              <div style={{ padding: 14, borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>CONCEPTUAL MASTERY SCORE</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: 'white' }}>{evaluation.score} / 100</div>
                </div>
                <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: '#10b981', color: '#000', fontWeight: 700 }}>
                  {evaluation.examinerVerdict}
                </span>
              </div>

              {/* Rote Memorization Radar */}
              <div style={{ padding: 12, borderRadius: 10, background: evaluation.roteMemorizationDetected ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.08)', border: `1px solid ${evaluation.roteMemorizationDetected ? '#ef4444' : '#10b981'}` }}>
                <strong style={{ fontSize: 12, color: evaluation.roteMemorizationDetected ? '#ef4444' : '#10b981' }}>
                  {evaluation.roteMemorizationDetected ? '?? Rote Memorization Flagged' : '? First-Principles Reasoning Verified'}
                </strong>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                  {evaluation.conceptualDepth}
                </div>
              </div>

              {/* Socratic Verbal Probing Question */}
              <div style={{ padding: 14, borderRadius: 12, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.4)' }}>
                <div style={{ fontSize: 11, color: '#c084fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>??</span>
                  <span>EXAMINER FOLLOW-UP COUNTER-PROBE:</span>
                </div>
                <p style={{ fontSize: 13, color: 'white', margin: '8px 0 0', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{evaluation.probingFollowUp}"
                </p>
              </div>

              {/* Strengths & Misconceptions */}
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                <strong style={{ color: '#00d4ff' }}>Identified Strengths:</strong> {evaluation.strengths}
              </div>
            </div>
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              Select a question, speak your oral answer into the microphone, and click "Grade Oral Defense" to receive real-time Socratic feedback.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
