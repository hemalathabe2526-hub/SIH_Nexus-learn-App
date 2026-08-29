'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStoredSession, logoutUser, canAccessRoleContent, type UserRole, type UserProfile } from '@/lib/authStore';
import { ROLE_SYLLABUS, getCombinedSyllabus } from '@/lib/syllabusData';

const ROLE_CONFIGS: Record<UserRole, {
  title: string;
  badge: string;
  color: string;
  subjects: string[];
  tasks: { task: string; subject: string; xp: number; done: boolean; urgent: boolean }[];
  weaknesses: { topic: string; score: number; mistakes: number }[];
  recommended: { title: string; desc: string; link: string; icon: string }[];
}> = {
  school: {
    title: 'School Student Mode (Class 6-12)',
    badge: 'CBSE / State Board',
    color: '#0066ff',
    subjects: ['Maths', 'Science', 'Physics', 'Chemistry', 'English Grammar'],
    tasks: [
      { task: 'Complete Wave Optics 3D Lab', subject: 'Physics', xp: 250, done: false, urgent: true },
      { task: 'Practice 10 Linear Equation Problems', subject: 'Maths', xp: 180, done: true, urgent: false },
      { task: 'English Grammar Voice Practice Session', subject: 'English', xp: 150, done: false, urgent: false },
    ],
    weaknesses: [
      { topic: 'Quadratic Equation Signs', score: 42, mistakes: 5 },
      { topic: 'Ray Optics Diagrams', score: 55, mistakes: 3 },
    ],
    recommended: [
      { title: '3D Physics Virtual Lab', desc: 'Perform optics & pendulum experiments in 3D', link: '/virtuallab', icon: '🧪' },
      { title: 'English Voice Tutor', desc: 'Practice spoken English with AI speech feedback', link: '/practice', icon: '🗣️' },
    ],
  },
  college: {
    title: 'College & Engineering Mode',
    badge: 'B.Tech / B.Sc / CS',
    color: '#7c3aed',
    subjects: ['Coding & DSA', 'Operating Systems', 'Computer Networks', 'Applied Physics'],
    tasks: [
      { task: 'Optimize Process Scheduling for a Real Server Load', subject: 'Operating Systems', xp: 320, done: false, urgent: true },
      { task: 'Model Packet Loss in a Banking App Network', subject: 'Computer Networks', xp: 260, done: false, urgent: false },
      { task: 'Solve a Route Planning Graph Case Study', subject: 'DSA & Algorithms', xp: 240, done: true, urgent: false },
    ],
    weaknesses: [
      { topic: 'Deadlock Banker Algorithm', score: 38, mistakes: 6 },
      { topic: 'Subnetting Variable Masks', score: 48, mistakes: 4 },
      { topic: 'Graph Shortest Path Trade-offs', score: 52, mistakes: 3 },
    ],
    recommended: [
      { title: 'OS Process Simulator Lab', desc: 'Visualize Round Robin, Priority, and server bottleneck handling', link: '/virtuallab', icon: '💻' },
      { title: 'Network Congestion Lab', desc: 'Tune latency, throughput, and packet loss for a live system design', link: '/virtuallab', icon: '📡' },
      { title: 'Interactive Coding Studio', desc: 'Solve real-world algorithmic problems with AI guidance', link: '/practice', icon: '✍️' },
    ],
  },
  aspirant: {
    title: 'Competitive Exam Aspirant Mode',
    badge: 'UPSC / NEET / JEE',
    color: '#f59e0b',
    subjects: ['JEE Physics', 'JEE Maths', 'NEET Chemistry', 'NEET Biology', 'UPSC Polity'],
    tasks: [
      { task: 'JEE Advanced Mechanics Mock Quiz (Timer)', subject: 'JEE Physics', xp: 400, done: false, urgent: true },
      { task: 'Review Organic Reaction Decay Alert', subject: 'NEET Chemistry', xp: 250, done: false, urgent: true },
      { task: 'UPSC Indian Constitution Articles Quiz', subject: 'Polity', xp: 300, done: true, urgent: false },
    ],
    weaknesses: [
      { topic: 'Rotational Dynamics Torque', score: 34, mistakes: 8 },
      { topic: 'Electrophilic Substitution', score: 45, mistakes: 5 },
    ],
    recommended: [
      { title: 'AI Rewind Struggle Detector', desc: 'Rewind hard lecture spots for 30s visual breakdown', link: '/videolab', icon: '💡' },
      { title: 'Digital Twin Decay Model', desc: 'Predict forgetting curve before your NEET/JEE exam', link: '/twin', icon: '🧬' },
    ],
  },
  skill: {
    title: 'General Skill Learner Mode',
    badge: 'Upskilling & Career',
    color: '#10b981',
    subjects: ['Full-Stack Web Dev', 'Python AI', 'Public Speaking', 'Data Science'],
    tasks: [
      { task: 'Build Async Python API Micro-project', subject: 'Python', xp: 350, done: false, urgent: true },
      { task: 'Practice English Business Presentation', subject: 'Communication', xp: 200, done: false, urgent: false },
    ],
    weaknesses: [
      { topic: 'Python Decorators & Generators', score: 50, mistakes: 4 },
    ],
    recommended: [
      { title: 'Skill Forge Micro-Projects', desc: 'Earn verified micro-grants from startups', link: '/skillforge', icon: '🏭' },
      { title: 'Blockchain Skill Passport', desc: 'Publish concept-level verified badges on-chain', link: '/credentials', icon: '🔗' },
    ],
  },
  teacher: {
    title: 'Institutional & Teacher Login Mode',
    badge: 'School / College Admin',
    color: '#00d4ff',
    subjects: ['Class 10 Physics', 'Class 12 Chemistry', 'CS Batch A'],
    tasks: [
      { task: 'Assign Targeted Homework on Wave Optics', subject: 'Physics', xp: 500, done: false, urgent: true },
      { task: 'Review Confusion Heatmap for 48 Students', subject: 'Class 10', xp: 300, done: true, urgent: false },
    ],
    weaknesses: [
      { topic: 'Class 10 Diffraction Concept', score: 28, mistakes: 18 },
    ],
    recommended: [
      { title: 'Teacher Cockpit Dashboard', desc: 'Class heatmaps, at-risk alerts & AI lesson generator', link: '/teacher', icon: '🪄' },
    ],
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('school');
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [showSyllabus, setShowSyllabus] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace('/login');
      return;
    }

    setCurrentUser(session);
    setRole(session.role === 'teacher' ? 'school' : session.role);
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening');
    const tick = () => setCurrentTime(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  const activeRole = currentUser && currentUser.role === 'teacher' ? role : currentUser?.role ?? 'school';
  const isRoleAccessible = (targetRole: UserRole) => canAccessRoleContent(currentUser, targetRole);
  const config = ROLE_CONFIGS[activeRole] || ROLE_CONFIGS['school'];
  const syllabus = getCombinedSyllabus(activeRole);

  if (!currentUser) return null;

  return (
    <div style={{ background: 'var(--nexus-void)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white' }}>
      {/* Top Header */}
      <div style={{
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(2,4,8,0.95)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #0066ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0,102,255,0.5)' }}>⚡</div>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, background: 'linear-gradient(135deg, #0066ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEXUS LEARN</span>
          </Link>
        </div>

        {/* Navigation Quick Links */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/videolab" style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
            📺 Video Lab & Quiz
          </Link>
          <Link href="/virtuallab" style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
            🧪 3D Virtual Labs
          </Link>
          <Link href="/code" style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
            💻 Code Editor
          </Link>
          <Link href="/assessment" style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
            🎯 Mock Assessment
          </Link>
          <Link href="/bhasha" style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)', color: '#ec4899', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
            🔊 Bhasha 22 Languages
          </Link>
          <Link href="/mobile-preview" style={{ padding: '6px 12px', borderRadius: 8, background: 'linear-gradient(135deg, rgba(0,102,255,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(168,85,247,0.4)', color: '#c084fc', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
            📱 Android Preview
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }}>{currentTime}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>👨‍🎓</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{currentUser.username}</div>
              <div style={{ fontSize: 11, color: config.color, fontWeight: 600 }}>{config.badge}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 24px' }}>
        {/* User Role Selector */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            { id: 'school', label: '🎒 School (Class 6-12)' },
            { id: 'college', label: '🎓 College & Engineering' },
            { id: 'aspirant', label: '🎯 UPSC / NEET / JEE' },
            { id: 'skill', label: '💻 Skill Learner' },
            { id: 'teacher', label: '🏫 Teacher / Institutional' },
          ].filter((r) => currentUser.role === 'teacher' || r.id === currentUser.role)
            .map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  if (!isRoleAccessible(r.id as UserRole)) return;
                  setRole(r.id as UserRole);
                }}
                disabled={!isRoleAccessible(r.id as UserRole)}
                style={{
                  padding: '10px 18px', borderRadius: 12,
                  background: activeRole === r.id ? ROLE_CONFIGS[r.id as UserRole].color + '20' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${activeRole === r.id ? ROLE_CONFIGS[r.id as UserRole].color : 'rgba(255,255,255,0.08)'}`,
                  color: activeRole === r.id ? ROLE_CONFIGS[r.id as UserRole].color : 'rgba(255,255,255,0.6)',
                  fontWeight: 700, fontSize: 13, cursor: isRoleAccessible(r.id as UserRole) ? 'pointer' : 'not-allowed', fontFamily: 'Outfit', transition: 'all 0.2s', opacity: isRoleAccessible(r.id as UserRole) ? 1 : 0.45,
                }}
              >
                {r.label}
              </button>
            ))}
        </div>

        {/* Greeting Banner */}
        <div style={{
          padding: 24, borderRadius: 20, marginBottom: 28,
          background: `linear-gradient(135deg, ${config.color}15, rgba(0,0,0,0.6))`,
          border: `1px solid ${config.color}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 26, marginBottom: 6 }}>
              {greeting}, {currentUser.username.split(' ')[0]}! 👋
            </h1>
            <div style={{ fontSize: 14, color: config.color, fontWeight: 700, marginBottom: 4 }}>
              {config.title}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              Subjects: {config.subjects.join(', ')} · Level {currentUser.level} · {currentUser.xp} XP · {currentUser.streakDays} day streak
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setShowSyllabus(!showSyllabus)}
              style={{ padding: '9px 16px', borderRadius: 10, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)', color: '#a855f7', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>
              📚 {showSyllabus ? 'Hide' : 'View'} My Syllabus
            </button>
            <Link href="/videolab" style={{ padding: '9px 16px', borderRadius: 10, background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
              💡 Video Lab
            </Link>
            <Link href="/virtuallab" style={{ padding: '9px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
              🧪 3D Labs
            </Link>
          </div>
        </div>

        {/* Syllabus Panel */}
        {showSyllabus && (
          <div style={{ padding: 20, borderRadius: 18, marginBottom: 20, background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, color: '#a855f7', marginBottom: 14 }}>📚 Your Syllabus ({activeRole.toUpperCase()})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
              {syllabus.map(topic => (
                <div key={topic.id} style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${currentUser.completedTopics?.includes(topic.id) ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                  <div style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, marginBottom: 3 }}>{topic.subject}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 6 }}>{topic.title}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>⏱ {topic.durationMinutes} min</span>
                    {currentUser.completedTopics?.includes(topic.id) && <span style={{ fontSize: 10, color: '#10b981' }}>✓ Completed</span>}
                  </div>
                  <Link href={`/videolab?topic=${topic.id}`}
                    style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: '#00d4ff', textDecoration: 'none', fontWeight: 700 }}>
                    ▶ Watch Video →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adaptive Learning Pulse */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: 16, marginBottom: 24 }}>
          <div style={{ padding: 22, borderRadius: 18, background: 'linear-gradient(135deg, rgba(0,102,255,0.12), rgba(168,85,247,0.08))', border: '1px solid rgba(0,212,255,0.2)' }}>
            <div style={{ fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase', color: '#00d4ff', fontWeight: 800, marginBottom: 10 }}>Adaptive Learning Pulse</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{currentUser.level + 1}x Growth Sprint</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Next AI coach target: {config.subjects[0]} mastery improvement with a 12-minute challenge block.</div>
              </div>
              <div style={{ minWidth: 120, padding: '12px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981' }}>{Math.min(97, Math.max(42, currentUser.streakDays * 5 + 20))}%</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Focus match</div>
              </div>
            </div>
          </div>

          <div style={{ padding: 22, borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase', color: '#f59e0b', fontWeight: 800, marginBottom: 8 }}>Smart Challenge</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{config.tasks[0]?.task}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>{config.tasks[0]?.subject} · +{config.tasks[0]?.xp || 0} XP</div>
            <button style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
              🚀 Start 10-Min Sprint
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'XP Earned', val: `${currentUser.xp}`, color: config.color, icon: '⭐' },
            { label: 'Weaknesses Found', val: `${config.weaknesses.length} Topics`, color: '#f59e0b', icon: '⚠️' },
            { label: 'Problems Solved', val: `${currentUser.solvedProblems?.length || 0}`, color: '#10b981', icon: '✅' },
            { label: 'Day Streak', val: `${currentUser.streakDays}`, color: '#ef4444', icon: '🔥' },
          ].map(s => (
            <div key={s.label} className="metric-card">
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'Space Grotesk', color: s.color, marginBottom: 2 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Daily Tasks & Revision Plan */}
            <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#f59e0b' }}>
                📋 Daily Tailored Tasks & Revision Plan
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {config.tasks.map((t, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12,
                    background: t.done ? 'rgba(16,185,129,0.05)' : t.urgent ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${t.done ? 'rgba(16,185,129,0.2)' : t.urgent ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                    <span style={{ fontSize: 20 }}>{t.done ? '✅' : t.urgent ? '⚠️' : '⬜'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: t.done ? 'rgba(255,255,255,0.4)' : 'white', textDecoration: t.done ? 'line-through' : 'none' }}>{t.task}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{t.subject}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b', fontFamily: 'Space Grotesk' }}>+{t.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weakness & Repeated Mistakes Tracker */}
            <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#ef4444' }}>
                🎯 Weakness & Repeated Mistakes Log
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {config.weaknesses.map((w, i) => (
                  <div key={i} style={{ padding: 14, borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{w.topic}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Repeated mistakes in quiz: {w.mistakes} times</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#ef4444', fontFamily: 'Space Grotesk' }}>{w.score}% Mastery</span>
                      <div style={{ marginTop: 4 }}>
                        <Link href="/practice" style={{ fontSize: 11, color: '#00d4ff', textDecoration: 'none', fontWeight: 700 }}>⚡ Fix with AI Practice →</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Recommended Tools for User Type */}
            <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, marginBottom: 14, color: config.color }}>
                ⭐ Recommended for {config.badge}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {config.recommended.map(r => (
                  <Link key={r.title} href={r.link} style={{ textDecoration: 'none' }}>
                    <div style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 20 }}>{r.icon}</span>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{r.title}</div>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{r.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links Grid */}
            <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, marginBottom: 14, color: '#00d4ff' }}>
                🚀 Platform Modules
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { name: '3D Virtual Lab', href: '/virtuallab', icon: '🧪' },
                  { name: 'AI Video Detector', href: '/videolab', icon: '💡' },
                  { name: 'Coding Studio', href: '/practice', icon: '✍️' },
                  { name: '3D Galaxy Map', href: '/universe', icon: '🌌' },
                  { name: 'Digital Twin', href: '/twin', icon: '🧬' },
                  { name: 'Bhasha (22 Lang)', href: '/bhasha', icon: '🔊' },
                  { name: 'RPG Quest Engine', href: '/rpg', icon: '⚔️' },
                  { name: 'Teacher Portal', href: '/teacher', icon: '🪄' },
                ].map(m => (
                  <Link key={m.name} href={m.href} style={{ textDecoration: 'none' }}>
                    <div style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                      {m.icon} {m.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
