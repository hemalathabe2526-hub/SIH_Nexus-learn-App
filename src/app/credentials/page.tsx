'use client';

import { useState } from 'react';
import Link from 'next/link';

const CREDENTIALS = [
  {
    id: 'PHY-001',
    skill: 'Classical Mechanics',
    subject: 'Physics',
    level: 'Expert',
    score: 94,
    date: '2026-08-15',
    hash: '0x3f4a...9b2e',
    issuer: 'NEXUS LEARN · AICTE Verified',
    txHash: '0x7e3c4f2a1b9d6e8c',
    color: '#0066ff',
    icon: '⚡',
  },
  {
    id: 'MATH-003',
    skill: 'Integral Calculus',
    subject: 'Mathematics',
    level: 'Proficient',
    score: 87,
    date: '2026-08-10',
    hash: '0xa1c9...4f7d',
    issuer: 'NEXUS LEARN · AICTE Verified',
    txHash: '0x2a5d8e9c3f1b6a4c',
    color: '#7c3aed',
    icon: '🌀',
  },
  {
    id: 'CS-007',
    skill: 'Data Structures & Algorithms',
    subject: 'Computer Science',
    level: 'Advanced',
    score: 91,
    date: '2026-08-05',
    hash: '0x6b2e...7c3a',
    issuer: 'NEXUS LEARN · AICTE Verified',
    txHash: '0x8f3a2b1c9d5e7f6a',
    color: '#00d4ff',
    icon: '💻',
  },
  {
    id: 'CHEM-002',
    skill: 'Organic Chemistry Fundamentals',
    subject: 'Chemistry',
    level: 'Intermediate',
    score: 78,
    date: '2026-07-28',
    hash: '0x9d5f...2e8b',
    issuer: 'NEXUS LEARN · AICTE Verified',
    txHash: '0x5c7a4b3e1d9f2a8c',
    color: '#10b981',
    icon: '⚗️',
  },
];

const LEVEL_COLORS: Record<string, string> = {
  Expert: '#f59e0b',
  Advanced: '#0066ff',
  Proficient: '#10b981',
  Intermediate: '#a855f7',
  Beginner: '#64748b',
};

function VerificationPulse({ verified }: { verified: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: verified ? '#10b981' : '#ef4444',
        boxShadow: `0 0 10px ${verified ? 'rgba(16,185,129,0.8)' : 'rgba(239,68,68,0.8)'}`,
        animation: 'pulse-slow 1.5s ease-in-out infinite',
      }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: verified ? '#10b981' : '#ef4444' }}>
        {verified ? 'Blockchain Verified' : 'Pending'}
      </span>
    </div>
  );
}

export default function CredentialsPage() {
  const [selected, setSelected] = useState(CREDENTIALS[0]);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(true);
  const [showQR, setShowQR] = useState(false);

  const handleVerify = () => {
    setVerifying(true);
    setVerified(false);
    setTimeout(() => { setVerifying(false); setVerified(true); }, 2500);
  };

  return (
    <div style={{ background: 'var(--nexus-void)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(249,115,22,0.2)', background: 'rgba(2,4,8,0.9)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#f97316' }}>
          🔗 Blockchain Skill Passport
        </h1>
        <VerificationPulse verified={verified} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>

        {/* Credentials list */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            Your Skill Credentials ({CREDENTIALS.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CREDENTIALS.map(c => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                style={{
                  padding: 16, borderRadius: 14, cursor: 'pointer',
                  background: selected.id === c.id ? `${c.color}10` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selected.id === c.id ? c.color + '50' : 'rgba(255,255,255,0.07)'}`,
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{c.skill}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{c.subject}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      padding: '3px 8px', borderRadius: 100,
                      background: (LEVEL_COLORS[c.level] || '#64748b') + '20',
                      color: LEVEL_COLORS[c.level] || '#64748b',
                      fontSize: 10, fontWeight: 700,
                    }}>
                      {c.level}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{c.date}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ height: 4, flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                    <div style={{ height: '100%', background: c.color, borderRadius: 2, width: `${c.score}%`, boxShadow: `0 0 6px ${c.color}` }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{c.score}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Blockchain info */}
          <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.15)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316', marginBottom: 12 }}>🔗 Polygon Network</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Network', 'Polygon Mainnet'],
                ['Protocol', 'EIP-1155 NFT'],
                ['Storage', 'IPFS Pinata'],
                ['Standard', 'Open Badges 3.0'],
                ['Recognizer', 'AICTE MIC'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{k}</span>
                  <span style={{ color: '#f97316', fontFamily: 'JetBrains Mono, monospace' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Credential Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Credential card */}
          <div style={{
            padding: 36, borderRadius: 24,
            background: `linear-gradient(135deg, ${selected.color}15 0%, rgba(0,0,0,0.6) 100%)`,
            border: `1px solid ${selected.color}40`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 0 60px ${selected.color}15`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Background pattern */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.04,
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 48 }}>{selected.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: selected.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                      Skill Credential · #{selected.id}
                    </div>
                    <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 28, color: 'white', marginBottom: 4 }}>
                      {selected.skill}
                    </h2>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{selected.subject}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                  <div style={{ padding: '6px 14px', borderRadius: 100, background: (LEVEL_COLORS[selected.level] || '') + '20', color: LEVEL_COLORS[selected.level], fontWeight: 700, fontSize: 13, border: `1px solid ${LEVEL_COLORS[selected.level] || '#fff'}40` }}>
                    {selected.level}
                  </div>
                  <div style={{ padding: '6px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    Score: {selected.score}/100
                  </div>
                  <div style={{ padding: '6px 14px', borderRadius: 100, background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: 13, border: '1px solid rgba(16,185,129,0.2)' }}>
                    ✓ AICTE Verified
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    ['Issued by', selected.issuer],
                    ['Issue Date', selected.date],
                    ['Blockchain Hash', selected.hash],
                    ['Transaction', selected.txHash],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{k}</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: k.includes('Hash') || k.includes('Trans') ? 'JetBrains Mono' : 'Outfit', wordBreak: 'break-all' }}>
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code area */}
              {showQR ? (
                <div style={{
                  width: 120, height: 120, borderRadius: 12, flexShrink: 0,
                  background: 'white', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {/* QR code placeholder - SVG grid */}
                  <svg width="100" height="100" viewBox="0 0 10 10">
                    {Array.from({ length: 100 }, (_, i) => {
                      const x = i % 10;
                      const y = Math.floor(i / 10);
                      const filled = Math.random() > 0.5;
                      return filled ? (
                        <rect key={i} x={x} y={y} width="1" height="1" fill="black" />
                      ) : null;
                    })}
                  </svg>
                </div>
              ) : (
                <button
                  onClick={() => setShowQR(true)}
                  style={{
                    width: 120, height: 120, borderRadius: 12, flexShrink: 0,
                    background: selected.color + '10', border: `2px dashed ${selected.color}50`,
                    color: selected.color, fontSize: 24, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <span>📱</span>
                  <span style={{ fontSize: 10, fontWeight: 700 }}>Show QR</span>
                </button>
              )}
            </div>
          </div>

          {/* Verification panel */}
          <div style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#10b981' }}>
              🔍 Verify on Blockchain
            </h3>

            {verifying ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 12, animation: 'rotate-slow 1s linear infinite', display: 'inline-block' }}>⛓️</div>
                <div style={{ color: '#00d4ff', fontWeight: 600, marginBottom: 8 }}>Querying Polygon Network...</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 300, margin: '0 auto' }}>
                  {['Connecting to node...', 'Fetching block data...', 'Verifying signature...'].map((step, i) => (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', animation: `pulse-slow ${1 + i * 0.3}s infinite` }} />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { icon: '🔒', label: 'Tamper Proof', status: 'Verified', color: '#10b981' },
                  { icon: '⛓️', label: 'On-Chain', status: 'Block #4829341', color: '#0066ff' },
                  { icon: '🏛️', label: 'AICTE Endorsed', status: 'Active', color: '#f59e0b' },
                ].map(v => (
                  <div key={v.label} style={{ padding: 16, borderRadius: 12, background: v.color + '08', border: `1px solid ${v.color}20`, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{v.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: v.color, marginBottom: 4 }}>{v.label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{v.status}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleVerify}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
              }}
            >
              🔍 Verify Now on Polygon
            </button>
          </div>

          {/* Employer portal hint */}
          <div style={{ padding: 20, borderRadius: 16, background: 'rgba(0,102,255,0.04)', border: '1px solid rgba(0,102,255,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0066ff', marginBottom: 4 }}>🏢 Share with Employers</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Employers can verify your skill passport instantly via QR scan or the verification portal.</div>
              </div>
              <button style={{
                padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(0,102,255,0.4)',
                background: 'rgba(0,102,255,0.1)', color: '#0066ff', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit', whiteSpace: 'nowrap',
              }}>
                Share Passport
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
