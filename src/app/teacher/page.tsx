'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { assignTopicToStudent, getAllStudents, getStoredSession, type UserProfile } from '@/lib/authStore';
import {
  getTeacherCustomTopics,
  saveTeacherCustomTopic,
  type TeacherTopicPayload,
  type QuizQuestion,
} from '@/lib/syllabusData';

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
  { concept: "Young's Double Slit", mastery: 70, confusion: 28, students: 47 },
];

const INITIAL_STUDENTS = [
  { id: 'fallback_1', name: 'Ravi Kumar', risk: 'HIGH', reason: 'No activity in 4 days', subject: 'Physics', days: 4, avatar: '👦', assignedTopic: 'None' },
  { id: 'fallback_2', name: 'Priya Singh', risk: 'MEDIUM', reason: 'Consistently confused on Optics', subject: 'Physics', days: 2, avatar: '👧', assignedTopic: 'None' },
  { id: 'fallback_3', name: 'Arjun Patel', risk: 'HIGH', reason: 'Rapid mastery drop (-23%)', subject: 'Math', days: 1, avatar: '🧑', assignedTopic: 'None' },
];

const LAB_OPTIONS = [
  { label: 'Physics Virtual Lab', route: '/virtuallab' },
  { label: 'Code Playground', route: '/code' },
  { label: '3D Universe Lab', route: '/universe' },
  { label: 'Biology / Chemistry Lab', route: '/virtuallab?mode=chemistry' },
  { label: 'No Lab (Video Only)', route: '' },
];

const BLANK_QUIZ: QuizQuestion = { id: Date.now(), type: 'mcq', question: '', options: ['', '', '', ''], correct: 0, explanation: '' };

export default function TeacherPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'heatmap' | 'atrisk' | 'aiplan' | 'content'>('overview');
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [interveneStudent, setInterveneStudent] = useState<string | null>(null);
  const [interveneStudentId, setInterveneStudentId] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('Diffraction Micro-Lab');
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [lessonPlanApproved, setLessonPlanApproved] = useState(false);

  // Content Manager State
  const [customTopics, setCustomTopics] = useState<TeacherTopicPayload[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Form fields
  const [form, setForm] = useState({
    title: '',
    subject: '',
    description: '',
    youtubeId: '',
    durationMinutes: 10,
    labRoute: '',
    keyConcepts: '',
    targetRole: 'all' as TeacherTopicPayload['targetRole'],
  });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([{ ...BLANK_QUIZ, id: 1 }]);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) { router.replace('/login'); return; }
    if (session.role !== 'teacher') { router.replace('/dashboard'); return; }
    setCurrentUser(session);
    loadCustomTopics();
    try {
      const allStudents = getAllStudents(session);
      const mapped = allStudents.map((student, index) => ({
        id: student.id,
        name: student.username,
        risk: student.weaknesses.length > 2 ? 'HIGH' : student.weaknesses.length > 0 ? 'MEDIUM' : 'RESOLVED',
        reason: student.weaknesses.length > 0 ? `${student.weaknesses[0]} needs focus` : 'Strong learning momentum',
        subject: student.role === 'school' ? 'Science' : student.role === 'college' ? 'Computer Science' : student.role === 'aspirant' ? 'Exam Prep' : 'Career Skills',
        days: index % 3 === 0 ? 4 : index % 3 === 1 ? 2 : 1,
        avatar: student.role === 'school' ? '👦' : student.role === 'college' ? '👩‍🎓' : student.role === 'aspirant' ? '🧑‍🎓' : '💡',
        assignedTopic: student.assignedTopics[0] || 'None',
      }));
      setStudents(mapped.length > 0 ? mapped : INITIAL_STUDENTS);
    } catch { setStudents(INITIAL_STUDENTS); }
  }, [router]);

  const loadCustomTopics = () => {
    setCustomTopics(getTeacherCustomTopics());
  };

  const handleAssignTopic = () => {
    if (!interveneStudent || !interveneStudentId) return;
    if (!assignTopicToStudent(interveneStudentId, selectedTopic)) return;
    setStudents(prev => prev.map(s => s.name === interveneStudent ? { ...s, assignedTopic: selectedTopic, risk: 'RESOLVED' } : s));
    setAssignSuccess(true);
    setTimeout(() => { setAssignSuccess(false); setInterveneStudent(null); setInterveneStudentId(null); }, 1500);
  };

  const resetForm = () => {
    setForm({ title: '', subject: '', description: '', youtubeId: '', durationMinutes: 10, labRoute: '', keyConcepts: '', targetRole: 'all' });
    setQuizQuestions([{ ...BLANK_QUIZ, id: 1 }]);
    setEditingTopicId(null);
  };

  const handleEditTopic = (t: TeacherTopicPayload) => {
    setForm({
      title: t.title,
      subject: t.subject,
      description: t.description,
      youtubeId: t.youtubeId,
      durationMinutes: t.durationMinutes,
      labRoute: t.labRoute || '',
      keyConcepts: t.keyConcepts.join(', '),
      targetRole: t.targetRole,
    });
    setQuizQuestions(t.customQuiz && t.customQuiz.length > 0 ? t.customQuiz : [{ ...BLANK_QUIZ, id: 1 }]);
    setEditingTopicId(t.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTopic = (id: string) => {
    const updated = customTopics.filter(t => t.id !== id);
    localStorage.setItem('nexus_teacher_topics', JSON.stringify(updated));
    setCustomTopics(updated);
    setDeleteConfirm(null);
  };

  const handleSaveTopic = () => {
    if (!form.title.trim() || !form.subject.trim() || !form.youtubeId.trim()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return;
    }
    setSaveStatus('saving');
    const topicId = editingTopicId || `teacher_${Date.now()}`;
    const payload: TeacherTopicPayload = {
      id: topicId,
      title: form.title.trim(),
      subject: form.subject.trim(),
      description: form.description.trim(),
      youtubeId: form.youtubeId.trim(),
      embedUrl: `https://www.youtube.com/embed/${form.youtubeId.trim()}?rel=0&modestbranding=1`,
      durationMinutes: Number(form.durationMinutes) || 10,
      labRoute: form.labRoute || undefined,
      keyConcepts: form.keyConcepts.split(',').map(k => k.trim()).filter(Boolean),
      targetRole: form.targetRole,
      createdByTeacher: currentUser?.username || 'Teacher',
      createdAt: new Date().toISOString(),
      customQuiz: quizQuestions.filter(q => q.question.trim()),
    };
    saveTeacherCustomTopic(payload);
    setTimeout(() => {
      setSaveStatus('saved');
      loadCustomTopics();
      resetForm();
      setShowAddForm(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);
  };

  const addQuizQuestion = () => {
    setQuizQuestions(prev => [...prev, { ...BLANK_QUIZ, id: prev.length + 1 }]);
  };

  const updateQuizQuestion = (idx: number, field: keyof QuizQuestion, value: string | number | string[]) => {
    setQuizQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const updateQuizOption = (qIdx: number, optIdx: number, value: string) => {
    setQuizQuestions(prev => prev.map((q, i) => i === qIdx
      ? { ...q, options: q.options.map((o, j) => j === optIdx ? value : o) }
      : q
    ));
  };

  const removeQuizQuestion = (idx: number) => {
    setQuizQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
    color: 'white', fontSize: 13, outline: 'none', fontFamily: 'Outfit',
    boxSizing: 'border-box' as const,
  };
  const labelStyle = { fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' as const };

  return (
    <div style={{ background: 'var(--nexus-void)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white' }}>
      {/* Header */}
      <div style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(168,85,247,0.2)', background: 'rgba(2,4,8,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#a855f7' }}>🪄 Teacher Control Center</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            👤 {currentUser?.username || 'Teacher'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-slow 1s infinite' }} />
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{CLASS_DATA.activeNow} students online</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '16px 32px 0', display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: '📊 Overview', color: '#0066ff' },
          { id: 'content', label: '📚 Add Content', color: '#10b981' },
          { id: 'heatmap', label: '🔥 Confusion Heatmap', color: '#ef4444' },
          { id: 'atrisk', label: '⚠️ At-Risk Students', color: '#f59e0b' },
          { id: 'aiplan', label: '🤖 AI Lesson Plan', color: '#a855f7' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTab(t.id as typeof selectedTab)}
            style={{
              padding: '10px 18px', borderRadius: '10px 10px 0 0', border: 'none',
              background: selectedTab === t.id ? `${t.color}20` : 'transparent',
              borderBottom: selectedTab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
              color: selectedTab === t.id ? t.color : 'rgba(255,255,255,0.4)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit',
            }}
          >{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── OVERVIEW TAB ── */}
        {selectedTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Enrolled Students', val: '48', color: '#0066ff', icon: '👥' },
                { label: 'Class Average Mastery', val: '67%', color: '#10b981', icon: '📈' },
                { label: 'Custom Topics Published', val: String(customTopics.length), color: '#10b981', icon: '📚' },
                { label: 'Students Struggling', val: String(students.filter(s => s.risk !== 'RESOLVED').length), color: '#f59e0b', icon: '⚠️' },
                { label: 'AI Peer Videos', val: '12', color: '#a855f7', icon: '🎥' },
              ].map(s => (
                <div key={s.label} className="metric-card">
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Space Grotesk', color: s.color, marginBottom: 2 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div style={{ padding: 20, borderRadius: 16, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#10b981', fontFamily: 'Space Grotesk' }}>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { label: '📚 Add Topic / Video', action: () => { setSelectedTab('content'); setShowAddForm(true); }, color: '#10b981' },
                  { label: '⚠️ View At-Risk Students', action: () => setSelectedTab('atrisk'), color: '#f59e0b' },
                  { label: '🔥 Confusion Heatmap', action: () => setSelectedTab('heatmap'), color: '#ef4444' },
                  { label: '🤖 AI Lesson Plan', action: () => setSelectedTab('aiplan'), color: '#a855f7' },
                ].map(btn => (
                  <button key={btn.label} onClick={btn.action} style={{ padding: '8px 16px', borderRadius: 8, background: `${btn.color}15`, border: `1px solid ${btn.color}40`, color: btn.color, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit' }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CONTENT MANAGEMENT TAB ── */}
        {selectedTab === 'content' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 20, color: '#10b981' }}>
                  📚 Teacher Content Management
                </h2>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  Add topics, YouTube videos, 3D labs, and quizzes — broadcast to any student role group
                </p>
              </div>
              <button
                onClick={() => { resetForm(); setShowAddForm(v => !v); }}
                style={{ padding: '10px 20px', borderRadius: 10, background: showAddForm ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                {showAddForm ? '✕ Cancel' : '＋ Add New Content'}
              </button>
            </div>

            {/* ── ADD / EDIT FORM ── */}
            {showAddForm && (
              <div style={{ padding: 24, borderRadius: 20, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 28 }}>
                <h3 style={{ margin: '0 0 20px', fontFamily: 'Space Grotesk', fontSize: 16, color: '#10b981' }}>
                  {editingTopicId ? '✏️ Edit Content' : '➕ Add New Content'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  {/* Title */}
                  <div>
                    <label style={labelStyle}>Topic Title *</label>
                    <input style={inputStyle} placeholder="e.g. Newton's Laws of Motion" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  {/* Subject */}
                  <div>
                    <label style={labelStyle}>Subject *</label>
                    <input style={inputStyle} placeholder="e.g. Physics, Chemistry, Math" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                  </div>
                  {/* YouTube ID */}
                  <div>
                    <label style={labelStyle}>YouTube Video ID *</label>
                    <input style={inputStyle} placeholder="e.g. h4OnBYrbCjY (from URL)" value={form.youtubeId} onChange={e => setForm(f => ({ ...f, youtubeId: e.target.value }))} />
                    {form.youtubeId.trim() && (
                      <a href={`https://www.youtube.com/watch?v=${form.youtubeId.trim()}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#00d4ff', marginTop: 4, display: 'block' }}>
                        🔗 Preview video ↗
                      </a>
                    )}
                  </div>
                  {/* Duration */}
                  <div>
                    <label style={labelStyle}>Duration (minutes)</label>
                    <input style={inputStyle} type="number" min={1} max={180} value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))} />
                  </div>
                  {/* Target Role */}
                  <div>
                    <label style={labelStyle}>Target Student Role</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value as TeacherTopicPayload['targetRole'] }))}>
                      <option value="all">🌐 All Students (School + College + Aspirant + Skill)</option>
                      <option value="school">🏫 School Students (Class 9–12)</option>
                      <option value="college">🎓 College Students (UG/PG)</option>
                      <option value="aspirant">📝 Exam Aspirants (NEET / JEE / UPSC)</option>
                      <option value="skill">💼 Skill Learners (Career / Jobs)</option>
                    </select>
                  </div>
                  {/* 3D Lab Route */}
                  <div>
                    <label style={labelStyle}>3D Virtual Lab (optional)</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.labRoute} onChange={e => setForm(f => ({ ...f, labRoute: e.target.value }))}>
                      {LAB_OPTIONS.map(o => <option key={o.route} value={o.route}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Description</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="What will students learn in this topic?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                {/* Key Concepts */}
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Key Concepts (comma-separated)</label>
                  <input style={inputStyle} placeholder="e.g. Force, Acceleration, Inertia, Mass" value={form.keyConcepts} onChange={e => setForm(f => ({ ...f, keyConcepts: e.target.value }))} />
                </div>

                {/* Quiz Builder */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#a855f7', fontFamily: 'Space Grotesk' }}>📋 Quiz Questions (Optional)</h4>
                    <button onClick={addQuizQuestion} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>＋ Add Question</button>
                  </div>

                  {quizQuestions.map((q, qi) => (
                    <div key={qi} style={{ padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#a855f7' }}>Q{qi + 1}</span>
                        {quizQuestions.length > 1 && (
                          <button onClick={() => removeQuizQuestion(qi)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'Outfit' }}>Remove</button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 10 }}>
                        <input
                          style={inputStyle}
                          placeholder="Question text…"
                          value={q.question}
                          onChange={e => updateQuizQuestion(qi, 'question', e.target.value)}
                        />
                        <select
                          style={{ ...inputStyle, width: 130, cursor: 'pointer' }}
                          value={q.type}
                          onChange={e => updateQuizQuestion(qi, 'type', e.target.value)}
                        >
                          <option value="mcq">MCQ</option>
                          <option value="truefalse">True/False</option>
                          <option value="fillinblank">Fill in Blank</option>
                        </select>
                      </div>

                      {q.type === 'mcq' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                          {q.options.map((opt, oi) => (
                            <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <input
                                type="radio"
                                name={`correct_${qi}`}
                                checked={q.correct === oi}
                                onChange={() => updateQuizQuestion(qi, 'correct', oi)}
                                style={{ accentColor: '#10b981', cursor: 'pointer' }}
                                title="Mark as correct"
                              />
                              <input
                                style={{ ...inputStyle, fontSize: 12 }}
                                placeholder={`Option ${oi + 1}`}
                                value={opt}
                                onChange={e => updateQuizOption(qi, oi, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === 'truefalse' && (
                        <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>
                          {['True', 'False'].map((opt, oi) => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                              <input type="radio" name={`tf_${qi}`} checked={q.correct === oi} onChange={() => updateQuizQuestion(qi, 'correct', oi)} style={{ accentColor: '#10b981' }} />
                              {opt}
                            </label>
                          ))}
                        </div>
                      )}

                      {q.type === 'fillinblank' && (
                        <div style={{ marginBottom: 10 }}>
                          <label style={labelStyle}>Correct Answer</label>
                          <input style={inputStyle} placeholder="Correct fill-in answer" value={q.fillAnswer || ''} onChange={e => updateQuizQuestion(qi, 'fillAnswer', e.target.value)} />
                        </div>
                      )}

                      <div>
                        <label style={labelStyle}>Explanation (shown after answer)</label>
                        <input style={inputStyle} placeholder="Why is this the correct answer?" value={q.explanation} onChange={e => updateQuizQuestion(qi, 'explanation', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save Actions */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button
                    onClick={handleSaveTopic}
                    disabled={saveStatus === 'saving'}
                    style={{
                      padding: '12px 28px', borderRadius: 10,
                      background: saveStatus === 'saved' ? 'rgba(16,185,129,0.3)' : saveStatus === 'error' ? 'rgba(239,68,68,0.3)' : 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit',
                    }}
                  >
                    {saveStatus === 'saving' ? '⏳ Publishing...' : saveStatus === 'saved' ? '✅ Published to Students!' : saveStatus === 'error' ? '❌ Missing required fields' : editingTopicId ? '✏️ Update & Re-publish' : '📤 Publish to All Students'}
                  </button>
                  <button
                    onClick={() => { resetForm(); setShowAddForm(false); }}
                    style={{ padding: '12px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Outfit' }}
                  >Cancel</button>
                </div>
              </div>
            )}

            {/* ── EXISTING CUSTOM TOPICS LIST ── */}
            <div>
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 700, color: 'white', margin: '0 0 16px' }}>
                📖 Published Content ({customTopics.length} items)
              </h3>

              {customTopics.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>No custom content published yet.</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Use ＋ Add New Content above to publish your first topic!</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {customTopics.map(t => (
                    <div key={t.id} style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(16,185,129,0.15)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 18 }}>🎬</span>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{t.title}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                              {t.subject} · {t.durationMinutes} min · {t.labRoute ? '🔬 Lab Linked' : '📺 Video Only'} · {t.customQuiz?.length || 0} quiz questions
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                            {t.targetRole === 'all' ? '🌐 All Students' : t.targetRole === 'school' ? '🏫 School' : t.targetRole === 'college' ? '🎓 College' : t.targetRole === 'aspirant' ? '📝 Aspirant' : '💼 Skill'}
                          </span>
                          {t.keyConcepts.slice(0, 3).map(k => (
                            <span key={k} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, background: 'rgba(0,102,255,0.12)', color: '#60a5fa' }}>{k}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <a
                            href={`https://www.youtube.com/watch?v=${t.youtubeId}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                          >▶ Preview</a>
                          <button
                            onClick={() => handleEditTopic(t)}
                            style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(0,102,255,0.15)', border: '1px solid rgba(0,102,255,0.3)', color: '#60a5fa', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit' }}
                          >✏️ Edit</button>
                          <button
                            onClick={() => setDeleteConfirm(t.id)}
                            style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit' }}
                          >🗑 Delete</button>
                        </div>
                        {t.createdAt && (
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                            Added {new Date(t.createdAt).toLocaleDateString('en-IN')} by {t.createdByTeacher}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HEATMAP TAB ── */}
        {selectedTab === 'heatmap' && (
          <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, margin: '0 0 16px', color: '#ef4444' }}>🔥 Concept Confusion Heatmap</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {CONCEPT_HEATMAP.map(item => (
                <div key={item.concept} style={{ display: 'grid', gridTemplateColumns: '190px 1fr 110px', gap: 12, alignItems: 'center' }}>
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

        {/* ── AT-RISK TAB ── */}
        {selectedTab === 'atrisk' && (
          <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#f59e0b' }}>⚠️ At-Risk Students & Targeted Topic Assignment</h3>
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
                    onClick={() => { setInterveneStudent(s.name); setInterveneStudentId(s.id); }}
                    style={{ padding: '8px 16px', borderRadius: 8, background: s.risk === 'RESOLVED' ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #f59e0b, #f97316)', border: 'none', color: s.risk === 'RESOLVED' ? '#10b981' : 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}
                  >{s.risk === 'RESOLVED' ? '✓ Assigned' : '💬 Assign Targeted Topic'}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AI PLAN TAB ── */}
        {selectedTab === 'aiplan' && (
          <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#a855f7', marginBottom: 12 }}>🤖 AI-Generated Adaptive Lesson Plan</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>Auto-crafted based on class confusion heatmap on Diffraction & Wave Interference.</p>
            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20, fontSize: 13, lineHeight: 1.8 }}>
              1. <strong>09:00 AM</strong> — 10-Min 3D Wave Interference Interactive Demo (<code>/virtuallab</code>) <br />
              2. <strong>09:10 AM</strong> — Address Diffraction Confusion (44 students) using real-world ambulance analogy <br />
              3. <strong>09:30 AM</strong> — Auto-deploy 5-question adaptive quiz to student dashboards <br />
              4. <strong>09:45 AM</strong> — Assign custom teacher content to struggling students
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

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: 380, padding: 28, borderRadius: 20, background: '#0a1628', border: '1px solid rgba(239,68,68,0.4)' }}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#ef4444', textAlign: 'center', marginBottom: 10 }}>Delete this topic?</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 20 }}>This will remove the content from all student dashboards permanently.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '8px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', fontFamily: 'Outfit' }}>Cancel</button>
              <button onClick={() => handleDeleteTopic(deleteConfirm)} style={{ padding: '8px 20px', borderRadius: 8, background: '#ef4444', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>🗑 Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN TOPIC MODAL ── */}
      {interveneStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: 450, padding: 28, borderRadius: 20, background: '#0a1628', border: '1px solid rgba(0,212,255,0.3)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#00d4ff', marginBottom: 12 }}>Assign Topic to {interveneStudent}</h3>
            <label style={labelStyle}>Select Targeted Module:</label>
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              style={{ ...inputStyle, marginBottom: 20, cursor: 'pointer' }}
            >
              <option value="Diffraction Micro-Lab">Diffraction Micro-Lab (3D Simulation)</option>
              <option value="Quadratic Equation Basics">Quadratic Equation Basics (Practice Studio)</option>
              <option value="Rotational Dynamics Video">Rotational Dynamics Video (Rewind Detector)</option>
              {customTopics.map(t => (
                <option key={t.id} value={t.title}>📚 {t.title} (Teacher Content)</option>
              ))}
            </select>
            {assignSuccess && <div style={{ fontSize: 13, color: '#10b981', fontWeight: 700, marginBottom: 14 }}>✓ Topic assigned to {interveneStudent}&apos;s dashboard!</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setInterveneStudent(null); setInterveneStudentId(null); }} style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', fontFamily: 'Outfit' }}>Cancel</button>
              <button onClick={handleAssignTopic} style={{ padding: '8px 20px', borderRadius: 8, background: '#0066ff', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>Assign Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
