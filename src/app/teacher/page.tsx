'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { assignTopicToStudent, getAllStudents, getStoredSession, type UserProfile } from '@/lib/authStore';

const CLASS_DATA = {
  subject: 'Physics - Wave Optics',
  totalStudents: 48,
  activeNow: 43,
  avgMastery: 67,
  confusionAlert: true,
};

const CONCEPT_HEATMAP = [
  { concept: 'Wave Nature of Light', mastery: 82, confusion: 12, students: 48 },
  { concept: 'Interference', mastery: 45, confusion: 61, students: 46 },
  { concept: 'Diffraction', mastery: 38, confusion: 74, students: 44 },
  { concept: 'Polarization', mastery: 29, confusion: 83, students: 41 },
  { concept: 'Huygens Principle', mastery: 55, confusion: 42, students: 45 },
  { concept: 'Young\'s Double Slit', mastery: 70, confusion: 28, students: 47 },
];

const INITIAL_STUDENTS = [
  { id: 'fallback_1', name: 'Ravi Kumar', risk: 'HIGH', reason: 'No activity in 4 days', subject: 'Physics', days: 4, avatar: '👦', assignedTopic: 'None' },
  { id: 'fallback_2', name: 'Priya Singh', risk: 'MEDIUM', reason: 'Consistently confused on Optics', subject: 'Physics', days: 2, avatar: '👧', assignedTopic: 'None' },
  { id: 'fallback_3', name: 'Arjun Patel', risk: 'HIGH', reason: 'Rapid mastery drop (-23%)', subject: 'Math', days: 1, avatar: '🧑', assignedTopic: 'None' },
];

export default function TeacherPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'heatmap' | 'atrisk' | 'aiplan'>('overview');
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [interveneStudent, setInterveneStudent] = useState<string | null>(null);
  const [interveneStudentId, setInterveneStudentId] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('Diffraction Micro-Lab');
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [lessonPlanApproved, setLessonPlanApproved] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace('/login');
      return;
    }

    if (session.role !== 'teacher') {
      router.replace('/dashboard');
      return;
    }

    setCurrentUser(session);
    try {
      const allStudents = getAllStudents(session);
      const mappedStudents = allStudents.map((student, index) => ({
        id: student.id,
        name: student.username,
        risk: student.weaknesses.length > 2 ? 'HIGH' : student.weaknesses.length > 0 ? 'MEDIUM' : 'RESOLVED',
        reason: student.weaknesses.length > 0 ? `${student.weaknesses[0]} needs focus` : 'Strong learning momentum',
        subject: student.role === 'school' ? 'Science' : student.role === 'college' ? 'Computer Science' : student.role === 'aspirant' ? 'Exam Prep' : 'Career Skills',
        days: index % 3 === 0 ? 4 : index % 3 === 1 ? 2 : 1,
        avatar: student.role === 'school' ? '👦' : student.role === 'college' ? '👩‍🎓' : student.role === 'aspirant' ? '🧑‍🎓' : '💡',
        assignedTopic: student.assignedTopics[0] || 'None',
      }));
      setStudents(mappedStudents.length > 0 ? mappedStudents : INITIAL_STUDENTS);
    } catch {
      setStudents(INITIAL_STUDENTS);
    }
  }, [router]);

  const handleAssignTopic = () => {
    if (!interveneStudent || !interveneStudentId) return;
    if (!assignTopicToStudent(interveneStudentId, selectedTopic)) return;
    setStudents(prev => prev.map(s => s.name === interveneStudent ? { ...s, assignedTopic: selectedTopic, risk: 'RESOLVED' } : s));
    setAssignSuccess(true);
    setTimeout(() => {
      setAssignSuccess(false);
      setInterveneStudent(null);
      setInterveneStudentId(null);
    }, 1500);
  };

  return (
    <div style={{ background: 'var(--nexus-void)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(168,85,247,0.2)', background: 'rgba(2,4,8,0.9)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#a855f7' }}>🪄 Institutional & Teacher Portal</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-slow 1s infinite' }} />
          <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>{CLASS_DATA.activeNow} students online</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '16px 32px 0', display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { id: 'overview', label: '📊 Overview', color: '#0066ff' },
          { id: 'heatmap', label: '🔥 Confusion Heatmap', color: '#ef4444' },
          { id: 'atrisk', label: '⚠️ At-Risk Students & Assign Topics', color: '#f59e0b' },
          { id: 'aiplan', label: '🤖 AI Lesson Plan', color: '#a855f7' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTab(t.id as any)}
            style={{
              padding: '10px 20px', borderRadius: '10px 10px 0 0', border: 'none',
              background: selectedTab === t.id ? `${t.color}15` : 'transparent',
              borderBottom: selectedTab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
              color: selectedTab === t.id ? t.color : 'rgba(255,255,255,0.4)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 24px' }}>

        {selectedTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'Enrolled Students', val: '48', color: '#0066ff', icon: '👥' },
              { label: 'Class Average Mastery', val: '67%', color: '#10b981', icon: '📈' },
              { label: 'Students Struggling', val: `${students.filter(s => s.risk !== 'RESOLVED').length}`, color: '#f59e0b', icon: '⚠️' },
              { label: 'AI Peer Videos Deployed', val: '12', color: '#a855f7', icon: '🎥' },
            ].map(s => (
              <div key={s.label} className="metric-card">
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Space Grotesk', color: s.color, marginBottom: 2 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'heatmap' && (
          <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, margin: '0 0 16px', color: '#ef4444' }}>🔥 Concept Confusion Heatmap</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {CONCEPT_HEATMAP.map(item => (
                <div key={item.concept} style={{ display: 'grid', gridTemplateColumns: '190px 1fr 90px', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{item.concept}</span>
                  <div style={{ height: 16, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.confusion}%`, background: `linear-gradient(90deg, #f59e0b, ${item.confusion > 60 ? '#ef4444' : '#10b981'})` }} />
                  </div>
                  <span style={{ fontSize: 11, color: item.confusion > 60 ? '#ef4444' : '#10b981', fontWeight: 700 }}>{item.confusion}% confused</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'atrisk' && (
          <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#f59e0b' }}>
              ⚠️ At-Risk Students & Targeted Topic Assignment
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {students.map(s => (
                <div key={s.name} style={{ padding: 18, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 32 }}>{s.avatar}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{s.reason} · Assigned: <strong style={{ color: '#00d4ff' }}>{s.assignedTopic}</strong></div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setInterveneStudent(s.name);
                      setInterveneStudentId(s.id);
                    }}
                    style={{ padding: '8px 16px', borderRadius: 8, background: s.risk === 'RESOLVED' ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #f59e0b, #f97316)', border: 'none', color: s.risk === 'RESOLVED' ? '#10b981' : 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}
                  >
                    {s.risk === 'RESOLVED' ? '✓ Assigned' : '💬 Assign Targeted Topic'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'aiplan' && (
          <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#a855f7', marginBottom: 12 }}>
              🤖 AI-Generated Adaptive Lesson Plan
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>
              Auto-crafted based on class confusion heatmap on Diffraction & Wave Interference.
            </p>

            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20, fontSize: 13, lineHeight: 1.8 }}>
              1. <strong>09:00 AM</strong> — 10-Min 3D Wave Interference Interactive Demo (`/virtuallab`) <br />
              2. <strong>09:10 AM</strong> — Address Diffraction Confusion (44 students) using real-world ambulance analogy <br />
              3. <strong>09:30 AM</strong> — Auto-deploy 5-question adaptive quiz to student dashboards
            </div>

            <button
              onClick={() => setLessonPlanApproved(true)}
              style={{ padding: '12px 24px', borderRadius: 10, background: lessonPlanApproved ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #a855f7, #7c3aed)', border: lessonPlanApproved ? '1px solid #10b981' : 'none', color: lessonPlanApproved ? '#10b981' : 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}
            >
              {lessonPlanApproved ? '✅ Lesson Plan Scheduled & Deployed!' : '⚡ Approve & Broadcast Lesson Plan'}
            </button>
          </div>
        )}
      </div>

      {/* Intervention Modal */}
      {interveneStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: 450, padding: 28, borderRadius: 20, background: '#0a1628', border: '1px solid rgba(0,212,255,0.3)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#00d4ff', marginBottom: 12 }}>
              Assign Topic to {interveneStudent}
            </h3>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Select Targeted Module:</label>
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none', marginBottom: 20, fontFamily: 'Outfit' }}
            >
              <option value="Diffraction Micro-Lab">Diffraction Micro-Lab (3D Simulation)</option>
              <option value="Quadratic Equation Basics">Quadratic Equation Basics (Practice Studio)</option>
              <option value="Rotational Dynamics Video">Rotational Dynamics Video (Rewind Detector)</option>
            </select>

            {assignSuccess && <div style={{ fontSize: 13, color: '#10b981', fontWeight: 700, marginBottom: 14 }}>✓ Topic assigned to {interveneStudent}&apos;s dashboard!</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setInterveneStudent(null); setInterveneStudentId(null); }} style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAssignTopic} style={{ padding: '8px 20px', borderRadius: 8, background: '#0066ff', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Assign Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
