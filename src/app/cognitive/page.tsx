'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const EMOTIONS = [
  { id: 'flow', label: 'Flow State', icon: '🌊', color: '#10b981', desc: 'Deep focus. Accelerating content.', action: 'Depth Mode: ON' },
  { id: 'confused', label: 'Confused', icon: '🤔', color: '#f59e0b', desc: 'Detected confusion. Simplifying...', action: 'Analogy Mode: ON' },
  { id: 'anxious', label: 'Anxious', icon: '😰', color: '#ef4444', desc: 'Stress detected. Switching to games.', action: 'Calm Mode: ON' },
  { id: 'bored', label: 'Bored', icon: '😑', color: '#64748b', desc: 'Boredom detected. Injecting challenge.', action: 'Challenge Mode: ON' },
  { id: 'focused', label: 'Focused', icon: '🎯', color: '#0066ff', desc: 'Perfect focus. Optimal delivery.', action: 'Peak Mode: ON' },
  { id: 'fatigued', label: 'Fatigued', icon: '😴', color: '#a855f7', desc: 'Fatigue detected. Brain reset incoming.', action: 'Rest Mode: ON' },
];

const CONTENT_RESPONSES = {
  flow: { title: 'Advanced: Wave-Particle Duality', type: '🧪 Deep Dive Lab', color: '#10b981' },
  confused: { title: 'Analogy: Light is like ocean waves...', type: '💡 Simple Analogy', color: '#f59e0b' },
  anxious: { title: 'Quick Win: 5 easy questions', type: '🎮 Micro-Game', color: '#ef4444' },
  bored: { title: 'Mystery: Can light travel backwards?', type: '🔍 Mystery Challenge', color: '#64748b' },
  focused: { title: 'Quantum Mechanics: Schrödinger\'s cat', type: '⚡ Optimal Content', color: '#0066ff' },
  fatigued: { title: '2-min breathing exercise + micro-quiz', type: '🧘 Brain Reset', color: '#a855f7' },
};

function FaceGrid({ emotion }: { emotion: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 200;
    canvas.height = 200;

    const em = EMOTIONS.find(e => e.id === emotion) || EMOTIONS[0];
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, 200, 200);

      // Face outline
      ctx.beginPath();
      ctx.arc(100, 100, 70, 0, Math.PI * 2);
      ctx.strokeStyle = em.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = em.color;
      ctx.shadowBlur = 15 + 5 * Math.sin(t);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Mesh points (simplified face landmark dots)
      const meshPoints = [
        [100, 55], [70, 65], [130, 65], [80, 85], [120, 85],
        [100, 95], [75, 110], [125, 110], [100, 125], [85, 140], [115, 140],
        [90, 75], [110, 75], [88, 92], [112, 92],
      ];

      meshPoints.forEach(([x, y], i) => {
        const pulse = 0.7 + 0.3 * Math.sin(t * 2 + i * 0.5);
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = em.color;
        ctx.globalAlpha = pulse;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Connection lines
      [[0,1],[0,2],[1,3],[2,4],[3,5],[4,5],[5,7],[5,6],[6,8],[7,8],[8,9],[8,10]].forEach(([a, b]) => {
        const [x1, y1] = meshPoints[a];
        const [x2, y2] = meshPoints[b];
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = em.color + '40';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Eyes based on emotion
      if (emotion === 'bored' || emotion === 'fatigued') {
        // Half-closed eyes
        ctx.beginPath();
        ctx.ellipse(80, 85, 10, 5, 0, 0, Math.PI * 2);
        ctx.beginPath();
        ctx.ellipse(120, 85, 10, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = em.color + '80';
        ctx.fill();
      }

      // Scan line
      const scanY = (t * 30) % 200;
      const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      scanGrad.addColorStop(0, 'transparent');
      scanGrad.addColorStop(0.5, em.color + '60');
      scanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 2, 200, 4);

      t += 0.05;
      requestAnimationFrame(draw);
    };

    draw();
  }, [emotion]);

  return <canvas ref={canvasRef} style={{ width: 200, height: 200, borderRadius: '50%' }} />;
}

function NeuralNetwork({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 400;
    canvas.height = 200;

    const layers = [[3, 0.2], [5, 0.4], [5, 0.6], [4, 0.8], [2, 1.0]];
    const nodes: { x: number; y: number; active: boolean }[] = [];

    layers.forEach(([count, xRatio]) => {
      for (let i = 0; i < count; i++) {
        nodes.push({ x: xRatio * 400, y: (i + 1) * (200 / (count + 1)), active: Math.random() > 0.4 });
      }
    });

    let t = 0;
    const signals: { x: number; y: number; tx: number; ty: number; progress: number; color: string }[] = [];

    const addSignal = () => {
      if (active && Math.random() > 0.7) {
        const fromLayer = Math.floor(Math.random() * (layers.length - 1));
        const fromNodes = nodes.filter((_, i) => Math.floor(i / 5) === fromLayer);
        const toNodes = nodes.filter((_, i) => Math.floor(i / 5) === fromLayer + 1);
        if (fromNodes.length && toNodes.length) {
          const from = fromNodes[Math.floor(Math.random() * fromNodes.length)];
          const to = toNodes[Math.floor(Math.random() * toNodes.length)];
          signals.push({ x: from.x, y: from.y, tx: to.x, ty: to.y, progress: 0, color: '#00d4ff' });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, 400, 200);

      // Connections
      let ni = 0, nj = 0;
      layers.forEach(([countA], li) => {
        if (li >= layers.length - 1) return;
        const [countB] = layers[li + 1];
        for (let a = 0; a < countA; a++) {
          for (let b = 0; b < countB; b++) {
            const na = nodes[ni + a];
            const nb = nodes[ni + countA + b];
            ctx.beginPath();
            ctx.moveTo(na.x, na.y);
            ctx.lineTo(nb.x, nb.y);
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
        ni += countA;
      });

      // Nodes
      nodes.forEach((n, i) => {
        const pulse = 0.6 + 0.4 * Math.sin(t * 3 + i * 0.8);
        ctx.beginPath();
        ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = n.active ? `rgba(0,212,255,${pulse})` : 'rgba(255,255,255,0.2)';
        if (n.active) {
          ctx.shadowColor = '#00d4ff';
          ctx.shadowBlur = 10 * pulse;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Signals
      signals.forEach((s, i) => {
        s.progress += 0.03;
        const cx = s.x + (s.tx - s.x) * s.progress;
        const cy = s.y + (s.ty - s.y) * s.progress;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (s.progress >= 1) signals.splice(i, 1);
      });

      addSignal();
      t += 0.02;
      requestAnimationFrame(draw);
    };

    draw();
  }, [active]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: 200, borderRadius: 12 }} />;
}

export default function CognitivePage() {
  const [currentEmotion, setCurrentEmotion] = useState('flow');
  const [webcamActive, setWebcamActive] = useState(false);
  const [confidence, setConfidence] = useState(94);
  const [metrics, setMetrics] = useState({ attention: 87, engagement: 92, cognitiveLoad: 34, retention: 78 });
  const em = EMOTIONS.find(e => e.id === currentEmotion)!;
  const content = CONTENT_RESPONSES[currentEmotion as keyof typeof CONTENT_RESPONSES];

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        attention: Math.max(20, Math.min(100, prev.attention + (Math.random() - 0.5) * 5)),
        engagement: Math.max(20, Math.min(100, prev.engagement + (Math.random() - 0.5) * 4)),
        cognitiveLoad: Math.max(10, Math.min(90, prev.cognitiveLoad + (Math.random() - 0.5) * 6)),
        retention: Math.max(20, Math.min(100, prev.retention + (Math.random() - 0.5) * 3)),
      }));
      setConfidence(prev => Math.max(80, Math.min(99, prev + (Math.random() - 0.5) * 2)));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: 'var(--nexus-void)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(2,4,8,0.9)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#0066ff' }}>
          🧠 Cognitive State Engine
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: webcamActive ? '#10b981' : '#ef4444', animation: webcamActive ? 'pulse-slow 1s infinite' : 'none' }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{webcamActive ? 'Analyzing...' : 'Camera Off'}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>

        {/* Webcam + Face Analysis */}
        <div style={{ gridColumn: '1', padding: 28, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#00d4ff' }}>
            📷 Biometric Analysis
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, position: 'relative' }}>
            <div style={{
              width: 200, height: 200, borderRadius: '50%',
              border: `3px solid ${em.color}`,
              boxShadow: `0 0 30px ${em.color}50`,
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.5)',
            }}>
              {webcamActive ? (
                <FaceGrid emotion={currentEmotion} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>👤</div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Activate camera</span>
                </div>
              )}
            </div>
            {webcamActive && (
              <div style={{
                position: 'absolute', top: 0, right: '25%',
                padding: '4px 10px', borderRadius: 100,
                background: em.color + '20', border: `1px solid ${em.color}50`,
                fontSize: 11, fontWeight: 700, color: em.color,
              }}>
                {Math.round(confidence)}% confidence
              </div>
            )}
          </div>

          <button
            onClick={() => setWebcamActive(!webcamActive)}
            style={{
              width: '100%', padding: '12px',
              borderRadius: 10, border: 'none',
              background: webcamActive ? 'rgba(239,68,68,0.2)' : 'linear-gradient(135deg, #0066ff, #7c3aed)',
              color: webcamActive ? '#ef4444' : 'white',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Outfit',
            }}
          >
            {webcamActive ? '⏹ Stop Analysis' : '▶ Start Analysis'}
          </button>

          {webcamActive && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Attention', value: metrics.attention, color: '#0066ff' },
                  { label: 'Engagement', value: metrics.engagement, color: '#10b981' },
                  { label: 'Cognitive Load', value: metrics.cognitiveLoad, color: '#f59e0b' },
                  { label: 'Retention Est.', value: metrics.retention, color: '#a855f7' },
                ].map(m => (
                  <div key={m.label} style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{m.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: 'Space Grotesk' }}>
                      {Math.round(m.value)}%
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 6 }}>
                      <div style={{ height: '100%', background: m.color, borderRadius: 2, width: `${m.value}%`, transition: 'width 0.8s ease', boxShadow: `0 0 6px ${m.color}` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Emotion State Panel */}
        <div style={{ gridColumn: '2', padding: 28, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#a855f7' }}>
            😊 Detected Cognitive State
          </h2>

          {/* Current emotion display */}
          <div style={{
            padding: 24, borderRadius: 16, marginBottom: 20,
            background: em.color + '10',
            border: `1px solid ${em.color}30`,
            textAlign: 'center',
            transition: 'all 0.4s ease',
          }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>{em.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk', color: em.color, marginBottom: 4 }}>
              {em.label}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>{em.desc}</div>
            <div style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: 100,
              background: em.color + '20', border: `1px solid ${em.color}40`,
              fontSize: 12, fontWeight: 700, color: em.color,
            }}>
              ⚡ {em.action}
            </div>
          </div>

          {/* Manual override (for demo) */}
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
              Simulate Emotion (Demo)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {EMOTIONS.map(e => (
                <button
                  key={e.id}
                  onClick={() => setCurrentEmotion(e.id)}
                  style={{
                    padding: '8px 4px', borderRadius: 8,
                    border: `1px solid ${currentEmotion === e.id ? e.color : 'rgba(255,255,255,0.08)'}`,
                    background: currentEmotion === e.id ? e.color + '20' : 'transparent',
                    color: currentEmotion === e.id ? e.color : 'rgba(255,255,255,0.5)',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'Outfit',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {e.icon} {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Neural network visualization */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>Neural Processing</div>
            <NeuralNetwork active={webcamActive} />
          </div>
        </div>

        {/* Content Adapter */}
        <div style={{ gridColumn: '3', padding: 28, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#f59e0b' }}>
            ⚡ Content Auto-Adapter
          </h2>

          <div style={{
            padding: 20, borderRadius: 14, marginBottom: 16,
            background: content.color + '08',
            border: `1px solid ${content.color}20`,
            transition: 'all 0.4s ease',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: content.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              {content.type}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>{content.title}</div>
            <div style={{ height: 2, background: content.color + '30', borderRadius: 1, marginBottom: 12 }}>
              <div style={{ height: '100%', width: '0%', background: content.color, borderRadius: 1, animation: 'shimmer 1.5s linear forwards' }} />
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Adapting in real-time...</span>
          </div>

          {/* Adaptation history */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>Adaptation Log</div>
            {[
              { time: '2m ago', from: 'Confused', to: 'Analogy Mode', icon: '🔄' },
              { time: '5m ago', from: 'Flow State', to: 'Deep Dive', icon: '⬆️' },
              { time: '8m ago', from: 'Anxious', to: 'Calm Mode', icon: '🧘' },
              { time: '12m ago', from: 'Bored', to: 'Challenge', icon: '🎯' },
            ].map((log, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8, marginBottom: 6,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ fontSize: 16 }}>{log.icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{log.from}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 6px' }}>→</span>
                  <span style={{ fontSize: 12, color: '#00d4ff', fontWeight: 600 }}>{log.to}</span>
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{log.time}</span>
              </div>
            ))}
          </div>

          {/* Efficiency stats */}
          <div style={{ padding: 16, borderRadius: 12, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 12 }}>Session Efficiency</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[['40%', 'Faster learning'], ['2.3x', 'Better retention'], ['94%', 'Engagement']].map(([val, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981', fontFamily: 'Space Grotesk' }}>{val}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
