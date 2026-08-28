'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AccessibilityPage() {
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [hapticMode, setHapticMode] = useState(true);
  const [eyeTracking, setEyeTracking] = useState(false);
  const [signLanguage, setSignLanguage] = useState(true);

  return (
    <div style={{
      background: 'var(--nexus-void)', minHeight: '100vh',
      fontFamily: dyslexiaMode ? 'Comic Sans MS, sans-serif' : 'Outfit, sans-serif',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(251,191,36,0.2)', background: 'rgba(2,4,8,0.9)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#fbbf24' }}>
          ♿ Universal Accessibility Layer
        </h1>
        <span style={{ fontSize: 12, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '4px 12px', borderRadius: 100 }}>
          Accessibility First · Inclusive India
        </span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Controls */}
        <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#fbbf24' }}>
            ⚙️ Adaptive Accessibility Toggles
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { id: 'dyslexia', title: 'OpenDyslexic Font Mode', desc: 'High-contrast letter weight for dyslexia readability', state: dyslexiaMode, set: setDyslexiaMode, icon: '📖' },
              { id: 'haptic', title: 'Haptic Feedback Patterns', desc: 'Vibration pulses encode formulas for visually impaired', state: hapticMode, set: setHapticMode, icon: '📳' },
              { id: 'eye', title: 'Eye-Gaze Handsfree Navigation', desc: 'Navigate interface using eye gaze (Webcam AI)', state: eyeTracking, set: setEyeTracking, icon: '👁️' },
              { id: 'sign', title: 'Indian Sign Language (ISL) Avatar', desc: 'Real-time ISL avatar translates voice content', state: signLanguage, set: setSignLanguage, icon: '🤟' },
            ].map(t => (
              <div key={t.id} style={{
                padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${t.state ? '#fbbf24' : 'rgba(255,255,255,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{t.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => t.set(!t.state)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: t.state ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                    color: t.state ? '#000' : 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit'
                  }}
                >
                  {t.state ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Simulator Preview */}
        <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#00d4ff' }}>
            🖥️ Live Interface Preview
          </h2>

          <div style={{
            padding: 20, borderRadius: 16, background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(251,191,36,0.3)', minHeight: 300, display: 'flex', flexDirection: 'column', gap: 14
          }}>
            <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>
              Sample Lesson: Newton&apos;s Second Law
            </div>

            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>
              Force equals mass times acceleration (F = m × a). When a net force acts on an object, it causes acceleration in the direction of the force.
            </p>

            {signLanguage && (
              <div style={{
                padding: 14, borderRadius: 12, background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', gap: 12
              }}>
                <span style={{ fontSize: 32 }}>🤟</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#00d4ff' }}>ISL Avatar Active</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Translating: &quot;Force = Mass × Acceleration&quot;</div>
                </div>
              </div>
            )}

            {eyeTracking && (
              <div style={{ padding: 10, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 11, color: '#ef4444' }}>
                👁️ Eye Gaze Cursor: Locked on &quot;Next Lesson&quot; (Hold gaze 1s to click)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
