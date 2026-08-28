'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOfflineMode, setIsOfflineMode] = useState(true);
  const [p2pConnected, setP2pConnected] = useState(true);

  return (
    <div style={{ background: 'var(--nexus-void)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(6,182,212,0.2)', background: 'rgba(2,4,8,0.9)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#06b6d4' }}>
          🌐 Offline-First Edge AI Architecture
        </h1>
        <span style={{ fontSize: 12, color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '4px 12px', borderRadius: 100 }}>
          {isOfflineMode ? '📶 Offline Edge Mode Active' : '🌐 Cloud Mode Active'}
        </span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Local Edge AI Specs */}
        <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#06b6d4' }}>
            ⚡ On-Device Neural Engine (TF Lite)
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 20 }}>
            85% of NEXUS LEARN functionality — including emotion detection, spaced repetition algorithms, and quiz generation — runs completely offline without internet connectivity.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Local Model Size', val: '4.2 MB' },
              { label: 'Inference Latency', val: '12 ms' },
              { label: 'Cached Chapters', val: '24 Modules' },
              { label: 'RAM Footprint', val: '< 85 MB' },
            ].map(item => (
              <div key={item.label} style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#06b6d4', fontFamily: 'Space Grotesk' }}>{item.val}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: isOfflineMode ? 'linear-gradient(135deg, #06b6d4, #0066ff)' : 'rgba(255,255,255,0.1)',
              color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit'
            }}
          >
            {isOfflineMode ? '⚡ Toggle Cloud Sync Mode' : '📶 Toggle Zero-Net Edge Mode'}
          </button>
        </div>

        {/* P2P Mesh Sync */}
        <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#10b981' }}>
            📡 Peer-to-Peer Bluetooth Mesh Sharing
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 20 }}>
            Students in remote villages can share downloaded textbook modules, notes, and micro-quizzes with classmates using Bluetooth/Wi-Fi Direct without needing cell towers.
          </p>

          <div style={{ padding: 16, borderRadius: 14, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>📲</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>2 Nearby Classmates Found</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Rohan (12m away) · Sneha (8m away)</div>
              </div>
            </div>
            <button style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>
              📡 Share Physics Chapter via P2P Mesh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
