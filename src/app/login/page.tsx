'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerNewUser, getStoredSession, type UserRole } from '@/lib/authStore';

type AuthMode = 'login' | 'register';

const ROLE_OPTIONS: { value: UserRole; label: string; icon: string; desc: string }[] = [
  { value: 'school', label: 'School Student', icon: '🏫', desc: 'Class 6–12 CBSE/State Board' },
  { value: 'college', label: 'College Student', icon: '🎓', desc: 'B.Tech, B.Sc, B.Com, BCA & more' },
  { value: 'aspirant', label: 'Competitive Exam', icon: '🏆', desc: 'JEE, NEET, UPSC, GATE' },
  { value: 'skill', label: 'Skill Learner', icon: '💡', desc: 'Coding, Communication, AI/ML' },
  { value: 'teacher', label: 'Teacher / Educator', icon: '👩‍🏫', desc: 'Monitor & guide your students' },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('school');
  const [regInstitution, setRegInstitution] = useState('');
  const [regGrade, setRegGrade] = useState('');

  useEffect(() => {
    // If already logged in, redirect
    const session = getStoredSession();
    if (session) {
      router.replace(session.role === 'teacher' ? '/teacher' : '/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginUser(loginEmail, loginPassword);
      if (user) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          router.push(user.role === 'teacher' ? '/teacher' : '/dashboard');
        }, 800);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regUsername.trim()) { setError('Username is required.'); return; }
    if (!regEmail.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (regPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (regPassword !== regConfirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const result = await registerNewUser(regUsername, regEmail, regPassword, regRole, regInstitution, regGrade);
      if (result.success && result.user) {
        setSuccess('Account created! Welcome to NEXUS LEARN! 🚀');
        setTimeout(() => {
          router.push(result.user!.role === 'teacher' ? '/teacher' : '/dashboard');
        }, 1000);
      } else {
        setError(result.error || 'Registration failed.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoLogin = (email: string, pwd: string) => {
    setLoginEmail(email);
    setLoginPassword(pwd);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--nexus-void, #020408)',
      fontFamily: 'Outfit, sans-serif', color: 'white',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at 30% 40%, rgba(0,102,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(168,85,247,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', top: '-40%', left: '-20%', width: '80vw', height: '80vh',
        background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
        borderRadius: '50%', animation: 'spin 30s linear infinite', zIndex: 0, pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460, padding: '0 16px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="Nexus Learn Logo"
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              objectFit: 'cover',
              margin: '0 auto 12px',
              boxShadow: '0 0 30px rgba(0,102,255,0.4)',
              display: 'block',
            }}
          />
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 28,
            background: 'linear-gradient(135deg, #00d4ff, #0066ff, #a855f7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', margin: 0,
          }}>NEXUS LEARN</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>
            AI-Powered Smart Education Platform
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex', borderRadius: 14, background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)', padding: 4, marginBottom: 24,
        }}>
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                background: mode === m ? 'linear-gradient(135deg, #0066ff, #00d4ff)' : 'transparent',
                color: mode === m ? 'white' : 'rgba(255,255,255,0.5)',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit',
                transition: 'all 0.2s ease',
              }}
            >
              {m === 'login' ? '🔐 Sign In' : '✨ Create Account'}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{
          borderRadius: 24, background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)', padding: 28,
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        }}>
          {/* Error / Success alerts */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: 13, fontWeight: 600,
            }}>⚠️ {error}</div>
          )}
          {success && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#10b981', fontSize: 13, fontWeight: 600,
            }}>✅ {success}</div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#00d4ff', margin: '0 0 4px' }}>
                Welcome back! 👋
              </h2>

              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', fontSize: 14, outline: 'none', fontFamily: 'Outfit',
                    boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%', padding: '12px 44px 12px 14px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', fontSize: 14, outline: 'none', fontFamily: 'Outfit',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16 }}
                  >{showPassword ? '🙈' : '👁️'}</button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '13px 0', borderRadius: 12, border: 'none',
                  background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #0066ff, #00d4ff)',
                  color: 'white', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer',
                  fontFamily: 'Outfit', letterSpacing: 0.5, marginTop: 4,
                  transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '⏳ Signing in...' : '🚀 Sign In to NEXUS LEARN'}
              </button>

              {/* Demo credentials */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14, marginTop: 4 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textAlign: 'center' }}>
                  QUICK DEMO ACCESS
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: '🏫 School Student (Ravi)', email: 'ravi.k@school.edu', pwd: 'demo123' },
                    { label: '🎓 College Student (Priya)', email: 'priya.s@engg.edu', pwd: 'demo123' },
                    { label: '🏆 JEE Aspirant (Arjun)', email: 'arjun.p@aspirant.com', pwd: 'demo123' },
                    { label: '👩‍🏫 Teacher (Dr. Meena)', email: 'teacher@nexuslearn.edu', pwd: 'teacher2026' },
                  ].map(d => (
                    <button
                      key={d.email}
                      type="button"
                      onClick={() => fillDemoLogin(d.email, d.pwd)}
                      style={{
                        padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)',
                        background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.65)',
                        fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit', textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.07)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    >
                      {d.label} → <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>{d.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#a855f7', margin: '0 0 4px' }}>
                Join NEXUS LEARN! 🚀
              </h2>

              <InputField label="FULL NAME / USERNAME" value={regUsername} onChange={setRegUsername} placeholder="e.g. Ravi Kumar" />
              <InputField label="EMAIL ADDRESS" value={regEmail} onChange={setRegEmail} placeholder="your@email.com" type="email" />

              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>I AM A...</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                  {ROLE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRegRole(opt.value)}
                      style={{
                        padding: '9px 10px', borderRadius: 10, border: `1px solid ${regRole === opt.value ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.07)'}`,
                        background: regRole === opt.value ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.03)',
                        color: regRole === opt.value ? '#a855f7' : 'rgba(255,255,255,0.6)',
                        fontSize: 11, cursor: 'pointer', fontFamily: 'Outfit',
                        textAlign: 'left', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 14, marginBottom: 2 }}>{opt.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 11 }}>{opt.label}</div>
                      <div style={{ fontSize: 9, opacity: 0.7, marginTop: 1 }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <InputField label="INSTITUTION (Optional)" value={regInstitution} onChange={setRegInstitution} placeholder="School / College / Coaching Center" />
              <InputField label="GRADE / YEAR (Optional)" value={regGrade} onChange={setRegGrade} placeholder="e.g. Class 11 / B.Tech Year 2" />

              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    style={{
                      width: '100%', padding: '12px 44px 12px 14px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', fontSize: 14, outline: 'none', fontFamily: 'Outfit', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Password strength indicator */}
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[0, 1, 2, 3].map(i => {
                    const strength = regPassword.length >= 6 ? (regPassword.length >= 10 ? (regPassword.match(/[^a-zA-Z0-9]/) ? 4 : 3) : 2) : (regPassword.length > 0 ? 1 : 0);
                    return <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i < strength ? (strength < 2 ? '#ef4444' : strength < 3 ? '#f59e0b' : '#10b981') : 'rgba(255,255,255,0.1)', transition: 'background 0.2s' }} />;
                  })}
                </div>
              </div>

              <InputField label="CONFIRM PASSWORD" value={regConfirmPassword} onChange={setRegConfirmPassword} placeholder="Re-enter password" type="password" />

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '13px 0', borderRadius: 12, border: 'none',
                  background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
                  color: 'white', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer',
                  fontFamily: 'Outfit', letterSpacing: 0.5, marginTop: 6,
                  transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '⏳ Creating account...' : '✨ Create My Account'}
              </button>

              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                🔒 Your data is stored securely. Teachers can view your academic progress; your password is never visible to anyone.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'white', fontSize: 14, outline: 'none', fontFamily: 'Outfit',
          boxSizing: 'border-box', transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(168,85,247,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
    </div>
  );
}
