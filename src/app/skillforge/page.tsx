'use client';

import { useState } from 'react';
import Link from 'next/link';

const PROJECTS = [
  {
    id: 1,
    title: 'Autonomous Drone Navigation Algorithm',
    company: 'SkyBound Robotics (Bengaluru)',
    stipend: '₹15,000 Micro-Grant',
    skills: ['Physics: Mechanics', 'Vector Calculus', 'Python'],
    difficulty: 'Advanced',
    spots: 3,
    color: '#ef4444',
  },
  {
    id: 2,
    title: 'Solar Grid Efficiency Optimizer',
    company: 'GreenEnergy Tech (Hyderabad)',
    stipend: '₹12,000 Micro-Grant',
    skills: ['Thermodynamics', 'Linear Algebra', 'Data Science'],
    difficulty: 'Intermediate',
    spots: 5,
    color: '#f59e0b',
  },
  {
    id: 3,
    title: 'Indic Vernacular Speech Recognizer',
    company: 'BhashaAI Labs (Pune)',
    stipend: '₹18,000 Micro-Grant',
    skills: ['Machine Learning', 'Signal Processing', 'NLP'],
    difficulty: 'Advanced',
    spots: 2,
    color: '#0066ff',
  },
];

export default function SkillForgePage() {
  const [applied, setApplied] = useState<number[]>([]);

  return (
    <div style={{ background: 'var(--nexus-void)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(239,68,68,0.2)', background: 'rgba(2,4,8,0.9)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#ef4444' }}>
          🏭 Skill Forge — Real Industry Projects
        </h1>
        <span style={{ fontSize: 12, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(16,185,129,0.3)' }}>
          ✓ Verified Industry Bridge
        </span>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Banner */}
        <div style={{
          padding: 28, borderRadius: 20, marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(0,0,0,0.6))',
          border: '1px solid rgba(239,68,68,0.25)', backdropFilter: 'blur(20px)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Education to Employment Engine
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 28, marginBottom: 8, color: 'white' }}>
            Transform Concept Mastery into Real Industry Output
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', maxWidth: 650, lineHeight: 1.6 }}>
            Master concepts on NEXUS LEARN to automatically unlock paid micro-projects directly from Indian startups and research labs. Build your portfolio while learning.
          </p>
        </div>

        {/* Project Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {PROJECTS.map(p => (
            <div key={p.id} style={{
              padding: 24, borderRadius: 18, background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${p.color}30`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p.color, background: `${p.color}15`, padding: '4px 10px', borderRadius: 100 }}>
                    {p.difficulty}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981', fontFamily: 'Space Grotesk' }}>
                    {p.stipend}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, marginBottom: 6, color: 'white' }}>
                  {p.title}
                </h3>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
                  🏢 {p.company}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Prerequisite Mastery Required:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {p.skills.map(s => (
                      <span key={s} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setApplied(prev => prev.includes(p.id) ? prev : [...prev, p.id])}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: applied.includes(p.id) ? 'rgba(16,185,129,0.2)' : `linear-gradient(135deg, ${p.color}, #7c3aed)`,
                  color: applied.includes(p.id) ? '#10b981' : 'white',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit'
                }}
              >
                {applied.includes(p.id) ? '✓ Applied & Skill Unlocked' : '🚀 Apply with Skill Passport'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
