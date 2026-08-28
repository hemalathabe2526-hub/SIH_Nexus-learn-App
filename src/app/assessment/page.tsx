'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStoredSession, updateUserProgress, type UserProfile } from '@/lib/authStore';
import { ROLE_SYLLABUS, TOPIC_QUIZZES, type QuizQuestion } from '@/lib/syllabusData';

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function AssessmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const startAssessment = (session: UserProfile) => {
    const topics = session.role === 'teacher' ? Object.values(ROLE_SYLLABUS).flat() : ROLE_SYLLABUS[session.role] || [];
    const pool = topics.flatMap(topic => TOPIC_QUIZZES[topic.id] || []);
    setQuestions(shuffle(pool).slice(0, Math.min(20, pool.length)));
    setAnswers({});
    setSubmitted(false);
  };

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    setUser(session);
    startAssessment(session);
  }, [router]);

  const submitAssessment = () => {
    if (!user || questions.length === 0) return;
    const score = questions.reduce((total, question, index) => total + (answers[index] === question.correct ? 1 : 0), 0);
    updateUserProgress(user.id, {
      testScores: [...user.testScores, {
        topic: `${user.role.toUpperCase()} Mock Assessment`,
        score,
        total: questions.length,
        date: new Date().toISOString().split('T')[0],
      }],
    });
    setSubmitted(true);
  };

  if (!user || questions.length === 0) return null;
  const score = questions.reduce((total, question, index) => total + (answers[index] === question.correct ? 1 : 0), 0);

  return (
    <main style={{ minHeight: '100vh', padding: 24, background: 'var(--nexus-void, #020408)', color: 'white', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Link href="/dashboard" style={{ color: '#00d4ff', textDecoration: 'none' }}>Back to dashboard</Link>
        <h1 style={{ fontFamily: 'Space Grotesk', color: '#f59e0b', marginBottom: 6 }}>Role Mock Assessment</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 0 }}>A fresh mixed assessment for the {user.role} syllabus.</p>

        {questions.map((question, index) => (
          <section key={`${question.id}-${index}`} style={{ marginTop: 16, padding: 18, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: '#00d4ff', fontSize: 12, fontWeight: 700 }}>Question {index + 1} · {question.type.toUpperCase()}</div>
            <h2 style={{ fontSize: 16, lineHeight: 1.5, fontWeight: 600 }}>{question.question}</h2>
            <div style={{ display: 'grid', gap: 8 }}>
              {question.options.map((option, optionIndex) => (
                <label key={option} style={{ padding: 10, borderRadius: 8, background: answers[index] === optionIndex ? 'rgba(0,212,255,0.15)' : 'rgba(0,0,0,0.2)', border: `1px solid ${answers[index] === optionIndex ? '#00d4ff' : 'rgba(255,255,255,0.08)'}`, cursor: submitted ? 'default' : 'pointer' }}>
                  <input type="radio" name={`question-${index}`} checked={answers[index] === optionIndex} disabled={submitted} onChange={() => setAnswers(prev => ({ ...prev, [index]: optionIndex }))} />{' '}
                  {option}
                  {submitted && optionIndex === question.correct ? '  [correct]' : ''}
                </label>
              ))}
            </div>
            {submitted && <p style={{ color: answers[index] === question.correct ? '#10b981' : '#ef4444', fontSize: 12 }}>{question.explanation}</p>}
          </section>
        ))}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 24 }}>
          {!submitted ? (
            <button onClick={submitAssessment} disabled={Object.keys(answers).length !== questions.length} style={{ padding: '11px 18px', border: 0, borderRadius: 8, background: '#10b981', color: 'white', fontWeight: 700, cursor: Object.keys(answers).length === questions.length ? 'pointer' : 'not-allowed' }}>
              Submit assessment
            </button>
          ) : (
            <>
              <strong style={{ color: '#10b981' }}>Score: {score}/{questions.length}</strong>
              <button onClick={() => startAssessment(user)} style={{ padding: '11px 18px', border: 0, borderRadius: 8, background: '#0066ff', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Start a new paper</button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
