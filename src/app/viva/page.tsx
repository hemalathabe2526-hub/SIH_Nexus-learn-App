'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Mic, MicOff, Sparkles, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, Award, Volume2, BookOpen } from 'lucide-react';
import AppPermissionModal from '@/components/AppPermissionModal';
import { getStoredPermission, savePermissionChoice, PermissionChoice, resetPermission } from '@/lib/permissions';

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
    question: "Explain why the interference fringe width β decreases when we increase the slit separation distance d in Young's experiment.",
    sampleKeyInsight: 'Because path difference Δx = y·d/D increases for the same angular position, meaning wave crests match and cancel over narrower spatial intervals.'
  },
  {
    id: 'viva_2',
    subject: 'Physics',
    topic: 'Electromagnetism & Induction',
    question: "Why does an inductor oppose any sudden change in electrical current according to Lenz's Law and energy conservation?",
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
    question: 'How does an increase in total pressure shift the equilibrium for the synthesis of ammonia (N2 + 3H2 ⇌ 2NH3)?',
    sampleKeyInsight: 'By Le Chatelier principle, system shifts toward the side with fewer gas moles (4 moles reactants -> 2 moles product) to relieve the increased pressure.'
  }
];

export default function VivaVocePage() {
  const [selectedQuestion, setSelectedQuestion] = useState<VivaQuestion>(VIVA_QUESTIONS[0]);
  const [isListening, setIsListening] = useState(false);
  const [oralTranscript, setOralTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [audioLevel, setAudioLevel] = useState<number[]>([15, 25, 40, 60, 35, 20, 10]);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setOralTranscript(currentTranscript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Visual audio pulse animation when listening
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setAudioLevel([
          Math.floor(20 + Math.random() * 70),
          Math.floor(30 + Math.random() * 65),
          Math.floor(40 + Math.random() * 60),
          Math.floor(50 + Math.random() * 50),
          Math.floor(35 + Math.random() * 65),
          Math.floor(25 + Math.random() * 70),
          Math.floor(15 + Math.random() * 80),
        ]);
      }, 150);
    } else {
      setAudioLevel([15, 25, 40, 60, 35, 20, 10]);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [micPermissionChoice, setMicPermissionChoice] = useState<string>('prompt');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMicPermissionChoice(getStoredPermission('microphone'));
    }
  }, []);

  const handleStartListeningWithPermission = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const currentPerm = getStoredPermission('microphone');
    if (currentPerm === 'prompt') {
      setShowPermissionModal(true);
    } else if (currentPerm === 'block') {
      setIsListening(true);
      simulateSpokenInput();
    } else {
      startRecognitionActual();
    }
  };

  const handlePermissionChoice = (choice: PermissionChoice) => {
    savePermissionChoice('microphone', choice);
    setMicPermissionChoice(choice);
    setShowPermissionModal(false);
    if (choice === 'block') {
      setIsListening(true);
      simulateSpokenInput();
    } else {
      startRecognitionActual();
    }
  };

  const startRecognitionActual = () => {
    setOralTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(true);
        simulateSpokenInput();
      }
    } else {
      setIsListening(true);
      simulateSpokenInput();
    }
  };

  const simulateSpokenInput = () => {
    setTimeout(() => {
      setOralTranscript("In Young's double slit experiment, the fringe width beta is given by lambda times big D divided by small d. When we increase the slit separation distance small d, the angular separation between successive interference maxima becomes smaller because the rays from the two slits develop a path difference more rapidly with angle. Thus, the bright fringes become closer to each other.");
      setIsListening(false);
    }, 3000);
  };

  const submitOralDefense = async () => {
    if (!oralTranscript.trim()) return;

    setIsEvaluating(true);
    setEvaluation(null);

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

      if (res.ok) {
        const data = await res.json();
        setEvaluation(data);
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
          <Link href="/dashboard" style={{ textDecoration: 'none', color: '#00d4ff', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mic size={18} color="#10b981" />
            <span>Socratic Voice Examiner (Oral Viva Practice)</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => {
              resetPermission('microphone');
              setMicPermissionChoice('prompt');
              setShowPermissionModal(true);
            }}
            style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)', color: '#d1d5db', fontSize: 11, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'Outfit'
            }}
            title="Change microphone permission settings (Allow while using / Allow once / Block)"
          >
            <ShieldCheck size={13} color="#10b981" />
            <span>
              {micPermissionChoice === 'while_using'
                ? 'Mic: Allowed'
                : micPermissionChoice === 'only_this_time'
                ? 'Mic: This Time'
                : micPermissionChoice === 'block'
                ? 'Mic: Blocked'
                : 'Mic Permissions'}
            </span>
          </button>

          <Link href="/agent" style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)', color: '#c084fc', textDecoration: 'none', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} />
            <span>AI Pedagogical Agent</span>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '320px 1fr 380px', gap: 16, maxWidth: 1700, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* LEFT COLUMN: Question Topic Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Viva Topics</span>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: '4px 0' }}>
              Select Oral Defense Topic
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
              Multiple-choice questions test memory. Oral viva tests true understanding and first-principles reasoning.
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
              onClick={handleStartListeningWithPermission}
              style={{
                padding: '14px 32px', borderRadius: 50, border: 'none',
                background: isListening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #0066ff, #00d4ff)',
                color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit',
                boxShadow: isListening ? '0 0 25px rgba(239,68,68,0.5)' : '0 0 20px rgba(0,212,255,0.3)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              <span>{isListening ? 'Stop Speaking & Review' : 'Tap to Speak Answer'}</span>
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
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              <Award size={16} />
              <span>{isEvaluating ? 'Evaluating Conceptual Depth...' : 'Grade Oral Defense'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Socratic Evaluation & Counter-Probe */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 18 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#10b981', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color="#10b981" />
            <span>Viva Defense Scorecard</span>
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
                <strong style={{ fontSize: 12, color: evaluation.roteMemorizationDetected ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {evaluation.roteMemorizationDetected ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                  <span>{evaluation.roteMemorizationDetected ? 'Rote Memorization Flagged' : 'First-Principles Reasoning Verified'}</span>
                </strong>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                  {evaluation.conceptualDepth}
                </div>
              </div>

              {/* Socratic Verbal Probing Question */}
              <div style={{ padding: 14, borderRadius: 12, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.4)' }}>
                <div style={{ fontSize: 11, color: '#c084fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HelpCircle size={15} />
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

      {/* In-App Permission Modal with 3 options: Allow while using this app, Allow only this time, Block */}
      <AppPermissionModal
        isOpen={showPermissionModal}
        type="microphone"
        onChoice={handlePermissionChoice}
        onClose={() => setShowPermissionModal(false)}
      />
    </div>
  );
}
