'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SWARM_CLUSTERS = [
  { id: 1, topic: 'Diffraction of Light', count: 48, status: 'Active Resolution', confidence: 92, leader: 'Kavya S.', timeRemaining: '1m 20s' },
  { id: 2, topic: 'Integration by Parts', count: 32, status: 'Peer Video Deploying', confidence: 88, leader: 'Rahul M.', timeRemaining: '45s' },
  { id: 3, topic: 'Organic Reaction Mechanisms', count: 64, status: 'Clustering Confusion', confidence: 79, leader: 'Searching Peer...', timeRemaining: '2m 10s' },
];

const LIVE_FEEDS = [
  { student: 'Aarav P.', subject: 'Physics', concept: 'Huygens Principle', action: 'Shared 45s explanation video', upvotes: 34, icon: '📹' },
  { student: 'Ananya G.', subject: 'Math', concept: 'Chain Rule', action: 'Solved edge-case confusion query', upvotes: 52, icon: '💡' },
  { student: 'Vikram R.', subject: 'CS', concept: 'Graph Traversal', action: 'Submitted visual diagram helper', upvotes: 29, icon: '🎨' },
];

export default function SwarmPage() {
  const [pulseCount, setPulseCount] = useState(1420);
  const [activeTab, setActiveTab] = useState<'clusters' | 'video' | 'graph'>('clusters');

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount(prev => prev + Math.floor(Math.random() * 3));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: 'var(--nexus-void)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(16,185,129,0.2)', background: 'rgba(2,4,8,0.9)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#10b981' }}>
          🤝 Swarm Intelligence Engine
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-slow 1s infinite' }} />
          <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>{pulseCount.toLocaleString()} Active Learners Swarming</span>
        </div>
      </div>

      <div style={{ maxWidth: 1250, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Main Swarm Visualizer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Banner */}
          <div style={{
            padding: 28, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,0,0,0.6))',
            border: '1px solid rgba(16,185,129,0.25)', backdropFilter: 'blur(20px)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
              Emergent Collective Intelligence
            </div>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 26, marginBottom: 8, color: 'white' }}>
              Real-Time Peer Confusion Resolution
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 650 }}>
              When 50+ students face identical roadblocks simultaneously, the Swarm Engine detects the pattern, pairs them with top-performing peers, and compiles micro-explanations within seconds.
            </p>
          </div>

          {/* Active Confusion Clusters */}
          <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#00d4ff' }}>
              🔥 Live Swarm Clusters
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {SWARM_CLUSTERS.map(c => (
                <div key={c.id} style={{
                  padding: 18, borderRadius: 14, background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: 'rgba(16,185,129,0.15)',
                    border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, color: '#10b981', fontWeight: 800, fontFamily: 'Space Grotesk'
                  }}>
                    {c.count}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{c.topic}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700,
                        background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)'
                      }}>
                        {c.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                      Peer Leader: <strong style={{ color: '#10b981' }}>{c.leader}</strong> · AI Confidence: {c.confidence}%
                    </div>
                  </div>
                  <button style={{
                    padding: '8px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit'
                  }}>
                    Join Swarm →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Peer Auto-Compiled Video Preview */}
          <div style={{ padding: 24, borderRadius: 20, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, color: '#a855f7' }}>
                🎥 Auto-Compiled Peer Breakdown (45 sec)
              </h3>
              <span style={{ fontSize: 11, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: 100 }}>
                ⚡ Auto-synthesized by Gemini
              </span>
            </div>

            <div style={{
              height: 220, borderRadius: 14, background: 'linear-gradient(135deg, #0a1628, #060d1a)',
              border: '1px solid rgba(168,85,247,0.3)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ fontSize: 48, marginBottom: 12, cursor: 'pointer' }}>▶️</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Diffraction & Interference Explained by Peers</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Snippet source: Aarav P. (IIT B) & Priya S. (NIT T)</div>

              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
                background: 'linear-gradient(90deg, #10b981, #00d4ff)', width: '65%'
              }} />
            </div>
          </div>
        </div>

        {/* Sidebar Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ padding: 20, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#f59e0b' }}>
              📡 Live Peer Contribution Stream
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LIVE_FEEDS.map((item, i) => (
                <div key={i} style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#00d4ff' }}>{item.student}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>{item.subject}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>{item.action}</div>
                  <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>👍 {item.upvotes} Peer Upvotes</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 20, borderRadius: 16, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>💡 Swarm Impact Metric</h4>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              Concepts resolved through Swarm Intelligence show a <strong>3.4x faster resolution time</strong> compared to standard Q&A forums.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
