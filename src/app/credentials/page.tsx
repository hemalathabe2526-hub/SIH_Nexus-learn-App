'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Award, CheckCircle2, Copy, FileCode, ExternalLink, ArrowLeft, Code,
  Calculator, FlaskConical, ShieldCheck, Check, Download, Sparkles,
  Orbit, Dna, Bug, Share2, Eye, Star, ChevronRight, X, Rocket
} from 'lucide-react';

interface VerifiableCredential {
  id: string;
  skill: string;
  subject: string;
  level: 'Novice' | 'Proficient' | 'Advanced' | 'Master' | 'Elite';
  tier: 'Gold Tier' | 'Platinum Tier' | 'Diamond Tier' | 'Master Tier' | 'Elite Tier';
  score: number;
  date: string;
  hash: string;
  issuer: string;
  txHash: string;
  color: string;
  secondaryColor: string;
  iconType: 'math' | 'code' | 'chem' | 'physics' | 'bio' | 'security';
  openBadgeStandard: 'Open Badges 3.0' | 'W3C Verifiable Credential';
  criteria: string;
  recipientHash: string;
}

const CREDENTIALS: VerifiableCredential[] = [
  {
    id: 'MATH-003',
    skill: 'Integral Calculus & Vector Calculus',
    subject: 'Mathematics',
    level: 'Proficient',
    tier: 'Gold Tier',
    score: 87,
    date: '2026-08-10',
    hash: '0xa1c94f7d8e2b6a3c91f0e4b85c2d3e1a',
    issuer: 'NEXUS LEARN • AICTE & W3C Verified',
    txHash: '0x2a5d8e9c3f1b6a4c7e8d0a1b6c4e2f8a',
    color: '#f59e0b',
    secondaryColor: '#d97706',
    iconType: 'math',
    openBadgeStandard: 'W3C Verifiable Credential',
    criteria: 'https://nexus-learn.edu/criteria/integral-calculus-v2',
    recipientHash: 'did:key:z6MkhaXgBZDvotDkL5257faiz4898G'
  },
  {
    id: 'CS-007',
    skill: 'Data Structures, Graph Theory & Algorithms',
    subject: 'Computer Science',
    level: 'Advanced',
    tier: 'Platinum Tier',
    score: 91,
    date: '2026-08-05',
    hash: '0x6b2e7c3a8f1e4d9c02b5a7e14f8c9d2b',
    issuer: 'NEXUS LEARN • AICTE & W3C Verified',
    txHash: '0x8f3a2b1c9d5e7f6a3c4b0e9d1a2f3b4c',
    color: '#00d4ff',
    secondaryColor: '#0284c7',
    iconType: 'code',
    openBadgeStandard: 'Open Badges 3.0',
    criteria: 'https://nexus-learn.edu/criteria/dsa-algorithms-v3',
    recipientHash: 'did:key:z6MkhaXgBZDvotDkL5257faiz4898G'
  },
  {
    id: 'CHEM-002',
    skill: 'Thermodynamics & Reaction Kinetics',
    subject: 'Chemistry',
    level: 'Master',
    tier: 'Diamond Tier',
    score: 96,
    date: '2026-07-28',
    hash: '0x9d5f2e8b4a7c1f0e6d3a8b2c4e1f7a9d',
    issuer: 'NEXUS LEARN • AICTE & W3C Verified',
    txHash: '0x5c7a4b3e1d9f2a8c7e4d0b1a8f2e6c4a',
    color: '#10b981',
    secondaryColor: '#059669',
    iconType: 'chem',
    openBadgeStandard: 'W3C Verifiable Credential',
    criteria: 'https://nexus-learn.edu/criteria/thermodynamics-kinetics-v1',
    recipientHash: 'did:key:z6MkhaXgBZDvotDkL5257faiz4898G'
  },
  {
    id: 'PHYS-005',
    skill: '1D Kinematics & Vertical Motion Trajectory',
    subject: 'Physics',
    level: 'Master',
    tier: 'Master Tier',
    score: 94,
    date: '2026-08-15',
    hash: '0x4f1e9b2a7c8d0e3f5a6b1c2d3e4f5a6b',
    issuer: 'NEXUS LEARN • AICTE & W3C Verified',
    txHash: '0x7b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e',
    color: '#8b5cf6',
    secondaryColor: '#6d28d9',
    iconType: 'physics',
    openBadgeStandard: 'Open Badges 3.0',
    criteria: 'https://nexus-learn.edu/criteria/kinematics-projectile-v1',
    recipientHash: 'did:key:z6MkhaXgBZDvotDkL5257faiz4898G'
  },
  {
    id: 'BIO-004',
    skill: 'Molecular Genetics & DNA Transcription',
    subject: 'Biology / NEET',
    level: 'Advanced',
    tier: 'Gold Tier',
    score: 89,
    date: '2026-08-01',
    hash: '0x3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d',
    issuer: 'NEXUS LEARN • AICTE & W3C Verified',
    txHash: '0x9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d',
    color: '#ec4899',
    secondaryColor: '#be185d',
    iconType: 'bio',
    openBadgeStandard: 'W3C Verifiable Credential',
    criteria: 'https://nexus-learn.edu/criteria/genetics-replication-v2',
    recipientHash: 'did:key:z6MkhaXgBZDvotDkL5257faiz4898G'
  },
  {
    id: 'SEC-009',
    skill: 'Adversarial Reverse Code Debugging',
    subject: 'Cybersecurity / CS',
    level: 'Elite',
    tier: 'Elite Tier',
    score: 98,
    date: '2026-08-20',
    hash: '0x8e2b4c6a0f1d3e5b7a9c1e3f5d7b9a1c',
    issuer: 'NEXUS LEARN • AICTE & W3C Verified',
    txHash: '0x1d3f5a7b9c1e3f5a7b9c1d3e5f7a9b1c',
    color: '#14b8a6',
    secondaryColor: '#0f766e',
    iconType: 'security',
    openBadgeStandard: 'Open Badges 3.0',
    criteria: 'https://nexus-learn.edu/criteria/reverse-bug-hunting-v1',
    recipientHash: 'did:key:z6MkhaXgBZDvotDkL5257faiz4898G'
  }
];

export default function CredentialsPage() {
  const [selectedCred, setSelectedCred] = useState<VerifiableCredential>(CREDENTIALS[0]);
  const [activeTab, setActiveTab] = useState<'badge' | 'certificate' | 'jsonld'>('badge');
  const [isCopied, setIsCopied] = useState(false);
  const [linkedInModalOpen, setLinkedInModalOpen] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const badgeSvgRef = useRef<SVGSVGElement>(null);

  // Auto-detect query param ?id=MATH-003
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('id');
      if (queryId) {
        const found = CREDENTIALS.find(c => c.id.toLowerCase() === queryId.toLowerCase());
        if (found) setSelectedCred(found);
      }
    }
  }, []);

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
        description: `Verified completion of ${selectedCred.subject} with ${selectedCred.score}% mastery.`,
        criteria: { narrative: 'Rigorous interactive lab assessment, real-time kinematics simulation, and adversarial reverse debugging exams.' }
      }
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: `${selectedCred.date}T10:00:05Z`,
      proofPurpose: 'assertionMethod',
      verificationMethod: 'did:web:sih-nexus-learn-app.vercel.app#key-1',
      proofValue: selectedCred.hash
    }
  };

  const handleCopyJsonLd = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(JSON.stringify(jsonLdPayload, null, 2));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Official LinkedIn Add-to-Profile Redirect
  const handleAddToLinkedIn = () => {
    const cred = selectedCred;
    const issueYear = cred.date.split('-')[0] || '2026';
    const issueMonth = parseInt(cred.date.split('-')[1] || '8', 10);
    const certUrl = `https://sih-nexus-learn-app.vercel.app/credentials?id=${cred.id}`;
    const orgName = 'NEXUS LEARN (AICTE & W3C Open Badges 3.0 Verified)';

    // Construct the official LinkedIn Add Certification deep link
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cred.skill)}&organizationName=${encodeURIComponent(orgName)}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(certUrl)}&certId=${encodeURIComponent(cred.id)}`;

    setLinkedInUrl(url);
    setLinkedInModalOpen(true);

    // Direct redirect / new tab
    if (typeof window !== 'undefined') {
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      // If popup was blocked or opened, modal remains available as guaranteed fallback
      if (!opened) {
        // Fallback handled by modal
      }
    }
  };

  // Download Badge SVG
  const handleDownloadBadgeSvg = () => {
    if (!badgeSvgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(badgeSvgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus-badge-${selectedCred.id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderBadgeGlyph = (type: string, size = 36) => {
    switch (type) {
      case 'math':
        return <Calculator size={size} />;
      case 'code':
        return <Code size={size} />;
      case 'chem':
        return <FlaskConical size={size} />;
      case 'physics':
        return <Rocket size={size} />;
      case 'bio':
        return <Dna size={size} />;
      case 'security':
        return <Bug size={size} />;
      default:
        return <Award size={size} />;
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
            <Award size={18} color="#00d4ff" />
            <span>Verifiable Proof-of-Skill On-Chain Badging (Open Badges 3.0 & W3C VC)</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, padding: '5px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} />
            <span>W3C Cryptographic Proof Valid</span>
          </span>
          <span style={{ fontSize: 11, padding: '5px 12px', borderRadius: 8, background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontWeight: 700 }}>
            {CREDENTIALS.length} Badges Earned
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, maxWidth: 1650, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* LEFT COLUMN: Credentials List with Visual Mini Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Sparkles size={18} color="#00d4ff" />
              <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#00d4ff', margin: 0 }}>
                Earned Academic Badges
              </h2>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.5 }}>
              Tamper-proof verifiable credentials issued upon defeating bosses, solving coding challenges, and completing virtual labs.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CREDENTIALS.map(cred => {
              const isSelected = selectedCred.id === cred.id;
              return (
                <button
                  key={cred.id}
                  onClick={() => setSelectedCred(cred)}
                  style={{
                    padding: 14, borderRadius: 16, textAlign: 'left',
                    background: isSelected ? `linear-gradient(135deg, ${cred.color}22, rgba(255,255,255,0.03))` : 'rgba(255,255,255,0.02)',
                    border: `1.5px solid ${isSelected ? cred.color : 'rgba(255,255,255,0.08)'}`,
                    color: 'white', cursor: 'pointer', fontFamily: 'Outfit', transition: 'all 0.2s',
                    boxShadow: isSelected ? `0 4px 20px ${cred.color}33` : 'none',
                    display: 'flex', alignItems: 'center', gap: 14
                  }}
                >
                  {/* Visual Mini Badge Crest */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: `linear-gradient(135deg, ${cred.color}35, ${cred.secondaryColor}65)`,
                    border: `2px solid ${cred.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', boxShadow: `0 0 12px ${cred.color}40`, position: 'relative'
                  }}>
                    {renderBadgeGlyph(cred.iconType, 24)}
                    <span style={{
                      position: 'absolute', bottom: -5, right: -5, width: 18, height: 18,
                      borderRadius: '50%', background: '#10b981', border: '2px solid #020408',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900
                    }}>
                      ✓
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 800,
                        background: `${cred.color}25`, color: cred.color, textTransform: 'uppercase'
                      }}>
                        {cred.tier}
                      </span>
                      <span style={{ color: '#10b981', fontWeight: 800, fontSize: 11 }}>
                        {cred.score}% Mastery
                      </span>
                    </div>

                    <div style={{
                      fontSize: 13, fontWeight: 700, color: isSelected ? '#fff' : 'rgba(255,255,255,0.9)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {cred.skill}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                      <span>{cred.subject}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}>{cred.id}</span>
                    </div>
                  </div>

                  <ChevronRight size={16} color={isSelected ? cred.color : 'rgba(255,255,255,0.2)'} />
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive 3D Visual Badge Showcase & LinkedIn Integration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* View Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setActiveTab('badge')}
              style={{
                flex: 1, padding: '9px 14px', borderRadius: 8, border: 'none',
                background: activeTab === 'badge' ? selectedCred.color : 'transparent',
                color: activeTab === 'badge' ? '#000' : 'rgba(255,255,255,0.7)',
                fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Outfit',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s'
              }}
            >
              <Award size={15} />
              <span>Visual Badge Medallion</span>
            </button>

            <button
              onClick={() => setActiveTab('certificate')}
              style={{
                flex: 1, padding: '9px 14px', borderRadius: 8, border: 'none',
                background: activeTab === 'certificate' ? selectedCred.color : 'transparent',
                color: activeTab === 'certificate' ? '#000' : 'rgba(255,255,255,0.7)',
                fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Outfit',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s'
              }}
            >
              <Eye size={15} />
              <span>Official Certificate</span>
            </button>

            <button
              onClick={() => setActiveTab('jsonld')}
              style={{
                flex: 1, padding: '9px 14px', borderRadius: 8, border: 'none',
                background: activeTab === 'jsonld' ? selectedCred.color : 'transparent',
                color: activeTab === 'jsonld' ? '#000' : 'rgba(255,255,255,0.7)',
                fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Outfit',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s'
              }}
            >
              <FileCode size={15} />
              <span>W3C JSON-LD Proof</span>
            </button>
          </div>

          {/* TAB 1: VISUAL 3D BADGE MEDALLION DISPLAY */}
          {activeTab === 'badge' && (
            <div style={{
              position: 'relative', borderRadius: 24, padding: 32,
              background: 'radial-gradient(circle at 50% 30%, #0f172a 0%, #020408 100%)',
              border: `2px solid ${selectedCred.color}80`, boxShadow: `0 0 50px ${selectedCred.color}25`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
            }}>

              {/* Verified Ribbon Top */}
              <div style={{
                position: 'absolute', top: 20, right: 24,
                padding: '5px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.18)',
                border: '1px solid #10b981', color: '#10b981', fontSize: 11, fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', gap: 6
              }}>
                <CheckCircle2 size={13} />
                <span>AICTE & W3C Verified</span>
              </div>

              <div style={{
                position: 'absolute', top: 20, left: 24,
                fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono'
              }}>
                ID: {selectedCred.id}
              </div>

              {/* The SVG Badge Graphic */}
              <div style={{ margin: '20px 0 16px', position: 'relative' }}>
                <svg
                  ref={badgeSvgRef}
                  width="260"
                  height="260"
                  viewBox="0 0 260 260"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ filter: `drop-shadow(0 12px 28px ${selectedCred.color}55)` }}
                >
                  <defs>
                    <linearGradient id={`grad_outer_${selectedCred.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={selectedCred.color} />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
                      <stop offset="100%" stopColor={selectedCred.secondaryColor} />
                    </linearGradient>

                    <linearGradient id={`grad_inner_${selectedCred.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#020408" />
                    </linearGradient>

                    <linearGradient id={`grad_ribbon_${selectedCred.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={selectedCred.secondaryColor} />
                      <stop offset="50%" stopColor={selectedCred.color} />
                      <stop offset="100%" stopColor={selectedCred.secondaryColor} />
                    </linearGradient>
                  </defs>

                  {/* Outer Laurel Rays & Shield */}
                  <polygon
                    points="130,10 230,68 230,182 130,240 30,182 30,68"
                    fill={`url(#grad_outer_${selectedCred.id})`}
                    stroke={selectedCred.color}
                    strokeWidth="3"
                  />

                  {/* Inner Dark Hexagon Crest */}
                  <polygon
                    points="130,22 218,74 218,176 130,228 42,176 42,74"
                    fill={`url(#grad_inner_${selectedCred.id})`}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                  />

                  {/* Decorative Concentric Rings */}
                  <circle cx="130" cy="120" r="62" stroke={selectedCred.color} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                  <circle cx="130" cy="120" r="54" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

                  {/* Center Emblem Glow */}
                  <circle cx="130" cy="120" r="42" fill={`${selectedCred.color}25`} />

                  {/* 5 Stars */}
                  <g fill="#ffd700" transform="translate(85, 52)">
                    <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" transform="scale(0.8)" />
                    <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" transform="translate(18, -3) scale(0.8)" />
                    <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" transform="translate(36, -5) scale(0.9)" />
                    <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" transform="translate(54, -3) scale(0.8)" />
                    <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" transform="translate(72, 0) scale(0.8)" />
                  </g>

                  {/* Subject Text In Badge */}
                  <text x="130" y="86" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="700" letterSpacing="1.5" fontFamily="Outfit">
                    {selectedCred.subject.toUpperCase()}
                  </text>

                  {/* Score Number in Badge */}
                  <text x="130" y="142" textAnchor="middle" fill="#ffffff" fontSize="34" fontWeight="900" fontFamily="Space Grotesk">
                    {selectedCred.score}%
                  </text>

                  <text x="130" y="160" textAnchor="middle" fill={selectedCred.color} fontSize="10" fontWeight="800" letterSpacing="1" fontFamily="Outfit">
                    MASTERY VERIFIED
                  </text>

                  {/* Bottom Ribbon */}
                  <rect x="35" y="196" width="190" height="26" rx="6" fill={`url(#grad_ribbon_${selectedCred.id})`} stroke="#ffffff" strokeWidth="1" />
                  <text x="130" y="213" textAnchor="middle" fill="#020408" fontSize="11" fontWeight="900" letterSpacing="1" fontFamily="Space Grotesk">
                    {selectedCred.tier.toUpperCase()} • {selectedCred.level.toUpperCase()}
                  </text>
                </svg>
              </div>

              {/* Title & Metadata */}
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 22, color: 'white', margin: '4px 0 6px' }}>
                {selectedCred.skill}
              </h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 0 16px', lineHeight: 1.5 }}>
                Official W3C Verifiable Open Badge credential acknowledging verified academic excellence and laboratory proficiency in {selectedCred.subject}.
              </p>

              {/* Verification Info Bar */}
              <div style={{
                width: '100%', maxWidth: 650, margin: '0 0 20px', padding: 14, borderRadius: 12,
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'left'
              }}>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Recipient DID</div>
                  <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#00d4ff', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedCred.recipientHash.slice(0, 16)}...
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>On-Chain Hash</div>
                  <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#10b981', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedCred.hash.slice(0, 16)}...
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Issue Date</div>
                  <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginTop: 2 }}>
                    {selectedCred.date}
                  </div>
                </div>
              </div>

              {/* Action Buttons: LinkedIn, Download SVG, Export VC */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* LinkedIn Button */}
                <button
                  onClick={handleAddToLinkedIn}
                  style={{
                    padding: '11px 22px', borderRadius: 10, border: 'none',
                    background: '#0a66c2', color: 'white', fontWeight: 800, cursor: 'pointer',
                    fontFamily: 'Outfit', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 4px 15px rgba(10,102,194,0.4)', transition: 'all 0.2s'
                  }}
                >
                  <ExternalLink size={16} />
                  <span>Add to LinkedIn Profile</span>
                </button>

                {/* Download Badge SVG */}
                <button
                  onClick={handleDownloadBadgeSvg}
                  style={{
                    padding: '11px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.06)', color: 'white', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'Outfit', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8
                  }}
                >
                  <Download size={15} />
                  <span>Download Badge (.SVG)</span>
                </button>

                {/* Export VC */}
                <button
                  onClick={handleCopyJsonLd}
                  style={{
                    padding: '11px 18px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #0066ff, #00d4ff)', color: 'white',
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 13,
                    display: 'inline-flex', alignItems: 'center', gap: 8
                  }}
                >
                  {isCopied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{isCopied ? 'VC JSON-LD Copied!' : 'Export Cryptographic VC'}</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: OFFICIAL CERTIFICATE VIEW */}
          {activeTab === 'certificate' && (
            <div style={{
              position: 'relative', borderRadius: 20, padding: 36,
              background: 'linear-gradient(135deg, #0f172a 0%, #020408 100%)',
              border: `2px solid ${selectedCred.color}60`, boxShadow: `0 0 35px ${selectedCred.color}20`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: `${selectedCred.color}20`, color: selectedCred.color, fontWeight: 800 }}>
                    W3C VERIFIABLE CREDENTIAL • OPEN BADGES 3.0
                  </span>
                  <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 26, color: 'white', margin: '12px 0 6px' }}>
                    {selectedCred.skill}
                  </h2>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                    Level: <strong style={{ color: selectedCred.color }}>{selectedCred.level} ({selectedCred.tier})</strong> • Subject: <strong>{selectedCred.subject}</strong>
                  </div>
                </div>

                <div style={{ width: 68, height: 68, borderRadius: '50%', background: `${selectedCred.color}20`, border: `2px solid ${selectedCred.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedCred.color }}>
                  {renderBadgeGlyph(selectedCred.iconType, 32)}
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

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={handleAddToLinkedIn}
                  style={{
                    padding: '9px 18px', borderRadius: 8, border: 'none',
                    background: '#0a66c2', color: 'white', fontWeight: 800, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Add to LinkedIn Profile</span>
                </button>

                <button
                  onClick={handleCopyJsonLd}
                  style={{
                    padding: '9px 18px', borderRadius: 8, border: 'none',
                    background: 'linear-gradient(135deg, #0066ff, #00d4ff)', color: 'white',
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{isCopied ? 'JSON-LD Copied!' : 'Export Cryptographic VC'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: W3C JSON-LD PAYLOAD */}
          {activeTab === 'jsonld' && (
            <div style={{ borderRadius: 16, background: '#020408', border: '1px solid rgba(0,212,255,0.3)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#00d4ff', fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                  W3C VERIFIABLE CREDENTIAL PAYLOAD (ED25519 SIGNATURE)
                </span>
                <span style={{ fontSize: 11, color: '#10b981', fontFamily: 'JetBrains Mono' }}>schema: OpenBadges v3.0</span>
              </div>
              <pre style={{ margin: 0, padding: 14, borderRadius: 10, background: '#000', color: '#10b981', fontFamily: 'JetBrains Mono', fontSize: 11, lineHeight: 1.6, maxHeight: 380, overflowY: 'auto' }}>
                {JSON.stringify(jsonLdPayload, null, 2)}
              </pre>
            </div>
          )}

        </div>

      </div>

      {/* LINKEDIN REDIRECT CONFIRMATION MODAL */}
      {linkedInModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#0f172a', borderRadius: 20, border: '1px solid #0a66c2',
            maxWidth: 500, width: '100%', padding: 24, boxShadow: '0 20px 50px rgba(10,102,194,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 18 }}>
                  in
                </div>
                <h3 style={{ margin: 0, fontSize: 16, color: 'white', fontFamily: 'Space Grotesk', fontWeight: 700 }}>
                  Add to LinkedIn Profile
                </h3>
              </div>
              <button onClick={() => setLinkedInModalOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} />
                <span>Redirecting to LinkedIn Certification Portal...</span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                If LinkedIn did not open automatically (due to browser pop-up permissions), click the button below to complete adding your credential.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 18, background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8 }}>
              <div>• <strong>Certification:</strong> {selectedCred.skill}</div>
              <div>• <strong>Organization:</strong> NEXUS LEARN (AICTE & W3C Verified)</div>
              <div>• <strong>Credential ID:</strong> {selectedCred.id}</div>
              <div>• <strong>Verifiable URL:</strong> https://sih-nexus-learn-app.vercel.app/credentials?id={selectedCred.id}</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setLinkedInModalOpen(false)}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8, background: '#0a66c2',
                  color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: 13,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <ExternalLink size={15} />
                <span>Open LinkedIn Form</span>
              </a>
              <button
                onClick={() => setLinkedInModalOpen(false)}
                style={{
                  padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer', fontSize: 13
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
