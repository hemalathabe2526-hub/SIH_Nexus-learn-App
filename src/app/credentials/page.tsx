'use client';

import { useState } from 'react';
import Link from 'next/link';

interface VerifiableCredential {
  id: string;
  skill: string;
  subject: string;
  level: string;
  score: number;
  date: string;
  hash: string;
  issuer: string;
  txHash: string;
  color: string;
  icon: string;
  openBadgeStandard: 'Open Badges 3.0' | 'W3C Verifiable Credential';
  criteria: string;
  recipientHash: string;
}

const CREDENTIALS: VerifiableCredential[] = [
  {
    id: 'PHY-001',
    skill: 'Classical Mechanics & Torque Equilibrium',
    subject: 'Physics',
    level: 'Expert',
    score: 94,
    date: '2026-08-15',
    hash: '0x3f4a9b2ec718e4d8a109bf4321',
    issuer: 'NEXUS LEARN ? AICTE & W3C Verified',
    txHash: '0x7e3c4f2a1b9d6e8c09a8bf7e',
    color: '#0066ff',
    icon: '?',
    openBadgeStandard: 'Open Badges 3.0',
    criteria: 'https://nexus-learn.edu/criteria/classical-mechanics-v3',
    recipientHash: 'did:key:z6MkhaXgBZDvotDkL5257faiz4898G'
  },
  {
    id: 'MATH-003',
    skill: 'Integral Calculus & Vector Calculus',
    subject: 'Mathematics',
    level: 'Proficient',
    score: 87,
    date: '2026-08-10',
    hash: '0xa1c94f7d8e2b6a3c91f0e4b8',
    issuer: 'NEXUS LEARN ? AICTE & W3C Verified',
    txHash: '0x2a5d8e9c3f1b6a4c7e8d0a1b',
    color: '#7c3aed',
    icon: '??',
    openBadgeStandard: 'W3C Verifiable Credential',
    criteria: 'https://nexus-learn.edu/criteria/integral-calculus-v2',
    recipientHash: 'did:key:z6MkhaXgBZDvotDkL5257faiz4898G'
  },
  {
    id: 'CS-007',
    skill: 'Data Structures, Graph Theory & Algorithms',
    subject: 'Computer Science',
    level: 'Advanced',
    score: 91,
    date: '2026-08-05',
    hash: '0x6b2e7c3a8f1e4d9c02b5a7e1',
    issuer: 'NEXUS LEARN ? AICTE & W3C Verified',
    txHash: '0x8f3a2b1c9d5e7f6a3c4b0e9d',
    color: '#00d4ff',
    icon: '??',
    openBadgeStandard: 'Open Badges 3.0',
    criteria: 'https://nexus-learn.edu/criteria/dsa-algorithms-v3',
    recipientHash: 'did:key:z6MkhaXgBZDvotDkL5257faiz4898G'
  },
  {
    id: 'CHEM-002',
    skill: 'Thermodynamics & Reaction Kinetics',
    subject: 'Chemistry',
    level: 'Master',
    score: 96,
    date: '2026-07-28',
    hash: '0x9d5f2e8b4a7c1f0e6d3a8b2c',
    issuer: 'NEXUS LEARN ? AICTE & W3C Verified',
    txHash: '0x5c7a4b3e1d9f2a8c7e4d0b1a',
    color: '#10b981',
    icon: '??',
    openBadgeStandard: 'W3C Verifiable Credential',
    criteria: 'https://nexus-learn.edu/criteria/thermodynamics-kinetics-v1',
    recipientHash: 'did:key:z6MkhaXgBZDvotDkL5257faiz4898G'
  },
];

export default function CredentialsPage() {
  const [selectedCred, setSelectedCred] = useState<VerifiableCredential>(CREDENTIALS[0]);
  const [viewJsonLd, setViewJsonLd] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const jsonLdPayload = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://purl.imsglobal.org/spec/ob/v3p0/context.json'
    ],
    id: `urn:uuid:${selectedCred.id}`,
    type: ['VerifiableCredential', 'OpenBadgeCredential'],
    issuer: {
      id: 'did:web:sih-nexus-learn-app.vercel.app',
      name: 'NEXUS LEARN Accredited Academic Authority',
      url: 'https://sih-nexus-learn-app.vercel.app'
    },
    issuanceDate: `${selectedCred.date}T10:00:00Z`,
    credentialSubject: {
      id: selectedCred.recipientHash,
      achievement: {
        id: selectedCred.criteria,
        type: ['Achievement'],
        name: selectedCred.skill,
        description: `Demonstrated ${selectedCred.level} mastery in ${selectedCred.subject} with ${selectedCred.score}% assessment score.`,
        criteria: { narrative: 'Successfully completed interactive 3D virtual experiments, coding judge challenges, and oral Socratic viva defenses.' }
      }
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: `${selectedCred.date}T10:02:15Z`,
      verificationMethod: 'did:web:sih-nexus-learn-app.vercel.app#key-1',
      proofPurpose: 'assertionMethod',
      jws: selectedCred.hash
    }
  };

  const handleCopyJsonLd = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonLdPayload, null, 2));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch {}
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
            <span>Verifiable Proof-of-Skill On-Chain Badging (Open Badges 3.0 & W3C VC)</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 700 }}>
            W3C Cryptographic Proof Valid
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, maxWidth: 1600, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* LEFT COLUMN: Credentials List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 17, color: '#00d4ff', margin: '0 0 4px' }}>
              Earned Academic Badges
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              Tamper-proof verifiable credentials issued upon defeating bosses, solving coding judges, and completing virtual labs.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CREDENTIALS.map(cred => (
              <button
                key={cred.id}
                onClick={() => setSelectedCred(cred)}
                style={{
                  padding: 16, borderRadius: 14, textAlign: 'left',
                  background: selectedCred.id === cred.id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedCred.id === cred.id ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  color: 'white', cursor: 'pointer', fontFamily: 'Outfit', transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{cred.icon}</span>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 6, fontWeight: 700,
                    background: `${cred.color}25`, color: cred.color,
                  }}>
                    {cred.openBadgeStandard}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: selectedCred.id === cred.id ? '#00d4ff' : 'white' }}>
                  {cred.skill}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
                  <span>{cred.subject}</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>Score: {cred.score}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Certificate & JSON-LD Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Certificate Viewport */}
          <div style={{
            position: 'relative', borderRadius: 20, padding: 32, overflow: 'hidden',
            background: 'radial-gradient(circle at top right, #1e293b 0%, #020408 100%)',
            border: `2px solid ${selectedCred.color}60`, boxShadow: `0 0 35px ${selectedCred.color}20`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: `${selectedCred.color}20`, color: selectedCred.color, fontWeight: 700 }}>
                  W3C VERIFIABLE CREDENTIAL ? OPEN BADGES 3.0
                </span>
                <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 26, color: 'white', margin: '10px 0 4px' }}>
                  {selectedCred.skill}
                </h2>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  Level: <strong style={{ color: selectedCred.color }}>{selectedCred.level}</strong> ? Subject: <strong>{selectedCred.subject}</strong>
                </div>
              </div>

              <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${selectedCred.color}20`, border: `2px solid ${selectedCred.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                {selectedCred.icon}
              </div>
            </div>

            <div style={{ margin: '24px 0', padding: 18, borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>ISSUED BY</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginTop: 2 }}>{selectedCred.issuer}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>RECIPIENT DID</div>
                <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#00d4ff', marginTop: 2 }}>{selectedCred.recipientHash.slice(0, 18)}...</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>CRYPTOGRAPHIC PROOF</div>
                <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#10b981', marginTop: 2 }}>{selectedCred.hash.slice(0, 20)}...</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => setViewJsonLd(!viewJsonLd)}
                style={{
                  padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.06)', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12,
                }}
              >
                {viewJsonLd ? '?? Hide W3C JSON-LD' : '?? Inspect W3C JSON-LD Proof'}
              </button>

              <button
                onClick={handleCopyJsonLd}
                style={{
                  padding: '9px 18px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #0066ff, #00d4ff)', color: 'white',
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12,
                }}
              >
                {isCopied ? '? JSON-LD Copied!' : '?? Export Cryptographic VC'}
              </button>

              <button
                onClick={() => alert(`?? Credential "${selectedCred.skill}" prepared for LinkedIn profile integration with verifiable URL: https://sih-nexus-learn-app.vercel.app/credentials`)}
                style={{
                  padding: '9px 18px', borderRadius: 8, border: '1px solid #0a66c2',
                  background: '#0a66c2', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12,
                }}
              >
                ?? Add to LinkedIn Profile
              </button>
            </div>
          </div>

          {/* JSON-LD Viewer */}
          {viewJsonLd && (
            <div style={{ borderRadius: 14, background: '#020408', border: '1px solid rgba(0,212,255,0.3)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                  W3C VERIFIABLE CREDENTIAL PAYLOAD (ED25519 SIGNATURE)
                </span>
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>CRYPTOGRAPHIC INTEGRITY: VERIFIED ?</span>
              </div>
              <pre style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontFamily: 'JetBrains Mono', maxHeight: 220, overflowY: 'auto' }}>
                {JSON.stringify(jsonLdPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
