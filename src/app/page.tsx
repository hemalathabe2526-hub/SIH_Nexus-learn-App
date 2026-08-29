'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Star field component
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: { x: number; y: number; r: number; o: number; speed: number }[] = [];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5,
        o: Math.random(),
        speed: Math.random() * 0.003 + 0.001,
      });
    }

    let animId: number;
    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;
      stars.forEach((s) => {
        const opacity = 0.2 + 0.8 * Math.abs(Math.sin(t * s.speed * 100 + s.o * 100));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}

// Animated counter
function Counter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = end / 80;
          const timer = setInterval(() => {
            start += step;
            if (start >= end) { start = end; clearInterval(timer); }
            setCount(Math.floor(start));
          }, 20);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

const USER_ROLES = [
  { id: 'school', title: 'School Students', badge: 'Class 6-12', desc: 'Maths, Science, English & Gamified Quizzes', icon: '🎒', color: '#0066ff' },
  { id: 'college', title: 'College & Engineering', badge: 'B.Tech / B.Sc', desc: 'Coding, OS, Networks, Advanced Physics & Labs', icon: '🎓', color: '#7c3aed' },
  { id: 'competitive', title: 'Competitive Aspirants', badge: 'UPSC / NEET / JEE', desc: 'Personalized Revision, Weakness Alerts & Mock Exams', icon: '🎯', color: '#f59e0b' },
  { id: 'skill', title: 'General Skill Learners', badge: 'Upskilling', desc: 'Programming, Communication, Web Dev & Practical AI', icon: '💻', color: '#10b981' },
];

const SUBJECT_CATALOG = [
  { name: 'Mathematics', topics: 'Calculus, Algebra, Geometry, Statistics', icon: '📐', color: '#7c3aed' },
  { name: 'Physics & Chemistry', topics: 'Thermodynamics, Optics, Atomic Struct, Organic', icon: '⚛️', color: '#0066ff' },
  { name: 'Coding & CS', topics: 'Python, DSA, Operating Systems, Networks', icon: '💻', color: '#00d4ff' },
  { name: 'English & Communication', topics: 'Grammar, Pronunciation, Interactive AI Voice Chat', icon: '🗣️', color: '#ec4899' },
  { name: 'Competitive Prep', topics: 'JEE Main/Adv, NEET Biology/Chem, UPSC Polity', icon: '🏆', color: '#f59e0b' },
];

const features = [
  {
    id: 'struggle',
    icon: '💡',
    title: 'AI Struggle & Rewind Detector',
    desc: 'Auto-detects when you rewind video or pause repeatedly. Instantly prompts a simplified 3D or visual explanation.',
    color: '#00d4ff',
    tag: 'Smart Detection',
    link: '/videolab',
  },
  {
    id: 'labs',
    icon: '🧪',
    title: '3D Virtual Interactive Labs',
    desc: 'Perform Physics, Chemistry, OS Process & Circuit simulations directly in your browser with interactive 3D controls.',
    color: '#10b981',
    tag: '3D Simulation',
    link: '/virtuallab',
  },
  {
    id: 'practice',
    icon: '✍️',
    title: 'Coding & Grammar Practice Studio',
    desc: 'Live code runner with instant AI debugging hints + interactive English conversation voice practice.',
    color: '#ec4899',
    tag: 'Interactive Studio',
    link: '/practice',
  },
  {
    id: 'twin',
    icon: '🧬',
    title: 'Digital Learning Twin',
    desc: 'Understands your exact learning behavior, memory decay, repeated mistakes, and crafts a bespoke daily journey.',
    color: '#0066ff',
    tag: 'AI Learning Model',
    link: '/twin',
  },
  {
    id: 'cognitive',
    icon: '🧠',
    title: 'Cognitive State Engine',
    desc: 'Real-time focus & emotion detection via webcam. Morph content dynamically based on anxiety, boredom or flow.',
    color: '#7c3aed',
    tag: 'Neuromorphic AI',
    link: '/cognitive',
  },
  {
    id: 'universe',
    icon: '🌌',
    title: '3D Knowledge Universe',
    desc: 'Navigate curriculum as an interconnected 3D star map. Mastered concepts shine bright in your galaxy.',
    color: '#a855f7',
    tag: '3D Spatial Map',
    link: '/universe',
  },
  {
    id: 'bhasha',
    icon: '🔊',
    title: 'Bhasha AI (22 Indian Languages)',
    desc: 'Full UI & Voice AI in 22 languages with dialect recognition. Cross-language peer collaboration.',
    color: '#f59e0b',
    tag: '22 Languages',
    link: '/bhasha',
  },
  {
    id: 'rpg',
    icon: '⚔️',
    title: 'Narrative RPG & Daily Quizzes',
    desc: 'Daily assessments, weekly tests, timers, hints, XP levels, rewards, and boss battles that make learning addictive.',
    color: '#ef4444',
    tag: 'Gamified RPG',
    link: '/rpg',
  },
  {
    id: 'teacher',
    icon: '🪄',
    title: 'Institutional & Teacher Cockpit',
    desc: 'Separate logins for Schools/Colleges. Monitor student weakness heatmaps & assign targeted topics instantly.',
    color: '#00d4ff',
    tag: 'Institutional',
    link: '/teacher',
  },
  {
    id: 'offline',
    icon: '📶',
    title: 'Offline Learning & P2P Sync',
    desc: 'On-device TF Lite AI engine. Peer-to-peer Bluetooth module sharing for zero-connectivity regions.',
    color: '#06b6d4',
    tag: 'Offline Engine',
    link: '/offline',
  },
];

const stats = [
  { value: 100, suffix: '+', label: 'Subjects & Exam Prep', icon: '📚' },
  { value: 22, suffix: '', label: 'Languages Supported', icon: '🗣️' },
  { value: 3, suffix: 'D', label: 'Interactive Virtual Labs', icon: '🧪' },
  { value: 99, suffix: '%', label: 'Personalized Retention', icon: '🎯' },
];

export default function Home() {
  const [activeRole, setActiveRole] = useState('school');
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: 'var(--nexus-void)', minHeight: '100vh', position: 'relative' }}>
      <StarField />

      {/* NAV */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(2,4,8,0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'all 0.4s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="Nexus Learn Logo"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              objectFit: 'cover',
              boxShadow: '0 0 20px rgba(0,102,255,0.5)',
            }}
          />
          <span
            style={{
              fontFamily: 'Space Grotesk',
              fontWeight: 700,
              fontSize: 20,
              background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            NEXUS LEARN
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {['Dashboard', '3D Labs', 'Practice', 'AI Video', 'Teacher'].map((item) => {
            const routes: Record<string, string> = {
              Dashboard: '/dashboard',
              '3D Labs': '/virtuallab',
              Practice: '/practice',
              'AI Video': '/videolab',
              Teacher: '/teacher',
            };
            return (
              <Link
                key={item}
                href={routes[item]}
                className="nav-link"
              >
                {item}
              </Link>
            );
          })}
          <Link
            href="/dashboard"
            style={{
              padding: '8px 22px',
              background: 'linear-gradient(135deg, #0066ff, #7c3aed)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: 'white',
              textDecoration: 'none',
              boxShadow: '0 0 20px rgba(0,102,255,0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            Enter Platform →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 40px 60px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Main headline */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 18px',
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: 100,
            marginBottom: 24,
            fontSize: 13,
            fontWeight: 600,
            color: '#00d4ff',
          }}
        >
          🚀 Next-Gen AI Smart Education & Personalized Learning Platform
        </div>

        <h1
          style={{
            fontSize: 'clamp(44px, 7vw, 90px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-2px',
            marginBottom: 24,
            fontFamily: 'Space Grotesk',
          }}
        >
          Learn Smarter with Your{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #0066ff 0%, #00d4ff 50%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Digital AI Twin
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(18px, 2.2vw, 24px)',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.75)',
            maxWidth: 820,
            lineHeight: 1.6,
            marginBottom: 36,
          }}
        >
          Tailored learning for <strong style={{ color: '#00d4ff' }}>School</strong>,{' '}
          <strong style={{ color: '#a855f7' }}>College</strong>,{' '}
          <strong style={{ color: '#f59e0b' }}>UPSC / NEET / JEE Aspirants</strong> &{' '}
          <strong style={{ color: '#10b981' }}>Skill Learners</strong>. Featuring 3D Virtual Labs, AI struggle detection, voice tutor, and 22 vernacular languages.
        </p>

        {/* User Role Switcher */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 40,
            padding: 8,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            maxWidth: 950,
          }}
        >
          {USER_ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              style={{
                padding: '12px 20px',
                borderRadius: 12,
                border: activeRole === role.id ? `1px solid ${role.color}` : '1px solid transparent',
                background: activeRole === role.id ? `${role.color}20` : 'transparent',
                color: activeRole === role.id ? role.color : 'rgba(255,255,255,0.6)',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'Outfit',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.3s ease',
              }}
            >
              <span style={{ fontSize: 18 }}>{role.icon}</span>
              <div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>{role.title}</div>
                <div style={{ fontSize: 10, opacity: 0.6, fontWeight: 400, textAlign: 'left' }}>{role.badge}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Role Card Banner */}
        {(() => {
          const selected = USER_ROLES.find(r => r.id === activeRole)!;
          return (
            <div
              style={{
                padding: '16px 28px',
                borderRadius: 14,
                background: `${selected.color}10`,
                border: `1px solid ${selected.color}40`,
                marginBottom: 40,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                maxWidth: 700,
              }}
            >
              <span style={{ fontSize: 28 }}>{selected.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: selected.color }}>
                  Customized Experience for: {selected.title}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{selected.desc}</div>
              </div>
            </div>
          );
        })()}

        {/* CTA buttons */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/dashboard"
            style={{
              padding: '16px 36px',
              background: 'linear-gradient(135deg, #0066ff, #7c3aed)',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
              boxShadow: '0 8px 40px rgba(0,102,255,0.4)',
              transition: 'all 0.3s ease',
            }}
          >
            🚀 Open Dashboard
          </Link>
          <Link
            href="/virtuallab"
            style={{
              padding: '16px 36px',
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.4)',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              color: '#10b981',
              textDecoration: 'none',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
            }}
          >
            🧪 3D Virtual Labs
          </Link>
          <Link
            href="/videolab"
            style={{
              padding: '16px 36px',
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              color: '#00d4ff',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
          >
            💡 AI Rewind Detector
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 40px' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          {stats.map((s) => (
            <div key={s.label} className="metric-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>{s.icon}</div>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  fontFamily: 'Space Grotesk',
                  background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                <Counter end={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SUBJECT CATALOG */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, fontFamily: 'Space Grotesk', marginBottom: 12 }}>
              Comprehensive Learning Across All Subjects
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>
              Maths, Physics, Chemistry, Coding, OS, CN, English Grammar & Competitive Exams
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {SUBJECT_CATALOG.map(sub => (
              <div
                key={sub.name}
                style={{
                  padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${sub.color}30`, transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>{sub.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: sub.color, marginBottom: 6, fontFamily: 'Space Grotesk' }}>
                  {sub.name}
                </h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                  {sub.topics}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div
              style={{
                display: 'inline-block',
                padding: '6px 18px',
                background: 'rgba(0,102,255,0.1)',
                border: '1px solid rgba(0,102,255,0.3)',
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 600,
                color: '#0066ff',
                marginBottom: 16,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Complete Smart Learning Platform
            </div>
            <h2
              style={{
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 800,
                fontFamily: 'Space Grotesk',
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              Every Tool for Your{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #0066ff, #00d4ff, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Academic & Career Peak
              </span>
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 20,
            }}
          >
            {features.map((f) => (
              <Link
                key={f.id}
                href={f.link}
                style={{ textDecoration: 'none' }}
                onMouseEnter={() => setActiveFeature(f.id)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                <div
                  className="nexus-card"
                  style={{
                    padding: 28,
                    borderRadius: 20,
                    border: `1px solid ${activeFeature === f.id ? f.color + '50' : 'rgba(255,255,255,0.07)'}`,
                    background:
                      activeFeature === f.id
                        ? `rgba(${f.color}, 0.05)`
                        : 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(20px)',
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <span style={{ fontSize: 36 }}>{f.icon}</span>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 100,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        background: `${f.color}20`,
                        color: f.color,
                        border: `1px solid ${f.color}40`,
                      }}
                    >
                      {f.tag}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      marginBottom: 10,
                      fontFamily: 'Space Grotesk',
                      color: activeFeature === f.id ? f.color : 'white',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '40px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ fontWeight: 700, fontFamily: 'Space Grotesk', fontSize: 16 }}>NEXUS LEARN</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>· Smart Education Ecosystem</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['School', 'College', 'UPSC/NEET/JEE', 'Skill Learners', 'Institutional Admin'].map((t) => (
            <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{t}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
