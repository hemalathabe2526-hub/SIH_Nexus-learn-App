'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cpu, Wifi, WifiOff, PhoneCall, ArrowLeft, HardDrive, Sparkles, Code, Calculator, BookOpen, Zap } from 'lucide-react';

export default function OfflineEdgeAIPage() {
  const [isAirplaneMode, setIsAirplaneMode] = useState(true);
  const [edgeQuery, setEdgeQuery] = useState('');
  const [activeTask, setActiveTask] = useState<'concept' | 'lint' | 'formula'>('concept');
  const [edgeResult, setEdgeResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate on-device WebGPU Small Language Model inference (SmolLM2-1B / Gemma-2B quantized)
  const runEdgeAiInference = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (activeTask === 'concept') {
        setEdgeResult(
          '[Edge AI Engine: SmolLM2-1B (WebGPU Local Memory)]\n\n' +
          'Refraction occurs because light travels at different speeds in different optical media. ' +
          'In water, the wave phase velocity drops to v = c / n (where n ≈ 1.33). ' +
          'When the wavefront strikes the interface at an angle, one side slows down before the other, bending the trajectory toward the normal according to Snell\'s Law (n1 sin θ1 = n2 sin θ2).\n\n' +
          '• Execution Time: 42 ms\n' +
          '• Network Bytes Transferred: 0 Bytes (100% Offline On-Device Inference)'
        );
      } else if (activeTask === 'lint') {
        setEdgeResult(
          '[Edge AI Code Linter: On-Device AST Analyzer]\n\n' +
          'Checked input against local DSA grammar tree:\n' +
          '• Syntax: Valid Python 3.11\n' +
          '• Warning: Recursive function call lacks base case depth limiter. In an offline environment with limited stack memory, recommend converting to iterative loop to prevent maximum recursion depth exceeded.'
        );
      } else {
        setEdgeResult(
          '[Edge AI Formula Solver: Local SymPy/Numeric Engine]\n\n' +
          'Input: E = mc² for m = 1.0 kg\n' +
          'Calculation: E = (1.0 kg) × (2.998 × 10⁸ m/s)² = 8.98755 × 10¹⁶ Joules\n' +
          'Equivalent Energy: ~21.48 Megatons of TNT explosive equivalent.'
        );
      }
    }, 450);
  };

  return (
    <div style={{ background: 'var(--nexus-void, #020408)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
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
            <Cpu size={18} color="#00d4ff" />
            <span>Offline Edge AI & Zero-Data Learning Hub</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/mesh" style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', textDecoration: 'none', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Wifi size={14} />
            <span>Village Mesh Swarm</span>
          </Link>
          <Link href="/dial-in" style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', textDecoration: 'none', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <PhoneCall size={14} />
            <span>1800 Toll-Free Call</span>
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 18, maxWidth: 1600, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* LEFT COLUMN: On-Device Edge AI Playground */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Offline Status Card */}
          <div style={{ padding: 18, borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <WifiOff size={24} color="#ef4444" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#ef4444' }}>Airplane Mode / Zero Cellular Signal Simulation</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Cloud APIs disabled. Routing all intelligence to on-device WebGPU Small Language Model.</div>
              </div>
            </div>
            <button
              onClick={() => setIsAirplaneMode(!isAirplaneMode)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: isAirplaneMode ? '#ef4444' : '#10b981', color: '#fff',
                fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit',
              }}
            >
              {isAirplaneMode ? 'AIRPLANE MODE ACTIVE' : 'CELLULAR CONNECTED'}
            </button>
          </div>

          {/* Edge AI Tasks */}
          <div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#00d4ff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} />
                <span>On-Device Small Language Model (SmolLM2 / Gemma-2B)</span>
              </h3>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(0,212,255,0.15)', color: '#00d4ff', fontWeight: 700 }}>
                WebGPU Accelerated • 0 MB Data
              </span>
            </div>

            {/* Task Tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'concept', label: 'Concept Explanation', icon: BookOpen },
                { id: 'lint', label: 'Offline Code Audit', icon: Code },
                { id: 'formula', label: 'Formula Solver', icon: Calculator },
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTask(t.id as any);
                      setEdgeResult(null);
                    }}
                    style={{
                      padding: '8px 14px', borderRadius: 8, border: 'none',
                      background: activeTask === t.id ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.04)',
                      color: activeTask === t.id ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Icon size={14} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={edgeQuery}
                onChange={e => setEdgeQuery(e.target.value)}
                placeholder="Ask an educational question while completely offline..."
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 10, background: '#020408',
                  border: '1px solid rgba(0,212,255,0.3)', color: 'white', fontSize: 13,
                  fontFamily: 'Outfit', outline: 'none',
                }}
              />
              <button
                onClick={runEdgeAiInference}
                disabled={isProcessing}
                style={{
                  padding: '12px 24px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #00d4ff)', color: 'white',
                  fontWeight: 700, fontSize: 13, cursor: isProcessing ? 'wait' : 'pointer', fontFamily: 'Outfit',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <Sparkles size={14} />
                <span>{isProcessing ? 'Inferencing...' : 'Run On-Device AI'}</span>
              </button>
            </div>

            {/* Output */}
            {edgeResult && (
              <div style={{ padding: 16, borderRadius: 12, background: '#020408', border: '1px solid rgba(16,185,129,0.3)' }}>
                <pre style={{ margin: 0, fontSize: 12, color: '#e2e8f0', fontFamily: 'JetBrains Mono', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {edgeResult}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Offline Cache Stats & Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 18 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#10b981', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HardDrive size={18} color="#10b981" />
            <span>Local IndexedDB Offline Storage</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { title: 'Offline Formula Flashcards', size: '2.4 MB', items: '180 Physics & Math cards' },
              { title: 'Pre-Cached 3D Virtual Labs', size: '18.6 MB', items: 'Optics, Pendulum, Circuits' },
              { title: 'Regional Language Dictionaries', size: '4.1 MB', items: 'Hindi, Tamil, Telugu STEM terms' },
            ].map((c, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 13 }}>
                  <span>{c.title}</span>
                  <span style={{ color: '#00d4ff' }}>{c.size}</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{c.items}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            <strong style={{ color: '#10b981' }}>Zero-Cloud Independence:</strong> Eliminates recurring API token costs. Rural students can learn indefinitely without paying for mobile recharges.
          </div>
        </div>

      </div>
    </div>
  );
}
