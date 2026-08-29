'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { assignTopicToStudent, getAllStudents, getStoredSession, type UserProfile } from '@/lib/authStore';
import {
  getTeacherCustomTopics,
  saveTeacherCustomTopic,
  type TeacherTopicPayload,
  type QuizQuestion,
} from '@/lib/syllabusData';
import { storeVideoBlob } from '@/lib/videoStore';

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

// Helper to extract YouTube ID from any format (embed, youtu.be, watch?v=)
function extractYouTubeId(urlOrId: string): string {
  const trimmed = urlOrId.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : trimmed;
}

export default function TeacherPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Video Source Mode: 'file' | 'direct_url' | 'youtube'
  const [videoSourceType, setVideoSourceType] = useState<'file' | 'direct_url' | 'youtube'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  // Form fields
  const [form, setForm] = useState({
    title: '',
    subject: '',
    description: '',
    youtubeIdOrUrl: '',
    directVideoUrl: '',
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

  const loadCustomTopics = async () => {
    const { fetchTeacherTopicsCloud } = await import('@/lib/syllabusData');
    const topics = await fetchTeacherTopicsCloud();
    setCustomTopics(topics);
  };

  const handleAssignTopic = () => {
    if (!interveneStudent || !interveneStudentId) return;
    if (!assignTopicToStudent(interveneStudentId, selectedTopic)) return;
    setStudents(prev => prev.map(s => s.name === interveneStudent ? { ...s, assignedTopic: selectedTopic, risk: 'RESOLVED' } : s));
    setAssignSuccess(true);
    setTimeout(() => { setAssignSuccess(false); setInterveneStudent(null); setInterveneStudentId(null); }, 1500);
  };

  const resetForm = () => {
    setForm({ title: '', subject: '', description: '', youtubeIdOrUrl: '', directVideoUrl: '', durationMinutes: 10, labRoute: '', keyConcepts: '', targetRole: 'all' });
    setQuizQuestions([{ ...BLANK_QUIZ, id: 1 }]);
    setEditingTopicId(null);
    setSelectedFile(null);
    setVideoPreviewUrl(null);
    setVideoSourceType('file');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const objUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(objUrl);
    }
  };

  const handleEditTopic = (t: TeacherTopicPayload) => {
    setForm({
      title: t.title,
      subject: t.subject,
      description: t.description,
      youtubeIdOrUrl: t.youtubeId || '',
      directVideoUrl: t.videoUrl || '',
      durationMinutes: t.durationMinutes,
      labRoute: t.labRoute || '',
      keyConcepts: t.keyConcepts.join(', '),
      targetRole: t.targetRole,
    });
    if (t.videoSource === 'local' || t.uploadedVideoData) {
      setVideoSourceType('file');
      setVideoPreviewUrl(t.videoUrl || null);
    } else if (t.videoSource === 'direct' || t.videoUrl) {
      setVideoSourceType('direct_url');
      setVideoPreviewUrl(t.videoUrl || null);
    } else {
      setVideoSourceType('youtube');
      setVideoPreviewUrl(null);
    }
    setQuizQuestions(t.customQuiz && t.customQuiz.length > 0 ? t.customQuiz : [{ ...BLANK_QUIZ, id: 1 }]);
    setEditingTopicId(t.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTopic = async (id: string) => {
    const { deleteTeacherCustomTopic } = await import('@/lib/syllabusData');
    deleteTeacherCustomTopic(id);
    setCustomTopics(prev => prev.filter(t => t.id !== id));
    setDeleteConfirm(null);
  };

  const handleSaveTopic = async () => {
    if (!form.title.trim() || !form.subject.trim()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return;
    }

    // Validation based on video source
    if (videoSourceType === 'file' && !selectedFile && !videoPreviewUrl) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return;
    }
    if (videoSourceType === 'direct_url' && !form.directVideoUrl.trim()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return;
    }
    if (videoSourceType === 'youtube' && !form.youtubeIdOrUrl.trim()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return;
    }

    setSaveStatus('saving');
    const topicId = editingTopicId || `teacher_${Date.now()}`;
    let finalVideoUrl = '';
    let finalVideoSource: 'local' | 'direct' | 'youtube' = 'youtube';
    let cleanYoutubeId = '';

    if (videoSourceType === 'file' && selectedFile) {
      // Store in IndexedDB for permanent local in-app playback
      const storedUrl = await storeVideoBlob(topicId, selectedFile);
      finalVideoUrl = storedUrl;
      finalVideoSource = 'local';
    } else if (videoSourceType === 'direct_url') {
      finalVideoUrl = form.directVideoUrl.trim();
      finalVideoSource = 'direct';
    } else {
      cleanYoutubeId = extractYouTubeId(form.youtubeIdOrUrl);
      finalVideoSource = 'youtube';
    }

    const payload: TeacherTopicPayload = {
      id: topicId,
      title: form.title.trim(),
      subject: form.subject.trim(),
      description: form.description.trim(),
      youtubeId: cleanYoutubeId || 'h4OnBYrbCjY',
      embedUrl: cleanYoutubeId ? `https://www.youtube.com/embed/${cleanYoutubeId}?rel=0&modestbranding=1` : '',
      videoUrl: finalVideoUrl || undefined,
      videoSource: finalVideoSource,
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
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
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
          { id: 'content', label: '📚 Add / Manage Content', color: '#10b981' },
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
                  { label: '📚 Upload & Publish Video Content', action: () => { setSelectedTab('content'); setShowAddForm(true); }, color: '#10b981' },
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
                  📚 Teacher Content Management & Video Upload
                </h2>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  Upload video files directly or link media — students watch 100% inside the platform with zero YouTube restrictions
                </p>
              </div>
              <button
                onClick={() => { resetForm(); setShowAddForm(v => !v); }}
                style={{ padding: '10px 20px', borderRadius: 10, background: showAddForm ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                {showAddForm ? '✕ Cancel' : '＋ Upload / Add New Content'}
              </button>
            </div>

            {/* ── ADD / EDIT FORM ── */}
            {showAddForm && (
              <div style={{ padding: 24, borderRadius: 20, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 28 }}>
                <h3 style={{ margin: '0 0 20px', fontFamily: 'Space Grotesk', fontSize: 16, color: '#10b981' }}>
                  {editingTopicId ? '✏️ Edit Content' : '➕ Upload & Publish New Video Lecture'}
                </h3>

                {/* Video Source Type Selector */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Choose Video Source Type:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                    {[
                      { id: 'file', label: '📁 Upload Video File (MP4/WebM)', desc: '100% In-Platform Playback (Recommended)', color: '#10b981' },
                      { id: 'direct_url', label: '🔗 Direct Video Link (MP4/WebM)', desc: 'Cloudinary, S3, or CDN URL', color: '#00d4ff' },
                      { id: 'youtube', label: '🔴 YouTube Link / ID', desc: 'Auto-extracted video link', color: '#f59e0b' },
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setVideoSourceType(st.id as typeof videoSourceType)}
                        style={{
                          padding: 14, borderRadius: 12, textAlign: 'left',
                          background: videoSourceType === st.id ? `${st.color}20` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${videoSourceType === st.id ? st.color : 'rgba(255,255,255,0.1)'}`,
                          cursor: 'pointer', fontFamily: 'Outfit',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: videoSourceType === st.id ? st.color : 'white', fontSize: 13 }}>{st.label}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{st.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video Source Input based on Mode */}
                <div style={{ marginBottom: 20, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {videoSourceType === 'file' && (
                    <div>
                      <label style={labelStyle}>Select Video File from Computer (MP4, WebM, MOV):</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                        onChange={handleFileChange}
                        style={{ ...inputStyle, padding: 12, cursor: 'pointer' }}
                      />
                      {selectedFile && (
                        <div style={{ marginTop: 10, fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                          ✓ Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                      )}
                    </div>
                  )}

                  {videoSourceType === 'direct_url' && (
                    <div>
                      <label style={labelStyle}>Direct Video URL (MP4 / WebM):</label>
                      <input
                        style={inputStyle}
                        placeholder="https://example.com/lecture-wave-optics.mp4"
                        value={form.directVideoUrl}
                        onChange={e => {
                          setForm(f => ({ ...f, directVideoUrl: e.target.value }));
                          setVideoPreviewUrl(e.target.value.trim() || null);
                        }}
                      />
                    </div>
                  )}

                  {videoSourceType === 'youtube' && (
                    <div>
                      <label style={labelStyle}>YouTube Link or Video ID:</label>
                      <input
                        style={inputStyle}
                        placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=0a8gjbn33rM) or ID"
                        value={form.youtubeIdOrUrl}
                        onChange={e => setForm(f => ({ ...f, youtubeIdOrUrl: e.target.value }))}
                      />
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                        ℹ️ Tip: Uploading an MP4 file directly guarantees students will never see &quot;Playback on other websites disabled&quot;.
                      </div>
                    </div>
                  )}

                  {/* Video Live Preview inside Teacher Form */}
                  {videoPreviewUrl && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginBottom: 6 }}>
                        📺 In-Platform Video Preview (Plays seamlessly inside app):
                      </div>
                      <video
                        src={videoPreviewUrl}
                        controls
                        style={{ width: '100%', maxHeight: 240, borderRadius: 10, background: '#000' }}
                      />
                    </div>
                  )}
                </div>

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
                  <div style={{ gridColumn: 'span 2' }}>
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
                    {saveStatus === 'saving' ? '⏳ Publishing...' : saveStatus === 'saved' ? '✅ Published to In-Platform Student View!' : saveStatus === 'error' ? '❌ Please fill all required fields' : editingTopicId ? '✏️ Update & Re-publish' : '📤 Publish In-Platform Lecture'}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, margin: '0 0 16px' }}>
                <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                  📖 Published Content ({customTopics.length} items)
                </h3>
                {customTopics.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={async () => {
                        // 1. Broadcast all topics to cloud API
                        try {
                          await Promise.all(customTopics.map(t => fetch('/api/teacher-topics', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(t),
                          })));
                        } catch {}

                        // 2. Generate share link
                        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sih-nexus-learn-app.vercel.app';
                        const safePayload = encodeURIComponent(JSON.stringify(customTopics));
                        const shareUrl = `${origin}/dashboard?sync_topics=${safePayload}`;
                        navigator.clipboard.writeText(shareUrl);
                        alert('✅ Syllabus Broadcasted & Share Link Copied to Clipboard!\n\nSend this link to your friends/students so they immediately see all topics on their laptops:\n' + shareUrl);
                      }}
                      style={{ padding: '7px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #0066ff, #00d4ff)', border: 'none', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit' }}
                    >
                      🔗 Copy Student Share Link ({customTopics.length} Topics)
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await Promise.all(customTopics.map(t => fetch('/api/teacher-topics', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(t),
                          })));
                          alert('✅ All ' + customTopics.length + ' topics pushed to the central cloud API! Students can refresh or sync now.');
                        } catch {
                          alert('❌ Cloud broadcast failed. Please try again.');
                        }
                      }}
                      style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit' }}
                    >
                      🔄 Re-Broadcast to Cloud
                    </button>
                  </div>
                )}
              </div>

              {customTopics.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>No custom content published yet.</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Use ＋ Upload / Add New Content above to publish your first in-platform video topic!</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {customTopics.map(t => (
                    <div key={t.id} style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(16,185,129,0.15)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 18 }}>{t.videoSource === 'local' ? '📁' : t.videoSource === 'direct' ? '🔗' : '🎬'}</span>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{t.title}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                              {t.subject} · {t.durationMinutes} min · {t.videoSource === 'local' ? '⚡ Direct In-Platform File' : t.videoSource === 'direct' ? '🔗 Direct Stream' : '📺 Video'} · {t.labRoute ? '🔬 Lab Linked' : '📺 Video Only'} · {t.customQuiz?.length || 0} quiz questions
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
                          <Link
                            href={`/videolab?topic=${t.id}`}
                            style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                          >▶ Play In-Platform</Link>
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
