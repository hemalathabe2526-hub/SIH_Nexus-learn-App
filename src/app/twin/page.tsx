'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const KNOWLEDGE_MAP = [
  { subject: 'Physics', mastery: 78, decay: 12, topics: 24, mastered: 18, color: '#0066ff', icon: '⚡', nextReview: '2h', trend: '+5%' },
  { subject: 'Mathematics', mastery: 91, decay: 3, topics: 30, mastered: 27, color: '#7c3aed', icon: '🌀', nextReview: '1d', trend: '+2%' },
  { subject: 'Chemistry', mastery: 54, decay: 28, topics: 20, mastered: 11, color: '#10b981', icon: '⚗️', nextReview: '30m', trend: '-8%' },
  { subject: 'Computer Science', mastery: 85, decay: 7, topics: 18, mastered: 15, color: '#00d4ff', icon: '💻', nextReview: '3h', trend: '+12%' },
  { subject: 'History', mastery: 42, decay: 35, topics: 15, mastered: 6, color: '#ec4899', icon: '📜', nextReview: '15m', trend: '-15%' },
  { subject: 'Biology', mastery: 67, decay: 18, topics: 22, mastered: 15, color: '#f59e0b', icon: '🧬', nextReview: '6h', trend: '+3%' },
];

const LEARNING_SESSIONS = [
  { date: 'Today', time: '9:00-10:30 AM', subject: 'Physics', score: 94, concepts: 3 },
  { date: 'Today', time: '2:00-3:00 PM', subject: 'Math', score: 87, concepts: 2 },
  { date: 'Yesterday', time: '6:00-7:30 PM', subject: 'CS', score: 91, concepts: 4 },
  { date: 'Yesterday', time: '8:00-8:30 PM', subject: 'Chemistry', score: 62, concepts: 1 },
  { date: '2 days ago', time: '4:00-5:00 PM', subject: 'History', score: 45, concepts: 2 },
];

const OPTIMAL_TIMES = [
  { hour: '6-8 AM', score: 45, label: 'Morning' },
  { hour: '9-11 AM', score: 92, label: 'Peak ⭐' },
  { hour: '12-2 PM', score: 58, label: 'After Lunch' },
  { hour: '3-5 PM', score: 78, label: 'Afternoon' },
  { hour: '6-8 PM', score: 85, label: 'Evening' },
  { hour: '9-11 PM', score: 42, label: 'Night' },
];

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, flex: 1 }}>
      <div style={{
        height: '100%', background: color, borderRadius: 2,
        width: `${(value / max) * 100}%`,
        boxShadow: `0 0 6px ${color}70`,
        transition: 'width 0.8s ease',
      }} />
    </div>
  );
}

export default function TwinPage() {
  const [selectedSubject, setSelectedSubject] = useState(KNOWLEDGE_MAP[0]);
  const [decayWarning, setDecayWarning] = useState(true);
  const [overallScore, setOverallScore] = useState(70);

  useEffect(() => {
    const interval = setInterval(() => {
      setOverallScore(prev => Math.max(65, Math.min(85, prev + (Math.random() - 0.5) * 2)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: 'var(--nexus-void)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,212,255,0.2)', background: 'rgba(2,4,8,0.9)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#00d4ff' }}>
          🧬 Digital Twin Learner
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4ff', animation: 'pulse-slow 2s infinite' }} />
          <span style={{ fontSize: 13, color: '#00d4ff', fontWeight: 600 }}>Live Knowledge Model</span>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

        {/* Overall Knowledge State */}
        <div style={{ gridColumn: '1 / 4', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 4 }}>
          {[
            { label: 'Overall Knowledge Score', value: `${Math.round(overallScore)}%`, icon: '🧠', color: '#00d4ff', sub: 'Live estimate' },
            { label: 'Concepts Mastered', value: '92 / 129', icon: '✅', color: '#10b981', sub: '71.3% complete' },
            { label: 'Concepts Decaying', value: '14', icon: '⏳', color: '#f59e0b', sub: 'Need review soon' },
            { label: 'Learning Velocity', value: '+3.2/day', icon: '🚀', color: '#a855f7', sub: 'concepts mastered' },
          ].map(m => (
            <div key={m.label} className="metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{m.icon}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{m.sub}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Space Grotesk', color: m.color, marginBottom: 4 }}>{m.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Decay Warning */}
        {decayWarning && (
          <div style={{
            gridColumn: '1 / 4',
            padding: '14px 20px', borderRadius: 12,
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>⏰</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>Knowledge Decay Alert</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                You haven&apos;t practiced Organic Chemistry in 12 days. <strong style={{ color: '#f59e0b' }}>34% estimated decay.</strong> 5-minute rescue session ready!
              </div>
            </div>
            <button
              style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 8, background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', whiteSpace: 'nowrap' }}
              onClick={() => setDecayWarning(false)}
            >
              🔥 Start 5-min Rescue
            </button>
          </div>
        )}

        {/* Subject knowledge map */}
        <div style={{ gridColumn: '1 / 3', padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#00d4ff' }}>
            🗺️ Knowledge State Map
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {KNOWLEDGE_MAP.map(s => (
              <div
                key={s.subject}
                onClick={() => setSelectedSubject(s)}
                style={{
                  padding: 16, borderRadius: 14, cursor: 'pointer',
                  background: selectedSubject.subject === s.subject ? `${s.color}08` : 'rgba(255,255,255,0.01)',
                  border: `1px solid ${selectedSubject.subject === s.subject ? s.color + '40' : 'rgba(255,255,255,0.05)'}`,
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{s.subject}</span>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: s.trend.startsWith('+') ? '#10b981' : '#ef4444', fontWeight: 600 }}>{s.trend}</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: 'Space Grotesk' }}>{s.mastery}%</span>
                      </div>
                    </div>
                    <MiniBar value={s.mastery} max={100} color={s.color} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      <span>{s.mastered}/{s.topics} concepts mastered</span>
                      <span style={{ color: s.decay > 20 ? '#f59e0b' : 'rgba(255,255,255,0.3)' }}>
                        {s.decay > 0 ? `⏳ ${s.decay}% decaying` : '✅ Fresh'} · Review: {s.nextReview}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ gridColumn: '3', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Optimal learning times */}
          <div style={{ padding: 20, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#f59e0b' }}>
              ⏰ Your Optimal Learning Windows
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {OPTIMAL_TIMES.map(t => (
                <div key={t.hour} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 55, flexShrink: 0 }}>{t.hour}</span>
                  <MiniBar value={t.score} max={100} color={t.score >= 85 ? '#10b981' : t.score >= 65 ? '#f59e0b' : '#64748b'} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.score >= 85 ? '#10b981' : 'rgba(255,255,255,0.4)', width: 70 }}>{t.label}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: 12, color: '#10b981' }}>
              🌟 Your peak: 9-11 AM · Schedule Physics now!
            </div>
          </div>

          {/* Recent sessions */}
          <div style={{ padding: 20, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#a855f7' }}>
              📅 Learning History
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LEARNING_SESSIONS.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{s.subject}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.date} · {s.time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Space Grotesk', color: s.score >= 80 ? '#10b981' : s.score >= 60 ? '#f59e0b' : '#ef4444' }}>
                      {s.score}%
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>+{s.concepts} concepts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction engine */}
          <div style={{ padding: 20, borderRadius: 16, background: 'rgba(0,102,255,0.04)', border: '1px solid rgba(0,102,255,0.15)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0066ff', marginBottom: 12 }}>🔮 AI Predictions</h3>
            {[
              { text: 'JEE ready in 47 days at current pace', icon: '🎯', color: '#10b981' },
              { text: 'Chemistry needs 2x attention this week', icon: '⚠️', color: '#f59e0b' },
              { text: 'Physics mastery: 95% by month end', icon: '📈', color: '#0066ff' },
            ].map(p => (
              <div key={p.text} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 12, color: 'rgba(255,255,255,0.7)', alignItems: 'flex-start' }}>
                <span>{p.icon}</span>
                <span style={{ color: p.color }}>{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
